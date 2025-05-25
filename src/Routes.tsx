import React from 'react';
import { BrowserRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProviderPortalProvider } from '@/contexts/ProviderPortalContext';
import { AdminPortalProvider } from '@/contexts/AdminPortalContext';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

// Page imports
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import PatientDashboardPage from '@/pages/PatientDashboardPage';
import WalletPage from '@/pages/WalletPage';
import SharedRecordsPage from '@/pages/SharedRecordsPage';
import DetailedHealthRecordsPage from '@/pages/DetailedHealthRecordsPage';
import SmartFormsPage from '@/pages/SmartFormsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import SettingsPage from '@/pages/SettingsPage';
import CompliancePage from '@/pages/CompliancePage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import HealthTrackerPage from '@/pages/HealthTrackerPage';
import ProviderPortalPage from '@/pages/ProviderPortalPage';
import PatientRecordsPage from '@/pages/PatientRecordsPage';
import ProviderAccess from '@/pages/ProviderAccess';
import MedicalNotesPage from '@/pages/MedicalNotesPage';
import AdminPortalPage from '@/pages/AdminPortalPage';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProviderPortalProvider>
          <AdminPortalProvider>
            <UserSettingsProvider>
              <AppRoutes />
            </UserSettingsProvider>
          </AdminPortalProvider>
        </ProviderPortalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRoutes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/shared-records" element={<SharedRecordsPage />} />
          <Route path="/health-records" element={<DetailedHealthRecordsPage />} />
          <Route path="/smart-forms" element={<SmartFormsPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/health-tracker" element={<HealthTrackerPage />} />
          
          {/* Provider routes */}
          <Route element={<ProtectedRoute allowedRoles={['provider', 'admin']} />}>
            <Route path="/provider-portal" element={<ProviderPortalPage />} />
            <Route path="/patient-records" element={<PatientRecordsPage />} />
            <Route path="/provider-access" element={<ProviderAccess />} />
            <Route path="/medical-notes" element={<MedicalNotesPage />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-portal" element={<AdminPortalPage />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </BrowserRoutes>
  );
};

export default Routes;
