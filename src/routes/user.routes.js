import Router from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();
userRouter.post("/register", upload.fields([
  {
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverImage",
    maxCount: 1
  }
]), registerUser);
userRouter.get("/register", (req, res) => {
  console.log("Hello");
  res.send("Hello");
});

export { userRouter };