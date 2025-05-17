
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, RefreshCcw, Lightbulb } from 'lucide-react';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ComplianceScoreCalculatorProps {
  className?: string;
  onScoreCalculated?: (score: number) => void;
}

const ComplianceScoreCalculator: React.FC<ComplianceScoreCalculatorProps> = ({ 
  className,
  onScoreCalculated 
}) => {
  const { toast } = useToast();
  const [privacyScore, setPrivacyScore] = useState(90);
  const [securityScore, setSecurityScore] = useState(85);
  const [adminScore, setAdminScore] = useState(75);
  const [physicalScore, setPhysicalScore] = useState(80);
  const [breachScore, setBreachScore] = useState(95);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);
  
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
    
    return weightedScore;
  };
  
  // Use effect to calculate the score when inputs change
  useEffect(() => {
    const newScore = calculateComplianceScore();
    setCalculatedScore(newScore);
    
    // Only notify parent component if callback exists
    if (onScoreCalculated) {
      onScoreCalculated(newScore);
    }
  }, [privacyScore, securityScore, adminScore, physicalScore, breachScore, onScoreCalculated]);
  
  const resetScores = () => {
    setPrivacyScore(90);
    setSecurityScore(85);
    setAdminScore(75);
    setPhysicalScore(80);
    setBreachScore(95);
    setRecommendations([]);
    setShowRecommendations(false);
  };
  
  const generateRecommendations = () => {
    const newRecommendations: string[] = [];
    
    // Intelligent recommendations based on score values
    if (adminScore < 80) {
      newRecommendations.push("Schedule administrative safeguard training with staff to improve documentation compliance.");
    }
    
    if (physicalScore < 85) {
      newRecommendations.push("Conduct a physical security audit to identify facility vulnerabilities.");
    }
    
    if (securityScore < 90) {
      newRecommendations.push("Implement multi-factor authentication across all systems containing PHI.");
    }
    
    if (privacyScore < 95) {
      newRecommendations.push("Review Notice of Privacy Practices for potential updates based on recent regulatory changes.");
    }
    
    if (newRecommendations.length > 0) {
      setRecommendations(newRecommendations);
      setShowRecommendations(true);
      
      toast({
        title: "Recommendations Generated",
        description: `${newRecommendations.length} improvement suggestions available`,
      });
    }
  };
  
  // Handle button click to generate recommendations
  const handleGenerateRecommendations = () => {
    generateRecommendations();
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
        
        {showRecommendations && recommendations.length > 0 && (
          <div className="mt-4 space-y-2 bg-muted p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium">
              <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
              AI-Generated Recommendations
            </div>
            <ul className="space-y-1 pl-6 list-disc text-sm">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <ComplianceProgressIndicator score={calculatedScore} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={resetScores}>
          <RefreshCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        <Button 
          size="sm" 
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          {showRecommendations ? "Hide Recommendations" : "Show Recommendations"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComplianceScoreCalculator;
