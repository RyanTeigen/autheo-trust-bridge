
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, FileText, Heart, Shield, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface EducationResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide' | 'tool';
  category: string;
  description: string;
  readTime?: string;
  thumbnail?: string;
  relevance: 'recommended' | 'general' | 'condition';
  condition?: string;
}

const mockEducationResources: EducationResource[] = [
  {
    id: '1',
    title: 'Understanding Hypertension: Causes and Management',
    type: 'article',
    category: 'Cardiovascular',
    description: 'Learn about the causes of high blood pressure and strategies to manage it effectively through lifestyle changes and medication.',
    readTime: '5 min',
    relevance: 'condition',
    condition: 'Hypertension'
  },
  {
    id: '2',
    title: 'The Importance of Medication Adherence',
    type: 'guide',
    category: 'Medication',
    description: 'Discover why taking your medications as prescribed is crucial for managing chronic conditions and maintaining your health.',
    readTime: '7 min',
    relevance: 'recommended'
  },
  {
    id: '3',
    title: 'How to Read Nutrition Labels',
    type: 'video',
    category: 'Nutrition',
    description: 'A step-by-step visual guide to understanding nutrition labels and making healthier food choices.',
    readTime: '4 min video',
    relevance: 'general'
  },
  {
    id: '4',
    title: 'Diabetes Management: Blood Sugar Monitoring',
    type: 'tool',
    category: 'Diabetes',
    description: 'Interactive tool to help track and understand your blood glucose readings and identify patterns.',
    relevance: 'condition',
    condition: 'Diabetes'
  },
  {
    id: '5',
    title: 'Exercise Recommendations for Heart Health',
    type: 'guide',
    category: 'Fitness',
    description: 'Safe and effective exercise recommendations for improving cardiovascular health and reducing risk factors.',
    readTime: '10 min',
    relevance: 'recommended'
  },
  {
    id: '6',
    title: 'Understanding Your Lab Results',
    type: 'article',
    category: 'Medical Tests',
    description: 'Learn how to interpret common laboratory test results and what different values mean for your health.',
    readTime: '8 min',
    relevance: 'general'
  }
];

const PatientEducationCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter resources based on search and category
  const filteredResources = mockEducationResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || 
      resource.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'recommended' && resource.relevance === 'recommended');
      
    return matchesSearch && matchesCategory;
  });
  
  // Extract unique categories for the filter
  const categories = ['all', 'recommended', ...Array.from(new Set(mockEducationResources.map(r => r.category.toLowerCase())))];
  
  // Helper function to render the appropriate icon for each resource type
  const getResourceTypeIcon = (type: EducationResource['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 text-autheo-primary" />;
      case 'video':
        return <Video className="h-4 w-4 text-autheo-primary" />;
      case 'guide':
        return <BookOpen className="h-4 w-4 text-autheo-primary" />;
      case 'tool':
        return <Shield className="h-4 w-4 text-autheo-primary" />;
      default:
        return <FileText className="h-4 w-4 text-autheo-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-autheo-primary flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Patient Education Center
              </CardTitle>
              <CardDescription className="text-slate-300">
                Personalized health resources to help you understand and manage your health
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search health topics, conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/50 border-slate-700 text-slate-100 focus-visible:ring-autheo-primary"
              />
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-900/50 border border-slate-700 text-slate-100 focus:ring-autheo-primary focus:border-autheo-primary"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-slate-900/50 border-slate-700 mb-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                All Resources
              </TabsTrigger>
              <TabsTrigger value="recommended" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                Recommended
              </TabsTrigger>
              <TabsTrigger value="conditions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-autheo-primary">
                My Conditions
              </TabsTrigger>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <Card key={resource.id} className="bg-slate-900/50 border-slate-700 hover:border-autheo-primary/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getResourceTypeIcon(resource.type)}
                        <Badge variant="outline" className="bg-slate-800 text-autheo-primary border-autheo-primary/30">
                          {resource.category}
                        </Badge>
                        {resource.relevance === 'recommended' && (
                          <Badge className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2 text-autheo-primary">{resource.title}</h3>
                      <p className="text-sm text-slate-300 mb-4">{resource.description}</p>
                      
                      <div className="flex items-center justify-between">
                        {resource.readTime && (
                          <span className="text-xs text-slate-400">{resource.readTime}</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-autheo-primary hover:bg-slate-800 hover:text-autheo-primary/80"
                        >
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-slate-900/30 rounded-md">
                  <p className="text-slate-300">No resources found matching your search criteria.</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-slate-700/20 border-t border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-400">Resources are updated regularly based on your health profile.</p>
          <Button variant="outline" size="sm" className="text-autheo-primary border-slate-700 hover:bg-slate-800">
            Request Topic
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientEducationCenter;
