
import { lazy } from 'react';

// Lazy load all major pages for better code splitting
export const LazyPatientDashboard = lazy(() => import('@/pages/PatientDashboardPage'));
export const LazyProviderPortal = lazy(() => import('@/pages/ProviderPortalPage'));
export const LazyAdminPortal = lazy(() => import('@/pages/AdminPortalPage'));
export const LazyWalletPage = lazy(() => import('@/pages/WalletPage'));
export const LazySchedulingPage = lazy(() => import('@/pages/SchedulingPage'));
export const LazyHealthTracker = lazy(() => import('@/pages/HealthTrackerPage'));
export const LazyCompliancePage = lazy(() => import('@/pages/CompliancePage'));
export const LazyHIPAAAuditLogsPage = lazy(() => import('@/pages/HIPAAAuditLogsPage'));
export const LazySharedRecordsPage = lazy(() => import('@/pages/SharedRecordsPage'));
export const LazySmartFormsPage = lazy(() => import('@/pages/SmartFormsPage'));
export const LazySettingsPage = lazy(() => import('@/pages/SettingsPage'));
export const LazyDetailedHealthRecords = lazy(() => import('@/pages/DetailedHealthRecordsPage'));
export const LazyPatientRecords = lazy(() => import('@/pages/PatientRecordsPage'));
export const LazyMedicalNotes = lazy(() => import('@/pages/MedicalNotesPage'));
export const LazyProviderAccess = lazy(() => import('@/pages/ProviderAccess'));
