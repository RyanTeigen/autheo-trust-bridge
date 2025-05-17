
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartBar, Pill, File, Syringe, TestTube } from 'lucide-react';

interface ShareHealthInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

const ShareHealthInfoDialog: React.FC<ShareHealthInfoDialogProps> = ({ 
  open, 
  onOpenChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-autheo-dark border-autheo-primary/20 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-autheo-primary">Share Health Information</DialogTitle>
          <DialogDescription className="text-slate-300">
            Share your health metrics, records, and allergies with your healthcare provider.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium text-autheo-primary">Select Healthcare Provider</h3>
            <Select defaultValue="dr-chen">
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="dr-chen">Dr. Emily Chen</SelectItem>
                <SelectItem value="dr-wilson">Dr. James Wilson</SelectItem>
                <SelectItem value="city-hospital">City Hospital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-autheo-primary">Information to Share</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="metrics" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="metrics" className="text-sm flex items-center gap-1 text-slate-200">
                  <ChartBar className="h-4 w-4 text-autheo-primary" /> Health Metrics
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="allergies" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="allergies" className="text-sm flex items-center gap-1 text-slate-200">
                  <Pill className="h-4 w-4 text-autheo-primary" /> Allergies
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="medications" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="medications" className="text-sm flex items-center gap-1 text-slate-200">
                  <Pill className="h-4 w-4 text-autheo-primary" /> Medications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="diagnoses" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="diagnoses" className="text-sm flex items-center gap-1 text-slate-200">
                  <File className="h-4 w-4 text-autheo-primary" /> Diagnoses
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="immunizations" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="immunizations" className="text-sm flex items-center gap-1 text-slate-200">
                  <Syringe className="h-4 w-4 text-autheo-primary" /> Immunizations
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="tests" defaultChecked className="accent-autheo-primary" />
                <label htmlFor="tests" className="text-sm flex items-center gap-1 text-slate-200">
                  <TestTube className="h-4 w-4 text-autheo-primary" /> Medical Tests
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-autheo-primary">Access Duration</h3>
            <Select defaultValue="30d">
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100">Cancel</Button>
          <Button onClick={onSubmit} className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark">Share Information</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareHealthInfoDialog;
