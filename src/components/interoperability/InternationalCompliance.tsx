import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Globe, Shield, CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react';

interface ComplianceFramework {
  id: string;
  name: string;
  region: string;
  description: string;
  status: 'compliant' | 'partial' | 'pending' | 'not-compliant';
  compliance_percentage: number;
  last_updated: string;
  requirements: {
    id: string;
    requirement: string;
    status: 'met' | 'partial' | 'not-met';
    evidence?: string;
  }[];
}

const InternationalCompliance: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>('gdpr');

  const complianceFrameworks: ComplianceFramework[] = [
    {
      id: 'gdpr',
      name: 'GDPR (General Data Protection Regulation)',
      region: 'European Union',
      description: 'EU regulation on data protection and privacy for individuals within the EU and EEA',
      status: 'partial',
      compliance_percentage: 85,
      last_updated: '2024-01-15',
      requirements: [
        {
          id: 'lawful-basis',
          requirement: 'Lawful basis for processing personal data',
          status: 'met',
          evidence: 'Consent management system implemented'
        },
        {
          id: 'data-minimization',
          requirement: 'Data minimization principle',
          status: 'met',
          evidence: 'Atomic data points with purpose limitation'
        },
        {
          id: 'right-to-be-forgotten',
          requirement: 'Right to erasure (right to be forgotten)',
          status: 'partial',
          evidence: 'Partial implementation in user accounts'
        },
        {
          id: 'data-portability',
          requirement: 'Data portability rights',
          status: 'met',
          evidence: 'FHIR export functionality available'
        },
        {
          id: 'privacy-by-design',
          requirement: 'Privacy by design and default',
          status: 'partial',
          evidence: 'Some privacy controls implemented'
        }
      ]
    },
    {
      id: 'pipeda',
      name: 'PIPEDA (Personal Information Protection and Electronic Documents Act)',
      region: 'Canada',
      description: 'Canadian federal privacy law for private sector organizations',
      status: 'partial',
      compliance_percentage: 78,
      last_updated: '2024-01-10',
      requirements: [
        {
          id: 'consent',
          requirement: 'Meaningful consent for collection and use',
          status: 'met',
          evidence: 'Granular consent management'
        },
        {
          id: 'purpose-limitation',
          requirement: 'Collection and use limited to stated purposes',
          status: 'met',
          evidence: 'Purpose tracking in data collection'
        },
        {
          id: 'retention-limits',
          requirement: 'Retention only as long as necessary',
          status: 'partial',
          evidence: 'Some retention policies implemented'
        },
        {
          id: 'accuracy',
          requirement: 'Information must be accurate and complete',
          status: 'met',
          evidence: 'Data validation and correction workflows'
        }
      ]
    },
    {
      id: 'lei-brasil',
      name: 'Lei Geral de Proteção de Dados (LGPD)',
      region: 'Brazil',
      description: 'Brazilian data protection law similar to GDPR',
      status: 'pending',
      compliance_percentage: 45,
      last_updated: '2024-01-05',
      requirements: [
        {
          id: 'legal-basis',
          requirement: 'Legal basis for data processing',
          status: 'partial',
          evidence: 'Consent framework partially implemented'
        },
        {
          id: 'data-protection-officer',
          requirement: 'Data Protection Officer appointment',
          status: 'not-met'
        },
        {
          id: 'impact-assessment',
          requirement: 'Data Protection Impact Assessment',
          status: 'not-met'
        },
        {
          id: 'cross-border-transfer',
          requirement: 'Cross-border data transfer protections',
          status: 'partial',
          evidence: 'Basic encryption for international transfers'
        }
      ]
    },
    {
      id: 'pdpa-singapore',
      name: 'Personal Data Protection Act (PDPA)',
      region: 'Singapore',
      description: 'Singapore\'s data protection law for organizations',
      status: 'partial',
      compliance_percentage: 70,
      last_updated: '2024-01-08',
      requirements: [
        {
          id: 'notification-obligation',
          requirement: 'Notification of data collection purposes',
          status: 'met',
          evidence: 'Privacy notices implemented'
        },
        {
          id: 'consent-requirement',
          requirement: 'Consent for collection, use, disclosure',
          status: 'met',
          evidence: 'Consent management system'
        },
        {
          id: 'data-breach-notification',
          requirement: 'Data breach notification requirements',
          status: 'partial',
          evidence: 'Breach detection system implemented'
        },
        {
          id: 'do-not-call',
          requirement: 'Do Not Call Registry compliance',
          status: 'not-met'
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not-compliant':
      case 'not-met':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met':
        return <CheckCircle className="h-4 w-4" />;
      case 'partial':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'not-compliant':
      case 'not-met':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const selectedFrameworkData = complianceFrameworks.find(f => f.id === selectedFramework);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            International Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {complianceFrameworks.map((framework) => (
                <TabsTrigger key={framework.id} value={framework.id} className="text-xs">
                  {framework.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {complianceFrameworks.map((framework) => (
              <TabsContent key={framework.id} value={framework.id} className="mt-6">
                <div className="space-y-6">
                  {/* Framework Overview */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{framework.name}</h3>
                            <p className="text-sm text-muted-foreground">{framework.region}</p>
                            <p className="text-sm mt-2">{framework.description}</p>
                          </div>
                          <Badge className={getStatusColor(framework.status)}>
                            {getStatusIcon(framework.status)}
                            <span className="ml-1 capitalize">{framework.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Compliance Progress</span>
                            <span>{framework.compliance_percentage}%</span>
                          </div>
                          <Progress value={framework.compliance_percentage} className="h-2" />
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Last updated: {new Date(framework.last_updated).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements Checklist */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compliance Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {framework.requirements.map((req) => (
                          <div key={req.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={getStatusColor(req.status)}>
                                    {getStatusIcon(req.status)}
                                    <span className="ml-1 capitalize">{req.status.replace('-', ' ')}</span>
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm">{req.requirement}</h4>
                                {req.evidence && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Evidence: {req.evidence}
                                  </p>
                                )}
                              </div>
                              {req.evidence && (
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-medium">Generate Compliance Report</span>
              <span className="text-xs text-muted-foreground">
                Export current compliance status
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Shield className="h-6 w-6 mb-2" />
              <span className="font-medium">Risk Assessment</span>
              <span className="text-xs text-muted-foreground">
                Analyze compliance gaps
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Clock className="h-6 w-6 mb-2" />
              <span className="font-medium">Schedule Review</span>
              <span className="text-xs text-muted-foreground">
                Set compliance review dates
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternationalCompliance;