// src/layouts/dashboard-layout.jsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  Box, AppBar, Toolbar, Typography, Avatar, IconButton, Stack,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse 
} from "@mui/material";
import { 
  TrendingUp as LogoIcon, 
  Logout, 
  BarChart, 
  AccountBalanceWallet, 
  SwapHoriz, 
  Settings,
  ExpandLess,
  ExpandMore,
  FiberManualRecord
} from "@mui/icons-material";

function DashboardLayout() {
  const navigate = useNavigate();
  
  // Estados para controlar qué menú está desplegado (Dropdowns)
  const [openAccount, setOpenAccount] = useState(false);
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openTrading, setOpenTrading] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access"); // Limpiamos el token correcto
    navigate("/login");
  };

  // Estilo exacto de logos circulares idéntico a las tarjetas de estado de cuenta
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
        {/* CORREGIDO: justifyContent ahora viaja seguro adentro de sx */}
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: "24px !important" }}>
          
          {/* Logo Corporativo de Peak Investments */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center"
              }}
            >
              <LogoIcon sx={{ color: "#4caf50", fontSize: 26 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={0.5} sx={{ color: "white", fontSize: "1.05rem" }}>
              PEAK INVESTMENTS
            </Typography>
          </Stack>

          {/* Sección de Perfil del Usuario */}
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

      {/* ================= MENÚ IZQUIERDO (SIDEBAR REESTRUCTURADO) ================= */}
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
          
          {/* 1. MI CUENTA (Desplegable Premium) */}
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
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: openAccount ? "#4caf50" : "gray" }} />
                <ListItemText primary="Estado de Cuenta" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
              
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Rendimiento e Informes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>

              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Perfil de Inversor" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>

              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
                <ListItemText primary="Ingresar / Retirar Dinero" slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 2. MARKETS (Desplegable Ampliado) */}
          <ListItemButton onClick={() => setOpenMarkets(!openMarkets)}>
            <ListItemIcon sx={iconContainerStyle("rgba(33, 150, 243, 0.15)")}>
              <BarChart sx={{ color: "#2196f3", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Markets" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openMarkets ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>
          
          <Collapse in={openMarkets} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton onClick={() => navigate("/markets")} sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: openMarkets ? "#2196f3" : "gray" }} />
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

          {/* 3. PORTFOLIO (Desplegable Ampliado) */}
          <ListItemButton onClick={() => setOpenPortfolio(!openPortfolio)}>
            <ListItemIcon sx={iconContainerStyle("rgba(156, 39, 176, 0.15)")}>
              <AccountBalanceWallet sx={{ color: "#9c27b0", fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Portfolio" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
            {openPortfolio ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
          </ListItemButton>

          <Collapse in={openPortfolio} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3.5 }}>
              <ListItemButton sx={{ py: 0.6 }}>
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: openPortfolio ? "#9c27b0" : "gray" }} />
                <ListItemText primary="Composición de Activos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
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

          {/* 4. TRADING (Desplegable Ampliado) */}
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
                <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: openTrading ? "#ff9800" : "gray" }} />
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

    </Box>
  );
}

export default DashboardLayout;