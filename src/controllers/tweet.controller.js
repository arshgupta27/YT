import { asyncHandler } from "../utils/asyncHandler.js";
import Tweet from "../models/tweet.model.js";
import { APIError } from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";

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
  if(!tweetId) throw new APIError(400, "Tweet Id not received");
  const tweet = await Tweet.findById(tweetId);
  if(!tweet) throw new APIError(404, "Invalid tweet Id");
  if (tweet.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this video");
  }
  await Tweet.findByIdAndDelete(tweetId);
  return res.status(200).json(new APIResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, deleteTweet };