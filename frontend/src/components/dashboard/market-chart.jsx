import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import { ResponsiveLine } from "@nivo/line";

const data = [
  {
    id: "Portfolio",
    data: [
      { x: "Mon", y: 4000 },
      { x: "Tue", y: 3000 },
      { x: "Wed", y: 5000 },
      { x: "Thu", y: 4780 },
      { x: "Fri", y: 5890 },
      { x: "Sat", y: 6390 },
      { x: "Sun", y: 7490 },
    ],
  },
];

function MarketChart() {
  return (
    <Card
      sx={{
        backgroundColor: "#15181e",
        height: 400,
      }}
    >
      <CardContent sx={{ height: "100%" }}>
        <Typography
          variant="h6"
          gutterBottom
        >
          Portfolio Performance
        </Typography>

        <Box sx={{ height: 300 }}>
          <ResponsiveLine
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 50,
              left: 60,
            }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            colors={["#00c853"]}
            enablePoints={true}
            pointSize={8}
            pointColor="#00c853"
            pointBorderWidth={2}
            pointBorderColor="#ffffff"
            enableGridX={false}
            theme={{
              textColor: "#ffffff",
              axis: {
                ticks: {
                  text: {
                    fill: "#94a3b8",
                  },
                },
                legend: {
                  text: {
                    fill: "#94a3b8",
                  },
                },
              },
              grid: {
                line: {
                  stroke: "#2a2f3a",
                },
              },
              tooltip: {
                container: {
                  background: "#15181e",
                  color: "#fff",
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default MarketChart;