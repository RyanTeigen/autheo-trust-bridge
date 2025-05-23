
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  User, 
  Database, 
  FileText, 
  Activity, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  BarChart4
} from 'lucide-react';
import { RiskAssessment, UserBehaviorMetric } from '../monitoring/types';

// Sample data for risk assessments
const sampleRiskAssessments: RiskAssessment[] = [
  {
    riskScore: 78,
    category: 'User Access Control',
    severity: 'high',
    description: 'Unusual access patterns detected from administrative accounts outside normal business hours',
    recommendations: [
      'Review administrator access logs',
      'Implement time-based access restrictions',
      'Enable additional authentication factors for off-hours access'
    ],
    lastUpdated: new Date().toISOString(),
    trends: [
      { label: '7 days ago', previous: 65, current: 78 },
      { label: '14 days ago', previous: 58, current: 65 },
      { label: '30 days ago', previous: 42, current: 58 }
    ]
  },
  {
    riskScore: 45,
    category: 'Data Encryption',
    severity: 'medium',
    description: 'Some patient data transmissions using outdated encryption protocols',
    recommendations: [
      'Upgrade encryption standards to current HIPAA recommendations',
      'Implement automatic encryption protocol validation',
      'Conduct security training for development team'
    ],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trends: [
      { label: '7 days ago', previous: 52, current: 45 },
      { label: '14 days ago', previous: 60, current: 52 },
      { label: '30 days ago', previous: 65, current: 60 }
    ]
  },
  {
    riskScore: 22,
    category: 'Audit Logging',
    severity: 'low',
    description: 'Audit logs properly maintained with minor inconsistencies in detail level',
    recommendations: [
      'Standardize audit log detail levels across all systems',
      'Implement automated audit log review for anomalies'
    ],
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    trends: [
      { label: '7 days ago', previous: 28, current: 22 },
      { label: '14 days ago', previous: 35, current: 28 },
      { label: '30 days ago', previous: 30, current: 35 }
    ]
  }
];

// Sample user behavior data
const sampleUserBehaviors: UserBehaviorMetric[] = [
  {
    userId: 'u1',
    username: 'dr.smith',
    role: 'Physician',
    accessCount: 128,
    riskScore: 12,
    anomalyLevel: 0,
    lastActivity: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    userId: 'u2',
    username: 'admin.jones',
    role: 'Administrator',
    accessCount: 257,
    riskScore: 78,
    anomalyLevel: 3,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'u3',
    username: 'nurse.wilson',
    role: 'Nurse',
    accessCount: 92,
    riskScore: 8,
    anomalyLevel: 0,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    userId: 'u4',
    username: 'tech.roberts',
    role: 'IT Support',
    accessCount: 315,
    riskScore: 42,
    anomalyLevel: 1,
    lastActivity: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  }
];

interface RiskAssessmentEngineProps {
  className?: string;
}

const RiskAssessmentEngine: React.FC<RiskAssessmentEngineProps> = ({ className }) => {
  const [riskData, setRiskData] = useState<RiskAssessment[]>(sampleRiskAssessments);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorMetric[]>(sampleUserBehaviors);
  const [lastAnalysis, setLastAnalysis] = useState<Date>(new Date());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Calculate the overall risk score as a weighted average of all risk assessments
  const overallRiskScore = Math.round(
    riskData.reduce((sum, risk) => sum + risk.riskScore, 0) / riskData.length
  );
  
  // Get the severity color based on risk score
  const getSeverityColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getSeverityText = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-amber-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return '';
    }
  };
  
  const getSeverityBadge = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };
  
  // Function to run a new risk analysis
  const runRiskAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate an analysis that takes some time
    setTimeout(() => {
      // Slightly modify the risk scores to simulate a new analysis
      const updatedRiskData = riskData.map(risk => ({
        ...risk,
        riskScore: Math.max(0, Math.min(100, risk.riskScore + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8))),
        lastUpdated: new Date().toISOString()
      }));
      
      setRiskData(updatedRiskData);
      setLastAnalysis(new Date());
      setIsAnalyzing(false);
    }, 3000);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-600" />
              AI Risk Assessment Engine
            </CardTitle>
            <CardDescription>
              Machine learning analysis of user behavior patterns and compliance risks
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-800">
              Last Analysis: {lastAnalysis.toLocaleTimeString()}
            </Badge>
            <Button 
              size="sm" 
              onClick={runRiskAnalysis} 
              disabled={isAnalyzing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Overall Risk Score</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold">{overallRiskScore}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getSeverityColor(overallRiskScore)}`}
                  style={{ width: `${overallRiskScore}%` }}
                />
              </div>
              {overallRiskScore >= 60 && (
                <Alert variant="warning" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Elevated Risk Level</AlertTitle>
                  <AlertDescription>
                    Your organization's risk level requires immediate attention.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Risk Breakdown</h3>
              <div className="space-y-4">
                {riskData.map((risk, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{risk.category}</span>
                      <span className={`text-sm font-bold ${getSeverityText(risk.severity)}`}>
                        {risk.riskScore}
                      </span>
                    </div>
                    <Progress 
                      value={risk.riskScore} 
                      className="h-2" 
                      indicatorClassName={getSeverityColor(risk.riskScore)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="assessments">
            <TabsList>
              <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
              <TabsTrigger value="users">User Behavior</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assessments" className="border rounded-md p-4 mt-4">
              <div className="space-y-6">
                {riskData.map((risk, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{risk.category}</h4>
                      <Badge className={getSeverityBadge(risk.severity)}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{risk.description}</p>
                    
                    <div className="bg-slate-50 p-3 rounded-md mb-4">
                      <h5 className="text-sm font-medium mb-2">AI Recommendations:</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {risk.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Risk Score: {risk.riskScore}</span>
                      <span>Last Updated: {new Date(risk.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="border rounded-md p-4 mt-4">
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">User</th>
                        <th className="text-left py-2 px-4">Role</th>
                        <th className="text-left py-2 px-4">Access Events</th>
                        <th className="text-left py-2 px-4">Risk Score</th>
                        <th className="text-left py-2 px-4">Anomaly Level</th>
                        <th className="text-left py-2 px-4">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBehavior.map((user) => (
                        <tr key={user.userId} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{user.username}</td>
                          <td className="py-3 px-4">{user.role}</td>
                          <td className="py-3 px-4">{user.accessCount}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={user.riskScore} 
                                className="h-2 w-16" 
                                indicatorClassName={getSeverityColor(user.riskScore)}
                              />
                              <span>{user.riskScore}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {user.anomalyLevel === 0 ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Normal
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`
                                ${user.anomalyLevel >= 3 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.anomalyLevel >= 2 
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                                flex items-center gap-1
                              `}>
                                <AlertTriangle className="h-3 w-3" />
                                Level {user.anomalyLevel}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(user.lastActivity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <span className="text-sm text-muted-foreground">Powered by AI behavioral analytics and pattern recognition</span>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BarChart4 className="h-4 w-4" />
          View Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RiskAssessmentEngine;
