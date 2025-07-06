import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Webhook, CheckCircle, AlertTriangle, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WebhookEvent {
  id: string;
  event_type: string;
  record_id: string;
  payload: any;
  webhook_url: string;
  response_status: number;
  response_body: string;
  sent_at: string;
  retry_count: number;
  success: boolean;
}

export default function WebhookEventsViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');

  const fetchWebhookEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('webhook_events')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }
      if (successFilter !== 'all') {
        query = query.eq('success', successFilter === 'true');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch webhook events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookEvents();
  }, [user, eventTypeFilter, successFilter]);

  const filteredEvents = events.filter(event =>
    searchTerm === '' ||
    event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.webhook_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventTypeColor = (eventType: string) => {
    const colorMap: Record<string, string> = {
      'anchoring_complete': 'bg-green-900/20 text-green-400 border-green-800',
      'anchoring_failed': 'bg-red-900/20 text-red-400 border-red-800',
      'record_created': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'record_updated': 'bg-purple-900/20 text-purple-400 border-purple-800',
    };
    return colorMap[eventType] || 'bg-slate-900/20 text-slate-400 border-slate-800';
  };

  const getStatusColor = (success: boolean, responseStatus: number) => {
    if (success && responseStatus >= 200 && responseStatus < 300) {
      return 'bg-green-900/20 text-green-400 border-green-800';
    }
    return 'bg-red-900/20 text-red-400 border-red-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Events
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="anchoring_complete">Anchoring Complete</SelectItem>
              <SelectItem value="anchoring_failed">Anchoring Failed</SelectItem>
              <SelectItem value="record_created">Record Created</SelectItem>
              <SelectItem value="record_updated">Record Updated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={successFilter} onValueChange={setSuccessFilter}>
            <SelectTrigger className="w-[120px] bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Success</SelectItem>
              <SelectItem value="false">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={fetchWebhookEvents}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-autheo-primary" />
              <span className="ml-2 text-slate-400">Loading webhook events...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Webhook className="h-6 w-6 mr-2" />
              No webhook events found
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-700/50">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-slate-700/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(event.success, event.response_status)}
                        >
                          {event.success ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {event.response_status}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {event.response_status || 'Failed'}
                            </div>
                          )}
                        </Badge>
                        {event.retry_count > 0 && (
                          <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                            Retry #{event.retry_count}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4 text-slate-300">
                          <span>Record: {event.record_id.substring(0, 8)}...</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(event.sent_at)}
                          </div>
                        </div>
                        
                        <div className="text-slate-400">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-md">{event.webhook_url}</span>
                          </div>
                        </div>
                        
                        {event.payload && Object.keys(event.payload).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                              View Payload
                            </summary>
                            <pre className="text-xs text-slate-400 mt-1 bg-slate-700/30 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </details>
                        )}
                        
                        {event.response_body && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                              View Response
                            </summary>
                            <pre className="text-xs text-slate-400 mt-1 bg-slate-700/30 p-2 rounded overflow-x-auto">
                              {event.response_body}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}