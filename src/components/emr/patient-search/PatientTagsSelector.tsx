
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PatientTagsSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  toggleTag: (tag: string) => void;
}

const PatientTagsSelector: React.FC<PatientTagsSelectorProps> = ({
  selectedTags,
  availableTags,
  toggleTag
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">Patient Tags</label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Badge 
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`cursor-pointer ${
              selectedTags.includes(tag) 
                ? 'bg-autheo-primary text-slate-900' 
                : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PatientTagsSelector;
