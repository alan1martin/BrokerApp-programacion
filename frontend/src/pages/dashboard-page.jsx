import { Grid, Stack, Typography } from "@mui/material";

import StatsCards from "../components/dashboard/stats-cards";
import MarketChart from "../components/dashboard/market-chart";
import Watchlist from "../components/dashboard/watchlist";
import PortfolioAllocation from "../components/dashboard/portfolio-allocation";
import RecentTransactions from "../components/dashboard/recent-transactions";

import { useMarketData } from "../hooks/use-market-data";

function DashboardPage() {
const { data, isLoading } = useMarketData();

return ( <Stack spacing={4}> <Typography variant="h4" fontWeight={700}>
Dashboard </Typography>

  <Typography color="gray">
    {isLoading
      ? "Loading backend..."
      : data?.mensaje}
  </Typography>

  <StatsCards />

  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 8 }}>
      <MarketChart />
    </Grid>

    <Grid size={{ xs: 12, lg: 4 }}>
      <Watchlist />
    </Grid>
  </Grid>

  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 6 }}>
      <PortfolioAllocation />
    </Grid>

    <Grid size={{ xs: 12, lg: 6 }}>
      <Watchlist />
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
