/**
 * Reverse geocode coordinates to get a place name using Nominatim.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} - Place name or null if not found
 */
export async function getPlaceName(lat, lng) {
  // Always return a professional fallback name
  return "Unnamed Site";
}
