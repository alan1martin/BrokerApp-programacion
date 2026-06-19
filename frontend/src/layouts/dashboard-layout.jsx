// src/layouts/dashboard-layout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  Box, AppBar, Toolbar, Typography, Avatar, IconButton, Stack,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Modal, Card, CardContent, TextField, InputAdornment, Button, Alert,
  Menu, MenuItem, Divider, Switch, Drawer
} from "@mui/material";

// Importaciones de iconos
import LogoIcon from "@mui/icons-material/QueryStats";
import Logout from "@mui/icons-material/Logout";
import ChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import Settings from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AccountBox from "@mui/icons-material/AccountBox";
import Shield from "@mui/icons-material/Shield";
import Help from "@mui/icons-material/Help"; 
import DarkMode from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu"; // Ícono para el menú móvil

import { manageCashFunds } from "../services/portfolio-service";

const drawerWidth = 250;

function DashboardLayout() {
  const navigate = useNavigate();
  
  // Estado para el menú flotante del perfil
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Estado local para el Switch de Modo Oscuro sincronizado con localStorage
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") !== "light");
  
  // NUEVO ESTADO: Controla la apertura del menú lateral en celulares
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Sincronizar el estado del switch si cambia desde la página de Settings
  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      setIsDarkMode(currentTheme === "dark");
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };

  // Handlers para el menú del perfil
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Handler para el menú responsive móvil
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handler para cambiar el tema visual de forma global
  const handleThemeToggle = (e) => {
    const checked = e.target.checked;
    setIsDarkMode(checked);
    const nextTheme = checked ? "dark" : "light";
    localStorage.setItem("theme", nextTheme);
    
    const root = window.document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    window.dispatchEvent(new Event("storage"));
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
      setAmount(""); 
      
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

  // CONTENIDO DEL MENU LATERAL (Reutilizado tanto para Desktop como para Mobile)
  const menuContent = (
    <List sx={{ px: 1.5, py: 3, "& .MuiListItemButton-root": { borderRadius: 2, mb: 0.5, color: isDarkMode ? "#9ca3af" : "#475569", "&:hover": { bgcolor: isDarkMode ? "#1c2025" : "#f1f5f9", color: isDarkMode ? "white" : "#0f172a" } } }}>
      
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
          <ListItemButton onClick={() => { navigate("/"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
            <ListItemText primary="Estado de Cuenta" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          <ListItemButton onClick={() => { navigate("/reports"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
            <ListItemText primary="Rendimiento e Informes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          <ListItemButton onClick={() => { navigate("/investor-profile"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
            <ListItemText primary="Perfil de Inversor" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          <ListItemButton onClick={() => { setOpenCashModal(true); setMobileOpen(false); }} sx={{ py: 0.6 }}>
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
          <ListItemButton onClick={() => { navigate("/markets"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
            <ListItemText primary="Panel de Cotizaciones" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          <ListItemButton sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "gray" }} />
            <ListItemText primary="Análisis Técnico" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          {/* SECCIÓN CONFIGURADA: Agregada la navegación correspondiente a la ruta hija */}
          <ListItemButton onClick={() => { navigate("/markets/favorites"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
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
          <ListItemButton onClick={() => { navigate("/composition"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
            <ListItemText primary="Composición de Activos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
          <ListItemButton onClick={() => { navigate("/history"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
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
          <ListItemButton onClick={() => { navigate("/trading"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
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
      <ListItemButton onClick={() => { navigate("/settings"); setMobileOpen(false); }} sx={{ mt: 2 }}>
        <ListItemIcon sx={iconContainerStyle("rgba(144, 164, 174, 0.2)")}>
          <Settings sx={{ color: "#90a4ae", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Settings" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
      </ListItemButton>
    </List>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: isDarkMode ? "#0b0e11" : "#f8fafc" }}>
      
      {/* ================= BARRA SUPERIOR (NAVBAR PREMIUM) ================= */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: "100%", 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          bgcolor: isDarkMode ? "#15181e" : "#ffffff", 
          borderBottom: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0" 
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: "24px !important" }}>
          
          {/* BOTÓN HAMBURGUESA MÓVIL + LOGO CON BOTÓN REDIRECCIONABLE */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Botón hamburguesa visible solo en celular (xs, sm) y oculto en pc (md+) */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 1, 
                display: { md: "none" }, 
                color: isDarkMode ? "white" : "#0f172a" 
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo y Texto convertidos en botón interactivo hacia "/" */}
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1.5}
              onClick={() => navigate("/")}
              sx={{ 
                cursor: "pointer",
                transition: "opacity 0.2s",
                "&:hover": { opacity: 0.85 }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LogoIcon sx={{ color: "#4caf50", fontSize: 26 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} letterSpacing={0.5} sx={{ color: isDarkMode ? "white" : "#0f172a", fontSize: "1.05rem" }}>
                PEAK INVESTMENTS
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1.5} 
              onClick={handleMenuOpen} 
              sx={{ cursor: 'pointer', p: 0.8, borderRadius: 2, '&:hover': { bgcolor: isDarkMode ? '#1c2025' : '#f1f5f9' } }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ color: isDarkMode ? "#9ca3af" : "#475569" }}>
                Martín
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: isDarkMode ? "#1c2025" : "#e2e8f0", border: isDarkMode ? "1px solid #2d3748" : "1px solid #cbd5e1", color: isDarkMode ? "#9ca3af" : "#475569" }}>
                <AccountCircle sx={{ fontSize: 28 }} />
              </Avatar>
            </Stack>

            {/* MENÚ DESPLEGABLE DEL PERFIL CONFIGURADO */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              disableScrollLock
              PaperProps={{
                sx: { 
                  bgcolor: isDarkMode ? "#15181e" : "#ffffff", 
                  color: isDarkMode ? "white" : "#0f172a", 
                  border: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0", 
                  mt: 1.5,
                  minWidth: 220,
                  boxShadow: isDarkMode ? "0px 8px 24px rgba(0,0,0,0.5)" : "0px 8px 24px rgba(0,0,0,0.1)",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.88rem",
                    py: 1.2,
                    color: isDarkMode ? "#9ca3af" : "#475569",
                    "&:hover": { bgcolor: isDarkMode ? "#1c2025" : "#f1f5f9", color: isDarkMode ? "white" : "#0f172a" }
                  }
                }
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate("/settings/profile"); }}>
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><AccountBox sx={{ fontSize: 20 }} /></ListItemIcon>
                Mi Perfil
              </MenuItem>
              
              <MenuItem onClick={() => { handleMenuClose(); navigate("/settings/security"); }}>
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><Shield sx={{ fontSize: 20 }} /></ListItemIcon>
                Seguridad
              </MenuItem>

              <MenuItem onClick={() => { handleMenuClose(); navigate("/settings/config"); }}>
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><Settings sx={{ fontSize: 20 }} /></ListItemIcon>
                Configuración
              </MenuItem>

              <MenuItem onClick={() => { handleMenuClose(); navigate("/settings/help"); }}>
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><Help sx={{ fontSize: 20 }} /></ListItemIcon>
                Centro de Ayuda
              </MenuItem>

              <Divider sx={{ bgcolor: isDarkMode ? "#1c2025" : "#e2e8f0", my: "4px !important" }} />

              {/* SECCIÓN CONFIGURADA: TEMA VISUAL */}
              <MenuItem disableRipple sx={{ "&:hover": { bgcolor: "transparent !important", color: "inherit !important" }, display: "flex", justifyContent: "space-between", width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><DarkMode sx={{ fontSize: 20 }} /></ListItemIcon>
                  Tema Visual
                </Box>
                <Switch 
                  size="small" 
                  checked={isDarkMode} 
                  onChange={handleThemeToggle}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#4caf50" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#4caf50" }
                  }}
                />
              </MenuItem>

              <Divider sx={{ bgcolor: isDarkMode ? "#1c2025" : "#e2e8f0", my: "4px !important" }} />

              <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }} sx={{ "&:hover": { color: "#f44336 !important", bgcolor: "rgba(244, 67, 54, 0.08) !important" } }}>
                <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}><Logout sx={{ fontSize: 20, color: "inherit" }} /></ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ================= MENÚ RESPONSIVE (SIDEBAR COMPACTO) ================= */}
      {/* 1. VERSIÓN MÓVIL: Se despliega desde el lateral izquierdo mediante un Drawer temporal */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Optimiza rendimiento en móviles
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            boxSizing: "border-box", 
            width: drawerWidth,
            bgcolor: isDarkMode ? "#15181e" : "#ffffff",
            borderRight: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0"
          },
        }}
      >
        <Toolbar /> {/* Espaciador del AppBar */}
        {menuContent}
      </Drawer>

      {/* 2. VERSIÓN DESKTOP: Menú fijo tradicional permanente en pantallas medianas/grandes */}
      <Box 
        component="nav" 
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          boxSizing: "border-box",
          bgcolor: isDarkMode ? "#15181e" : "#ffffff",
          borderRight: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0",
          pt: "64px" 
        }}
      >
        {menuContent}
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
          width: { md: `calc(100% - ${drawerWidth}px)` }, // Se adapta dinámicamente en desktop
          bgcolor: isDarkMode ? "#0b0e11" : "#f8fafc"
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
        <Card sx={{ backgroundColor: isDarkMode ? "#15181e" : "#ffffff", borderRadius: 3, border: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0", maxWidth: 450, width: "100%", boxShadow: 24 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800} color={isDarkMode ? "white" : "#0f172a"}>
                Movimiento de Fondos
              </Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: isDarkMode ? "#9ca3af" : "#475569", "&:hover": { color: isDarkMode ? "white" : "#0f172a" } }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Typography color={isDarkMode ? "gray" : "#64748b"} variant="body2" sx={{ mb: 3 }}>
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
                  inputLabel: { style: { color: isDarkMode ? "#9ca3af" : "#64748b" } },
                  htmlInput: { min: "0", step: "any", style: { color: isDarkMode ? "white" : "#0f172a", fontWeight: 600 } },
                  input: {
                    startAdornment: <InputAdornment position="start" sx={{ "& .MuiTypography-root": { color: "#4caf50", fontWeight: 700 } }}>$</InputAdornment>,
                  }
                }}
               sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: isDarkMode ? "#0b0e11" : "#f1f5f9",
                        "& fieldset": { borderColor: isDarkMode ? "#2d3748" : "#cbd5e1" },
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