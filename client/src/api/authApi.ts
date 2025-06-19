import axios from "axios";

// Create an axios instance that includes credentials
export const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
  withCredentials: true, // important for sending/receiving cookies
});

export const register = (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  return api.post("/auth/register", userData);
};

export const login = (credentials: { email: string; password: string }) => {
  return api.post("/auth/login", credentials);
};

export const logout = () => {
  return api.post("/auth/logout");
};

export const getMe = () => {
  return api.get("/auth/me");
};
