import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RentalProvider } from "@/contexts/RentalContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Units from "./pages/Units";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Info pages
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <RentalProvider>
              <Routes>
                {/* Public pages */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Auth />} />

                {/* Legal/info pages */}
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Protected pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/units"
                  element={
                    <ProtectedRoute>
                      <Units />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tenants"
                  element={
                    <ProtectedRoute>
                      <Tenants />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RentalProvider>
          </AuthProvider>
        </BrowserRouter>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
