// frontend/src/services/api.js
import axios from "axios";

// Leemos la variable de entorno base (ej: http://localhost:8000)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  // Aseguramos de manera estricta que todas las peticiones lleven el prefijo /api
  baseURL: `${BASE_URL.replace(/\/$/, "")}/api`,
});

// Interceptor crítico: Agrega el token JWT a cada petición para evitar el 401/403/404
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;