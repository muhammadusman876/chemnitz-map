import { apiClient } from "./client";

export const mapApi = apiClient;

// Example: Check-in to nearby site
export const checkinToNearbySite = (location: { lat: number; lng: number }) => {
  return mapApi.post("/culturalsites/checkin", location);
};

// Example: Get all sites for map
export const getAllSitesForMap = () => {
  return mapApi.get("/culturalsites/map");
};

// Add more map-related API functions as needed
