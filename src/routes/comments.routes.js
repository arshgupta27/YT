import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, getVideoComments, modifyComment } from "../controllers/comment.controller.js";
const commentRouter = Router();

commentRouter.get("/get-comments/:videoId", getVideoComments);

// secured routes
commentRouter.post("/create-comment/:videoId", verifyJWT, createComment);
commentRouter.delete("/delete-comment/:commentId", verifyJWT, deleteComment);
commentRouter.patch("/modify-comment/:commentId", verifyJWT, modifyComment);

export { commentRouter };