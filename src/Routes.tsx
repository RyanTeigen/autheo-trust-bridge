
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LazyRoute from '@/components/common/LazyRoute';

// Lazy imports for code splitting
import { 
  LazyPatientDashboard,
  LazyProviderPortal,
  LazyAdminPortal,
  LazyWalletPage,
  LazySchedulingPage,
  LazyHealthTracker,
  LazyCompliancePage,
  LazyAuditLogsPage,
  LazySharedRecordsPage,
  LazySmartFormsPage,
  LazySettingsPage,
  LazyDetailedHealthRecords,
  LazyPatientRecords,
  LazyMedicalNotes,
  LazyProviderAccess
} from '@/routes/LazyRoutes';

// Direct imports for frequently accessed pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Index />} />
          
          {/* Dashboard routes */}
          <Route path="dashboard" element={
            <LazyRoute>
              <LazyPatientDashboard />
            </LazyRoute>
          } />
          
          {/* Provider routes */}
          <Route path="provider" element={
            <LazyRoute>
              <LazyProviderPortal />
            </LazyRoute>
          } />
          <Route path="provider-access" element={
            <LazyRoute>
              <LazyProviderAccess />
            </LazyRoute>
          } />
          
          {/* Admin routes */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LazyRoute>
                <LazyAdminPortal />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          {/* Health records and medical routes */}
          <Route path="health-records" element={
            <LazyRoute>
              <LazyDetailedHealthRecords />
            </LazyRoute>
          } />
          <Route path="patient-records" element={
            <LazyRoute>
              <LazyPatientRecords />
            </LazyRoute>
          } />
          <Route path="medical-notes" element={
            <LazyRoute>
              <LazyMedicalNotes />
            </LazyRoute>
          } />
          <Route path="health-tracker" element={
            <LazyRoute>
              <LazyHealthTracker />
            </LazyRoute>
          } />
          
          {/* Wallet and financial routes */}
          <Route path="wallet" element={
            <LazyRoute>
              <LazyWalletPage />
            </LazyRoute>
          } />
          
          {/* Scheduling and appointments */}
          <Route path="scheduling" element={
            <LazyRoute>
              <LazySchedulingPage />
            </LazyRoute>
          } />
          
          {/* Compliance and audit */}
          <Route path="compliance" element={
            <LazyRoute>
              <LazyCompliancePage />
            </LazyRoute>
          } />
          <Route path="audit-logs" element={
            <LazyRoute>
              <LazyAuditLogsPage />
            </LazyRoute>
          } />
          
          {/* Shared records and forms */}
          <Route path="shared-records" element={
            <LazyRoute>
              <LazySharedRecordsPage />
            </LazyRoute>
          } />
          <Route path="smart-forms" element={
            <LazyRoute>
              <LazySmartFormsPage />
            </LazyRoute>
          } />
          
          {/* Settings */}
          <Route path="settings" element={
            <LazyRoute>
              <LazySettingsPage />
            </LazyRoute>
          } />
        </Route>
        
        {/* Fallback routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      <Toaster />
    </>
  );
};

export default AppRoutes;
