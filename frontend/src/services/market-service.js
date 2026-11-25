// src/services/market-service.js
import api from "./api"; // Ajustá la ruta relativa si es necesario (ej: "../api" o "./api") según dónde esté tu archivo central

export const getHelloMessage = async () => {
  const response = await api.get("hola/");
  return response.data;
};

/**
 * OBTENER SÍMBOLOS FAVORITOS DESDE SQLITE
 * /api/markets/favorites/
 */
export const getFavorites = async () => {
  try {
    const response = await api.get("markets/favorites/");
    return response.data; // Se espera un array de strings: ["AAPL", "TSLA"]
  } catch (error) {
    console.error("Error en getFavorites service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * MARCAR / DESMARCAR FAVORITO EN LA BD
 * /api/markets/favorites/toggle/
 */
export const toggleFavorite = async (symbol) => {
  try {
    const response = await api.post("markets/favorites/toggle/", { symbol });
    return response.data;
  } catch (error) {
    console.error("Error en toggleFavorite service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * BUSCAR ACTIVOS EN EL MERCADO DE EE. UU. (MEMORIA / BACKEND)
 * /api/market/search/?q=...
 */
export const searchAssets = async (query = "") => {
  try {
    const response = await api.get("market/search/", {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error("Error en searchAssets service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * OBTENER DETALLE Y COTIZACIÓN EN TIEMPO REAL (CON CACHÉ EN BACKEND)
 * /api/market/asset/<ticker>/
 */
export const getAssetDetail = async (ticker) => {
  try {
    const response = await api.get(`market/asset/${ticker}/`);
    return response.data;
  } catch (error) {
    console.error("Error en getAssetDetail service:", error.response?.data || error.message);
    throw error;
  }
};