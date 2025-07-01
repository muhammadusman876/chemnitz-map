import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  checkInToSite,
  getUserProgress,
  getProgressMapData,
  getLeaderboard,
} from "../controllers/userVisitController.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/checkin", authMiddleware, checkInToSite);
router.get("/current-progress", authMiddleware, getUserProgress);
router.get("/map-data", authMiddleware, getProgressMapData);
router.get("/leaderboard", getLeaderboard); // Public leaderboard

export default router;
