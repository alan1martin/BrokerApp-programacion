// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
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

        {/* RUTAS PROTEGIDAS DENTRO DEL LAYOUT */}
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

          {/* Rutas de Portafolio */}
          <Route
            path="composition"
            element={<CompositionPage />}
          />
          <Route
            path="portfolio"
            element={<CompositionPage />}
          />
          <Route
            path="portfolio/composition"
            element={<CompositionPage />}
          />
          <Route 
            path="portfolio/projection" 
            element={<WealthProjectionPage />} 
          />
          <Route 
            path="portfolio/wealth-projection" 
            element={<WealthProjectionPage />} 
          />
          <Route 
            path="wealth-projection" 
            element={<WealthProjectionPage />} 
          />

          {/* Rutas de Trading / Operar */}
          <Route
            path="trading"
            element={<TradingPage />}
          />
          <Route
            path="trading/trade"
            element={<TradingPage />}
          />
          <Route 
            path="trading/cautions" 
            element={<CautionsPage />} 
          />
          <Route 
            path="cautions" 
            element={<CautionsPage />} 
          />
          <Route 
            path="trading/stoploss" 
            element={<StopLossAlertsPage />} 
          />
          <Route 
            path="trading/stop-loss-alerts" 
            element={<StopLossAlertsPage />} 
          />
          <Route 
            path="stop-loss-alerts" 
            element={<StopLossAlertsPage />} 
          />

          {/* Rutas de Mercados y Análisis */}
          <Route
            path="markets"
            element={<MarketsPage />}
          />
          <Route 
            path="markets/favorites" 
            element={<FavoritesPage />} 
          />
          <Route 
            path="favorites" 
            element={<FavoritesPage />} 
          />
          <Route 
            path="markets/technical-analysis" 
            element={<TechnicalAnalysisPage />} 
          />
          <Route 
            path="technical-analysis" 
            element={<TechnicalAnalysisPage />} 
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

          {/* Perfil de Inversor */}
          <Route
            path="investor-profile"
            element={<InvestorProfilePage />}
          />

          {/* Rendimiento e Informes */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Fallback de rutas desconocidas dentro de la app */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>

        {/* Fallback global */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
