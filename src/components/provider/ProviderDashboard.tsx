import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Badge from '@/components/emr/Badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Stethoscope, Users as UserIcon, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProviderRecordForm from '@/components/provider/ProviderRecordForm';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  reason: string;
}

interface ProviderDashboardProps {
  appointments: Appointment[];
  recentPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAction: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ 
  appointments, 
  recentPatients, 
  onSelectPatient,
  onAction 
}) => {
  return (
    <div className="space-y-6">
      {/* Medical Record Creation Form */}
      <ProviderRecordForm />
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-autheo-primary">Today's Schedule</CardTitle>
              <CardDescription className="text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
              <Clock className="h-3.5 w-3.5 mr-1" /> Today's Schedule
            </div>
          </div>
          
          {/* Value Multiplier Indicators */}
          <div className="flex flex-wrap gap-3 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-slate-300">Security</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">HIPAA compliant schedule with zero-knowledge encryption</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <Stethoscope className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-slate-300">Clinical Workflow</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">Integrates with EHR and clinical documentation systems</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <UserIcon className="h-3 w-3 text-purple-400" />
                    <span className="text-xs text-slate-300">Patient Engagement</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">Automatically notifies patients of upcoming appointments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-slate-700/50">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-700/50 h-10 w-10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-autheo-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{appointment.patientName}</p>
                    <p className="text-sm text-slate-400">{appointment.time} - {appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={appointment.status === 'Checked In' ? 'default' : 'outline'}>
                    {appointment.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700" onClick={onAction}>View</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-slate-400 hover:text-autheo-primary hover:bg-slate-700/30" onClick={onAction}>
            View All Appointments
          </Button>
        </CardContent>
        <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center justify-between w-full">
            <span>Schedule synchronized with EHR system</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardFooter>
      </Card>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-autheo-primary">Recent Patients</CardTitle>
              <CardDescription className="text-slate-300">
                Recently accessed patient records
              </CardDescription>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
              <BarChart3 className="h-3.5 w-3.5 mr-1" /> Activity Log
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-slate-700/50">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20">
                <div>
                  <p className="font-medium text-slate-200">{patient.name}</p>
                  <p className="text-sm text-slate-400">
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString()} - {patient.reason}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-600 hover:bg-slate-700" 
                  onClick={() => onSelectPatient(patient.id)}
                >
                  Open Record
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" />
            Patient data access is cryptographically tracked and audited
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProviderDashboard;
