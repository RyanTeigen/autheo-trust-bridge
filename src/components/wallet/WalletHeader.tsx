
import React, { useState } from 'react';
import { Wallet, Shield, Users, FileText, ChevronRight, CreditCard, FileCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface WalletHeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onSearchChange?: (query: string) => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  activeSection = 'records',
  onSectionChange,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const sections = [
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'insurance', label: 'Insurance', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: FileCheck },
    { id: 'shared', label: 'Shared', icon: Users, route: '/shared-records' },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  
  const handleNavigate = (section: string, route?: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
    
    if (route) {
      navigate(route);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
          <Wallet className="h-6 w-6 text-autheo-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5 text-white">Smart Wallet</h1>
          <p className="text-muted-foreground text-sm">
            Control and manage access to your health records with quantum-resistant encryption
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            size="sm"
            className={`flex items-center gap-1.5 py-1 h-auto ${activeSection === section.id ? 'bg-autheo-primary text-white' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            onClick={() => handleNavigate(section.id, section.route)}
          >
            <section.icon className="h-3.5 w-3.5" />
            {section.label}
            {section.route && <ChevronRight className="h-3.5 w-3.5 ml-0.5" />}
          </Button>
        ))}
      </div>

      {onSearchChange && (
        <div className="relative mt-3 mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search records..."
            className="pl-9 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      )}
      
      <div className="text-xs text-slate-500 flex items-center">
        <span className="font-medium">Current view:</span>
        <span className="mx-1.5">/</span>
        <span className="text-autheo-primary">
          {activeSection === 'records' ? 'Health Records' : 
           activeSection === 'insurance' ? 'Insurance Information' : 
           activeSection === 'payments' ? 'Payment Contracts' : 
           activeSection === 'shared' ? 'Shared Records' : 
           'Security Settings'}
        </span>
      </div>
    </div>
  );
};

export default WalletHeader;
