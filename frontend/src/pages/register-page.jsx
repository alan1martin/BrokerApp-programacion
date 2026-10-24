// src/pages/register-page.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Stack, InputAdornment, IconButton, Card, Alert } from "@mui/material";
import { Visibility, VisibilityOff, TrendingUp as LogoIcon } from "@mui/icons-material";
import { registerUser } from "../services/auth-service";

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.password_confirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser(formData);

      if (data && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      const respError = error.response?.data;
      if (respError) {
        if (respError.username) {
          setErrorMsg(Array.isArray(respError.username) ? respError.username[0] : respError.username);
        } else if (respError.password) {
          setErrorMsg(Array.isArray(respError.password) ? respError.password[0] : respError.password);
        } else if (respError.password_confirm) {
          setErrorMsg(Array.isArray(respError.password_confirm) ? respError.password_confirm[0] : respError.password_confirm);
        } else {
          setErrorMsg("Error al registrar usuario. Revisá los datos ingresados.");
        }
      } else {
        setErrorMsg("Error de conexión al intentar registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", bgcolor: "#0b0e11" }}>
      {/* SECCIÓN IZQUIERDA: BRANDING */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          p: 8,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(135deg, rgba(11, 14, 17, 0.95) 0%, rgba(21, 24, 30, 0.7) 100%)",
            zIndex: 2
          }
        }}
      >
        <Stack spacing={4} sx={{ zIndex: 3, color: "white", maxWidth: "850px", width: "100%", pr: { md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <LogoIcon sx={{ color: "#4caf50", fontSize: 44 }} />
            <Typography variant="h4" fontWeight={900} letterSpacing={-0.5}>
              PEAK INVESTMENTS
            </Typography>
          </Stack>

          <Typography variant="h2" fontWeight={700} sx={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Unite a la nueva generación de inversores.
          </Typography>

          <Typography variant="h6" fontWeight={400} sx={{ color: "#9ca3af", lineHeight: 1.6, maxWidth: "750px" }}>
            Creá tu cuenta en segundos, recibí $10,000 USD de capital simulado y comenzá a operar activos en tiempo real.
          </Typography>
        </Stack>
      </Box>

      {/* SECCIÓN DERECHA: FORMULARIO DE REGISTRO */}
      <Box
        sx={{
          width: { xs: "100%", md: "480px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          bgcolor: "#0b0e11",
          borderLeft: { md: "1px solid #1c2025" },
          overflowY: "auto"
        }}
      >
        <Card elevation={0} sx={{ width: "100%", maxWidth: 380, bgcolor: "transparent", color: "white" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, display: { xs: "flex", md: "none" } }}>
            <LogoIcon sx={{ color: "#4caf50", fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800}>PEAK INVESTMENTS</Typography>
          </Stack>

          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>Crear Cuenta</Typography>
            <Typography variant="body2" color="gray">Completá los datos para comenzar tu experiencia.</Typography>
          </Stack>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: "#2a1215", color: "#ff8a80" }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Usuario"
                name="username"
                variant="outlined"
                fullWidth
                required
                value={formData.username}
                onChange={handleChange}
                slotProps={{
                  inputLabel: { style: { color: "#9ca3af" } },
                  htmlInput: { style: { color: "white" } }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#15181e",
                    "& fieldset": { borderColor: "#2d3748" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" }
                  }
                }}
              />

              <TextField
                label="Email (opcional)"
                name="email"
                type="email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                slotProps={{
                  inputLabel: { style: { color: "#9ca3af" } },
                  htmlInput: { style: { color: "white" } }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#15181e",
                    "& fieldset": { borderColor: "#2d3748" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" }
                  }
                }}
              />

              <TextField
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                slotProps={{
                  inputLabel: { style: { color: "#9ca3af" } },
                  htmlInput: { style: { color: "white" } },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "gray" }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#15181e",
                    "& fieldset": { borderColor: "#2d3748" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" }
                  }
                }}
              />

              <TextField
                label="Confirmar Contraseña"
                name="password_confirm"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                required
                value={formData.password_confirm}
                onChange={handleChange}
                slotProps={{
                  inputLabel: { style: { color: "#9ca3af" } },
                  htmlInput: { style: { color: "white" } }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#15181e",
                    "& fieldset": { borderColor: "#2d3748" },
                    "&:hover fieldset": { borderColor: "#4caf50" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" }
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: "#4caf50",
                  color: "black",
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#388e3c" },
                  textTransform: "none",
                  borderRadius: 1.5
                }}
              >
                {loading ? "Creando cuenta..." : "Registrarme"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="gray" align="center" sx={{ mt: 3 }}>
            ¿Ya tenés una cuenta?{" "}
            <Box component="span" onClick={() => navigate("/login")} sx={{ color: "#4caf50", cursor: "pointer", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
              Iniciar sesión
            </Box>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

export default RegisterPage;
