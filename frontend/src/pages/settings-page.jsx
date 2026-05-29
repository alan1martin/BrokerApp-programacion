import {
Typography,
Card,
CardContent,
Stack,
Switch,
FormControlLabel,
} from "@mui/material";

function SettingsPage() {
return ( <Stack spacing={3}> <Typography variant="h4" fontWeight={700}>
Settings </Typography>


  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>

      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Dark Mode"
      />
    </CardContent>
  </Card>
</Stack>


);
}

export default SettingsPage;
