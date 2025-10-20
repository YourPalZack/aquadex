/**
 * Parameter Alerts Dashboard Component
 * Shows active alerts, alert history, and management options
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  Check, 
  Clock, 
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { ParameterAlert, AlertStatus, ParameterAlertSeverity } from '@/types/aquarium';

interface AlertsDashboardProps {
  alerts?: ParameterAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onResolveAlert?: (alertId: string) => void;
  onSnoozeAlert?: (alertId: string, duration: number) => void;
  className?: string;
}

// Mock alerts for demonstration
const MOCK_ALERTS: ParameterAlert[] = [
  {
    id: 'alert-1',
    aquariumId: 'aqua1',
    userId: 'user1',
    thresholdId: 'thresh-1',
    testId: 'test-1',
    parameterName: 'Ammonia',
    parameterValue: 2.5,
    unit: 'ppm',
    severity: 'critical',
    status: 'active',
    title: 'Critical Ammonia Level',
    message: 'Ammonia level of 2.5ppm exceeds critical threshold (1.0ppm). Immediate water change recommended.',
    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    notificationsSent: ['in-app', 'email'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'alert-2',
    aquariumId: 'aqua1',
    userId: 'user1',
    thresholdId: 'thresh-2',
    testId: 'test-2',
    parameterName: 'pH',
    parameterValue: 8.6,
    unit: '',
    severity: 'medium',
    status: 'acknowledged',
    title: 'pH Outside Warning Range',
    message: 'pH level of 8.6 is above warning threshold (8.2). Monitor closely and consider pH adjustment.',
    triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    acknowledgedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    notificationsSent: ['in-app'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'alert-3',
    aquariumId: 'aqua2',
    userId: 'user1',
    thresholdId: 'thresh-3',
    testId: 'test-3',
    parameterName: 'Temperature',
    parameterValue: 85,
    unit: '°F',
    severity: 'high',
    status: 'snoozed',
    title: 'High Temperature Alert',
    message: 'Temperature of 85°F exceeds warning threshold (84°F). Check heater and room temperature.',
    triggeredAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    snoozedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    notificationsSent: ['in-app', 'push'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'alert-4',
    aquariumId: 'aqua1',
    userId: 'user1',
    thresholdId: 'thresh-4',
    testId: 'test-4',
    parameterName: 'Nitrate',
    parameterValue: 65,
    unit: 'ppm',
    severity: 'medium',
    status: 'resolved',
    title: 'Elevated Nitrate Level',
    message: 'Nitrate level of 65ppm exceeds warning threshold (40ppm). Water change recommended.',
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    acknowledgedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    notificationsSent: ['in-app'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const SEVERITY_CONFIG = {
  low: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-200',
    icon: Info,
    label: 'Low' 
  },
  medium: { 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-500/10', 
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium' 
  },
  high: { 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-500/10', 
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    label: 'High' 
  },
  critical: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-200',
    icon: XCircle,
    label: 'Critical' 
  },
};

const STATUS_CONFIG = {
  active: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Active' },
  acknowledged: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Acknowledged' },
  snoozed: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Snoozed' },
  resolved: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Resolved' },
};

export function AlertsDashboard({ 
  alerts = MOCK_ALERTS, 
  onAcknowledgeAlert, 
  onResolveAlert, 
  onSnoozeAlert,
  className 
}: AlertsDashboardProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<ParameterAlertSeverity | 'all'>('all');

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.parameterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Group alerts by status
  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = filteredAlerts.filter(alert => alert.status === 'acknowledged');
  const snoozedAlerts = filteredAlerts.filter(alert => alert.status === 'snoozed');
  const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'resolved');

  const handleAcknowledge = (alertId: string) => {
    onAcknowledgeAlert?.(alertId);
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged",
    });
  };

  const handleResolve = (alertId: string) => {
    onResolveAlert?.(alertId);
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
    });
  };

  const handleSnooze = (alertId: string, hours: number) => {
    const duration = hours * 60 * 60 * 1000; // Convert to milliseconds
    onSnoozeAlert?.(alertId, duration);
    toast({
      title: "Alert Snoozed",
      description: `Alert will be hidden for ${hours} hour${hours !== 1 ? 's' : ''}`,
    });
  };

  const AlertCard = ({ alert }: { alert: ParameterAlert }) => {
    const severityConfig = SEVERITY_CONFIG[alert.severity];
    const statusConfig = STATUS_CONFIG[alert.status];
    const SeverityIcon = severityConfig.icon;

    return (
      <Card className={cn('border-l-4', severityConfig.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SeverityIcon className={cn('h-4 w-4', severityConfig.color)} />
                <CardTitle className="text-sm">{alert.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="secondary" className={cn('text-xs', severityConfig.color)}>
                  {severityConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {alert.parameterName}: {alert.parameterValue}{alert.unit}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              <div>{formatDistanceToNow(alert.triggeredAt)} ago</div>
              {alert.status === 'snoozed' && alert.snoozedUntil && (
                <div className="text-blue-600">
                  Snoozed for {formatDistanceToNow(alert.snoozedUntil)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {alert.status === 'active' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Acknowledge
                </Button>
                <Select onValueChange={(value) => handleSnooze(alert.id, parseInt(value))}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Snooze
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            {(alert.status === 'active' || alert.status === 'acknowledged') && (
              <Button 
                size="sm" 
                onClick={() => handleResolve(alert.id)}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-4 pt-3 border-t text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Triggered:</span>
              <span>{format(alert.triggeredAt, 'MMM d, h:mm a')}</span>
            </div>
            {alert.acknowledgedAt && (
              <div className="flex justify-between text-muted-foreground">
                <span>Acknowledged:</span>
                <span>{format(alert.acknowledgedAt, 'MMM d, h:mm a')}</span>
              </div>
            )}
            {alert.resolvedAt && (
              <div className="flex justify-between text-muted-foreground">
                <span>Resolved:</span>
                <span>{format(alert.resolvedAt, 'MMM d, h:mm a')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Parameter Alerts
          </CardTitle>
          <CardDescription>
            Monitor and manage water parameter alerts across your aquariums
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: AlertStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="snoozed">Snoozed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={(value: ParameterAlertSeverity | 'all') => setSeverityFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
              <div className="text-xs text-red-600">Active</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{acknowledgedAlerts.length}</div>
              <div className="text-xs text-yellow-600">Acknowledged</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{snoozedAlerts.length}</div>
              <div className="text-xs text-blue-600">Snoozed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
              <div className="text-xs text-green-600">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="relative">
            Active
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            Acknowledged
            {acknowledgedAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {acknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="snoozed">
            Snoozed
            {snoozedAlerts.length > 0 && (
              <Badge variant="outline" className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {snoozedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-muted-foreground">No active alerts</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-4">
          {acknowledgedAlerts.length > 0 ? (
            acknowledgedAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No acknowledged alerts</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="snoozed" className="space-y-4">
          {snoozedAlerts.length > 0 ? (
            snoozedAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No snoozed alerts</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length > 0 ? (
            resolvedAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No resolved alerts</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}