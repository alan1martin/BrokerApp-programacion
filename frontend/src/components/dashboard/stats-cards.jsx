
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";

// ➔ RECIBIMOS EL PROP totalValue ACÁ:
function StatsCards({ totalValue }) {
  
  // Formateamos el valor dinámico si ya cargó, si no ponemos un mensaje de carga
  const formattedPortfolioValue = totalValue 
    ? `$${parseFloat(totalValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "Cargando...";

  // Estos datos siguen fijos por ahora, pero el primero ya mira a nuestra variable dinámica
  const stats = [
    {
      title: "Portfolio Value",
      value: formattedPortfolioValue, // ➔ AHORA ES DINÁMICO
      change: "+2.45%",
    },
    {
      title: "Today's Profit",
      value: "+$2,340",
      change: "+1.12%",
    },
    {
      title: "Open Positions",
      value: "18",
      change: "+4",
    },
    {
      title: "Cash Balance",
      value: "$12,400",
      change: "-0.32%",
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((item) => (
        <Grid size={{ xs: 12, md: 6, lg: 3 }} key={item.title}>
          <Card
            sx={{
              backgroundColor: "#15181e",
            }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Typography color="gray">
                  {item.title}
                </Typography>

                <Typography variant="h5" fontWeight={700}>
                  {item.value}
                </Typography>

                <Typography
                  color={
                    item.change.includes("-")
                      ? "error.main"
                      : "success.main"
                  }
                >
                  {item.change}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default StatsCards;
