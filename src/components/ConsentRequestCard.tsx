import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { hashConsent } from "@/utils/hashConsent";
import { anchorConsentToBlockchain, ConsentData } from "@/utils/anchorConsent";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentRequestCardProps {
  requester: string;
  dataTypes: string[];
  duration: string;
  userId?: string;
  userDid?: string;
  onConsent: (txId?: string) => void;
}

export default function ConsentRequestCard({ 
  requester, 
  dataTypes, 
  duration, 
  userId,
  userDid,
  onConsent 
}: ConsentRequestCardProps) {
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConsent = async () => {
    if (!checked) return;
    
    setIsLoading(true);
    
    try {
      const consentPayload: ConsentData = {
        userDid: userDid || `did:autheo:${userId}`,
        requester,
        dataTypes,
        duration,
        timestamp: new Date().toISOString(),
        userId
      };

      // Hash the consent data
      const hash = await hashConsent(consentPayload);
      
      // Anchor to blockchain via existing infrastructure
      const anchorId = await anchorConsentToBlockchain(hash, consentPayload);
      
      toast({
        title: "Consent Granted",
        description: "Your consent has been recorded and anchored to the blockchain.",
      });
      
      onConsent(anchorId);
    } catch (error) {
      console.error('Error processing consent:', error);
      toast({
        title: "Error",
        description: "Failed to process consent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground w-full max-w-md">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">Access Request</h3>
        <p className="text-sm text-muted-foreground">From {requester}</p>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <div>
            <span className="font-medium text-sm">Data Types:</span>
            <p className="text-sm text-muted-foreground">{dataTypes.join(", ")}</p>
          </div>
          <div>
            <span className="font-medium text-sm">Access Duration:</span>
            <p className="text-sm text-muted-foreground">{duration}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="consent-checkbox"
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
          />
          <label 
            htmlFor="consent-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I acknowledge and consent to share this data
          </label>
        </div>

        <Button
          disabled={!checked || isLoading}
          onClick={handleConsent}
          className="w-full"
          variant={checked ? "default" : "outline"}
        >
          {isLoading ? "Processing..." : "Consent & Share"}
        </Button>
      </div>
    </div>
  );
}