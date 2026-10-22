import { useState, useEffect } from "react";
import Chart from "react-apexcharts"; 
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Button, ButtonGroup, Stack, Avatar 
} from "@mui/material";
import { getPortfolio, getTransactionHistory } from "../services/portfolio-service"; 
import { useMarket } from "../context/market-context.jsx";
import { getAssetLogo } from "../utils/get-logo";

function Reports() {
  const { assets: marketAssets, loadingMarket } = useMarket();
  const [chartData, setChartData] = useState([]);
  const [activosRendimiento, setActivosRendimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTiempo, setFiltroTiempo] = useState("ALL"); 

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [portfolioRes, historyRes] = await Promise.all([
          getPortfolio(),
          getTransactionHistory()
        ]);

        const positions = portfolioRes?.positions ?? [];
        const cash = portfolioRes?.cash ?? 5000.00;

        // ================= 1. PROCESAR RENDIMIENTO POR ACTIVO =================
        const activosProcesados = positions.map((stock) => {
          const symbol = stock.symbol;
          const marketAsset = marketAssets?.find(a => a.symbol === symbol);
          const currentPrice = marketAsset ? marketAsset.currentPrice : parseFloat(stock.average_price || 0);
          const avgPrice = parseFloat(stock.average_price || 0);
          const quantity = parseFloat(stock.quantity || 0);

          // Cálculo del valor actual y costo total
          const valorActual = quantity * currentPrice;
          const costoTotal = quantity * avgPrice;
          
          // Rendimiento en USD y Porcentaje
          const rendimientoMontoUSD = valorActual - costoTotal;
          const rendimientoPorcentaje = costoTotal > 0 ? ((valorActual - costoTotal) / costoTotal) * 100 : 0;

          return {
            symbol,
            name: marketAsset?.name || symbol,
            quantity,
            currentPrice,
            rendimientoMontoUSD,
            rendimientoPorcentaje
          };
        }).filter(a => a.quantity > 0);

        setActivosRendimiento(activosProcesados);

        // ================= 2. PROCESAR EVOLUCIÓN HISTÓRICA POSITIVA =================
        const transacciones = Array.isArray(historyRes) && historyRes.length > 0 ? historyRes : [];
        
        let patrimonioAcumulado = cash;
        // Si hay transacciones, reconstruimos la línea de tiempo sumando depósitos o valorizando
        const historial = [];

        if (transacciones.length > 0) {
          const txsOrdenadas = [...transacciones].sort(
            (a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date)
          );

          txsOrdenadas.forEach((tx) => {
            const monto = parseFloat(tx.total_price || (tx.quantity * tx.price) || 0);
            const tipo = (tx.transaction_type || "").toUpperCase();

            if (tipo === "DEPOSIT" || tipo === "DEP") patrimonioAcumulado += monto;
            else if (tipo === "WITHDRAW" || tipo === "WIT") patrimonioAcumulado = Math.max(0, patrimonioAcumulado - monto);
            
            const fechaTx = new Date(tx.timestamp || tx.date);
            const mesAnio = !isNaN(fechaTx) ? fechaTx.toLocaleDateString("es-AR", { 
              month: "short", 
              year: "numeric" 
            }) : "Reciente";

            historial.push({ mes: mesAnio, valorTotal: patrimonioAcumulado });
          });
        } else {
          historial.push({ mes: "Actual", valorTotal: cash });
        }

        setChartData(historial);

      } catch (err) {
        console.error("Error cargando reportes:", err);
        setError("Error al recuperar los datos reales del portfolio.");
      } finally {
        setLoading(false);
      }
    };

    if (!loadingMarket) {
      fetchReportData();
    }
  }, [marketAssets, loadingMarket]);

  // ================= CONFIGURACIÓN APEXCHARTS (FLUIDO, SIN PUNTOS FIJOS) =================
  const chartOptions = {
    chart: {
      id: "portfolio-evolution",
      toolbar: { show: false }, 
      background: "transparent",
    },
    theme: {
      mode: "dark", 
    },
    dataLabels: {
      enabled: false, // Apagamos los cartelitos fijos
    },
    stroke: {
      curve: "smooth", 
      width: 3,
      colors: ["#4caf50"], 
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#4caf50", opacity: 0.4 },
          { offset: 1, color: "#4caf50", opacity: 0.0 }
        ]
      }
    },
    xaxis: {
      categories: chartData.map((d) => d.mes),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9ca3af", fontFamily: "inherit" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontFamily: "inherit" },
        formatter: (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD` 
      }
    },
    grid: {
      borderColor: "#1c2025", 
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`
      }
    },
    markers: {
      size: 0, // Ocultos por defecto
      hover: {
        size: 6 // Aparecen suavemente al pasar el mouse
      }
    }
  };

  const chartSeries = [
    {
      name: "Valor Cartera",
      data: chartData.map((d) => d.valorTotal)
    }
  ];

  if (loading || loadingMarket) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#4caf50" }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ bgcolor: "#2a1215", color: "#ff8a80", borderRadius: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Stack 
        direction="row" 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 3 
        }}
      >
        <Typography variant="h5" fontWeight={800} color="white">
          Rendimiento e Informes
        </Typography>

        <ButtonGroup 
          size="small" 
          sx={{ 
            bgcolor: "#0b0e11", 
            border: "1px solid #1c2025", 
            borderRadius: 2,
            "& .MuiButton-root": { 
              color: "#9ca3af", 
              borderColor: "#1c2025",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              "&:hover": { bgcolor: "#1c2025", color: "white" },
              "&.active": { bgcolor: "rgba(76, 175, 80, 0.15)", color: "#4caf50" }
            }
          }}
        >
          <Button className={filtroTiempo === "1M" ? "active" : ""} onClick={() => setFiltroTiempo("1M")}>1M</Button>
          <Button className={filtroTiempo === "3M" ? "active" : ""} onClick={() => setFiltroTiempo("3M")}>3M</Button>
          <Button className={filtroTiempo === "6M" ? "active" : ""} onClick={() => setFiltroTiempo("6M")}>6M</Button>
          <Button className={filtroTiempo === "ALL" ? "active" : ""} onClick={() => setFiltroTiempo("ALL")}>Todo</Button>
        </ButtonGroup>
      </Stack>

      {/* ================= GRÁFICO DE EVOLUCIÓN HISTÓRICA ================= */}
      <Card sx={{ bgcolor: "#15181e", borderColor: "#1c2025", mb: 4, borderRadius: 3, borderStyle: "solid", borderWidth: "1px" }}>
        <CardContent sx={{ p: "24px !important" }}>
          <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
            Evolución Histórica de la Cartera (USD)
          </Typography>
          
          <Box sx={{ minHeight: 320 }}>
            {chartData.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <Typography color="gray" variant="body2">No hay transacciones registradas para armar la evolución.</Typography>
              </Box>
            ) : (
              <Chart 
                options={chartOptions} 
                series={chartSeries} 
                type="area" 
                height={320} 
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ================= TABLA DE RENDIMIENTO DETALLADO ================= */}
      <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
        Rendimiento Detallado por Activo
      </Typography>
      
      <TableContainer component={Card} sx={{ bgcolor: "#15181e", borderColor: "#1c2025", borderRadius: 3, borderStyle: "solid", borderWidth: "1px" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1c2025" }}>
            <TableRow>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }}>Activo</TableCell>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }} align="right">Cant. Nominal</TableCell>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }} align="right">Rendimiento (USD)</TableCell>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }} align="right">Rendimiento (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activosRendimiento.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: "gray", py: 4, border: 0 }}>
                  No poseés activos con rendimientos calculados en tu cuenta.
                </TableCell>
              </TableRow>
            ) : (
              activosRendimiento.map((activo) => {
                const esPositivo = activo.rendimientoMontoUSD >= 0;

                return (
                  <TableRow 
                    key={activo.symbol} 
                    sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { bgcolor: "#1c2025" } }}
                  >
                    {/* Ticker + Logo usando getAssetLogo de utilities */}
                    <TableCell component="th" scope="row" sx={{ color: "white", fontWeight: 600, borderBottom: "1px solid #1c2025" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar 
                          src={getAssetLogo(activo.symbol)} 
                          alt={activo.symbol}
                          sx={{ width: 28, height: 28, backgroundColor: "#1c2025", border: "1px solid #2d3748", p: 0.2 }} 
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="white">{activo.symbol}</Typography>
                          <Typography variant="caption" color="gray">{activo.name}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Cantidad Nominal */}
                    <TableCell align="right" sx={{ color: "white", fontWeight: 600, borderBottom: "1px solid #1c2025" }}>
                      {activo.quantity.toFixed(2)}
                    </TableCell>

                    {/* Rendimiento USD */}
                    <TableCell align="right" sx={{ color: esPositivo ? "#4caf50" : "#f44336", fontWeight: 700, borderBottom: "1px solid #1c2025" }}>
                      {esPositivo ? `+$${activo.rendimientoMontoUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `-$${Math.abs(activo.rendimientoMontoUSD).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                    </TableCell>

                    {/* Rendimiento % */}
                    <TableCell align="right" sx={{ color: esPositivo ? "#4caf50" : "#f44336", fontWeight: 700, borderBottom: "1px solid #1c2025" }}>
                      {esPositivo ? `+${activo.rendimientoPorcentaje.toFixed(2)}%` : `${activo.rendimientoPorcentaje.toFixed(2)}%`}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Reports;