import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Settings, History, UserCheck, FileSignature } from 'lucide-react';
import AccessRequestsTab from './AccessRequestsTab';
import PatientSharingManager from '@/components/patient/PatientSharingManager';
import PatientAccessLogViewer from '@/components/patient/PatientAccessLogViewer';
import PatientAccessManager from '@/components/patient/PatientAccessManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdvancedConsentManagement from '@/components/consent/AdvancedConsentManagement';
import ConsentHashDisplay from '@/components/compliance/ConsentHashDisplay';

const PrivacySecurityTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('access-control');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-autheo-primary" />
            Privacy & Security
          </h2>
          <p className="text-slate-400">
            Manage your data privacy, access controls, and security settings in one place.
          </p>
        </div>

        <Alert className="border-blue-500/30 bg-blue-900/20">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-slate-200">
            <strong>Your Data, Your Control:</strong> Monitor who has access to your health information, 
            review access requests, and track all data access activities.
          </AlertDescription>
        </Alert>
      </div>

      {/* Sub-navigation Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="bg-slate-700 mb-6">
          <TabsTrigger 
            value="access-control"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger 
            value="access-requests"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Access Requests
          </TabsTrigger>
          <TabsTrigger 
            value="consents"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <FileSignature className="h-4 w-4 mr-2" />
            Consents
          </TabsTrigger>
          <TabsTrigger 
            value="access-logs"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            <History className="h-4 w-4 mr-2" />
            Access Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access-control">
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-autheo-primary" />
                  Share New Records
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Grant access to your medical records to healthcare providers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientSharingManager />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-autheo-primary" />
                  Manage Shared Access
                </CardTitle>
                <CardDescription className="text-slate-400">
                  View and revoke existing sharing permissions for your medical records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientAccessManager />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access-requests">
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-autheo-primary" />
                  Pending Access Requests
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Review and respond to requests from healthcare providers to access your medical records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessRequestsTab />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consents">
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <FileSignature className="h-5 w-5 mr-2 text-autheo-primary" />
                  Consent Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Grant, modify, or revoke granular data sharing consents, durations, and scopes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedConsentManagement />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <FileSignature className="h-5 w-5 mr-2 text-autheo-primary" />
                  Signed Consent Records (DID Hashes)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  View cryptographically signed consent hashes anchored for auditability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConsentHashDisplay />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access-logs">
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <History className="h-5 w-5 mr-2 text-autheo-primary" />
                  Access Activity Logs
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor all access activities to your medical records for transparency and security.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientAccessLogViewer />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrivacySecurityTab;