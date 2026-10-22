//frontend/src/pages/cash-page.jsx
import { useState } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Tabs, Tab, Stack, 
  Alert, Divider, InputAdornment 
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { manageCashFunds } from "../services/portfolio-service";

function CashDialog({ open, onClose, onSuccess }) {
  const [tabValue, setTabValue] = useState(0); // 0: Ingresar, 1: Retirar
  const [amount, setAmount] = useState("");
  
  // Estados para Retiro (Datos de destino)
  const [destination, setDestination] = useState("");
  const [holderName, setHolderName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Datos simulados estilo BIND / Banco Industrial para el depósito
  const simulatedAccount = {
    bank: "Banco Industrial (BIND)",
    cbu: "0000003100012345678901",
    alias: "PEAK.INVESTMENTS.BROKER",
    titular: "Peak Investments S.A. (Simulador)"
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Por favor, ingresá un monto válido.");
      return;
    }

    if (tabValue === 1 && (!destination || !holderName)) {
      setError("Completá los datos de la cuenta o billetera de destino.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const transactionType = tabValue === 0 ? "DEPOSIT" : "WITHDRAW";
      
      // Llamada a tu servicio real de Django
      await manageCashFunds(transactionType, numAmount);

      setSuccessMsg(
        tabValue === 0 
          ? "¡Depósito simulado acreditado con éxito en tu cuenta!" 
          : "¡Orden de retiro procesada y transferida con éxito!"
      );

      setTimeout(() => {
        setSuccessMsg("");
        setAmount("");
        setDestination("");
        setHolderName("");
        onSuccess?.(); // Recarga el balance general en el padre
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || "Error al procesar la operación de caja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          backgroundColor: "#15181e", 
          color: "white", 
          borderRadius: 3,
          border: "1px solid #1c2025"
        }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, val) => { setTabValue(val); setError(""); setSuccessMsg(""); }}
          centered
          sx={{
            "& .MuiTab-root": { color: "gray", fontWeight: 700 },
            "& .Mui-selected": { color: "#4caf50 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#4caf50" }
          }}
        >
          <Tab icon={<ArrowDownwardIcon />} iconPosition="start" label="Ingresar Dinero" />
          <Tab icon={<ArrowUpwardIcon />} iconPosition="start" label="Retirar Dinero" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: "#2a1215", color: "#ff8a80" }}>{error}</Alert>}
        {successMsg && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, bgcolor: "#1b2e1e", color: "#a5d6a7" }}>{successMsg}</Alert>}

        {/* --- PESTAÑA 0: INGRESAR (Simulación CBU / Transferencia) --- */}
        {tabValue === 0 && (
          <Stack spacing={3}>
            <Box sx={{ p: 2.5, bgcolor: "#0b0e11", borderRadius: 2, border: "1px solid #1c2025" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <AccountBalanceIcon sx={{ color: "#4caf50" }} />
                <Typography variant="subtitle1" fontWeight={700}>Datos para tu transferencia</Typography>
              </Stack>
              <Typography variant="body2" color="gray" sx={{ mb: 2 }}>
                Para fondear tu cuenta en el simulador, realizá una transferencia desde tu home banking a las siguientes coordenadas virtuales (Proveedor BIND / Banco Industrial):
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" color="gray">CVU / CBU</Typography>
                    <Typography variant="body2" fontWeight={700}>{simulatedAccount.cbu}</Typography>
                  </Box>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopy(simulatedAccount.cbu)}>
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </Box>

                <Divider sx={{ borderColor: "#1c2025" }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" color="gray">ALIAS</Typography>
                    <Typography variant="body2" fontWeight={700} color="#4caf50">{simulatedAccount.alias}</Typography>
                  </Box>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopy(simulatedAccount.alias)}>
                    Copiar
                  </Button>
                </Box>

                <Divider sx={{ borderColor: "#1c2025" }} />

                <Box>
                  <Typography variant="caption" color="gray">Titular: {simulatedAccount.titular}</Typography>
                  <Typography variant="caption" display="block" color="gray">Banco: {simulatedAccount.bank}</Typography>
                </Box>
              </Stack>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Simular acreditación instantánea:
              </Typography>
              <TextField 
                fullWidth
                label="Monto a ingresar"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { color: "white", bgcolor: "#0b0e11" }
                }}
                InputLabelProps={{ style: { color: "gray" } }}
                sx={{ mb: 2 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="success" 
                fullWidth 
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, textTransform: "none" }}
              >
                {loading ? "Procesando..." : "Simular transferencia realizada"}
              </Button>
            </Box>
          </Stack>
        )}

        {/* --- PESTAÑA 1: RETIRAR (Datos de destino / CBU o Wallet) --- */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Typography variant="body2" color="gray">
                Ingresá los datos de tu cuenta bancaria o billetera virtual de destino para transferir tus fondos disponibles.
              </Typography>

              <TextField 
                fullWidth
                label="CBU, CVU o Alias de destino"
                placeholder="ej: mi.alias.personal"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                InputProps={{ sx: { color: "white", bgcolor: "#0b0e11" } }}
                InputLabelProps={{ style: { color: "gray" } }}
                required
              />

              <TextField 
                fullWidth
                label="Nombre y Apellido / Titular"
                placeholder="ej: Martín Alloatti"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                InputProps={{ sx: { color: "white", bgcolor: "#0b0e11" } }}
                InputLabelProps={{ style: { color: "gray" } }}
                required
              />

              <TextField 
                fullWidth
                label="Monto a retirar (USD / Pesos)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { color: "white", bgcolor: "#0b0e11" }
                }}
                InputLabelProps={{ style: { color: "gray" } }}
                required
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="error" 
                fullWidth 
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, textTransform: "none", mt: 1 }}
              >
                {loading ? "Procesando transferencia..." : "Confirmar y retirar fondos"}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: "gray", textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CashDialog;