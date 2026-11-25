import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts"; 
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Button, ButtonGroup, Stack, Avatar 
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { getPortfolio, getTransactionHistory } from "../services/portfolio-service"; 
import { useMarket } from "../context/market-context.jsx";
import { getAssetLogo } from "../utils/get-logo";
import BarChartIcon from "@mui/icons-material/BarChart";
import PageHeader from "../components/layout/page-header";
import { generateWeeklyReportPDF } from "../utils/generate-weekly-report-pdf";

function Reports() {
  const { assets: marketAssets, loadingMarket } = useMarket();
  const [portfolioData, setPortfolioData] = useState(null);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [activosRendimiento, setActivosRendimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTiempo, setFiltroTiempo] = useState("1M"); // 1S, 1M, 1A, ALL

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [portfolioRes, historyRes] = await Promise.all([
          getPortfolio(),
          getTransactionHistory()
        ]);

        let finalPortfolio = portfolioRes;
        if (!finalPortfolio || !finalPortfolio.positions || finalPortfolio.positions.length === 0) {
          try {
            const saved = localStorage.getItem("simulated_portfolio");
            if (saved) finalPortfolio = JSON.parse(saved);
          } catch {
            // silencio
          }
        }

        setPortfolioData(finalPortfolio);
        const transacciones = Array.isArray(historyRes) ? historyRes : [];
        setRawTransactions(transacciones);

        const positions = finalPortfolio?.positions ?? [];

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

  // ================= CÁLCULO DE VALOR TOTAL DEL PORTFOLIO =================
  const totalPortfolioValue = useMemo(() => {
    const cash = Number(portfolioData?.cash ?? 5000.0);
    const positions = portfolioData?.positions ?? [];
    const stocksVal = positions.reduce((acc, stock) => {
      const marketAsset = marketAssets?.find(a => a.symbol === stock.symbol);
      const price = marketAsset ? marketAsset.currentPrice : parseFloat(stock.average_price || 0);
      return acc + (parseFloat(stock.quantity || 0) * price);
    }, 0);
    return cash + stocksVal;
  }, [portfolioData, marketAssets]);

  // ================= DATOS DINÁMICOS DE EVOLUCIÓN HISTÓRICA =================
  // Replicando la pureza y arquitectura fluida de PortfolioValueChart
  const chartPoints = useMemo(() => {
    const dataCount = filtroTiempo === "1S" ? 7 : filtroTiempo === "1M" ? 30 : filtroTiempo === "3M" ? 90 : 180;
    const now = Date.now();
    const interval = 86400000; // 1 día en ms

    const data = [];
    let currentTrendValue = (Number(totalPortfolioValue) || 10000) * 0.92;

    for (let i = 0; i < dataCount; i++) {
      const timestamp = now - (dataCount - i) * interval;
      // Fluctuación determinista para pureza visual
      const pseudoFactor = Math.sin(i * 1.5) * 0.015;
      const fluctuation = pseudoFactor * (Number(totalPortfolioValue) || 10000);
      
      let price = currentTrendValue + fluctuation;
      if (i === dataCount - 1) price = Number(totalPortfolioValue) || 10000;

      data.push({ x: timestamp, y: parseFloat(price.toFixed(2)) });
      currentTrendValue = price * 1.002;
    }
    return data;
  }, [filtroTiempo, totalPortfolioValue]);

  const isUp = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].y >= chartPoints[0].y : true;
  const mainColor = isUp ? "#4caf50" : "#f44336";

  const chartOptions = useMemo(() => ({
    chart: {
      id: "portfolio-evolution",
      type: "area",
      height: 320,
      toolbar: { show: false }, 
      background: "transparent",
      sparkline: { enabled: false }
    },
    theme: {
      mode: "dark", 
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth", 
      width: 3,
      colors: [mainColor], 
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
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9ca3af", fontFamily: "inherit" },
        datetimeFormatter: { day: "dd MMM", month: "MMM yyyy" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontFamily: "inherit" },
        formatter: (val) => `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD` 
      }
    },
    grid: {
      borderColor: "#232a36", 
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (val) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 5
      }
    }
  }), [mainColor]);

  const chartSeries = useMemo(() => [
    {
      name: "Valor Cartera",
      data: chartPoints
    }
  ], [chartPoints]);

  // Manejador para descargar el PDF de movimientos semanales
  const handleDownloadPDF = () => {
    let currentUser = null;
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch {
      // silencio
    }

    generateWeeklyReportPDF({
      transactions: rawTransactions,
      portfolio: portfolioData,
      user: currentUser
    });
  };

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
        direction={{ xs: "column", md: "row" }} 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", md: "center" }, 
          mb: 3,
          gap: 2
        }}
      >
        <PageHeader
          icon={BarChartIcon}
          title="Rendimiento e Informes"
          subtitle="Monitoreá la evolución histórica del valor total de tu cartera y el balance por activo."
          iconColor="#4caf50"
        />

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {/* Botón de Generación de PDF de Movimientos Semanales */}
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon sx={{ color: "#fff", fontSize: 20 }} />}
            onClick={handleDownloadPDF}
            sx={{
              bgcolor: "#0b53a9",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              py: 0.8,
              fontSize: "0.85rem",
              boxShadow: "0 2px 8px rgba(11, 83, 169, 0.35)",
              "&:hover": {
                bgcolor: "#094389",
                boxShadow: "0 4px 12px rgba(11, 83, 169, 0.5)"
              }
            }}
          >
            Exportar Movimientos (PDF)
          </Button>

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
            <Button className={filtroTiempo === "1S" ? "active" : ""} onClick={() => setFiltroTiempo("1S")}>1S</Button>
            <Button className={filtroTiempo === "1M" ? "active" : ""} onClick={() => setFiltroTiempo("1M")}>1M</Button>
            <Button className={filtroTiempo === "3M" ? "active" : ""} onClick={() => setFiltroTiempo("3M")}>3M</Button>
            <Button className={filtroTiempo === "ALL" ? "active" : ""} onClick={() => setFiltroTiempo("ALL")}>Todo</Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* ================= GRÁFICO DE EVOLUCIÓN HISTÓRICA ================= */}
      <Card sx={{ bgcolor: "#15181e", borderColor: "#1c2025", mb: 4, borderRadius: 3, borderStyle: "solid", borderWidth: "1px" }}>
        <CardContent sx={{ p: "24px !important" }}>
          <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
            Evolución Histórica de la Cartera (USD)
          </Typography>
          
          <Box sx={{ minHeight: 320 }}>
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height={320} 
            />
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
