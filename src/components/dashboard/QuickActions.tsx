
import React from 'react';
import { 
  Heart, 
  Users, 
  ClipboardCheck, 
  CalendarIcon,
  PlusCircle,
  Share,
  Download,
  MessageSquare,
  Stethoscope,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  const { toast } = useToast();
  
  const primaryActions = [
    {
      title: "Health Records",
      icon: Heart,
      path: "/wallet",
      variant: "default" as const
    },
    {
      title: "Provider Access",
      icon: Users,
      path: "/provider-portal",
      variant: "outline" as const
    },
    {
      title: "Appointments",
      icon: CalendarIcon,
      path: "/patient-dashboard",
      variant: "secondary" as const
    },
    {
      title: "Compliance",
      icon: ClipboardCheck,
      path: "/compliance",
      variant: "outline" as const
    }
  ];

  const secondaryActions = [
    {
      title: "Request Records",
      icon: Download,
      path: "/patient-dashboard",
      variant: "ghost" as const
    },
    {
      title: "Share Records",
      icon: Share,
      path: "/sharing",
      variant: "ghost" as const
    },
    {
      title: "Message Provider",
      icon: MessageSquare,
      path: "/patient-dashboard",
      variant: "ghost" as const
    },
    {
      title: "Health Log",
      icon: PlusCircle,
      path: "/patient-dashboard",
      variant: "ghost" as const
    }
  ];

  return (
    <Card className={`h-full shadow-sm border-border ${className || ''}`}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-lg flex items-center">
          <Heart className="h-5 w-5 mr-2 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Access your health information and care tools
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {primaryActions.map((item) => (
            <Button 
              key={item.title}
              asChild 
              variant={item.variant} 
              className="justify-start h-auto py-4 shadow-sm"
            >
              <Link to={item.path} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                <span className="whitespace-nowrap">{item.title}</span>
              </Link>
            </Button>
          ))}
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Additional Actions</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {secondaryActions.map((item) => (
              <Button 
                key={item.title}
                asChild 
                variant={item.variant} 
                size="sm"
                className="h-auto py-3 px-2 text-xs flex-col"
              >
                <Link to={item.path} className="flex flex-col items-center gap-1">
                  <item.icon className="h-4 w-4" />
                  <span className="text-center">{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
