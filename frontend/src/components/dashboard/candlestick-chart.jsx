// src/components/dashboard/candlestick-chart.jsx
import Chart from "react-apexcharts";
import { Box, Typography } from "@mui/material";

function CandlestickChart({ symbol = "AAPL" }) {
  // 💡 Datos Mockeados realistas para la Demo (Simula variaciones de precio OHLC: Open, High, Low, Close)
  const mockCandleData = [
    { x: new Date(2026, 4, 25).getTime(), y: [150.20, 153.40, 149.80, 152.10] },
    { x: new Date(2026, 4, 26).getTime(), y: [152.10, 155.80, 151.50, 154.30] },
    { x: new Date(2026, 4, 27).getTime(), y: [154.30, 154.90, 150.20, 151.80] },
    { x: new Date(2026, 4, 28).getTime(), y: [151.80, 156.20, 151.20, 155.95] },
    { x: new Date(2026, 4, 29).getTime(), y: [155.95, 158.40, 154.10, 157.20] },
    { x: new Date(2026, 4, 30).getTime(), y: [157.20, 160.10, 156.50, 158.33] },
  ];

  const series = [{ data: mockCandleData }];

  const options = {
    chart: {
      type: "candlestick",
      height: 290,
      toolbar: { show: false }, // Ocultamos herramientas innecesarias para mantenerlo limpio
      background: "transparent",
    },
    theme: { mode: "dark" },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: "#9ca3af" },
        formatter: (val) => `$${val.toFixed(2)}`,
      },
    },
    grid: {
      borderColor: "#232a36",
      strokeDashArray: 4,
    },
    // Personalizamos los colores para que combinen con tu paleta Dark
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#4caf50",   // Verde para velas alcistas
          downward: "#f44336", // Rojo para velas bajistas
        },
      },
    },
  };

  return (
    <Box sx={{ width: "100%", height: 290, mt: 1 }}>
      <Typography variant="body2" color="gray" sx={{ ml: 2, mb: 1 }}>
        Rendimiento en tiempo real ({symbol})
      </Typography>
      <Chart options={options} series={series} type="candlestick" height={290} />
    </Box>
  );
}

export default CandlestickChart;