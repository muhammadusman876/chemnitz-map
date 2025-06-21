import express from "express";
import {
  getAllCategories,
  getSitesByCategory,
  importGeojson,
  getAllSitesForMap,
  checkinToNearbySite,
} from "../controllers/cultController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/import-geojson", importGeojson);
router.get("/", getSitesByCategory); // /api/culturalsites?category=museum
router.get("/categories", getAllCategories); // /api/culturalsites/categories
router.get("/map", getAllSitesForMap); // /api/culturalsites/map
router.post("/checkin", authMiddleware, checkinToNearbySite); // /api/culturalsites/checkin

export default router;
