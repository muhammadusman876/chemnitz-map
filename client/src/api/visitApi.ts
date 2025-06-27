import axios from "axios";

export const visitApi = axios.create({
  baseURL: "http://localhost:5000/api/admin",
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