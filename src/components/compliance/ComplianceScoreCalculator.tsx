
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, RefreshCcw } from 'lucide-react';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';

interface ComplianceScoreCalculatorProps {
  className?: string;
  onScoreCalculated?: (score: number) => void;
}

const ComplianceScoreCalculator: React.FC<ComplianceScoreCalculatorProps> = ({ 
  className,
  onScoreCalculated 
}) => {
  const [privacyScore, setPrivacyScore] = useState(90);
  const [securityScore, setSecurityScore] = useState(85);
  const [adminScore, setAdminScore] = useState(75);
  const [physicalScore, setPhysicalScore] = useState(80);
  const [breachScore, setBreachScore] = useState(95);
  
  // Compliance score is weighted average
  const calculateComplianceScore = () => {
    const weights = {
      privacy: 0.25,
      security: 0.30,
      admin: 0.20,
      physical: 0.15,
      breach: 0.10
    };
    
    const weightedScore = Math.round(
      privacyScore * weights.privacy +
      securityScore * weights.security +
      adminScore * weights.admin +
      physicalScore * weights.physical +
      breachScore * weights.breach
    );
    
    if (onScoreCalculated) {
      onScoreCalculated(weightedScore);
    }
    
    return weightedScore;
  };
  
  const resetScores = () => {
    setPrivacyScore(90);
    setSecurityScore(85);
    setAdminScore(75);
    setPhysicalScore(80);
    setBreachScore(95);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Compliance Score Calculator
        </CardTitle>
        <CardDescription>
          Adjust the sliders to see how changes affect your overall compliance score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Privacy Rule</span>
              <span className="text-sm font-semibold">{privacyScore}%</span>
            </div>
            <Slider
              value={[privacyScore]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setPrivacyScore(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Security Rule</span>
              <span className="text-sm font-semibold">{securityScore}%</span>
            </div>
            <Slider
              value={[securityScore]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setSecurityScore(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Administrative Safeguards</span>
              <span className="text-sm font-semibold">{adminScore}%</span>
            </div>
            <Slider
              value={[adminScore]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setAdminScore(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Physical Safeguards</span>
              <span className="text-sm font-semibold">{physicalScore}%</span>
            </div>
            <Slider
              value={[physicalScore]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setPhysicalScore(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Breach Notification</span>
              <span className="text-sm font-semibold">{breachScore}%</span>
            </div>
            <Slider
              value={[breachScore]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setBreachScore(value[0])}
            />
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <ComplianceProgressIndicator score={calculateComplianceScore()} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={resetScores}>
          <RefreshCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button size="sm">Calculate Impact</Button>
      </CardFooter>
    </Card>
  );
};

export default ComplianceScoreCalculator;
