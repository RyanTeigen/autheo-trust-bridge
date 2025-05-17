
import React from 'react';
import { Heart, Users, ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  return (
    <Card className={`h-full ${className || ''}`}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Manage your health records securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <Button asChild className="w-full justify-start">
            <Link to="/wallet" className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">View Health Records</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to="/provider-portal" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Provider Access</span>
            </Link>
          </Button>
          
          <Button asChild variant="secondary" className="w-full justify-start">
            <Link to="/compliance" className="flex items-center">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Compliance Report</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
