
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Unauthorized from "./pages/Unauthorized";
import CompliancePage from "./pages/CompliancePage";
import AuditLogsPage from "./pages/AuditLogsPage";
import WalletPage from "./pages/WalletPage";
import NotFound from "./pages/NotFound";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import ProviderPortalPage from "./pages/ProviderPortalPage";
import MedicalNotesPage from "./pages/MedicalNotesPage";
import SharedRecordsPage from "./pages/SharedRecordsPage";
import SettingsPage from "./pages/SettingsPage";
import SchedulingPage from "./pages/SchedulingPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import HealthTrackerPage from "./pages/HealthTrackerPage";
import DetailedHealthRecordsPage from "./pages/DetailedHealthRecordsPage";
import { HealthRecordsProvider } from "./contexts/HealthRecordsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserSettingsProvider>
        <HealthRecordsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Auth routes - available to unauthenticated users */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes - require authentication */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  {/* Dashboard - accessible to all authenticated users */}
                  <Route path="/" element={<PatientDashboardPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/shared-records" element={<SharedRecordsPage />} />
                  <Route path="/patient-records" element={<PatientRecordsPage />} />
                  <Route path="/medical-notes" element={<MedicalNotesPage />} />
                  <Route path="/health-tracker" element={<HealthTrackerPage />} />
                  <Route path="/my-health-records" element={<DetailedHealthRecordsPage />} />
                  
                  {/* Provider routes */}
                  <Route path="/provider-portal" element={
                    <ProtectedRoute requiredRoles={['provider']}>
                      <ProviderPortalPage />
                    </ProtectedRoute>
                  } />

                  {/* Compliance routes - now accessible to all authenticated users */}
                  <Route path="/compliance" element={<CompliancePage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  
                  {/* Common routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/scheduling" element={<SchedulingPage />} />
                  <Route path="/patient-dashboard" element={<Navigate to="/" replace />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HealthRecordsProvider>
      </UserSettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
