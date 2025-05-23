
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/contexts/UserSettingsContext';

const AppearanceSettings = () => {
  const { settings, updateTheme } = useUserSettings();
  const { theme } = settings;
  
  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    updateTheme({ mode });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks and feels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Select the theme for your dashboard
            </p>
          </div>
          
          <RadioGroup 
            defaultValue={theme.mode}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')}
          >
            <div>
              <RadioGroupItem 
                value="light" 
                id="theme-light" 
                className="peer sr-only" 
                checked={theme.mode === 'light'}
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 p-4 hover:bg-slate-700/50 hover:text-slate-50 peer-data-[state=checked]:border-autheo-primary [&:has([data-state=checked])]:border-autheo-primary"
              >
                <div className="rounded-md border border-slate-600 w-full h-12 mb-2 bg-white" />
                Light
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="dark" 
                id="theme-dark" 
                className="peer sr-only" 
                checked={theme.mode === 'dark'}
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 p-4 hover:bg-slate-700/50 hover:text-slate-50 peer-data-[state=checked]:border-autheo-primary [&:has([data-state=checked])]:border-autheo-primary"
              >
                <div className="rounded-md border border-slate-600 w-full h-12 mb-2 bg-slate-900" />
                Dark
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="system" 
                id="theme-system" 
                className="peer sr-only" 
                checked={theme.mode === 'system'}
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-700 bg-slate-800 p-4 hover:bg-slate-700/50 hover:text-slate-50 peer-data-[state=checked]:border-autheo-primary [&:has([data-state=checked])]:border-autheo-primary"
              >
                <div className="rounded-md border border-slate-600 w-full h-12 mb-2 bg-gradient-to-r from-white to-slate-900" />
                System
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              Configure accessibility options for your dashboard
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduced motion</Label>
              <Switch id="reduced-motion" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High contrast</Label>
              <Switch id="high-contrast" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
