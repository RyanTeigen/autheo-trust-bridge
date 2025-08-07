import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowExecution } from '@/types/workflow';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface WorkflowExecutionPanelProps {
  execution?: WorkflowExecution;
  onExecute: () => void;
  onPause: () => void;
  onStop: () => void;
  onResume: () => void;
  className?: string;
}

export const WorkflowExecutionPanel = ({
  execution,
  onExecute,
  onPause,
  onStop,
  onResume,
  className
}: WorkflowExecutionPanelProps) => {
  const [showLogs, setShowLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!execution) return 0;
    if (execution.status === 'completed') return 100;
    if (execution.status === 'failed') return 0;
    
    // Mock progress calculation based on execution time
    const startTime = new Date(execution.startedAt).getTime();
    const now = new Date().getTime();
    const elapsed = now - startTime;
    const estimatedTotal = 30000; // 30 seconds estimated
    return Math.min((elapsed / estimatedTotal) * 100, 90);
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    return `${Math.floor(duration / 1000)}s`;
  };

  // Mock execution logs
  const executionLogs = [
    { timestamp: '10:30:01', level: 'info', message: 'Workflow execution started' },
    { timestamp: '10:30:02', level: 'info', message: 'Patient intake node processing...' },
    { timestamp: '10:30:05', level: 'success', message: 'Patient forms validated successfully' },
    { timestamp: '10:30:06', level: 'info', message: 'Decision node evaluating criteria...' },
    { timestamp: '10:30:08', level: 'warning', message: 'Missing insurance verification' },
    { timestamp: '10:30:10', level: 'info', message: 'Notification sent to provider' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Workflow Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {execution ? (
          <>
            {/* Status and Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(execution.status)}
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  ID: {execution.id.slice(0, 8)}...
                </span>
              </div>

              {execution.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(calculateProgress())}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <div>Started: {new Date(execution.startedAt).toLocaleString()}</div>
                <div>Duration: {formatDuration(execution.startedAt, execution.completedAt)}</div>
                {execution.currentStep && (
                  <div>Current Step: {execution.currentStep}</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Control Buttons */}
            <div className="flex gap-2">
              {execution.status === 'running' ? (
                <>
                  <Button variant="outline" size="sm" onClick={onPause}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onStop}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              ) : execution.status === 'paused' ? (
                <>
                  <Button variant="default" size="sm" onClick={onResume}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onStop}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" onClick={onExecute}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run
                </Button>
              )}
            </div>

            {/* Results */}
            {execution.results && Object.keys(execution.results).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Results</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(execution.results).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{value as string}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Execution Logs */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Execution Logs</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                >
                  {showLogs ? 'Hide' : 'Show'} Logs
                </Button>
              </div>
              
              {showLogs && (
                <ScrollArea className="h-32 w-full border rounded p-2">
                  <div className="space-y-1">
                    {executionLogs.map((log, index) => (
                      <div key={index} className="text-xs flex gap-2">
                        <span className="text-muted-foreground">{log.timestamp}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            log.level === 'success' ? 'text-green-600' :
                            log.level === 'warning' ? 'text-yellow-600' :
                            log.level === 'error' ? 'text-red-600' : ''
                          }`}
                        >
                          {log.level}
                        </Badge>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

          </>
        ) : (
          /* No Execution State */
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No workflow execution in progress</p>
            <Button onClick={onExecute} className="gap-2">
              <Play className="w-4 h-4" />
              Start Execution
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};