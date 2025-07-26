import React from 'react';
import { Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const AuthStatus: React.FC = () => {
  const { user, session, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card className="bg-background/95 border-border">
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading authentication status...</span>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (!isAuthenticated) return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (session && profile) return <CheckCircle className="h-5 w-5 text-success" />;
    return <Lock className="h-5 w-5 text-warning" />;
  };

  const getStatusMessage = () => {
    if (!isAuthenticated) return "Not authenticated";
    if (session && profile) return "Fully authenticated";
    if (session && !profile) return "Profile incomplete";
    return "Authentication incomplete";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!isAuthenticated) return "destructive";
    if (session && profile) return "default";
    return "secondary";
  };

  return (
    <Card className="bg-background/95 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-foreground">{getStatusMessage()}</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {isAuthenticated ? "Active" : "Inactive"}
          </Badge>
        </div>

        {isAuthenticated && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span>{user?.email}</span>
            </div>
            {profile && (
              <div className="flex justify-between">
                <span>Role:</span>
                <Badge variant="outline">{profile.role || 'patient'}</Badge>
              </div>
            )}
            <div className="flex justify-between">
              <span>Session:</span>
              <Badge variant={session ? "default" : "destructive"}>
                {session ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-sm text-muted-foreground">
            <p>Please sign in to access your medical records and health data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthStatus;