import { createContext, useContext, useState, useEffect } from "react";

const MarketContext = createContext();

const INITIAL_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.50, change24h: 1.2 },
  { symbol: "TSLA", name: "Tesla Inc.", currentPrice: 180.20, change24h: -2.4 },
  { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 875.00, change24h: 5.8 },
  { symbol: "BTC", name: "Bitcoin", currentPrice: 65000.00, change24h: 0.5 },
];

export function MarketProvider({ children }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const fetchRealPrices = async () => {
    const token = localStorage.getItem("access");

    // Si el usuario no inició sesión todavía, mantenemos los precios iniciales de simulación
    if (!token) {
      setLoadingMarket(false);
      return;
    }

    try {
      // Consultamos los activos en paralelo directo a tu Django con Yahoo Finance
      const symbolsToFetch = ["AAPL", "TSLA", "NVDA", "BTC"];
      
      const pricePromises = symbolsToFetch.map(async (symbol) => {
        try {
          const response = await fetch(`http://localhost:8000/api/portfolio/history/${symbol}/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              symbol: symbol,
              currentPrice: data.currentPrice,
              name: data.companyName || symbol
            };
          }
        } catch (e) {
          console.error(`No se pudo obtener precio real de ${symbol} desde Django:`, e);
        }
        return null; // Si falla, retorna null para no romper el flujo
      });

      const updatedPricesResults = await Promise.all(pricePromises);

      // Cruzamos los datos obtenidos con el estado de React
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const updatedInfo = updatedPricesResults.find(r => r && r.symbol === asset.symbol);
          if (updatedInfo) {
            return {
              ...asset,
              name: updatedInfo.name,
              currentPrice: updatedInfo.currentPrice
            };
          }
          return asset; // Mantiene el fallback si falló ese ticker individual
        })
      );

    } catch (error) {
      console.error("Error general actualizando el mercado:", error);
    } finally {
      setLoadingMarket(false); 
    }
  };

  useEffect(() => {
    fetchRealPrices();
    // Actualiza cada 30 segundos consumiendo tu backend de forma segura
    const interval = setInterval(fetchRealPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ assets, loadingMarket, refetchMarket: fetchRealPrices }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket debe ser usado dentro de un MarketProvider");
  }
  return context;
};
