// src/services/api.js
import axios from "axios";

//  Detectamos si la app corre en tu compu (development) o en la academia (production)
const isDevelopment = import.meta.env.MODE === "development";

const api = axios.create({
  // En tu casa usa localhost. En producción usa '/api' relativo para que Nginx redirija al backend
  baseURL: isDevelopment 
    ? "http://127.0.0.1:8000/api" 
    : "/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
