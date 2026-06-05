import { Grid, Typography, Card, CardContent, TextField, Button, Stack, Tabs, Tab, Box, MenuItem, Alert, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { executeTrade } from "../services/portfolio-service";
import { useMarket } from "../context/market-context.jsx";
import TradingChart from "../components/dashboard/trading-chart";

function TradingPage() {
  const { assets, loadingMarket } = useMarket();
  const location = useLocation(); 

  const [action, setAction] = useState(0); 
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); 

  useEffect(() => {
    if (location.state?.defaultSymbol) {
      setSelectedSymbol(location.state.defaultSymbol);
    }
  }, [location.state]);

  const currentAsset = assets.find(a => a.symbol === selectedSymbol);
  
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
      if (localPortfolio.cash < cost) throw new Error("Fondos simulados insuficientes para realizar la compra.");
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
      
      // Limpiamos posiciones vacías
      localPortfolio.positions = localPortfolio.positions.filter(p => parseFloat(p.quantity) > 0);
    }

    // Guardar Historial
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
      price: currentAsset.currentPrice
    };

    try {
      // Intentamos pegarle a Django primero
      const response = await executeTrade(tradeData);
      setStatusMessage({ type: "success", text: response.message || "Operación procesada en backend." });
      setQuantity(""); 
    } catch (error) {
      console.warn("Backend inalcanzable o 401. Derivando transacción a simulación local...");
      
      try {
        // Si Django falla, se ejecuta local de inmediato sin romper la pantalla
        executeLocalSimulatedTrade(tradeData);
        setStatusMessage({
          type: "success",
          text: `[Modo Simulación] ¡Orden de ${action === 0 ? 'Compra' : 'Venta'} completada con éxito localmente!`
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
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>Operar Activos</Typography>

      {statusMessage && (
        <Alert severity={statusMessage.type} variant="filled" sx={{ width: "100%" }}>
          {statusMessage.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ backgroundColor: "#15181e", height: "100%" }}>
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
                Mercado Real • Precios en tiempo real
              </Typography>
              
              {currentAsset && (
                <TradingChart 
                  symbol={currentAsset.symbol} 
                  currentPrice={currentAsset.currentPrice}
                  isAssetUp={isUp} 
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Card sx={{ backgroundColor: "#15181e" }}>
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
                    {assets.map((asset) => (
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