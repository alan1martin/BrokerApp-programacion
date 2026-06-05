// src/pages/login-page.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Stack, InputAdornment, IconButton, Card, Alert } from "@mui/material";
import { Visibility, VisibilityOff, TrendingUp as LogoIcon } from "@mui/icons-material";
import { loginUser } from "../services/auth-service"; // IMPORTACIÓN CLAVE: Conectamos tu servicio de autenticación

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState(""); // Para mostrar si el usuario/clave están mal

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FUNCIÓN CORREGIDA: Ahora es asíncrona e impacta contra Django
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Limpiamos errores previos
    
    try {
      console.log("Enviando credenciales a Django...");
      const data = await loginUser(formData.username, formData.password);
      
      // CAPTURA EXITOSA: Django devuelve { access: "...", refresh: "..." }
      if (data && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        
        console.log("¡Token JWT real almacenado con éxito!");
        navigate("/"); // Nos vamos al Dashboard
      } else {
        setErrorMsg("El servidor no devolvió los tokens esperados.");
      }
    } catch (error) {
      console.error("Error en el login visual:", error);
      setErrorMsg("Usuario o contraseña incorrectos. Verificá los datos en Django.");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", bgcolor: "#0b0e11" }}>
      
      {/* ================= SECCIÓN IZQUIERDA: BRANDING Y DISEÑO AMPLIADO ================= */}
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
            animation: "panBackground 25s ease-in-out infinite alternate",
            "@keyframes panBackground": {
              "0%": { transform: "scale(1.0) translateX(0%)" },
              "100%": { transform: "scale(1.12) translateX(-2%)" }
            }
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
          
          {/* Contenedor de Marca Animado al Entrar */}
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={2}
            sx={{
              animation: "revealBrand 1s ease-out forwards",
              "@keyframes revealBrand": {
                "0%": { opacity: 0, transform: "translateY(15px)" },
                "100%": { opacity: 1, transform: "translateY(0)" }
              }
            }}
          >
            {/* LOGO CON FLOTE CORREGIDO */}
            <Box 
              sx={{ 
                display: "inline-flex",
                animation: "floatAndPulse 3s ease-in-out infinite",
                "@keyframes floatAndPulse": {
                  "0%": { 
                    transform: "translateY(0px) scale(1)", 
                    filter: "drop-shadow(0 0 2px rgba(76, 175, 80, 0.3))" 
                  },
                  "50%": { 
                    transform: "translateY(-8px) scale(1.08)", 
                    filter: "drop-shadow(0 0 14px rgba(76, 175, 80, 0.7))" 
                  },
                  "100%": { 
                    transform: "translateY(0px) scale(1)", 
                    filter: "drop-shadow(0 0 2px rgba(76, 175, 80, 0.3))" 
                  }
                }
              }}
            >
              <LogoIcon sx={{ color: "#4caf50", fontSize: 44 }} />
            </Box>
            <Typography variant="h4" fontWeight={900} letterSpacing={-0.5}>
              PEAK INVESTMENTS
            </Typography>
          </Stack>

          <Typography variant="h2" fontWeight={700} sx={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Tomá el control de tu futuro financiero.
          </Typography>

          <Typography variant="h6" fontWeight={400} sx={{ color: "#9ca3af", lineHeight: 1.6, maxWidth: "750px" }}>
            Operá acciones del Merval, CEDEARs y gestioná tu cartera en tiempo real con herramientas avanzadas de análisis de mercado.
          </Typography>
        </Stack>
      </Box>

      {/* ================= SECCIÓN DERECHA: LOGEO FIJO E INDEPENDIENTE ================= */}
      <Box
        sx={{
          width: { xs: "100%", md: "480px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          bgcolor: "#0b0e11",
          borderLeft: { md: "1px solid #1c2025" }
        }}
      >
        <Card elevation={0} sx={{ width: "100%", maxWidth: 380, bgcolor: "transparent", color: "white" }}>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4, display: { xs: "flex", md: "none" } }}>
            <LogoIcon sx={{ color: "#4caf50", fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800}>PEAK INVESTMENTS</Typography>
          </Stack>

          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>Iniciar Sesión</Typography>
            <Typography variant="body2" color="gray">¡Hola! Ingresá tus credenciales para acceder al broker.</Typography>
          </Stack>

          {/* Alerta de Error en pantalla si las credenciales fallan */}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: "#2a1215", color: "#ff8a80", "& .MuiAlert-icon": { color: "#ff5252" } }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
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
                Ingresar a mi Cuenta
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="gray" align="center" sx={{ mt: 4 }}>
            ¿Sos nuevo?{" "}
            <Box component="span" sx={{ color: "#4caf50", cursor: "pointer", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
              Crear una cuenta
            </Box>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

export default LoginPage;