import { asyncHandler } from '../utils/asyncHandler.js'
import Subscription from '../models/subscriptions.model.js';
import APIResponse from "../utils/APIResponse.js"
import {APIError} from "../utils/APIError.js"
import User from "../models/user.model.js"
import mongoose from 'mongoose';

const toggleSubscription = asyncHandler(async (req, res) => {
  const subscriber = req.user._id;
  const { channel } = req.user.params;
  if (!mongoose.isValidObjectId(channel)) throw new APIError(400, "Invalid channel Id");
  const ch = await User.findById(channel);
  if (!ch) throw new APIError(404, "Channel do not exists");
  let subscription = await Subscription.findOneAndDelete({ subscriber, channel });
  if (!subscription) {
    subscription = await Subscription.create({ subscriber, channel });
  }
  return res.status(204).json(new APIResponse(204, {}, "Subscription status toggled successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const channels = await Subscription.find({ subscriber: id }).populate({path: "channel", select: "-password -refreshToken -createdAt -updatedAt -__v"});
  return res.status(200).json(new APIResponse(200, channels, "Channels subscribed by the user fetched successfully"));
});

const getSubscribers = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const channels = await Subscription.find({ channel: id }).populate({path: "subscriber", select: "-password -refreshToken -createdAt -updatedAt -__v"});
  return res.status(200).json(new APIResponse(200, channels, "User subscribed to the user fetched successfully"));
})

export { toggleSubscription, getSubscribedChannels, getSubscribers };