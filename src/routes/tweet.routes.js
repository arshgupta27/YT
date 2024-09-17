import { Router } from "express";
import { createTweet, deleteTweet, getAllTweets, getUserTweets, modifyTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

tweetRouter.get("/get-all-tweets", getAllTweets);
tweetRouter.get("/get-user-tweets/:username", getUserTweets);

// secured routes

tweetRouter.post("/create-tweet", verifyJWT, createTweet);
tweetRouter.delete("/delete-tweet/:tweetId", verifyJWT, deleteTweet);
tweetRouter.patch("/modify-tweet/:tweetId", verifyJWT, modifyTweet);

export { tweetRouter };