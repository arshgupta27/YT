import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCommentLikes, getTweetLikes, getVideoLikes, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const likesRouter = Router();

likesRouter.get("/get-likes/:videoId", getVideoLikes);
likesRouter.get("/get-likes/:tweetId", getTweetLikes);
likesRouter.get("/get-likes/:commentId", getCommentLikes);

// secured routes
likesRouter.post("/like-video/:videoId", verifyJWT, toggleVideoLike);
likesRouter.post("/like-tweet/:tweetId", verifyJWT, toggleTweetLike);
likesRouter.post("/like-comment/:commentId", verifyJWT, toggleCommentLike);

export { likesRouter };