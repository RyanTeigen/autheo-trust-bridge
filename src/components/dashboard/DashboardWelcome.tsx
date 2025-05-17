
import React from 'react';

interface DashboardWelcomeProps {
  patientName: string;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ patientName }) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gradient-primary bg-gradient-to-r from-autheo-primary to-autheo-secondary bg-clip-text text-transparent">
          Welcome, {patientName}
        </h1>
        <p className="text-muted-foreground">
          Your personalized health dashboard with real-time insights and information.
        </p>
      </div>
    </div>
  );
};

export default DashboardWelcome;
