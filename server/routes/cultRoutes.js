import express from "express";
import { getAllCategories, getSitesByCategory, importGeojson, getAllSitesForMap } from "../controllers/cultController.js";

const router = express.Router();

router.post("/import-geojson", importGeojson);
router.get('/', getSitesByCategory);         // /api/culturalsites?category=museum
router.get('/categories', getAllCategories); // /api/culturalsites/categories
router.get('/map', getAllSitesForMap);      // /api/culturalsites/map

export default router;
