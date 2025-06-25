
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Share2, Zap } from 'lucide-react';

interface HeaderCardProps {
  onQuickShare: () => void;
}

const HeaderCard: React.FC<HeaderCardProps> = ({ onQuickShare }) => {
  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-autheo-primary/20 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-autheo-primary" />
            </div>
            <div>
              <CardTitle className="text-autheo-primary flex items-center gap-2">
                Shared Records & Access Management
                <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Quantum-Safe
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-300">
                Manage sharing, access permissions, and view shared records all in one place
              </CardDescription>
            </div>
          </div>
          
          <Button 
            onClick={onQuickShare}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Quick Share
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default HeaderCard;
