
import React from 'react';
import { VitalIcon, getVitalColor } from './VitalIcon';

interface DecryptedVital {
  type: string;
  value: string;
  unit?: string;
  dataType: string;
}

interface VitalItemProps {
  vital: DecryptedVital;
  index: number;
}

export const VitalItem: React.FC<VitalItemProps> = ({ vital, index }) => {
  const color = getVitalColor(vital.dataType);

  return (
    <div
      key={index}
      className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className={color}>
          <VitalIcon dataType={vital.dataType} />
        </span>
        <span className="font-medium text-slate-700">
          {vital.type}
        </span>
      </div>
      <div className="text-right">
        <span className="font-mono text-lg font-semibold text-slate-900">
          {vital.value}
        </span>
        {vital.unit && (
          <span className="text-sm text-slate-500 ml-1">
            {vital.unit}
          </span>
        )}
      </div>
    </div>
  );
};
