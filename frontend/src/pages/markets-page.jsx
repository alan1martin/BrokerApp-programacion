
import { 
  Typography, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Chip,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMarket } from "../context/market-context.jsx";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BoltIcon from "@mui/icons-material/Bolt";

function MarketsPage() {
  const { assets } = useMarket();
  const navigate = useNavigate();

  const handleTradeRedirect = (symbol) => {
    navigate("/trading", { state: { defaultSymbol: symbol } });
  };

  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Mercados Financieros
        </Typography>
        <Typography color="gray" variant="body2">
          Seguimiento de cotizaciones globales en tiempo real con alertas de rendimiento.
        </Typography>
      </Stack>

      <TableContainer component={Paper} sx={{ backgroundColor: "#15181e", borderRadius: 2 }}>
        <Table aria-label="tabla de mercados">
          <TableHead sx={{ backgroundColor: "#1e222b" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "gray" }}>ACTIVO</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "gray" }}>NOMBRE</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">PRECIO (USD)</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">VAR. 24H</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "gray" }} align="center">MERCADO</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "gray" }} align="center">ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const isPositive = asset.change24h >= 0;
              
              return (
                <TableRow 
                  key={asset.symbol}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: "#1c202a" } }}
                >
                  {/* Ticker */}
                  <TableCell component="th" scope="row" sx={{ fontWeight: 700, color: "white" }}>
                    {asset.symbol}
                  </TableCell>
                  
                  {/* Nombre */}
                  <TableCell sx={{ color: "#8a94a6" }}>
                    {asset.name}
                  </TableCell>
                  
                  {/* Precio Dinámico */}
                  <TableCell align="right" sx={{ fontWeight: 700, color: isPositive ? "success.main" : "error.main", fontSize: "1.05rem" }}>
                    ${asset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  
                  {/* Variación 24h con Color e Ícono */}
                  <TableCell align="right">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, color: isPositive ? "success.main" : "error.main", fontWeight: 700 }}>
                      {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                      {isPositive ? "+" : ""}{asset.change24h}%
                    </Box>
                  </TableCell>
                  
                  {/* Chip */}
                  <TableCell align="center">
                    <Chip 
                      label={asset.symbol === "BTC" ? "24/7 Vivo" : "Wall Street"} 
                      color={asset.symbol === "BTC" ? "warning" : "default"}
                      size="small"
                      sx={{ fontWeight: 600, borderRadius: 1 }}
                    />
                  </TableCell>

                  {/* Operar */}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color={isPositive ? "primary" : "inherit"}
                      size="small"
                      startIcon={<BoltIcon />}
                      onClick={() => handleTradeRedirect(asset.symbol)}
                      sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5, px: 2 }}
                    >
                      Operar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default MarketsPage;
