import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInfo = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`);
    console.log("Connected to: ", connectionInfo.connection.host);

  } catch (error) {
    console.log("MongoDB Error:", error);
    process.exit(1);
  }
};

export default connectDB;
