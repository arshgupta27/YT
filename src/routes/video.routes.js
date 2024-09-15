import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, toggleIsPublished, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.post("/get-v  ideos", getAllVideos);
videoRouter.get("/get-video-byID/:id", getAllVideos);

//secured routes
videoRouter.post("/uploadVideo", verifyJWT, upload.fields([
  {
    name: "video",
    maxCount: 1
  },
  {
    name: "thumbnail",
    maxCount: 1
  }
]), uploadVideo);
videoRouter.patch("/update-video/:videoId", verifyJWT, upload.single("thumbnail"), updateVideoDetails);
videoRouter.delete("/delete-video/:videoId", verifyJWT, deleteVideo);
videoRouter.patch("/toggle-published/:videoId", verifyJWT, toggleIsPublished);


export { videoRouter };