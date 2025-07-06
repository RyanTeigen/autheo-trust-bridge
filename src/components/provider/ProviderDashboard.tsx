import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, BarChart3, Upload } from 'lucide-react';
import Badge from '@/components/emr/Badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Stethoscope, Users as UserIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProviderRecordForm from '@/components/provider/ProviderRecordForm';
import EncryptionDemo from '@/components/provider/EncryptionDemo';
import KeyManagementDemo from '@/components/provider/KeyManagementDemo';
import CryptoComparisonDemo from '@/components/provider/CryptoComparisonDemo';
import ImportRecordForm from '@/components/provider/ImportRecordForm';
import ProviderAnalyticsTab from '@/components/provider/ProviderAnalyticsTab';

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
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="overview" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Record
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Records
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardOverview 
            appointments={appointments}
            recentPatients={recentPatients}
            onSelectPatient={onSelectPatient}
            onAction={onAction}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="space-y-6">
            <ProviderRecordForm />
            <div className="grid gap-6 md:grid-cols-2">
              <EncryptionDemo />
              <KeyManagementDemo />
            </div>
            <CryptoComparisonDemo />
          </div>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <ImportRecordForm />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProviderAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Extracted dashboard overview content
const DashboardOverview: React.FC<{
  appointments: Appointment[];
  recentPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onAction: () => void;
}> = ({ appointments, recentPatients, onSelectPatient, onAction }) => {
  return (
    <div className="space-y-6">
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
        </CardContent>
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
      </Card>
    </div>
  );
};

export default ProviderDashboard;