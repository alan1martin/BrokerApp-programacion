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
        console.log("PORTFOLIO COMPLETO:", data); // Vas a ver que acá adentro viene data.positions 🎉
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
    
    <Typography variant="h6" color="success.main" fontWeight={600}>
      Portfolio Value: ${portfolio?.total_value ?? "Loading..."}
    </Typography>    
    
    {/* ➔ CAMBIO 1: Solo renderizamos las StatsCards si portfolio ya no es null */}
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
        {/* ➔ CAMBIO 2: Solo renderizamos la torta si portfolio ya tiene las posiciones */}
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
        <RecentTransactions />
      </Grid>
    </Grid>
  </Stack>
);
}
export default DashboardPage;
