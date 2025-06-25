import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ComplianceTrendChart from '@/components/compliance/ComplianceTrendChart';
import ComplianceRadarChart from '@/components/compliance/ComplianceRadarChart';
import ComplianceScoreCalculator from '@/components/compliance/ComplianceScoreCalculator';
import ComplianceRecommendations from '@/components/compliance/ComplianceRecommendations';
import ZeroKnowledgeVerification from '@/components/compliance/ZeroKnowledgeVerification';
import ComplianceAlerts from '@/components/compliance/ComplianceAlerts';
import RealTimeComplianceMonitor from '@/components/compliance/RealTimeComplianceMonitor';
import RiskAssessmentEngine from '@/components/compliance/risk-assessment/RiskAssessmentEngine';
import BlockchainAuditTrail from '@/components/compliance/audit-trail/BlockchainAuditTrail';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';

const CompliancePage = () => {
  const { toast } = useToast();
  const [complianceScore, setComplianceScore] = useState(92);
  const [showMobileView, setShowMobileView] = useState(false);
  const { profile } = useAuth();
  
  // Check if user has compliance role
  const hasComplianceRole = profile?.roles?.includes('compliance') || profile?.roles?.includes('admin');
  
  // Sample trend data for the compliance trend chart
  const trendData = [
    { date: 'Jan', overall: 84, privacyRule: 90, securityRule: 80, breachNotification: 95, administrative: 75, physical: 70 },
    { date: 'Feb', overall: 86, privacyRule: 92, securityRule: 82, breachNotification: 95, administrative: 78, physical: 74 },
    { date: 'Mar', overall: 88, privacyRule: 94, securityRule: 86, breachNotification: 98, administrative: 80, physical: 75 },
    { date: 'Apr', overall: 90, privacyRule: 96, securityRule: 90, breachNotification: 100, administrative: 80, physical: 75 },
    { date: 'May', overall: 92, privacyRule: 100, securityRule: 94, breachNotification: 100, administrative: 83, physical: 78 },
  ];
  
  // Sample data for the radar chart with previous scores
  const radarData = [
    { subject: 'Privacy', score: 100, fullMark: 100, previousScore: 95 },
    { subject: 'Security', score: 94, fullMark: 100, previousScore: 88 },
    { subject: 'Breach', score: 100, fullMark: 100, previousScore: 100 },
    { subject: 'Admin', score: 83, fullMark: 100, previousScore: 75 },
    { subject: 'Physical', score: 78, fullMark: 100, previousScore: 70 },
  ];
  
  // Desktop/mobile responsive detection
  useEffect(() => {
    const checkForMobile = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);
  
  const runAudit = () => {
    toast({
      title: "Audit In Progress",
      description: "Running comprehensive compliance audit. This may take a few minutes.",
    });
  };
  
  const handleScoreCalculated = (score: number) => {
    setComplianceScore(score);
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-100">HIPAA Compliance</h1>
            <p className="text-slate-300">
              Real-time compliance monitoring and audit controls
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowMobileView(!showMobileView)}
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
            >
              {showMobileView ? "Desktop View" : "Mobile View"}
            </Button>
            <Button 
              onClick={runAudit}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              Run Audit
            </Button>
          </div>
        </div>

        {!hasComplianceRole && (
          <Alert className="mb-4 bg-amber-900/20 border-amber-500/30 text-amber-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              You are accessing this page with creator privileges. Normally, this page is restricted to users with compliance or admin roles.
            </AlertDescription>
          </Alert>
        )}

        {/* Audit Logs Table - New primary component for compliance monitoring */}
        <div className="mb-6">
          <AuditLogTable />
        </div>

        {/* Quantum Security Dashboard - New primary security component */}
        <div className="mb-6">
          <QuantumSecurityDashboard />
        </div>
        
        {/* Real-Time Compliance Monitor - Primary component for live monitoring */}
        <RealTimeComplianceMonitor className="mb-6" />
        
        {/* AI Risk Assessment Engine - For risk analysis */}
        <RiskAssessmentEngine className="mb-6" />
        
        {/* Blockchain Audit Trail - For immutable audit records */}
        <BlockchainAuditTrail className="mb-6" />

        {!showMobileView ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ComplianceTrendChart data={trendData} />
              <ComplianceRadarChart data={radarData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ComplianceScoreCalculator 
                className="lg:col-span-1"
                onScoreCalculated={handleScoreCalculated}
              />
              
              <Card className="lg:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-autheo-primary">Compliance Actions</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${complianceScore >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
                    >
                      {complianceScore}% Compliant
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-100">Update risk assessment</p>
                          <p className="text-sm text-slate-400">Annual security risk assessment needs update</p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                      >
                        Start
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-100">Security awareness training</p>
                          <p className="text-sm text-slate-400">12 staff members need to complete training</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
                      >
                        Send Reminder
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-autheo-secondary mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-100">Quarterly Technical Audit</p>
                          <p className="text-sm text-slate-400">Scheduled for June 15, 2025</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
                      >
                        View Details
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-100">BAA agreements</p>
                          <p className="text-sm text-slate-400">All business associate agreements are current</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <ComplianceRecommendations />
              </div>
              <div className="lg:col-span-1">
                <ZeroKnowledgeVerification />
              </div>
            </div>
          </>
        ) : (
          // Mobile-optimized view with dark theme
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 text-slate-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-autheo-primary">Compliance Score</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${complianceScore >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
                  >
                    {complianceScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-slate-300">Privacy: 100%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-amber-500 rounded-full mr-1"></div>
                      <span className="text-slate-300">Admin: 83%</span>
                    </div>
                  </div>
                  
                  <Alert className="py-2 text-sm bg-amber-900/20 border-amber-500/30">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <AlertDescription className="text-amber-200">2 items need attention</AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <ComplianceAlerts />
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900" 
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Compliance Review
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700" 
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Compliance Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompliancePage;
