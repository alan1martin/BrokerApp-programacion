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
    const isDevelopment = import.meta.env.MODE === "development";
    
    // URL base dinámica según el entorno
    const BASE_API = isDevelopment 
      ? "http://localhost:8000/api" 
      : "https://api.app4.academia.ar/api";

    if (!token || token === "token_falso_de_prueba_123") {
      setAssets(INITIAL_ASSETS);
      setLoadingMarket(false);
      return;
    }

    try {
      const symbolsToFetch = ["AAPL", "TSLA", "NVDA", "BTC"];
      
      const pricePromises = symbolsToFetch.map(async (symbol) => {
        try {
          const response = await fetch(`${BASE_API}/portfolio/history/${symbol}/`, {
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
              currentPrice: data.currentPrice || data.price,
              name: data.companyName || symbol
            };
          }
          
          if (response.status === 401) {
            console.warn(`Django rechazó la autenticación (401) para el activo: ${symbol}. Usando simulación.`);
          }
        } catch (e) {
          console.error(`No se pudo obtener precio real de ${symbol} desde Django:`, e);
        }
        return null;
      });

      const updatedPricesResults = await Promise.all(pricePromises);

      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const updatedInfo = updatedPricesResults.find(r => r && r.symbol === asset.symbol);
          if (updatedInfo && updatedInfo.currentPrice) {
            return {
              ...asset,
              name: updatedInfo.name,
              currentPrice: parseFloat(updatedInfo.currentPrice)
            };
          }
          const fallbackAsset = INITIAL_ASSETS.find(a => a.symbol === asset.symbol);
          return fallbackAsset ? { ...asset, currentPrice: fallbackAsset.currentPrice } : asset;
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