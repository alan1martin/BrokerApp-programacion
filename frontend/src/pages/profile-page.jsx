import { Box, Typography, Card, CardContent, Divider } from "@mui/material";

function ProfilePage() {
  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Mi Perfil</Typography>
      
      <Card sx={{ bgcolor: "#15181e", border: "1px solid #2d3748" }}>
        <CardContent>
          <Typography variant="h6" color="primary">Información Personal</Typography>
          <Divider sx={{ my: 2, bgcolor: "#2d3748" }} />
          <Typography variant="body1">Nombre: Martín Alloatti</Typography>
          <Typography variant="body1">Email: martin@example.com</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProfilePage;