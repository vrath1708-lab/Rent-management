import axios from "axios";

// Dynamically set API URL based on current host
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // If running on localhost/127.0.0.1, use localhost
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  
  // For network access, use the same host with port 5000
  return `http://${window.location.hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getApiUrl()
});

console.log("API URL configured to:", getApiUrl());

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
