
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import NotificationCenter from '../notifications/NotificationCenter';
import GlobalSearch from '../search/GlobalSearch';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileMenu from '../auth/UserProfileMenu';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('MainLayout rendering...', { isAuthenticated, isLoading });
  
  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100">
        <div className="animate-pulse text-slate-400">Loading application...</div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to auth...');
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="dark min-h-screen bg-slate-900 text-slate-100">
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
              <div className="min-h-full bg-slate-900 text-slate-100">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
