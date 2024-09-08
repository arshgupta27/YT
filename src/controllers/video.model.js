import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
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
  videoFile: {
    type: String, //cloudnery URL
    required: true,
  },
  thumbnail: {
    type: String, //cloudnery URL
    required: true,
    trim: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, //cloudnery URL
    required: true,
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Video", videoSchema);