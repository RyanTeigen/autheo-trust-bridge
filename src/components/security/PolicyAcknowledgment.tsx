import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { auditLogger } from '@/services/audit/AuditLogger';

interface PolicyAcknowledgmentProps {
  onAcknowledged?: () => void;
  required?: boolean;
}

const HIPAA_POLICY_VERSION = "2025.1";

const HIPAA_POLICY_TEXT = `
HIPAA Privacy and Security Notice

Effective Date: January 1, 2025
Version: ${HIPAA_POLICY_VERSION}

NOTICE OF PRIVACY PRACTICES

This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.

1. YOUR RIGHTS
You have the right to:
• Inspect and copy your medical record
• Request restrictions on uses and disclosures
• Request confidential communications
• Request amendments to your record
• Receive a paper copy of this notice
• File a complaint about privacy practices

2. OUR RESPONSIBILITIES
We are required to:
• Maintain the privacy of your health information
• Provide you with notice of our legal duties and privacy practices
• Follow the terms of the notice currently in effect
• Notify you if we are unable to agree to a requested restriction

3. PERMITTED USES AND DISCLOSURES
We may use and disclose your health information for:
• Treatment purposes
• Payment activities
• Healthcare operations
• As required by law

4. SECURITY MEASURES
We implement administrative, physical, and technical safeguards to protect your health information including:
• Access controls and user authentication
• Encryption of data in transit and at rest
• Regular security assessments and audits
• Employee training and confidentiality agreements

5. BREACH NOTIFICATION
In the event of a breach of unsecured protected health information, we will notify you within 60 days of discovery of the breach.

By acknowledging this policy, you confirm that you have read, understood, and agree to comply with these privacy and security practices.
`;

export const PolicyAcknowledgment: React.FC<PolicyAcknowledgmentProps> = ({
  onAcknowledged,
  required = false,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAcknowledge = async () => {
    if (!acknowledged) {
      toast({
        title: "Acknowledgment Required",
        description: "Please check the box to acknowledge that you have read and understood the HIPAA policy.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create digital signature (simplified - in production, use proper e-signature)
      const digitalSignature = btoa(`${user.email}-${Date.now()}-${HIPAA_POLICY_VERSION}`);

      const { error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          user_id: user.id,
          policy_type: 'HIPAA',
          policy_version: HIPAA_POLICY_VERSION,
          digital_signature: digitalSignature,
          ip_address: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent,
        });

      if (error) throw error;

      await auditLogger.logEvent({
        action: 'POLICY_ACKNOWLEDGED',
        resource: 'policy_acknowledgments',
        status: 'success',
        details: `User acknowledged HIPAA policy version ${HIPAA_POLICY_VERSION}`,
      });

      toast({
        title: "Policy Acknowledged",
        description: "Thank you for acknowledging the HIPAA privacy policy.",
      });

      onAcknowledged?.();
    } catch (error) {
      console.error('Error acknowledging policy:', error);
      toast({
        title: "Error",
        description: "Failed to record policy acknowledgment. Please try again.",
        variant: "destructive",
      });

      await auditLogger.logError(
        'POLICY_ACKNOWLEDGMENT_FAILED',
        'policy_acknowledgments',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <CardTitle className="text-xl">HIPAA Privacy & Security Policy</CardTitle>
        </div>
        {required && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Acknowledgment required to continue</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>Version {HIPAA_POLICY_VERSION} • Effective January 1, 2025</span>
        </div>

        <ScrollArea className="h-96 w-full border rounded-md p-4 bg-muted/50">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {HIPAA_POLICY_TEXT}
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-2 pt-4">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          />
          <label
            htmlFor="acknowledge"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read, understood, and agree to comply with the HIPAA Privacy and Security Policy outlined above. I acknowledge that this policy explains how my protected health information may be used and disclosed and how I can get access to this information.
          </label>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAcknowledge}
          disabled={!acknowledged || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Recording Acknowledgment...' : 'Acknowledge Policy'}
        </Button>
      </CardFooter>
    </Card>
  );
};