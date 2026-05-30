import { useEffect, useState } from "react";
import { 
  Typography, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { getTransactionHistory } from "../services/portfolio-service";
import HistoryIcon from "@mui/icons-material/History";

function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getTransactionHistory();
        // Asumimos que Django devuelve un array de transacciones
        setTransactions(data); 
      } catch (err) {
        console.error("Error al traer el historial:", err);
        setError("No se pudo cargar el historial de transacciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <HistoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Stack>
          <Typography variant="h4" fontWeight={700}>
            Historial de Operaciones
          </Typography>
          <Typography color="gray" variant="body2">
            Registro cronológico de todas tus compras y ventas de activos.
          </Typography>
        </Stack>
      </Stack>

      {error && <Alert severity="error" variant="filled">{error}</Alert>}

      {transactions.length === 0 ? (
        <Paper sx={{ p: 4, backgroundColor: "#15181e", textAlign: "center", borderRadius: 2 }}>
          <Typography color="gray">Aún no realizaste ninguna operación en el mercado.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: "#15181e", borderRadius: 2 }}>
          <Table aria-label="historial de transacciones">
            <TableHead sx={{ backgroundColor: "#1e222b" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "gray" }}>FECHA / HORA</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }}>ACTIVO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="center">TIPO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">CANTIDAD</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">PRECIO UNITARIO</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "gray" }} align="right">TOTAL NETO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => {
                const isBuy = tx.transaction_type === "BUY";
                const totalNeto = tx.quantity * tx.price;
                
                // Formateo lindo de la fecha que viene de Django
                const txDate = new Date(tx.created_at || tx.date).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <TableRow 
                    key={tx.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: "#1c202a" } }}
                  >
                    {/* Fecha */}
                    <TableCell sx={{ color: "#8a94a6" }}>{txDate}</TableCell>
                    
                    {/* Activo (Ticker) */}
                    <TableCell sx={{ fontWeight: 700, color: "white" }}>{tx.symbol}</TableCell>
                    
                    {/* Tipo (BUY / SELL) con Badge */}
                    <TableCell align="center">
                      <Chip 
                        label={isBuy ? "COMPRA" : "VENTA"} 
                        color={isBuy ? "success" : "error"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, borderRadius: 1, minWidth: 80 }}
                      />
                    </TableCell>
                    
                    {/* Cantidad */}
                    <TableCell align="right" sx={{ color: "white", fontFamily: "monospace" }}>
                      {tx.quantity}
                    </TableCell>
                    
                    {/* Precio Unitario */}
                    <TableCell align="right" sx={{ color: "#8a94a6" }}>
                      ${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    
                    {/* Total Neto */}
                    <TableCell align="right" sx={{ fontWeight: 700, color: isBuy ? "error.light" : "success.light" }}>
                      {isBuy ? "-" : "+"}${totalNeto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}

export default HistoryPage;
