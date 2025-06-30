import { apiClient } from "./client";

export const register = (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  return apiClient.post("/auth/register", userData);
};

export const login = (credentials: { email: string; password: string }) => {
  return apiClient.post("/auth/login", credentials);
};

export const logout = () => {
  return apiClient.post("/auth/logout");
};

export const getMe = () => {
  return apiClient.get("/auth/me");
};
