import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Box, CircularProgress, useTheme } from "@mui/material";
import axiosInstance from "../../services/api"; // Ajustá la ruta a tu Axios

function TradingChart({ symbol }) {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Le pegamos a la API corporativa de Django que armamos recién
        const response = await axiosInstance.get(`/portfolio/history/${symbol}/`);
        
        const dataPoints = response.data.data.map(item => ({
          x: item.time,
          y: item.price
        }));

        setChartData([
          {
            id: symbol,
            color: theme.palette.primary.main,
            data: dataPoints
          }
        ]);
      } catch (error) {
        console.error("Error trayendo historial del backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 240 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 240, width: "100%", mt: 2 }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 15, right: 20, bottom: 40, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Hora del Servidor",
          legendOffset: 32,
          legendPosition: "middle"
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          format: (value) => `$${value.toLocaleString()}`
        }}
        enableGridX={false}
        enableGridY={true}
        theme={{
          grid: { line: { stroke: "#222731", strokeDasharray: "4 4" } },
          axis: {
            legend: { text: { fill: "#8a94a6", fontSize: 11, fontWeight: 600 } },
            ticks: { text: { fill: "#6b778c", fontSize: 10 } }
          }
        }}
        colors={[theme.palette.primary.main]}
        useMesh={true}
        enableArea={true}
        areaOpacity={0.07}
      />
    </Box>
  );
}

export default TradingChart;
