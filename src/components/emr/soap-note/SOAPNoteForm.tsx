import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, Stethoscope } from 'lucide-react';
import { soapNoteFormSchema, SOAPNoteFormValues } from './types';

interface SOAPNoteFormProps {
  onSubmit: (data: SOAPNoteFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SOAPNoteForm: React.FC<SOAPNoteFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const form = useForm<SOAPNoteFormValues>({
    resolver: zodResolver(soapNoteFormSchema),
    defaultValues: {
      patientId: '',
      patientName: '',
      visitDate: new Date().toISOString().split('T')[0],
      providerName: '',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      shareWithPatient: false,
      temporaryAccess: true,
      accessDuration: 30,
    },
  });

  const handleSubmit = (values: SOAPNoteFormValues) => {
    onSubmit(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Stethoscope className="h-5 w-5" />
        SOAP Note Documentation
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* SOAP Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                SOAP Documentation
              </CardTitle>
              <CardDescription>
                Document the patient encounter using the SOAP format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="subjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Subjective (Patient's reported symptoms/concerns)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Patient reports... Chief complaint, history of present illness, review of systems..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Objective (Observable findings)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vital signs, physical examination findings, lab results, diagnostic tests..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Assessment (Clinical impression/diagnosis)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Primary diagnosis, differential diagnoses, clinical reasoning..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Plan (Treatment plan/next steps)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Treatment plan, medications, follow-up instructions, referrals..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sharing Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sharing & Access Options</CardTitle>
              <CardDescription>
                Configure how this note is shared with the patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="shareWithPatient"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Share with Patient</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Allow patient to view this SOAP note
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('shareWithPatient') && (
                <>
                  <FormField
                    control={form.control}
                    name="temporaryAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Temporary Access</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Limit access duration for enhanced security
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('temporaryAccess') && (
                    <FormField
                      control={form.control}
                      name="accessDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Duration (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Note...' : 'Create SOAP Note'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SOAPNoteForm;