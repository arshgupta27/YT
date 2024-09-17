import Router from "express";
import { loginUser, logOutUser, registerUser, refreshAccessToken, changeUserPassword, getCurrentUser, updateAccountDetails, updateImages, subOrUnsubChannel, getUserChannelProfile, getWatchHistory, getLikedVideos } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
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
userRouter.get("/get-user-channel-profile/:username", getUserChannelProfile);
userRouter.post("/refresh-token", refreshAccessToken);

//secured routes
userRouter.post("/logout", verifyJWT ,logOutUser);
userRouter.post("/change-password", verifyJWT, changeUserPassword);
userRouter.get("/get-user", verifyJWT, getCurrentUser);
userRouter.patch("/update-account-details", verifyJWT, updateAccountDetails);
userRouter.patch("/update-images", verifyJWT, upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), updateImages);
userRouter.post("/sub-or-unsub-channel", verifyJWT, subOrUnsubChannel);
userRouter.get("/history", verifyJWT, getWatchHistory);
userRouter.get("/get-liked-videos", verifyJWT, getLikedVideos);

export { userRouter };