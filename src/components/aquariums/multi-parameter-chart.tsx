/**
 * Multi-Parameter Water Quality Chart
 * Shows multiple parameters in a single chart for comparison
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart3, LineChart, Activity, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  Legend
} from 'recharts';
import type { WaterTest } from '@/types/aquarium';

interface MultiParameterChartProps {
  tests: WaterTest[];
  title?: string;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  [key: string]: number | string;
}

interface ParameterConfig {
  name: string;
  unit: string;
  color: string;
  enabled: boolean;
  scale?: 'primary' | 'secondary';
}

// Parameter colors and scaling configuration
const PARAMETER_CONFIG: Record<string, { color: string; scale: 'primary' | 'secondary' }> = {
  'pH': { color: '#8884d8', scale: 'primary' },
  'Ammonia': { color: '#82ca9d', scale: 'secondary' },
  'Nitrite': { color: '#ffc658', scale: 'secondary' },
  'Nitrate': { color: '#ff7c7c', scale: 'secondary' },
  'Temperature': { color: '#8dd1e1', scale: 'primary' },
  'Alkalinity': { color: '#d084d0', scale: 'primary' },
  'Hardness': { color: '#87d068', scale: 'primary' },
};

export function MultiParameterChart({ tests, title = "Multi-Parameter Comparison" }: MultiParameterChartProps) {
  if (tests.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Need at least 2 tests to compare parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Add more tests to see multi-parameter trends</p>
        </CardContent>
      </Card>
    );
  }

  // Sort tests by date (oldest first)
  const sortedTests = [...tests].sort((a, b) => 
    new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
  );

  // Extract all parameters and their configurations
  const allParameters = new Set<string>();
  tests.forEach(test => {
    test.parameters.forEach(param => {
      allParameters.add(param.name);
    });
  });

  const initialParameterStates: Record<string, ParameterConfig> = {};
  Array.from(allParameters).forEach(paramName => {
    const config = PARAMETER_CONFIG[paramName] || { color: '#8884d8', scale: 'primary' };
    const unit = tests
      .flatMap(t => t.parameters)
      .find(p => p.name === paramName)?.unit || '';

    initialParameterStates[paramName] = {
      name: paramName,
      unit,
      color: config.color,
      scale: config.scale,
      enabled: true, // Enable all parameters by default
    };
  });

  const [parameterStates, setParameterStates] = useState(initialParameterStates);
  const [showLegend, setShowLegend] = useState(true);
  const [normalizeScales, setNormalizeScales] = useState(false);

  // Toggle parameter visibility
  const toggleParameter = (paramName: string) => {
    setParameterStates(prev => ({
      ...prev,
      [paramName]: {
        ...prev[paramName],
        enabled: !prev[paramName].enabled
      }
    }));
  };

  // Prepare chart data
  const chartData: ChartDataPoint[] = sortedTests.map(test => {
    const testDate = typeof test.testDate === 'string' ? test.testDate : test.testDate.toISOString();
    const dataPoint: ChartDataPoint = {
      date: testDate,
      formattedDate: format(new Date(testDate), 'MMM d'),
    };

    test.parameters.forEach(param => {
      if (parameterStates[param.name]?.enabled) {
        dataPoint[param.name] = param.value;
      }
    });

    return dataPoint;
  });

  // Get enabled parameters
  const enabledParameters = Object.entries(parameterStates)
    .filter(([_, config]) => config.enabled)
    .map(([paramName, config]) => ({ paramName, ...config }));

  const primaryYAxisParams = enabledParameters.filter(p => p.scale === 'primary');
  const secondaryYAxisParams = enabledParameters.filter(p => p.scale === 'secondary');

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
        <p className="font-medium mb-2">{format(new Date(label), 'MMM d, yyyy')}</p>
        <div className="space-y-1">
          {payload
            .filter((entry: any) => entry.value != null)
            .map((entry: any) => {
              const paramConfig = parameterStates[entry.dataKey];
              return (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.dataKey}:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {entry.value}{paramConfig?.unit}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Compare {enabledParameters.length} parameters across {tests.length} tests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="legend"
                checked={showLegend}
                onCheckedChange={setShowLegend}
              />
              <Label htmlFor="legend" className="text-sm">Legend</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Toggle Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Visible Parameters</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allEnabled = Object.values(parameterStates).every(p => p.enabled);
                const newStates = { ...parameterStates };
                Object.keys(newStates).forEach(key => {
                  newStates[key] = { ...newStates[key], enabled: !allEnabled };
                });
                setParameterStates(newStates);
              }}
              className="text-xs"
            >
              {Object.values(parameterStates).every(p => p.enabled) ? 'Hide All' : 'Show All'}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(parameterStates).map(([paramName, config]) => (
              <Button
                key={paramName}
                variant={config.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => toggleParameter(paramName)}
                className="text-xs h-8"
                style={{
                  backgroundColor: config.enabled ? config.color : undefined,
                  borderColor: config.color,
                  color: config.enabled ? 'white' : config.color,
                }}
              >
                {config.enabled ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                {paramName}
                {config.unit && ` (${config.unit})`}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {enabledParameters.length > 0 && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                
                {/* Primary Y-axis (left) */}
                {primaryYAxisParams.length > 0 && (
                  <YAxis 
                    yAxisId="primary"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Primary Parameters', angle: -90, position: 'insideLeft' }}
                  />
                )}
                
                {/* Secondary Y-axis (right) */}
                {secondaryYAxisParams.length > 0 && (
                  <YAxis 
                    yAxisId="secondary"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Secondary Parameters', angle: 90, position: 'insideRight' }}
                  />
                )}
                
                <Tooltip content={<CustomTooltip />} />
                
                {showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                )}
                
                {/* Render lines for each enabled parameter */}
                {enabledParameters.map((param) => (
                  <Line
                    key={param.paramName}
                    yAxisId={param.scale}
                    type="monotone"
                    dataKey={param.paramName}
                    stroke={param.color}
                    strokeWidth={2}
                    dot={{ fill: param.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: param.color }}
                    connectNulls={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}

        {enabledParameters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No parameters selected. Enable parameters above to view the chart.</p>
          </div>
        )}

        {/* Parameter Summary */}
        {enabledParameters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledParameters.map((param) => {
              const values = chartData
                .map(d => d[param.paramName])
                .filter((v): v is number => typeof v === 'number');
              
              if (values.length === 0) return null;

              const latest = values[values.length - 1];
              const average = values.reduce((sum, val) => sum + val, 0) / values.length;
              const min = Math.min(...values);
              const max = Math.max(...values);

              return (
                <div key={param.paramName} className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: param.color }}
                    />
                    <span className="font-medium text-sm">{param.paramName}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Current: <span className="font-medium text-foreground">{latest.toFixed(2)}{param.unit}</span></div>
                    <div>Average: <span className="font-medium text-foreground">{average.toFixed(2)}{param.unit}</span></div>
                    <div>Range: <span className="font-medium text-foreground">{min.toFixed(2)} - {max.toFixed(2)}{param.unit}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}