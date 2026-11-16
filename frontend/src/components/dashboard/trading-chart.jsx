// src/components/dashboard/trading-chart.jsx
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

// Mapeo exhaustivo de activos a tickers oficiales compatibles con TradingView
const TRADINGVIEW_MAP = {
  NVDA: "NASDAQ:NVDA",
  AAPL: "NASDAQ:AAPL",
  TSLA: "NASDAQ:TSLA",
  MSFT: "NASDAQ:MSFT",
  AMZN: "NASDAQ:AMZN",
  GOOGL: "NASDAQ:GOOGL",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  SPY: "AMEX:SPY",
  QQQ: "NASDAQ:QQQ",
  DIA: "AMEX:DIA",
  AL30: "BCBA:AL30",
  GGAL: "NASDAQ:GGAL",
  "G GALICIA": "NASDAQ:GGAL",
};

function getTradingViewSymbol(symbol) {
  if (!symbol) return "NASDAQ:AAPL";
  const clean = symbol.trim().toUpperCase();
  if (TRADINGVIEW_MAP[clean]) return TRADINGVIEW_MAP[clean];
  if (clean.includes("BTC")) return "BINANCE:BTCUSDT";
  if (clean.includes("ETH")) return "BINANCE:ETHUSDT";
  if (clean.includes("SOL")) return "BINANCE:SOLUSDT";
  return `NASDAQ:${clean}`;
}

function TradingChart({ symbol }) {
  const containerRef = useRef(null);
  const tvSymbol = getTradingViewSymbol(symbol);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Limpiamos contenido previo para evitar duplicaciones
    currentContainer.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    currentContainer.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "America/Argentina/Buenos_Aires",
      theme: "dark",
      style: "2", // Modo Gráfico de Líneas (Line Chart) oficial de TradingView
      locale: "es",
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com"
    });

    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [tvSymbol]);

  return (
    <Box sx={{ width: "100%", height: 480, mt: 2, position: "relative" }}>
      <Box 
        ref={containerRef} 
        className="tradingview-widget-container" 
        sx={{ 
          height: "100%", 
          width: "100%", 
          borderRadius: 1.5,
          overflow: "hidden",
          "& iframe": { 
            width: "100% !important", 
            height: "100% !important",
            border: "none !important"
          } 
        }} 
      />
    </Box>
  );
}

export default TradingChart;
