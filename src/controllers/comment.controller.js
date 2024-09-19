import Comment from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import APIResponse from "../utils/APIResponse.js"
import Video from "../models/video.model.js"
import mongoose from "mongoose"

const createComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params, { comment } = req.body;
  if(!mongoose.isValidObjectId(videoId)) throw new APIError(400, "Invalid video Id");
  if (!comment) throw new APIError(400, "Received empty comment");
  const video = await Video.findById(videoId);
  if (!video) throw new APIError(404, "Invalid video Id");
  const newComment = await Comment.create({
    video: videoId,
    owner: req.user._id,
    content: comment
  });
  return res.status(200).json(new APIResponse(200, newComment, "Comment was created and published successfully."));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) throw new APIError(400, "Invalid comment Id");
  if (!commentId) throw new APIError(400, "Comment Id not received");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new APIError(404, "Invalid comment Id");
  if (comment.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to delete this comment");
  }
  await Comment.findByIdAndDelete(commentId);
  return res.status(200).json(new APIResponse(200, {}, "Comment deleted successfully"));
});

const modifyComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params, { commentContent } = req.body;
  if (!mongoose.isValidObjectId(commentId)) throw new APIError(400, "Invalid comment Id");
  if (!commentContent) throw new APIError(400, "New comment not received");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new APIError(404, "Invalid comment Id");
  if (comment.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this comment");
  }
  if (comment.content !== commentContent) {
    comment.content = commentContent;
    await comment.save();
  }
  return res.status(200).json(new APIResponse(200, comment, "Comment updated successfully."));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) throw new APIError(400, "Invalid video Id");
  if (!videoId) throw new APIError(400, "Video Id not received");
  const video = await Video.findById(videoId);
  if (!video) throw new APIError(404, "Invalid video Id");
  const comments = await Comment.find({ video: videoId });
  return res.status(200).json(new APIResponse(200, comments, "Comments fetched successfully"));
});

export { createComment, deleteComment, modifyComment, getVideoComments };