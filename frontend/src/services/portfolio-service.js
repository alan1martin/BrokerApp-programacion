// src/services/portfolio-service.js
import api from "./api"; // Importamos tu instancia centralizada de Axios

/**
 * 1. OBTENER PORTFOLIO (Usado por DashboardPage)
 * /api/portfolio/
 */
export const getPortfolio = async () => {
  try {
    const response = await api.get("portfolio/");
    return response.data;
  } catch (error) {
    console.error("Error en getPortfolio service:", error.response?.data || error.message);
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

/**
 * 5. DEPOSITAR O RETIRAR FONDOS (Migrado a Axios)
 * /api/portfolio/cash/
 */
export const manageCashFunds = async (transactionType, amount) => {
  try {
    const response = await api.post("portfolio/cash/", {
      transaction_type: transactionType,
      amount: amount
    });
    return response.data;
  } catch (error) {
    console.error("Error en manageCashFunds service:", error.response?.data || error.message);
    const errorMsg = error.response?.data?.error || "Error al procesar los fondos.";
    throw new Error(errorMsg);
  }
};

/**
 * 6. OBTENER COMPOSICIÓN DE ACTIVOS (Fase 3 - ¡Agregado!) 
 * /api/portfolio/composition/
 */
export const getAssetComposition = async () => {
  try {
    const response = await api.get("portfolio/composition/");
    return response.data;
  } catch (error) {
    console.error("Error en getAssetComposition service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 7. OBTENER COTIZACIONES EN VIVO (Fase 4 - ¡Agregado!)
 * /api/portfolio/market-quotes/
 */
export const getMarketQuotes = async () => {
  try {
    const response = await api.get("portfolio/market-quotes/");
    return response.data;
  } catch (error) {
    console.error("Error en getMarketQuotes service:", error.response?.data || error.message);
    throw error;
  }
};