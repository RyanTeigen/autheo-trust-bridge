import React from 'react';
import { HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Get help with using your healthcare portal"
        icon={<HelpCircle className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/20 rounded-lg">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-medium">Phone Support</h4>
                  <p className="text-sm text-muted-foreground">1-800-HEALTH (24/7)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/20 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground">support@healthcare.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-muted/20 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-medium">Live Chat</h4>
                  <p className="text-sm text-muted-foreground">Available Mon-Fri 8AM-6PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common resources and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20">
                <h4 className="font-medium">Getting Started Guide</h4>
                <p className="text-sm text-muted-foreground">Learn how to use your patient portal</p>
              </div>
              
              <div className="p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                <h4 className="font-medium">Privacy & Security</h4>
                <p className="text-sm text-muted-foreground">Understanding your data protection</p>
              </div>
              
              <div className="p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                <h4 className="font-medium">Appointment Scheduling</h4>
                <p className="text-sm text-muted-foreground">How to book and manage appointments</p>
              </div>
              
              <div className="p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/30">
                <h4 className="font-medium">Understanding Lab Results</h4>
                <p className="text-sm text-muted-foreground">Guide to reading your test results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I view my lab results?</AccordionTrigger>
              <AccordionContent>
                Lab results are available in the Medical Records section of your portal. You'll receive a notification when new results are available. Click on any result to view detailed information and reference ranges.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I schedule an appointment?</AccordionTrigger>
              <AccordionContent>
                You can schedule appointments through the Appointments section. Select your provider, choose an available time slot, and specify the reason for your visit. You'll receive a confirmation email and reminder notifications.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I message my healthcare provider?</AccordionTrigger>
              <AccordionContent>
                Use the Messages section to send secure messages to your healthcare providers. All communication is encrypted and HIPAA-compliant. You'll receive notifications when you receive replies.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I update my personal information?</AccordionTrigger>
              <AccordionContent>
                Go to Settings to update your personal information, contact details, emergency contacts, and notification preferences. Some changes may require verification before they take effect.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Is my health information secure?</AccordionTrigger>
              <AccordionContent>
                Yes, your health information is protected with bank-level encryption and complies with HIPAA regulations. All data is stored securely and access is logged and monitored.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;