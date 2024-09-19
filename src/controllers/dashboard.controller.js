import { APIError } from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import Like from "../models/like.model.js";
import Subscription from "../models/subscriptions.model.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!mongoose.isValidObjectId(channelId)) throw new APIError(400, "Invalid channel id");
  const channel = await User.findById(channelId);
  if (!channel) throw new APIError(404, "Channel with given id not found");

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalLikes = await Like.countDocuments({ video: { $in: (await Video.find({ owner: channelId }).select('_id')).map(video => video._id) } });
  const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
  const totalViews = (await Video.find({ owner: channelId }).select('views')).reduce((acc, video) => acc + video.views, 0);

  const stats = {
    totalViews,
    totalLikes,
    totalSubscribers,
    totalVideos
  };

  return res.status(200).json(new APIResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!mongoose.isValidObjectId(channelId)) throw new APIError(400, "Invalid channel id");
  const channel = await User.findById(channelId);
  if (!channel) throw new APIError(404, "Channel with given id not found");
  const videos = await Video.find({ owner: channelId });
  return res.status(200).json(new APIResponse(200, videos, "Channel videos fetched successfully"));
});

export {
  getChannelStats,
  getChannelVideos
};