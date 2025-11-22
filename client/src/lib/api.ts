import axios from "axios";
import { toast } from "sonner";

// Backend base URL
export const API = axios.create({
  baseURL: "https://the-residence-4.onrender.com/api",
});

// Inject JWT token into all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Please log in again.");

      // Clear token & refresh
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
