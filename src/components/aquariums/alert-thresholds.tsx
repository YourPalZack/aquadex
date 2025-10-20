/**
 * Parameter Alert Thresholds Configuration Component
 * Allows users to set custom alert thresholds for water parameters
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  Settings, 
  Save, 
  RotateCcw, 
  Mail, 
  Smartphone,
  MessageSquare,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ParameterThreshold, AlertNotificationMethod, WaterType } from '@/types/aquarium';

interface AlertThresholdsProps {
  aquariumId: string;
  aquariumName: string;
  waterType: WaterType;
  existingThresholds?: ParameterThreshold[];
  onSave?: (thresholds: ParameterThreshold[]) => void;
}

// Default thresholds by water type and parameter
const DEFAULT_THRESHOLDS: Record<WaterType, Record<string, any>> = {
  freshwater: {
    'pH': { idealMin: 6.8, idealMax: 7.6, warningMin: 6.0, warningMax: 8.2, criticalMin: 5.5, criticalMax: 8.8, unit: '' },
    'Ammonia': { idealMax: 0, warningMax: 0.25, criticalMax: 1.0, unit: 'ppm' },
    'Nitrite': { idealMax: 0, warningMax: 0.5, criticalMax: 2.0, unit: 'ppm' },
    'Nitrate': { idealMax: 20, warningMax: 40, criticalMax: 80, unit: 'ppm' },
    'Temperature': { idealMin: 74, idealMax: 78, warningMin: 70, warningMax: 84, criticalMin: 65, criticalMax: 90, unit: '°F' },
    'Alkalinity': { idealMin: 80, idealMax: 120, warningMin: 50, warningMax: 180, criticalMin: 20, criticalMax: 250, unit: 'ppm' },
    'Hardness': { idealMin: 150, idealMax: 300, warningMin: 50, warningMax: 500, criticalMin: 0, criticalMax: 800, unit: 'ppm' },
  },
  saltwater: {
    'pH': { idealMin: 8.1, idealMax: 8.4, warningMin: 7.8, warningMax: 8.6, criticalMin: 7.5, criticalMax: 8.8, unit: '' },
    'Ammonia': { idealMax: 0, warningMax: 0.25, criticalMax: 1.0, unit: 'ppm' },
    'Nitrite': { idealMax: 0, warningMax: 0.25, criticalMax: 1.0, unit: 'ppm' },
    'Nitrate': { idealMax: 10, warningMax: 25, criticalMax: 50, unit: 'ppm' },
    'Temperature': { idealMin: 76, idealMax: 82, warningMin: 72, warningMax: 86, criticalMin: 68, criticalMax: 92, unit: '°F' },
    'Salinity': { idealMin: 1.023, idealMax: 1.026, warningMin: 1.020, warningMax: 1.028, criticalMin: 1.015, criticalMax: 1.032, unit: 'sg' },
    'Alkalinity': { idealMin: 8, idealMax: 12, warningMin: 6, warningMax: 15, criticalMin: 4, criticalMax: 20, unit: 'dKH' },
  },
  brackish: {
    'pH': { idealMin: 7.5, idealMax: 8.2, warningMin: 7.0, warningMax: 8.5, criticalMin: 6.5, criticalMax: 9.0, unit: '' },
    'Ammonia': { idealMax: 0, warningMax: 0.25, criticalMax: 1.0, unit: 'ppm' },
    'Nitrite': { idealMax: 0, warningMax: 0.5, criticalMax: 2.0, unit: 'ppm' },
    'Nitrate': { idealMax: 20, warningMax: 40, criticalMax: 80, unit: 'ppm' },
    'Temperature': { idealMin: 75, idealMax: 80, warningMin: 70, warningMax: 85, criticalMin: 65, criticalMax: 90, unit: '°F' },
    'Salinity': { idealMin: 1.005, idealMax: 1.015, warningMin: 1.002, warningMax: 1.020, criticalMin: 1.000, criticalMax: 1.025, unit: 'sg' },
  }
};

const NOTIFICATION_OPTIONS: { value: AlertNotificationMethod; label: string; icon: any; description: string }[] = [
  { value: 'in-app', label: 'In-App', icon: Bell, description: 'Show notifications within the app' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Send email notifications' },
  { value: 'push', label: 'Push', icon: Smartphone, description: 'Push notifications to your device' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Text message alerts (premium)' },
];

export function AlertThresholds({ 
  aquariumId, 
  aquariumName, 
  waterType, 
  existingThresholds = [], 
  onSave 
}: AlertThresholdsProps) {
  const { toast } = useToast();
  
  // Initialize thresholds from existing or defaults
  const initializeThresholds = () => {
    const defaults = DEFAULT_THRESHOLDS[waterType];
    const thresholds: Record<string, ParameterThreshold> = {};
    
    // Start with defaults
    Object.keys(defaults).forEach(paramName => {
      const defaultConfig = defaults[paramName];
      thresholds[paramName] = {
        id: `${aquariumId}-${paramName}`,
        parameterName: paramName,
        unit: defaultConfig.unit,
        aquariumId,
        userId: 'current-user', // This would come from auth
        idealMin: defaultConfig.idealMin,
        idealMax: defaultConfig.idealMax,
        warningMin: defaultConfig.warningMin,
        warningMax: defaultConfig.warningMax,
        criticalMin: defaultConfig.criticalMin,
        criticalMax: defaultConfig.criticalMax,
        enabled: true,
        notificationMethods: ['in-app', 'email'] as AlertNotificationMethod[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    // Override with existing thresholds
    existingThresholds.forEach(existing => {
      thresholds[existing.parameterName] = existing;
    });
    
    return thresholds;
  };

  const [thresholds, setThresholds] = useState(initializeThresholds);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeParameter, setActiveParameter] = useState<string>(Object.keys(thresholds)[0]);

  const updateThreshold = (paramName: string, field: keyof ParameterThreshold, value: any) => {
    setThresholds(prev => ({
      ...prev,
      [paramName]: {
        ...prev[paramName],
        [field]: value,
        updatedAt: new Date(),
      }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = (paramName: string) => {
    const defaults = DEFAULT_THRESHOLDS[waterType][paramName];
    if (defaults) {
      updateThreshold(paramName, 'idealMin', defaults.idealMin);
      updateThreshold(paramName, 'idealMax', defaults.idealMax);
      updateThreshold(paramName, 'warningMin', defaults.warningMin);
      updateThreshold(paramName, 'warningMax', defaults.warningMax);
      updateThreshold(paramName, 'criticalMin', defaults.criticalMin);
      updateThreshold(paramName, 'criticalMax', defaults.criticalMax);
      
      toast({
        title: "Reset to Defaults",
        description: `${paramName} thresholds reset to recommended values`,
      });
    }
  };

  const handleSave = async () => {
    try {
      const thresholdList = Object.values(thresholds);
      await onSave?.(thresholdList);
      setHasChanges(false);
      toast({
        title: "Thresholds Saved",
        description: "Alert thresholds have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save alert thresholds. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeThreshold = thresholds[activeParameter];
  const parameterNames = Object.keys(thresholds);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Configure parameter alert thresholds for {aquariumName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {waterType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Parameter</Label>
          <Select value={activeParameter} onValueChange={setActiveParameter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {parameterNames.map(paramName => (
                <SelectItem key={paramName} value={paramName}>
                  <div className="flex items-center justify-between w-full">
                    <span>{paramName}</span>
                    <div className="flex items-center gap-1 ml-2">
                      {thresholds[paramName].enabled ? (
                        <Bell className="h-3 w-3 text-green-600" />
                      ) : (
                        <BellOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeThreshold && (
          <Tabs defaultValue="thresholds" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="thresholds" className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Activate monitoring for {activeParameter}
                  </p>
                </div>
                <Switch
                  checked={activeThreshold.enabled}
                  onCheckedChange={(checked) => updateThreshold(activeParameter, 'enabled', checked)}
                />
              </div>

              {activeThreshold.enabled && (
                <>
                  {/* Ideal Range */}
                  <div className="space-y-3 p-3 border rounded-lg bg-green-500/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-green-700 dark:text-green-400">
                        Ideal Range
                      </Label>
                      <Badge variant="outline" className="text-green-600">
                        No alerts
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Minimum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.idealMin || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'idealMin', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maximum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.idealMax || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'idealMax', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No maximum"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warning Range */}
                  <div className="space-y-3 p-3 border rounded-lg bg-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        Warning Range
                      </Label>
                      <Badge variant="outline" className="text-yellow-600">
                        Low priority alerts
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Minimum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.warningMin || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'warningMin', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maximum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.warningMax || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'warningMax', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No maximum"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Critical Range */}
                  <div className="space-y-3 p-3 border rounded-lg bg-red-500/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-red-700 dark:text-red-400">
                        Critical Range
                      </Label>
                      <Badge variant="outline" className="text-red-600">
                        High priority alerts
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Minimum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.criticalMin || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'criticalMin', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No minimum"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maximum</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={activeThreshold.criticalMax || ''}
                          onChange={(e) => updateThreshold(activeParameter, 'criticalMax', 
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder="No maximum"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetToDefaults(activeParameter)}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {/* Notification Methods */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notification Methods</Label>
                <div className="space-y-3">
                  {NOTIFICATION_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isEnabled = activeThreshold.notificationMethods.includes(option.value);
                    
                    return (
                      <div key={option.value} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{option.label}</span>
                              {option.value === 'sms' && (
                                <Badge variant="secondary" className="text-xs">Premium</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            const currentMethods = activeThreshold.notificationMethods;
                            const newMethods = checked
                              ? [...currentMethods, option.value]
                              : currentMethods.filter(method => method !== option.value);
                            updateThreshold(activeParameter, 'notificationMethods', newMethods);
                          }}
                          disabled={option.value === 'sms'} // Premium feature
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Unsaved Changes</p>
              <p className="text-xs text-muted-foreground">You have modified alert thresholds</p>
            </div>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Thresholds
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}