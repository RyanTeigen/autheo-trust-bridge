import { useState } from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WorkflowPropertiesPanelProps {
  node: Node;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export const WorkflowPropertiesPanel = ({ 
  node, 
  onClose, 
  onUpdateNode 
}: WorkflowPropertiesPanelProps) => {
  const [localData, setLocalData] = useState(node.data);

  const handleSave = () => {
    onUpdateNode(node.id, localData);
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const addToArray = (field: string, value: string) => {
    if (!value.trim()) return;
    setLocalData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
  };

  const removeFromArray = (field: string, index: number) => {
    setLocalData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case 'patientIntake':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={(localData.patientName as string) || ''}
                onChange={(e) => updateField('patientName', e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intakeStatus">Intake Status</Label>
              <Select
                value={(localData.intakeStatus as string) || 'pending'}
                onValueChange={(value) => updateField('intakeStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Required Forms</Label>
              <ArrayEditor
                items={(localData.requiredForms as string[]) || []}
                onAdd={(value) => addToArray('requiredForms', value)}
                onRemove={(index) => removeFromArray('requiredForms', index)}
                placeholder="Add required form"
              />
            </div>

            <div className="space-y-2">
              <Label>Completed Forms</Label>
              <ArrayEditor
                items={(localData.completedForms as string[]) || []}
                onAdd={(value) => addToArray('completedForms', value)}
                onRemove={(index) => removeFromArray('completedForms', index)}
                placeholder="Add completed form"
              />
            </div>
          </>
        );

      case 'soapNote':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={(localData.patientName as string) || ''}
                onChange={(e) => updateField('patientName', e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerName">Provider Name</Label>
              <Input
                id="providerName"
                value={(localData.providerName as string) || ''}
                onChange={(e) => updateField('providerName', e.target.value)}
                placeholder="Enter provider name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={(localData.status as string) || 'draft'}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sections</Label>
              <div className="space-y-2">
                {Object.entries(localData.sections || {}).map(([section, completed]) => (
                  <div key={section} className="flex items-center justify-between">
                    <Label className="capitalize">{section}</Label>
                    <Switch
                      checked={completed as boolean}
                      onCheckedChange={(checked) => updateNestedField('sections', section, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case 'decision':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={(localData.condition as string) || ''}
                onChange={(e) => updateField('condition', e.target.value)}
                placeholder="Enter decision condition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={(localData.description as string) || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={(localData.type as string) || 'manual'}
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={(localData.priority as string) || 'medium'}
                onValueChange={(value) => updateField('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Criteria</Label>
              <ArrayEditor
                items={(localData.criteria as string[]) || []}
                onAdd={(value) => addToArray('criteria', value)}
                onRemove={(index) => removeFromArray('criteria', index)}
                placeholder="Add criteria"
              />
            </div>
          </>
        );

      case 'notification':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={(localData.type as string) || 'in-app'}
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="in-app">In-App</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={(localData.subject as string) || ''}
                onChange={(e) => updateField('subject', e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={(localData.priority as string) || 'medium'}
                onValueChange={(value) => updateField('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <ArrayEditor
                items={(localData.recipients as string[]) || []}
                onAdd={(value) => addToArray('recipients', value)}
                onRemove={(index) => removeFromArray('recipients', index)}
                placeholder="Add recipient"
              />
            </div>
          </>
        );

      default:
        return <p className="text-sm text-muted-foreground">No properties available</p>;
    }
  };

  return (
    <Card className="w-80 h-full border-l-0 rounded-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Node Properties</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{node.type}</Badge>
          <span className="text-sm text-muted-foreground">ID: {node.id}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderNodeSpecificFields()}
        
        <Separator />
        
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface ArrayEditorProps {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

const ArrayEditor = ({ items, onAdd, onRemove, placeholder }: ArrayEditorProps) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newItem.trim()}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-sm">
              <span className="flex-1 text-sm">{item}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(index)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};