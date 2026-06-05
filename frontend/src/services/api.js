// src/services/api.js
import axios from "axios";

const isDevelopment = import.meta.env.MODE === "development";

const api = axios.create({
  baseURL: isDevelopment
    ? "http://127.0.0.1:8000/api/"
    : import.meta.env.VITE_API_URL + "/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;