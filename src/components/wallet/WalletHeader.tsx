
import React, { useState } from 'react';
import { Wallet, Shield, Users, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WalletHeader: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('records');
  
  const sections = [
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'shared', label: 'Shared', icon: Users, route: '/shared-records' },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  
  const handleNavigate = (section: string, route?: string) => {
    setActiveSection(section);
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
          <Wallet className="h-6 w-6 text-autheo-dark" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-gradient-primary bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Smart Wallet</h1>
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
            className={`flex items-center gap-1.5 py-1 h-auto ${activeSection === section.id ? 'bg-autheo-primary text-white' : 'border-slate-200 hover:bg-slate-50'}`}
            onClick={() => handleNavigate(section.id, section.route)}
          >
            <section.icon className="h-3.5 w-3.5" />
            {section.label}
            {section.route && <ChevronRight className="h-3.5 w-3.5 ml-0.5" />}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-slate-500 flex items-center">
        <span className="font-medium">Current view:</span>
        <span className="mx-1.5">/</span>
        <span className="text-autheo-primary">Health Records</span>
      </div>
    </div>
  );
};

export default WalletHeader;
