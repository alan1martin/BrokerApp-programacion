import { useState, useEffect, useRef } from "react";
import { Box, Typography, Card, CardContent, Grid, MenuItem, Select, FormControl, InputLabel, Stack } from "@mui/material";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import PageHeader from "../components/layout/page-header";

// Mapeo de tickers a símbolos compatibles con TradingView
const SYMBOL_MAP = {
  NVDA : "NASDAQ:NVDA",
  AAPL : "NASDAQ:AAPL",
  TSLA : "NASDAQ:TSLA",
  MSFT : "NASDAQ:MSFT",
  AMZN : "NASDAQ:AMZN",
  GOOGL: "NASDAQ:GOOGL",
  SPY  : "AMEX:SPY",
  QQQ  : "NASDAQ:QQQ",
};

// Monta un widget de TradingView dentro de un contenedor.
// Devuelve una función de limpieza segura (cancela la inyección si aún no ocurrió).
function mountTradingViewWidget(container, scriptSrc, config) {
  // Se difiere la inyección: si React desmonta enseguida (StrictMode o cambio rápido
  // de símbolo), el timeout se cancela y el script nunca llega a insertarse.
  const timeoutId = setTimeout(() => {
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
  }, 150);

  return () => {
    clearTimeout(timeoutId);
    container.innerHTML = "";
  };
}

function TechnicalAnalysisPage() {
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const chartContainerRef = useRef(null);
  const gaugeContainerRef = useRef(null);

  const tvSymbol = SYMBOL_MAP[selectedTicker] || `NASDAQ:${selectedTicker}`;

  // Carga del Gráfico Interactivo Principal de TradingView
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    return mountTradingViewWidget(
      container,
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",
      {
        autosize: true,
        symbol: tvSymbol,
        interval: "D",
        timezone: "America/Argentina/Buenos_Aires",
        theme: "dark",
        style: "1", // Velas japonesas
        locale: "es",
        enable_publishing: false,
        allow_symbol_change: false,
        calendar: false,
        support_host: "https://www.tradingview.com"
      }
    );
  }, [tvSymbol]);

  // Carga del Widget Velocímetro (Resumen de Indicadores Técnicos)
  useEffect(() => {
    const container = gaugeContainerRef.current;
    if (!container) return;

    return mountTradingViewWidget(
      container,
      "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js",
      {
        interval: "1D",
        width: "100%",
        isTransparent: true,
        height: "100%",
        symbol: tvSymbol,
        showIntervalTabs: true,
        displayMode: "single",
        locale: "es",
        colorTheme: "dark"
      }
    );
  }, [tvSymbol]);

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Encabezado Principal Estandarizado */}
      <PageHeader
        icon={CandlestickChartIcon}
        title="Análisis Técnico"
        subtitle="Gráficos avanzados en tiempo real, velas japonesas e indicadores de mercado."
        iconColor="#2196f3"
      />

      {/* Grid Principal */}
      <Grid container spacing={3} sx={{ width: "100%", margin: 0 }}>
        {/* Columna Izquierda: Selector Alineado + Gráfico */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ pl: "0 !important", pt: "0 !important" }}>
          <Stack spacing={1.5} sx={{ width: "100%" }}>
            {/* Selector de Activos Flotante Alineado a la Derecha del Gráfico */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <FormControl size="small" sx={{ minWidth: 200, bgcolor: "#15181e", borderRadius: 1 }}>
                <InputLabel id="ticker-select-label" sx={{ color: "gray" }}>Seleccionar Activo</InputLabel>
                <Select
                  labelId="ticker-select-label"
                  value={selectedTicker}
                  label="Seleccionar Activo"
                  onChange={(e) => setSelectedTicker(e.target.value)}
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#2196f3" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2196f3" }
                  }}
                >
                  {Object.keys(SYMBOL_MAP).map((ticker) => (
                    <MenuItem key={ticker} value={ticker}>
                      {ticker}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Gráfico Avanzado de TradingView */}
            <Card sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 1, height: 600, width: "100%" }}>
              <CardContent sx={{ p: "12px !important", height: "100%", width: "100%" }}>
                <Box 
                  ref={chartContainerRef} 
                  className="tradingview-widget-container" 
                  sx={{ height: "100%", width: "100%", "& iframe": { width: "100% !important", height: "100% !important" } }} 
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Columna Derecha: Resumen de Señales / Velocímetro */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ pt: { xs: 3, lg: 0 } }}>
          <Box sx={{ height: { lg: 40 }, display: { xs: "none", lg: "block" } }} />
          
          <Card sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 1, height: 600, width: "100%" }}>
            <CardContent sx={{ p: "16px !important", height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 1 }}>
                Resumen de Señales
              </Typography>
              <Box 
                ref={gaugeContainerRef} 
                className="tradingview-widget-container" 
                sx={{ flexGrow: 1, width: "100%", height: "100%", "& iframe": { width: "100% !important", height: "100% !important" } }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default TechnicalAnalysisPage;