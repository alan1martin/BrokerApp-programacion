// src/pages/market-page.jsx
import { useState, useEffect } from "react";
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
  Box,
  IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMarket } from "../context/market-context.jsx";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BoltIcon from "@mui/icons-material/Bolt";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

// Servicios de la API
import { getFavorites, toggleFavorite } from "../services/market-service";

function MarketsPage() {
  const { assets } = useMarket();
  const navigate = useNavigate();
  
  // Sincronizamos el estado inicial directamente con localStorage por las dudas
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("peak_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Intentar cargar favoritos desde SQLite al montar. Si falla, el fallback de localStorage ya está listo.
  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites();
        if (data && Array.isArray(data)) {
          setFavorites(data);
          localStorage.setItem("peak_favorites", JSON.stringify(data));
        }
      } catch (error) {
        console.warn("API SQLite no disponible. Usando datos guardados en localStorage local.");
      }
    }
    loadFavorites();
  }, []);

  const handleTradeRedirect = (symbol) => {
    navigate("/trading", { state: { defaultSymbol: symbol } });
  };

  // Handler interactivo optimizado con persistencia local garantizada
  const handleToggleFavorite = async (symbol) => {
    const isCurrentlyFav = favorites.includes(symbol);
    
    // Calculamos el próximo estado
    const nextFavorites = isCurrentlyFav 
      ? favorites.filter((fav) => fav !== symbol) 
      : [...favorites, symbol];

    // 1. Actualizamos el estado de React y localStorage de inmediato para asegurar persistencia local
    setFavorites(nextFavorites);
    localStorage.setItem("peak_favorites", JSON.stringify(nextFavorites));

    // 2. Intentamos impactar en SQLite en segundo plano
    try {
      await toggleFavorite(symbol);
    } catch (error) {
      console.error("No se pudo persistir en la base de datos remota, guardado localmente en navegador:", error.message);
    }
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
              <TableCell sx={{ fontWeight: 600, color: "gray", width: 60 }} align="center">FAV</TableCell>
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
              const isFav = favorites.includes(asset.symbol);
              
              return (
                <TableRow 
                  key={asset.symbol}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: "#1c202a" } }}
                >
                  {/* Columna de la estrella de Favoritos */}
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleToggleFavorite(asset.symbol)}
                      sx={{ color: isFav ? "#ffb703" : "#475569", "&:hover": { color: "#ffb703" } }}
                    >
                      {isFav ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </TableCell>

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
                    <Box>
                      <Chip 
                        label={asset.symbol === "BTC" ? "24/7 Vivo" : "Wall Street"} 
                        color={asset.symbol === "BTC" ? "warning" : "default"}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                      />
                    </Box>
                  </TableCell>

                  {/* Operar */}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<BoltIcon />}
                      onClick={() => handleTradeRedirect(asset.symbol)}
                      sx={{ 
                        fontWeight: 700, 
                        textTransform: "none", 
                        borderRadius: 1.5, 
                        px: 2
                      }}
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