// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/protected-route";
import DashboardLayout from "./layouts/dashboard-layout";
import DashboardPage from "./pages/dashboard-page";
import CompositionPage from "./pages/composition-page";
import MarketsPage from "./pages/markets-page";
import SettingsPage from "./pages/settings-page";
import LoginPage from "./pages/login-page";
import TradingPage from "./pages/trading-page"; 
import HistoryPage from "./pages/history-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Ruta raíz (Dashboard principal) */}
          <Route
            index
            element={<DashboardPage />}
          />

          {/* Ruta de Composición de Activos (Fase 3) */}
          <Route
            path="composition"
            element={<CompositionPage />}
          />

          {/* Ruta de Portfolio
            Mapeamos 'portfolio' a CompositionPage para que cuando hagas clic en 
            "Portfolio" en tu Sidebar viejo, levante también el gráfico sin romperse.
          */}
          <Route
            path="portfolio"
            element={<CompositionPage />}
          />

          {/* Ruta de Trading */}
          <Route
            path="trading"
            element={<TradingPage />}
          />

          {/* Panel de Cotizaciones (Fase 4) 📈 */}
          <Route
            path="markets"
            element={<MarketsPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
          
          <Route
            path="history"
            element={<HistoryPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;