
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar } from '@/components/ui/calendar';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ShareFormValues {
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'caregiver';
  expiryDate?: Date;
  accessLevel: 'full' | 'limited' | 'read-only';
  recordTypes: string[];
}

interface ShareRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ShareFormValues) => void;
}

const ShareRecordsDialog: React.FC<ShareRecordsDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const form = useForm<ShareFormValues>({
    defaultValues: {
      recipientName: '',
      recipientType: 'provider',
      accessLevel: 'limited',
      recordTypes: ['medications', 'conditions']
    }
  });

  const handleSubmit = (values: ShareFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Health Records</DialogTitle>
          <DialogDescription>
            Grant access to your health records to a healthcare provider, organization, or personal caregiver.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Smith" {...field} required />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the person or organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recipientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="provider">Healthcare Provider</SelectItem>
                      <SelectItem value="organization">Healthcare Organization</SelectItem>
                      <SelectItem value="caregiver">Personal Caregiver</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Access Expiry Date (Optional)</FormLabel>
                  <div className="flex items-center gap-2 border rounded-md p-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className={cn(
                      "text-sm",
                      !field.value && "text-muted-foreground"
                    )}>
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        "Pick a date"
                      )}
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  <FormDescription>
                    Leave blank for indefinite access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level</FormLabel>
                  <FormControl>
                    <ToggleGroup 
                      type="single" 
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="read-only">Read Only</ToggleGroupItem>
                      <ToggleGroupItem value="limited">Limited</ToggleGroupItem>
                      <ToggleGroupItem value="full">Full Access</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormDescription>
                    Control how much information is shared
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recordTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Types to Share</FormLabel>
                  <FormControl>
                    <ToggleGroup 
                      type="multiple" 
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-wrap justify-start"
                    >
                      <ToggleGroupItem value="medications">Medications</ToggleGroupItem>
                      <ToggleGroupItem value="conditions">Conditions</ToggleGroupItem>
                      <ToggleGroupItem value="labs">Lab Results</ToggleGroupItem>
                      <ToggleGroupItem value="imaging">Imaging</ToggleGroupItem>
                      <ToggleGroupItem value="notes">Doctor Notes</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormDescription>
                    Select which types of records to share
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Share Records</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareRecordsDialog;
