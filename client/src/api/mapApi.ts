import axios from "axios";

export const mapApi = axios.create({
  baseURL: "http://localhost:5000/api/culturalsites",
  withCredentials: true,
});

// Example: Check-in to nearby site
export const checkinToNearbySite = (location: { lat: number; lng: number }) => {
  return mapApi.post("/checkin", location);
};

// Example: Get all sites for map
export const getAllSitesForMap = () => {
  return mapApi.get("/map");
};

// Add more map-related API functions as needed