import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowTemplateSelector } from '@/components/workflow/WorkflowTemplateSelector';
import { WorkflowDesigner } from '@/components/workflow/WorkflowDesigner';
import { WorkflowExecutionPanel } from '@/components/workflow/enhanced/WorkflowExecutionPanel';
import { WorkflowAnalytics } from '@/components/workflow/enhanced/WorkflowAnalytics';
import { SmartWorkflowBuilder } from '@/components/workflow/enhanced/SmartWorkflowBuilder';
import { WorkflowTemplate, WorkflowExecution } from '@/types/workflow';
import { useWorkflow } from '@/hooks/useWorkflow';
import { ArrowLeft, Sparkles, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedWorkflowPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  
  const { 
    executeWorkflow, 
    saveTemplate,
    templates,
    executions 
  } = useWorkflow();

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setActiveTab('designer');
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleExecuteTemplate = async (template: WorkflowTemplate) => {
    try {
      const execution = await executeWorkflow(template.id);
      setCurrentExecution(execution);
      setActiveTab('execution');
      toast.success('Workflow execution started successfully');
    } catch (error) {
      toast.error('Failed to execute workflow');
    }
  };

  const handleCreateSmartWorkflow = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setActiveTab('designer');
  };

  const handleSaveWorkflow = async (nodes: any[], edges: any[]) => {
    if (!selectedTemplate) return;
    
    try {
      const updatedTemplate = {
        ...selectedTemplate,
        nodes,
        edges,
        metadata: {
          ...selectedTemplate.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      
      await saveTemplate(updatedTemplate);
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  const handleBackToSelector = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setActiveTab('templates');
  };

  const handleExecutionControl = (action: string) => {
    switch (action) {
      case 'execute':
        if (selectedTemplate) {
          handleExecuteTemplate(selectedTemplate);
        }
        break;
      case 'pause':
        toast.info('Workflow paused');
        break;
      case 'stop':
        setCurrentExecution(null);
        toast.info('Workflow stopped');
        break;
      case 'resume':
        toast.info('Workflow resumed');
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedTemplate && (
            <Button variant="outline" onClick={handleBackToSelector}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Enhanced Workflow Management</h1>
            <p className="text-muted-foreground">
              Design, execute, and monitor healthcare workflows with AI assistance
            </p>
          </div>
        </div>
      </div>

      {selectedTemplate ? (
        /* Workflow Designer View */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {selectedTemplate.name}
                  {isEditing && <span className="text-sm text-muted-foreground">(Editing)</span>}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExecuteTemplate(selectedTemplate)}
                  >
                    Execute Workflow
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      View Only
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
            <div className="lg:col-span-3">
              <WorkflowDesigner
                templateId={selectedTemplate.id}
                onSave={handleSaveWorkflow}
                readonly={!isEditing}
              />
            </div>
            <div className="lg:col-span-1">
              <WorkflowExecutionPanel
                execution={currentExecution}
                onExecute={() => handleExecutionControl('execute')}
                onPause={() => handleExecutionControl('pause')}
                onStop={() => handleExecutionControl('stop')}
                onResume={() => handleExecutionControl('resume')}
                className="h-full"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Main Dashboard View */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="smart-builder" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Smart Builder
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="execution" className="gap-2">
              <Settings className="w-4 h-4" />
              Execution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <WorkflowTemplateSelector
              onSelect={handleSelectTemplate}
              onEdit={handleEditTemplate}
              onExecute={handleExecuteTemplate}
            />
          </TabsContent>

          <TabsContent value="smart-builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmartWorkflowBuilder
                onCreateWorkflow={handleCreateSmartWorkflow}
                className="h-fit"
              />
              <Card>
                <CardHeader>
                  <CardTitle>AI Workflow Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recommended Templates</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Patient Discharge Workflow</p>
                        <p className="text-xs text-muted-foreground">
                          Based on your usage patterns, this template could streamline discharge planning
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Medication Reconciliation</p>
                        <p className="text-xs text-muted-foreground">
                          Automated medication review process with compliance checks
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Optimization Suggestions</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• Consider adding automated consent validation</p>
                      <p>• Enable real-time compliance monitoring</p>
                      <p>• Implement smart notification routing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <WorkflowAnalytics />
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WorkflowExecutionPanel
                execution={currentExecution}
                onExecute={() => handleExecutionControl('execute')}
                onPause={() => handleExecutionControl('pause')}
                onStop={() => handleExecutionControl('stop')}
                onResume={() => handleExecutionControl('resume')}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {executions.slice(0, 5).map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {templates.find(t => t.id === execution.templateId)?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(execution.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                          execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {execution.status}
                        </span>
                      </div>
                    ))}
                    {executions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No executions yet. Start by running a workflow template.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};