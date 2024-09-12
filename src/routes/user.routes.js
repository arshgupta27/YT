import Router from "express";
import { loginUser, logOutUser, registerUser, refreshAccessToken, changeUserPassword, getCurrentUser, updateAccountDetails, updateImages } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.post("/register", upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), registerUser);

userRouter.post("/login", loginUser);

//secure routes
userRouter.post("/logout", verifyJWT ,logOutUser);
userRouter.post("/refresh-token", refreshAccessToken);
userRouter.post("/change-password", verifyJWT, changeUserPassword);
userRouter.get("/get-user", verifyJWT, getCurrentUser);
userRouter.post("/update-account-details", verifyJWT, updateAccountDetails);
userRouter.post("/update-images", verifyJWT, upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), updateImages);

export { userRouter };