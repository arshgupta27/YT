import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Playlist", playlistSchema);