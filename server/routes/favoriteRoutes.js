import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../controllers/favoriteController.js";

const router = express.Router();

// Route to add a site to favorites (POST method)
router.post("/add", authMiddleware, addToFavorites);

// Route to remove a site from favorites (DELETE method)
router.delete("/remove/:siteId", authMiddleware, removeFromFavorites);

// Route to get all favorites (GET method)
router.get("/", authMiddleware, getFavorites);

export default router;
