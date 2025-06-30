import { apiClient } from "./client";

export const visitApi = apiClient;

// Example: Check-in to nearby site
export const checkinToNearbySite = (location: { lat: number; lng: number }) => {
  return visitApi.post("/progress/checkin", location);
};

// Get user progress
export const getUserProgress = () => {
  return visitApi.get("/progress/current-progress");
};

// Add more map-related API functions as needed
