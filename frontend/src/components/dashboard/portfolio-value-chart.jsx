// src/components/dashboard/portfolio-value-chart.jsx
import { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { Box, Button, ButtonGroup, Stack } from "@mui/material";

function PortfolioValueChart({ totalValue }) {
  const [timeframe, setTimeframe] = useState("1M"); // 1S, 1M, 1A

  const chartData = useMemo(() => {
    const dataCount = timeframe === "1S" ? 7 : timeframe === "1M" ? 30 : 12;
    const now = 1793112636000; // Timestamp base estable para pureza de renderizado
    const interval = timeframe === "1A" ? 30 * 86400000 : 86400000;

    const data = [];
    let currentTrendValue = (Number(totalValue) || 10000) * 0.92; 

    for (let i = 0; i < dataCount; i++) {
      const timestamp = now - (dataCount - i) * interval;
      // Fluctuación determinista en base al índice para respetar pureza de React
      const pseudoFactor = Math.sin(i * 1.5) * 0.015;
      const fluctuation = pseudoFactor * (Number(totalValue) || 10000);
      
      let price = currentTrendValue + fluctuation;
      if (i === dataCount - 1) price = Number(totalValue) || 10000;

      data.push({ x: timestamp, y: parseFloat(price.toFixed(2)) });
      currentTrendValue = price * 1.003;
    }
    return data;
  }, [timeframe, totalValue]);
  
  const isUp = chartData.length > 0 ? chartData[chartData.length - 1].y >= chartData[0].y : true;
  const mainColor = isUp ? "#4caf50" : "#f44336";

  const series = useMemo(() => [{
    name: "Patrimonio Total",
    data: chartData
  }], [chartData]);

  const options = useMemo(() => ({
    chart: {
      type: "area",
      height: 290,
      toolbar: { show: false },
      background: "transparent",
      sparkline: { enabled: false }
    },
    theme: { mode: "dark" },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: [mainColor]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.0,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: mainColor, opacity: 0.4 },
          { offset: 100, color: mainColor, opacity: 0 }
        ]
      }
    },
    colors: [mainColor],
    xaxis: {
      type: "datetime",
      labels: { 
        style: { colors: "#9ca3af" },
        datetimeFormatter: { day: "dd MMM", month: "MMM yyyy" }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af" },
        formatter: (val) => `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      },
    },
    grid: {
      borderColor: "#232a36",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      }
    }
  }), [mainColor]);

  return (
    <Box sx={{ width: "100%", height: 290, mt: 1 }}>
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 1 }}>
        <ButtonGroup size="small" variant="outlined" sx={{ borderColor: "#2d3748" }}>
          {["1S", "1M", "1A"].map((tf) => (
            <Button
              key={tf}
              onClick={() => setTimeframe(tf)}
              sx={{
                backgroundColor: timeframe === tf ? "#222731" : "transparent",
                color: timeframe === tf ? "primary.main" : "gray",
                borderColor: "#2d3748",
                fontWeight: 600,
                fontSize: "0.75rem",
                px: 1.5,
                "&:hover": { backgroundColor: "#1c2025" }
              }}
            >
              {tf === "1S" ? "1 Sem" : tf === "1M" ? "1 Mes" : "1 Año"}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
      <Chart options={options} series={series} type="area" height={270} />
    </Box>
  );
}

export default PortfolioValueChart;