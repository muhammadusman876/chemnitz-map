import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CulturalSite from "../models/CultureSite.js";

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import district data from GeoJSON and update cultural sites with district information
 */
export const importDistrictsAndUpdateSites = async () => {
  try {
    // Read the GeoJSON file
    const districtsFilePath = path.join(
      __dirname,
      "../data/Stadtteile.geojson"
    );
    console.log(districtsFilePath)
    const geojsonData = JSON.parse(fs.readFileSync(districtsFilePath, "utf8"));

    // Extract district names
    const districts = geojsonData.features.map(
      (feature) => feature.properties.STADTTNAME
    );
    console.log(`Found ${districts.length} districts: ${districts.join(", ")}`);

    // Create a map of polygons for each district
    const districtPolygons = {};
    geojsonData.features.forEach((feature) => {
      const districtName = feature.properties.STADTTNAME;
      districtPolygons[districtName] = feature.geometry.coordinates[0];
    });

    // Get all cultural sites
    const sites = await CulturalSite.find({});
    console.log(
      `Checking ${sites.length} cultural sites for district assignment`
    );

    let updatedCount = 0;

    // Process each site
    for (const site of sites) {
      // Skip if already has a district
      if (site.district) {
        continue;
      }

      // Skip if doesn't have coordinates
      if (!site.coordinates || !site.coordinates.lat || !site.coordinates.lng) {
        continue;
      }

      // Find the district this site belongs to
      const sitePoint = [site.coordinates.lng, site.coordinates.lat]; // GeoJSON uses [lng, lat]

      for (const [districtName, polygon] of Object.entries(districtPolygons)) {
        if (isPointInPolygon(sitePoint, polygon)) {
          site.district = districtName;
          await site.save();
          updatedCount++;
          break;
        }
      }
    }

    console.log(`Updated ${updatedCount} sites with district information`);
    return {
      success: true,
      message: `Updated ${updatedCount} sites with district information`,
    };
  } catch (error) {
    console.error("Error importing districts:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a point is inside a polygon using the ray casting algorithm
 */
function isPointInPolygon(point, polygon) {
  // Ray-casting algorithm based on
  // https://en.wikipedia.org/wiki/Point_in_polygon

  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
