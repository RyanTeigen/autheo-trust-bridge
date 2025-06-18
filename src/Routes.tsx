
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
      <Route path="/" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <PatientDashboardPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/provider-portal" element={
        <ProtectedRoute allowedRoles={['admin', 'provider']}>
          <LazyRoute>
            <MainLayout>
              <ProviderPortalPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-portal" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <LazyRoute>
            <MainLayout>
              <AdminPortalPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance" element={
        <ProtectedRoute allowedRoles={['admin', 'compliance']}>
          <LazyRoute>
            <MainLayout>
              <CompliancePage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/shared-records" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <SharedRecordsPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-logs" element={
        <ProtectedRoute allowedRoles={['admin', 'compliance']}>
          <LazyRoute>
            <MainLayout>
              <AuditLogsPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />

      <Route path="/production-deployment" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <LazyRoute>
            <MainLayout>
              <ProductionDeploymentPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/medical-records" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <MedicalRecordsPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
    </Routes>
  );
};
