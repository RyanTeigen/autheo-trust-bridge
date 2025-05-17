
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
        return <Badge variant="outline" className="bg-green-100 text-green-800">Mild</Badge>;
      case 'moderate':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Moderate</Badge>;
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>;
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
    <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50">
      <CardHeader className="bg-red-100/70 dark:bg-red-800/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" /> Allergies
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">Your allergies and reactions</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 bg-red-100/50 hover:bg-red-200/70 dark:bg-red-800/50 dark:hover:bg-red-700/60"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            Share Allergies
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {allergies.length > 0 ? (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <div key={allergy.id} className="rounded-lg border border-red-200 dark:border-red-800/50 p-3 bg-red-50/50 dark:bg-red-900/30">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-lg text-red-800 dark:text-red-200">{allergy.name}</h3>
                  {getSeverityBadge(allergy.severity)}
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <span className="font-medium">Reaction:</span> {allergy.reaction}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Diagnosed on {new Date(allergy.diagnosed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400">No allergies recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllergiesCard;
