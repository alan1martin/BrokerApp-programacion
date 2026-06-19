// src/pages/favorites-page.jsx
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

// Servicios de la API
import { getFavorites, toggleFavorite } from "../services/market-service";

function FavoritesPage() {
  const { assets } = useMarket();
  const navigate = useNavigate();
  
  // Sincronizamos el estado inicial directamente con el localStorage para evitar el delay
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("peak_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Cargar/Sincronizar favoritos desde SQLite al montar
  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites();
        if (data && Array.isArray(data)) {
          setFavorites(data);
          localStorage.setItem("peak_favorites", JSON.stringify(data));
        }
      } catch (error) {
        console.warn("API SQLite no disponible en Favoritos. Usando datos de localStorage.");
      }
    }
    loadFavorites();
  }, []);

  const handleTradeRedirect = (symbol) => {
    navigate("/trading", { state: { defaultSymbol: symbol } });
  };

  // Al quitar de favoritos, actualizamos localmente y disparamos la petición de fondo
  const handleRemoveFavorite = async (symbol) => {
    const nextFavorites = favorites.filter((fav) => fav !== symbol);
    
    // 1. Mutamos el estado y persistimos en localStorage inmediatamente
    setFavorites(nextFavorites);
    localStorage.setItem("peak_favorites", JSON.stringify(nextFavorites));

    // 2. Intentamos avisarle a la base de datos
    try {
      await toggleFavorite(symbol);
    } catch (error) {
      console.error("No se pudo eliminar de la BD en segundo plano:", error.message);
    }
  };

  // Filtramos los activos globales para mostrar SOLO los que están en favoritos
  const favoriteAssets = assets.filter((asset) => favorites.includes(asset.symbol));

  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Mis Favoritos
        </Typography>
        <Typography color="gray" variant="body2">
          Tu lista de seguimiento personalizada. Hacé clic en la estrella para remover cualquier activo.
        </Typography>
      </Stack>

      {favoriteAssets.length === 0 ? (
        <Paper sx={{ backgroundColor: "#15181e", p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography color="gray" variant="body1">
            No tenés activos agregados a tus favoritos todavía.
          </Typography>
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => navigate("/markets")} 
            sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
          >
            Ir al panel de cotizaciones
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: "#15181e", borderRadius: 2 }}>
          <Table aria-label="tabla de favoritos">
            <TableHead sx={{ backgroundColor: "#1e222b" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "gray", width: 60 }} align="center">QUITAR</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }}>ACTIVO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }}>NOMBRE</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">PRECIO (USD)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">VAR. 24H</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="center">MERCADO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="center">ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {favoriteAssets.map((asset) => {
                const isPositive = asset.change24h >= 0;
                
                return (
                  <TableRow 
                    key={asset.symbol}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: "#1c202a" } }}
                  >
                    {/* Botón para remover de favoritos */}
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleRemoveFavorite(asset.symbol)}
                        sx={{ color: "#ffb703" }}
                      >
                        <StarIcon />
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
                    
                    {/* Precio */}
                    <TableCell align="right" sx={{ fontWeight: 700, color: isPositive ? "success.main" : "error.main", fontSize: "1.05rem" }}>
                      ${asset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    
                    {/* Variación */}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, color: isPositive ? "success.main" : "error.main", fontWeight: 700 }}>
                        {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        {isPositive ? "+" : ""}{asset.change24h}%
                      </Box>
                    </TableCell>
                    
                    {/* Chip de Mercado */}
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

                    {/* Botón Operar */}
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
      )}
    </Stack>
  );
}

export default FavoritesPage;