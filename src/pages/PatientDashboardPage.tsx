
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import PatientEducationCenter from '@/components/education/PatientEducationCenter';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import TelemedicineInterface from '@/components/telemedicine/TelemedicineInterface';
import AdvancedConsentManagement from '@/components/consent/AdvancedConsentManagement';

const PatientDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-gradient-primary bg-gradient-to-r from-autheo-primary to-autheo-secondary bg-clip-text text-transparent">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Access your personalized health information, communicate with providers, and manage your healthcare experience.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <Card className="border-b border-slate-200">
          <CardContent className="p-0">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Education
              </TabsTrigger>
              <TabsTrigger
                value="messaging"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Secure Messaging
              </TabsTrigger>
              <TabsTrigger
                value="telemedicine"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Telemedicine
              </TabsTrigger>
              <TabsTrigger
                value="consent"
                className="rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold data-[state=active]:border-autheo-primary data-[state=active]:text-autheo-primary"
              >
                Consent Management
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>
        
        <TabsContent value="overview" className="space-y-6">
          <PersonalizedDashboard />
        </TabsContent>
        
        <TabsContent value="education" className="space-y-6">
          <PatientEducationCenter />
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-6">
          <SecureMessaging />
        </TabsContent>
        
        <TabsContent value="telemedicine" className="space-y-6">
          <TelemedicineInterface />
        </TabsContent>
        
        <TabsContent value="consent" className="space-y-6">
          <AdvancedConsentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboardPage;
