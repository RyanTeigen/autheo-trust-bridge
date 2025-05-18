
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import SharedRecordsPage from "./pages/SharedRecordsPage";
import WalletPage from "./pages/WalletPage";
import ProviderPortalPage from "./pages/ProviderPortalPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import SchedulingPage from "./pages/SchedulingPage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProviderAccess from "./pages/ProviderAccess";
import Layout from "./Layout";

export const createRouter = () => {
  return createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <HomePage />,
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
          path: "security",
          element: <SecurityPage />,
        },
        {
          path: "settings",
          element: <SettingsPage />,
        },
        {
          path: "notifications",
          element: <NotificationsPage />,
        },
      ],
    },
  ]);
};
