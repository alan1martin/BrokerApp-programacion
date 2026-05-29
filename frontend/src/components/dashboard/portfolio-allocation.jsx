
import {
Card,
CardContent,
Typography,
Stack,
Box,
} from "@mui/material";

import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
Tooltip,
} from "recharts";

const data = [
{ name: "Stocks", value: 55 },
{ name: "Crypto", value: 20 },
{ name: "ETFs", value: 15 },
{ name: "Cash", value: 10 },
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
> <CardContent> <Typography
       variant="h6"
       gutterBottom
     >
Portfolio Allocation </Typography>

    <ResponsiveContainer
      width="100%"
      height={220}
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>

    <Stack spacing={2} mt={2}>
      {data.map((item, index) => (
        <Box
          key={item.name}
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
                  COLORS[index % COLORS.length],
              }}
            />

            <Typography>
              {item.name}
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
