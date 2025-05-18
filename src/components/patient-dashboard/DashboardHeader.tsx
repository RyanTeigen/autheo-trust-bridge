
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-gradient-primary bg-gradient-to-r from-autheo-primary to-autheo-secondary bg-clip-text text-transparent">Welcome to Your Health Dashboard</h1>
      <p className="text-slate-300 max-w-3xl">
        Access your personalized health information, communicate with providers, and manage your healthcare experience all in one place.
      </p>
    </div>
  );
};

export default DashboardHeader;
