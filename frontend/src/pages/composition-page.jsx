// src/pages/composition-page.jsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Stack, Divider } from "@mui/material";
import { getAssetComposition } from "../services/portfolio-service";
import PortfolioPieChart from "../components/dashboard/portfolio-pie-chart"; // 👈 Usamos tu componente original
import PieChartIcon from "@mui/icons-material/PieChart";
import NewspaperIcon from "@mui/icons-material/Newspaper";

const COLORS = ["#2196f3", "#9c27b0", "#ff9800", "#f44336", "#00bcd4", "#90a4ae"];

function CompositionPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["assetComposition"],
    queryFn: getAssetComposition,
    refetchOnWindowFocus: true,
  });

  // Query de noticias apuntando al endpoint de Django
  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ["portfolioNews"],
    queryFn: async () => {
      const response = await fetch("http://127.0.0.1:8000/api/portfolio/news/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      });
      if (!response.ok) throw new Error("Error en el servidor de noticias");
      return response.json();
    },
    retry: true,
  });

  // Mapeamos los datos de la API al mismo formato exacto que usa tu PortfolioPieChart
  const chartData = useMemo(() => {
    if (!data?.assets) return [];
    
    return data.assets.map((asset, index) => ({
      id: asset.name,
      label: asset.name,
      value: parseFloat(asset.value.toFixed(2)),
      // Respetamos la paleta de colores del Dashboard original
      color: asset.name === "CASH" ? "#4caf50" : COLORS[index % COLORS.length]
    }));
  }, [data]);

  return (
    <Box sx={{ p: 4, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      {/* CABECERA */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <PieChartIcon sx={{ color: "#9c27b0", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800}>
            Composición de Activos
          </Typography>
        </Stack>
        <Typography variant="body2" color="gray">
          Visualizá la diversificación real y la distribución de tu patrimonio en el simulador.
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#9c27b0" }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ bgcolor: "#2a1215", color: "#ff8a80" }}>
          Error al cargar la composición: {error.message}.
        </Alert>
      )}

      {!isLoading && !isError && data && (
        <Grid container spacing={4}>
          
          {/* ================= SECCIÓN SUPERIOR: DISEÑO HORIZONTAL ESTIRADO ================= */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                bgcolor: "#15181e", 
                border: "1px solid #1c2025", 
                borderRadius: 3, 
                p: 3,
                display: "flex",
                flexDirection: { xs: "column", lg: "row" }, 
                alignItems: "center",
                gap: 4
              }}
            >
              {/* Gráfico Original Identificado al Dashboard */}
              <Box sx={{ width: "100%", maxWidth: 380, display: "flex", justifyContent: "center" }}>
                {chartData.length > 0 && <PortfolioPieChart data={chartData} />}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#1c2025", display: { xs: "none", lg: "block" } }} />

              {/* Lista Detallada Horizontal (Líneas de Activos) */}
              <Box sx={{ flexGrow: 1, width: "100%" }}>
                <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                  Distribución Patrimonial Detallada
                </Typography>
                
                <Grid container spacing={2}>
                  {data.assets.map((asset, index) => {
                    const itemColor = asset.name === "CASH" ? "#4caf50" : COLORS[index % COLORS.length];
                    return (
                      <Grid item xs={12} sm={6} key={asset.name}>
                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ p: 2, bgcolor: "#0b0e11", borderRadius: 2, border: "1px solid #1c2025" }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ width: 12, height: 12, bgcolor: itemColor, borderRadius: "3px" }} />
                            <Stack>
                              <Typography variant="body2" fontWeight={700} color="white">{asset.name}</Typography>
                              <Typography variant="caption" color="gray">
                                {asset.name === "CASH" ? "Efectivo disponible" : "Posición en cuenta "}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack alignItems="flex-end">
                            <Typography variant="body2" fontWeight={700}>
                              ${asset.value.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography variant="caption" sx={{ color: itemColor, fontWeight: 700 }}>
                              {asset.percentage}%
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* ================= SECCIÓN INFERIOR: SECCIÓN AMARILLA DE NOTICIAS ================= */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <NewspaperIcon sx={{ color: "#ff9800", fontSize: 22 }} />
                <Typography variant="h6" fontWeight={700}>
                  Noticias Macroeconómicas y de tus Activos
                </Typography>
              </Stack>

              <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 3, p: 3 }}>
                {newsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={30} sx={{ color: "#ff9800" }} />
                  </Box>
                ) : newsData?.news && newsData.news.length > 0 ? (
                  <Grid container spacing={2}>
                    {newsData.news.map((item, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box 
                          component="a" href={item.link} target="_blank" rel="noopener noreferrer"
                          sx={{ 
                            display: "block", p: 2, bgcolor: "#0b0e11", borderRadius: 2, 
                            border: "1px solid #1c2025", textDecoration: "none",
                            "&:hover": { borderColor: "#ff9800", bgcolor: "#11141a" },
                            transition: "all 0.2s"
                          }}
                        >
                          <Typography variant="caption" color="#ff9800" fontWeight={700} sx={{ display: "block", mb: 0.5 }}>
                            {item.publisher} • {item.related_ticker}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 1, lineBreak: "anywhere" }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="gray">
                            {item.providerPublishTime > 0 
                              ? new Date(item.providerPublishTime * 1000).toLocaleDateString("es-AR") 
                              : "Reciente"}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="gray" textAlign="center" sx={{ py: 2 }}>
                    No se pudieron cargar noticias en este momento. Volvé a intentar en unos minutos.
                  </Typography>
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