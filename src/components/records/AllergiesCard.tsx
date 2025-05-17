
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" /> Allergies
            </CardTitle>
            <CardDescription>Your allergies and reactions</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
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
              <div key={allergy.id} className="rounded-lg border p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-lg">{allergy.name}</h3>
                  {getSeverityBadge(allergy.severity)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Reaction:</span> {allergy.reaction}
                </p>
                <p className="text-xs text-muted-foreground">
                  Diagnosed on {new Date(allergy.diagnosed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No allergies recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllergiesCard;
