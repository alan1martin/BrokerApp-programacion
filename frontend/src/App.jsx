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
import RegisterPage from "./pages/register-page";
import TradingPage from "./pages/trading-page"; 
import HistoryPage from "./pages/history-page";
import InvestorProfilePage from "./pages/investor-profile-page"; 
import Reports from "./pages/reports"; 
import FavoritesPage from "./pages/favorites-page";
import TechnicalAnalysisPage from "./pages/technical-analysis-page";
import WealthProjectionPage from "./pages/wealth-projection-page";
import CautionsPage from "./pages/cautions-page";
import StopLossAlertsPage from "./pages/stop-loss-alerts-page";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTENTICACIÓN PÚBLICA */}
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
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

          {/* Alias de portfolio a CompositionPage */}
          <Route
            path="portfolio"
            element={<CompositionPage />}
          />

          {/* Ruta de Trading */}
          <Route
            path="trading"
            element={<TradingPage />}
          />

          {/* Panel de Cotizaciones (Fase 4) */}
          <Route
            path="markets"
            element={<MarketsPage />}
          />

          {/* Zona de configuración */}
          <Route
            path="settings"
            element={<SettingsPage />}
          />
          <Route 
            path="settings/:tab" 
            element={<SettingsPage />} 
          />
          
          {/* Historial de transacciones */}
          <Route
            path="history"
            element={<HistoryPage />}
          />

          {/* Perfil de Inversor (Test CNV) */}
          <Route
            path="investor-profile"
            element={<InvestorProfilePage />}
          />

          {/* Rendimiento e Informes */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Mercados y Análisis */}
          <Route 
            path="markets/favorites" 
            element={<FavoritesPage />} 
          />
          <Route 
            path="markets/technical-analysis" 
            element={<TechnicalAnalysisPage />} 
          />

          {/* Proyecciones y Trading Avanzado */}
          <Route 
            path="portfolio/wealth-projection" 
            element={<WealthProjectionPage />} 
          />
          <Route 
            path="trading/cautions" 
            element={<CautionsPage />} 
          />
          <Route 
            path="trading/stop-loss-alerts" 
            element={<StopLossAlertsPage />} 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
