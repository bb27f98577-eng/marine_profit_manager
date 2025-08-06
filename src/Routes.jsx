import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProfitDistribution from './pages/profit-distribution';
import LoginScreen from './pages/login-screen';
import Dashboard from './pages/dashboard';
import FinancialBoxesManagement from './pages/financial-boxes-management';
import CrewManagement from './pages/crew-management';
import InvoiceManagement from './pages/invoice-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/profit-distribution" element={<ProfitDistribution />} />
        <Route path="/login-screen" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/financial-boxes-management" element={<FinancialBoxesManagement />} />
        <Route path="/crew-management" element={<CrewManagement />} />
        <Route path="/invoice-management" element={<InvoiceManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;