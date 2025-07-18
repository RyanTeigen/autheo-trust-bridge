import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FHIRDataExchange from '@/components/fhir/FHIRDataExchange';
import ExternalSystemsManager from '@/components/integrations/ExternalSystemsManager';
import { Database, Zap, Video, Globe } from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fhir" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            FHIR Exchange
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            System Integrations
          </TabsTrigger>
          <TabsTrigger value="telemedicine" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Telemedicine
          </TabsTrigger>
          <TabsTrigger value="standards" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Standards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fhir">
          <FHIRDataExchange />
        </TabsContent>

        <TabsContent value="integrations">
          <ExternalSystemsManager />
        </TabsContent>

        <TabsContent value="telemedicine" className="space-y-6">
          <div className="text-center py-12">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Telemedicine Infrastructure</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Telemedicine components are implemented in the patient and provider dashboards. 
              This section will contain centralized telemedicine management tools.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">HL7 FHIR R4</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fast Healthcare Interoperability Resources for modern healthcare data exchange
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Implementation</span>
                  <span className="text-green-600 font-medium">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">HL7 v2.x</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Legacy messaging standard for healthcare information exchange
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Support</span>
                  <span className="text-blue-600 font-medium">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">DICOM</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Digital Imaging and Communications in Medicine for medical imaging
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Integration</span>
                  <span className="text-yellow-600 font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">IHE Profiles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Integrating the Healthcare Enterprise interoperability profiles
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compliance</span>
                  <span className="text-purple-600 font-medium">70%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">SMART on FHIR</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Secure, standards-based API access to Electronic Health Records
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Implementation</span>
                  <span className="text-green-600 font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">CDA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Clinical Document Architecture for structured healthcare documents
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Support</span>
                  <span className="text-orange-600 font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteroperabilityPage;