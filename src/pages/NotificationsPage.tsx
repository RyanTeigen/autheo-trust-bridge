import React from 'react';
import { Bell } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with your healthcare notifications and alerts"
        icon={<Bell className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Your latest healthcare updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-primary/10 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Lab Results Available</h4>
                    <Badge variant="default">New</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your blood work results from yesterday's visit are now available for review.
                  </p>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Appointment Reminder</h4>
                    <Badge variant="secondary">Reminder</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Don't forget your appointment with Dr. Smith tomorrow at 2:00 PM.
                  </p>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Medication Reminder</h4>
                    <Badge variant="secondary">Daily</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time to take your evening medication (Lisinopril 10mg).
                  </p>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Health Record Update</h4>
                    <Badge variant="outline">Info</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your health record has been updated with new visit notes from Dr. Johnson.
                  </p>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lab Results</h4>
                    <p className="text-sm text-muted-foreground">Notifications when test results are available</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Medication Reminders</h4>
                    <p className="text-sm text-muted-foreground">Daily medication reminder notifications</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications about system maintenance</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;