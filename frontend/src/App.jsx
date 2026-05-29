import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/protected-route";

import DashboardLayout from "./layouts/dashboard-layout";

import DashboardPage from "./pages/dashboard-page";
import MarketsPage from "./pages/markets-page";
import SettingsPage from "./pages/settings-page";
import LoginPage from "./pages/login-page";

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
          <Route
            index
            element={<DashboardPage />}
          />

          <Route
            path="markets"
            element={<MarketsPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
