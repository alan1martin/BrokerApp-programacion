// src/pages/investor-profile-page.jsx
import { useState } from "react";
import { 
  Typography, Stack, Card, CardContent, Button, 
  RadioGroup, FormControlLabel, Radio, LinearProgress, Box, Chip 
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ShieldIcon from "@mui/icons-material/Shield";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";

// 1. Base de datos de preguntas y puntajes (Simil CNV Argentina - 10 Preguntas)
const QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál es tu principal objetivo al invertir en este broker?",
    options: [
      { text: "Proteger mi capital de la inflación sin correr grandes riesgos.", score: 1 },
      { text: "Lograr un equilibrio entre crecimiento moderado y seguridad.", score: 2 },
      { text: "Maximizar mis ganancias asumiendo volatilidades altas.", score: 3 }
    ]
  },
  {
    id: 2,
    question: "¿Por cuánto tiempo planeás mantener tus inversiones antes de retirar el dinero?",
    options: [
      { text: "Menos de 6 meses (Corto plazo / Liquidez inmediata).", score: 1 },
      { text: "De 1 a 3 años (Mediano plazo).", score: 2 },
      { text: "Más de 3 años (Largo plazo).", score: 3 }
    ]
  },
  {
    id: 3,
    question: "Si el mercado financiero cae de golpe y tus activos pierden un 20% de su valor en una semana, ¿cómo reaccionarías?",
    options: [
      { text: "Vendo todo de inmediato para evitar seguir perdiendo dinero.", score: 1 },
      { text: "Mantengo la calma y espero a que el mercado se recupere a mediano plazo.", score: 2 },
      { text: "Aprovecho el 'descuento' en los precios para comprar más activos.", score: 3 }
    ]
  },
  {
    id: 4,
    question: "¿Qué tipo de instrumentos financieros conocés o te sentís cómodo operando?",
    options: [
      { text: "Plazos fijos y Fondos Comunes de Inversión de Mercado de Dinero.", score: 1 },
      { text: "Bonos soberanos (como el AL30) u Obligaciones Negociables corporativas.", score: 2 },
      { text: "Cedears (Apple, Tesla, Nvidia), Acciones o Criptoactivos.", score: 3 }
    ]
  },
  {
    id: 5,
    question: "¿Qué porcentaje de tus ingresos mensuales o ahorros totales estás destinando a invertirse?",
    options: [
      { text: "Menos del 10% (Una parte muy pequeña para probar).", score: 1 },
      { text: "Entre el 10% y el 30% (Un ahorro planificado y recurrente).", score: 2 },
      { text: "Más del 30% (Invierto de forma agresiva la mayor parte de mi excedente).", score: 3 }
    ]
  },
  {
    id: 6,
    question: "¿Cuál es tu situación respecto a tus conocimientos sobre el mercado de capitales?",
    options: [
      { text: "Nulos o muy básicos. Prefiero que la app o expertos me guíen.", score: 1 },
      { text: "Intermedios. Entiendo la relación riesgo-retorno y sigo algunas noticias.", score: 2 },
      { text: "Avanzados. Entiendo análisis técnico/fundamental y opero con frecuencia.", score: 3 }
    ]
  },
  {
    id: 7,
    question: "Con respecto a tus fuentes de ingresos principales, ¿Cómo las describirías?",
    options: [
      { text: "Estables y predecibles (Sueldo fijo, jubilación, rentas seguras).", score: 1 },
      { text: "Estables pero variables (Comisiones, profesional independiente con flujo constante).", score: 2 },
      { text: "Inestables o estacionales (Emprendedor, ingresos muy variables mes a mes).", score: 3 }
    ]
  },
  {
    id: 8,
    question: "Si tuvieras que elegir entre estas tres alternativas de inversión ideal, ¿cuál preferirías?",
    options: [
      { text: "Rendimiento bajo pero 100% garantizado (saber exactamente cuánto gano).", score: 1 },
      { text: "Rendimiento que supere a la inflación con fluctuaciones leves de valor.", score: 2 },
      { text: "Potencial de ganancias muy altas sabiendo que puedo perder parte del capital.", score: 3 }
    ]
  },
  {
    id: 9,
    question: "Si una inversión que realizaste no genera ganancias durante los primeros 6 meses, ¿qué decisión tomás?",
    options: [
      { text: "La liquido inmediatamente; si no da ganancias rápido, no me sirve.", score: 1 },
      { text: "Espero un poco más (hasta cumplir el año) para evaluar el comportamiento.", score: 2 },
      { text: "No me preocupa, sé que las mejores inversiones maduran a largo plazo.", score: 3 }
    ]
  },
  {
    id: 10,
    question: "¿Has operado anteriormente en plataformas de inversión o brokers de bolsa?",
    options: [
      { text: "No, nunca. Es mi primera experiencia invirtiendo fuera del banco tradicional.", score: 1 },
      { text: "Sí, operé ocasionalmente plazos fijos web o compré dólares/moneda extranjera.", score: 2 },
      { text: "Sí, opero o he operado activamente acciones, bonos, Cedears o cripto.", score: 3 }
    ]
  }
];

// 2. Definición de perfiles según el puntaje acumulado
const PROFILES = {
  conservador: {
    title: "Perfil Conservador",
    color: "success.main",
    icon: <ShieldIcon color="success" sx={{ fontSize: 40 }} />,
    description: "Tu prioridad absoluta es la seguridad y la preservación del capital. No te sentís cómodo tolerando fluctuaciones negativas en tus saldos.",
    instruments: ["Plazo Fijo", "FCI Money Market", "Cauciones Bursátiles"]
  },
  moderado: {
    title: "Perfil Moderado",
    color: "warning.main",
    icon: <SpeedIcon color="warning" sx={{ fontSize: 40 }} />,
    description: "Buscás un crecimiento de tus ahorros a mediano plazo pero con una prudente tolerancia al riesgo. Soportás variaciones temporales si el objetivo final lo vale.",
    instruments: ["Obligaciones Negociables (ONs)", "Bonos Soberanos (AL30/GD30)", "FCI de Renta Fija"]
  },
  agresivo: {
    title: "Perfil Agresivo",
    color: "error.main",
    icon: <LocalFireDepartmentIcon color="error" sx={{ fontSize: 40 }} />,
    description: "Tu objetivo es maximizar la rentabilidad a largo plazo. Entendés perfectamente la volatilidad del mercado bursátil y estás dispuesto a asumir pérdidas temporales a cambio de retornos altos.",
    instruments: ["Cedears (Tech/E-commerce)", "Acciones de Bolsa Local", "Criptomonedas"]
  }
};

function InvestorProfilePage() {
  const [step, setStep] = useState("start"); // "start" | "quiz" | "result"
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [finalProfile, setFinalProfile] = useState(null);

  // Iniciar el Test
  const handleStart = () => {
    setStep("quiz");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTotalScore(0);
  };

  // Manejar selección de respuesta
  const handleRadioChange = (event) => {
    const score = parseInt(event.target.value, 10);
    setSelectedAnswer(score);
  };

  // Siguiente pregunta o calcular resultado
  const handleNext = () => {
    const newScore = totalScore + selectedAnswer;
    setTotalScore(newScore);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Calcular perfil final basado en el rango de puntos para 10 preguntas
      // Puntos posibles: 10 (mínimo) a 30 (máximo)
      let profileKey = "moderado";
      if (newScore <= 16) profileKey = "conservador";
      else if (newScore >= 24) profileKey = "agresivo";

      setFinalProfile(PROFILES[profileKey]);
      
      // Guardamos en localStorage para que el resto de la app (como el Trading) pueda consumirlo
      localStorage.setItem("investor_profile", profileKey);
      setStep("result");
    }
  };

  const progressPercentage = (currentQuestionIndex / QUESTIONS.length) * 100;

  return (
    <Stack spacing={4} sx={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
      {/* Encabezado */}
      <Stack>
        <Typography variant="h4" fontWeight={700} color="white">
          Perfil de Inversor
        </Typography>
        <Typography color="gray" variant="body2">
          Descubrí tu tolerancia al riesgo para optimizar tu estrategia en el simulador.
        </Typography>
      </Stack>

      {/* --- ESTADO 1: PANTALLA DE INICIO --- */}
      {step === "start" && (
        <Card sx={{ backgroundColor: "#15181e", borderRadius: 2, border: "1px solid #1c2025", p: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <AssignmentIndIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
              ¿Qué tipo de inversor sos?
            </Typography>
            <Typography color="gray" variant="body1" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
              Antes de armar tu cartera de Cedears o bonos, es fundamental saber cómo reaccionás ante los movimientos del mercado. Este test te tomará menos de 3 minutos.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 4 }}
            >
              Comenzar Test
            </Button>
          </CardContent>
        </Card>
      )}

      {/* --- ESTADO 2: CUESTIONARIO EN PASOS --- */}
      {step === "quiz" && (
        <Stack spacing={3}>
          {/* Barra de Progreso */}
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" color="gray">Pregunta {currentQuestionIndex + 1} de {QUESTIONS.length}</Typography>
              <Typography variant="caption" color="primary" fontWeight={600}>{Math.round(progressPercentage)}% completado</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progressPercentage} sx={{ borderRadius: 1, height: 6, backgroundColor: "#222731" }} />
          </Box>

          {/* Tarjeta de Pregunta */}
          <Card sx={{ backgroundColor: "#15181e", borderRadius: 2, border: "1px solid #1c2025" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 3 }}>
                {QUESTIONS[currentQuestionIndex].question}
              </Typography>

              <RadioGroup value={selectedAnswer} onChange={handleRadioChange}>
                <Stack spacing={2}>
                  {QUESTIONS[currentQuestionIndex].options.map((opt, index) => {
                    const isSelected = selectedAnswer === opt.score;
                    return (
                      <Box
                        key={index}
                        sx={{
                          border: "1px solid",
                          borderColor: isSelected ? "primary.main" : "#222731",
                          borderRadius: 2,
                          p: 1.5,
                          backgroundColor: isSelected ? "rgba(33, 150, 243, 0.04)" : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": { borderColor: "primary.main", backgroundColor: "rgba(33, 150, 243, 0.02)" }
                        }}
                      >
                        <FormControlLabel
                          value={opt.score}
                          control={<Radio size="small" />}
                          label={<Typography variant="body2" color="white" sx={{ pl: 0.5 }}>{opt.text}</Typography>}
                          sx={{ width: "100%", margin: 0 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </RadioGroup>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  disabled={selectedAnswer === null}
                  onClick={handleNext}
                  sx={{ fontWeight: 700, textTransform: "none", borderRadius: 1.5, px: 3 }}
                >
                  {currentQuestionIndex === QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* --- ESTADO 3: PANTALLA DE RESULTADO --- */}
      {step === "result" && finalProfile && (
        <Card sx={{ backgroundColor: "#15181e", borderRadius: 2, border: "1px solid #1c2025", p: 1 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" textAlign="center" spacing={2} sx={{ mb: 3 }}>
              {finalProfile.icon}
              <Typography variant="h4" fontWeight={800} color={finalProfile.color}>
                {finalProfile.title}
              </Typography>
              <Typography variant="body1" color="gray" sx={{ maxWidth: 550 }}>
                {finalProfile.description}
              </Typography>
            </Stack>

            <Box sx={{ backgroundColor: "#1c2025", borderRadius: 2, p: 3, mb: 4, border: "1px solid #222731" }}>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 2 }}>
                Instrumentos sugeridos para tu perfil:
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {finalProfile.instruments.map((inst, index) => (
                  <Chip 
                    key={index} 
                    label={inst} 
                    variant="outlined"
                    sx={{ 
                      color: "white", 
                      borderColor: "#333b48", 
                      backgroundColor: "#15181e", 
                      fontWeight: 600 
                    }} 
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ReplayIcon />}
                onClick={handleStart}
                sx={{ color: "gray", borderColor: "#333b48", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: "white", color: "white" } }}
              >
                Volver a realizar el test
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default InvestorProfilePage;