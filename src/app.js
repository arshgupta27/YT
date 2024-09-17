import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({
  limit: "16kb"
}));
app.use(express.urlencoded({
  extended: true,
  limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import { userRouter } from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

import { videoRouter } from "./routes/video.routes.js";
app.use("/api/v1/videos", videoRouter);

import { tweetRouter } from "./routes/tweet.routes.js";
app.use("/api/v1/tweets", tweetRouter);

import { likesRouter } from "./routes/like.routes.js";
app.use("/api/v1/likes", likesRouter);

import { commentRouter } from "./routes/comments.route.js";
app.use("/api/v1/comments", commentRouter);

export { app };