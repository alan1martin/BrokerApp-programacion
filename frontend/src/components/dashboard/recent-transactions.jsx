import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  CircularProgress,
  Box
} from "@mui/material";
import { useEffect, useState } from "react";
// Importamos el servicio que creamos recién
import { getTransactions } from "../../services/portfolio-service";

function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error cargando transacciones:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  // Función auxiliar para formatear la fecha que nos manda Django
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  return (
    <Card sx={{ backgroundColor: "#15181e" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Historial de Transacciones Recientes
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : transactions.length === 0 ? (
          <Typography color="gray" variant="body2" sx={{ py: 2, textAling: "center" }}>
            Aún no has realizado ninguna operación de trading.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }}>Fecha / Hora</TableCell>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }}>Activo</TableCell>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }}>Operación</TableCell>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }} align="right">Cantidad</TableCell>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }} align="right">Precio Ejecución</TableCell>
                  <TableCell sx={{ color: "gray", fontWeight: 600 }} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => {
                  const isBuy = tx.transaction_type === "BUY";
                  const totalCost = (parseFloat(tx.quantity) * parseFloat(tx.price)).toFixed(2);

                  return (
                    <TableRow key={tx.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Fecha */}
                      <TableCell sx={{ color: "white" }}>
                        {formatDate(tx.timestamp)}
                      </TableCell>
                      
                      {/* Símbolo del Activo */}
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>
                        {tx.symbol}
                      </TableCell>
                      
                      {/* Tipo de Operación (Badge Dinámico de Material UI) */}
                      <TableCell>
                        <Chip 
                          label={isBuy ? "COMPRA" : "VENTA"} 
                          size="small"
                          color={isBuy ? "primary" : "error"}
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                      
                      {/* Cantidad */}
                      <TableCell sx={{ color: "white" }} align="right">
                        {parseFloat(tx.quantity).toLocaleString("en-US", { maximumFractionDigits: 6 })}
                      </TableCell>
                      
                      {/* Precio */}
                      <TableCell sx={{ color: "white" }} align="right">
                        ${parseFloat(tx.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      
                      {/* Total calculado */}
                      <TableCell sx={{ color: isBuy ? "primary.main" : "error.main", fontWeight: 600 }} align="right">
                        ${parseFloat(totalCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentTransactions;