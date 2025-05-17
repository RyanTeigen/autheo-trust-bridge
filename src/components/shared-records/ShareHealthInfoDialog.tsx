
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartBar, Pill, File, Syringe, TestTube } from 'lucide-react';

interface ShareHealthInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: () => void;
}

const ShareHealthInfoDialog: React.FC<ShareHealthInfoDialogProps> = ({ 
  open, 
  onOpenChange, 
  onShare
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Health Information</DialogTitle>
          <DialogDescription>
            Share your health metrics, records, and allergies with your healthcare provider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Select Healthcare Provider</h3>
            <Select defaultValue="dr-chen">
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr-chen">Dr. Emily Chen</SelectItem>
                <SelectItem value="dr-wilson">Dr. James Wilson</SelectItem>
                <SelectItem value="city-hospital">City Hospital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Information to Share</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="metrics" defaultChecked />
                <label htmlFor="metrics" className="text-sm flex items-center gap-1">
                  <ChartBar className="h-4 w-4" /> Health Metrics
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="allergies" defaultChecked />
                <label htmlFor="allergies" className="text-sm flex items-center gap-1">
                  <Pill className="h-4 w-4" /> Allergies
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="medications" defaultChecked />
                <label htmlFor="medications" className="text-sm flex items-center gap-1">
                  <Pill className="h-4 w-4" /> Medications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="diagnoses" defaultChecked />
                <label htmlFor="diagnoses" className="text-sm flex items-center gap-1">
                  <File className="h-4 w-4" /> Diagnoses
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="immunizations" defaultChecked />
                <label htmlFor="immunizations" className="text-sm flex items-center gap-1">
                  <Syringe className="h-4 w-4" /> Immunizations
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="tests" defaultChecked />
                <label htmlFor="tests" className="text-sm flex items-center gap-1">
                  <TestTube className="h-4 w-4" /> Medical Tests
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Access Duration</h3>
            <Select defaultValue="30d">
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onShare}>Share Information</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareHealthInfoDialog;
