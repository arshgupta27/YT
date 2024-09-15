import { asyncHandler } from "../utils/asyncHandler.js";
import Tweet from "../models/tweet.model.js";
import { APIError } from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import { application } from "express";

const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  if (!tweet) throw new APIError(400, "Received empty tweet");
  const newTweet = await Tweet.create({
    content: tweet,
    owner: req.user._id
  });
  console.log(newTweet);
  return res.status(200).json(new APIResponse(200, newTweet, "Tweet was created and published successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new APIError(400, "Tweet Id not received");
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new APIError(404, "Invalid tweet Id");
  if (tweet.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this tweet");
  }
  await Tweet.findByIdAndDelete(tweetId);
  return res.status(200).json(new APIResponse(200, {}, "Tweet deleted successfully"));
});

const modifyTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params, { tweetContent } = req.body;
  if (!tweetId) throw new APIError(400, "Tweet Id not received");
  if (!tweetContent) throw new APIError(400, "New tweet not received");
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new APIError(404, "Invalid tweet Id");
  if (tweet.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this tweet");
  }
  if (tweet.content !== tweetContent) {
    tweet.content = tweetContent;
    await tweet.save();
  }
  return res.status(200).json(new APIResponse(200, tweet, "Tweet updated successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;
  const userId = req.user._id;
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  };
  const tweets = await Tweet.aggregatePaginate(
    [
      {
        $match: {
          owner: userId
        }
      },
      {
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1
        }
      }
    ],
    options
  );
  console.log(tweets);
  return res.status(200).json(new APIResponse(200, tweets, "Fetched user tweets at page " + page));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const { query = "", page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  };
  const tweets = await Tweet.aggregatePaginate(
    [
      {
        $match: {
          content: { $regex: query, $options: "i" },
        }
      },
      {
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1
        }
      }
    ],
    options
  );
  console.log(tweets);
  return res.status(200).json(new APIResponse(200, tweets, "Fetched tweets at page " + page));
});

export { createTweet, deleteTweet, modifyTweet, getUserTweets, getAllTweets };