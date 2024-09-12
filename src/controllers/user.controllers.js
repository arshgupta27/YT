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
  console.log(password);
  
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
const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;
  const user = await User.findById(userId);
  console.log("user 1:", user);
  
  if (!user) {
    throw new APIError(500, "Something went wrong");
  }
  const compare = await user.isPasswordCorrect(oldPassword);
  if (compare) {
    user.password = newPassword;
    await user.save({validatebeforeSave: false});
    const newUser = await User.findById(userId);
    const c = await newUser.isPasswordCorrect(newPassword);
    if(c){
      res.status(200)
      .json(
        new APIResponse(200, {}, "Password updated successfully")
      );
    } else {
      throw new APIError(500, "Password was not updated successfully");
    }
  } else {
    throw new APIError(400, "Invalid Old Password");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200)
  .json(
    new APIResponse(200, req.user, "Current user fetched successfully")
  );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullName, email} = req.body;
  if(!fullName && !email){
    throw new APIError(400, "No input received");
  }
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: { email, fullName }
    },
    {new: true}
  );
  if((!fullName || user.fullName === fullName) && (!email || user.email === email)){
    res.status(200).
    json(new APIResponse(200, user, "Account details updated successfully"));
  }
  else throw new APIError(500, "Something went wrong");
});

const updateImages = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  let coverImageLocalPath;
  if(req.files?.avatar){
    avatarLocalPath = req.files?.avatar[0].path;
  }
  if(req.files?.coverImage){
    coverImageLocalPath = req.files?.coverImage[0].path;
  }
  // console.log(coverImageLocalPath, avatarLocalPath);
  
  if(!avatarLocalPath && !coverImageLocalPath){
    throw new APIError(400, "No files found");
  }
  let avatar, coverImage;
  let updation = {};  
  if(avatarLocalPath){
    avatar = await uploader(avatarLocalPath);
    updation.avatar = avatar.url;
  }
  if(coverImageLocalPath){
    coverImage = await uploader(coverImageLocalPath);
    updation.coverImage = coverImage.url;
  }
  
  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: updation
    },
    {new: true}
  ).select("-password");
  if((!avatar || user.avatar === avatar.url) && (!coverImage || user.coverImage === coverImage.url)){
    res.status(200).json(new APIResponse(200, {user}, "Images updated successfully"));
  } else {
    throw new APIError(500, "Something went wrong");
  }
})

export { registerUser, loginUser, logOutUser, refreshAccessToken, changeUserPassword, getCurrentUser, updateAccountDetails, updateImages };