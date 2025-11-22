import axios from "axios";
import { toast } from "sonner";

// Determine backend URL dynamically
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://the-residence-4.onrender.com/api"
    : "http://localhost:5000/api";

// Create axios instance
export const API = axios.create({
  baseURL: BASE_URL,
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

      // Clear token & redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
