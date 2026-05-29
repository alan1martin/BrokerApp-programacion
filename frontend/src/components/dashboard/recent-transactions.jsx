
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
Box,
} from "@mui/material";

const transactions = [
{
id: 1,
asset: "Bitcoin",
symbol: "BTC",
type: "BUY",
quantity: "0.42",
price: "$64,281",
},
{
id: 2,
asset: "Ethereum",
symbol: "ETH",
type: "SELL",
quantity: "12.5",
price: "$3,421",
},
{
id: 3,
asset: "Solana",
symbol: "SOL",
type: "BUY",
quantity: "250",
price: "$142",
},
];

function RecentTransactions() {
return (
<Card
sx={{
backgroundColor: "#15181e",
}}
> <CardContent> <Typography
       variant="h6"
       gutterBottom
     >
Recent Transactions </Typography>

    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {transactions.map((item) => (
            <TableRow
              key={item.id}
              hover
            >
              <TableCell>
                <Box>
                  <Typography fontWeight={700}>
                    {item.asset}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="gray"
                  >
                    {item.symbol}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={item.type}
                  size="small"
                  sx={{
                    backgroundColor:
                      item.type === "BUY"
                        ? "rgba(0,200,83,0.15)"
                        : "rgba(255,82,82,0.15)",

                    color:
                      item.type === "BUY"
                        ? "#00c853"
                        : "#ff5252",

                    fontWeight: 700,
                  }}
                />
              </TableCell>

              <TableCell>
                {item.quantity}
              </TableCell>

              <TableCell>
                {item.price}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </CardContent>
</Card>

);
}

export default RecentTransactions;
