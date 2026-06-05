// src/services/portfolio-service.js

const isDevelopment = import.meta.env.MODE === "development";

// 🎯 DETECCIÓN DINÁMICA: Usa localhost en tu compu o la URL del campus en producción
const API_URL = isDevelopment 
  ? "http://localhost:8000/api" 
  : `${import.meta.env.VITE_API_URL}/api`;

/**
 * 1. OBTENER PORTFOLIO (Usado por DashboardPage)
 * Machea con: path('', PortfolioDetailView.as_view()) -> /api/portfolio/
 */
export const getPortfolio = async () => {
  const token = localStorage.getItem("access"); 

  if (!token) {
    console.error("No se encontró el token de acceso.");
    return { cash: 0, stocks: [], history: [] };
  }

  try {
    const response = await fetch(`${API_URL}/portfolio/`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener los datos del portfolio");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getPortfolio service:", error);
    // Retornamos la estructura limpia original para que la pantalla no quede en blanco
    return { cash: 0, stocks: [], history: [] };
  }
};

/**
 * 2. EJECUTAR OPERACIÓN / COMPRA-VENTA (Usado por TradingPage)
 * Machea con: path('trade/', ExecuteTradeView.as_view()) -> /api/portfolio/trade/
 */
export const executeTrade = async (tradeData) => {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("No estás autenticado. Falta el token de acceso.");
  }

  try {
    const response = await fetch(`${API_URL}/portfolio/trade/`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(tradeData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || "Error al procesar la transacción.";
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en executeTrade service:", error);
    throw error;
  }
};

/**
 * 3. REINICIAR CUENTA (Usado por SettingsPage)
 * Machea con: path('reset/', reset_portfolio) -> /api/portfolio/reset/
 */
export const resetAccount = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("No se encontró el token de acceso.");
  }

  try {
    const response = await fetch(`${API_URL}/portfolio/reset/`, { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo resetear la cuenta.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en resetAccount service:", error);
    throw error;
  }
};

/**
 * 4. OBTENER HISTORIAL DE TRANSACCIONES (Usado por HistoryPage)
 * Machea con: path('transactions/', TransactionListView.as_view()) -> /api/portfolio/transactions/
 */
export const getTransactionHistory = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    console.error("No se encontró el token de acceso.");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/portfolio/transactions/`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener el historial de transacciones");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getTransactionHistory service:", error);
    return [];
  }
};