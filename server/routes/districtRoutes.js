import express from "express";
import {
  importDistricts,
  getAllDistricts,
  getSitesByDistrict,
  getDistrictGeoJson,
} from "../controllers/districtController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/list", getAllDistricts);
router.get("/geojson", getDistrictGeoJson);
router.get("/:district", getSitesByDistrict);

// Admin-only routes
router.post("/import", authMiddleware, importDistricts);

export default router;
