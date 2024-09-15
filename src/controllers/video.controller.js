import Video from '../models/video.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import APIResponse from '../utils/APIResponse.js';
import { APIError } from '../utils/APIError.js';
import { uploader, deleter } from '../utils/cloudinary.js';
import User from '../models/user.model.js';

const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.video || !req.files.thumbnail) {
    throw new APIError(400, "Both video and thumbnail are required");
  }
  const videoPath = req.files?.video[0].path;
  const thumbnailPath = req.files?.thumbnail[0].path;
  const { title, description, isPublished } = req.body;
  if (!title || !description || !isPublished) {
    throw new APIError(400, "All feilds are required");
  }
  const video = await uploader(videoPath);
  const thumbnailUrl = await uploader(thumbnailPath);
  const newVideo = await Video.create({
    title,
    description,
    isPublished,
    videoFile: video.secure_url,
    thumbnail: thumbnailUrl.secure_url,
    duration: video.duration,
    owner: req.user._id
  });
  return res.status(200).json(new APIResponse(200, newVideo, "Video uploaded successfully."));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId = "" } = req.body;
  const pipeline = [
    {
      $match: {
        $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" }
      }
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1
      }
    }
  ];

  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    }
  };

  const finalVideos = await Video.aggregatePaginate(pipeline, options);
  if (!finalVideos || finalVideos.totalVideos === 0) {
    throw new APIError(404, "No videos found");
  }
  return res.status(200).json(new APIResponse(200, finalVideos, "Videos fetched successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new APIError(400, "Invalid video id");
  }
  const video = await Video.findById(id);
  if (!video) {
    throw new APIError(404, "No video found");
  };
  return res.status(200).json(new APIResponse(200, video, "Video fetched successfully."));
});

function getPublicIdFromUrl(url) {
  // Regex to remove the Cloudinary URL up to /upload/, then strip the extension
  const regex = /\/upload\/(?:[^\/]+\/)?([^\.]+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  } else {
    return null;
  }
}

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new APIError(400, "No video ID provided");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new APIError(400, "Invalid video ID");
  }

  if (video.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this video");
  }
  const { title, description } = req.body;
  let oldThumbnail, thumbnailUrl;
  if (req.file && req.file.path) {
    oldThumbnail = video.thumbnail;
    thumbnailUrl = await uploader(req.file.path);
    video.thumbnail = thumbnailUrl.secure_url;
  }
  await deleter(getPublicIdFromUrl(oldThumbnail), "image");
  video.title = title ? title : video.title;
  video.description = description ? description : video.description;
  const newVideo = await video.save();
  if (!newVideo) {
    throw new APIError(500, "Something went wrong");
  }
  else return res.status(200).json(new APIResponse(200, newVideo, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new APIError(404, "No Video Id received");
  const video = await Video.findById(videoId);
  if (video.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this video");
  }
  await deleter(getPublicIdFromUrl(video.videoFile), "video");
  await deleter(getPublicIdFromUrl(video.thumbnail), "image");
  const response = await Video.deleteOne({_id: videoId});
  return res.status(200).json(new APIResponse(200, response, "Video deleted successfully"));
});

const toggleIsPublished = asyncHandler(async (req, res) => {
  const {videoId} = req.params;
  if(!videoId) throw new APIError(400, "No Video Id reveived");
  const video = await Video.findById(videoId);
  if(!video) throw new APIError(404, "Invalid video ID");
  if (video.owner.toHexString() != req.user._id.toHexString()) {
    throw new APIError(401, "User not authorized to modify this video");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res.status(200).json(new APIResponse(200, {}, "Toggled video published status successfully"));
})

export { uploadVideo, getAllVideos, getVideoById, updateVideoDetails, deleteVideo, toggleIsPublished };