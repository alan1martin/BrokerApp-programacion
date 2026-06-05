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

    // Si no hay token o es el de prueba ficticio y Django nos rebota con 401, 
    // mantenemos los activos iniciales para que la interfaz no quede vacía.
    if (!token || token === "token_falso_de_prueba_123") {
      setAssets(INITIAL_ASSETS);
      setLoadingMarket(false);
      return;
    }

    try {
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

          // Si el token es válido y Django responde bien (200 OK)
          if (response.ok) {
            const data = await response.json();
            return {
              symbol: symbol,
              currentPrice: data.currentPrice || data.price, // Mapeo flexible por las dudas
              name: data.companyName || symbol
            };
          }
          
          // Si Django tira 401 u otro error, retornamos null para manejar el fallback por activo
          if (response.status === 401) {
            console.warn(`Django rechazó la autenticación (401) para el activo: ${symbol}. Usando simulación.`);
          }
        } catch (e) {
          console.error(`No se pudo obtener precio real de ${symbol} desde Django:`, e);
        }
        return null;
      });

      const updatedPricesResults = await Promise.all(pricePromises);

      // Cruzamos los datos obtenidos. Si un activo vino en null (por el 401), conserva el precio base simulado.
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
          // Mecanismo de emergencia: Si Django falló o tiró 401, dejamos el precio de INITIAL_ASSETS
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
    // Actualiza cada 30 segundos de forma segura
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