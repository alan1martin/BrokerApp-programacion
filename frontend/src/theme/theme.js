import { createTheme } from "@mui/material/styles";

// Generador de tema dinámico con soporte total para Dark y Light Mode
export const getAppTheme = (mode = "dark") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: "#4caf50",
        light: "#81c784",
        dark: "#388e3c",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#2196f3",
        light: "#64b5f6",
        dark: "#1976d2",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0b0e11" : "#f8fafc",
        paper: isDark ? "#15181e" : "#ffffff",
      },
      text: {
        primary: isDark ? "#ffffff" : "#0f172a",
        secondary: isDark ? "#9ca3af" : "#64748b",
      },
      divider: isDark ? "#1c2025" : "#e2e8f0",
      action: {
        hover: isDark ? "#1c2025" : "#f1f5f9",
        selected: isDark ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.1)",
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h4: {
        fontWeight: 800,
        color: isDark ? "#ffffff" : "#0f172a",
      },
      h5: {
        fontWeight: 700,
        color: isDark ? "#ffffff" : "#0f172a",
      },
      h6: {
        fontWeight: 700,
        color: isDark ? "#ffffff" : "#0f172a",
      },
      subtitle1: {
        color: isDark ? "#ffffff" : "#0f172a",
      },
      subtitle2: {
        color: isDark ? "#ffffff" : "#0f172a",
      },
      body1: {
        color: isDark ? "#ffffff" : "#0f172a",
      },
      body2: {
        color: isDark ? "#9ca3af" : "#64748b",
      },
      caption: {
        color: isDark ? "#9ca3af" : "#64748b",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "#1c2025" : "#e2e8f0",
            color: isDark ? "#ffffff" : "#0f172a",
          },
          head: {
            fontWeight: 700,
            color: isDark ? "#9ca3af" : "#64748b",
            backgroundColor: isDark ? "#1e222b" : "#f8fafc",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#15181e" : "#ffffff",
            borderColor: isDark ? "#1c2025" : "#e2e8f0",
            color: isDark ? "#ffffff" : "#0f172a",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#15181e" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
          },
        },
      },
    },
  });
};

const defaultTheme = getAppTheme("dark");
export default defaultTheme;
