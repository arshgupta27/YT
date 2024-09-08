import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env"
})

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