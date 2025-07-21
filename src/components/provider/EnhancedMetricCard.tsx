
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  progress?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isRealTime?: boolean;
  isConnected?: boolean;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  progress, 
  trend, 
  isRealTime = false,
  isConnected = true,
  subtitle,
  badge
}) => {
  return (
    <Card className="bg-slate-800/70 border-slate-700/70 relative overflow-hidden">
      {/* Real-time indicator */}
      {isRealTime && (
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-400" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-400" />
                  )}
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {isConnected ? 'Real-time updates active' : 'Connection lost'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              {title}
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-1.5 bg-slate-700/50 rounded-full">{icon}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-autheo-primary mb-2">{value}</div>
        
        {description && (
          <p className="text-xs text-slate-400 mb-3">{description}</p>
        )}
        
        {progress !== undefined && (
          <div className="mb-3">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-slate-400 mt-1">{progress}% complete</p>
          </div>
        )}
        
        {trend && (
          <div className="flex items-center gap-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-400" />
            ) : trend.value === 0 ? (
              <Minus className="h-3 w-3 text-slate-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400" />
            )}
            <span className={`text-xs ${
              trend.isPositive 
                ? 'text-green-400' 
                : trend.value === 0 
                  ? 'text-slate-400' 
                  : 'text-red-400'
            }`}>
              {trend.isPositive ? '+' : trend.value === 0 ? '' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMetricCard;
