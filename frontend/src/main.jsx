import React from "react";
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
import theme from "./theme/theme";
// ➔ 1. IMPORTAMOS NUESTRO PROVEEDOR DE MERCADO REAL
import { MarketProvider } from "./context/market-context.jsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* ➔ 2. ENVOLVEMOS EL APP CON EL MARKET PROVIDER */}
        <MarketProvider>
          <App />
        </MarketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);