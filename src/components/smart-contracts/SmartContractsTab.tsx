
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SmartContracts from '@/components/decentralized/SmartContracts';
import InsuranceAutomation from './InsuranceAutomation';
import IoTDeviceManager from '../iot/IoTDeviceManager';

const SmartContractsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-700 dark:bg-slate-700 mb-6 flex w-full justify-start">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="insurance"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            Insurance Automation
          </TabsTrigger>
          <TabsTrigger 
            value="iot"
            className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
          >
            IoT Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <SmartContracts />
        </TabsContent>
          
        <TabsContent value="insurance">
          <InsuranceAutomation />
        </TabsContent>
          
        <TabsContent value="iot">
          <IoTDeviceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartContractsTab;
