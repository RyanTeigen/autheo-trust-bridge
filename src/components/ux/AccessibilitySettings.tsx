
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, Type, Zap, Volume2 } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';

const AccessibilitySettings: React.FC = () => {
  const { preferences, updatePreference } = useAccessibility();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="high-contrast" className="text-slate-200">High Contrast Mode</Label>
                <p className="text-sm text-slate-400">Increase contrast for better visibility</p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="large-text" className="text-slate-200">Large Text</Label>
                <p className="text-sm text-slate-400">Increase text size for better readability</p>
              </div>
            </div>
            <Switch
              id="large-text"
              checked={preferences.largeText}
              onCheckedChange={(checked) => updatePreference('largeText', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="reduce-motion" className="text-slate-200">Reduce Motion</Label>
                <p className="text-sm text-slate-400">Minimize animations and transitions</p>
              </div>
            </div>
            <Switch
              id="reduce-motion"
              checked={preferences.reduceMotion}
              onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-slate-400" />
              <div>
                <Label htmlFor="screen-reader" className="text-slate-200">Screen Reader Support</Label>
                <p className="text-sm text-slate-400">Enhanced support for screen readers</p>
              </div>
            </div>
            <Switch
              id="screen-reader"
              checked={preferences.screenReader}
              onCheckedChange={(checked) => updatePreference('screenReader', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
