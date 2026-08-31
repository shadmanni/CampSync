import axios from "axios";
import { storage } from "./storage";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Request Interceptor: inject Bearer token from secure storage if present
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem("campussync_jwt");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("[API] Failed to retrieve token from storage:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: normalize error payloads
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";

    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
