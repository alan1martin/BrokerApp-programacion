//frontend/src/context/market-context.jsx
import { createContext, useContext, useState, useEffect } from "react";
// Importamos la instancia configurada que ya tiene el prefijo /api y los interceptores de token
import api from "../services/api"; 

const MarketContext = createContext();

const INITIAL_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.50, change24h: 1.2 },
  { symbol: "TSLA", name: "Tesla Inc.", currentPrice: 180.20, change24h: -2.4 },
  { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 875.00, change24h: 5.8 },
  { symbol: "BTC", name: "Bitcoin", currentPrice: 65000.00, change24h: 0.5 },
];

// ================= FUNCIÓN CONTROL DE HORARIOS (MERCADO ARGENTINO) =================
const isTraditionalMarketOpen = () => {
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = Domingo, 6 = Sábado

  // Fines de semana cerrado completo
  if (diaSemana === 0 || diaSemana === 6) return false;

  const hora = ahora.getHours();
  const minutos = ahora.getMinutes();
  const tiempoEnMinutos = hora * 60 + minutos;

  // Rango de operación en Argentina: 10:30 hs a 17:00 hs
  const aperturaMinutos = 10 * 60 + 30; // 10:30
  const cierreMinutos = 17 * 60;         // 17:00

  return tiempoEnMinutos >= aperturaMinutos && tiempoEnMinutos <= cierreMinutos;
};

export function MarketProvider({ children }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const fetchRealPrices = async () => {
    const token = localStorage.getItem("access");

    if (!token || token === "token_falso_de_prueba_123") {
      setAssets(INITIAL_ASSETS);
      setLoadingMarket(false);
      return;
    }

    try {
      const symbolsToFetch = ["AAPL", "TSLA", "NVDA", "BTC"];
      const mercadoAbierto = isTraditionalMarketOpen();
      
      const pricePromises = symbolsToFetch.map(async (symbol) => {
        const esCrypto = symbol === "BTC";

        // ================= FILTRO ESTRATÉGICO DE PETICIONES =================
        // Si no es Bitcoin y el mercado está cerrado, salteamos el fetch directo
        if (!esCrypto && !mercadoAbierto) {
          return {
            symbol: symbol,
            skipUpdate: true // Bandera para decirle al estado que deje el precio previo intacto
          };
        }

        try {
          // Reemplazamos el fetch manual y propenso a CORS por nuestra instancia de Axios.
          // Como 'api' ya apunta a http://localhost:8000/api e inyecta los headers, solo definimos el endpoint relativo.
          const response = await api.get(`/portfolio/history/${symbol}/`);

          if (response.status === 200) {
            const data = response.data;
            return {
              symbol: symbol,
              currentPrice: data.currentPrice || data.price,
              name: data.companyName || symbol
            };
          }
          
        } catch (e) {
          if (e.response && e.response.status === 401) {
            console.warn(`Django rechazó la autenticación (401) para el activo: ${symbol}. Usando simulación.`);
          } else {
            console.error(`No se pudo obtener precio real de ${symbol} desde Django:`, e);
          }
        }
        return null;
      });

      const updatedPricesResults = await Promise.all(pricePromises);

      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const updatedInfo = updatedPricesResults.find(r => r && r.symbol === asset.symbol);
          
          // Si el control de horarios frenó la actualización, mantenemos el valor que ya teníamos en pantalla
          if (updatedInfo && updatedInfo.skipUpdate) {
            return asset; 
          }

          if (updatedInfo && updatedInfo.currentPrice) {
            return {
              ...asset,
              name: updatedInfo.name,
              currentPrice: parseFloat(updatedInfo.currentPrice)
            };
          }
          
          // Fallback por si la API falla estando el mercado abierto
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
    const interval = setInterval(fetchRealPrices, 30000); // 30 segundos
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