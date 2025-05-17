
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import CompliancePage from "./pages/CompliancePage";
import AuditLogsPage from "./pages/AuditLogsPage";
import WalletPage from "./pages/WalletPage";
import NotFound from "./pages/NotFound";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import ProviderPortalPage from "./pages/ProviderPortalPage";
import MedicalNotesPage from "./pages/MedicalNotesPage";
import SharedRecordsPage from "./pages/SharedRecordsPage";
import SettingsPage from "./pages/SettingsPage";
import SchedulingPage from "./pages/SchedulingPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import { HealthRecordsProvider } from "./contexts/HealthRecordsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HealthRecordsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/shared-records" element={<SharedRecordsPage />} />
              <Route path="/patient-records" element={<PatientRecordsPage />} />
              <Route path="/provider-portal" element={<ProviderPortalPage />} />
              <Route path="/medical-notes" element={<MedicalNotesPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/scheduling" element={<SchedulingPage />} />
              <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HealthRecordsProvider>
  </QueryClientProvider>
);

export default App;
