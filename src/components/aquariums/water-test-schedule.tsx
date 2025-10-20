'use client';

import { useState } from 'react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Bell, BellOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Aquarium } from '@/types';

interface WaterTestScheduleProps {
  aquarium: Aquarium;
  onUpdate?: (aquarium: Aquarium) => void;
  className?: string;
}

export function WaterTestSchedule({ 
  aquarium, 
  onUpdate,
  className 
}: WaterTestScheduleProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [localAquarium, setLocalAquarium] = useState(aquarium);

  const handleFrequencyChange = (value: string) => {
    const days = parseInt(value);
    setLocalAquarium(prev => ({
      ...prev,
      testFrequencyDays: days,
    }));
  };

  const handleReminderToggle = (enabled: boolean) => {
    setLocalAquarium(prev => ({
      ...prev,
      testReminderEnabled: enabled,
    }));
  };

  const handleSave = () => {
    onUpdate?.(localAquarium);
    setIsEditing(false);
    toast({
      title: 'Schedule Updated',
      description: 'Water test schedule has been saved.',
    });
  };

  const handleCancel = () => {
    setLocalAquarium(aquarium);
    setIsEditing(false);
  };

  // Calculate status
  const getScheduleStatus = () => {
    if (!aquarium.nextTestDate) {
      return { status: 'none', message: 'No schedule set', color: 'text-muted-foreground' };
    }

    const nextTest = new Date(aquarium.nextTestDate);
    const daysUntil = differenceInDays(nextTest, new Date());
    
    if (isToday(nextTest)) {
      return { status: 'today', message: 'Due today', color: 'text-yellow-600' };
    } else if (isPast(nextTest)) {
      const daysOverdue = Math.abs(daysUntil);
      return { 
        status: 'overdue', 
        message: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`, 
        color: 'text-red-600' 
      };
    } else if (daysUntil <= 2) {
      return { 
        status: 'soon', 
        message: `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`, 
        color: 'text-orange-600' 
      };
    } else {
      return { 
        status: 'scheduled', 
        message: `Due in ${daysUntil} days`, 
        color: 'text-green-600' 
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'today':
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'soon':
        return <Clock className="h-4 w-4" />;
      case 'scheduled':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const scheduleStatus = getScheduleStatus();
  const frequencyOptions = [
    { value: '3', label: 'Every 3 days' },
    { value: '7', label: 'Weekly' },
    { value: '10', label: 'Every 10 days' },
    { value: '14', label: 'Bi-weekly' },
    { value: '21', label: 'Every 3 weeks' },
    { value: '30', label: 'Monthly' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Water Test Schedule
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* Editing Mode */}
            <div className="space-y-4">
              <div>
                <Label>Test Frequency</Label>
                <Select 
                  value={localAquarium.testFrequencyDays?.toString() || ''} 
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when tests are due
                  </p>
                </div>
                <Switch
                  checked={localAquarium.testReminderEnabled || false}
                  onCheckedChange={handleReminderToggle}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm">
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Display Mode */}
            <div className="space-y-3">
              {/* Current Status */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={cn('flex items-center gap-1', scheduleStatus.color)}>
                    {getStatusIcon(scheduleStatus.status)}
                    <span className="font-medium">{scheduleStatus.message}</span>
                  </div>
                </div>
                {aquarium.nextTestDate && (
                  <Badge variant="outline">
                    {format(new Date(aquarium.nextTestDate), 'MMM d')}
                  </Badge>
                )}
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-medium">
                    {aquarium.testFrequencyDays 
                      ? `Every ${aquarium.testFrequencyDays} days`
                      : 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reminders</p>
                  <div className="flex items-center gap-1">
                    {aquarium.testReminderEnabled ? (
                      <>
                        <Bell className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Enabled</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Test Info */}
              {aquarium.lastTestDate && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Last tested: {format(new Date(aquarium.lastTestDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              {scheduleStatus.status === 'overdue' || scheduleStatus.status === 'today' ? (
                <div className="pt-2">
                  <Button size="sm" className="w-full">
                    Test Water Now
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}