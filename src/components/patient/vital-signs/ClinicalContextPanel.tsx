
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Target, AlertCircle } from 'lucide-react';
import { CLINICAL_REFERENCES } from '@/utils/clinicalReferences';

interface ClinicalContextPanelProps {
  vitalType: string;
  currentValue?: number;
}

export const ClinicalContextPanel: React.FC<ClinicalContextPanelProps> = ({ 
  vitalType, 
  currentValue 
}) => {
  const reference = CLINICAL_REFERENCES[vitalType];
  
  if (!reference) return null;

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Info className="h-4 w-4" />
          Clinical Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-slate-600 mb-2">
          {reference.description}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Normal
            </span>
            <span className="text-slate-600">
              {reference.normal.min}-{reference.normal.max} {reference.unit}
            </span>
          </div>
          
          {reference.borderline && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                {reference.borderline.label}
              </span>
              <span className="text-slate-600">
                {reference.borderline.min}-{reference.borderline.max} {reference.unit}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              High Risk
            </span>
            <span className="text-slate-600">
              ≥{reference.high.min} {reference.unit}
            </span>
          </div>
        </div>

        {currentValue && (
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <Target className="h-3 w-3 text-slate-500" />
              <span className="text-slate-600">
                Your latest: <span className="font-medium text-slate-800">{currentValue} {reference.unit}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
