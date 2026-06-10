// src/services/api.js
import axios from "axios";

// Si existe VITE_API_URL en el .env la usa, sino aplica el Fallback correspondiente
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  // En local será: "http://127.0.0.1:8000/api/"
  // En producción será: "https://api.app4.academia.ar/api/" (o sin /api/ según cómo responda tu Django)
  baseURL: `${API_BASE_URL}/api/`,
});

// TIP DE DIAGNÓSTICO: Si al sacar el /api/ te sigue dando error, 
// el cambio correcto si el subdominio apunta directo a la raíz de la app sería:
// baseURL: import.meta.env.DEV ? "http://127.0.0.1:8000/api/" : "https://api.app4.academia.ar/",

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;