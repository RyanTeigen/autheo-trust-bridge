
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const CompliancePage = () => {
  const { toast } = useToast();
  
  const runAudit = () => {
    toast({
      title: "Audit In Progress",
      description: "Running comprehensive compliance audit. This may take a few minutes.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">HIPAA Compliance</h1>
          <p className="text-muted-foreground">
            Real-time compliance monitoring and audit controls
          </p>
        </div>
        <Button onClick={runAudit}>
          Run Audit
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Overall Compliance</CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              92% Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                2 items need attention to ensure full HIPAA compliance.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Rule</TabsTrigger>
                <TabsTrigger value="security">Security Rule</TabsTrigger>
                <TabsTrigger value="breach">Breach Notification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-4 border rounded-md mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Rule Compliance</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Privacy Rule</span>
                            <span className="text-sm font-medium">100%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Security Rule</span>
                            <span className="text-sm font-medium">94%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Breach Notification</span>
                            <span className="text-sm font-medium">100%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Administrative</span>
                            <span className="text-sm font-medium">83%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '83%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Physical Safeguards</span>
                            <span className="text-sm font-medium">78%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Critical Tasks</h3>
                      <div className="space-y-3 border rounded p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Update risk assessment</p>
                            <p className="text-sm text-muted-foreground">Annual security risk assessment needs update</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Security awareness training</p>
                            <p className="text-sm text-muted-foreground">12 staff members need to complete training</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">BAA agreements</p>
                            <p className="text-sm text-muted-foreground">All business associate agreements are current</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Access controls</p>
                            <p className="text-sm text-muted-foreground">User access rights are properly configured</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Audit History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">Quarterly Technical Audit</p>
                            <p className="text-xs text-muted-foreground">May 2, 2024</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">95% Compliant</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">Annual Comprehensive Audit</p>
                            <p className="text-xs text-muted-foreground">Jan 15, 2024</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">92% Compliant</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Remediation Follow-up</p>
                            <p className="text-xs text-muted-foreground">Dec 3, 2023</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800">87% Compliant</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="privacy" className="p-4 border rounded-md mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Privacy Rule Requirements</h3>
                    <Badge className="bg-green-100 text-green-800">100% Compliant</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Notice of Privacy Practices</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current notice distributed to all patients and acknowledgments are tracked.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Minimum Necessary Standard</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Systems enforce minimum necessary data access for all roles.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Patient Access Rights</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Smart Wallet provides full patient access control and export capabilities.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Amendment Rights</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Processes in place for patients to request record amendments.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="p-4 border rounded-md mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Security Rule Requirements</h3>
                    <Badge className="bg-green-100 text-green-800">94% Compliant</Badge>
                  </div>
                  
                  <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      Security risk assessment needs to be updated to maintain compliance.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Access Controls</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Role-based access controls implemented for all systems.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Encryption</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quantum-resistant encryption for data at rest and in transit.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-start mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <h4 className="font-medium">Security Risk Assessment</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Annual risk assessment due for update in 14 days.
                      </p>
                      <div className="mt-2">
                        <Progress value={80} className="h-2" indicatorClassName="bg-amber-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-start mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <h4 className="font-medium">Security Training</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        12 staff members need to complete security awareness training.
                      </p>
                      <div className="mt-2">
                        <Progress value={85} className="h-2" indicatorClassName="bg-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="breach" className="p-4 border rounded-md mt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Breach Notification Rule</h3>
                    <Badge className="bg-green-100 text-green-800">100% Compliant</Badge>
                  </div>
                  
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Fully Compliant</AlertTitle>
                    <AlertDescription>
                      All breach notification processes and monitoring systems are in place.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Breach Detection</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered detection systems monitor for unusual access patterns.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Notification Procedures</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automated notification workflows for patients, HHS, and media.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Breach Documentation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive audit logs maintained for all potential incidents.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium">Risk Assessment</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Process in place for breach risk assessment and determination.
                      </p>
                      <div className="mt-2">
                        <Progress value={100} className="h-2" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompliancePage;
