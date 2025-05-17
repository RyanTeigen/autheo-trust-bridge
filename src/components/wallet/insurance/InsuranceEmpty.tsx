
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface InsuranceEmptyProps {
  onAddInsurance: () => void;
}

const InsuranceEmpty: React.FC<InsuranceEmptyProps> = ({ onAddInsurance }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
      <p className="text-sm text-slate-500 mb-3 text-center">
        Add your insurance details to streamline check-in at healthcare providers
      </p>
      <Button 
        onClick={onAddInsurance} 
        variant="autheo" 
        className="w-full flex items-center justify-center gap-2 py-1 h-auto"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Add Insurance Information
      </Button>
    </div>
  );
};

export default InsuranceEmpty;
