import fs from "fs";
import path from "path";
import CulturalSite from "../models/CultureSite.js";
import geojsonToMongoDoc from "../utils/geojsonToMongoDoc.js";
import { getPlaceName } from "../utils/reverse.js";
import User from "../models/User.js";
import getDistanceFromLatLonInMeters from "../utils/distanceFromLatLon.js";


export const importGeojson = async (req, res) => {
  try {
    const filePath = path.resolve(
      "..",
      "client",
      "public",
      "data",
      "Chemnitz.geojson"
    );
    const rawData = fs.readFileSync(filePath, "utf-8");
    const geojson = JSON.parse(rawData);

    // Feature engineering: Add names using reverse geocoding if missing
    for (const feature of geojson.features) {
      if (
        !feature.properties.name &&
        feature.geometry &&
        feature.geometry.coordinates
      ) {
        const [lng, lat] = feature.geometry.coordinates;
        feature.properties.name =
          (await getPlaceName(lat, lng)) || `Unknown Place at (${lat}, ${lng})`;
      }
    }

    const docs = geojson.features
      .filter((f) => f.geometry && f.properties)
      .map(geojsonToMongoDoc);
    console.log(docs); // <-- Add this

    await CulturalSite.insertMany(docs);
    res
      .status(200)
      .json({ message: `Imported ${docs.length} cultural sites.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/culturalsites?category=museum
export const getSitesByCategory = async (req, res) => {
  try {
    const { category, q } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    const sites = await CulturalSite.find(filter);
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/culturalsites/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CulturalSite.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSitesForMap = async (req, res) => {
  try {
    // Fetch all sites from the database
    const sites = await CulturalSite.find({});
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/culturalsites/checkin
export const checkinToNearbySite = async (req, res) => {
  try {
    // You may want to use authentication middleware to get user id
    const userId = req.user?.id || req.body.userId; // fallback for testing
    console.log(userId)
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const sites = await CulturalSite.find({});
    let checkedInSite = null;

    for (const site of sites) {
      if (
        site.coordinates &&
        typeof site.coordinates.lat === "number" &&
        typeof site.coordinates.lng === "number"
      ) {
        const distance = getDistanceFromLatLonInMeters(
          lat,
          lng,
          site.coordinates.lat,
          site.coordinates.lng
        );
        if (distance <= 50) {
          checkedInSite = site;
          break;
        }
      }
    }

    if (!checkedInSite) {
      return res
        .status(404)
        .json({ message: "No nearby site found for check-in." });
    }

    // Add to visitedSites if not already present
    await User.findByIdAndUpdate(userId, {
      $addToSet: { visitedSites: checkedInSite._id },
    });

    res.json({ message: "Checked in!", site: checkedInSite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
