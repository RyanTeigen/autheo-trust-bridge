
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
  
  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-pulse text-slate-400">Loading application...</div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <AppHeader>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <NotificationCenter />
            <UserProfileMenu />
          </div>
        </AppHeader>
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto p-6">
            <div className="container max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
