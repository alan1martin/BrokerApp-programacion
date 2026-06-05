// src/services/portfolio-service.js
import api from "./api"; // Importamos tu instancia centralizada de Axios

/**
 * 1. OBTENER PORTFOLIO (Usado por DashboardPage)
 * /api/portfolio/
 */
export const getPortfolio = async () => {
  try {
    // Axios ya incluye el Authorization Bearer gracias al interceptor de api.js
    const response = await api.get("portfolio/");
    return response.data;
  } catch (error) {
    console.error("Error en getPortfolio service:", error.response?.data || error.message);
    // Lanzamos el error para que el "catch" de DashboardPage active la simulación si da 401
    throw error;
  }
};

/**
 * 2. EJECUTAR OPERACIÓN / COMPRA-VENTA (Usado por TradingPage)
 * /api/portfolio/trade/
 */
export const executeTrade = async (tradeData) => {
  try {
    const response = await api.post("portfolio/trade/", tradeData);
    return response.data;
  } catch (error) {
    console.error("Error en executeTrade service:", error.response?.data || error.message);
    const errorMsg = error.response?.data?.error || "Error al procesar la transacción.";
    throw new Error(errorMsg);
  }
};

/**
 * 3. REINICIAR CUENTA (Usado por SettingsPage)
 * /api/portfolio/reset/
 */
export const resetAccount = async () => {
  try {
    const response = await api.post("portfolio/reset/");
    return response.data;
  } catch (error) {
    console.error("Error en resetAccount service:", error.response?.data || error.message);
    throw new Error("No se pudo resetear la cuenta.");
  }
};

/**
 * 4. OBTENER HISTORIAL DE TRANSACCIONES (Usado por HistoryPage)
 * /api/portfolio/transactions/
 */
export const getTransactionHistory = async () => {
  try {
    const response = await api.get("portfolio/transactions/");
    return response.data;
  } catch (error) {
    console.error("Error en getTransactionHistory service:", error.response?.data || error.message);
    throw error;
  }
};