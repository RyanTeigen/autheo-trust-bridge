import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LazyRoute from '@/components/common/LazyRoute';

// Lazy imports for better performance
const PatientDashboardPage = React.lazy(() => import('@/pages/PatientDashboardPage'));
const ProviderPortalPage = React.lazy(() => import('@/pages/ProviderPortalPage'));
const AdminDashboardPage = React.lazy(() => import('@/pages/AdminDashboardPage'));
const ComplianceDashboardPage = React.lazy(() => import('@/pages/ComplianceDashboardPage'));
const SharedRecordsPage = React.lazy(() => import('@/pages/SharedRecordsPage'));
const MyHealthRecordsPage = React.lazy(() => import('@/pages/MyHealthRecordsPage'));
const AuditLogPage = React.lazy(() => import('@/pages/AuditLogPage'));
const MessagingPage = React.lazy(() => import('@/pages/MessagingPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const FitnessPrivacyPage = React.lazy(() => import('@/pages/FitnessPrivacyPage'));
const ProductionDashboardPage = React.lazy(() => import('@/pages/ProductionDashboardPage'));
const MedicalRecordsPage = React.lazy(() => import('@/pages/MedicalRecordsPage'));

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
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
        <ProtectedRoute roles={['admin', 'provider']}>
          <LazyRoute>
            <MainLayout>
              <ProviderPortalPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-dashboard" element={
        <ProtectedRoute roles={['admin']}>
          <LazyRoute>
            <MainLayout>
              <AdminDashboardPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/compliance-dashboard" element={
        <ProtectedRoute roles={['admin', 'compliance']}>
          <LazyRoute>
            <MainLayout>
              <ComplianceDashboardPage />
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
      
      <Route path="/my-health-records" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <MyHealthRecordsPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-logs" element={
        <ProtectedRoute roles={['admin', 'compliance']}>
          <LazyRoute>
            <MainLayout>
              <AuditLogPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/messaging" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <MessagingPage />
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

      <Route path="/fitness-privacy" element={
        <ProtectedRoute>
          <LazyRoute>
            <MainLayout>
              <FitnessPrivacyPage />
            </MainLayout>
          </LazyRoute>
        </ProtectedRoute>
      } />

      <Route path="/production-dashboard" element={
        <ProtectedRoute roles={['admin']}>
          <LazyRoute>
            <MainLayout>
              <ProductionDashboardPage />
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
