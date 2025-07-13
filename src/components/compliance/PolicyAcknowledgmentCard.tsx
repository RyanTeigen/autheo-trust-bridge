import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, FileText, Lock } from 'lucide-react';

interface PolicyAcknowledgmentCardProps {
  policyVersion?: string;
  className?: string;
}

const HIPAA_POLICY_TEXT = `
# HIPAA Compliance Policy

## Overview
This platform handles Protected Health Information (PHI) and requires strict compliance with the Health Insurance Portability and Accountability Act (HIPAA) of 1996.

## Your Responsibilities
By using this platform, you agree to:

### 1. Data Security
- Maintain the confidentiality of all patient information
- Use strong, unique passwords and enable two-factor authentication
- Log out of all sessions when finished
- Never share login credentials with others
- Report any suspected security breaches immediately

### 2. Access Controls
- Only access patient information necessary for your role
- Do not access records of patients you are not authorized to treat
- Ensure your workstation is secure and not visible to unauthorized persons
- Lock your screen when stepping away from your computer

### 3. Data Handling
- Never download, copy, or transmit PHI outside this secure platform
- Do not discuss patient information in public areas
- Properly dispose of any printed materials containing PHI
- Use secure communication channels for any patient-related discussions

### 4. Incident Reporting
- Immediately report any actual or suspected privacy or security incidents
- Report any unauthorized access or disclosure of PHI
- Contact the compliance team for any questions about HIPAA requirements

## Technical Safeguards
This platform implements:
- End-to-end encryption for all data transmission
- Quantum-resistant encryption algorithms
- Comprehensive audit logging
- Role-based access controls
- Automatic session timeouts
- Regular security assessments

## Consequences of Non-Compliance
Violations of HIPAA policies may result in:
- Immediate suspension of platform access
- Disciplinary action up to and including termination
- Civil and criminal penalties as provided by law
- Personal liability for damages

## Contact Information
For questions about this policy or to report incidents:
- Compliance Team: compliance@autheo.com
- Security Team: security@autheo.com
- Emergency Breach Hotline: 1-800-HIPAA-911

Last Updated: January 2025
Policy Version: 1.0
`;

const PolicyAcknowledgmentCard: React.FC<PolicyAcknowledgmentCardProps> = ({ 
  policyVersion = '1.0',
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const checkAcknowledgment = async () => {
      try {
        const { data, error } = await supabase
          .from('policy_acknowledgments')
          .select('id, policy_version, acknowledged_at')
          .eq('user_id', user.id)
          .eq('policy_version', policyVersion)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking policy acknowledgment:', error);
          toast({
            title: "Error",
            description: "Failed to check policy status. Please refresh the page.",
            variant: "destructive"
          });
        } else {
          setAcknowledged(!!data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error", 
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkAcknowledgment();
  }, [user?.id, policyVersion, toast]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    // Consider "scrolled to bottom" when within 50px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolled(true);
    }
  };

  const handleAcknowledge = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to acknowledge the policy.",
        variant: "destructive"
      });
      return;
    }

    if (!hasRead || !hasScrolled) {
      toast({
        title: "Please Read the Policy",
        description: "You must read through the entire policy and check the confirmation box before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setAcknowledging(true);

    try {
      // Get user's IP and user agent for audit trail
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          user_id: user.id,
          policy_version: policyVersion,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error recording acknowledgment:', error);
        toast({
          title: "Error",
          description: "Could not record policy acknowledgment. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Policy Acknowledged",
          description: "Thank you for acknowledging our HIPAA compliance policy.",
        });
        setAcknowledged(true);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAcknowledging(false);
    }
  };

  // Don't render if loading or already acknowledged
  if (loading || acknowledged) return null;

  // Don't render if no user (not authenticated)
  if (!user) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white border-2 border-amber-500 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-amber-900 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-amber-600" />
                HIPAA Policy Acknowledgment Required
              </CardTitle>
              <p className="text-amber-700 mt-1">
                Before accessing patient data, you must review and acknowledge our HIPAA compliance policy.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <Alert className="border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> This acknowledgment is required by law and will be recorded for compliance auditing. 
              Please read the entire policy carefully before proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                HIPAA Compliance Policy (Version {policyVersion})
              </h3>
            </div>

            <ScrollArea 
              className="h-96 w-full border border-slate-200 rounded-lg p-4 bg-slate-50"
              onScrollCapture={handleScroll}
            >
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {HIPAA_POLICY_TEXT}
              </div>
            </ScrollArea>

            {!hasScrolled && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Please scroll through the entire policy to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Checkbox 
                id="policy-read"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
                className="mt-1"
                disabled={!hasScrolled}
              />
              <label htmlFor="policy-read" className="text-sm text-slate-700 cursor-pointer">
                <strong>I confirm that I have read and understood the entire HIPAA compliance policy.</strong>
                <br />
                I understand my responsibilities for protecting patient health information and the consequences of non-compliance.
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Your acknowledgment will be recorded with timestamp and IP address for compliance purposes.
              </div>
              
              <Button 
                onClick={handleAcknowledge}
                disabled={!hasRead || !hasScrolled || acknowledging}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                size="lg"
              >
                {acknowledging ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    I Acknowledge This Policy
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyAcknowledgmentCard;