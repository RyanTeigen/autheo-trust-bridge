
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import SharedRecordsPage from "./pages/SharedRecordsPage";
import WalletPage from "./pages/WalletPage";
import ProviderPortalPage from "./pages/ProviderPortalPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import SchedulingPage from "./pages/SchedulingPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import MedicalNotesPage from "./pages/MedicalNotesPage";
import CompliancePage from "./pages/CompliancePage";
import AuditLogsPage from "./pages/AuditLogsPage";
import ProviderAccess from "./pages/ProviderAccess";

export const createRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <PatientDashboardPage />,
        },
        {
          path: "patient-dashboard",
          element: <PatientDashboardPage />,
        },
        {
          path: "shared-records",
          element: <SharedRecordsPage />,
        },
        {
          path: "wallet",
          element: <WalletPage />,
        },
        {
          path: "provider-portal",
          element: <ProviderPortalPage />,
        },
        {
          path: "patient-records",
          element: <PatientRecordsPage />,
        },
        {
          path: "provider-access",
          element: <ProviderAccess />,
        },
        {
          path: "scheduling",
          element: <SchedulingPage />,
        },
        {
          path: "settings",
          element: <SettingsPage />,
        },
        {
          path: "medical-notes",
          element: <MedicalNotesPage />,
        },
        {
          path: "compliance",
          element: <CompliancePage />,
        },
        {
          path: "audit-logs",
          element: <AuditLogsPage />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};
