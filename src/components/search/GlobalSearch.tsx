
import React, { useState } from 'react';
import { Search, X, FileText, Heart, Calendar, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'records' | 'appointments' | 'medications' | 'providers' | 'notes';
  url?: string;
}

// Mock search results
const mockResults: SearchResult[] = [
  {
    id: 'rec1',
    title: 'Blood Test Results',
    description: 'Lab results from May 15, 2025',
    category: 'records',
    url: '/wallet'
  },
  {
    id: 'rec2',
    title: 'X-Ray Report',
    description: 'Chest X-Ray from April 3, 2025',
    category: 'records',
    url: '/wallet'
  },
  {
    id: 'apt1',
    title: 'Dr. Johnson Appointment',
    description: 'May 25, 2025 at 10:30 AM',
    category: 'appointments',
    url: '/scheduling'
  },
  {
    id: 'med1',
    title: 'Lisinopril',
    description: '10mg, once daily',
    category: 'medications'
  },
  {
    id: 'prov1',
    title: 'Dr. Sarah Johnson',
    description: 'Primary Care Physician',
    category: 'providers',
    url: '/provider-portal'
  },
  {
    id: 'note1',
    title: 'Follow-up Notes',
    description: 'From your last visit on April 15, 2025',
    category: 'notes',
    url: '/medical-notes'
  }
];

interface GlobalSearchProps {
  className?: string;
  buttonVariant?: "default" | "outline" | "ghost";
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  className,
  buttonVariant = "outline" 
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    if (result.url) {
      navigate(result.url);
    }
  };

  const getCategoryIcon = (category: SearchResult['category']) => {
    switch(category) {
      case 'records': return <Heart className="mr-2 h-4 w-4 text-autheo-primary" />;
      case 'appointments': return <Calendar className="mr-2 h-4 w-4 text-blue-500" />;
      case 'medications': return <Clock className="mr-2 h-4 w-4 text-green-500" />;
      case 'providers': return <User className="mr-2 h-4 w-4 text-violet-500" />;
      case 'notes': return <FileText className="mr-2 h-4 w-4 text-amber-500" />;
    }
  };

  // Filter results based on search query
  const filteredResults = searchQuery 
    ? mockResults.filter(
        result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockResults;

  // Group results by category
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<SearchResult['category'], SearchResult[]>);

  // For keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant={buttonVariant}
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        Search...
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-300 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for records, appointments, medications..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(groupedResults).map(([category, items]) => (
            <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
              {items.map(item => (
                <CommandItem 
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="flex items-start py-2"
                >
                  {getCategoryIcon(item.category)}
                  <div>
                    <p>{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
