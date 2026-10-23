import { useState, useMemo } from "react";
import { Box, Typography, Paper, Grid, Stack, TextField, Button, InputAdornment, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Tasas estimadas de mercado para cauciones
const MARKET_RATES = [
  { days: 1, tna: 38.5, label: "1 Día (Mañana)" },
  { days: 3, tna: 39.2, label: "3 Días (Fin de semana)" },
  { days: 7, tna: 40.0, label: "7 Días" },
  { days: 14, tna: 41.0, label: "14 Días" },
];

function CautionsPage() {
  const [selectedTerm, setSelectedTerm] = useState(MARKET_RATES[0]);
  const [amount, setAmount] = useState(100000);
  const [placedCautions, setPlacedCautions] = useState([
    { id: 1, amount: 50000, days: 3, tna: 39.2, returnVal: 161.09, status: "Activa", expiry: "2026-10-26" }
  ]);

  // Cálculo de Interés Ganado: Interés = Monto * (TNA / 100) * (Días / 365)
  const calculation = useMemo(() => {
    const numericAmount = Number(amount) || 0;
    const interest = numericAmount * (selectedTerm.tna / 100) * (selectedTerm.days / 365);
    const totalAmount = numericAmount + interest;
    return {
      interest: parseFloat(interest.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }, [amount, selectedTerm]);

  const handlePlaceCaution = () => {
    if (!amount || Number(amount) <= 0) return;

    const newCaution = {
      id: Date.now(),
      amount: Number(amount),
      days: selectedTerm.days,
      tna: selectedTerm.tna,
      returnVal: calculation.interest,
      status: "Activa",
      expiry: new Date(Date.now() + selectedTerm.days * 86400000).toISOString().split("T")[0]
    };

    setPlacedCautions([newCaution, ...placedCautions]);
    alert(`Caución de $${Number(amount).toLocaleString("es-AR")} colocada con éxito a ${selectedTerm.days} día(s).`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <AccessTimeIcon sx={{ color: "#ff9800", fontSize: 28 }} />
          <Typography variant="h4" fontWeight={800}>
            Cauciones & Tasa Fija
          </Typography>
        </Stack>
        <Typography variant="body2" color="gray">
          Hacé rendir tu efectivo no invertido con colocaciones de muy corto plazo garantizadas por el mercado.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Panel Izquierdo: Formulario de Colocación */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 3 }}>
              Nueva Caución Colocadora
            </Typography>

            <Stack spacing={3}>
              {/* Selección de Plazo */}
              <Box>
                <Typography variant="body2" color="gray" sx={{ mb: 1 }}>Plazo y Tasa TNA Estimada</Typography>
                <Grid container spacing={1.5}>
                  {MARKET_RATES.map((item) => (
                    <Grid size={{ xs: 6 }} key={item.days}>
                      <Card
                        onClick={() => setSelectedTerm(item)}
                        sx={{
                          bgcolor: selectedTerm.days === item.days ? "rgba(33, 150, 243, 0.1)" : "#0b0e11",
                          border: `1px solid ${selectedTerm.days === item.days ? "#2196f3" : "#1c2025"}`,
                          borderRadius: 1.5,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <CardContent sx={{ p: "12px !important", textAlign: "center" }}>
                          <Typography variant="caption" color="gray">{item.label}</Typography>
                          <Typography variant="h6" fontWeight={800} color={selectedTerm.days === item.days ? "#2196f3" : "white"}>
                            {item.tna}% TNA
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Monto a Colocar */}
              <Box>
                <Typography variant="body2" color="gray" sx={{ mb: 1 }}>Monto a Invertir ($ ARS)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AccountBalanceWalletIcon sx={{ color: "gray", fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={{ input: { color: "white", fontWeight: 700 }, bgcolor: "#0b0e11", borderRadius: 1, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1c2025" } }}
                />
              </Box>

              {/* Desglose de Retorno */}
              <Box sx={{ p: 2, bgcolor: "#0b0e11", borderRadius: 1.5, border: "1px solid #1c2025" }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="gray">Intereses Aportados ({selectedTerm.days}d):</Typography>
                    <Typography variant="caption" fontWeight={700} color="#4caf50">+${calculation.interest.toLocaleString("es-AR")}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700} color="white">Monto al Vencimiento:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#2196f3">${calculation.totalAmount.toLocaleString("es-AR")}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handlePlaceCaution}
                sx={{ bgcolor: "#2196f3", py: 1.2, fontWeight: 700, borderRadius: 1.5, "&:hover": { bgcolor: "#1976d2" } }}
              >
                Colocar Caución
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Panel Derecho: Historial / Estado de Cauciones */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
              Mis Cauciones Activas e Históricas
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { borderColor: "#1c2025", color: "gray", fontWeight: 700 } }}>
                    <TableCell>Monto</TableCell>
                    <TableCell>Plazo</TableCell>
                    <TableCell>TNA</TableCell>
                    <TableCell>Interés</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell align="right">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {placedCautions.map((row) => (
                    <TableRow key={row.id} sx={{ "& td": { borderColor: "#1c2025", color: "white" } }}>
                      <TableCell sx={{ fontWeight: 700 }}>${row.amount.toLocaleString("es-AR")}</TableCell>
                      <TableCell>{row.days} d</TableCell>
                      <TableCell>{row.tna}%</TableCell>
                      <TableCell sx={{ color: "#4caf50", fontWeight: 700 }}>+${row.returnVal.toLocaleString("es-AR")}</TableCell>
                      <TableCell>{row.expiry}</TableCell>
                      <TableCell align="right">
                        <Chip
                          icon={<CheckCircleIcon style={{ fontSize: 14, color: "#4caf50" }} />}
                          label={row.status}
                          size="small"
                          sx={{ bgcolor: "rgba(76, 175, 80, 0.15)", color: "#4caf50", fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CautionsPage;