
import { Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getPortfolio } from "../services/portfolio-service";
import StatsCards from "../components/dashboard/stats-cards";
import MarketChart from "../components/dashboard/market-chart";
import Watchlist from "../components/dashboard/watchlist";
import PortfolioAllocation from "../components/dashboard/portfolio-allocation";
import RecentTransactions from "../components/dashboard/recent-transactions";

import { useMarketData } from "../hooks/use-market-data";

function DashboardPage() {
  const { data, isLoading } = useMarketData();
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await getPortfolio();
        console.log("PORTFOLIO COMPLETO:", data); 
        setPortfolio(data);
      } catch (error) {
        console.error("Error loading portfolio:", error);
      }
    }

    loadPortfolio();
  }, []);

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>
        Dashboard
      </Typography>

      <Typography color="gray">
        {isLoading ? "Loading backend..." : data?.mensaje}
      </Typography>
      
      {/* Contenedor con los dos balances económicos reales */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
        <Typography variant="h6" color="success.main" fontWeight={600}>
          Valor Total del Portfolio: ${portfolio ? parseFloat(portfolio.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "Cargando..."}
        </Typography> 
        
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Efectivo Disponible (Cash): ${portfolio ? parseFloat(portfolio.cash_balance).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "Cargando..."}
        </Typography> 
      </Stack>
      
      {/* Renderizamos las StatsCards si el portfolio ya cargó */}
      {portfolio ? <StatsCards totalValue={portfolio.total_value} /> : <Typography>Cargando tarjetas...</Typography>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <MarketChart />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Watchlist title="Market Watchlist" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          {/* Gráfico de torta mapeado con las posiciones reales */}
          {portfolio ? (
            <PortfolioAllocation positions={portfolio.positions} />
          ) : (
            <Typography>Cargando distribución...</Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Watchlist 
            title="Mis Posiciones Reales" 
            positions={portfolio?.positions || []} 
            isRealPortfolio={true} 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          {/* El historial real que conectamos en la fase anterior */}
          <RecentTransactions />
        </Grid>
      </Grid>
    </Stack>
  ); 
} 

export default DashboardPage;
