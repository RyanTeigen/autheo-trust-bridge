
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import NotificationCenter from '../notifications/NotificationCenter';
import GlobalSearch from '../search/GlobalSearch';
import SessionStatusIndicator from '../security/SessionStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileMenu from '../auth/UserProfileMenu';
import ErrorBoundary from '../ux/ErrorBoundary';
import LoadingStates from '../ux/LoadingStates';
import PolicyAcknowledgmentCard from '../compliance/PolicyAcknowledgmentCard';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100">
        <LoadingStates type="security" message="Authenticating..." size="lg" />
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">Application error occurred</div>}>
      <div className="min-h-screen bg-slate-900 text-slate-100 overflow-hidden">
        <SidebarProvider>
          <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 w-full">
            <AppHeader>
              <div className="flex items-center gap-4">
                <GlobalSearch />
                <NotificationCenter />
                <UserProfileMenu />
              </div>
            </AppHeader>
            <div className="flex flex-1 overflow-hidden w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto bg-slate-900 text-slate-100">
                <div className="min-h-full bg-slate-900 text-slate-100 w-full">
                  {children}
                </div>
              </main>
            </div>
            <ErrorBoundary fallback={<div className="text-slate-400 text-sm p-2">Session status unavailable</div>}>
              <SessionStatusIndicator />
            </ErrorBoundary>
          </div>
        </SidebarProvider>
        
        {/* HIPAA Policy Acknowledgment Modal */}
        <div style={{ position: 'relative', zIndex: 10000 }}>
          <PolicyAcknowledgmentCard />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
