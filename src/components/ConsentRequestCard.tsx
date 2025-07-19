import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentRequestCardProps {
  requester: string;
  dataTypes: string[];
  duration: string;
  onConsent: () => void;
}

export default function ConsentRequestCard({ 
  requester, 
  dataTypes, 
  duration, 
  onConsent 
}: ConsentRequestCardProps) {
  const [checked, setChecked] = useState(false);

  const handleConsent = () => {
    if (checked) {
      onConsent();
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
          disabled={!checked}
          onClick={handleConsent}
          className="w-full"
          variant={checked ? "default" : "outline"}
        >
          Consent & Share
        </Button>
      </div>
    </div>
  );
}