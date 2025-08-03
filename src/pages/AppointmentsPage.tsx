import React from 'react';
import { Calendar } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AppointmentsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage your healthcare appointments and schedule"
        icon={<Calendar className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled healthcare appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <h4 className="font-medium">Dr. Smith - General Checkup</h4>
                  <p className="text-sm text-muted-foreground">Tomorrow, 2:00 PM</p>
                </div>
                <div className="text-sm text-primary">Confirmed</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <h4 className="font-medium">Dr. Johnson - Cardiology</h4>
                  <p className="text-sm text-muted-foreground">Next week, 10:30 AM</p>
                </div>
                <div className="text-sm text-yellow-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule New Appointment</CardTitle>
            <CardDescription>Book your next healthcare appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Use our integrated scheduling system to book appointments with your healthcare providers.
              </p>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  <strong>Quick Tip:</strong> Emergency appointments can be scheduled 24/7 through our emergency booking system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;