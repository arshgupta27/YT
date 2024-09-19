import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCommentLikes, getTweetLikes, getVideoLikes, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const likesRouter = Router();

likesRouter.get("/get-video-likes/:videoId", getVideoLikes);
likesRouter.get("/get-tweet-likes/:tweetId", getTweetLikes);
likesRouter.get("/get-comment-likes/:commentId", getCommentLikes);

// secured routes
likesRouter.post("/toggle-video-like/:videoId", verifyJWT, toggleVideoLike);
likesRouter.post("/toggle-tweet-like/:tweetId", verifyJWT, toggleTweetLike);
likesRouter.post("/toggle-comment-like/:commentId", verifyJWT, toggleCommentLike);

export { likesRouter };