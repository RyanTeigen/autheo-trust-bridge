
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LazyRoute from '@/components/common/LazyRoute';

// Lazy imports for pages that exist
const PatientDashboardPage = React.lazy(() => import('@/pages/PatientDashboardPage'));
const ProviderPortalPage = React.lazy(() => import('@/pages/ProviderPortalPage'));
const AuditLogsPage = React.lazy(() => import('@/pages/AuditLogsPage'));
const SharedRecordsPage = React.lazy(() => import('@/pages/SharedRecordsPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const MedicalRecordsPage = React.lazy(() => import('@/pages/MedicalRecordsPage'));
const CompliancePage = React.lazy(() => import('@/pages/CompliancePage'));
const AdminPortalPage = React.lazy(() => import('@/pages/AdminPortalPage'));
const ProductionDeploymentPage = React.lazy(() => import('@/pages/ProductionDeploymentPage'));

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LazyRoute component={AuthPage} />} />
      <Route path="/auth" element={<LazyRoute component={AuthPage} />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <LazyRoute component={PatientDashboardPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/provider-portal" element={
        <ProtectedRoute allowedRoles={['admin', 'provider']}>
          <MainLayout>
            <LazyRoute component={ProviderPortalPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-portal" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <LazyRoute component={AdminPortalPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance" element={
        <ProtectedRoute allowedRoles={['admin', 'compliance']}>
          <MainLayout>
            <LazyRoute component={CompliancePage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/shared-records" element={
        <ProtectedRoute>
          <MainLayout>
            <LazyRoute component={SharedRecordsPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-logs" element={
        <ProtectedRoute allowedRoles={['admin', 'compliance']}>
          <MainLayout>
            <LazyRoute component={AuditLogsPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <LazyRoute component={SettingsPage} />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/production-deployment" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <LazyRoute component={ProductionDeploymentPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/medical-records" element={
        <ProtectedRoute>
          <MainLayout>
            <LazyRoute component={MedicalRecordsPage} />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};
