
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Eye, Volume2, Type, MousePointer } from 'lucide-react';

const AccessibilitySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-500" />
          Accessibility
        </CardTitle>
        <CardDescription>
          Configure accessibility options to improve your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Visual Accessibility</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast" className="font-medium">High contrast mode</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch id="high-contrast" />
            </div>
            
            <div className="space-y-2">
              <Label>Font size</Label>
              <div className="flex items-center space-x-4">
                <Type className="h-4 w-4" />
                <Slider
                  defaultValue={[16]}
                  max={24}
                  min={12}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">16px</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion" className="font-medium">Reduced motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch id="reduced-motion" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Audio & Input</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="screen-reader" className="font-medium">Screen reader optimization</Label>
                <p className="text-sm text-muted-foreground">
                  Optimize interface for screen readers
                </p>
              </div>
              <Switch id="screen-reader" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="voice-commands" className="font-medium">Voice commands</Label>
                <p className="text-sm text-muted-foreground">
                  Enable voice-activated navigation
                </p>
              </div>
              <Switch id="voice-commands" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-navigation" className="font-medium">Enhanced keyboard navigation</Label>
                <p className="text-sm text-muted-foreground">
                  Improve keyboard-only navigation experience
                </p>
              </div>
              <Switch id="keyboard-navigation" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
