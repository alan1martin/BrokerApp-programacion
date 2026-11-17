// frontend/src/components/dashboard/market-ticker.jsx
import { Box, Typography, Stack, Avatar } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useMarket } from "../../context/market-context.jsx";
import { getAssetLogo } from "../../utils/get-logo";

const TICKER_SYMBOLS = [
  { symbol: "AAPL", name: "Apple", fallbackPrice: 175.50, change: 1.25 },
  { symbol: "TSLA", name: "Tesla", fallbackPrice: 180.20, change: -0.85 },
  { symbol: "NVDA", name: "Nvidia", fallbackPrice: 875.00, change: 3.40 },
  { symbol: "BTC", name: "Bitcoin", fallbackPrice: 65000.00, change: 2.15 },
  { symbol: "AMZN", name: "Amazon", fallbackPrice: 185.30, change: 0.95 },
  { symbol: "GGAL", name: "Grupo Galicia", fallbackPrice: 42.50, change: 4.10 },
  { symbol: "ETH", name: "Ethereum", fallbackPrice: 3450.00, change: -1.10 },
];

export default function MarketTicker() {
  const { assets } = useMarket();

  const tickerList = TICKER_SYMBOLS.map((item) => {
    const live = assets?.find((a) => a.symbol === item.symbol);
    const currentPrice = live?.currentPrice ? parseFloat(live.currentPrice) : item.fallbackPrice;
    const change = live?.change24h !== undefined ? parseFloat(live.change24h) : item.change;
    return {
      symbol: item.symbol,
      name: live?.name || item.name,
      price: currentPrice,
      change,
      isPositive: change >= 0
    };
  });

  // Duplicamos la lista para crear un scroll infinito suave y sin saltos
  const loopItems = [...tickerList, ...tickerList];

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "rgba(21, 24, 30, 0.65)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 2,
        py: 0.8,
        px: 1,
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        "&:hover .ticker-track": {
          animationPlayState: "paused"
        }
      }}
    >
      <Box
        className="ticker-track"
        sx={{
          display: "flex",
          width: "max-content",
          animation: "tickerSlide 40s linear infinite",
          "@keyframes tickerSlide": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" }
          }
        }}
      >
        {loopItems.map((item, index) => (
          <Stack
            key={`${item.symbol}-${index}`}
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: "center",
              px: 2.2,
              py: 0.2,
              borderRight: "1px solid rgba(255, 255, 255, 0.06)",
              cursor: "pointer",
              transition: "opacity 0.2s",
              "&:hover": { opacity: 0.85 }
            }}
          >
            <Avatar
              src={getAssetLogo(item.symbol)}
              alt={item.symbol}
              sx={{
                width: 22,
                height: 22,
                bgcolor: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                p: 0.2
              }}
            />

            <Typography variant="body2" fontWeight={800} sx={{ color: "white", fontSize: "0.82rem" }}>
              {item.symbol}
            </Typography>

            <Typography variant="body2" fontWeight={600} sx={{ color: "#e2e8f0", fontSize: "0.82rem" }}>
              ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>

            <Stack direction="row" spacing={0.2} sx={{ alignItems: "center" }}>
              {item.isPositive ? (
                <ArrowDropUpIcon sx={{ color: "#4caf50", fontSize: 20 }} />
              ) : (
                <ArrowDropDownIcon sx={{ color: "#f44336", fontSize: 20 }} />
              )}
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: item.isPositive ? "#4caf50" : "#f44336",
                  fontSize: "0.76rem"
                }}
              >
                {item.isPositive ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}