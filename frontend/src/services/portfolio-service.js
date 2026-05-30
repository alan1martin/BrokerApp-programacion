
import api from "./api"; // O la instancia de Axios que estés usando

export const getPortfolio = async () => {
  const response = await api.get("/portfolio/");
  return response.data;
};

// ➔ AGREGAMOS LA FUNCIÓN PARA ENVIAR LA ORDEN AL BACKEND:
export const executeTrade = async (tradeData) => {
  // tradeData va a ser un objeto como: { symbol: 'AAPL', transaction_type: 'BUY', quantity: 2, price: 175.50 }
  const response = await api.post("/portfolio/trade/", tradeData);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/portfolio/transactions/");
  return response.data;
};
