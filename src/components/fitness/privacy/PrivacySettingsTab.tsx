
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface PrivacySettings {
  quantumEncryption: boolean;
  zeroKnowledgeProofs: boolean;
  differentialPrivacy: boolean;
  anonymousSharing: boolean;
  dataMinimization: boolean;
}

interface PrivacySettingsTabProps {
  privacySettings: PrivacySettings;
  onSettingChange: (setting: keyof PrivacySettings) => void;
}

const PrivacySettingsTab: React.FC<PrivacySettingsTabProps> = ({
  privacySettings,
  onSettingChange
}) => {
  const getSettingDescription = (key: string) => {
    switch (key) {
      case 'quantumEncryption': return 'Protect data against quantum computer attacks';
      case 'zeroKnowledgeProofs': return 'Prove achievements without revealing data';
      case 'differentialPrivacy': return 'Add noise to prevent identification';
      case 'anonymousSharing': return 'Share aggregated data anonymously';
      case 'dataMinimization': return 'Only collect necessary data points';
      default: return '';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary">Advanced Privacy Controls</CardTitle>
        <CardDescription>
          Configure quantum-resistant privacy features for your fitness data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(privacySettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              <p className="text-xs text-slate-400">
                {getSettingDescription(key)}
              </p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={() => onSettingChange(key as keyof PrivacySettings)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsTab;
