
import React from 'react';
import { Heart, Users, ClipboardCheck, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  return (
    <Card className={`h-full shadow-sm border-autheo-primary/10 ${className || ''}`}>
      <CardHeader className="bg-gradient-to-r from-autheo-primary/5 to-transparent">
        <CardTitle className="text-lg flex items-center">
          <Heart className="h-5 w-5 mr-2 text-autheo-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Manage your health records securely
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button asChild variant="autheo" className="justify-start h-auto py-4 shadow-sm">
            <Link to="/wallet" className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Health Records</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="justify-start h-auto py-4 shadow-sm">
            <Link to="/provider-portal" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Provider Access</span>
            </Link>
          </Button>
          
          <Button asChild variant="secondary" className="justify-start h-auto py-4 shadow-sm">
            <Link to="/scheduling" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Appointments</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="justify-start h-auto py-4 shadow-sm">
            <Link to="/compliance" className="flex items-center">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Compliance</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
