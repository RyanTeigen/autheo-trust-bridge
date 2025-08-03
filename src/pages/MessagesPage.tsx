import React from 'react';
import { MessageCircle } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Secure communication with your healthcare providers"
        icon={<MessageCircle className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your message threads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                  <div>
                    <h4 className="font-medium">Dr. Smith</h4>
                    <p className="text-sm text-muted-foreground">Test results discussion</p>
                  </div>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                  <div>
                    <h4 className="font-medium">Nurse Johnson</h4>
                    <p className="text-sm text-muted-foreground">Appointment reminder</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                  <div>
                    <h4 className="font-medium">Dr. Wilson</h4>
                    <p className="text-sm text-muted-foreground">Follow-up questions</p>
                  </div>
                  <Badge variant="secondary">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Message Thread</CardTitle>
              <CardDescription>Secure healthcare communication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Dr. Smith</h4>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm">
                    Your recent lab results look good. Blood pressure is within normal range. 
                    Please continue with your current medication regimen.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-lg ml-8">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">You</h4>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <p className="text-sm">
                    Thank you for the update. Should I schedule my next appointment now?
                  </p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Dr. Smith</h4>
                    <span className="text-xs text-muted-foreground">30 minutes ago</span>
                  </div>
                  <p className="text-sm">
                    Yes, please schedule your follow-up for 3 months from now. 
                    Use the appointment scheduling system in your patient portal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;