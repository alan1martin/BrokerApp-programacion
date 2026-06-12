// src/layouts/dashboard-layout.jsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  Box, AppBar, Toolbar, Typography, Avatar, IconButton, Stack,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Modal, Card, CardContent, TextField, InputAdornment, Button, Alert
} from "@mui/material";
import { 
  QueryStats as LogoIcon, // <-- Usamos un ícono real de MUI mapeado como LogoIcon
  Logout, 
  BarChart as ChartIcon, // Alias para evitar colisiones globales
  AccountBalanceWallet, 
  SwapHoriz, 
  Settings,
  ExpandLess,
  ExpandMore,
  FiberManualRecord,
  Close as CloseIcon,
  ArrowUpward,
  ArrowDownward
} from "@mui/icons-material";
import { manageCashFunds } from "../services/portfolio-service";

function DashboardLayout() {
  const navigate = useNavigate();
  
  // Estados para controlar qué menú está desplegado (Dropdowns)
  const [openAccount, setOpenAccount] = useState(false);
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openTrading, setOpenTrading] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);

  // ESTADOS PARA OPERAR FONDOS
  const [openCashModal, setOpenCashModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [cashLoading, setCashLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };

  // Handler para depósitos y retiros
  const handleCashAction = async (actionType) => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: "error", text: "Por favor, ingresá un monto válido mayor a 0." });
      return;
    }

    setCashLoading(true);
    setMessage(null);

    try {
      const data = await manageCashFunds(actionType, amount);
      setMessage({ type: "success", text: data.message });
      setAmount(""); // Reseteamos el input
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setCashLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenCashModal(false);
    setAmount("");
    setMessage(null);
  };

  // Estilo exacto de logos circulares
  const iconContainerStyle = (bgColor) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: bgColor,
    minWidth: 32,
    mr: 2
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0b0e11" }}>
      
      {/* ================= BARRA SUPERIOR (NAVBAR PREMIUM) ================= */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: "100%", 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          bgcolor: "#15181e", 
          borderBottom: "1px solid #1c2025" 
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: "24px !important" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <LogoIcon sx={{ color: "#4caf50", fontSize: 26 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={0.5} sx={{ color: "white", fontSize: "1.05rem" }}>
              PEAK INVESTMENTS
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" fontWeight={600} sx={{ color: "#9ca3af" }}>
              Martín
            </Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1c2025", border: "1px solid #2d3748", fontSize: "0.9rem", fontWeight: 600, color: "white" }}>
              M
            </Avatar>
            <IconButton onClick={handleLogout} sx={{ color: "#9ca3af", "&:hover": { color: "#f44336" } }}>
              <Logout fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ================= MENÚ IZQUIERDO (SIDEBAR) ================= */}
      <Box 
        component="nav" 
        sx={{ 
          width: 250, 
          flexShrink: 0,
          boxSizing: "border-box",
          bgcolor: "#15181e",
          borderRight: "1px solid #1c2025",
          pt: "64px" 
        }}
      >
        <List sx={{ px: 1.5, py: 3, "& .MuiListItemButton-root": { borderRadius: 2, mb: 0.5, color: "#9ca3af", "&:hover": { bgcolor: "#1c2025", color: "white" } } }}>
          
          {/* 1. MI CUENTA */}
          <ListItemButton onClick={() => setOpenAccount(!openAccount)}>
            <ListItemIcon sx={iconContainerStyle("rgba(76, 175, 80, 0.15)")}>
              <AccountBalanceWallet sx={{ color: "#4caf50", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Mi Cuenta" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openAccount ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>

          <Collapse in={openAccount} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton onClick={() => navigate("/")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
                <ListItemText primary="Estado de Cuenta" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              
              {/* BOTÓN RENDIMIENTO E INFORMES */}
              <ListItemButton onClick={() => navigate("/reports")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
                <ListItemText primary="Rendimiento e Informes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>

              {/* Perfil de Inversor */}
              <ListItemButton onClick={() => navigate("/investor-profile")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
                <ListItemText primary="Perfil de Inversor" slotProps={{ primary: { fontSize: "0.85rem", color: "white", fontWeight: 600 } }} />
              </ListItemButton>

              {/* Ingresar / Retirar Dinero */}
              <ListItemButton onClick={() => setOpenCashModal(true)} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
                <ListItemText primary="Ingresar / Retirar Dinero" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 2. MARKETS */}
          <ListItemButton onClick={() => setOpenMarkets(!openMarkets)}>
            <ListItemIcon sx={iconContainerStyle("rgba(33, 150, 243, 0.15)")}>
              <ChartIcon sx={{ color: "#2196f3", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Markets" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openMarkets ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>
          
          <Collapse in={openMarkets} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton onClick={() => navigate("/markets")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
                <ListItemText primary="Panel de Cotizaciones" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Análisis Técnico" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Mis Favoritos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 3. PORTFOLIO */}
          <ListItemButton onClick={() => setOpenPortfolio(!openPortfolio)}>
            <ListItemIcon sx={iconContainerStyle("rgba(156, 39, 176, 0.15)")}>
              <AccountBalanceWallet sx={{ color: "#9c27b0", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Portfolio" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openPortfolio ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>

          <Collapse in={openPortfolio} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton onClick={() => navigate("/composition")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
                <ListItemText primary="Composición de Activos" slotProps={{ primary: { fontSize: "0.85rem", color: "white", fontWeight: 600 } }} />
              </ListItemButton>
              
              <ListItemButton onClick={() => navigate("/history")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Historial de Órdenes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Dividendos Cobrados" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 4. TRADING */}
          <ListItemButton onClick={() => setOpenTrading(!openTrading)}>
            <ListItemIcon sx={iconContainerStyle("rgba(255, 152, 0, 0.15)")}>
              <SwapHoriz sx={{ color: "#ff9800", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Trading" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openTrading ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>

          <Collapse in={openTrading} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton onClick={() => navigate("/trading")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#ff9800" }} />
                <ListItemText primary="Operar Acciones / CEDEARs" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Compra de Dólar MEP" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Órdenes Pendientes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 5. SETTINGS */}
          <ListItemButton onClick={() => navigate("/settings")} sx={{ mt: 2 }}>
            <ListItemIcon sx={iconContainerStyle("rgba(144, 164, 174, 0.2)")}>
              <Settings sx={{ color: "#90a4ae", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Settings" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
          </ListItemButton>
        </List>
      </Box>

      {/* ================= PANEL CENTRAL (CONTENIDO DINÁMICO) ================= */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          pt: "88px", 
          minHeight: "100vh",
          overflowX: "hidden",
          bgcolor: "#0b0e11"
        }}
      >
        <Outlet />
      </Box>

      {/* ================= MODAL FLOTANTE: GESTIÓN DE EFECTIVO ================= */}
      <Modal
        open={openCashModal}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Card sx={{ backgroundColor: "#15181e", borderRadius: 3, border: "1px solid #1c2025", maxWidth: 450, width: "100%", boxShadow: 24 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800} color="white">
                Movimiento de Fondos
              </Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: "#9ca3af", "&:hover": { color: "white" } }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Typography color="gray" variant="body2" sx={{ mb: 3 }}>
              Ingresá el monto para inyectar o retirar efectivo del saldo disponible de tu cuenta.
            </Typography>

            {message && (
              <Alert 
                severity={message.type} 
                variant="filled"
                sx={{ 
                  mb: 3,
                  borderRadius: 1.5,
                  bgcolor: message.type === "error" ? "#2a1215" : "#112a14", 
                  color: message.type === "error" ? "#ff8a80" : "#a5d6a7",
                }}
              >
                {message.text}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                label="Monto a transaccionar"
                type="number"
                variant="outlined"
                fullWidth
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={cashLoading}
                placeholder="0.00"
                slotProps={{
                  inputLabel: { style: { color: "#9ca3af" } },
                  htmlInput: { min: "0", step: "any", style: { color: "white", fontWeight: 600 } },
                  input: {
                    startAdornment: <InputAdornment position="start" sx={{ "& .MuiTypography-root": { color: "#4caf50", fontWeight: 700 } }}>$</InputAdornment>,
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0b0e11",
                    "& fieldset": { borderColor: "#2d3748" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" }
                  }
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={cashLoading}
                  startIcon={<ArrowUpward />}
                  onClick={() => handleCashAction("DEPOSIT")}
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.15)",
                    color: "#4caf50",
                    fontWeight: 700,
                    py: 1.5,
                    textTransform: "none",
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: "rgba(76, 175, 80, 0.25)" }
                  }}
                >
                  Ingresar
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={cashLoading}
                  startIcon={<ArrowDownward />}
                  onClick={() => handleCashAction("WITHDRAW")}
                  sx={{
                    bgcolor: "rgba(244, 67, 64, 0.15)",
                    color: "#f44336",
                    fontWeight: 700,
                    py: 1.5,
                    textTransform: "none",
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: "rgba(244, 67, 54, 0.25)" }
                  }}
                >
                  Retirar
                </Button>
              </Stack>
            </Stack>

          </CardContent>
        </Card>
      </Modal>

    </Box>
  );
}

export default DashboardLayout;