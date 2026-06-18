// src/components/Sidebar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer, Box, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Collapse
} from "@mui/material";

// Importaciones directas de iconos de consistencia
import LogoIcon from "@mui/icons-material/QueryStats";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import ChartIcon from "@mui/icons-material/BarChart";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import Settings from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";

const drawerWidth = 250;

function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();

  // Estados locales para los submenús colapsables dentro de la versión responsive/mobile
  const [openAccount, setOpenAccount] = useState(false);
  const [openMarkets, setOpenMarkets] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);
  const [openTrading, setOpenTrading] = useState(false);

  // Estilo idéntico de contenedores circulares de iconos del Layout
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

  const drawerContent = (
    <Box sx={{ bgcolor: "#15181e", height: "100%", color: "#9ca3af" }}>
      <Toolbar sx={{ borderBottom: "1px solid #1c2025", px: "24px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LogoIcon sx={{ color: "#4caf50", fontSize: 26 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing={0.5} sx={{ color: "white", fontSize: "1.05rem" }}>
            PEAK INVESTMENTS
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ 
        px: 1.5, 
        py: 3, 
        "& .MuiListItemButton-root": { 
          borderRadius: 2, 
          mb: 0.5, 
          color: "#9ca3af", 
          "&:hover": { bgcolor: "#1c2025", color: "white" } 
        } 
      }}>
        
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
            <ListItemButton onClick={() => { navigate("/"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
              <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
              <ListItemText primary="Estado de Cuenta" slotProps={{ primary: { fontSize: "0.85rem" } }} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate("/reports"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
              <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
              <ListItemText primary="Rendimiento e Informes" slotProps={{ primary: { fontSize: "0.85rem" } }} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate("/investor-profile"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
              <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#4caf50" }} />
              <ListItemText primary="Perfil de Inversor" slotProps={{ primary: { fontSize: "0.85rem" } }} />
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
            <ListItemButton onClick={() => { navigate("/markets"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
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
            <ListItemButton onClick={() => { navigate("/composition"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
              <FiberManualRecord sx={{ fontSize: 6, mr: 1.5, color: "#9c27b0" }} />
              <ListItemText primary="Composición de Activos" slotProps={{ primary: { fontSize: "0.85rem" } }} />
            </ListItemButton>
            <ListItemButton onClick={() => { navigate("/history"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
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
            <ListItemButton onClick={() => { navigate("/trading"); if(onClose) onClose(); }} sx={{ py: 0.6 }}>
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
        <ListItemButton onClick={() => { navigate("/settings"); if(onClose) onClose(); }} sx={{ mt: 2 }}>
          <ListItemIcon sx={iconContainerStyle("rgba(144, 164, 174, 0.2)")}>
            <Settings sx={{ color: "#90a4ae", fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Settings" slotProps={{ primary: { fontSize: "0.9rem", fontWeight: 600 } }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#15181e",
            borderRight: "1px solid #1c2025",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar (Temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#15181e",
            borderRight: "1px solid #1c2025",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;