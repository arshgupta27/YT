import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import { APIError } from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const { title, description } = req.body;
  if (!title || !description) throw new APIError(400, "Title and description is required");
  let playlist = await Playlist.find({ owner: id, title });
  if (!playlist) {
    playlist = Playlist.create({ title, description, owner: id });
    return res.status(200).json(new APIResponse(200, playlist, "New playlist created successfully"));
  }
  throw new APIError(400, "Playlist with same title exists");
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const id = req.user._id, { playlistId } = req.params, { videoId } = req.body;
  if (!mongoose.isValidObjectId(playlistId)) throw new APIError(404, "Invalid playlist Id");
  if (!mongoose.isValidObjectId(videoId)) throw new APIError(404, "Invalid video Id");
  const playlist = await Playlist.findById(playlistId).select("-videos -description");
  if (!playlist) throw new APIError(404, "Invalid playlist Id");
  if (playlist.owner.toHexString() != id.toHexString()) throw new APIError(401, "User not authorized to modify this playlist");
  const video = await Video.findById(videoId);
  if (!video) throw new APIError(404, "Invalid Video Id");
  const add = await Playlist.updateOne(
    { _id: playlistId },
    { $push: { videos: video._id } }
  );
  return res.status(204).json(new APIResponse(204, {}, "Video Added to playlist successfully"));
});

const deleteVideoFromPlaylist = asyncHandler(async (req, res) => {
  const id = req.user._id, { playlistId } = req.params, { videoId } = req.body;
  if (!mongoose.isValidObjectId(playlistId)) throw new APIError(404, "Invalid playlist Id");
  if (!mongoose.isValidObjectId(videoId)) throw new APIError(404, "Invalid video Id");
  const playlist = await Playlist.findById(playlistId).select("-videos -description");
  if (!playlist) throw new APIError(404, "Invalid playlist Id");
  if (playlist.owner.toHexString() != id.toHexString()) throw new APIError(401, "User not authorized to modify this playlist");
  const video = await Video.findById(videoId);
  if (!video) throw new APIError(404, "Invalid Video Id");
  const remove = await Playlist.updateOne(
    { _id: playlistId },
    { $pull: { videos: video._id } }
  );
  return res.status(204).json(new APIResponse(204, {}, "Video removed from playlist successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!mongoose.isValidObjectId(playlistId)) throw new APIError(404, "Invalid playlist Id");
  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) throw new APIError(404, "Playlist with given id not found");
  return res.status(200).json(new APIResponse(200, playlist, "Playlist fetched successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const playlists = await Playlist.find({ owner: id }).select("_id title description");
  return res.status(200).json(new APIResponse(200, playlists, "User playlists fetched successfully"));
});

const modifyPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!mongoose.isValidObjectId(playlistId)) throw new APIError(404, "Invalid playlist Id");
  const { title, description } = req.body;
  const playlist = Playlist.findByIdAndUpdate(playlistId, { title, description }, { new: true, select: "_id title description" });
  if (!playlist) throw new APIError(404, "Playlist with given id not found");
  return res.status(200).json(new APIResponse(200, playlist, "Playlist updated successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!mongoose.isValidObjectId(playlistId)) throw new APIError(404, "Invalid playlist Id");
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if(!playlist) throw new APIError(404, "Invalid playlist Id");
  return res.status(204).json(new APIResponse(204, {}, "Playlist deleted successfully"));
});

const getChannelsPlaylists = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!mongoose.isValidObjectId(channelId)) throw new APIError(404, "Invalid channel Id");
  const channel = await User.findById(channel);
  if (!channel) throw new APIError(404, "Channel with given id not found");
  const playlists = await Playlist.find({ owner: channelId }).select("_id title description");
  return res.status(200).json(new APIResponse(200, playlists, "Channel playlists fetched successfully"));
});

export { createPlaylist, addVideoToPlaylist, deleteVideoFromPlaylist, getPlaylistById, getUserPlaylists, modifyPlaylist, deletePlaylist, getChannelsPlaylists };