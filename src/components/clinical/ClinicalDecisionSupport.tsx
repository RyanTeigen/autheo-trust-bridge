import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Pill, 
  Activity, 
  Users,
  Clock,
  Shield,
  Info,
  Zap
} from 'lucide-react';

const ClinicalDecisionSupport = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  const aiRecommendations = [
    {
      id: '1',
      type: 'drug_interaction',
      severity: 'high',
      title: 'Potential Drug Interaction Detected',
      description: 'Warfarin and Aspirin combination may increase bleeding risk',
      confidence: 94,
      evidence: 'Based on 847 similar cases and clinical guidelines',
      actions: [
        'Consider alternative anticoagulation therapy',
        'Monitor INR levels more frequently',
        'Reduce aspirin dosage to 81mg'
      ],
      references: ['NEJM 2023', 'Cardiology Guidelines 2024']
    },
    {
      id: '2',
      type: 'diagnosis_support',
      severity: 'medium',
      title: 'Consider Differential Diagnosis',
      description: 'Patient symptoms suggest possible thyroid dysfunction',
      confidence: 78,
      evidence: 'Clinical presentation matches 73% of similar cases',
      actions: [
        'Order TSH and T4 levels',
        'Consider thyroid antibodies',
        'Schedule endocrinology consult if abnormal'
      ],
      references: ['Endocrine Society Guidelines', 'Mayo Clinic Proceedings']
    },
    {
      id: '3',
      type: 'treatment_optimization',
      severity: 'low',
      title: 'Treatment Optimization Opportunity',
      description: 'Current diabetes management could be enhanced',
      confidence: 85,
      evidence: 'Patient metrics indicate suboptimal control',
      actions: [
        'Consider adding SGLT2 inhibitor',
        'Increase metformin to maximum tolerated dose',
        'Schedule diabetes educator consultation'
      ],
      references: ['ADA Standards of Care 2024', 'Diabetes Care Journal']
    }
  ];

  const clinicalAlerts = [
    {
      type: 'critical',
      message: 'Patient has documented allergy to penicillin',
      timestamp: '2 minutes ago'
    },
    {
      type: 'warning',
      message: 'Lab values indicate possible kidney dysfunction',
      timestamp: '15 minutes ago'
    },
    {
      type: 'info',
      message: 'Vaccination due: Annual flu shot',
      timestamp: '1 hour ago'
    }
  ];

  const evidenceBasedInsights = [
    {
      category: 'Prevention',
      title: 'Cardiovascular Risk Assessment',
      recommendation: 'Consider ASCVD risk calculator for this patient profile',
      evidence: 'Strong evidence from multiple RCTs',
      implementation: 'Calculate 10-year risk score'
    },
    {
      category: 'Screening',
      title: 'Cancer Screening Due',
      recommendation: 'Mammography screening recommended',
      evidence: 'USPSTF Grade A recommendation',
      implementation: 'Schedule screening within 6 months'
    },
    {
      category: 'Medication',
      title: 'Statin Therapy Consideration',
      recommendation: 'Consider statin initiation based on risk factors',
      evidence: 'Meta-analysis of 26 trials (n=170,000)',
      implementation: 'Discuss benefits and risks with patient'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinical Decision Support</h2>
          <p className="text-muted-foreground">
            AI-powered insights and evidence-based recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <Brain className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            HIPAA Compliant
          </Badge>
        </div>
      </div>

      {/* Quick Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Clinical Alerts
          </CardTitle>
          <CardDescription>
            Immediate attention required for current patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clinicalAlerts.map((alert, index) => (
              <Alert key={index} className={alert.type === 'critical' ? 'border-red-200' : ''}>
                {getAlertIcon(alert.type)}
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </AlertTitle>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="evidence">Evidence-Based Insights</TabsTrigger>
          <TabsTrigger value="analytics">Clinical Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations List */}
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <Card 
                  key={rec.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedRecommendation === rec.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedRecommendation(rec.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getSeverityIcon(rec.severity)}
                        {rec.title}
                      </CardTitle>
                      <Badge variant={getSeverityColor(rec.severity)}>
                        {rec.severity}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {rec.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confidence Level</span>
                        <span className="font-medium">{rec.confidence}%</span>
                      </div>
                      <Progress value={rec.confidence} className="h-2" />
                      <p className="text-xs text-muted-foreground">{rec.evidence}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed View */}
            <div className="space-y-4">
              {selectedRecommendation ? (
                (() => {
                  const rec = aiRecommendations.find(r => r.id === selectedRecommendation);
                  return rec ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Recommended Actions
                        </CardTitle>
                        <CardDescription>
                          Clinical actions based on AI analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Immediate Actions</h4>
                            <ul className="space-y-1">
                              {rec.actions.map((action, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Evidence Base</h4>
                            <p className="text-sm text-muted-foreground">
                              {rec.evidence}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {rec.references.map((ref, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              Apply Recommendation
                            </Button>
                            <Button size="sm" variant="outline">
                              More Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })()
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a recommendation to view detailed analysis and actions</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {evidenceBasedInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{insight.category}</CardTitle>
                  <CardDescription>{insight.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{insight.recommendation}</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.evidence}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Implementation: {insight.implementation}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      View Evidence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recommendations Today</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  +15% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Validated by outcomes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3h</div>
                <p className="text-xs text-muted-foreground">
                  Per provider today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts Prevented</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Potential adverse events
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalDecisionSupport;