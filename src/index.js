import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import {v2 as cloudinary} from "cloudinary";

dotenv.config({
  path: "./.env"
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

connectDB()
  .then(()=>{
    console.log("Database Connected Successfully");
    app.listen(process.env.PORT || 8000, ()=>{
      app.on("error", (error)=>{
        console.log("Error in intitalizing the app:", error);
        throw error;
      })
      console.log("Server is running at :", process.env.PORT || 8000);
    })
  })
  .catch((error)=>{
    console.log("Database connection failed: ", error);
  })