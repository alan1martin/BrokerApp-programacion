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
  IconButton,
  Autocomplete,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMarket } from "../context/market-context.jsx";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BoltIcon from "@mui/icons-material/Bolt";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../components/layout/page-header";

// Servicios de la API
import { getFavorites, toggleFavorite, searchAssets } from "../services/market-service";

// Tarjetas de acceso rápido de los activos estrella
const POPULAR_TICKERS = [
  { ticker: "NVDA", name: "NVIDIA Corp" },
  { ticker: "AAPL", name: "Apple Inc" },
  { ticker: "TSLA", name: "Tesla Inc" },
  { ticker: "MSFT", name: "Microsoft Corp" },
  { ticker: "AMZN", name: "Amazon.com Inc" },
  { ticker: "SPY",  name: "S&P 500 ETF" }
];

function MarketsPage() {
  const { assets } = useMarket();
  const navigate = useNavigate();

  // Estados del Buscador
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // Sincronizamos el estado inicial directamente con localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("peak_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Intentar cargar favoritos desde SQLite al montar. Fallback local listo.
  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites();
        if (data && Array.isArray(data)) {
          setFavorites(data);
          localStorage.setItem("peak_favorites", JSON.stringify(data));
        }
      } catch {
        console.warn("API SQLite no disponible. Usando datos guardados en localStorage local.");
      }
    }
    loadFavorites();
  }, []);

  // Buscador con Debounce de 250ms hacia la API de Django
  useEffect(() => {
    let active = true;

    const fetchResults = async () => {
      setLoadingSearch(true);
      try {
        const data = await searchAssets(inputValue);
        if (active) {
          setOptions(data.results || []);
        }
      } catch (err) {
        console.error("Error buscando activos en el backend:", err);
      } finally {
        if (active) setLoadingSearch(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleTradeRedirect = (symbol) => {
    navigate("/trading", { state: { defaultSymbol: symbol } });
  };

  // Handler interactivo optimizado con persistencia local garantizada
  const handleToggleFavorite = async (symbol) => {
    const isCurrentlyFav = favorites.includes(symbol);
    
    const nextFavorites = isCurrentlyFav 
      ? favorites.filter((fav) => fav !== symbol) 
      : [...favorites, symbol];

    // 1. Actualizamos el estado de React y localStorage de inmediato
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
    <Stack spacing={3}>
      {/* Encabezado Estandarizado */}
      <PageHeader
        icon={QueryStatsIcon}
        title="Mercados Financieros"
        subtitle="Seguimiento de cotizaciones globales en tiempo real con alertas de rendimiento."
        iconColor="#2196f3"
      />

      {/* Sección Superior: Buscador y Más Operados */}
      <Grid container spacing={3}>
        {/* Buscador de Activos Dinámico */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={700} color="gray" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Buscar Activo (Bolsa de EE. UU.)
            </Typography>

            <Autocomplete
              options={options}
              getOptionLabel={(option) => typeof option === "string" ? option : `${option.ticker} - ${option.name}`}
              filterOptions={(x) => x}
              onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  const targetTicker = typeof newValue === "string" ? newValue : newValue.ticker;
                  handleTradeRedirect(targetTicker);
                }
              }}
              loading={loadingSearch}
              renderInput={(params) => {
                const { slotProps: ps, InputProps, inputProps, InputLabelProps, ...rest } = params;
                const inputSlot = ps?.input ?? InputProps;
                const htmlInputSlot = ps?.htmlInput ?? inputProps;
                const labelSlot = ps?.inputLabel ?? InputLabelProps;

                return (
                  <TextField
                    {...rest}
                    placeholder="Ej: NVDA, Apple, Tesla..."
                    size="small"
                    slotProps={{
                      ...ps,
                      input: {
                        ...inputSlot,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ color: "gray", mr: 1, fontSize: 20 }} />
                            {inputSlot?.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {loadingSearch ? <CircularProgress color="inherit" size={18} /> : null}
                            {inputSlot?.endAdornment}
                          </>
                        )
                      },
                      htmlInput: htmlInputSlot,
                      inputLabel: labelSlot
                    }}
                    sx={{
                      input: { color: "white", fontWeight: 700 },
                      bgcolor: "#0b0e11",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" }
                    }}
                  />
                );
              }}
            />
          </Paper>
        </Grid>

        {/* Accesos Rápidos: Más Operados */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} color="gray" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Más Operados
            </Typography>

            <Grid container spacing={1.5}>
              {POPULAR_TICKERS.map((item) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={item.ticker}>
                  <Card
                    onClick={() => handleTradeRedirect(item.ticker)}
                    sx={{
                      bgcolor: "#0b0e11",
                      border: "1px solid #1c2025",
                      borderRadius: 1.5,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "#2196f3", bgcolor: "rgba(33, 150, 243, 0.08)" }
                    }}
                  >
                    <CardContent sx={{ p: "10px !important", textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={800} color="white">
                        {item.ticker}
                      </Typography>
                      <Typography variant="caption" color="gray" noWrap display="block" sx={{ fontSize: "0.68rem" }}>
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla Principal de Cotizaciones */}
      <TableContainer component={Paper} sx={{ backgroundColor: "#15181e", borderRadius: 2, border: "1px solid #1c2025" }}>
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