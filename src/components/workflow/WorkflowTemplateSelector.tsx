import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowTemplate } from '@/types/workflow';
import { useWorkflow } from '@/hooks/useWorkflow';
import { 
  Search, 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  Plus,
  FileText,
  Users,
  Settings,
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTemplateSelectorProps {
  onSelect: (template: WorkflowTemplate) => void;
  onEdit: (template: WorkflowTemplate) => void;
  onExecute: (template: WorkflowTemplate) => void;
  selectedTemplateId?: string;
}

export const WorkflowTemplateSelector = ({
  onSelect,
  onEdit,
  onExecute,
  selectedTemplateId,
}: WorkflowTemplateSelectorProps) => {
  const { templates, loading, deleteTemplate } = useWorkflow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient-care': return <Users className="w-4 h-4" />;
      case 'administrative': return <FileText className="w-4 h-4" />;
      case 'diagnostic': return <AlertTriangle className="w-4 h-4" />;
      case 'compliance': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'patient-care': return 'bg-primary';
      case 'administrative': return 'bg-secondary';
      case 'diagnostic': return 'bg-warning';
      case 'compliance': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const handleDelete = async (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleCopy = async (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const copiedTemplate: WorkflowTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copy)`,
      metadata: {
        ...template.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    onEdit(copiedTemplate);
    toast.success('Template copied');
  };

  const handleExecute = (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onExecute(template);
  };

  const handleEdit = (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(template);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-xl font-semibold">Workflow Templates</h2>
        <Button onClick={() => onEdit({} as WorkflowTemplate)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="patient-care">Patient Care</TabsTrigger>
          <TabsTrigger value="administrative">Admin</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'No templates match your search.' : 'No templates available in this category.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => onEdit({} as WorkflowTemplate)}
                  className="mt-4 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={getCategoryColor(template.category)}>
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{template.nodes.length} nodes</span>
                      <span>{template.edges.length} connections</span>
                    </div>

                    {template.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.metadata.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.metadata.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.metadata.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => handleExecute(template, e)}
                        className="flex-1 gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleEdit(template, e)}
                        className="gap-1"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleCopy(template, e)}
                        className="gap-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDelete(template, e)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};