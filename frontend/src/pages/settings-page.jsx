// src/pages/settings-page.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import { 
  Typography, Stack, Card, CardContent, Button, Divider, Alert, 
  TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Accordion, 
  AccordionSummary, AccordionDetails
} from "@mui/material";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { resetAccount } from "../services/portfolio-service";
import { translations } from "../constants/translations";

function SettingsPage({ loadingMarket }) {
  const { tab } = useParams();
  const activeTab = tab || "profile"; 

  const [lang, setLang] = useState(localStorage.getItem("lang") || "es");
  // Escuchamos el estado del tema directamente desde localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [profileData, setProfileData] = useState({ name: "Martín Alloatti", investorType: "Moderado" });
  const [notifications, setNotifications] = useState({ priceAlerts: true, weeklySummary: false });
  const [passwordData, setPasswordData] = useState({ current: "", newPassword: "" });

  const t = translations[lang] || translations["es"];

  // Efecto que reacciona a los cambios de tema del sistema y del almacenamiento local
  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      setTheme(currentTheme);
    };

    // Escuchar eventos si se cambia el tema desde el Layout de la Navbar
    window.addEventListener("storage", handleStorageChange);
    // Un pequeño intervalo de respaldo para asegurar sincronización inmediata en la misma pestaña
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
    window.dispatchEvent(new Event("storage")); // Notifica el cambio de configuración
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
    } catch (error) {
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

  // Estilos adaptativos según el modo visual activo
  const customInputStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: isDark ? "#222731" : "#cbd5e1" },
      "&:hover fieldset": { borderColor: "#4caf50" },
      "&.Mui-focused fieldset": { borderColor: "#4caf50" }
    },
    "& .MuiInputLabel-root": { color: isDark ? "gray" : "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" }
  };

  return (
    // CONTENEDOR PRINCIPAL: Centra todo el bloque en la pantalla eliminando el vacío derecho
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2, px: { xs: 1, sm: 3 } }}>
      <Stack spacing={4} sx={{ width: "100%", maxWidth: 750 }}>
        
        <Stack spacing={0.5} sx={{ textAlign: { xs: "left", sm: "center" } }}>
          <Typography variant="h4" fontWeight={800} color={isDark ? "white" : "#0f172a"}>
            Configuración de la Cuenta
          </Typography>
          <Typography color={isDark ? "gray" : "#64748b"} variant="body2">
            Gestioná los parámetros de tu perfil y del simulador financiero de Peak Investments.
          </Typography>
        </Stack>

        {message && (
          <Alert severity={message.type} variant="filled" sx={{ borderRadius: 1.5 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Card sx={{ backgroundColor: isDark ? "#15181e" : "#ffffff", borderRadius: 3, border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", boxShadow: isDark ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            
            {/* SECCIÓN: PERFIL */}
            {activeTab === "profile" && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700} color="#3b82f6">Información Personal</Typography>
                <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 450, mx: "auto" }}>
                  <TextField
                    label="Nombre Completo"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    variant="outlined"
                    inputProps={{ style: { color: isDark ? 'white' : '#0f172a', fontWeight: 500 } }}
                    sx={customInputStyles}
                  />
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
                      <MenuItem value="Conservador" sx={{ "&:hover": { bgcolor: isDark ? "#1c2025" : "#f1f5f9" } }}>Conservador 🛡️</MenuItem>
                      <MenuItem value="Moderado" sx={{ "&:hover": { bgcolor: isDark ? "#1c2025" : "#f1f5f9" } }}>Moderado ⚖️</MenuItem>
                      <MenuItem value="Agresivo" sx={{ "&:hover": { bgcolor: isDark ? "#1c2025" : "#f1f5f9" } }}>Agresivo 🚀</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" sx={{ backgroundColor: "#3b82f6", fontWeight: 700, mt: 1, textTransform: "none", py: 1.2, borderRadius: 1.5, "&:hover": { backgroundColor: "#2563eb" } }}>
                    Guardar Cambios
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* SECCIÓN: SEGURIDAD */}
            {activeTab === "security" && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700} color="#4caf50">Seguridad de la Cuenta</Typography>
                <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 450, mx: "auto" }}>
                  <TextField
                    type="password"
                    label="Contraseña Actual"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    inputProps={{ style: { color: isDark ? 'white' : '#0f172a' } }}
                    sx={customInputStyles}
                  />
                  <TextField
                    type="password"
                    label="Nueva Contraseña"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    inputProps={{ style: { color: isDark ? 'white' : '#0f172a' } }}
                    sx={customInputStyles}
                  />
                  <Button variant="contained" color="success" sx={{ fontWeight: 700, textTransform: "none", py: 1.2, borderRadius: 1.5, bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}>
                    Actualizar Seguridad
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  <Typography fontWeight={600} color={isDark ? "white" : "#0f172a"} variant="body2">Historial de Sesiones</Typography>
                  <TableContainer component={Paper} sx={{ backgroundColor: isDark ? "#0b0e11" : "#f8fafc", border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0", elevation: 0, boxShadow: "none" }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: isDark ? "#15181e" : "#f1f5f9" }}>
                        <TableRow>
                          <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 600, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Dispositivo</TableCell>
                          <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 600, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Ubicación</TableCell>
                          <TableCell sx={{ color: isDark ? "gray" : "#64748b", fontWeight: 600, borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Fecha / Hora</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ color: isDark ? "white" : "#0f172a", borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Chrome (Actual)</TableCell>
                          <TableCell sx={{ color: isDark ? "white" : "#0f172a", borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Rafaela, Argentina</TableCell>
                          <TableCell sx={{ color: isDark ? "white" : "#0f172a", borderBottom: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0" }}>Hoy, hace momentos</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Stack>
            )}

            {/* SECCIÓN: CONFIGURACIÓN (PREFERENCIAS) */}
            {activeTab === "config" && (
              <Stack spacing={4}>
                <Typography variant="h6" fontWeight={700} color="#9c27b0">Preferencias del Sistema</Typography>
                <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
                  <FormControl sx={{ minWidth: 220, ...customInputStyles }}>
                    <InputLabel id="language-select-label">Idioma de la Interfaz</InputLabel>
                    <Select 
                      labelId="language-select-label"
                      value={lang} 
                      onChange={handleLanguageChange} 
                      label="Idioma de la Interfaz" 
                      sx={{ color: isDark ? "white" : "#0f172a", "& .MuiSvgIcon-root": { color: "#9ca3af" } }}
                      MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#15181e" : "#ffffff", color: isDark ? "white" : "#0f172a", border: "1px solid #1c2025" } } }}
                    >
                      {/* BANDERAS Y SIGLAS AJUSTADAS */}
                      <MenuItem value="es" sx={{ "&:hover": { bgcolor: isDark ? "#1c2025" : "#f1f5f9" } }}>Español 🇦🇷</MenuItem>
                      <MenuItem value="en" sx={{ "&:hover": { bgcolor: isDark ? "#1c2025" : "#f1f5f9" } }}>English 🇺🇸</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Stack spacing={1} sx={{ alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={notifications.priceAlerts} 
                        onChange={(e) => setNotifications({ ...notifications, priceAlerts: e.target.checked })} 
                        sx={{ color: isDark ? "#2d3748" : "#cbd5e1", "&.Mui-checked": { color: "#4caf50" } }} 
                      />
                    }
                    label={<Typography variant="body2" color={isDark ? "#9ca3af" : "#475569"}>Alertas de Precios Extremos (Variación mayor al 5%)</Typography>}
                  />
                </Stack>

                <Divider sx={{ borderColor: isDark ? "#1c2025" : "#e2e8f0" }} />

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={700} color="#f44336">Zona de Peligro ⚠️</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ bgcolor: "rgba(244, 67, 54, 0.05)", p: 2, borderRadius: 2, border: "1px solid rgba(244, 67, 54, 0.15)" }}>
                    <Stack>
                      <Typography fontWeight={600} color={isDark ? "white" : "#0f172a"} variant="body2">Reiniciar Simulador</Typography>
                      <Typography color={isDark ? "gray" : "#64748b"} variant="caption">Borra todo tu historial de órdenes comerciales y restablece tu saldo a $10,000 USD de caja.</Typography>
                    </Stack>
                    <Button variant="contained" color="error" startIcon={<RestartAltIcon />} onClick={handleReset} disabled={loading} sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5, bgcolor: "#f44336", "&:hover": { bgcolor: "#d32f2f" } }}>
                      {loading ? "Reseteando..." : "Resetear Cuenta"}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            )}

            {/* SECCIÓN: CENTRO DE AYUDA (FAQs Desplegables) */}
            {activeTab === "help" && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700} color="#00a152">
                  Centro de Ayuda / Soporte
                </Typography>

                {[
                  {
                    q: "¿Cómo funciona la actualización de cotizaciones?",
                    a: "Las criptomonedas cotizan de forma continua las 24 horas, los 7 días de la semana. Por otro lado, los activos de renta variable tradicional y del mercado local argentino (como CEDEARs, Acciones y Bonos soberanos como el AL30) operan estrictamente en el horario de mercado concurrente: de 10:30 hs a 17:00 hs."
                  },
                  {
                    q: "¿Por qué es importante completar el Test de Perfil de Inversor?",
                    a: "El test evalúa tu tolerancia al riesgo y tus objetivos financieros. Con este perfil (Conservador, Moderado o Agresivo), el simulador te sugerirá las herramientas más adecuadas para armar tu cartera estratégica disminuyendo el impacto de la volatilidad."
                  },
                  {
                    q: "¿Puedo volver a realizar el test de perfil de inversor?",
                    a: "Sí, totalmente. Si cambian tus objetivos de ahorro o tu horizonte de inversión, podés volver a realizar el cuestionario desde tu pestaña de Perfil. El sistema actualizará inmediatamente tus datos y las recomendaciones de activos."
                  },
                  {
                    q: "¿Qué son los Cedears y cómo operan en la plataforma?",
                    a: "Los Cedears (Certificados de Depósito Argentinos) te permiten invertir desde tu cuenta local y en pesos en grandes empresas globales (como Apple, Tesla o Nvidia). Siguen el movimiento de la acción externa y los cambios del dólar financiero."
                  },
                  {
                    q: "¿Qué es un Fondo Común de Inversión (FCI) Money Market?",
                    a: "Es un instrumento ideal para perfiles conservadores que busca ganarle un poco a la inflación diaria manteniendo liquidez inmediata. Podés suscribir o rescatar el saldo simulado en cualquier momento para usar el efectivo."
                  },
                  {
                    q: "¿Cómo se guardan mis progresos y transacciones?",
                    a: "Para que no pierdas nada de tu experiencia de trading ficticio, todas las operaciones ejecutadas, saldos disponibles, perfiles calculados e historiales se almacenan localmente y de manera segura en tu navegador mediante localStorage."
                  }
                ].map((faq, index) => (
                  <Accordion
                    key={index}
                    sx={{
                      backgroundColor: isDark ? "#0b0e11" : "#f8fafc",
                      color: isDark ? "white" : "#1e293b",
                      border: isDark ? "1px solid #1c2025" : "1px solid #e2e8f0",
                      borderRadius: "6px !important", // Mantiene el 1.5 de radio que tenías
                      boxShadow: "none",
                      "&:before": { display: "none" }, // Saca la línea separadora gris fea por defecto
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#3b82f6" }} />}
                      sx={{
                        px: 3,
                        "& .MuiAccordionSummary-content": { my: 1.5 }
                      }}
                    >
                      <Typography fontWeight={600} color="#3b82f6" variant="subtitle2">
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
                      <Typography 
                        color={isDark ? "#9ca3af" : "#475569"} 
                        variant="body2" 
                        sx={{ lineHeight: 1.6, pt: 2 }}
                      >
                        {faq.a}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}

          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default SettingsPage;