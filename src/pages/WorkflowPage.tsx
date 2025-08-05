import { useState } from 'react';
import { WorkflowDesigner } from '@/components/workflow/WorkflowDesigner';
import { WorkflowTemplateSelector } from '@/components/workflow/WorkflowTemplateSelector';
import { WorkflowTemplate } from '@/types/workflow';
import { useWorkflow } from '@/hooks/useWorkflow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const WorkflowPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { executeWorkflow } = useWorkflow();

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleExecuteTemplate = async (template: WorkflowTemplate) => {
    try {
      await executeWorkflow(template.id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleBackToSelector = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  if (selectedTemplate) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToSelector} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {isEditing ? 'Edit' : 'View'} Workflow: {selectedTemplate.name}
              </h1>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <WorkflowDesigner 
            templateId={selectedTemplate.id}
            readonly={!isEditing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <WorkflowTemplateSelector
        onSelect={handleSelectTemplate}
        onEdit={handleEditTemplate}
        onExecute={handleExecuteTemplate}
      />
    </div>
  );
};