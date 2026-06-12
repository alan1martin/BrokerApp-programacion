import { useState, useEffect } from "react";
import Chart from "react-apexcharts"; 
import { 
  Box, Typography, Card, CardContent, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Button, ButtonGroup, Stack 
} from "@mui/material";
import { getAssetComposition, getTransactionHistory } from "../services/portfolio-service"; 

function Reports() {
  const [chartData, setChartData] = useState([]);
  const [activosRendimiento, setActivosRendimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTiempo, setFiltroTiempo] = useState("ALL"); 

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [compositionData, transactionsData] = await Promise.all([
          getAssetComposition(),
          getTransactionHistory()
        ]);

        // ================= BLINDAJE ANTI-OBJETOS SEGURO =================
        if (Array.isArray(compositionData)) {
          setActivosRendimiento(compositionData);
        } else if (compositionData && Array.isArray(compositionData.data)) {
          setActivosRendimiento(compositionData.data);
        } else {
          setActivosRendimiento([]);
        }
        // =================================================================
        
        const evolucionProcesada = procesarEvoluciónCartera(transactionsData || []);
        setChartData(evolucionProcesada);
      } catch (err) {
        console.error("Error cargando reportes:", err);
        setError("Error al recuperar los datos reales del portfolio.");
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

const procesarEvoluciónCartera = (transacciones) => {
    // 1. Aseguramos orden cronológico
    const transaccionesOrdenadas = [...transacciones].sort(
      (a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date)
    );

    let saldoActual = 0;
    const historial = [];

    transaccionesOrdenadas.forEach((tx) => {
      const monto = parseFloat(tx.amount || tx.total_price || 0);
      
      // Lógica de saldo:
      // DEPÓSITO: + | RETIRO: - | COMPRA: - (sale efectivo) | VENTA: + (entra efectivo)
      if (tx.transaction_type === "DEPOSIT") saldoActual += monto;
      if (tx.transaction_type === "WITHDRAW") saldoActual -= monto;
      if (tx.transaction_type === "BUY") saldoActual -= monto;
      if (tx.transaction_type === "SELL") saldoActual += monto;

      const mesAnio = new Date(tx.timestamp || tx.date).toLocaleDateString("es-AR", { 
        month: "short", 
        year: "numeric" 
      });

      historial.push({ mes: mesAnio, valorTotal: saldoActual });
    });

    return historial;
  };

  // ================= CONFIGURACIÓN PREMIUM DE APEXCHARTS =================
  const chartOptions = {
    chart: {
      id: "portfolio-evolution",
      toolbar: { show: false }, 
      background: "transparent",
    },
    theme: {
      mode: "dark", 
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
        formatter: (val) => `$${val.toLocaleString("es-AR")}` 
      }
    },
    grid: {
      borderColor: "#1c2025", 
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `$${val.toLocaleString("es-AR")}`
      }
    },
    markers: {
      size: 4,
      colors: ["#4caf50"],
      strokeColors: "#15181e",
      strokeWidth: 2,
    }
  };

  const chartSeries = [
    {
      name: "Valor Total",
      data: chartData.map((d) => d.valorTotal)
    }
  ];

  if (loading) {
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
      {/* SOLUCIONADO: Props de diseño movidas a estilos de MUI correspondientes */}
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

      {/* ================= SECCIÓN SUPERIOR: GRÁFICO REAL CON APEXCHARTS ================= */}
      <Card sx={{ bgcolor: "#15181e", borderColor: "#1c2025", mb: 4, borderRadius: 3, borderStyle: "solid", borderWidth: "1px" }}>
        <CardContent sx={{ p: "24px !important" }}>
          <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
            Evolución Histórica de la Cartera
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

      {/* ================= SECCIÓN INFERIOR: RENDIMIENTO POR ACTIVO REAL ================= */}
      <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
        Rendimiento Detallado por Activo
      </Typography>
      
      <TableContainer component={Card} sx={{ bgcolor: "#15181e", borderColor: "#1c2025", borderRadius: 3, borderStyle: "solid", borderWidth: "1px" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1c2025" }}>
            <TableRow>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }}>Activo</TableCell>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }} align="right">Cant. Nominal</TableCell>
              <TableCell sx={{ color: "#9ca3af", fontWeight: 700, borderBottom: "1px solid #1c2025" }} align="right">Rendimiento ($)</TableCell>
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
                const ticker = activo.ticker || activo.asset_ticker || activo.symbol;
                const cantidad = activo.cantidad || activo.quantity || activo.total_quantity || 0;
                
                const montoRendimiento = parseFloat(activo.rendimientoMonto || activo.performance_amount || 0);
                const porcentajeRendimiento = parseFloat(activo.rendimientoPorcentaje || activo.performance_percentage || 0);
                const esPositivo = montoRendimiento >= 0;

                return (
                  <TableRow 
                    key={ticker} 
                    sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { bgcolor: "#1c2025" } }}
                  >
                    <TableCell component="th" scope="row" sx={{ color: "white", fontWeight: 600, borderBottom: "1px solid #1c2025" }}>
                      {ticker}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white", borderBottom: "1px solid #1c2025" }}>
                      {cantidad}
                    </TableCell>
                    <TableCell align="right" sx={{ color: esPositivo ? "#4caf50" : "#f44336", fontWeight: 600, borderBottom: "1px solid #1c2025" }}>
                      {esPositivo ? `+$${montoRendimiento.toLocaleString("es-AR")}` : `-$${Math.abs(montoRendimiento).toLocaleString("es-AR")}`}
                    </TableCell>
                    <TableCell align="right" sx={{ color: esPositivo ? "#4caf50" : "#f44336", fontWeight: 600, borderBottom: "1px solid #1c2025" }}>
                      {esPositivo ? `+${porcentajeRendimiento}%` : `${porcentajeRendimiento}%`}
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