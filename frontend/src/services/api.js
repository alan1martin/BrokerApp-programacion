// frontend/src/services/api.js
import axios from "axios";

// Leemos la variable de entorno base (ej: http://localhost:8000)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, "")}/api`,
  withCredentials: true, // Envío automático de cookies HttpOnly seguras
});

// Interceptor de solicitud: Mantiene fallback a Authorization header si existe en localStorage
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

// Interceptor de respuesta: auto-recuperación y purga segura ante expiración de sesión (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = window.location.pathname === "/login" || window.location.pathname === "/register";
      if (!isAuthRoute) {
        // Limpiamos datos caducados
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;