import { useState, useMemo } from "react";
import { Box, Typography, Paper, Grid, Stack, Slider, TextField, InputAdornment, Divider } from "@mui/material";
import Chart from "react-apexcharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

function WealthProjectionPage() {
  // Estados para los controles de proyección
  const [initialCapital, setInitialCapital] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(10); // 10% anual estimado

  // Cálculo matemático del Interés Compuesto mes a mes
  const projectionData = useMemo(() => {
    const months = years * 12;
    const monthlyRate = annualRate / 100 / 12;
    
    let currentTotal = initialCapital;
    let totalInvested = initialCapital;

    const categories = [];
    const portfolioValues = [];
    const investedValues = [];

    // Tomar puntos anuales o mensuales clave para el gráfico
    for (let m = 0; m <= months; m++) {
      if (m === 0 || m % 12 === 0 || m === months) {
        const yearLabel = `Año ${m / 12}`;
        categories.push(yearLabel);
        portfolioValues.push(Math.round(currentTotal));
        investedValues.push(Math.round(totalInvested));
      }

      // Proyectar siguiente mes
      currentTotal = (currentTotal + monthlyContribution) * (1 + monthlyRate);
      totalInvested += monthlyContribution;
    }

    return {
      categories,
      portfolioValues,
      investedValues,
      finalAmount: Math.round(currentTotal),
      totalContributions: Math.round(totalInvested),
      totalInterest: Math.round(currentTotal - totalInvested)
    };
  }, [initialCapital, monthlyContribution, years, annualRate]);

  // Configuración del Gráfico de Líneas/Áreas con ApexCharts
  const chartOptions = {
    chart: {
      type: "area",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: [3, 2] },
    colors: ["#2196f3", "#90a4ae"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: projectionData.categories,
      labels: { style: { colors: "gray", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: "gray", fontSize: "11px" },
        formatter: (val) => `$${val.toLocaleString("es-AR")}`
      }
    },
    grid: {
      borderColor: "#1c2025",
      strokeDashArray: 4
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `$${val.toLocaleString("es-AR")}`
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "white" }
    }
  };

  const chartSeries = [
    { name: "Patrimonio Proyectado", data: projectionData.portfolioValues },
    { name: "Capital Aportado", data: projectionData.investedValues }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          {/* <TrendingUpIcon sx={{ color: "#9c27b0", fontSize: 28 }} /> */}
          <Typography variant="h4" fontWeight={800}>
            Proyección Patrimonial
          </Typography>
        </Stack>
        <Typography variant="body2" color="gray">
          Analizá el crecimiento a largo plazo de tu capital mediante el efecto del interés compuesto y aportes periódicos.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Panel Izquierdo: Controles de Parámetros */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 3 }}>
              Parámetros de Cálculo
            </Typography>

            <Stack spacing={3}>
              {/* Capital Inicial */}
              <Box>
                <Typography variant="body2" color="gray" sx={{ mb: 1 }}>Capital Inicial ($ USD/ARS)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AccountBalanceIcon sx={{ color: "gray", fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />
              </Box>

              {/* Aporte Mensual */}
              <Box>
                <Typography variant="body2" color="gray" sx={{ mb: 1 }}>Aporte Periódico Mensual</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SavingsIcon sx={{ color: "gray", fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />
              </Box>

              {/* Horizonte Temporal (Años) */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="gray">Horizonte Temporal</Typography>
                  <Typography variant="body2" fontWeight={700} color="#2196f3">{years} Años</Typography>
                </Stack>
                <Slider
                  value={years}
                  min={1}
                  max={30}
                  step={1}
                  onChange={(e, val) => setYears(val)}
                  sx={{ color: "#2196f3" }}
                />
              </Box>

              {/* Tasa Anual Estimada */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="gray">Retorno Anual Estimado</Typography>
                  <Typography variant="body2" fontWeight={700} color="#4caf50">{annualRate}%</Typography>
                </Stack>
                <Slider
                  value={annualRate}
                  min={1}
                  max={35}
                  step={0.5}
                  onChange={(e, val) => setAnnualRate(val)}
                  sx={{ color: "#4caf50" }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Panel Derecho: Gráfico y Métricas Resumen */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Tarjetas de Resultados Clave */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5 }}>
                  <Typography variant="caption" color="gray">Patrimonio Final</Typography>
                  <Typography variant="h6" fontWeight={800} color="white" sx={{ mt: 0.5 }}>
                    ${projectionData.finalAmount.toLocaleString("es-AR")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5 }}>
                  <Typography variant="caption" color="gray">Total Aportado</Typography>
                  <Typography variant="h6" fontWeight={800} color="#90a4ae" sx={{ mt: 0.5 }}>
                    ${projectionData.totalContributions.toLocaleString("es-AR")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5 }}>
                  <Typography variant="caption" color="gray">Interés Generado</Typography>
                  <Typography variant="h6" fontWeight={800} color="#4caf50" sx={{ mt: 0.5 }}>
                    +${projectionData.totalInterest.toLocaleString("es-AR")}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Contenedor del Gráfico Línea/Área */}
            <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                Evolución Temporal del Capital
              </Typography>
              <Box sx={{ width: "100%", height: 350 }}>
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WealthProjectionPage;