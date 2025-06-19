
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { FrontendAuthProvider } from '@/contexts/FrontendAuthContext';
import { HealthRecordsProvider } from '@/contexts/HealthRecordsContext';
import { SmartFormsProvider } from '@/contexts/SmartFormsContext';
import { UserSettingsProvider } from '@/contexts/user-settings/UserSettingsProvider';
import { AdminPortalProvider } from '@/contexts/AdminPortalContext';
import { ProviderPortalProvider } from '@/contexts/ProviderPortalContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { lazy } from 'react';
import LazyRoute from '@/components/common/LazyRoute';

// Lazy load pages
const Index = lazy(() => import('@/pages/Index'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const PatientDashboardPage = lazy(() => import('@/pages/PatientDashboardPage'));
const MedicalRecordsPage = lazy(() => import('@/pages/MedicalRecordsPage'));
const DetailedHealthRecordsPage = lazy(() => import('@/pages/DetailedHealthRecordsPage'));
const HealthTrackerPage = lazy(() => import('@/pages/HealthTrackerPage'));
const SchedulingPage = lazy(() => import('@/pages/SchedulingPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const WalletPage = lazy(() => import('@/pages/WalletPage'));
const SharedRecordsPage = lazy(() => import('@/pages/SharedRecordsPage'));
const ProviderAccess = lazy(() => import('@/pages/ProviderAccess'));
const ProviderPortalPage = lazy(() => import('@/pages/ProviderPortalPage'));
const AdminPortalPage = lazy(() => import('@/pages/AdminPortalPage'));
const AuditLogsPage = lazy(() => import('@/pages/AuditLogsPage'));
const CompliancePage = lazy(() => import('@/pages/CompliancePage'));
const MedicalNotesPage = lazy(() => import('@/pages/MedicalNotesPage'));
const PatientRecordsPage = lazy(() => import('@/pages/PatientRecordsPage'));
const SmartFormsPage = lazy(() => import('@/pages/SmartFormsPage'));
const ProductionDeploymentPage = lazy(() => import('@/pages/ProductionDeploymentPage'));
const QuantumSecurityPage = lazy(() => import('@/pages/QuantumSecurityPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <FrontendAuthProvider>
          <UserSettingsProvider>
            <HealthRecordsProvider>
              <SmartFormsProvider>
                <AdminPortalProvider>
                  <ProviderPortalProvider>
                    <Routes>
                      <Route path="/auth" element={<LazyRoute component={AuthPage} />} />
                      <Route path="/unauthorized" element={<LazyRoute component={Unauthorized} />} />
                      
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<LazyRoute component={Index} />} />
                        
                        <Route path="/patient-dashboard" element={
                          <ProtectedRoute>
                            <LazyRoute component={PatientDashboardPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/medical-records" element={
                          <ProtectedRoute>
                            <LazyRoute component={MedicalRecordsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/health-records" element={
                          <ProtectedRoute>
                            <LazyRoute component={DetailedHealthRecordsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/health-tracker" element={
                          <ProtectedRoute>
                            <LazyRoute component={HealthTrackerPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/scheduling" element={
                          <ProtectedRoute>
                            <LazyRoute component={SchedulingPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/settings" element={
                          <ProtectedRoute>
                            <LazyRoute component={SettingsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/wallet" element={
                          <ProtectedRoute>
                            <LazyRoute component={WalletPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/shared-records" element={
                          <ProtectedRoute>
                            <LazyRoute component={SharedRecordsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/provider-access" element={
                          <ProtectedRoute allowedRoles={['provider']}>
                            <LazyRoute component={ProviderAccess} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/provider-portal" element={
                          <ProtectedRoute allowedRoles={['provider']}>
                            <LazyRoute component={ProviderPortalPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/admin" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <LazyRoute component={AdminPortalPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/audit-logs" element={
                          <ProtectedRoute allowedRoles={['admin', 'provider']}>
                            <LazyRoute component={AuditLogsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/compliance" element={
                          <ProtectedRoute allowedRoles={['admin', 'provider']}>
                            <LazyRoute component={CompliancePage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/medical-notes" element={
                          <ProtectedRoute allowedRoles={['provider']}>
                            <LazyRoute component={MedicalNotesPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/patient-records" element={
                          <ProtectedRoute allowedRoles={['provider']}>
                            <LazyRoute component={PatientRecordsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/smart-forms" element={
                          <ProtectedRoute>
                            <LazyRoute component={SmartFormsPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/production-deployment" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <LazyRoute component={ProductionDeploymentPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/quantum-security" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <LazyRoute component={QuantumSecurityPage} />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="*" element={<LazyRoute component={NotFound} />} />
                      </Route>
                    </Routes>
                  </ProviderPortalProvider>
                </AdminPortalProvider>
              </SmartFormsProvider>
            </HealthRecordsProvider>
          </UserSettingsProvider>
        </FrontendAuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
