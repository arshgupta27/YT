import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, addVideoToPlaylist, deleteVideoFromPlaylist, getPlaylistById, getUserPlaylists, modifyPlaylist, deletePlaylist, getChannelsPlaylists } from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.get("/get-channels-playlists/:playlistId", getChannelsPlaylists);
playlistRouter.get("/get-playlist/:playlistId", getPlaylistById);

// secured routes
playlistRouter.post("/create-playlist", verifyJWT, createPlaylist);
playlistRouter.patch("/add-video-to-playlist/:playlistId", verifyJWT, addVideoToPlaylist);
playlistRouter.delete("/delete-video-from-playlist/:playlistId", verifyJWT, deleteVideoFromPlaylist);
playlistRouter.get("/get-user-playlists", verifyJWT, getUserPlaylists);
playlistRouter.patch("/modify-playlist/:playlistId", verifyJWT, modifyPlaylist);
playlistRouter.delete("/delete-playlist/:playlistId", verifyJWT, deletePlaylist);

export { playlistRouter };