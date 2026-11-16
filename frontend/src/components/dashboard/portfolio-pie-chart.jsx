import { ResponsivePie } from '@nivo/pie';
import { Box } from '@mui/material';

function PortfolioPieChart({ data }) {
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
    </Box>
  );
}

export default PortfolioPieChart;
