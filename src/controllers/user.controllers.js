import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import uploader from "../utils/cloudinary.js";
import APIResponse from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validatebeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(500, "Something went wrong while generating tokens");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details
  const { fullName, username, email, password } = req.body;

  //validation
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }

  //check if user already exists
  const existingEmail = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });
  if (existingEmail) {
    throw new APIError(409, "User already exists");
  }
  if (existingUsername) {
    throw new APIError(409, "Username already taken");
  }

  //images
  console.log("File: ", req.files);
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (req.files?.coverImage) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar image is required");
  }

  //upload images to cloudinary
  const avatar = await uploader(avatarLocalPath);
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploader(coverImageLocalPath);
  }
  if (!avatar) {
    throw new APIError(400, "Avatar image is required");
  }

  //upload to database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new APIError("500", "Something went wrong while registering the user");
  }

  //send response
  console.log(userCreated);
  return res.status(201).json(new APIResponse(200, userCreated, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //find the user
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new APIError(400, "Email or Username is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new APIError(404, "User does not exists");
  }
  const compare = await user.isPasswordCorrect(password);

  if (!compare) {
    throw new APIError(401, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };


  console.log("User Login:", loggedInUser.fullName);

  res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new APIResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    );

});

const logOutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: ""
      }
    },
    {
      new: true,
    }
  );

  console.log("User Logout:", user.fullName);

  const options = {
    httpOnly: true,
    secure: true
  };

  res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new APIResponse(
        200,
        {},
        "User logged out seccessfully"
      )
    )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new APIError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new APIError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== refreshToken) {
      throw new APIError(401, "Refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true
    };
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new APIResponse(
          200,
          {
            accessToken, newRefreshToken
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new APIError(401, error.message || "Invalid refresh token");
  }
});


export { registerUser, loginUser, logOutUser, refreshAccessToken };