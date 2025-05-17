
import React from 'react';
import { Heart, Users, ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Manage your health records securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="w-full">
            <Link to="/wallet" className="flex items-center justify-center">
              <Heart className="mr-2 h-4 w-4" />
              View Health Records
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/provider-portal" className="flex items-center justify-center">
              <Users className="mr-2 h-4 w-4" />
              Provider Access
            </Link>
          </Button>
          
          <Button asChild variant="secondary" className="w-full">
            <Link to="/compliance" className="flex items-center justify-center">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Compliance Report
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
