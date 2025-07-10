
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Share2, 
  Calendar, 
  MessageCircle, 
  Shield,
  Zap,
  Plus,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface EnhancedQuickActionsProps {
  className?: string;
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewRecords = () => {
    navigate('/patient-dashboard', { state: { activeTab: 'shared-records' } });
  };

  const handleQuantumShare = () => {
    navigate('/patient-dashboard', { state: { activeTab: 'shared-records', focusSharing: true } });
  };

  const handleSchedule = () => {
    toast({
      title: "Coming Soon",
      description: "Scheduling features are currently under development.",
    });
  };

  const handleMessages = () => {
    toast({
      title: "Coming Soon", 
      description: "Messaging features are currently under development.",
    });
  };

  const handleShareRecords = () => {
    navigate('/patient-dashboard', { state: { activeTab: 'shared-records', focusSharing: true } });
  };

  const handleManageAccess = () => {
    navigate('/patient-dashboard', { state: { activeTab: 'access-requests' } });
  };

  return (
    <Card className={cn("bg-slate-800 border-slate-700 text-slate-100", className)}>
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-autheo-primary"
            onClick={handleViewRecords}
          >
            <FileText className="h-5 w-5 text-autheo-primary" />
            <span className="text-sm">View Records</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-autheo-primary relative"
            onClick={handleQuantumShare}
          >
            <div className="flex items-center gap-1">
              <Share2 className="h-5 w-5 text-autheo-primary" />
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-autheo-primary text-autheo-dark">
                <Zap className="h-3 w-3" />
              </Badge>
            </div>
            <span className="text-sm">Quantum Share</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-autheo-primary"
            onClick={handleSchedule}
          >
            <Calendar className="h-5 w-5 text-autheo-primary" />
            <span className="text-sm">Schedule</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col gap-2 border-slate-600 hover:bg-slate-700 hover:border-autheo-primary"
            onClick={handleMessages}
          >
            <MessageCircle className="h-5 w-5 text-autheo-primary" />
            <span className="text-sm">Messages</span>
          </Button>
        </div>
        
        {/* Highlighted Quantum Features */}
        <div className="mt-6 p-4 bg-gradient-to-r from-autheo-primary/10 to-autheo-secondary/10 rounded-lg border border-autheo-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-autheo-primary" />
              <h3 className="font-medium text-autheo-primary">Quantum-Safe Features</h3>
            </div>
            <Badge variant="secondary" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
              <Zap className="h-3 w-3 mr-1" />
              Advanced
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              className="justify-start text-left h-auto p-3 hover:bg-autheo-primary/10"
              onClick={handleShareRecords}
            >
              <div className="flex items-center gap-3">
                <div className="bg-autheo-primary/20 p-2 rounded-lg">
                  <Plus className="h-4 w-4 text-autheo-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Share Records</p>
                  <p className="text-xs text-slate-400">Post-quantum encryption</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start text-left h-auto p-3 hover:bg-autheo-primary/10"
              onClick={handleManageAccess}
            >
              <div className="flex items-center gap-3">
                <div className="bg-autheo-primary/20 p-2 rounded-lg">
                  <Eye className="h-4 w-4 text-autheo-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Manage Access</p>
                  <p className="text-xs text-slate-400">Control who sees what</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuickActions;
