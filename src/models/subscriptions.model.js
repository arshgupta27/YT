import mongoose, { Mongoose } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, {timestamps: true});

export default mongoose.model("Subsciption", subscriptionSchema);