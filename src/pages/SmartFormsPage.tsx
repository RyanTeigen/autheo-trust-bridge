
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartFormsProvider } from '@/contexts/SmartFormsContext';
import SmartForm from '@/components/forms/SmartForm';
import { Brain, FileText, Calendar, Activity } from 'lucide-react';

const SmartFormsContent = () => {
  const [activeTab, setActiveTab] = useState('intake');

  const handleFormSubmit = (category: string) => (data: any) => {
    console.log(`${category} form submitted:`, data);
    // In a real app, this would save to the database
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-autheo-primary" />
          Smart Forms
        </h1>
        <p className="text-muted-foreground">
          Intelligent forms with auto-completion, medical terminology suggestions, and progress saving
        </p>
      </div>

      {/* Features overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-slate-200">Auto-completion</h3>
                <p className="text-sm text-slate-400">Medical terminology suggestions as you type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-slate-200">Smart Validation</h3>
                <p className="text-sm text-slate-400">Real-time warnings for drug interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-slate-200">Auto-save</h3>
                <p className="text-sm text-slate-400">Progress automatically saved as you type</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 p-1">
          <TabsTrigger value="intake" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
            <FileText className="h-4 w-4 mr-2" />
            Patient Intake
          </TabsTrigger>
          <TabsTrigger value="followup" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Follow-up
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
            <Activity className="h-4 w-4 mr-2" />
            Symptom Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="space-y-6">
          <SmartForm
            category="intake"
            title="Patient Intake Form"
            description="Complete your initial patient information. The form will suggest medical terms and remember your entries."
            onSubmit={handleFormSubmit('intake')}
            className="bg-slate-800/50 border-slate-700"
          />
        </TabsContent>

        <TabsContent value="followup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SmartForm
              category="followup"
              title="Follow-up Visit"
              description="Specialized form based on your medical history. Auto-selected based on your conditions."
              onSubmit={handleFormSubmit('followup')}
              className="bg-slate-800/50 border-slate-700"
            />
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Smart Form Features</CardTitle>
                <CardDescription>How the form adapts to your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-slate-200">Condition-Based Templates</div>
                      <div className="text-slate-400">Forms automatically adapt based on your medical history</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-slate-200">Medical Autocomplete</div>
                      <div className="text-slate-400">Type 2+ characters to see medical term suggestions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-slate-200">Drug Interaction Warnings</div>
                      <div className="text-slate-400">Real-time alerts for potential medication conflicts</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-slate-200">Auto-save Progress</div>
                      <div className="text-slate-400">Never lose your work - progress saved automatically</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-6">
          <SmartForm
            category="intake"
            title="Symptom Assessment"
            description="Report your current symptoms with intelligent suggestions and validation."
            onSubmit={handleFormSubmit('symptoms')}
            className="bg-slate-800/50 border-slate-700"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SmartFormsPage = () => {
  return (
    <SmartFormsProvider>
      <SmartFormsContent />
    </SmartFormsProvider>
  );
};

export default SmartFormsPage;
