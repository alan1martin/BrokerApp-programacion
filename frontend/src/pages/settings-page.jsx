
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
      const data = await resetAccount();
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({ type: "error", text: "No se pudo resetear la cuenta. Intentalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={4} sx={{ maxWidth: 600 }}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
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

      <Card sx={{ backgroundColor: "#15181e", borderRadius: 2 }}>
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
              sx={{ fontWeight: 700, textTransform: "none" }}
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
