// src/services/api.js
import axios from "axios";

const isDevelopment = import.meta.env.MODE === "development";

const api = axios.create({
  // Cambiamos a 'api/' relativo al directorio actual del deploy para el proxy de Nginx
  baseURL: isDevelopment 
    ? "http://127.0.0.1:8000/api/" 
    : "/api/", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;