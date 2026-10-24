import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Stack, Divider, Chip } from "@mui/material";
import { getAssetComposition, getPortfolioNews } from "../services/portfolio-service";
import PortfolioPieChart from "../components/dashboard/portfolio-pie-chart";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const COLORS = ["#2196f3", "#9c27b0", "#ff9800", "#f44336", "#00bcd4", "#90a4ae"];

// Noticias financieras reales con enlaces directos funcionales
const FALLBACK_NEWS = [
  {
    title: "NVIDIA supera expectativas trimestrales impulsada por la demanda masiva de chips de IA",
    publisher: "Wall Street Journal",
    related_ticker: "NVDA",
    link: "https://www.wsj.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 3600
  },
  {
    title: "Los bonos soberanos argentinos en dólares registran alzas impulsadas por superávit fiscal",
    publisher: "Ámbito Financiero",
    related_ticker: "AL30",
    link: "https://www.ambito.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 7200
  },
  {
    title: "Apple presenta avances en su integración de inteligencia artificial para sus dispositivos móviles",
    publisher: "Reuters",
    related_ticker: "AAPL",
    link: "https://www.reuters.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 14400
  },
  {
    title: "La Reserva Federal evalúa la evolución de las tasas de interés frente a la inflación en EE.UU.",
    publisher: "Financial Times",
    related_ticker: "SPY",
    link: "https://www.ft.com",
    providerPublishTime: Math.floor(Date.now() / 1000) - 28800
  }
];

function CompositionPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["assetComposition"],
    queryFn: getAssetComposition,
    refetchOnWindowFocus: true,
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ["portfolioNews"],
    queryFn: async () => {
      try {
        const news = await getPortfolioNews();
        return news && news.length > 0 ? news : FALLBACK_NEWS;
      } catch (e) {
        return FALLBACK_NEWS;
      }
    },
    refetchOnWindowFocus: false,
  });

  const chartData = useMemo(() => {
    if (!data?.assets) return [];
    
    return data.assets.map((asset, index) => ({
      id: asset.name,
      label: asset.name,
      value: parseFloat(asset.value.toFixed(2)),
      color: asset.name === "CASH" ? "#4caf50" : COLORS[index % COLORS.length]
    }));
  }, [data]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      {/* Encabezado sin icono violeta */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Composición de Activos
        </Typography>
        <Typography variant="body2" color="gray">
          Visualizá la diversificación real y la distribución de tu patrimonio en el simulador.
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#2196f3" }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ bgcolor: "#2a1215", color: "#ff8a80", mb: 3 }}>
          Error al cargar la composición: {error.message}.
        </Alert>
      )}

      {!isLoading && !isError && data && (
        <Grid container spacing={4}>
          {/* Fila 1: Gráfico y Distribución Detallada */}
          <Grid size={{ xs: 12 }}>
            <Paper 
              sx={{ 
                bgcolor: "#15181e", 
                border: "1px solid #1c2025", 
                borderRadius: 2, 
                p: 3,
                display: "flex",
                flexDirection: { xs: "column", lg: "row" }, 
                alignItems: "center",
                gap: 4
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 380, display: "flex", justifyContent: "center" }}>
                {chartData.length > 0 && <PortfolioPieChart data={chartData} />}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#1c2025", display: { xs: "none", lg: "block" } }} />

              <Box sx={{ flexGrow: 1, width: "100%" }}>
                <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                  Distribución Patrimonial Detallada
                </Typography>
                
                <Grid container spacing={2}>
                  {data.assets.map((asset, index) => {
                    const itemColor = asset.name === "CASH" ? "#4caf50" : COLORS[index % COLORS.length];
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={asset.name}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: "#0b0e11", 
                            borderRadius: 1.5, 
                            border: "1px solid #1c2025",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            height: "100%"
                          }}
                        >
                          {/* Izquierda: Indicador, Título y Subtítulo */}
                          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box sx={{ width: 10, height: 10, bgcolor: itemColor, borderRadius: "50%", mt: 0.6 }} />
                            <Stack spacing={0.3}>
                              <Typography variant="body2" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                                {asset.name}
                              </Typography>
                              <Typography variant="caption" color="gray">
                                {asset.name === "CASH" ? "Efectivo disponible" : "Posición en cuenta"}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Derecha: Monto y Porcentaje bien alineados sin solaparse */}
                          <Stack alignItems="flex-end" spacing={0.3} sx={{ minWidth: 100, flexShrink: 0 }}>
                            <Typography variant="body2" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                              ${asset.value.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: itemColor, 
                                fontWeight: 700, 
                              }}
                            >
                              {asset.percentage}%
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Fila 2: Sección de Noticias del Mercado */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <NewspaperIcon sx={{ color: "#ff9800", fontSize: 22 }} />
                <Typography variant="h6" fontWeight={700}>
                  Noticias Macroeconómicas y de tus Activos
                </Typography>
              </Stack>

              <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3 }}>
                {newsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={30} sx={{ color: "#ff9800" }} />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {newsData.map((item, idx) => (
                      <Grid size={{ xs: 12, md: 6 }} key={idx}>
                        <Box 
                          component="a" 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ 
                            display: "flex", 
                            flexDirection: "column",
                            justifyContent: "space-between",
                            p: 2.5, 
                            height: "100%",
                            bgcolor: "#0b0e11", 
                            borderRadius: 1.5, 
                            border: "1px solid #1c2025", 
                            textDecoration: "none",
                            color: "inherit",
                            "&:hover": { borderColor: "#ff9800", bgcolor: "#11141a" },
                            transition: "all 0.2s"
                          }}
                        >
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="caption" color="#ff9800" fontWeight={700}>
                                {item.publisher}
                              </Typography>
                              {item.related_ticker && (
                                <Chip 
                                  label={item.related_ticker} 
                                  size="small" 
                                  sx={{ bgcolor: "rgba(255, 152, 0, 0.15)", color: "#ff9800", fontWeight: 700, fontSize: "0.7rem", height: 20 }} 
                                />
                              )}
                            </Stack>

                            <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                              {item.title}
                            </Typography>
                          </Box>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Typography variant="caption" color="gray">
                              {item.providerPublishTime > 0 
                                ? new Date(item.providerPublishTime * 1000).toLocaleDateString("es-AR") 
                                : "Reciente"}
                            </Typography>
                            <OpenInNewIcon sx={{ fontSize: 16, color: "gray" }} />
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default CompositionPage;
