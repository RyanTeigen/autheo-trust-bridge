import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FHIRDataExchange from '@/components/fhir/FHIRDataExchange';
import ExternalSystemsManager from '@/components/integrations/ExternalSystemsManager';
import FHIRResourceValidator from '@/components/interoperability/FHIRResourceValidator';
import InternationalCompliance from '@/components/interoperability/InternationalCompliance';
import CrossBorderDataExchange from '@/components/interoperability/CrossBorderDataExchange';
import TelemedicineInfrastructure from '@/components/interoperability/TelemedicineInfrastructure';
import { Database, Zap, Video, Globe, FileCheck, Shield } from 'lucide-react';

const InteroperabilityPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Healthcare Interoperability</h1>
        <p className="text-muted-foreground mt-2">
          Manage FHIR data exchange, external system integrations, and telemedicine infrastructure
        </p>
      </div>

      <Tabs defaultValue="fhir" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="fhir" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            FHIR Exchange
          </TabsTrigger>
          <TabsTrigger value="validator" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            FHIR Validator
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            System Integrations
          </TabsTrigger>
          <TabsTrigger value="telemedicine" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Telemedicine
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Int'l Compliance
          </TabsTrigger>
          <TabsTrigger value="cross-border" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Cross-Border
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fhir">
          <FHIRDataExchange />
        </TabsContent>

        <TabsContent value="validator">
          <FHIRResourceValidator />
        </TabsContent>

        <TabsContent value="integrations">
          <ExternalSystemsManager />
        </TabsContent>

        <TabsContent value="telemedicine">
          <TelemedicineInfrastructure />
        </TabsContent>

        <TabsContent value="compliance">
          <InternationalCompliance />
        </TabsContent>

        <TabsContent value="cross-border">
          <CrossBorderDataExchange />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default InteroperabilityPage;