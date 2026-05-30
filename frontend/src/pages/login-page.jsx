import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";

import { useState } from "react";
import { loginUser } from "../services/auth-service";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
    
  const handleLogin = async () => {
    try {
      setLoading(true);

      const data = await loginUser(username, password);
      console.log(data);

      // Paso 3 (Ya estaba perfecto): Guardar los tokens JWT
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f1117",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 420,
          backgroundColor: "#15181e",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                color="white"
              >
                Welcome Back
              </Typography>

              <Typography color="gray">
                Login to your broker account
              </Typography>
            </Box>

            {/* Paso 2 Corregido: Se usa slotProps en vez de InputLabelProps */}
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{
                inputLabel: {
                  style: { color: "#94a3b8" },
                },
              }}
              sx={{
                input: {
                  color: "white",
                },
              }}
            />

            {/* Paso 2 Corregido: Se usa slotProps en vez de InputLabelProps */}
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                inputLabel: {
                  style: { color: "#94a3b8" },
                },
              }}
              sx={{
                input: {
                  color: "white",
                },
              }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: "#00c853",
                fontWeight: 700,
              }}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
