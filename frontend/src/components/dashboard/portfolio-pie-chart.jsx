import { ResponsivePie } from '@nivo/pie';
import { Box, Typography, useTheme } from '@mui/material';

function PortfolioPieChart({ data }) {
  const theme = useTheme();

  return (
    <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={5}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        arcLinkLabelsTextColor="#8a94a6"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
        theme={{
          tooltip: {
            container: { background: '#1e222b', color: '#fff', fontSize: '12px' }
          }
        }}
      />
    {/* Texto en el centro del hueco (Donut)
      <Box sx={{
        position: 'absolute',
        top: '50%', // 🎯 Ajustado a 50% exacto para que quede perfectamente centrado al estar solo
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <Typography variant="h6" fontWeight={700} color="white">Activos</Typography>
      </Box> */}
    </Box>
  );
}

export default PortfolioPieChart;