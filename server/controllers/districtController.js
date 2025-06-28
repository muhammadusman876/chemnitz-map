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
    // Set cache headers for longer caching
    res.set({
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      "Content-Type": "application/json",
    });

    // If you have a large GeoJSON file, consider:
    const geojsonPath = path.join(__dirname, "../data/Stadtteile.geojson");

    if (!fs.existsSync(geojsonPath)) {
      return res.status(404).json({ error: "District GeoJSON file not found" });
    }

    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));

    // Optional: Simplify the GeoJSON to reduce size
    if (geojsonData.features && geojsonData.features.length > 0) {
      geojsonData.features = geojsonData.features.map((feature) => ({
        type: feature.type,
        properties: {
          // Only keep essential properties
          STADTTNAME: feature.properties.STADTTNAME,
          // Add any other essential properties you need
        },
        geometry: feature.geometry,
      }));
    }
    res.json(geojsonData);
  } catch (error) {
    console.error("Error fetching district GeoJSON:", error);
    res.status(500).json({ error: "Failed to fetch district GeoJSON" });
  }
};

export const getDistrictsList = async (req, res) => {
  try {
    // Set cache headers
    res.set({
      "Cache-Control": "public, max-age=900", // Cache for 15 minutes
      "Content-Type": "application/json",
    });

    // Get from database or file - make this as fast as possible
    const districts = await CulturalSite.find({})
      .select("name siteCount")
      .lean();
      
    res.json(districts);
  } catch (error) {
    console.error("Error fetching districts list:", error);
    res.status(500).json({ error: "Failed to fetch districts list" });
  }
};
