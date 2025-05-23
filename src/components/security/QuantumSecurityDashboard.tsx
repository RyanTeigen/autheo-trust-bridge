
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Cpu, 
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react';
import { SecurityIndicator, evaluateQuantumSecurity } from '@/utils/quantumCrypto';

interface QuantumSecurityDashboardProps {
  className?: string;
}

// Sample encryption data for demonstration
const sampleEncryptionData = [
  {
    id: '1',
    patientId: 'PAT001',
    dataType: 'Medical Records',
    algorithm: 'CRYSTALS-Kyber',
    securityLevel: 5,
    quantumResistant: true,
    encrypted: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    patientId: 'PAT002', 
    dataType: 'Lab Results',
    algorithm: 'CRYSTALS-Dilithium',
    securityLevel: 3,
    quantumResistant: true,
    encrypted: true,
    lastUpdated: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: '3',
    patientId: 'PAT003',
    dataType: 'Imaging Data',
    algorithm: 'RSA-2048',
    securityLevel: 1,
    quantumResistant: false,
    encrypted: true,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60000).toISOString()
  }
];

const QuantumSecurityDashboard: React.FC<QuantumSecurityDashboardProps> = ({ className }) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityIndicator[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [quantumThreatLevel, setQuantumThreatLevel] = useState<'low' | 'medium' | 'high'>('low');
  
  useEffect(() => {
    // Evaluate security for all encrypted data
    const metrics = sampleEncryptionData.map(data => 
      evaluateQuantumSecurity({
        algorithm: data.algorithm,
        securityLevel: data.securityLevel,
        quantumResistant: data.quantumResistant
      })
    );
    
    setSecurityMetrics(metrics);
    
    // Calculate overall security score
    const avgScore = metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;
    setOverallScore(avgScore);
    
    // Determine quantum threat level
    const quantumSafeCount = metrics.filter(m => m.level === 'quantum-safe').length;
    const totalCount = metrics.length;
    const safePercentage = (quantumSafeCount / totalCount) * 100;
    
    if (safePercentage >= 80) {
      setQuantumThreatLevel('low');
    } else if (safePercentage >= 50) {
      setQuantumThreatLevel('medium');
    } else {
      setQuantumThreatLevel('high');
    }
  }, []);
  
  const scanQuantumVulnerabilities = () => {
    setIsScanning(true);
    
    // Simulate vulnerability scan
    setTimeout(() => {
      setIsScanning(false);
      // Update metrics after scan
      const updatedMetrics = securityMetrics.map(metric => ({
        ...metric,
        score: Math.min(100, metric.score + Math.floor(Math.random() * 5))
      }));
      setSecurityMetrics(updatedMetrics);
    }, 3000);
  };
  
  const getSecurityLevelColor = (level: SecurityIndicator['level']) => {
    switch (level) {
      case 'quantum-safe': return 'bg-green-100 text-green-800';
      case 'post-quantum': return 'bg-blue-100 text-blue-800';
      case 'hybrid': return 'bg-amber-100 text-amber-800';
      case 'legacy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Zap className="mr-2 h-5 w-5 text-purple-600" />
              Quantum Security Dashboard
            </CardTitle>
            <CardDescription>
              Post-quantum cryptography monitoring and threat assessment
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${quantumThreatLevel === 'low' ? 'bg-green-100 text-green-800' : 
                         quantumThreatLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 
                         'bg-red-100 text-red-800'}`}
            >
              Threat Level: {quantumThreatLevel.toUpperCase()}
            </Badge>
            <Button 
              onClick={scanQuantumVulnerabilities} 
              disabled={isScanning}
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Security Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-purple-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantum Security Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                      {Math.round(overallScore)}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={overallScore} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantum-Safe Data</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {securityMetrics.filter(m => m.level === 'quantum-safe').length}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Legacy Systems</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {securityMetrics.filter(m => m.level === 'legacy').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quantum Threat Alert */}
          {quantumThreatLevel === 'high' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High Quantum Threat Detected</AlertTitle>
              <AlertDescription>
                Multiple systems are vulnerable to quantum attacks. Immediate upgrade to post-quantum cryptography recommended.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Encryption Status Table */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Encryption Status by Data Type
            </h4>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Algorithm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Security Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleEncryptionData.map((data, index) => {
                    const metric = securityMetrics[index];
                    if (!metric) return null;
                    
                    return (
                      <tr key={data.id}>
                        <td className="px-4 py-4 font-medium">{data.dataType}</td>
                        <td className="px-4 py-4 font-mono text-sm">{data.algorithm}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Cpu className="h-4 w-4 mr-1 text-muted-foreground" />
                            Level {data.securityLevel}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-bold ${getScoreColor(metric.score)}`}>
                            {metric.score}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline" 
                            className={getSecurityLevelColor(metric.level)}
                          >
                            {metric.level === 'quantum-safe' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {metric.level === 'legacy' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {metric.level.replace('-', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Security Recommendations */}
          <div className="space-y-2">
            <h4 className="text-lg font-medium flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Security Recommendations
            </h4>
            
            <div className="space-y-2">
              {securityMetrics.flatMap(metric => metric.recommendations).slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                  <Key className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumSecurityDashboard;
