
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import AuthPage from "./pages/AuthPage";
import Unauthorized from "./pages/Unauthorized";
import CompliancePage from "./pages/CompliancePage";
import AuditLogsPage from "./pages/AuditLogsPage";
import InteroperabilityPage from "./pages/InteroperabilityPage";
import TelemedicinePage from "./pages/TelemedicinePage";
import NotFound from "./pages/NotFound";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import ProviderPortalPage from "./pages/ProviderPortalPage";
import ProviderDashboardPage from "./pages/ProviderDashboardPage";
import MedicalNotesPage from "./pages/MedicalNotesPage";
import SettingsPage from "./pages/SettingsPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import AdminPortalPage from "./pages/AdminPortalPage";
import SmartFormsPage from "./pages/SmartFormsPage";
import SharedRecordsPage from "./pages/SharedRecordsPage";
import { HealthRecordsProvider } from "./contexts/HealthRecordsContext";
import RoleBasedDashboardRedirect from "./components/auth/RoleBasedDashboardRedirect";
import CrossHospitalConsent from "./components/patient/CrossHospitalConsent";
import SecurityDashboard from "./pages/SecurityDashboard";

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Removed console.log for production
  
  return (
    <ErrorBoundary>
      <div className="dark min-h-screen bg-slate-900 text-slate-100">
        <QueryClientProvider client={queryClient}>
          <SecurityProvider>
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
                    
                    {/* Role-based dashboard redirect */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <RoleBasedDashboardRedirect />
                      </ProtectedRoute>
                    } />
                    
                    {/* Patient routes - accessible to all authenticated users (default patient role) */}
                    <Route path="/patient-dashboard" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <PatientDashboardPage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/smart-forms" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SmartFormsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/shared-records" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SharedRecordsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/cross-hospital-consent" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <CrossHospitalConsent />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Provider routes */}
                    <Route path="/provider-portal" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['provider']}>
                          <MainLayout>
                            <ProviderPortalPage />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/provider-dashboard" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['provider']}>
                          <MainLayout>
                            <ProviderDashboardPage />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/patient-records" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['provider']}>
                          <MainLayout>
                            <PatientRecordsPage />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/medical-notes" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['provider']}>
                          <MainLayout>
                            <MedicalNotesPage />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin-portal" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'supervisor']}>
                          <MainLayout>
                            <AdminPortalPage />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />

                    {/* Compliance routes - accessible to all authenticated users */}
                    <Route path="/compliance" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <CompliancePage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/audit-logs" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <AuditLogsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/security-dashboard" element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'compliance', 'provider']}>
                          <MainLayout>
                            <SecurityDashboard />
                          </MainLayout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } />
                    
                    {/* Common routes */}
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <MainLayout>
                          <SettingsPage />
                        </MainLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Legacy redirects */}
                    <Route path="/dashboard" element={<Navigate to="/patient-dashboard" replace />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </HealthRecordsProvider>
            </UserSettingsProvider>
          </AuthProvider>
        </SecurityProvider>
      </QueryClientProvider>
      </div>
    </ErrorBoundary>
  );
};

export default App;
