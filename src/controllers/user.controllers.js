import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import uploader from "../utils/cloudinary.js";
import APIResponse from "../utils/APIResponse.js";

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
export { registerUser };