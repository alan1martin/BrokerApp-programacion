import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Stack, 
  Tabs, 
  Tab, 
  Box,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";
import { useState } from "react";
import { executeTrade } from "../services/portfolio-service";
// ➔ 1. IMPORTAMOS EL HOOK DEL MERCADO REAL
import { useMarket } from "../context/market-context.jsx";

function TradingPage() {
  // ➔ 2. CONSUMIMOS LA DATA REAL Y EL ESTADO DE CARGA GLOBAL
  const { assets, loadingMarket } = useMarket();

  const [action, setAction] = useState(0); // 0 = COMPRAR, 1 = VENDER
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); 

  // ➔ 3. BUSCAMOS EL ACTIVO DENTRO DEL ARRAY REAL QUE VIENE DE INTERNET
  const currentAsset = assets.find(a => a.symbol === selectedSymbol);
  
  const estimatedTotal = quantity && currentAsset 
    ? (parseFloat(quantity) * currentAsset.currentPrice).toFixed(2) 
    : "0.00";

  const handleActionChange = (event, newValue) => {
    setAction(newValue);
    setStatusMessage(null); 
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
      const response = await executeTrade(tradeData);
      
      setStatusMessage({
        type: "success",
        text: response.message
      });
      setQuantity(""); 
    } catch (error) {
      const serverError = error.response?.data?.error || "Hubo un error al procesar la orden.";
      setStatusMessage({
        type: "error",
        text: typeof serverError === 'object' ? JSON.stringify(serverError) : serverError
      });
    } finally {
      setLoading(false);
    }
  };

  // ➔ 4. SI LAS APIS TODAVÍA NO CONTESTARON, MOSTRAMOS UN Spinner DE CARGA
  if (loadingMarket) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>
        Operar Activos
      </Typography>

      {statusMessage && (
        <Alert severity={statusMessage.type} variant="filled" sx={{ width: "100%" }}>
          {statusMessage.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: Info del Activo */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ backgroundColor: "#15181e", height: "100%" }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {currentAsset?.name} ({currentAsset?.symbol})
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main" sx={{ my: 2 }}>
                ${currentAsset?.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Typography>
              <Typography color="gray" variant="body2">
                Mercado Real • Precios actualizados vía API pública
              </Typography>
              
              <Box 
                sx={{ 
                  mt: 4, 
                  height: 200, 
                  backgroundColor: "#1e222b", 
                  borderRadius: 2, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: "1px dashed #333"
                }}
              >
                <Typography color="gray">Próximamente: Gráfico interactivo en tiempo real de {selectedSymbol}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COLUMNA DERECHA: Formulario de Operación */}
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
                    slotProps={{ htmlInput: { step: "any", min: "0" } }}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={loading}
                    required
                    fullWidth
                    placeholder="0.00"
                  />

                  <TextField
                    label="Precio de Ejecución (USD)"
                    value={currentAsset ? `$${currentAsset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}
                    disabled
                    fullWidth
                  />

                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: "#1e222b", 
                      borderRadius: 1, 
                      display: "flex", 
                      justifyContent: "space-between" 
                    }}
                  >
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