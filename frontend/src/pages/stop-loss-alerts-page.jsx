import { useState } from "react";
import { 
  Box, Typography, Paper, Grid, Stack, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Tabs, Tab, MenuItem, IconButton 
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SecurityIcon from "@mui/icons-material/Security";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAlertIcon from "@mui/icons-material/AddAlert";

const AVAILABLE_ASSETS = ["AAPL", "NVDA", "TSLA", "AL30", "G Galicia", "SPY"];

function StopLossAlertsPage() {
  const [tabIndex, setTabIndex] = useState(0);

  const [orderAsset, setOrderAsset] = useState("NVDA");
  const [orderType, setOrderType] = useState("STOP_LOSS");
  const [triggerPrice, setTriggerPrice] = useState("110");
  const [quantity, setQuantity] = useState("10");

  const [autoOrders, setAutoOrders] = useState([
    { id: 1, asset: "NVDA", type: "STOP_LOSS", triggerPrice: 110, quantity: 10, status: "Activa", date: "2026-10-22" },
    { id: 2, asset: "AAPL", type: "TAKE_PROFIT", triggerPrice: 240, quantity: 5, status: "Activa", date: "2026-10-23" }
  ]);

  const [alertAsset, setAlertAsset] = useState("AL30");
  const [alertCondition, setAlertCondition] = useState("ABOVE");
  const [alertTargetPrice, setAlertTargetPrice] = useState("65");

  const [alerts, setAlerts] = useState([
    { id: 1, asset: "AL30", condition: "Mayor a", targetPrice: 65, status: "Monitoreando" },
    { id: 2, asset: "TSLA", condition: "Menor a", targetPrice: 200, status: "Monitoreando" }
  ]);

  const handleCreateOrder = () => {
    if (!triggerPrice || !quantity) return;
    const newOrder = {
      id: Date.now(),
      asset: orderAsset,
      type: orderType,
      triggerPrice: Number(triggerPrice),
      quantity: Number(quantity),
      status: "Activa",
      date: new Date().toISOString().split("T")[0]
    };
    setAutoOrders([newOrder, ...autoOrders]);
    alert(`Orden de ${orderType === "STOP_LOSS" ? "Stop-Loss" : "Take-Profit"} programada para ${orderAsset}.`);
  };

  const handleCreateAlert = () => {
    if (!alertTargetPrice) return;
    const newAlert = {
      id: Date.now(),
      asset: alertAsset,
      condition: alertCondition === "ABOVE" ? "Mayor a" : "Menor a",
      targetPrice: Number(alertTargetPrice),
      status: "Monitoreando"
    };
    setAlerts([newAlert, ...alerts]);
    alert(`Alerta creada para ${alertAsset}.`);
  };

  const handleDeleteOrder = (id) => {
    setAutoOrders(autoOrders.filter((o) => o.id !== id));
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <SecurityIcon sx={{ color: "#ff9800", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800}>
            Stop-Loss y Alertas
          </Typography>
        </Stack>
        <Typography variant="body2" color="gray">
          Gestioná el riesgo de tu portafolio con órdenes automáticas de protección y avisos en tiempo real.
        </Typography>
      </Box>

      {/* Pestañas sin barra inferior y selección en verde */}
      <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, mb: 4, overflow: "hidden" }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{
            "& .MuiTab-root": { color: "gray", fontWeight: 700, textTransform: "none", fontSize: "0.95rem", py: 1.5 },
            "& .Mui-selected": { color: "#4caf50 !important" }, // Solo se pone en verde la opción activa
            "& .MuiTabs-indicator": { display: "none" } // Se elimina por completo la barra inferior
          }}
        >
          <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Estrategias Automáticas" />
          <Tab icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Alertas de Cotización" />
        </Tabs>
      </Paper>

      {/* TAB 0: ESTRATEGIAS AUTOMÁTICAS */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 3 }}>
                Programar Orden Automática
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Activo"
                  value={orderAsset}
                  onChange={(e) => setOrderAsset(e.target.value)}
                  sx={{ bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                >
                  {AVAILABLE_ASSETS.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de Gatillo"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  sx={{ bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                >
                  <MenuItem value="STOP_LOSS">Stop-Loss (Protección de Caída)</MenuItem>
                  <MenuItem value="TAKE_PROFIT">Take-Profit (Toma de Ganancia)</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Precio Disparador ($ USD/ARS)"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cantidad de Nominales"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateOrder}
                  sx={{ bgcolor: "#ff9800", py: 1.2, fontWeight: 700, borderRadius: 1.5, "&:hover": { bgcolor: "#e68a00" } }}
                >
                  Confirmar Orden Automática
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Tabla */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                Órdenes Automáticas Programadas
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { borderColor: "#1c2025", color: "gray", fontWeight: 700 } }}>
                      <TableCell>Activo</TableCell>
                      <TableCell>Estrategia</TableCell>
                      <TableCell>Precio Disparador</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {autoOrders.map((row) => (
                      <TableRow key={row.id} sx={{ "& td": { borderColor: "#1c2025", color: "white" } }}>
                        <TableCell sx={{ fontWeight: 700 }}>{row.asset}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.type === "STOP_LOSS" ? "Stop-Loss" : "Take-Profit"}
                            size="small"
                            sx={{
                              bgcolor: row.type === "STOP_LOSS" ? "rgba(244, 67, 54, 0.15)" : "rgba(76, 175, 80, 0.15)",
                              color: row.type === "STOP_LOSS" ? "#f44336" : "#4caf50",
                              fontWeight: 700,
                              fontSize: "0.7rem"
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>${row.triggerPrice}</TableCell>
                        <TableCell>{row.quantity} u.</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" sx={{ bgcolor: "rgba(255, 152, 0, 0.15)", color: "#ff9800", fontWeight: 700, fontSize: "0.7rem" }} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleDeleteOrder(row.id)} sx={{ color: "gray", "&:hover": { color: "#f44336" } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: ALERTAS DE COTIZACIÓN */}
      {tabIndex === 1 && (
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 3 }}>
                Crear Alerta de Precio
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Activo"
                  value={alertAsset}
                  onChange={(e) => setAlertAsset(e.target.value)}
                  sx={{ bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                >
                  {AVAILABLE_ASSETS.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Condición"
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value)}
                  sx={{ bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                >
                  <MenuItem value="ABOVE">Cotización sube por encima de</MenuItem>
                  <MenuItem value="BELOW">Cotización cae por debajo de</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Precio Objetivo ($ USD/ARS)"
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddAlertIcon />}
                  onClick={handleCreateAlert}
                  sx={{ bgcolor: "#2196f3", py: 1.2, fontWeight: 700, borderRadius: 1.5, "&:hover": { bgcolor: "#1976d2" } }}
                >
                  Crear Alerta
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Tabla */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                Alertas Activas
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { borderColor: "#1c2025", color: "gray", fontWeight: 700 } }}>
                      <TableCell>Activo</TableCell>
                      <TableCell>Condición</TableCell>
                      <TableCell>Precio Objetivo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((row) => (
                      <TableRow key={row.id} sx={{ "& td": { borderColor: "#1c2025", color: "white" } }}>
                        <TableCell sx={{ fontWeight: 700 }}>{row.asset}</TableCell>
                        <TableCell>{row.condition}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#2196f3" }}>${row.targetPrice}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" sx={{ bgcolor: "rgba(33, 150, 243, 0.15)", color: "#2196f3", fontWeight: 700, fontSize: "0.7rem" }} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleDeleteAlert(row.id)} sx={{ color: "gray", "&:hover": { color: "#f44336" } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default StopLossAlertsPage;