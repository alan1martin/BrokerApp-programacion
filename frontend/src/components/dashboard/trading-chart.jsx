// src/components/dashboard/trading-chart.jsx
import { useState } from "react";
import Chart from "react-apexcharts";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

function TradingChart({ symbol, currentPrice, isAssetUp }) {
  const [chartType, setChartType] = useState("candlestick"); // 'candlestick' o 'line'
  const [timeframe, setTimeframe] = useState("1D"); // 1D, 1S, 1M, 1A

  // 💡 Generador Dinámico de Datos de Prueba en base al Timeframe y Precio Real
  const generateMockData = () => {
    const dataCount = timeframe === "1D" ? 12 : timeframe === "1S" ? 7 : timeframe === "1M" ? 15 : 24;
    const now = Date.now();
    const interval = timeframe === "1D" ? 3600000 * 2 : 86400000; // Horas o Días

    let data = [];
    let basePrice = currentPrice * (isAssetUp ? 0.97 : 1.02);

    for (let i = 0; i < dataCount; i++) {
      const timestamp = now - (dataCount - i) * interval;
      const volatility = basePrice * 0.015;
      
      const change = (Math.random() - (isAssetUp ? 0.45 : 0.55)) * volatility;
      const open = basePrice;
      const close = i === dataCount - 1 ? currentPrice : basePrice + change;
      const high = Math.max(open, close) + (Math.random() * volatility * 0.4);
      const low = Math.min(open, close) - (Math.random() * volatility * 0.4);

      if (chartType === "candlestick") {
        data.push({ x: timestamp, y: [open, high, low, close] });
      } else {
        data.push({ x: timestamp, y: close });
      }
      basePrice = close;
    }
    return data;
  };

  const chartSeries = [{
    name: symbol,
    data: generateMockData()
  }];

  // Configuración dinámica de ApexCharts
  const options = {
    chart: {
      id: "trading-chart",
      type: chartType,
      height: 350,
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: "dark" },
    stroke: {
      // Si es línea le damos grosor estético, si es vela lo dejamos nativo
      curve: "smooth",
      width: chartType === "line" ? 3 : 1,
    },
    // 🎨 Cambia el color si subió o bajó dinámicamente en ambos tipos
    colors: [isAssetUp ? "#4caf50" : "#f44336"],
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#9ca3af" },
        datetimeFormatter: { hour: "HH:mm", day: "dd MMM" }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af" },
        formatter: (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      },
    },
    grid: {
      borderColor: "#232a36",
      strokeDashArray: 4,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#4caf50",
          downward: "#f44336",
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: { format: timeframe === "1D" ? "dd MMM HH:mm" : "dd MMM yyyy" }
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      {/* BOTONERA INTERACTIVA PREMIUM */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        
        {/* Selector de Intervalo Temporal */}
        <ButtonGroup size="small" variant="outlined" sx={{ borderColor: "#2d3748" }}>
          {["1D", "1S", "1M", "1A"].map((tf) => (
            <Button
              key={tf}
              onClick={() => setTimeframe(tf)}
              sx={{
                backgroundColor: timeframe === tf ? "#222731" : "transparent",
                color: timeframe === tf ? "primary.main" : "gray",
                borderColor: "#2d3748",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#1c2025" }
              }}
            >
              {tf}
            </Button>
          ))}
        </ButtonGroup>

        {/* Selector de Tipo de Gráfico */}
        <ButtonGroup size="small" variant="outlined" sx={{ borderColor: "#2d3748" }}>
          <Button
            onClick={() => setChartType("candlestick")}
            sx={{
              backgroundColor: chartType === "candlestick" ? "#222731" : "transparent",
              color: chartType === "candlestick" ? "primary.main" : "gray",
              borderColor: "#2d3748",
            }}
          >
            <CandlestickChartIcon fontSize="small" />
          </Button>
          <Button
            onClick={() => setChartType("line")}
            sx={{
              backgroundColor: chartType === "line" ? "#222731" : "transparent",
              color: chartType === "line" ? "primary.main" : "gray",
              borderColor: "#2d3748",
            }}
          >
            <ShowChartIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Contenedor del Gráfico de ApexCharts */}
      <Box sx={{ minHeight: 350 }}>
        <Chart 
          options={options} 
          series={chartSeries} 
          type={chartType} 
          height={350} 
        />
      </Box>
    </Box>
  );
}

export default TradingChart;