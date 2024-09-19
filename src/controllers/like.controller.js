// import User from "../models/user.model.js";
import Tweet from "../models/tweet.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import Like from "../models/like.model.js";
import APIResponse from "../utils/APIResponse.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if(!mongoose.isValidObjectId(videoId)) throw new APIError(400, "Invalid video ID");
  const video = await Video.findById(videoId).select("_id");
  if (!video) throw new APIError(401, "Invalid video Id");
  const like = await Like.findOne({
    video: video._id,
    owner: req.user._id
  });
  let newLike = {};
  if (!like) {
    newLike = await Like.create({
      video: video._id,
      owner: req.user._id
    });
  } else {
    await Like.deleteOne({
      video: video._id,
      owner: req.user._id
    });
  }
  return res.status(200).json(new APIResponse(200, newLike, "Toggled the like on the video successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new APIError(404, "No comment Id provided");
  const comment = await Comment.findById(commentId).select("_id");
  if (!comment) throw new APIError(401, "Invalid comment Id");
  const like = await Like.findOne({
    comment: comment._id,
    owner: req.user._id
  });
  let newLike = {};
  if (!like) {
    newLike = await Like.create({
      comment: comment._id,
      owner: req.user._id
    });
  } else {
    await Like.deleteOne({
      comment: comment._id,
      owner: req.user._id
    });
  }
  return res.status(200).json(new APIResponse(200, newLike, "Toggled the like on the comment successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new APIError(404, "No tweet Id provided");
  const tweet = await Tweet.findById(tweetId).select("_id");
  if (!tweet) throw new APIError(401, "Invalid comment Id");
  const like = await Like.findOne({
    tweet: tweet._id,
    owner: req.user._id
  });
  let newLike = {};
  if (!like) {
    newLike = await Like.create({
      tweet: tweet._id,
      owner: req.user._id
    });
  } else {
    await Like.deleteOne({
      tweet: tweet._id,
      owner: req.user._id
    });
  }
  return res.status(200).json(new APIResponse(200, newLike, "Toggled the like on the tweet successfully"));
});

const getTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if(mongoose.isValidObjectId(tweetId) === false) throw new APIError(401, "Invalid tweet Id");
  const tweet = await Tweet.findById(tweetId).select("_id");
  if (!tweet) throw new APIError(401, "Invalid tweet Id");
  const likes = await Like.find({ tweet: tweetId });
  console.log(likes);
  return res.status(200).json(new APIError(200, likes.length, "Fetched number of likes successfully"));
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if(mongoose.isValidObjectId(videoId) === false) throw new APIError(401, "Invalid video Id");
  const video = await Video.findById(videoId).select("_id");
  if (!video) throw new APIError(401, "Invalid video Id");
  const likes = await Like.find({ video: videoId });
  console.log(likes);
  return res.status(200).json(new APIError(200, likes.length, "Fetched number of likes successfully"));
});

const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if(mongoose.isValidObjectId(commentId) === false) throw new APIError(401, "Invalid comment Id");
  const comment = await Comment.findById(commentId).select("_id");
  if (!comment) throw new APIError(401, "Invalid comment Id");
  const likes = await Like.find({ tweet: commentId });
  console.log(likes);
  return res.status(200).json(new APIError(200, likes.length, "Fetched number of likes successfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getTweetLikes, getCommentLikes, getVideoLikes };