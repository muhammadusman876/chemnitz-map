import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  checkInToSite,
  getUserProgress,
  getProgressMapData,
  getLeaderboard,
  resetUserProgress,
} from "../controllers/userVisitController.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/checkin", authMiddleware, checkInToSite);
router.get("/progress", authMiddleware, getUserProgress);
router.get("/map-data", authMiddleware, getProgressMapData);
router.get("/leaderboard", getLeaderboard); // Public leaderboard
router.delete("/reset/:userId", authMiddleware, resetUserProgress);

export default router;
