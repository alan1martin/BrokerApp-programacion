
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/dashboard-layout";

import DashboardPage from "./pages/dashboard-page";
import MarketsPage from "./pages/markets-page";
import PortfolioPage from "./pages/portfolio-page";
import TradingPage from "./pages/trading-page";
import SettingsPage from "./pages/settings-page";

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
