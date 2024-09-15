import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {timestamps: true});

export default mongoose.model("Tweet", tweetSchema);