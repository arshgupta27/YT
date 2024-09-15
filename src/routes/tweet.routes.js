import { Router } from "express";
import { createTweet, deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

// secured routes

tweetRouter.post("/create-tweet", verifyJWT, createTweet);
tweetRouter.delete("/delete-tweet/:tweetId", verifyJWT, deleteTweet);

export {tweetRouter};