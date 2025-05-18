
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, MessageSquare, CircleCheck } from 'lucide-react';

interface DashboardWelcomeEnhancedProps {
  patientName: string;
  complianceScore: number;
  appointmentsCount: number;
  unreadMessages: number;
}

const DashboardWelcomeEnhanced: React.FC<DashboardWelcomeEnhancedProps> = ({ 
  patientName, 
  complianceScore, 
  appointmentsCount,
  unreadMessages 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold tracking-tight text-autheo-primary mb-1">
              Welcome, {patientName}
            </h1>
            <p className="text-slate-300">
              Your personalized health dashboard with real-time insights and information.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
              <div className="bg-autheo-primary/20 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-autheo-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Appointments</p>
                <p className="font-semibold text-white">{appointmentsCount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
              <div className="bg-autheo-primary/20 p-2 rounded-full">
                <FileText className="h-4 w-4 text-autheo-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Records</p>
                <p className="font-semibold text-white">
                  {new Date().getDate() - 3} days ago
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
              <div className="bg-autheo-primary/20 p-2 rounded-full">
                <MessageSquare className="h-4 w-4 text-autheo-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Messages</p>
                <p className="font-semibold text-white">{unreadMessages} unread</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
              <div className="bg-autheo-primary/20 p-2 rounded-full">
                <CircleCheck className="h-4 w-4 text-autheo-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Compliance</p>
                <p className="font-semibold text-white">{complianceScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWelcomeEnhanced;
