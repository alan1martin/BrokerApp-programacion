import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from "@mui/material";

// Datos ficticios que usará el Watchlist común de mercado
const defaultStocks = [
  { symbol: "AAPL", price: "$214.32", change: "+1.23%" },
  { symbol: "TSLA", price: "$189.44", change: "-2.11%" },
  { symbol: "NVDA", price: "$901.11", change: "+4.92%" },
  { symbol: "AMZN", price: "$182.55", change: "+0.44%" },
];

// Recibimos los props para adaptarlo dinámicamente
function Watchlist({ title = "Watchlist", positions = [], isRealPortfolio = false }) {
  
  // Si es el portfolio real, usamos los datos de Django. Si no, las acciones por defecto.
  const displayItems = isRealPortfolio ? positions : defaultStocks;

  return (
    <Card
      sx={{
        backgroundColor: "#15181e",
        height: 400,
        overflowY: "auto" // Por si tenés muchas posiciones, agrega scroll prolijo
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>

        <Stack spacing={3} mt={3}>
          {/* Si está cargando el portfolio real y está vacío, muestra un aviso */}
          {isRealPortfolio && displayItems.length === 0 && (
            <Typography color="gray" variant="body2">
              No tenés posiciones activas en tu cuenta.
            </Typography>
          )}

          {displayItems.map((item, index) => {
            // Evaluamos si mapeamos campos de Django o los estáticos
            const symbol = item.symbol;
            const line2 = isRealPortfolio 
              ? `Cant: ${parseFloat(item.quantity).toFixed(2)}`  // Ej: Cant: 10.00 o Cant: 0.50
              : item.price;
            
            const rightColumn = isRealPortfolio 
              ? `Avg: $${parseFloat(item.average_price).toLocaleString()}` // Ej: Avg: $175.5
              : item.change;

            return (
              <Box
                key={isRealPortfolio ? item.id : symbol + index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Box>
                  <Typography fontWeight={700}>
                    {symbol}
                  </Typography>
                  <Typography color="gray" variant="body2">
                    {line2}
                  </Typography>
                </Box>

                {/* Para el portfolio real mostramos el precio promedio en gris, para mercado el % en color */}
                <Typography
                  fontWeight={500}
                  color={
                    isRealPortfolio 
                      ? "text.secondary" 
                      : (rightColumn.includes("-") ? "error.main" : "success.main")
                  }
                >
                  {rightColumn}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default Watchlist;