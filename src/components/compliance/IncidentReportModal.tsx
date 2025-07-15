import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

export default function IncidentReportModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type) {
      toast({
        title: "Validation Error",
        description: "Incident type is required",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to report incidents",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('report_security_incident', {
        body: {
          type,
          description,
          date,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Incident Reported",
        description: "Your security incident has been reported successfully. Our compliance team will review it.",
      });

      // Reset form
      setType('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setOpen(false);

    } catch (error) {
      console.error('Error reporting incident:', error);
      toast({
        title: "Report Failed",
        description: error instanceof Error ? error.message : 'Failed to report incident. Please try again.',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report Security Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Security Incident
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="incident-type">Type of Incident *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unauthorized Access">Unauthorized Access</SelectItem>
                <SelectItem value="Data Breach">Data Breach</SelectItem>
                <SelectItem value="Malware/Ransomware">Malware/Ransomware</SelectItem>
                <SelectItem value="Lost Device">Lost Device</SelectItem>
                <SelectItem value="Phishing Attack">Phishing Attack</SelectItem>
                <SelectItem value="System Compromise">System Compromise</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident-date">Date of Incident *</Label>
            <Input
              id="incident-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about what happened, when it occurred, and any potential impact..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !type}
              className="bg-destructive hover:bg-destructive/90"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}