import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  resourceType?: string;
  profile?: string;
}

const FHIRResourceValidator: React.FC = () => {
  const [fhirResource, setFhirResource] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFHIRResource = async () => {
    setIsValidating(true);
    try {
      // Parse JSON first
      const resource = JSON.parse(fhirResource);
      
      // Basic FHIR R4 validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Required fields validation
      if (!resource.resourceType) {
        errors.push('Missing required field: resourceType');
      }

      if (!resource.id && resource.resourceType !== 'Bundle') {
        warnings.push('Resource ID is recommended for most resource types');
      }

      // Resource-specific validation
      if (resource.resourceType === 'Patient') {
        if (!resource.name || resource.name.length === 0) {
          errors.push('Patient must have at least one name');
        }
        if (!resource.gender) {
          warnings.push('Patient gender is recommended');
        }
      }

      if (resource.resourceType === 'Observation') {
        if (!resource.status) {
          errors.push('Observation must have a status');
        }
        if (!resource.code) {
          errors.push('Observation must have a code');
        }
        if (!resource.subject) {
          errors.push('Observation must reference a subject');
        }
      }

      // Meta validation
      if (resource.meta) {
        if (resource.meta.profile) {
          // Validate profile URLs
          resource.meta.profile.forEach((profile: string) => {
            if (!profile.startsWith('http://') && !profile.startsWith('https://')) {
              warnings.push(`Profile URL should be absolute: ${profile}`);
            }
          });
        }
      }

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings,
        resourceType: resource.resourceType,
        profile: resource.meta?.profile?.[0]
      });

      if (errors.length === 0) {
        toast.success('FHIR resource validation passed');
      } else {
        toast.error(`Validation failed with ${errors.length} error(s)`);
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      });
      toast.error('Invalid JSON format');
    } finally {
      setIsValidating(false);
    }
  };

  const sampleResources = {
    patient: `{
  "resourceType": "Patient",
  "id": "example",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR"
          }
        ]
      },
      "system": "urn:oid:1.2.36.146.595.217.0.1",
      "value": "12345"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": ["John"]
    }
  ],
  "gender": "male",
  "birthDate": "1990-01-01"
}`,
    observation: `{
  "resourceType": "Observation",
  "id": "example",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8867-4",
        "display": "Heart rate"
      }
    ]
  },
  "subject": {
    "reference": "Patient/example"
  },
  "effectiveDateTime": "2023-01-01T10:00:00Z",
  "valueQuantity": {
    "value": 72,
    "unit": "beats/min",
    "system": "http://unitsofmeasure.org",
    "code": "/min"
  }
}`
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            FHIR R4 Resource Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">FHIR Resource (JSON)</label>
            <Textarea
              placeholder="Paste your FHIR resource JSON here..."
              value={fhirResource}
              onChange={(e) => setFhirResource(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={validateFHIRResource} 
              disabled={!fhirResource || isValidating}
            >
              {isValidating ? 'Validating...' : 'Validate Resource'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFhirResource(sampleResources.patient)}
            >
              Load Patient Sample
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFhirResource(sampleResources.observation)}
            >
              Load Observation Sample
            </Button>
          </div>

          {validationResult && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationResult.resourceType && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Resource Type:</span>
                    <Badge variant="secondary">{validationResult.resourceType}</Badge>
                  </div>
                )}

                {validationResult.profile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Profile:</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResult.profile}
                    </Badge>
                  </div>
                )}

                {validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Errors ({validationResult.errors.length})
                    </h4>
                    <ul className="space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Warnings ({validationResult.warnings.length})
                    </h4>
                    <ul className="space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.valid && validationResult.errors.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Resource passes FHIR R4 validation
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FHIRResourceValidator;