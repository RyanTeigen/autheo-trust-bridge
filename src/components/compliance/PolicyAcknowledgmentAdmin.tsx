import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAllPolicyAcknowledgments } from '@/hooks/usePolicyAcknowledgment';
import { Shield, Search, Download, Users, Calendar, Globe, Monitor } from 'lucide-react';
import { format } from 'date-fns';

const PolicyAcknowledgmentAdmin: React.FC = () => {
  const { acknowledgments, loading, refetch } = useAllPolicyAcknowledgments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('all');

  // Filter acknowledgments based on search term and version
  const filteredAcknowledgments = acknowledgments.filter(ack => {
    const matchesSearch = !searchTerm || 
      ack.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ack.user_agent?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVersion = selectedVersion === 'all' || ack.policy_version === selectedVersion;
    
    return matchesSearch && matchesVersion;
  });

  // Get unique policy versions
  const policyVersions = [...new Set(acknowledgments.map(ack => ack.policy_version))];

  const handleExportCsv = () => {
    const csvHeaders = [
      'User ID',
      'Policy Version', 
      'Acknowledged At',
      'IP Address',
      'User Agent',
      'Created At'
    ];

    const csvData = filteredAcknowledgments.map(ack => [
      ack.user_id,
      ack.policy_version,
      format(new Date(ack.acknowledged_at), 'yyyy-MM-dd HH:mm:ss'),
      ack.ip_address || 'N/A',
      ack.user_agent || 'N/A',
      format(new Date(ack.created_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-acknowledgments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getComplianceStats = () => {
    const totalUsers = new Set(acknowledgments.map(ack => ack.user_id)).size;
    const recentAcknowledgments = acknowledgments.filter(
      ack => new Date(ack.acknowledged_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      totalAcknowledgments: acknowledgments.length,
      uniqueUsers: totalUsers,
      recentAcknowledgments,
      currentVersion: policyVersions[0] || '1.0'
    };
  };

  const stats = getComplianceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
        <span className="ml-2 text-slate-400">Loading acknowledgments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-autheo-primary" />
            HIPAA Policy Acknowledgments
          </h2>
          <p className="text-slate-400 mt-1">
            Monitor and track policy acknowledgments for compliance auditing
          </p>
        </div>
        <Button onClick={refetch} variant="outline" className="bg-slate-800 border-slate-600">
          Refresh Data
        </Button>
      </div>

      {/* Compliance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm text-slate-400">Total Acknowledgments</p>
                <p className="text-2xl font-bold text-slate-100">{stats.totalAcknowledgments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-slate-400">Unique Users</p>
                <p className="text-2xl font-bold text-slate-100">{stats.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-sm text-slate-400">Last 30 Days</p>
                <p className="text-2xl font-bold text-slate-100">{stats.recentAcknowledgments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm text-slate-400">Current Version</p>
                <p className="text-2xl font-bold text-slate-100">{stats.currentVersion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user ID or user agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-slate-100 w-80"
                />
              </div>
              
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-slate-100 rounded-md px-3 py-2"
              >
                <option value="all">All Versions</option>
                {policyVersions.map(version => (
                  <option key={version} value={version}>Version {version}</option>
                ))}
              </select>
            </div>

            <Button 
              onClick={handleExportCsv}
              variant="outline" 
              className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Alert className="bg-slate-800 border-slate-700">
        <Shield className="h-4 w-4 text-autheo-primary" />
        <AlertDescription className="text-slate-300">
          Showing {filteredAcknowledgments.length} of {acknowledgments.length} policy acknowledgments.
          All data is automatically logged for HIPAA compliance auditing.
        </AlertDescription>
      </Alert>

      {/* Acknowledgments Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Policy Acknowledgment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">User ID</TableHead>
                  <TableHead className="text-slate-300">Policy Version</TableHead>
                  <TableHead className="text-slate-300">Acknowledged At</TableHead>
                  <TableHead className="text-slate-300">IP Address</TableHead>
                  <TableHead className="text-slate-300">User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAcknowledgments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                      No policy acknowledgments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAcknowledgments.map((acknowledgment) => (
                    <TableRow key={acknowledgment.id} className="border-slate-700">
                      <TableCell className="text-slate-300 font-mono text-xs">
                        {acknowledgment.user_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                          v{acknowledgment.policy_version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(acknowledgment.acknowledged_at), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          {acknowledgment.ip_address?.toString() || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs max-w-xs truncate">
                        <div className="flex items-center">
                          <Monitor className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{acknowledgment.user_agent || 'N/A'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyAcknowledgmentAdmin;