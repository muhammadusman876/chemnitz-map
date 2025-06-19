import fetch from 'node-fetch';

/**
 * Reverse geocode coordinates to get a place name using Nominatim.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string|null>} - Place name or null if not found
 */
export async function getPlaceName(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0 (your@email.com)' } });
  const data = await res.json();
  return data.display_name || data.name || null;
}