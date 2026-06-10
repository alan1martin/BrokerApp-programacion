// src/pages/settings-page.jsx
import { Typography, Stack, Card, CardContent, Button, Divider, Alert } from "@mui/material";
import { useState } from "react";
import { resetAccount } from "../services/portfolio-service";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = async () => {
    if (!window.confirm("¿Estás absolutamente seguro de resetear tu cuenta? Se borrará todo tu historial de trading y tu saldo volverá a $10,000 USD.")) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // 1. Intentamos resetear en el backend real (Django)
      const data = await resetAccount();
      
      // Si el backend responde bien, aprovechamos a limpiar también el fallback por consistencia
      localStorage.removeItem("simulated_portfolio");
      localStorage.removeItem("simulated_history");

      setMessage({ type: "success", text: data.message || "Cuenta restablecida con éxito en el servidor." });
    } catch (error) {
      console.warn("Backend inalcanzable para reset. Aplicando reconfiguración en modo simulación local...");
      
      // 2. FALLBACK: Si Django falla, reseteamos el motor de simulación local
      const defaultPortfolio = {
        cash: 10000.00,
        positions: []
      };
      
      localStorage.setItem("simulated_portfolio", JSON.stringify(defaultPortfolio));
      localStorage.setItem("simulated_history", JSON.stringify([]));

      setMessage({ 
        type: "success", 
        text: "[Modo Simulación] Tu cuenta local ha sido restablecida a $10,000 USD correctamente." 
      });
    } finally {
      loadingMarket(); // Fuerza al context a refrescar si tenés esa función disponible
      setLoading(false);
    }
  };

  return (
    <Stack spacing={4} sx={{ maxWidth: 600 }}>
      <Stack>
        <Typography variant="h4" fontWeight={700} color="white">
          Configuración de Cuenta
        </Typography>
        <Typography color="gray" variant="body2">
          Gestioná los parámetros de tu simulador financiero.
        </Typography>
      </Stack>

      {message && (
        <Alert severity={message.type} variant="filled">
          {message.text}
        </Alert>
      )}

      <Card sx={{ backgroundColor: "#15181e", borderRadius: 2, border: "1px solid #1c2025" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>
            Zona de Peligro
          </Typography>
          <Typography color="gray" variant="body2" sx={{ mb: 3 }}>
            Estas acciones son irreversibles. Tené cuidado al ejecutarlas.
          </Typography>
          
          <Divider sx={{ borderColor: "#222731", my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mt: 2 }}>
            <Stack>
              <Typography fontWeight={600} color="white">
                Reiniciar Simulador
              </Typography>
              <Typography color="gray" variant="caption">
                Borra el historial de compras/ventas y restablece los $10,000 USD iniciales.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              color="error"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={loading}
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5 }}
            >
              {loading ? "Reseteando..." : "Resetear Cuenta"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default SettingsPage;