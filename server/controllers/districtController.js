// filepath: d:\mern-auth-app\server\controllers\districtController.js
import District from "../models/District.js";
import CulturalSite from "../models/CultureSite.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import districts from GeoJSON and save to District collection
export const importDistrictsGeojson = async (req, res) => {
  try {
    const geojsonPath = path.join(__dirname, "../data/Stadtteile.geojson");
    if (!fs.existsSync(geojsonPath)) {
      return res.status(404).json({ error: "District GeoJSON file not found" });
    }
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));
    if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
      return res.status(400).json({ error: "Invalid GeoJSON format" });
    }
    let imported = 0;
    for (const feature of geojsonData.features) {
      const name = feature.properties?.STADTTNAME;
      if (!name) continue;
      // Upsert district document in District collection
      await District.updateOne(
        { name },
        { $set: { name, geometry: feature.geometry } },
        { upsert: true }
      );
      imported++;
    }
    res.status(200).json({
      message: `Imported/updated ${imported} districts from GeoJSON to District collection.`,
    });
  } catch (error) {
    console.error("Error importing districts from GeoJSON:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all districts from District collection
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find({})
      .select("name geometry siteCount")
      .lean();
    res.json(districts);
  } catch (error) {
    console.error("Error getting districts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sites by district name (case-insensitive, trimmed)
export const getSitesByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    if (!district) {
      return res.status(400).json({ error: "District name is required" });
    }
    // Use case-insensitive, trimmed match
    const regex = new RegExp(`^${district.trim()}$`, "i");
    const sites = await CulturalSite.find({ district: { $regex: regex } });
    res.json(sites);
  } catch (error) {
    console.error("Error getting sites by district:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get district GeoJSON data from District collection
export const getDistrictGeoJson = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    });
    // Fetch all districts from DB
    const districts = await District.find({
      geometry: { $exists: true },
    }).lean();
    const features = districts.map((d) => ({
      type: "Feature",
      properties: {
        STADTTNAME: d.name, // for compatibility with frontend
        name: d.name,
        siteCount: d.siteCount || 0,
      },
      geometry: d.geometry,
    }));
    const geojson = {
      type: "FeatureCollection",
      features,
    };
    res.json(geojson);
  } catch (error) {
    console.error("Error fetching district GeoJSON from DB:", error);
    res.status(500).json({ error: "Failed to fetch district GeoJSON" });
  }
};

// Get districts list for UI (name, siteCount) from District collection
export const getDistrictsList = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "public, max-age=900",
      "Content-Type": "application/json",
    });
    const districts = await District.find({}).select("name siteCount").lean();
    res.json(districts);
  } catch (error) {
    console.error("Error fetching districts list:", error);
    res.status(500).json({ error: "Failed to fetch districts list" });
  }
};

// Assign districts to all sites based on coordinates and district polygons (admin only)
export const assignDistrictsToSites = async (req, res) => {
  try {
    const districts = await District.find({
      geometry: { $exists: true },
    }).lean();
    const sites = await CulturalSite.find({
      "coordinates.lat": { $exists: true },
      "coordinates.lng": { $exists: true },
    });
    let updated = 0;
    // Point-in-polygon helpers
    function isPointInPolygon(point, polygon) {
      if (!polygon) return false;
      if (polygon.type === "Polygon") {
        return polygon.coordinates.some((ring) => pointInRing(point, ring));
      } else if (polygon.type === "MultiPolygon") {
        return polygon.coordinates.some((poly) =>
          poly.some((ring) => pointInRing(point, ring))
        );
      }
      return false;
    }
    function pointInRing(point, ring) {
      let x = point[0],
        y = point[1];
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        let xi = ring[i][0],
          yi = ring[i][1];
        let xj = ring[j][0],
          yj = ring[j][1];
        let intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }
    for (const site of sites) {
      const point = [site.coordinates.lng, site.coordinates.lat];
      let foundDistrict = null;
      for (const district of districts) {
        if (district.geometry && isPointInPolygon(point, district.geometry)) {
          foundDistrict = district.name;
          break;
        }
      }
      if (foundDistrict && site.district !== foundDistrict) {
        await CulturalSite.updateOne(
          { _id: site._id },
          { $set: { district: foundDistrict } }
        );
        updated++;
      }
    }

    // Update site counts for all districts after assignment
    for (const district of districts) {
      const siteCount = await CulturalSite.countDocuments({
        district: district.name,
      });
      await District.updateOne(
        { name: district.name },
        { $set: { siteCount } }
      );
    }

    res.json({
      message: `Done. Updated ${updated} sites and refreshed district site counts.`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

// Refresh site counts for all districts (admin only)
export const refreshDistrictSiteCounts = async (req, res) => {
  try {
    const districts = await District.find({}).select("name").lean();
    let updated = 0;

    for (const district of districts) {
      const siteCount = await CulturalSite.countDocuments({
        district: district.name,
      });
      await District.updateOne(
        { name: district.name },
        { $set: { siteCount } }
      );
      updated++;
    }

    res.json({
      message: `Refreshed site counts for ${updated} districts.`,
      updated,
    });
  } catch (error) {
    console.error("Error refreshing district site counts:", error);
    res.status(500).json({ error: error.message });
  }
};
