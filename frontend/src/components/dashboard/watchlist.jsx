
import {
Card,
CardContent,
Typography,
Stack,
Box,
} from "@mui/material";

const stocks = [
{
symbol: "AAPL",
price: "$214.32",
change: "+1.23%",
},
{
symbol: "TSLA",
price: "$189.44",
change: "-2.11%",
},
{
symbol: "NVDA",
price: "$901.11",
change: "+4.92%",
},
{
symbol: "AMZN",
price: "$182.55",
change: "+0.44%",
},
];

function Watchlist() {
return (
<Card
sx={{
backgroundColor: "#15181e",
height: 400,
}}
> <CardContent> <Typography
       variant="h6"
       gutterBottom
     >
Watchlist </Typography>

    <Stack spacing={3} mt={3}>
      {stocks.map((stock) => (
        <Box
          key={stock.symbol}
          display="flex"
          justifyContent="space-between"
        >
          <Box>
            <Typography fontWeight={700}>
              {stock.symbol}
            </Typography>

            <Typography color="gray">
              {stock.price}
            </Typography>
          </Box>

          <Typography
            color={
              stock.change.includes("-")
                ? "error.main"
                : "success.main"
            }
          >
            {stock.change}
          </Typography>
        </Box>
      ))}
    </Stack>
  </CardContent>
</Card>

);
}

export default Watchlist;
