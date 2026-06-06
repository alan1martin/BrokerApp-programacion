// src/pages/history-page.jsx
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  CircularProgress,
  Alert
} from "@mui/material";
import axios from "axios";

// Función que le pega a tu endpoint de Django usando el token guardado
const fetchTransactionHistory = async () => {
  const token = localStorage.getItem("access");
  
  const response = await axios.get("http://127.0.0.1:8000/api/portfolio/transactions/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

function HistoryPage() {
  // Enganchamos React Query para manejar el estado de la petición
  const { data: transactions, isLoading, isError, error } = useQuery({
    queryKey: ["transactionHistory"],
    queryFn: fetchTransactionHistory,
    refetchOnWindowFocus: true, // Se actualiza si cambias de pestaña y volvés
  });

  // Formateador de fechas nativo para dejar la estampa de tiempo pro
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#0b0e11", minHeight: "100vh", color: "white" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Historial de Órdenes
        </Typography>
        <Typography variant="body2" color="gray">
          Registro completo de tus operaciones de mercado y movimientos de fondos.
        </Typography>
      </Box>

      {/* ESTADO DE CARGA */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#4caf50" }} />
        </Box>
      )}

      {/* ESTADO DE ERROR */}
      {isError && (
        <Alert severity="error" sx={{ bgcolor: "#2a1215", color: "#ff8a80", "& .MuiAlert-icon": { color: "#ff5252" } }}>
          Error al cargar las transacciones: {error.message}. Verificá la conexión con Django.
        </Alert>
      )}

      {/* TABLA DE TRANSACCIONES */}
      {!isLoading && !isError && (
        <TableContainer component={Paper} sx={{ bgcolor: "#15181e", border: "1px solid #1c2025", borderRadius: 2 }}>
          <Table aria-label="tabla de historial">
            <TableHead sx={{ bgcolor: "#1e222b" }}>
              <TableRow>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Fecha y Hora</TableCell>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Activo</TableCell>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }} align="right">Cantidad</TableCell>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }} align="right">Precio Operado</TableCell>
                <TableCell sx={{ color: "#9ca3af", fontWeight: 700 }} align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => {
                  const totalOrder = (parseFloat(tx.quantity) * parseFloat(tx.price)).toFixed(2);
                  
                  // Definimos las etiquetas y colores según el tipo exacto que viene de Django
                  let labelType = tx.transaction_type;
                  let chipColor = "#4caf50";
                  let chipBg = "rgba(76, 175, 80, 0.15)";
                  let totalPrefix = "-";
                  let totalColor = "#ff8a80"; // Pérdida inmediata de cash (al comprar o retirar)

                  if (tx.transaction_type === "BUY") {
                    labelType = "COMPRA";
                  } else if (tx.transaction_type === "SELL") {
                    labelType = "VENTA";
                    chipColor = "#f44336";
                    chipBg = "rgba(244, 67, 54, 0.15)";
                    totalPrefix = "+";
                    totalColor = "#a5d6a7";
                  } else if (tx.transaction_type === "DEP") {
                    labelType = "DEPÓSITO";
                    totalPrefix = "+";
                    totalColor = "#a5d6a7";
                  } else if (tx.transaction_type === "WIT") {
                    labelType = "RETIRO";
                    chipColor = "#f44336";
                    chipBg = "rgba(244, 67, 54, 0.15)";
                  }

                  return (
                    <TableRow 
                      key={tx.id} 
                      sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { bgcolor: "#1e222b" } }}
                    >
                      <TableCell sx={{ color: "white" }}>{formatDate(tx.timestamp)}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{tx.symbol}</TableCell>
                      <TableCell>
                        <Chip 
                          label={labelType} 
                          size="small"
                          sx={{ 
                            bgcolor: chipBg, 
                            color: chipColor,
                            fontWeight: 700,
                            borderRadius: "6px"
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        {tx.symbol === "CASH" ? "-" : parseFloat(tx.quantity)}
                      </TableCell>
                      <TableCell sx={{ color: "white" }} align="right">${parseFloat(tx.price).toFixed(2)}</TableCell>
                      <TableCell sx={{ color: totalColor, fontWeight: 600 }} align="right">
                        {totalPrefix}${totalOrder}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: "gray", py: 4 }}>
                    No realizaste ninguna operación todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default HistoryPage;