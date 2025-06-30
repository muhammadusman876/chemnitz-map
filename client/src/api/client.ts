import axios from "axios";
import toast from "react-hot-toast";

// Create centralized axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 401:
        toast.error("Session expired. Please login again.");
        // Clear user data and redirect to login
        localStorage.removeItem("user");
        window.location.href = "/login";
        break;

      case 403:
        toast.error("Access denied. Insufficient permissions.");
        break;

      case 404:
        toast.error("Resource not found.");
        break;

      case 500:
        toast.error("Server error. Please try again later.");
        break;

      case 422:
        // Validation errors - don't show toast, let component handle
        break;

      default:
        if (status >= 400 && status < 500) {
          toast.error(data?.message || "Client error occurred.");
        } else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        }
    }

    return Promise.reject(error);
  }
);

// Request interceptor (optional - for adding auth headers if needed)
apiClient.interceptors.request.use(
  (config) => {
    // Add any global request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
