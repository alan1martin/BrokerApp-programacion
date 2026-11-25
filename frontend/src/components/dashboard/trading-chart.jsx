// src/components/dashboard/trading-chart.jsx
import { useEffect, useRef, memo } from "react";
import { Box } from "@mui/material";

// Mapeo exhaustivo de activos a tickers oficiales compatibles con TradingView
const TRADINGVIEW_MAP = {
  NVDA: "NASDAQ:NVDA",
  AAPL: "NASDAQ:AAPL",
  TSLA: "NASDAQ:TSLA",
  MSFT: "NASDAQ:MSFT",
  AMZN: "NASDAQ:AMZN",
  GOOGL: "NASDAQ:GOOGL",
  META: "NASDAQ:META",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  SPY: "AMEX:SPY",
  QQQ: "NASDAQ:QQQ",
  DIA: "AMEX:DIA",
  GGAL: "NASDAQ:GGAL",
  F: "NYSE:F",
  KO: "NYSE:KO",
  DIS: "NYSE:DIS",
  BA: "NYSE:BA",
  JPM: "NYSE:JPM",
  V: "NYSE:V",
  MA: "NYSE:MA",
  WMT: "NYSE:WMT",
  BABA: "NYSE:BABA",
};

function getTradingViewSymbol(symbol, exchange) {
  if (!symbol) return "NASDAQ:AAPL";
  const clean = symbol.trim().toUpperCase();
  if (TRADINGVIEW_MAP[clean]) return TRADINGVIEW_MAP[clean];
  if (clean.includes("BTC")) return "BINANCE:BTCUSDT";
  if (clean.includes("ETH")) return "BINANCE:ETHUSDT";
  if (clean.includes("SOL")) return "BINANCE:SOLUSDT";

  // Si nos viene el exchange desde el backend o search
  const ex = (exchange || "").toUpperCase();
  if (ex.includes("NYSE") || ex === "NYQ" || ex === "NYS") return `NYSE:${clean}`;
  if (ex.includes("AMEX") || ex === "ASE") return `AMEX:${clean}`;
  if (ex.includes("NASDAQ") || ex === "NMS" || ex === "NGM") return `NASDAQ:${clean}`;

  // Si no tiene prefijo, TradingView acepta el ticker limpio y resuelve el exchange automáticamente
  return clean;
}

function TradingChart({ symbol, exchange }) {
  const containerRef = useRef(null);
  const tvSymbol = getTradingViewSymbol(symbol, exchange);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Se difiere la inyección: si React desmonta enseguida (StrictMode o cambio
    // rápido de activo), el timeout se cancela y el script nunca llega a insertarse.
    const timeoutId = setTimeout(() => {
      // Limpiamos contenido previo para evitar duplicaciones
      currentContainer.innerHTML = "";

      // Contenedor interno que el script de TradingView busca mediante querySelector
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
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      currentContainer.innerHTML = "";
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

export default memo(TradingChart);