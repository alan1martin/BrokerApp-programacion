import { createContext, useContext, useState, useEffect } from "react";

const MarketContext = createContext();

const INITIAL_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.50, change24h: 1.25 },
  { symbol: "BTC", name: "Bitcoin", currentPrice: 62000.00, change24h: -2.41 },
  { symbol: "TSLA", name: "Tesla, Inc.", currentPrice: 189.44, change24h: 0.85 },
  { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 901.11, change24h: 4.12 },
];

export function MarketProvider({ children }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const fetchRealPrices = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22]");
      const cryptoData = await response.json();
      
      const stocksResponse = await fetch("https://financialmodelingprep.com/api/v3/quote-short/AAPL,TSLA,NVDA?apikey=demo");
      const stocksData = await stocksResponse.json();

      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          // Asignamos una variación fija o levemente dinámica para el prototipo
          let change = asset.change24h; 

          if (asset.symbol === "BTC" && cryptoData[0]) {
            const newPrice = parseFloat(parseFloat(cryptoData[0].price).toFixed(2));
            // Si el precio cambió, recalculamos una variación realista para simular las 24h
            change = newPrice > 65000 ? 3.14 : -1.85; 
            return { ...asset, currentPrice: newPrice, change24h: change };
          }
          
          const stockInfo = Array.isArray(stocksData) ? stocksData.find(s => s.symbol === asset.symbol) : null;
          if (stockInfo) {
            // Simulamos variaciones divertidas basadas en el precio demo
            change = stockInfo.price > 500 ? 5.23 : asset.symbol === "TSLA" ? -3.12 : 1.45;
            return { ...asset, currentPrice: parseFloat(stockInfo.price.toFixed(2)), change24h: change };
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
    fetchRealPrices();
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