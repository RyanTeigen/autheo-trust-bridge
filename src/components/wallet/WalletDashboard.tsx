
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { 
  Wallet, 
  Shield, 
  Users, 
  FileText, 
  CreditCard, 
  FileCheck, 
  Search, 
  PiggyBank, 
  Receipt, 
  WalletCards, 
  BadgeDollarSign,
  CircleDollarSign,
  ArrowRightLeft
} from 'lucide-react';

import WalletOverview from './WalletOverview';
import HealthRecordsList from './HealthRecordsList';
import InsuranceInterface from './insurance/InsuranceInterface';
import InsuranceCard from './InsuranceCard';
import DistributedStorage from '@/components/decentralized/DistributedStorage';
import SmartContracts from '@/components/decentralized/SmartContracts';

interface WalletDashboardProps {
  onSectionChange?: (section: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onSectionChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecordsByFilter, toggleRecordSharing } = useHealthRecords();
  
  const [activeSection, setActiveSection] = useState('records');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRecordsTab, setActiveRecordsTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [balance, setBalance] = useState(100);
  
  const sections = [
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'insurance', label: 'Insurance', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: FileCheck },
    { id: 'shared', label: 'Shared', icon: Users, route: '/shared-records' },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  
  const handleNavigate = (section: string, route?: string) => {
    setActiveSection(section);
    
    if (onSectionChange) {
      onSectionChange(section);
    }
    
    if (route) {
      navigate(route);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };
  
  const handleTransactionDemo = () => {
    toast({
      title: "Transaction Processing",
      description: "Demonstrating secure blockchain transaction...",
    });
    
    setTimeout(() => {
      toast({
        title: "Transaction Complete",
        description: "5 Autheo coins transferred successfully.",
      });
      setBalance(prev => prev - 5);
    }, 1500);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-autheo-primary to-autheo-secondary p-2.5 rounded-lg shadow-md">
            <Wallet className="h-6 w-6 text-autheo-dark" />
          </div>
          <div>
            <CardTitle className="text-autheo-primary">Smart Wallet</CardTitle>
            <CardDescription className="text-slate-300">
              Control and manage your health finance and blockchain assets in one place
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="space-y-6">
          {/* Header Section with Navigation */}
          <div className="flex flex-col space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                </Button>
              ))}
            </div>

            {activeSection === 'records' && (
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search records..."
                  className="pl-9 pr-4 py-2 w-full bg-slate-800 border-slate-700"
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
          
          {/* Main Content Tabs */}
          {activeSection === 'records' && (
            <Tabs defaultValue="all" value={activeRecordsTab} onValueChange={setActiveRecordsTab}>
              <TabsList className="grid grid-cols-4 mb-4 bg-slate-800 border border-slate-700">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
                >
                  All Records
                </TabsTrigger>
                <TabsTrigger 
                  value="shared" 
                  className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
                >
                  Shared
                </TabsTrigger>
                <TabsTrigger 
                  value="private" 
                  className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
                >
                  Private
                </TabsTrigger>
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
                >
                  Recent
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <HealthRecordsList 
                  filter="all" 
                  onToggleShare={handleToggleShare} 
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>
              
              <TabsContent value="shared" className="mt-0">
                <HealthRecordsList 
                  filter="shared" 
                  onToggleShare={handleToggleShare}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>
              
              <TabsContent value="private" className="mt-0">
                <HealthRecordsList 
                  filter="private" 
                  onToggleShare={handleToggleShare}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>
              
              <TabsContent value="recent" className="mt-0">
                <HealthRecordsList 
                  filter="recent" 
                  onToggleShare={handleToggleShare}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {/* Overview, Insurance, Blockchain, Currency Tabs */}
          {(activeSection === 'insurance' || activeSection === 'payments' || activeSection === 'security') && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-700 dark:bg-slate-700 mb-6">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <PiggyBank className="h-4 w-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="insurance"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <Receipt className="h-4 w-4 mr-2" /> Insurance
                </TabsTrigger>
                <TabsTrigger 
                  value="blockchain"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <WalletCards className="h-4 w-4 mr-2" /> Blockchain
                </TabsTrigger>
                <TabsTrigger 
                  value="currency"
                  className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary"
                >
                  <BadgeDollarSign className="h-4 w-4 mr-2" /> Autheo Coin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-800/50 border-slate-700/50 col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-300">Autheo Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="mr-4 bg-autheo-primary/20 p-3 rounded-full">
                          <CircleDollarSign className="h-6 w-6 text-autheo-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-autheo-primary">{balance}</div>
                          <div className="text-xs text-slate-400">Autheo Coins</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-xs"
                          onClick={handleTransactionDemo}
                        >
                          <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-slate-700 text-xs hover:bg-slate-700/50"
                        >
                          <PiggyBank className="h-3 w-3 mr-1" /> Add Funds
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <WalletOverview />
              </TabsContent>
              
              <TabsContent value="insurance">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <InsuranceInterface />
                  </div>
                  <div className="lg:col-span-1">
                    <InsuranceCard />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="blockchain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DistributedStorage />
                  <div className="flex flex-col space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700/50 text-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-autheo-primary">Data Integrity</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs">
                        Your medical data checksums are verified every 24 hours to ensure integrity and detect tampering.
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="currency">
                <SmartContracts />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDashboard;
