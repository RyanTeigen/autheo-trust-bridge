
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
    default: return <Minus className="h-3 w-3 text-slate-400" />;
  }
};
