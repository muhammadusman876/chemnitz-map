import express from "express";
import {
  getAllCategories,
  getSitesByCategory,
  importGeojson,
  getAllSitesForMap,
  checkinToNearbySite,
  deleteAllSites,
  getSitesCount,
} from "../controllers/cultController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSitesByCategory); // /api/culturalsites?category=museum
router.get("/categories", getAllCategories); // /api/culturalsites/categories
router.get("/map", getAllSitesForMap); // /api/culturalsites/map
router.post("/checkin", authMiddleware, checkinToNearbySite); // /api/culturalsites/checkin

//Culture site data management routes
// These routes are protected and require admin access
router.delete(
  "/sites",
  authMiddleware,
  (req, res, next) => {
    "req.user:", req.user;
    "req.user.role:", req.user?.role;
    "typeof req.user.role:", typeof req.user?.role;
    'req.user.role === "admin":', req.user?.role === "admin";

    // Check if user is admin
    if (!req.user) {
      return res.status(401).json({ error: "No user found in request" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required",
        yourRole: req.user.role,
        debug: "User role does not match admin",
      });
    }
    next();
  },
  deleteAllSites
);

router.get(
  "/count",
  authMiddleware,
  (req, res, next) => {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  },
  getSitesCount
);

// Also add the import route if it's not already there
router.post(
  "/import-geojson",
  authMiddleware,
  (req, res, next) => {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  },
  importGeojson
);

export default router;
