// frontend/src/context/market-context.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api"; 

export const MarketContext = createContext();

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket debe ser usado dentro de un MarketProvider");
  }
  return context;
};

const INITIAL_ASSETS = [
  { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 875.00, change24h: 3.40 },
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.50, change24h: 1.25 },
  { symbol: "TSLA", name: "Tesla Inc.", currentPrice: 180.20, change24h: -0.85 },
  { symbol: "MSFT", name: "Microsoft Corp.", currentPrice: 420.50, change24h: 1.15 },
  { symbol: "AMZN", name: "Amazon.com Inc.", currentPrice: 185.30, change24h: 0.95 },
  { symbol: "GOOGL", name: "Alphabet Inc.", currentPrice: 178.40, change24h: 0.80 },
  { symbol: "META", name: "Meta Platforms", currentPrice: 495.20, change24h: 2.10 },
  { symbol: "SPY", name: "S&P 500 ETF", currentPrice: 512.60, change24h: 0.45 },
  { symbol: "BTC", name: "Bitcoin", currentPrice: 65000.00, change24h: 2.15 },
  { symbol: "ETH", name: "Ethereum", currentPrice: 3450.00, change24h: -1.10 },
];

// Comprobación de horario de mercado tradicional
const isTraditionalMarketOpen = () => {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = Domingo, 6 = Sábado
  if (diaSemana === 0 || diaSemana === 6) return false;

  const hora = ahora.getHours();
  const minutos = ahora.getMinutes();
  const tiempoEnMinutos = hora * 60 + minutos;

  // Horario bursátil habitual 10:30 a 17:00 hs
  const aperturaMinutos = 10 * 60 + 30;
  const cierreMinutos = 17 * 60;

  return tiempoEnMinutos >= aperturaMinutos && tiempoEnMinutos <= cierreMinutos;
};

export function MarketProvider({ children }) {
  // Inicializamos desde localStorage si existe para retener inmediatamente el último precio conocido (last price)
  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem("last_known_market_assets");
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });
  const [loadingMarket, setLoadingMarket] = useState(false);

  const fetchRealPrices = async () => {
    const token = localStorage.getItem("access");

    // Si no hay token de autenticación válido, conservamos los activos en memoria
    if (!token) {
      setLoadingMarket(false);
      return;
    }

    try {
      const symbolsToFetch = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "GOOGL", "META", "SPY", "BTC", "ETH"];
      
      const pricePromises = symbolsToFetch.map(async (symbol) => {
        try {
          const response = await api.get(`/portfolio/history/${symbol}/`);
          if (response.status === 200 && response.data) {
            const data = response.data;
            const price = parseFloat(data.currentPrice || data.price);
            if (!isNaN(price) && price > 0) {
              return {
                symbol,
                currentPrice: price,
                name: data.companyName || symbol
              };
            }
          }
        } catch {
          // Si el servidor o la red fallan, conservamos el último precio conocido sin romper la UI
          return { symbol, skipUpdate: true };
        }
        return null;
      });

      const updatedPricesResults = await Promise.all(pricePromises);

      setAssets((prevAssets) => {
        const nextAssets = prevAssets.map((asset) => {
          const updatedInfo = updatedPricesResults.find((r) => r && r.symbol === asset.symbol);
          
          // Si vino orden de saltear (mercado cerrado o error), retener el último precio intacto
          if (!updatedInfo || updatedInfo.skipUpdate) {
            return asset;
          }

          if (updatedInfo.currentPrice) {
            return {
              ...asset,
              name: updatedInfo.name || asset.name,
              currentPrice: updatedInfo.currentPrice
            };
          }
          
          return asset;
        });

        // Guardamos en localStorage para persistencia offline / post-recarga
        try {
          localStorage.setItem("last_known_market_assets", JSON.stringify(nextAssets));
        } catch {
          // Ignore storage quota
        }

        return nextAssets;
      });

    } catch {
      // Silenciar excepción para que la aplicación mantenga el último precio de forma limpia
    } finally {
      setLoadingMarket(false); 
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadPrices = async () => {
      if (isMounted) {
        await fetchRealPrices();
      }
    };
    loadPrices();
    const interval = setInterval(fetchRealPrices, 30000); // 30 segundos
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <MarketContext.Provider value={{ assets, loadingMarket, refetchMarket: fetchRealPrices }}>
      {children}
    </MarketContext.Provider>
  );
}
