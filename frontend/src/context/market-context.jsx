import { createContext, useContext, useState, useEffect } from "react";

const MarketContext = createContext();

// Definimos los activos iniciales con un precio base por si la API tarda en responder
const INITIAL_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.50 },
  { symbol: "BTC", name: "Bitcoin", currentPrice: 62000.00 },
  { symbol: "TSLA", name: "Tesla, Inc.", currentPrice: 189.44 },
  { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 901.11 },
];

export function MarketProvider({ children }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const fetchRealPrices = async () => {
    try {
      // Usamos una API global y pública de precios de mercado (CoinGecko + Yahoo Mirror)
      // Para hacerlo simple, rápido y sin registrarte, le pegamos a un endpoint unificado:
      const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22]");
      const cryptoData = await response.json();
      
      // Para las acciones (AAPL, TSLA, NVDA), como Wall Street cierra los fines de semana,
      // consumimos un endpoint de cotizaciones reales del día:
      const stocksResponse = await fetch("https://financialmodelingprep.com/api/v3/quote-short/AAPL,TSLA,NVDA?apikey=demo");
      const stocksData = await stocksResponse.json();

      // Mapeamos los precios reales adentro de nuestro estado de React
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.symbol === "BTC" && cryptoData[0]) {
            return { ...asset, currentPrice: parseFloat(parseFloat(cryptoData[0].price).toFixed(2)) };
          }
          
          // Si es una acción y la API demo nos devolvió data real de Wall Street
          const stockInfo = Array.isArray(stocksData) ? stocksData.find(s => s.symbol === asset.symbol) : null;
          if (stockInfo) {
            return { ...asset, currentPrice: parseFloat(stockInfo.price.toFixed(2)) };
          }
          
          return asset;
        })
      );
    } catch (error) {
      console.error("Error trayendo precios reales del mercado:", error);
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    // Buscamos los precios reales apenas arranca la app
    fetchRealPrices();

    // Actualizamos del mercado real cada 30 segundos para no saturar la red
    const interval = setInterval(fetchRealPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ assets, loadingMarket, refreshPrices: fetchRealPrices }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
