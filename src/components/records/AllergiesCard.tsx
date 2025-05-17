
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AllergyItem {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  diagnosed: string;
}

interface AllergiesCardProps {
  allergies: AllergyItem[];
  onShare?: () => void;
}

const AllergiesCard: React.FC<AllergiesCardProps> = ({ allergies, onShare }) => {
  const { toast } = useToast();

  const getSeverityBadge = (severity: AllergyItem['severity']) => {
    switch (severity) {
      case 'mild':
        return <Badge variant="outline" className="bg-slate-700/30 text-autheo-light border-autheo-primary/30">Mild</Badge>;
      case 'moderate':
        return <Badge variant="outline" className="bg-slate-700/50 text-autheo-primary border-autheo-primary/50">Moderate</Badge>;
      case 'severe':
        return <Badge variant="destructive" className="bg-slate-700/70 border-red-500/30">Severe</Badge>;
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast({
        title: "Allergies shared",
        description: "Your allergies information has been shared with your healthcare provider."
      });
    }
  };

  return (
    <Card className="mb-6 bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="bg-slate-700/30 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-autheo-primary">
              <Pill className="h-5 w-5" /> Allergies
            </CardTitle>
            <CardDescription className="text-slate-300">Your allergies and reactions</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 bg-slate-700/30 hover:bg-slate-700/50 text-autheo-primary border-slate-600"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            Share Allergies
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {allergies.length > 0 ? (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <div key={allergy.id} className="rounded-lg border border-slate-700 p-3 bg-slate-800/70">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-lg text-autheo-primary">{allergy.name}</h3>
                  {getSeverityBadge(allergy.severity)}
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  <span className="font-medium">Reaction:</span> {allergy.reaction}
                </p>
                <p className="text-xs text-slate-400">
                  Diagnosed on {new Date(allergy.diagnosed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-slate-400">No allergies recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllergiesCard;
