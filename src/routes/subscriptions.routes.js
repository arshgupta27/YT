import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// secured routes

subscriptionRouter.post("/toggle-subscription/:channel", verifyJWT, toggleSubscription);
subscriptionRouter.get("/get-subscribed-channels", verifyJWT, getSubscribedChannels);
subscriptionRouter.get("/get-subscribers", verifyJWT, getSubscribers);

export {subscriptionRouter};