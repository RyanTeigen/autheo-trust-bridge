
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
  
  const showFeatureToast = (feature: string) => {
    toast({
      title: `${feature}`,
      description: `You've accessed the ${feature.toLowerCase()} feature.`,
    });
  };

  const primaryActions = [
    {
      title: "Health Records",
      icon: Heart,
      path: "/wallet",
      variant: "autheo" as const,
      action: () => showFeatureToast("Health Records")
    },
    {
      title: "Provider Access",
      icon: Users,
      path: "/provider-portal",
      variant: "outline" as const,
      action: () => showFeatureToast("Provider Access")
    },
    {
      title: "Appointments",
      icon: CalendarIcon,
      path: "/scheduling",
      variant: "secondary" as const,
      action: () => showFeatureToast("Appointments")
    },
    {
      title: "Compliance",
      icon: ClipboardCheck,
      path: "/compliance",
      variant: "outline" as const,
      action: () => showFeatureToast("Compliance")
    }
  ];

  const secondaryActions = [
    {
      title: "Request Records",
      icon: Download,
      variant: "ghost" as const,
      action: () => showFeatureToast("Request Records")
    },
    {
      title: "Share Records",
      icon: Share,
      path: "/shared-records",
      variant: "ghost" as const,
      action: () => showFeatureToast("Share Records")
    },
    {
      title: "Message Provider",
      icon: MessageSquare,
      variant: "ghost" as const,
      action: () => showFeatureToast("Message Provider")
    },
    {
      title: "Book Telehealth",
      icon: Stethoscope,
      variant: "ghost" as const,
      action: () => showFeatureToast("Telehealth Booking")
    },
    {
      title: "New Health Log",
      icon: PlusCircle,
      variant: "ghost" as const,
      action: () => showFeatureToast("New Health Log")
    },
    {
      title: "Medical Notes",
      icon: FileText,
      path: "/medical-notes",
      variant: "ghost" as const,
      action: () => showFeatureToast("Medical Notes")
    }
  ];

  return (
    <Card className={`h-full shadow-sm border-autheo-primary/10 ${className || ''}`}>
      <CardHeader className="bg-gradient-to-r from-autheo-primary/5 to-transparent">
        <CardTitle className="text-lg flex items-center">
          <Heart className="h-5 w-5 mr-2 text-autheo-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Access your health information and care tools
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {primaryActions.map((item) => (
            <Button 
              key={item.title}
              asChild 
              variant={item.variant} 
              className="justify-start h-auto py-4 shadow-sm"
              onClick={item.action}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {secondaryActions.map((item) => (
              item.path ? (
                <Button 
                  key={item.title}
                  asChild 
                  variant={item.variant} 
                  size="sm"
                  className="h-auto py-3 px-2 text-xs flex-col"
                  onClick={item.action}
                >
                  <Link to={item.path} className="flex flex-col items-center gap-1">
                    <item.icon className="h-4 w-4" />
                    <span className="text-center">{item.title}</span>
                  </Link>
                </Button>
              ) : (
                <Button 
                  key={item.title}
                  variant={item.variant} 
                  size="sm"
                  className="h-auto py-3 px-2 text-xs flex-col"
                  onClick={item.action}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="text-center">{item.title}</span>
                </Button>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
