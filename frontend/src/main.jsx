import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import {
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import App from "./App";
import { getAppTheme } from "./theme/theme";
import { MarketProvider } from "./context/market-context.jsx";

const queryClient = new QueryClient();

function RootApp() {
  const [currentMode, setCurrentMode] = useState(() => {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      const mode = localStorage.getItem("theme") === "light" ? "light" : "dark";
      setCurrentMode(mode);
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const theme = getAppTheme(currentMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MarketProvider>
        <App />
      </MarketProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootApp />
    </QueryClientProvider>
  </React.StrictMode>
);
