
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Users, Eye } from 'lucide-react';

const SecurityFeaturesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-900/20 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Post-Quantum Safe</h3>
              <p className="text-sm text-slate-400">ML-KEM-768 encryption</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Granular Access</h3>
              <p className="text-sm text-slate-400">Control who sees what</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-900/20 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-200">Audit Trail</h3>
              <p className="text-sm text-slate-400">Track all access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityFeaturesGrid;
