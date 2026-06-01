import { Grid, Typography, Stack, Card, CardContent, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useMarket } from "../context/market-context.jsx";
import { getPortfolio, getTransactionHistory } from "../services/portfolio-service";
import PortfolioPieChart from "../components/dashboard/portfolio-pie-chart";
import PortfolioValueChart from "../components/dashboard/portfolio-value-chart"; // 🎯 Importamos el nuevo gráfico lineal
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { getAssetLogo } from "../utils/get-logo";

function DashboardPage() {
  const { assets, loadingMarket } = useMarket();
  const [portfolioData, setPortfolioData] = useState(null);
  const [historyArray, setHistoryArray] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [portfolioRes, historyRes] = await Promise.all([
          getPortfolio(),
          getTransactionHistory()
        ]);
        
        setPortfolioData(portfolioRes);
        setHistoryArray(historyRes);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading || loadingMarket) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalValue = portfolioData?.total_value ?? 0;
  const stocksArray = portfolioData?.positions ?? [];

  const stocksValue = stocksArray.reduce((total, stock) => {
    const marketAsset = assets?.find(a => a.symbol === stock.symbol);
    const currentPrice = marketAsset ? marketAsset.currentPrice : parseFloat(stock.average_price || 0);
    return total + (parseFloat(stock.quantity) * currentPrice);
  }, 0);

  const cash = portfolioData?.cash ?? (totalValue - stocksValue > 0 ? totalValue - stocksValue : 2720.71);

  const chartData = [
    { id: "Efectivo", label: "Efectivo", value: parseFloat(cash.toFixed(2)), color: "#4caf50" }
  ];

  stocksArray.forEach((stock, index) => {
    const marketAsset = assets?.find(a => a.symbol === stock.symbol);
    const price = marketAsset ? marketAsset.currentPrice : parseFloat(stock.average_price || 0);
    const value = parseFloat((parseFloat(stock.quantity) * price).toFixed(2));
    
    if (value > 0) {
      chartData.push({
        id: stock.symbol,
        label: stock.symbol,
        value: value,
        color: ["#2196f3", "#9c27b0", "#ff9800", "#f44336"][index % 4]
      });
    }
  });

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>Dashboard Principal</Typography>

      {/* FILA 1: Métricas Principales */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#15181e" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, backgroundColor: "rgba(33, 150, 243, 0.1)", borderRadius: 2, display: "flex" }}>
                  <AccountBalanceWalletIcon color="primary" />
                </Box>
                <Typography color="gray" fontWeight={600}>Patrimonio Total</Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#15181e" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, backgroundColor: "rgba(76, 175, 80, 0.1)", borderRadius: 2, display: "flex" }}>
                  <ShowChartIcon color="success" />
                </Box>
                <Typography color="gray" fontWeight={600}>Efectivo Disponible</Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>
                ${cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ backgroundColor: "#15181e" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, backgroundColor: "rgba(156, 39, 176, 0.1)", borderRadius: 2, display: "flex" }}>
                  <ShowChartIcon color="secondary" />
                </Box>
                <Typography color="gray" fontWeight={600}>Total Invertido</Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>
                ${stocksValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILA 2: Gráficos de Rendimiento y Distribución */}
      <Grid container spacing={3}>
        {/* Gráfico de Evolución Patrimonial Lineal */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ backgroundColor: "#15181e", p: 2, height: "100%", minHeight: 380 }}>
            <Typography variant="h6" fontWeight={700} sx={{ ml: 2 }}>Evolución del Portfolio</Typography>
            <PortfolioValueChart totalValue={totalValue} />
          </Card>
        </Grid>

        {/* Gráfico de Torta */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ backgroundColor: "#15181e", p: 2, height: "100%", minHeight: 380 }}>
            <Typography variant="h6" fontWeight={700} sx={{ ml: 2, mb: 1 }}>Distribución de Activos</Typography>
            <PortfolioPieChart data={chartData} />
          </Card>
        </Grid>
      </Grid>

      {/* FILA 3: Historial Reciente de Transacciones */}
      <Card sx={{ backgroundColor: "#15181e", p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ ml: 2, mb: 2 }}>Historial Reciente</Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: "transparent", backgroundImage: "none", boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "gray", fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ color: "gray", fontWeight: 700 }}>Activo</TableCell>
                <TableCell sx={{ color: "gray", fontWeight: 700 }}>Tipo</TableCell>
                <TableCell align="right" sx={{ color: "gray", fontWeight: 700 }}>Cantidad</TableCell>
                <TableCell align="right" sx={{ color: "gray", fontWeight: 700 }}>Precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyArray.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: "gray", py: 3 }}>
                    No realizaste ninguna operación todavía.
                  </TableCell>
                </TableRow>
              ) : (
                historyArray.slice(0, 5).map((tx, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "gray" }}>{new Date(tx.timestamp || tx.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar 
                          src={getAssetLogo(tx.symbol)} 
                          alt={tx.symbol}
                          sx={{ 
                            width: 26, 
                            height: 26, 
                            backgroundColor: "#1c2025", 
                            border: "1px solid #2d3748", 
                            overflow: "hidden",
                            borderRadius: "50%",
                            p: 0.2,
                            "& .MuiAvatar-img": {
                              objectFit: "contain",
                              borderRadius: "50%"
                            }
                          }} 
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {tx.symbol}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: tx.transaction_type === "BUY" ? "success.main" : "error.main" 
                    }}>
                      {tx.transaction_type === "BUY" ? "COMPRA" : "VENTA"}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "white" }}>{parseFloat(tx.quantity).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>
                      ${parseFloat(tx.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}

export default DashboardPage;