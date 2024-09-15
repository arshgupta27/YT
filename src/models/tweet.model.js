import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
tweetSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Tweet", tweetSchema);