
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

// Pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import SmartFormsPage from '@/pages/SmartFormsPage';
import PatientDashboardPage from '@/pages/PatientDashboardPage';
import WalletPage from '@/pages/WalletPage';
import SharedRecordsPage from '@/pages/SharedRecordsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import HealthTrackerPage from '@/pages/HealthTrackerPage';
import SettingsPage from '@/pages/SettingsPage';
import ProviderPortalPage from '@/pages/ProviderPortalPage';
import PatientRecordsPage from '@/pages/PatientRecordsPage';
import ProviderAccess from '@/pages/ProviderAccess';
import MedicalNotesPage from '@/pages/MedicalNotesPage';
import AdminPortalPage from '@/pages/AdminPortalPage';
import CompliancePage from '@/pages/CompliancePage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import DetailedHealthRecordsPage from '@/pages/DetailedHealthRecordsPage';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* General routes */}
        <Route path="/" element={<Index />} />
        <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
        <Route path="/smart-forms" element={<SmartFormsPage />} />
        <Route path="/health-records" element={<DetailedHealthRecordsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/shared-records" element={<SharedRecordsPage />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/health-tracker" element={<HealthTrackerPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Provider routes */}
        <Route path="/provider-portal" element={
          <ProtectedRoute requiredRoles={['provider']}>
            <ProviderPortalPage />
          </ProtectedRoute>
        } />
        <Route path="/patient-records" element={
          <ProtectedRoute requiredRoles={['provider']}>
            <PatientRecordsPage />
          </ProtectedRoute>
        } />
        <Route path="/provider-access" element={<ProviderAccess />} />
        <Route path="/medical-notes" element={<MedicalNotesPage />} />

        {/* Admin routes */}
        <Route path="/admin-portal" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminPortalPage />
          </ProtectedRoute>
        } />
        <Route path="/compliance" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <CompliancePage />
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AuditLogsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
