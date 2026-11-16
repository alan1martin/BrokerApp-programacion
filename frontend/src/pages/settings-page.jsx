// src/pages/settings-page.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { 
  Typography, Stack, Card, CardContent, Button, Divider, Alert, 
  TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Accordion, 
  AccordionSummary, AccordionDetails, Grid, Tabs, Tab, Chip, Avatar
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ShieldIcon from "@mui/icons-material/Shield";
import HelpIcon from "@mui/icons-material/Help";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageHeader from "../components/layout/page-header";

import { resetAccount } from "../services/portfolio-service";
import { getCurrentUserProfile } from "../services/auth-service";

function SettingsPage({ loadingMarket }) {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "profile"; 

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "es");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Usuario sincronizado con el backend
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profileData, setProfileData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    dni: user?.dni || "",
    account_number: user?.account_number || "CC-000000",
    investorType: "Moderado"
  });

  const [notifications, setNotifications] = useState({ priceAlerts: true, weeklySummary: false });
  const [passwordData, setPasswordData] = useState({ current: "", newPassword: "" });

  // Carga inicial del perfil de usuario desde Django
  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      try {
        const data = await getCurrentUserProfile();
        if (isMounted && data) {
          setUser(data);
          setProfileData(prev => ({
            ...prev,
            name: data.full_name || prev.name,
            email: data.email || prev.email,
            dni: data.dni || prev.dni,
            account_number: data.account_number || prev.account_number,
          }));
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("No se pudo cargar el perfil para settings:", err);
      }
    }
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  // Escuchar cambios de tema del layout
  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      setTheme(currentTheme);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.dispatchEvent(new Event("storage"));
  };

  const handleReset = async () => {
    if (!window.confirm("¿Estás absolutamente seguro de resetear tu cuenta?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await resetAccount();
      localStorage.removeItem("simulated_portfolio");
      localStorage.removeItem("simulated_history");
      setMessage({ type: "success", text: data.message || "Cuenta restablecida con éxito." });
    } catch {
      const defaultPortfolio = { cash: 10000.00, positions: [] };
      localStorage.setItem("simulated_portfolio", JSON.stringify(defaultPortfolio));
      localStorage.setItem("simulated_history", JSON.stringify([]));
      setMessage({ type: "success", text: "[Modo Simulación] Cuenta restablecida localmente." });
    } finally {
      if (typeof loadingMarket === "function") loadingMarket();
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  const customInputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDark ? "#0b0e11" : "#f8fafc",
      "& fieldset": { borderColor: isDark ? "#1c2025" : "#cbd5e1" },
      "&:hover fieldset": { borderColor: "#4caf50" },
      "&.Mui-focused fieldset": { borderColor: "#4caf50" }
    },
    "& .MuiInputLabel-root": { color: isDark ? "#9ca3af" : "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" }
  };

  return (
    <Box sx={{ width: "100%", color: isDark ? "white" : "#0f172a" }}>
      
      {/* ================= ENCABEZADO ESTANDARIZADO (COMO CAUCIONES / ALERTAS) ================= */}
      <PageHeader
        icon={SettingsIcon}
        title="Configuración & Perfil"
        subtitle="Gestioná los parámetros de tu perfil comitente, credenciales de seguridad y preferencias del sistema."
        iconColor="#9e9e9e"
      />

      {/* ================= PESTAÑAS RESPONSIVAS Y FLUIDAS (ESTILO STOP-LOSS) ================= */}
      <Paper sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2, mb: 4, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => navigate(`/settings/${val}`)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { color: isDark ? "gray" : "#64748b", fontWeight: 700, textTransform: "none", fontSize: "0.95rem", py: 1.5 },
            "& .Mui-selected": { color: "#4caf50 !important" },
            "& .MuiTabs-indicator": { display: "none" }
          }}
        >
          <Tab icon={<AccountBoxIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Mi Perfil" value="profile" />
          <Tab icon={<ShieldIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Seguridad" value="security" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Preferencias" value="config" />
          <Tab icon={<HelpIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Centro de Ayuda" value="help" />
        </Tabs>
      </Paper>

      {message && (
        <Alert severity={message.type} variant="filled" sx={{ mb: 3, borderRadius: 1.5 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* ================= TAB 1: MI PERFIL (FULL-WIDTH RESPONSIVE CON FICHA COMITENTE) ================= */}
      {activeTab === "profile" && (
        <Grid container spacing={3}>
          {/* Columna Izquierda: Datos Personales Editables */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" fontWeight={700} color="#3b82f6" sx={{ mb: 1 }}>
                  Información Personal y de Contacto
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                  Datos declarados para la titularidad de tu cuenta de inversión.
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    label="Nombre Completo"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    variant="outlined"
                    fullWidth
                    slotProps={{ htmlInput: { style: { color: isDark ? 'white' : '#0f172a', fontWeight: 600 } } }}
                    sx={customInputStyles}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Correo Electrónico"
                        value={profileData.email}
                        disabled
                        variant="outlined"
                        fullWidth
                        slotProps={{ htmlInput: { style: { color: isDark ? '#9ca3af' : '#64748b' } } }}
                        sx={customInputStyles}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Documento Nacional (DNI)"
                        value={profileData.dni}
                        disabled
                        variant="outlined"
                        fullWidth
                        slotProps={{ htmlInput: { style: { color: isDark ? '#9ca3af' : '#64748b' } } }}
                        sx={customInputStyles}
                      />
                    </Grid>
                  </Grid>

                  <FormControl fullWidth sx={customInputStyles}>
                    <InputLabel id="investor-type-label">Tipo de Inversor</InputLabel>
                    <Select
                      labelId="investor-type-label"
                      value={profileData.investorType}
                      onChange={(e) => setProfileData({ ...profileData, investorType: e.target.value })}
                      label="Tipo de Inversor"
                      sx={{ color: isDark ? "white" : "#0f172a", "& .MuiSvgIcon-root": { color: "#9ca3af" } }}
                      MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#15181e" : "#ffffff", color: isDark ? "white" : "#0f172a", border: "1px solid #1c2025" } } }}
                    >
                      <MenuItem value="Conservador">Conservador 🛡️ (Preservación de capital y renta fija)</MenuItem>
                      <MenuItem value="Moderado">Moderado ⚖️ (Equilibrio entre crecimiento y riesgo)</MenuItem>
                      <MenuItem value="Agresivo">Agresivo 🚀 (Máximo rendimiento en renta variable)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ pt: 1 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => setMessage({ type: "success", text: "Datos de perfil actualizados con éxito." })}
                      sx={{ backgroundColor: "#3b82f6", fontWeight: 700, textTransform: "none", py: 1.2, px: 3, borderRadius: 1.5, "&:hover": { backgroundColor: "#2563eb" } }}
                    >
                      Guardar Cambios de Perfil
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Columna Derecha: Tarjeta de Cuenta Comitente Oficial */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2, height: "100%" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} color="#4caf50">
                    Ficha Comitente
                  </Typography>
                  <Chip 
                    icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: "#4caf50" }} />} 
                    label="Verificada y Activa" 
                    size="small" 
                    sx={{ bgcolor: "rgba(76, 175, 80, 0.12)", color: "#4caf50", fontWeight: 700, border: "1px solid rgba(76, 175, 80, 0.3)" }} 
                  />
                </Stack>

                <Box sx={{ p: 2.5, bgcolor: isDark ? "#0b0e11" : "#f1f5f9", borderRadius: 2, border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", mb: 3 }}>
                  <Typography variant="caption" color="gray" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Número de Cuenta Comitente
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#4caf50" sx={{ letterSpacing: 0.5, mt: 0.5 }}>
                    {profileData.account_number}
                  </Typography>
                  <Typography variant="caption" color="gray" sx={{ display: "block", mt: 0.5 }}>
                    Asignado automáticamente y vinculado a tu DNI {profileData.dni || "en trámite"}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <BadgeIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="gray">Titular Principal</Typography>
                      <Typography variant="body2" fontWeight={700}>{profileData.name || user?.username}</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: isDark ? "#1c2025" : "#e2e8f0" }} />

                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <EmailIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="gray">Email Registrado</Typography>
                      <Typography variant="body2" fontWeight={700}>{profileData.email}</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: isDark ? "#1c2025" : "#e2e8f0" }} />

                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <AccountBalanceWalletIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="gray">Moneda Base de Operación</Typography>
                      <Typography variant="body2" fontWeight={700}>Dólar Estadounidense (USD) & Pesos (ARS)</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= TAB 2: SEGURIDAD (FULL-WIDTH RESPONSIVE) ================= */}
      {activeTab === "security" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" fontWeight={700} color="#4caf50" sx={{ mb: 1 }}>
                  Cambio de Contraseña
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                  Mantené segura tu cuenta actualizando periódicamente tus credenciales.
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    type="password"
                    label="Contraseña Actual"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    fullWidth
                    slotProps={{ htmlInput: { style: { color: isDark ? 'white' : '#0f172a' } } }}
                    sx={customInputStyles}
                  />
                  <TextField
                    type="password"
                    label="Nueva Contraseña"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    fullWidth
                    slotProps={{ htmlInput: { style: { color: isDark ? 'white' : '#0f172a' } } }}
                    sx={customInputStyles}
                  />
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => setMessage({ type: "success", text: "Contraseña actualizada exitosamente." })}
                    sx={{ fontWeight: 700, textTransform: "none", py: 1.2, borderRadius: 1.5, bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
                  >
                    Actualizar Contraseña
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" fontWeight={700} color="white" sx={{ mb: 1 }}>
                  Historial de Sesiones Activas
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
                  Dispositivos autorizados que han accedido recientemente.
                </Typography>

                <TableContainer component={Paper} sx={{ backgroundColor: isDark ? "#0b0e11" : "#f8fafc", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", elevation: 0, boxShadow: "none", borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: isDark ? "#15181e" : "#f1f5f9" }}>
                      <TableRow>
                        <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 700, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Dispositivo</TableCell>
                        <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 700, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Ubicación</TableCell>
                        <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 700, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: isDark ? "white" : "#0f172a", borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", fontWeight: 600 }}>Navegador Web (Sesión Actual)</TableCell>
                        <TableCell sx={{ color: isDark ? "gray" : "#64748b", borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Argentina</TableCell>
                        <TableCell sx={{ borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>
                          <Chip label="Conectado" size="small" sx={{ bgcolor: "rgba(76, 175, 80, 0.15)", color: "#4caf50", fontWeight: 700, fontSize: "0.75rem" }} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= TAB 3: PREFERENCIAS & RESET (FULL-WIDTH RESPONSIVE) ================= */}
      {activeTab === "config" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" fontWeight={700} color="#9c27b0" sx={{ mb: 2 }}>
                  Preferencias del Sistema & Notificaciones
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth sx={customInputStyles}>
                      <InputLabel id="language-select-label">Idioma de la Interfaz</InputLabel>
                      <Select 
                        labelId="language-select-label"
                        value={lang} 
                        onChange={handleLanguageChange} 
                        label="Idioma de la Interfaz" 
                        sx={{ color: isDark ? "white" : "#0f172a", "& .MuiSvgIcon-root": { color: "#9ca3af" } }}
                        MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#15181e" : "#ffffff", color: isDark ? "white" : "#0f172a", border: "1px solid #1c2025" } } }}
                      >
                        <MenuItem value="es">Español 🇦🇷 (Predeterminado)</MenuItem>
                        <MenuItem value="en">English 🇺🇸</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={notifications.priceAlerts} 
                          onChange={(e) => setNotifications({ ...notifications, priceAlerts: e.target.checked })} 
                          sx={{ color: isDark ? "#2d3748" : "#cbd5e1", "&.Mui-checked": { color: "#4caf50" } }} 
                        />
                      }
                      label={<Typography variant="body2" color={isDark ? "#9ca3af" : "#475569"}>Alertas automáticas de variaciones de precio en cartera (&gt; 5%)</Typography>}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: isDark ? "#1c2025" : "#e2e8f0", my: 4 }} />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#f44336" sx={{ mb: 1.5 }}>
                    Zona de Peligro ⚠️
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ bgcolor: "rgba(244, 67, 54, 0.05)", p: 2.5, borderRadius: 2, border: "1px solid rgba(244, 67, 54, 0.2)" }}>
                    <Stack>
                      <Typography fontWeight={700} color={isDark ? "white" : "#0f172a"} variant="body1">Reiniciar Simulador</Typography>
                      <Typography color={isDark ? "gray" : "#64748b"} variant="body2">Borra todo tu historial de transacciones ficticias y reestablece el saldo de tu cuenta comitente a $10,000 USD iniciales.</Typography>
                    </Stack>
                    <Button 
                      variant="contained" 
                      color="error" 
                      startIcon={<RestartAltIcon />} 
                      onClick={handleReset} 
                      disabled={loading} 
                      sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5, bgcolor: "#f44336", px: 3, py: 1.2, "&:hover": { bgcolor: "#d32f2f" }, whiteSpace: "nowrap" }}
                    >
                      {loading ? "Restableciendo..." : "Resetear Cuenta"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= TAB 4: CENTRO DE AYUDA (FULL-WIDTH RESPONSIVE) ================= */}
      {activeTab === "help" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ bgcolor: isDark ? "#15181e" : "#ffffff", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" fontWeight={700} color="#00a152" sx={{ mb: 1 }}>
                  Centro de Ayuda / Soporte
                </Typography>
                <Typography variant="body2" color="gray" sx={{ mb: 3 }}>
                  Preguntas frecuentes y respuestas sobre el funcionamiento del broker y la cuenta comitente.
                </Typography>

                <Stack spacing={2}>
                  {[
                    {
                      q: "¿Cómo funciona la asignación de Cuenta Comitente?",
                      a: "Al registrarte, el sistema asigna automáticamente un número de cuenta comitente único (ej: CC-XXXXXX) persistido en la base de datos que identifica todas tus tenencias, órdenes comerciales y movimientos de efectivo."
                    },
                    {
                      q: "¿Cómo funciona la actualización de cotizaciones?",
                      a: "Las criptomonedas cotizan de forma continua las 24 horas, los 7 días de la semana. Por otro lado, los activos de renta variable tradicional y del mercado local argentino (como CEDEARs, Acciones y Bonos soberanos como el AL30) operan en el horario de mercado: de 10:30 hs a 17:00 hs."
                    },
                    {
                      q: "¿Por qué es importante completar el Test de Perfil de Inversor?",
                      a: "El test evalúa tu tolerancia al riesgo y tus objetivos financieros. Con este perfil (Conservador, Moderado o Agresivo), el broker te sugiere la cartera adecuada disminuyendo la volatilidad no deseada."
                    },
                    {
                      q: "¿Qué son los Cedears y cómo operan en la plataforma?",
                      a: "Los Cedears (Certificados de Depósito Argentinos) te permiten invertir en grandes empresas globales (como Apple, Tesla o Nvidia) siguiendo la cotización original del activo y el tipo de cambio financiero."
                    },
                    {
                      q: "¿Qué es una Caución Bursátil y qué garantías ofrece?",
                      a: "Es una colocación de muy corto plazo (1 a 14 días) garantizada y liquidada por el mercado. Es el equivalente bursátil a un plazo fijo con liquidez casi inmediata."
                    }
                  ].map((faq, index) => (
                    <Accordion
                      key={index}
                      sx={{
                        backgroundColor: isDark ? "#0b0e11" : "#f8fafc",
                        color: isDark ? "white" : "#1e293b",
                        border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0",
                        borderRadius: "8px !important",
                        boxShadow: "none",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#3b82f6" }} />}
                        sx={{ px: 3, "& .MuiAccordionSummary-content": { my: 1.5 } }}
                      >
                        <Typography fontWeight={700} color="#3b82f6" variant="subtitle2">
                          {faq.q}
                        </Typography>
                      </AccordionSummary>
                      
                      <AccordionDetails
                        sx={{
                          px: 3,
                          pb: 2.5,
                          pt: 0,
                          borderTop: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0",
                          backgroundColor: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"
                        }}
                      >
                        <Typography color={isDark ? "#9ca3af" : "#475569"} variant="body2" sx={{ lineHeight: 1.7, pt: 1.5 }}>
                          {faq.a}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

    </Box>
  );
}

export default SettingsPage;
