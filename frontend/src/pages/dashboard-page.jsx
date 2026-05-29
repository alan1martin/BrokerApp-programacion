
import { Grid, Stack, Typography } from "@mui/material";

import StatsCards from "../components/dashboard/stats-cards";
import MarketChart from "../components/dashboard/market-chart";
import Watchlist from "../components/dashboard/watchlist";

function DashboardPage() {
return ( <Stack spacing={4}> <Typography variant="h4" fontWeight={700}>
Dashboard </Typography>

  <StatsCards />

  <Grid container spacing={3}>
    <Grid item xs={12} lg={8}>
      <MarketChart />
    </Grid>

    <Grid item xs={12} lg={4}>
      <Watchlist />
    </Grid>
  </Grid>
</Stack>

);
}

export default DashboardPage;
