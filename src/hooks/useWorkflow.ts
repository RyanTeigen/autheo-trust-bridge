import { useState, useEffect, useCallback } from 'react';
import { WorkflowTemplate, WorkflowExecution } from '@/types/workflow';
import { WorkflowService } from '@/services/WorkflowService';
import { toast } from 'sonner';

export const useWorkflow = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTemplates = await WorkflowService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load executions
  const loadExecutions = useCallback(async () => {
    try {
      const loadedExecutions = await WorkflowService.getExecutions();
      setExecutions(loadedExecutions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load executions';
      toast.error(errorMessage);
    }
  }, []);

  // Create or update template
  const saveTemplate = useCallback(async (template: WorkflowTemplate) => {
    try {
      setError(null);
      
      // Validate template
      const validation = WorkflowService.validateTemplate(template);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      await WorkflowService.saveTemplate(template);
      await loadTemplates(); // Refresh templates
      toast.success('Template saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [loadTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      setError(null);
      await WorkflowService.deleteTemplate(templateId);
      await loadTemplates(); // Refresh templates
      toast.success('Template deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [loadTemplates]);

  // Execute workflow
  const executeWorkflow = useCallback(async (templateId: string, variables: Record<string, any> = {}) => {
    try {
      setError(null);
      const execution = await WorkflowService.executeWorkflow(templateId, variables);
      await loadExecutions(); // Refresh executions
      toast.success('Workflow execution started');
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute workflow';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [loadExecutions]);

  // Get template by ID
  const getTemplate = useCallback(async (templateId: string): Promise<WorkflowTemplate | null> => {
    try {
      return await WorkflowService.getTemplate(templateId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get template';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback(async (category: string): Promise<WorkflowTemplate[]> => {
    try {
      return await WorkflowService.getTemplatesByCategory(category);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get templates by category';
      toast.error(errorMessage);
      return [];
    }
  }, []);

  // Get execution by ID
  const getExecution = useCallback(async (executionId: string): Promise<WorkflowExecution | null> => {
    try {
      return await WorkflowService.getExecution(executionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get execution';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Integrate with SmartForms
  const integrateWithSmartForms = useCallback(async (templateId: string, formData: any) => {
    try {
      await WorkflowService.integrateWithSmartForms(templateId, formData);
      await loadTemplates(); // Refresh templates
      toast.success('Integration with SmartForms completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to integrate with SmartForms';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadTemplates]);

  // Load data on mount
  useEffect(() => {
    loadTemplates();
    loadExecutions();
  }, [loadTemplates, loadExecutions]);

  return {
    // State
    templates,
    executions,
    loading,
    error,

    // Actions
    loadTemplates,
    loadExecutions,
    saveTemplate,
    deleteTemplate,
    executeWorkflow,
    getTemplate,
    getTemplatesByCategory,
    getExecution,
    integrateWithSmartForms,

    // Utilities
    validateTemplate: WorkflowService.validateTemplate,
  };
};