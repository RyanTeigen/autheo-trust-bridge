
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Activity, Pill, Calendar } from 'lucide-react';

const HealthPreferencesSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Monitoring
          </CardTitle>
          <CardDescription>
            Configure your health tracking and monitoring preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Health Alerts</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="medication-reminders" className="font-medium">Medication reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when it's time to take your medications
                  </p>
                </div>
                <Switch id="medication-reminders" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vital-alerts" className="font-medium">Vital sign alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when vital signs are outside normal ranges
                  </p>
                </div>
                <Switch id="vital-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="preventive-care" className="font-medium">Preventive care reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming screenings and check-ups
                  </p>
                </div>
                <Switch id="preventive-care" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Sharing Preferences</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous-research" className="font-medium">Anonymous research participation</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your anonymized data to contribute to medical research
                  </p>
                </div>
                <Switch id="anonymous-research" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="health-trends" className="font-medium">Population health trends</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized data for public health monitoring
                  </p>
                </div>
                <Switch id="health-trends" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Health Score Settings
          </CardTitle>
          <CardDescription>
            Customize how your health score is calculated and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Health Score Focus</Label>
            <Select defaultValue="balanced">
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced Health</SelectItem>
                <SelectItem value="fitness">Fitness & Activity</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="mental">Mental Health</SelectItem>
                <SelectItem value="chronic">Chronic Condition Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gamification" className="font-medium">Enable gamification</Label>
              <p className="text-sm text-muted-foreground">
                Add achievements and progress tracking to encourage healthy habits
              </p>
            </div>
            <Switch id="gamification" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthPreferencesSettings;
