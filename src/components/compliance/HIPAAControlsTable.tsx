import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Filter, Edit } from 'lucide-react';
import { useHIPAACompliance } from '@/hooks/useHIPAACompliance';
import { HIPAAControl } from '@/services/compliance/HIPAAComplianceService';

const HIPAAControlsTable: React.FC = () => {
  const { controls, loading, updateControlStatus } = useHIPAACompliance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedControl, setSelectedControl] = useState<HIPAAControl | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: '',
    evidence: ''
  });

  const filteredControls = controls.filter(control => {
    const matchesSearch = 
      control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.control_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || control.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || control.implementation_status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'implemented': return 'default';
      case 'partially_implemented': return 'secondary';
      case 'not_implemented': return 'destructive';
      case 'not_applicable': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const handleEditControl = (control: HIPAAControl) => {
    setSelectedControl(control);
    setEditForm({
      status: control.implementation_status,
      notes: control.compliance_notes || '',
      evidence: control.current_evidence?.join('\n') || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveControl = async () => {
    if (!selectedControl) return;

    const evidenceArray = editForm.evidence
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    await updateControlStatus(
      selectedControl.id,
      editForm.status as HIPAAControl['implementation_status'],
      evidenceArray.length > 0 ? evidenceArray : undefined,
      editForm.notes || undefined
    );

    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 bg-muted rounded flex-1"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HIPAA Controls Management</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="partially_implemented">Partial</SelectItem>
              <SelectItem value="not_implemented">Not Implemented</SelectItem>
              <SelectItem value="not_applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredControls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {control.control_id}
                  </Badge>
                  <Badge variant={getRiskVariant(control.risk_level)}>
                    {control.risk_level}
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {control.category}
                  </span>
                </div>
                
                <h4 className="font-medium">{control.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {control.description}
                </p>
                
                {control.compliance_notes && (
                  <p className="text-xs text-muted-foreground italic">
                    Notes: {control.compliance_notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Badge variant={getStatusVariant(control.implementation_status)}>
                  {control.implementation_status.replace('_', ' ')}
                </Badge>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditControl(control)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredControls.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No controls found matching your criteria
            </p>
          )}
        </div>
      </CardContent>

      {/* Edit Control Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Control: {selectedControl?.control_id}
            </DialogTitle>
          </DialogHeader>

          {selectedControl && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedControl.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedControl.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Implementation Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_implemented">Not Implemented</SelectItem>
                      <SelectItem value="partially_implemented">Partially Implemented</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Compliance Notes</Label>
                  <Textarea
                    id="notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Add any compliance notes or comments..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="evidence">Evidence (one per line)</Label>
                  <Textarea
                    id="evidence"
                    value={editForm.evidence}
                    onChange={(e) => setEditForm({...editForm, evidence: e.target.value})}
                    placeholder="List evidence documents or references..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveControl}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HIPAAControlsTable;