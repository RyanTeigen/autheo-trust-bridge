import React from 'react';
import { Heart, ClipboardCheck, Shield, Wallet, Users, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();

  // Mock health records count
  const healthRecords = {
    total: 17,
    shared: 5,
    pending: 2
  };

  // Mock compliance score
  const complianceScore = 92;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Health Dashboard</h1>
        <p className="text-muted-foreground">
          Securely manage and share your health records
        </p>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{healthRecords.total}</div>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shared Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{healthRecords.shared}</div>
                <p className="text-xs text-muted-foreground">Active Shares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Smart Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-autheo-primary mr-3" />
              <div>
                <div className="text-2xl font-bold">Secured</div>
                <p className="text-xs text-muted-foreground">Decentralized Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">HIPAA Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{complianceScore}%</div>
                <p className="text-xs text-muted-foreground">Compliance Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
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

      {/* Recent Activity and Record Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Health Records</CardTitle>
            <CardDescription>
              Your latest medical information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Annual Physical</p>
                  <p className="text-sm text-muted-foreground">Dr. Emily Chen - 05/10/2025</p>
                </div>
                <Button size="sm" variant="ghost">View</Button>
              </div>
              
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Blood Test Results</p>
                  <p className="text-sm text-muted-foreground">Metro Lab - 05/02/2025</p>
                </div>
                <Button size="sm" variant="ghost">View</Button>
              </div>
              
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Vaccination Record</p>
                  <p className="text-sm text-muted-foreground">City Health Clinic - 04/22/2025</p>
                </div>
                <Button size="sm" variant="ghost">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Approved Access</CardTitle>
            <CardDescription>
              Providers with access to your records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Dr. Emily Chen</p>
                  <p className="text-sm text-muted-foreground">Primary Care - Full Access</p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Dr. James Wilson</p>
                  <p className="text-sm text-muted-foreground">Cardiology - Limited Access</p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              
              <div className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Metro General Hospital</p>
                  <p className="text-sm text-muted-foreground">Emergency - Temporary Access</p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
