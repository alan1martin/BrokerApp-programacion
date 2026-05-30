import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from "@mui/material";

import { ResponsivePie } from "@nivo/pie";

// Paleta de colores para los activos
const COLORS = [
  "#00c853", // Verde
  "#2962ff", // Azul
  "#ffab00", // Amarillo/Naranja
  "#ff5252", // Rojo
  "#9c27b0", // Violeta
];

// ➔ RECIBIMOS LAS POSICIONES REALES DESDE LOS PROPS
function PortfolioAllocation({ positions = [] }) {
  
  // 1. Calculamos el costo total general del portfolio para sacar los porcentajes
  const totalPortfolioCost = positions.reduce((acc, pos) => acc + parseFloat(pos.total_cost || 0), 0);

  // 2. Transformamos las posiciones de Django al formato que le gusta a @nivo/pie
  const chartData = positions.map((pos) => {
    // Sacamos el porcentaje que representa este activo sobre el total
    const percentage = totalPortfolioCost > 0 
      ? ((parseFloat(pos.total_cost) / totalPortfolioCost) * 100)
      : 0;

    return {
      id: pos.symbol,
      label: pos.symbol,
      // Guardamos el valor redondeado para el gráfico
      value: parseFloat(percentage.toFixed(2)), 
      // Guardamos también el costo real para mostrar si quisiéramos en el tooltip
      realCost: parseFloat(pos.total_cost),
    };
  });

  // Resguardo por si el portfolio está completamente vacío (evita que nivo tire error)
  const finalData = chartData.length > 0 
    ? chartData 
    : [{ id: "Sin activos", label: "Sin activos", value: 100 }];

  const finalColors = chartData.length > 0 ? COLORS : ["#333"];

  return (
    <Card
      sx={{
        backgroundColor: "#15181e",
        height: 400,
        overflowY: "auto", // Por si el usuario junta muchas acciones distintas
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          fontWeight={600}
        >
          Portfolio Allocation
        </Typography>

        <Box sx={{ height: 220 }}>
          <ResponsivePie
            data={finalData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
            innerRadius={0.7}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={finalColors}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            theme={{
              tooltip: {
                container: {
                  background: "#15181e",
                  color: "#fff",
                },
              },
            }}
          />
        </Box>

        <Stack spacing={2} mt={2}>
          {chartData.length === 0 ? (
            <Typography color="gray" variant="body2" textAlign="center">
              No hay datos de distribución disponibles.
            </Typography>
          ) : (
            chartData.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: COLORS[index % COLORS.length], // Evita romper si hay más de 5 activos
                    }}
                  />

                  <Typography fontWeight={500}>
                    {item.label}
                  </Typography>
                </Box>

                <Typography fontWeight={700}>
                  {item.value}%
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default PortfolioAllocation;