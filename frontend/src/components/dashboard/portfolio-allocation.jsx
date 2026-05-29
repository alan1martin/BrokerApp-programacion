import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from "@mui/material";

import { ResponsivePie } from "@nivo/pie";

const data = [
  {
    id: "Stocks",
    label: "Stocks",
    value: 55,
  },
  {
    id: "Crypto",
    label: "Crypto",
    value: 20,
  },
  {
    id: "ETFs",
    label: "ETFs",
    value: 15,
  },
  {
    id: "Cash",
    label: "Cash",
    value: 10,
  },
];

const COLORS = [
  "#00c853",
  "#2962ff",
  "#ffab00",
  "#ff5252",
];

function PortfolioAllocation() {
  return (
    <Card
      sx={{
        backgroundColor: "#15181e",
        height: 400,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Portfolio Allocation
        </Typography>

        <Box sx={{ height: 220 }}>
          <ResponsivePie
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
            innerRadius={0.7}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={COLORS}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            theme={{
              tooltip: {
                container: {
                  background: "#15181e",
                  color: "#fff",
                },
              },
            }}
          />
        </Box>

        <Stack spacing={2} mt={2}>
          {data.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor:
                      COLORS[index],
                  }}
                />

                <Typography>
                  {item.label}
                </Typography>
              </Box>

              <Typography fontWeight={700}>
                {item.value}%
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default PortfolioAllocation;