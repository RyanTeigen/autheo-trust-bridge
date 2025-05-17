
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, Users } from 'lucide-react';
import { InsuranceInfo } from './types';

interface InsuranceDisplayProps {
  insuranceInfo: InsuranceInfo;
  onEdit: () => void;
  onVerify: () => void;
  onShare: () => void;
}

const InsuranceDisplay: React.FC<InsuranceDisplayProps> = ({
  insuranceInfo,
  onEdit,
  onVerify,
  onShare,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">{insuranceInfo.provider}</p>
            <p className="text-xs text-slate-600">Plan: {insuranceInfo.planType || "Standard"}</p>
          </div>
          {insuranceInfo.verified ? (
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Verified
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="text-xs py-1 h-auto border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={onVerify}
            >
              Verify Now
            </Button>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-slate-500">Member ID</Label>
              <p className="text-xs font-mono">{insuranceInfo.memberID}</p>
            </div>
            <div>
              <Label className="text-[10px] text-slate-500">Group #</Label>
              <p className="text-xs font-mono">{insuranceInfo.groupNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 text-xs h-auto py-1.5 border-slate-200 hover:bg-slate-50"
          onClick={onEdit}
        >
          Edit Details
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 text-xs h-auto py-1.5 border-autheo-secondary text-autheo-secondary hover:bg-autheo-secondary/5"
          onClick={onShare}
        >
          <Users className="h-3.5 w-3.5 mr-1.5" />
          Share Info
        </Button>
      </div>
      
      <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
        <Shield className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600">
          Your insurance data is encrypted end-to-end and only shared with your explicit consent
        </p>
      </div>
    </div>
  );
};

export default InsuranceDisplay;
