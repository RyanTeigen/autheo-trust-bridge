
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSmartForms, FormTemplate } from '@/contexts/SmartFormsContext';
import SmartInput from './SmartInput';
import { Save, RotateCcw, CheckCircle, Clock } from 'lucide-react';

interface SmartFormProps {
  category: string;
  title: string;
  description?: string;
  onSubmit: (data: any) => void;
  className?: string;
}

const SmartForm: React.FC<SmartFormProps> = ({
  category,
  title,
  description,
  onSubmit,
  className
}) => {
  const { toast } = useToast();
  const { getFormTemplate, saveFormProgress, getFormProgress, patientHistory } = useSmartForms();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm({
    defaultValues: {},
    mode: 'onChange'
  });

  const formId = `smart_form_${category}`;

  useEffect(() => {
    // Get appropriate template based on patient conditions
    const selectedTemplate = getFormTemplate(category, patientHistory.conditions);
    setTemplate(selectedTemplate);

    if (selectedTemplate) {
      // Load saved progress
      const savedData = getFormProgress(formId);
      if (savedData) {
        form.reset(savedData);
        setLastSaved(new Date());
        toast({
          title: "Form Progress Restored",
          description: "Your previous progress has been loaded.",
        });
      } else {
        // Pre-fill with patient history where applicable
        const defaultValues: any = {};
        selectedTemplate.fields.forEach(field => {
          if (field.name === 'currentMedications') {
            defaultValues[field.name] = patientHistory.medications;
          } else if (field.name === 'allergies') {
            defaultValues[field.name] = patientHistory.allergies;
          } else if (field.name === 'medicalHistory') {
            defaultValues[field.name] = patientHistory.conditions;
          }
        });
        
        if (Object.keys(defaultValues).length > 0) {
          form.reset(defaultValues);
        }
      }
    }
  }, [category, patientHistory]);

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((data) => {
      setAutoSaveStatus('saving');
      
      const timer = setTimeout(() => {
        saveFormProgress(formId, data);
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      }, 1000);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleSubmit = (data: any) => {
    // Clear saved progress on successful submit
    localStorage.removeItem(`form_progress_${formId}`);
    
    toast({
      title: "Form Submitted",
      description: "Your information has been saved successfully.",
    });
    
    onSubmit(data);
  };

  const handleReset = () => {
    form.reset();
    localStorage.removeItem(`form_progress_${formId}`);
    setLastSaved(null);
    toast({
      title: "Form Reset",
      description: "All form data has been cleared.",
    });
  };

  if (!template) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-slate-400">
            No template found for category: {category}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case 'multiselect':
        return (
          <SmartInput
            name={field.name}
            label={field.label}
            value={form.watch(field.name) || []}
            onChange={(value) => form.setValue(field.name, value)}
            type="multiselect"
            category={getCategoryFromFieldName(field.name)}
            required={field.required}
          />
        );

      case 'text':
        if (isMedicalField(field.name)) {
          return (
            <SmartInput
              name={field.name}
              label={field.label}
              value={form.watch(field.name) || ''}
              onChange={(value) => form.setValue(field.name, value)}
              type="text"
              category={getCategoryFromFieldName(field.name)}
              required={field.required}
            />
          );
        } else {
          return <Input placeholder={`Enter ${field.label.toLowerCase()}...`} {...form.register(field.name)} />;
        }

      case 'select':
        return (
          <Select onValueChange={(value) => form.setValue(field.name, value)} value={form.watch(field.name)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            min={field.validation?.min}
            max={field.validation?.max}
            {...form.register(field.name, {
              valueAsNumber: true,
              min: field.validation?.min,
              max: field.validation?.max
            })}
          />
        );

      case 'date':
        return <Input type="date" {...form.register(field.name)} />;

      default:
        return <Input {...form.register(field.name)} />;
    }
  };

  const getCategoryFromFieldName = (fieldName: string): 'condition' | 'medication' | 'allergy' | 'procedure' | 'symptom' => {
    if (fieldName.includes('medication') || fieldName.includes('drug')) return 'medication';
    if (fieldName.includes('allerg')) return 'allergy';
    if (fieldName.includes('procedure') || fieldName.includes('surgery')) return 'procedure';
    if (fieldName.includes('symptom') || fieldName.includes('complaint')) return 'symptom';
    return 'condition';
  };

  const isMedicalField = (fieldName: string): boolean => {
    const medicalFields = ['chiefComplaint', 'currentMedications', 'allergies', 'medicalHistory', 'symptoms'];
    return medicalFields.includes(fieldName);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-autheo-primary">{title}</CardTitle>
            {description && (
              <CardDescription className="text-slate-300">{description}</CardDescription>
            )}
            <div className="text-sm text-slate-400 mt-1">
              Template: {template.name}
            </div>
          </div>
          
          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {autoSaveStatus === 'saving' && (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Saving...
              </>
            )}
            {autoSaveStatus === 'saved' && lastSaved && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {template.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                rules={{ required: field.required }}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormControl>
                      {renderField(field)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Form
              </Button>
              
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SmartForm;
