
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, FileText, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const InteroperabilityStandards = () => {
  const { toast } = useToast();
  
  const supportedStandards = [
    { 
      name: 'FHIR R4',
      status: 'supported',
      description: 'Fast Healthcare Interoperability Resources, Release 4',
      resources: ['Patient', 'Observation', 'MedicationStatement', 'Condition', 'AllergyIntolerance']
    },
    { 
      name: 'HL7 v2',
      status: 'supported',
      description: 'Health Level 7 Version 2 for legacy system compatibility',
      resources: ['ADT', 'ORM', 'ORU', 'MDM']
    },
    { 
      name: 'DICOM',
      status: 'partial',
      description: 'Digital Imaging and Communications in Medicine',
      resources: ['CT', 'MRI', 'X-Ray']
    },
    { 
      name: 'IHE XDS',
      status: 'planned',
      description: 'Cross-Enterprise Document Sharing',
      resources: []
    }
  ];
  
  const handleExportData = () => {
    toast({
      title: "Export Initiated",
      description: "Your health data is being prepared for export in FHIR format",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="mr-2 h-5 w-5 text-primary" /> 
          Interoperability
        </CardTitle>
        <CardDescription>
          Standards-based health data exchange capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedStandards.map((standard, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium">{standard.name}</h3>
                  {standard.status === 'supported' && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <Check className="h-3 w-3 mr-1" /> Supported
                    </Badge>
                  )}
                  {standard.status === 'partial' && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Partial
                    </Badge>
                  )}
                  {standard.status === 'planned' && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Planned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{standard.description}</p>
                {standard.resources.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium">Supported resources:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {standard.resources.map((resource, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{resource}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleExportData}>
          <FileText className="h-4 w-4 mr-2" />
          Export My Data (FHIR)
        </Button>
        <Button variant="ghost" size="sm" onClick={() => 
          toast({
            title: "Feature in Development",
            description: "Import from external system feature coming soon",
          })
        }>
          Import External Records
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InteroperabilityStandards;
