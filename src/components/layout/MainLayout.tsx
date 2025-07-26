import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import NotificationCenter from '../notifications/NotificationCenter';
import GlobalSearch from '../search/GlobalSearch';
import SessionStatusIndicator from '../security/SessionStatusIndicator';
import SessionTimeoutHandler from '../auth/SessionTimeoutHandler';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileMenu from '../auth/UserProfileMenu';
import ErrorBoundary from '../ux/ErrorBoundary';
import LoadingStates from '../ux/LoadingStates';
import { useFullscreen } from '@/hooks/useFullscreen';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isFullscreen } = useFullscreen();
  
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
      <div className={cn(
        "min-h-screen bg-slate-900 text-slate-100 overflow-hidden transition-all duration-300",
        isFullscreen && "bg-slate-950"
      )}>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 w-full">
            {!isFullscreen && (
              <AppHeader>
                <div className="flex items-center gap-4">
                  <GlobalSearch />
                  <NotificationCenter />
                  <UserProfileMenu />
                </div>
              </AppHeader>
            )}
            <div className={cn(
              "flex flex-1 overflow-hidden w-full",
              isFullscreen ? "h-screen" : "min-h-0"
            )}>
              <AppSidebar />
              <main className={cn(
                "flex-1 overflow-auto bg-slate-900 text-slate-100 transition-all duration-300",
                isFullscreen && "bg-slate-950"
              )}>
                <div className={cn(
                  "min-h-full bg-slate-900 text-slate-100 w-full transition-all duration-300",
                  isFullscreen && "bg-slate-950 p-4"
                )}>
                  {children}
                </div>
              </main>
            </div>
            {!isFullscreen && (
              <>
                <ErrorBoundary fallback={<div className="text-slate-400 text-sm p-2">Session status unavailable</div>}>
                  <SessionStatusIndicator />
                </ErrorBoundary>
                <SessionTimeoutHandler />
              </>
            )}
          </div>
        </SidebarProvider>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
