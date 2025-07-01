import express from "express";
import {
  importDistrictsGeojson,
  getAllDistricts,
  getSitesByDistrict,
  getDistrictGeoJson,
  assignDistrictsToSites,
  refreshDistrictSiteCounts,
} from "../controllers/districtController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/list", getAllDistricts);
router.get("/geojson", getDistrictGeoJson);
router.get("/:district", getSitesByDistrict);

// Admin-only routes
router.post("/import", authMiddleware, importDistrictsGeojson);
router.post("/assign-districts", authMiddleware, assignDistrictsToSites);
router.post("/refresh-counts", authMiddleware, refreshDistrictSiteCounts);

export default router;
