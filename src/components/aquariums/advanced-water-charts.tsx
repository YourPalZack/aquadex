/**
 * Advanced Water Quality Charts Component
 * Rich interactive visualizations using Recharts library
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3, LineChart, Activity } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  LineChart as RechartsLineChart,
  Area,
  AreaChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Dot
} from 'recharts';
import type { WaterTest } from '@/types/aquarium';

interface AdvancedWaterChartsProps {
  tests: WaterTest[];
  aquariumType?: string;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  timestamp: number;
  [key: string]: number | string;
}

interface ParameterInfo {
  name: string;
  unit: string;
  color: string;
  idealMin?: number;
  idealMax?: number;
  warningMin?: number;
  warningMax?: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
}

// Parameter ideal ranges (can be expanded based on aquarium type)
const PARAMETER_RANGES: Record<string, { idealMin?: number; idealMax?: number; warningMin?: number; warningMax?: number; color: string }> = {
  'pH': { idealMin: 6.8, idealMax: 7.6, warningMin: 6.0, warningMax: 8.5, color: '#8884d8' },
  'Ammonia': { idealMax: 0.25, warningMax: 1.0, color: '#82ca9d' },
  'Nitrite': { idealMax: 0.5, warningMax: 2.0, color: '#ffc658' },
  'Nitrate': { idealMax: 40, warningMax: 80, color: '#ff7c7c' },
  'Temperature': { idealMin: 76, idealMax: 82, warningMin: 70, warningMax: 88, color: '#8dd1e1' },
  'Alkalinity': { idealMin: 80, idealMax: 120, warningMin: 50, warningMax: 180, color: '#d084d0' },
  'Hardness': { idealMin: 150, idealMax: 300, warningMin: 50, warningMax: 500, color: '#87d068' },
};

export function AdvancedWaterCharts({ tests, aquariumType = 'freshwater' }: AdvancedWaterChartsProps) {
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showReference, setShowReference] = useState(true);

  if (tests.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Water Quality Charts
          </CardTitle>
          <CardDescription>
            Need at least 2 tests to show advanced visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Add more water tests to unlock interactive charts and trend analysis</p>
        </CardContent>
      </Card>
    );
  }

  // Sort tests by date (oldest first for proper chart progression)
  const sortedTests = [...tests].sort((a, b) => 
    new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
  );

  // Extract all unique parameters
  const allParameters = new Set<string>();
  tests.forEach(test => {
    test.parameters.forEach(param => {
      allParameters.add(param.name);
    });
  });

  const parameterList = Array.from(allParameters);
  
  // Set default parameter if not selected
  if (!selectedParameter && parameterList.length > 0) {
    setSelectedParameter(parameterList[0]);
  }

  // Prepare chart data
  const chartData: ChartDataPoint[] = sortedTests.map(test => {
    const testDate = typeof test.testDate === 'string' ? test.testDate : test.testDate.toISOString();
    const dataPoint: ChartDataPoint = {
      date: testDate,
      formattedDate: format(new Date(testDate), 'MMM d'),
      timestamp: new Date(testDate).getTime(),
    };

    test.parameters.forEach(param => {
      dataPoint[param.name] = param.value;
      dataPoint[`${param.name}_status`] = param.status;
    });

    return dataPoint;
  });

  // Calculate parameter statistics
  const parameterStats: Record<string, ParameterInfo> = {};
  parameterList.forEach(paramName => {
    const values = sortedTests
      .map(test => test.parameters.find(p => p.name === paramName))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map(p => p.value);

    if (values.length >= 2) {
      const recent = values[values.length - 1];
      const previous = values[values.length - 2];
      const change = recent - previous;
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changePercent) > 5) {
        trend = change > 0 ? 'up' : 'down';
      }

      const ranges = PARAMETER_RANGES[paramName] || { color: '#8884d8' };
      const unit = sortedTests
        .flatMap(t => t.parameters)
        .find(p => p.name === paramName)?.unit || '';

      parameterStats[paramName] = {
        name: paramName,
        unit,
        trend,
        change,
        changePercent,
        ...ranges,
      };
    }
  });

  const selectedParamInfo = parameterStats[selectedParameter];
  const selectedData = chartData.filter(point => point[selectedParameter] !== undefined);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const value = payload[0].value;
    const status = data[`${selectedParameter}_status`];
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{format(new Date(label), 'MMM d, yyyy')}</p>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="text-sm">
            {selectedParameter}: <strong>{value}{selectedParamInfo?.unit}</strong>
          </span>
        </div>
        <Badge 
          variant="outline" 
          className={`mt-2 text-xs ${
            status === 'ideal' ? 'text-green-600' :
            status === 'acceptable' ? 'text-blue-600' :
            status === 'warning' ? 'text-yellow-600' :
            'text-red-600'
          }`}
        >
          {status}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">
          {differenceInDays(new Date(), new Date(label))} days ago
        </p>
      </div>
    );
  };

  // Custom dot component for status visualization
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const status = payload[`${selectedParameter}_status`];
    
    const getStatusColor = () => {
      switch (status) {
        case 'ideal': return '#22c55e';
        case 'acceptable': return '#3b82f6';
        case 'warning': return '#f59e0b';
        case 'critical': return '#ef4444';
        default: return '#6b7280';
      }
    };

    return (
      <Dot 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={getStatusColor()}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Water Quality Charts
            </CardTitle>
            <CardDescription>
              Interactive parameter trends with {tests.length} tests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChart className="h-4 w-4 mr-1" />
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <Activity className="h-4 w-4 mr-1" />
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Selection and Stats */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Parameter</label>
            <Select value={selectedParameter} onValueChange={setSelectedParameter}>
              <SelectTrigger>
                <SelectValue placeholder="Select parameter to visualize" />
              </SelectTrigger>
              <SelectContent>
                {parameterList.map(param => (
                  <SelectItem key={param} value={param}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: parameterStats[param]?.color || '#8884d8' }}
                      />
                      {param}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedParamInfo && (
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Recent Trend</label>
              <div className="flex items-center gap-2 p-2 border rounded">
                {getTrendIcon(selectedParamInfo.trend)}
                <span className="text-sm">
                  {selectedParamInfo.change > 0 ? '+' : ''}
                  {selectedParamInfo.change.toFixed(2)} ({selectedParamInfo.changePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        {selectedParameter && selectedData.length > 0 && (
          <div className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={selectedData}>
                    <defs>
                      <linearGradient id={`gradient-${selectedParameter}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedParamInfo?.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedParamInfo?.color} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Reference lines for ideal ranges */}
                    {showReference && selectedParamInfo?.idealMin && (
                      <ReferenceLine 
                        y={selectedParamInfo.idealMin} 
                        stroke="#22c55e" 
                        strokeDasharray="2 2" 
                        opacity={0.6}
                        label={{ value: "Ideal Min", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    {showReference && selectedParamInfo?.idealMax && (
                      <ReferenceLine 
                        y={selectedParamInfo.idealMax} 
                        stroke="#22c55e" 
                        strokeDasharray="2 2" 
                        opacity={0.6}
                        label={{ value: "Ideal Max", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    {showReference && selectedParamInfo?.warningMax && (
                      <ReferenceLine 
                        y={selectedParamInfo.warningMax} 
                        stroke="#f59e0b" 
                        strokeDasharray="4 4" 
                        opacity={0.5}
                        label={{ value: "Warning", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    
                    <Area
                      type="monotone"
                      dataKey={selectedParameter}
                      stroke={selectedParamInfo?.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${selectedParameter})`}
                      dot={<CustomDot />}
                      activeDot={{ r: 6, fill: selectedParamInfo?.color }}
                    />
                  </AreaChart>
                ) : (
                  <RechartsLineChart data={selectedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Reference lines for ideal ranges */}
                    {showReference && selectedParamInfo?.idealMin && (
                      <ReferenceLine 
                        y={selectedParamInfo.idealMin} 
                        stroke="#22c55e" 
                        strokeDasharray="2 2" 
                        opacity={0.6}
                        label={{ value: "Ideal Min", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    {showReference && selectedParamInfo?.idealMax && (
                      <ReferenceLine 
                        y={selectedParamInfo.idealMax} 
                        stroke="#22c55e" 
                        strokeDasharray="2 2" 
                        opacity={0.6}
                        label={{ value: "Ideal Max", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    {showReference && selectedParamInfo?.warningMax && (
                      <ReferenceLine 
                        y={selectedParamInfo.warningMax} 
                        stroke="#f59e0b" 
                        strokeDasharray="4 4" 
                        opacity={0.5}
                        label={{ value: "Warning", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                    
                    <Line
                      type="monotone"
                      dataKey={selectedParameter}
                      stroke={selectedParamInfo?.color}
                      strokeWidth={3}
                      dot={<CustomDot />}
                      activeDot={{ r: 6, fill: selectedParamInfo?.color }}
                    />
                  </RechartsLineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Chart Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Ideal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReference(!showReference)}
                className="text-xs"
              >
                {showReference ? 'Hide' : 'Show'} Reference Lines
              </Button>
            </div>

            {/* Parameter Insights */}
            {selectedParamInfo && selectedData.length >= 3 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {selectedParameter} Insights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <span className="ml-2 font-medium">
                      {selectedData[selectedData.length - 1][selectedParameter]}{selectedParamInfo.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average:</span>
                    <span className="ml-2 font-medium">
                      {(selectedData.reduce((sum, point) => sum + (point[selectedParameter] as number), 0) / selectedData.length).toFixed(2)}{selectedParamInfo.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Range:</span>
                    <span className="ml-2 font-medium">
                      {Math.min(...selectedData.map(p => p[selectedParameter] as number)).toFixed(2)} - 
                      {Math.max(...selectedData.map(p => p[selectedParameter] as number)).toFixed(2)}{selectedParamInfo.unit}
                    </span>
                  </div>
                </div>
                
                {/* Status warning if current value is outside ideal range */}
                {(() => {
                  const currentValue = selectedData[selectedData.length - 1][selectedParameter] as number;
                  const isOutsideRange = (selectedParamInfo.idealMin && currentValue < selectedParamInfo.idealMin) || 
                                       (selectedParamInfo.idealMax && currentValue > selectedParamInfo.idealMax);
                  
                  if (!isOutsideRange) return null;
                  
                  const isLow = selectedParamInfo.idealMin && currentValue < selectedParamInfo.idealMin;
                  
                  return (
                    <div className={`flex items-center gap-2 mt-3 text-sm ${isLow ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>
                      {isLow ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      <span>Current {selectedParameter.toLowerCase()} is {isLow ? 'below' : 'above'} ideal range</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}