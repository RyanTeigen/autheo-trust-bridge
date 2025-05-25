
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSmartForms, MedicalTerm } from '@/contexts/SmartFormsContext';
import { CheckCircle, AlertTriangle, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartInputProps {
  name: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type?: 'text' | 'multiselect';
  category: 'condition' | 'medication' | 'allergy' | 'procedure' | 'symptom';
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SmartInput: React.FC<SmartInputProps> = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  category,
  required = false,
  placeholder,
  className
}) => {
  const { getAutocompleteSuggestions, validateMedicalEntry } = useSmartForms();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<MedicalTerm[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : [];
  const textValue = Array.isArray(value) ? '' : value;

  useEffect(() => {
    if (inputValue.length >= 2) {
      const newSuggestions = getAutocompleteSuggestions(name, inputValue, category);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, name, category, getAutocompleteSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (type === 'text') {
      onChange(newValue);
      
      // Validate as user types
      if (newValue.length > 2) {
        const validation = validateMedicalEntry(newValue, category);
        setWarnings(validation.warnings);
      } else {
        setWarnings([]);
      }
    }
  };

  const handleSuggestionClick = (suggestion: MedicalTerm) => {
    if (type === 'multiselect') {
      if (!selectedValues.includes(suggestion.term)) {
        const newValues = [...selectedValues, suggestion.term];
        onChange(newValues);
        
        // Validate the new entry
        const validation = validateMedicalEntry(suggestion.term, category);
        if (validation.warnings.length > 0) {
          setWarnings([...warnings, ...validation.warnings]);
        }
      }
      setInputValue('');
    } else {
      onChange(suggestion.term);
      setInputValue(suggestion.term);
    }
    setShowSuggestions(false);
  };

  const handleAddCustomValue = () => {
    if (inputValue.trim() && type === 'multiselect') {
      if (!selectedValues.includes(inputValue.trim())) {
        const newValues = [...selectedValues, inputValue.trim()];
        onChange(newValues);
        
        // Validate custom entry
        const validation = validateMedicalEntry(inputValue.trim(), category);
        if (validation.warnings.length > 0) {
          setWarnings([...warnings, ...validation.warnings]);
        }
      }
      setInputValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(newValues);
    
    // Remove warnings related to this value
    setWarnings(warnings.filter(warning => !warning.includes(valueToRemove)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        handleSuggestionClick(suggestions[0]);
      } else if (type === 'multiselect' && inputValue.trim()) {
        handleAddCustomValue();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {warnings.length === 0 && (Array.isArray(value) ? value.length > 0 : value) && (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        {warnings.length > 0 && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </Label>

      {/* Selected values for multiselect */}
      {type === 'multiselect' && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map((selectedValue, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {selectedValue}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemoveValue(selectedValue)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          id={name}
          value={type === 'multiselect' ? inputValue : textValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          className={cn(
            warnings.length > 0 && "border-amber-500 focus-visible:ring-amber-500"
          )}
        />

        {/* Add button for multiselect */}
        {type === 'multiselect' && inputValue.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={handleAddCustomValue}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-slate-200">{suggestion.term}</div>
                {suggestion.description && (
                  <div className="text-xs text-slate-400">{suggestion.description}</div>
                )}
                {suggestion.icd10 && (
                  <div className="text-xs text-slate-500">ICD-10: {suggestion.icd10}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartInput;
