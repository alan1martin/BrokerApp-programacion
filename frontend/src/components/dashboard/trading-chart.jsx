import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Box, CircularProgress, useTheme } from "@mui/material";
import axiosInstance from "../../services/api"; // Tu instancia de Axios configurada

function TradingChart({ symbol }) {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Le pegamos a tu endpoint de Django
        const response = await axiosInstance.get(`/portfolio/history/${symbol}/`);
        
        // Yahoo Finance nos trae el array adentro de 'history'
        const rawHistory = response.data?.history || [];

        // Acotamos a los últimos 20 puntos para que el eje X de Nivo no se sature de texto
        const recentHistory = rawHistory.slice(-20);
        
        // Mapeamos los datos con las nuevas llaves de Yahoo (date y close)
        const dataPoints = recentHistory.map(item => ({
          x: item.date.split(" ")[1] || item.date, // Extrae solo la hora 'HH:MM' para que quede estético
          y: item.close
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
        setChartData([]); // Evita que se rompa la pantalla si falla
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchHistory();
    }
  }, [symbol, theme.palette.primary.main]);

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
          legend: "Hora (Intervalos 15m)",
          legendOffset: 32,
          legendPosition: "middle"
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          format: (value) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        }}
        enableGridX={false}
        enableGridY={true}
        theme={{
          grid: { line: { stroke: "#222731", strokeDasharray: "4 4" } },
          axis: {
            legend: { text: { fill: "#8a94a6", fontSize: 11, fontWeight: 600 } },
            ticks: { text: { fill: "#6b778c", fontSize: 10 } }
          },
          crosshair: {
            line: {
              stroke: theme.palette.primary.main,
              strokeWidth: 1,
              strokeDasharray: "6 6",
            },
          },
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