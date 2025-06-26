
import React from 'react';
import { Heart, Activity, Thermometer, Droplets } from 'lucide-react';

interface VitalIconProps {
  dataType: string;
  className?: string;
}

export const VitalIcon: React.FC<VitalIconProps> = ({ dataType, className = "h-5 w-5" }) => {
  const getVitalIcon = (dataType: string): React.ReactNode => {
    switch (dataType.toLowerCase()) {
      case 'heart_rate':
        return <Heart className={className} />;
      case 'systolic_bp':
      case 'diastolic_bp':
        return <Activity className={className} />;
      case 'temperature':
        return <Thermometer className={className} />;
      case 'oxygen_saturation':
        return <Droplets className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  return <>{getVitalIcon(dataType)}</>;
};

export const getVitalColor = (dataType: string): string => {
  switch (dataType.toLowerCase()) {
    case 'heart_rate':
      return 'text-red-600';
    case 'systolic_bp':
    case 'diastolic_bp':
      return 'text-blue-600';
    case 'temperature':
      return 'text-orange-600';
    case 'oxygen_saturation':
      return 'text-cyan-600';
    default:
      return 'text-gray-600';
  }
};
