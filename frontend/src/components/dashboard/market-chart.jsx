
import {
Card,
CardContent,
Typography,
} from "@mui/material";

import {
LineChart,
Line,
ResponsiveContainer,
XAxis,
YAxis,
Tooltip,
} from "recharts";

const data = [
{ name: "Mon", value: 4000 },
{ name: "Tue", value: 3000 },
{ name: "Wed", value: 5000 },
{ name: "Thu", value: 4780 },
{ name: "Fri", value: 5890 },
{ name: "Sat", value: 6390 },
{ name: "Sun", value: 7490 },
];

function MarketChart() {
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
Portfolio Performance </Typography>

    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={data}>
        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#00c853"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


);
}

export default MarketChart;
