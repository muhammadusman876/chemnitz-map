// filepath: d:\mern-auth-app\server\controllers\districtController.js
import { importDistrictsAndUpdateSites } from "../utils/importDistricts.js";
import CulturalSite from "../models/CultureSite.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import districts and assign to sites
export const importDistricts = async (req, res) => {
  try {
    const result = await importDistrictsAndUpdateSites();
    console.log(result, "districts imported successfully");

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("District import error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all district names
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await CulturalSite.distinct("district");

    // Count sites per district
    const districtStats = [];
    for (const district of districts) {
      if (district) {
        // Skip null/undefined districts
        const count = await CulturalSite.countDocuments({ district });
        districtStats.push({ name: district, siteCount: count });
      }
    }

    res.json(districtStats);
  } catch (error) {
    console.error("Error getting districts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sites by district
export const getSitesByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    if (!district) {
      return res.status(400).json({ error: "District name is required" });
    }

    const sites = await CulturalSite.find({ district });
    res.json(sites);
  } catch (error) {
    console.error("Error getting sites by district:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get district GeoJSON data
export const getDistrictGeoJson = async (req, res) => {
  try {
    console.log("are we here?");
    const districtsFilePath = path.join(
      __dirname,
      "../data/Stadtteile.geojson"
    );
    console.log(districtsFilePath, "districts file path");
    const geojsonData = fs.readFileSync(districtsFilePath, "utf8");
    res.json(JSON.parse(geojsonData));
  } catch (error) {
    console.error("Error serving district GeoJSON:", error);
    res.status(500).json({ error: error.message });
  }
};
