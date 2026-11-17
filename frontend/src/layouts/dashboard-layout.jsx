// src/components/layout/dashboard-layout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  Box, AppBar, Toolbar, Typography, Avatar, IconButton, Stack,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse,
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
import AccountBox from "@mui/icons-material/AccountBox";
import Shield from "@mui/icons-material/Shield";
import Help from "@mui/icons-material/Help"; 
import DarkMode from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu"; 
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";

// Importamos el componente independiente de caja grande
import CashDialog from "../pages/cash-page";
import { getCurrentUserProfile } from "../services/auth-service";

const drawerWidth = 250;

function DashboardLayout() {
  const navigate = useNavigate();
  
  // Estado para el menú flotante del perfil
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Estado local para el Switch de Modo Oscuro sincronizado con localStorage
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") !== "light");
  
  // Controla la apertura del menú lateral en celulares
  const [mobileOpen, setMobileOpen] = useState(false);

  // Estados para controlar qué menú está desplegado (Dropdowns)
  const [openAccount, setOpenAccount] = useState(false);
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openTrading, setOpenTrading] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);

  // Controla la apertura del diálogo grande de caja
  const [openCashModal, setOpenCashModal] = useState(false);

  // Estado del usuario activo logueado
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sincronizar el estado del switch si cambia desde la página de Settings
  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      setIsDarkMode(currentTheme === "dark");
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  // Cargar y sincronizar perfil del usuario conectado desde el backend
  useEffect(() => {
    let isMounted = true;
    async function loadUserProfile() {
      const token = localStorage.getItem("access");
      if (!token) return;
      try {
        const data = await getCurrentUserProfile();
        if (isMounted && data) {
          setCurrentUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("No se pudo sincronizar perfil remoto en layout:", err);
      }
    }
    loadUserProfile();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

          <ListItemButton onClick={() => { setOpenCashModal(true); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
            <ListItemText primary="Ingresar / Retirar Dinero" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/investor-profile"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
            <ListItemText primary="Perfil del Inversor" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
        </List>
      </Collapse>

      {/* 2. MERCADOS */}
      <ListItemButton onClick={() => setOpenMarkets(!openMarkets)}>
        <ListItemIcon sx={iconContainerStyle("rgba(33, 150, 243, 0.15)")}>
          <ChartIcon sx={{ color: "#2196f3", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Mercados" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
        {openMarkets ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
      </ListItemButton>

      <Collapse in={openMarkets} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 3.5 }}>
          <ListItemButton onClick={() => { navigate("/markets"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
            <ListItemText primary="Cotizaciones en Vivo" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/favorites"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
            <ListItemText primary="Mis Favoritos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/technical-analysis"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#2196f3" }} />
            <ListItemText primary="Análisis Técnico" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
        </List>
      </Collapse>

      {/* 3. OPERAR */}
      <ListItemButton onClick={() => setOpenTrading(!openTrading)}>
        <ListItemIcon sx={iconContainerStyle("rgba(255, 152, 0, 0.15)")}>
          <SwapHoriz sx={{ color: "#ff9800", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Operar" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
        {openTrading ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
      </ListItemButton>

      <Collapse in={openTrading} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 3.5 }}>
          <ListItemButton onClick={() => { navigate("/trading"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#ff9800" }} />
            <ListItemText primary="Operar Activos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/cautions"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#ff9800" }} />
            <ListItemText primary="Cauciones (Tasa Fija)" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/stop-loss-alerts"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#ff9800" }} />
            <ListItemText primary="Stop-Loss & Alertas" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
        </List>
      </Collapse>

      {/* 4. PORTFOLIO & REPORTES */}
      <ListItemButton onClick={() => setOpenPortfolio(!openPortfolio)}>
        <ListItemIcon sx={iconContainerStyle("rgba(156, 39, 176, 0.15)")}>
          <ChartIcon sx={{ color: "#9c27b0", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Portfolio" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
        {openPortfolio ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
      </ListItemButton>

      <Collapse in={openPortfolio} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 3.5 }}>
          <ListItemButton onClick={() => { navigate("/composition"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
            <ListItemText primary="Composición de Tenencias" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/reports"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
            <ListItemText primary="Reporte de Rendimiento" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/history"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
            <ListItemText primary="Historial de Transacciones" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>

          <ListItemButton onClick={() => { navigate("/wealth-projection"); setMobileOpen(false); }} sx={{ py: 0.6 }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
            <ListItemText primary="Proyección Patrimonial" slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </ListItemButton>
        </List>
      </Collapse>

      {/* 5. CONFIGURACIÓN */}
      <ListItemButton onClick={() => { navigate("/settings"); setMobileOpen(false); }}>
        <ListItemIcon sx={iconContainerStyle("rgba(100, 116, 139, 0.15)")}>
          <Settings sx={{ color: "#94a3b8", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primary="Configuración" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
      </ListItemButton>
    </List>
  );

  const formatComitenteNumber = (acc) => {
    if (!acc) return "CC N° 000001";
    if (typeof acc === "string" && acc.startsWith("CC N° ")) return acc;
    const digits = String(acc).replace(/\D/g, "");
    const num = digits ? parseInt(digits, 10) : 1;
    return `CC N° ${String(num).padStart(5, "0")}`;
  };

  const displayedUserName = currentUser?.full_name || currentUser?.username || "Mi Cuenta";
  const displayedAccountNumber = formatComitenteNumber(currentUser?.account_number);

  return (
    <Box sx={{ display: "flex", bgcolor: isDarkMode ? "#0b0e11" : "#f8fafc", minHeight: "100vh" }}>
      
      {/* ================= BARRA SUPERIOR (HEADER) ================= */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          bgcolor: isDarkMode ? "#15181e" : "#ffffff", 
          borderBottom: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0" 
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: "24px !important" }}>
          
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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

            <Stack 
              direction="row" 
              spacing={1.5} 
              onClick={() => navigate("/")}
              sx={{ 
                alignItems: "center",
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

          {/* Menú de Usuario en Esquina Superior Derecha */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Stack 
              direction="row" 
              spacing={1.5} 
              onClick={handleMenuOpen} 
              sx={{ 
                alignItems: "center",
                cursor: 'pointer', 
                p: 0.8, 
                px: 1.5,
                borderRadius: 2, 
                border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                '&:hover': { bgcolor: isDarkMode ? '#1c2025' : '#f1f5f9' },
                transition: "all 0.2s"
              }}
            >
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: isDarkMode ? "white" : "#0f172a", lineHeight: 1.2 }}>
                  {displayedUserName}
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: "#4caf50", fontSize: "0.75rem" }}>
                  {displayedAccountNumber}
                </Typography>
              </Box>

              <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(76, 175, 80, 0.15)", border: "1px solid #4caf50", color: "#4caf50", fontWeight: 700, fontSize: "0.9rem" }}>
                {displayedUserName.charAt(0).toUpperCase()}
              </Avatar>
            </Stack>

            {/* Menú Desplegable del Perfil Optimizado y Responsivo */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              disableScrollLock
              slotProps={{
                paper: {
                  sx: { 
                    bgcolor: isDarkMode ? "#15181e" : "#ffffff", 
                    color: isDarkMode ? "white" : "#0f172a", 
                    border: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0", 
                    mt: 1.5,
                    minWidth: 280,
                    maxWidth: 340,
                    borderRadius: 2,
                    boxShadow: isDarkMode ? "0px 10px 30px rgba(0,0,0,0.6)" : "0px 10px 30px rgba(0,0,0,0.08)",
                    "& .MuiMenuItem-root": {
                      fontSize: "0.88rem",
                      py: 1.2,
                      color: isDarkMode ? "#9ca3af" : "#475569",
                      "&:hover": { bgcolor: isDarkMode ? "#1c2025" : "#f1f5f9", color: isDarkMode ? "white" : "#0f172a" }
                    }
                  }
                }
              }}
            >
              {/* Tarjeta de Identificación del Usuario y Cuenta Comitente */}
              <Box sx={{ px: 2.5, py: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: "rgba(76, 175, 80, 0.15)", border: "1px solid #4caf50", color: "#4caf50", fontWeight: 700 }}>
                    {displayedUserName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="subtitle2" fontWeight={800} color={isDarkMode ? "white" : "#0f172a"} noWrap>
                      {displayedUserName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? "#9ca3af" : "#64748b" }} noWrap display="block">
                      {currentUser?.email || "usuario@peakinvestments.ar"}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mt: 1.8, p: 1.2, borderRadius: 1.5, bgcolor: isDarkMode ? "#0b0e11" : "#f1f5f9", border: isDarkMode ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? "#9ca3af" : "#64748b", display: "block", textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 0.5 }}>
                    Cuenta Comitente Asignada
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#4caf50">
                    {displayedAccountNumber}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: isDarkMode ? "#1c2025" : "#e2e8f0", my: "0 !important" }} />

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

              {/* Si es Superusuario o Staff: Acceso rápido a Django Admin */}
              {(currentUser?.is_superuser || currentUser?.is_staff) && (
                <MenuItem 
                  component="a" 
                  href="http://localhost:8000/admin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleMenuClose}
                  sx={{ color: "#ff9800 !important" }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: "#ff9800" }}>
                    <AdminPanelSettings sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  Django Admin (Noticias / CMS)
                </MenuItem>
              )}

              <Divider sx={{ bgcolor: isDarkMode ? "#1c2025" : "#e2e8f0", my: "4px !important" }} />

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

      {/* ================= SIDEBAR (MÓVIL Y DESKTOP) ================= */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} 
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
        <Toolbar /> 
        {menuContent}
      </Drawer>

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

      {/* ================= PANEL CENTRAL ================= */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 }, 
          pt: { xs: "80px", md: "88px" }, 
          minHeight: "100vh",
          overflowX: "hidden",
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          bgcolor: isDarkMode ? "#0b0e11" : "#f8fafc"
        }}
      >
        <Outlet />
      </Box>

      {/* ================= MODAL GRANDE DE CAJA (ESTILO PPI/BIND) ================= */}
      <CashDialog 
        open={openCashModal} 
        onClose={() => setOpenCashModal(false)} 
        onSuccess={() => window.location.reload()} 
      />

    </Box>
  );
}

export default DashboardLayout;