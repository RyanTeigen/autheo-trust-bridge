import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSharingPermissionsAPI } from '@/hooks/useSharingPermissionsAPI';

interface ShareRecordFormProps {
  recordId: string;
  recordTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ShareRecordForm: React.FC<ShareRecordFormProps> = ({
  recordId,
  recordTitle,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { createSharingPermission } = useSharingPermissionsAPI();
  
  const [formData, setFormData] = useState({
    granteeId: '',
    permissionType: 'read' as 'read' | 'write',
    expiresAt: undefined as Date | undefined
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.granteeId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a provider/user ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createSharingPermission({
        medicalRecordId: recordId,
        granteeId: formData.granteeId.trim(),
        permissionType: formData.permissionType,
        expiresAt: formData.expiresAt?.toISOString()
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Record "${recordTitle}" has been shared successfully`,
        });
        
        // Reset form
        setFormData({
          granteeId: '',
          permissionType: 'read',
          expiresAt: undefined
        });
        
        onSuccess?.();
      } else {
        // Handle error cases with proper type checking
        let errorMessage = "Failed to share record";
        
        // Check if result has an error property (union type handling)
        if ('error' in result && result.error) {
          errorMessage = typeof result.error === 'string' ? result.error : String(result.error);
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during sharing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Medical Record
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sharing: {recordTitle}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="granteeId">Provider/User ID</Label>
            <Input
              id="granteeId"
              type="text"
              placeholder="Enter provider or user ID"
              value={formData.granteeId}
              onChange={(e) => setFormData({ ...formData, granteeId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permissionType">Permission Type</Label>
            <Select
              value={formData.permissionType}
              onValueChange={(value: 'read' | 'write') => 
                setFormData({ ...formData, permissionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiresAt ? (
                    format(formData.expiresAt, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expiresAt}
                  onSelect={(date) => setFormData({ ...formData, expiresAt: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Sharing...' : 'Share Record'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShareRecordForm;
