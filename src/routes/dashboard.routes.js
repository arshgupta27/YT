import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get("/get-all-stats/:channelId", getChannelStats);
dashboardRouter.get("/get-channel-videos/:channelId", getChannelVideos);

export { dashboardRouter };