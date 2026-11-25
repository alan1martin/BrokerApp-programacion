// frontend/src/pages/trading-page.jsx
import { 
  Grid, Typography, Card, CardContent, TextField, Button, Stack, 
  Tabs, Tab, Box, MenuItem, Alert, CircularProgress, Autocomplete, Paper 
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; 
import { executeTrade } from "../services/portfolio-service";
import { searchAssets, getAssetDetail } from "../services/market-service";
import { useMarket } from "../context/market-context.jsx";
import TradingChart from "../components/dashboard/trading-chart";
import PageHeader from "../components/layout/page-header";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Lista de accesos rápidos para seleccionar activo con un solo clic
const POPULAR_TICKERS = [
  { ticker: "NVDA", name: "NVIDIA Corp" },
  { ticker: "AAPL", name: "Apple Inc" },
  { ticker: "TSLA", name: "Tesla Inc" },
  { ticker: "MSFT", name: "Microsoft Corp" },
  { ticker: "AMZN", name: "Amazon.com Inc" },
  { ticker: "SPY",  name: "S&P 500 ETF" }
];

function TradingPage() {
  const { assets, loadingMarket } = useMarket();
  const location = useLocation(); 

  const [action, setAction] = useState(0); 
  const [selectedSymbol, setSelectedSymbol] = useState(() => location.state?.defaultSymbol || "AAPL");
  const prevSymbolRef = useRef(location.state?.defaultSymbol);
  const [quantity, setQuantity] = useState("");
  
  // Estados para el Buscador Dinámico con Autocomplete
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); 

  useEffect(() => {
    if (location.state?.defaultSymbol && location.state.defaultSymbol !== prevSymbolRef.current) {
      prevSymbolRef.current = location.state.defaultSymbol;
      setSelectedSymbol(location.state.defaultSymbol);
    }
  }, [location.state?.defaultSymbol]);

  // Debounce para consultar al backend Django el catálogo en memoria sin sobrecargar a Yahoo
  useEffect(() => {
    let active = true;

    const fetchSearchResults = async () => {
      setLoadingSearch(true);
      try {
        const data = await searchAssets(searchInputVal);
        if (active) {
          setSearchOptions(data.results || []);
        }
      } catch (err) {
        console.error("Error buscando activos para trading:", err);
      } finally {
        if (active) setLoadingSearch(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchInputVal]);

  const [fetchedAsset, setFetchedAsset] = useState(null);

  // Cuando cambia el activo seleccionado, si no está en la lista de activos iniciales, consultamos al backend
  useEffect(() => {
    let isSubscribed = true;
    const inContext = assets.find(a => a.symbol === selectedSymbol);
    
    if (inContext) {
      setFetchedAsset(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        const detail = await getAssetDetail(selectedSymbol);
        if (isSubscribed && detail && detail.price) {
          setFetchedAsset({
            symbol: detail.ticker,
            name: detail.name || detail.ticker,
            exchange: detail.exchange,
            currentPrice: parseFloat(detail.price)
          });
        }
      } catch {
        // En caso de falla de red, conserva último estado
      }
    };

    fetchDetail();
    return () => {
      isSubscribed = false;
    };
  }, [selectedSymbol, assets]);

  // Buscamos en el contexto o en el detalle consultado
  const foundAsset = assets.find(a => a.symbol === selectedSymbol);
  const currentAsset = foundAsset || fetchedAsset || {
    symbol: selectedSymbol,
    name: selectedSymbol,
    currentPrice: 0.00
  };

  // Garantizamos que el Select del formulario siempre contenga la opción seleccionada aunque venga de la búsqueda externa
  const availableOptions = assets.some(a => a.symbol === selectedSymbol)
    ? assets
    : [...assets, { symbol: selectedSymbol, name: currentAsset.name }];

  const estimatedTotal = quantity && currentAsset 
    ? (parseFloat(quantity) * currentAsset.currentPrice).toFixed(2) 
    : "0.00";

  const isUp = selectedSymbol.charCodeAt(0) % 2 === 0; 
  const changePercent = isUp ? 2.45 : -1.20;
  const priceDiff = currentAsset ? (currentAsset.currentPrice * (changePercent / 100)) : 0;

  const handleActionChange = (event, newValue) => {
    setAction(newValue);
    setStatusMessage(null); 
  };

  // MOTOR DE SIMULACIÓN LOCAL AUXILIAR
  const executeLocalSimulatedTrade = (tradeData) => {
    const localPortfolio = JSON.parse(localStorage.getItem("simulated_portfolio")) || { cash: 5000, total_value: 5000, positions: [] };
    const localHistory = JSON.parse(localStorage.getItem("simulated_history")) || [];
    
    const cost = tradeData.quantity * tradeData.price;

    if (tradeData.transaction_type === "BUY") {
      if (localPortfolio.cash < cost) throw new Error("Fondos insuficientes para realizar la compra.");
      localPortfolio.cash -= cost;

      const existingPos = localPortfolio.positions.find(p => p.symbol === tradeData.symbol);
      if (existingPos) {
        const totalQty = parseFloat(existingPos.quantity) + tradeData.quantity;
        existingPos.average_price = ((parseFloat(existingPos.average_price) * parseFloat(existingPos.quantity)) + cost) / totalQty;
        existingPos.quantity = totalQty;
      } else {
        localPortfolio.positions.push({
          symbol: tradeData.symbol,
          quantity: tradeData.quantity,
          average_price: tradeData.price
        });
      }
    } else { // SELL
      const existingPos = localPortfolio.positions.find(p => p.symbol === tradeData.symbol);
      if (!existingPos || parseFloat(existingPos.quantity) < tradeData.quantity) {
        throw new Error("No tenés suficientes acciones de este activo para vender.");
      }
      localPortfolio.cash += cost;
      existingPos.quantity = parseFloat(existingPos.quantity) - tradeData.quantity;
      
      localPortfolio.positions = localPortfolio.positions.filter(p => parseFloat(p.quantity) > 0);
    }

    localHistory.unshift({
      timestamp: new Date().toISOString(),
      symbol: tradeData.symbol,
      transaction_type: tradeData.transaction_type,
      quantity: tradeData.quantity,
      price: tradeData.price
    });

    localStorage.setItem("simulated_portfolio", JSON.stringify(localPortfolio));
    localStorage.setItem("simulated_history", JSON.stringify(localHistory));
  };

  const handleExecuteTrade = async (e) => { 
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null); 

    const tradeData = {
      symbol: selectedSymbol,
      transaction_type: action === 0 ? "BUY" : "SELL", 
      quantity: parseFloat(quantity),
      price: currentAsset?.currentPrice || 0
    };

    try {
      const response = await executeTrade(tradeData);
      setStatusMessage({ type: "success", text: response.message || "Operación procesada con éxito." });
      setQuantity(""); 
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        const errorMsg = error.response.data?.error || error.response.data?.detail || error.message || "Error en los datos de la orden.";
        setStatusMessage({ type: "error", text: errorMsg });
        return;
      }

      console.warn("Backend inalcanzable. Derivando a simulación local de contingencia...");
      try {
        executeLocalSimulatedTrade(tradeData);
        setStatusMessage({
          type: "warning",
          text: `[Sin conexión con servidor] Orden de ${action === 0 ? 'Compra' : 'Venta'} guardada localmente.`
        });
        setQuantity("");
      } catch (simError) {
        setStatusMessage({ type: "error", text: simError.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingMarket) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Stack spacing={3}>
      <PageHeader
        icon={SwapHorizIcon}
        title="Operar Activos"
        subtitle="Ejecutá órdenes de compra y venta al instante con gráficos de cotizaciones en tiempo real."
        iconColor="#ff9800"
      />

      {statusMessage && (
        <Alert severity={statusMessage.type} variant="filled" sx={{ width: "100%" }}>
          {statusMessage.text}
        </Alert>
      )}

      {/* Sección Superior: Buscador Inteligente y Accesos Rápidos (Más Operados) */}
      <Grid container spacing={3}>
        {/* Buscador Autocomplete */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={700} color="gray" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Buscar Activo a Operar
            </Typography>

            <Autocomplete
              options={searchOptions}
              getOptionLabel={(option) => typeof option === "string" ? option : `${option.ticker} - ${option.name}`}
              filterOptions={(x) => x}
              onInputChange={(event, newInputValue) => setSearchInputVal(newInputValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  const selectedTicker = typeof newValue === "string" ? newValue : newValue.ticker;
                  setSelectedSymbol(selectedTicker);
                  setStatusMessage(null);
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
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <TrendingUpIcon sx={{ color: "#4caf50", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700} color="gray" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Más Operados (Selección Rápida)
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {POPULAR_TICKERS.map((item) => {
                const isSelected = selectedSymbol === item.ticker;
                return (
                  <Grid size={{ xs: 6, sm: 4, md: 2 }} key={item.ticker}>
                    <Card
                      onClick={() => {
                        setSelectedSymbol(item.ticker);
                        setStatusMessage(null);
                      }}
                      sx={{
                        bgcolor: isSelected ? "rgba(33, 150, 243, 0.12)" : "#0b0e11",
                        border: `1px solid ${isSelected ? "#2196f3" : "#1c2025"}`,
                        borderRadius: 1.5,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": { borderColor: "#2196f3", bgcolor: "rgba(33, 150, 243, 0.08)" }
                      }}
                    >
                      <CardContent sx={{ p: "10px !important", textAlign: "center" }}>
                        <Typography variant="body2" fontWeight={800} color={isSelected ? "#2196f3" : "white"}>
                          {item.ticker}
                        </Typography>
                        <Typography variant="caption" color="gray" noWrap display="block" sx={{ fontSize: "0.68rem" }}>
                          {item.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico y Formulario de Compra / Venta */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ backgroundColor: "#15181e", height: "100%", border: "1px solid #1c2025" }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700}>
                {currentAsset?.name} ({currentAsset?.symbol})
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, my: 1.5 }}>
                <Typography variant="h3" fontWeight={800} color="white">
                  ${currentAsset?.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
                
                <Typography variant="h6" fontWeight={700} sx={{ color: isUp ? "#4caf50" : "#f44336" }}>
                  {isUp ? "+" : ""}{priceDiff.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({isUp ? "+" : ""}{changePercent.toFixed(2)}%)
                </Typography>
                <Typography variant="caption" color="gray" fontWeight={600}>USD</Typography>
              </Box>

              <Typography color="gray" variant="body2" sx={{ mb: 2 }}>
                Mercado Real • Widget Oficial TradingView (Gráfico de Líneas en Tiempo Real)
              </Typography>
              
              {selectedSymbol && (
                <TradingChart 
                  key={selectedSymbol} 
                  symbol={selectedSymbol}
                  exchange={currentAsset?.exchange}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Card sx={{ backgroundColor: "#15181e", border: "1px solid #1c2025" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs 
                value={action} 
                onChange={handleActionChange} 
                variant="fullWidth"
                textColor={action === 0 ? "primary" : "error"}
                indicatorColor={action === 0 ? "primary" : "error"}
              >
                <Tab label="COMPRAR" sx={{ fontWeight: 600 }} />
                <Tab label="VENDER" sx={{ fontWeight: 600 }} />
              </Tabs>
            </Box>

            <CardContent>
              <Box component="form" onSubmit={handleExecuteTrade}>
                <Stack spacing={3}>
                  <TextField
                    select
                    label="Seleccionar Activo"
                    value={selectedSymbol}
                    onChange={(e) => {
                      setSelectedSymbol(e.target.value);
                      setStatusMessage(null);
                    }}
                    disabled={loading}
                    fullWidth
                  >
                    {availableOptions.map((asset) => (
                      <MenuItem key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} - {asset.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Cantidad"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={loading}
                    required
                    fullWidth
                    placeholder="0.00"
                    slotProps={{ htmlInput: { step: "any" } }}
                  />

                  <TextField
                    label="Precio de Ejecución (USD)"
                    value={currentAsset ? `$${currentAsset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}
                    disabled
                    fullWidth
                  />

                  <Box sx={{ p: 2, backgroundColor: "#1e222b", borderRadius: 1, display: "flex", justifyContent: "space-between" }}>
                    <Typography color="gray">Total Estimado:</Typography>
                    <Typography fontWeight={700} color="white">
                      ${parseFloat(estimatedTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !quantity || parseFloat(quantity) <= 0}
                    color={action === 0 ? "primary" : "error"}
                    sx={{ fontWeight: 700, py: 1.5 }}
                  >
                    {loading 
                      ? "Procesando..." 
                      : action === 0 ? `Comprar ${selectedSymbol}` : `Vender ${selectedSymbol}`
                    }
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default TradingPage;