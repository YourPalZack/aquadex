/**
 * Water Quality Trends Component
 * Shows parameter trends over time with simple line indicators
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { WaterTest } from '@/types/aquarium';

interface WaterQualityTrendsProps {
  tests: WaterTest[];
  parameterName?: string;
}

interface ParameterTrend {
  name: string;
  values: Array<{
    date: Date;
    value: number;
    status: string;
  }>;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  recentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
}

export function WaterQualityTrends({ tests, parameterName }: WaterQualityTrendsProps) {
  if (tests.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Quality Trends</CardTitle>
          <CardDescription>
            Need at least 2 tests to show trends
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>Add more water tests to see parameter trends over time</p>
        </CardContent>
      </Card>
    );
  }

  // Sort tests by date (most recent first)
  const sortedTests = [...tests].sort((a, b) => 
    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
  );

  // Extract unique parameter names
  const allParameterNames = new Set<string>();
  tests.forEach(test => {
    test.parameters.forEach(param => {
      allParameterNames.add(param.name);
    });
  });

  // Build trends for each parameter
  const trends: ParameterTrend[] = [];
  
  allParameterNames.forEach(name => {
    if (parameterName && name !== parameterName) return;

    const values = sortedTests
      .map(test => {
        const param = test.parameters.find(p => p.name === name);
        if (!param) return null;
        return {
          date: new Date(test.testDate),
          value: param.value,
          status: param.status,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (values.length < 2) return;

    const recentValue = values[0].value;
    const previousValue = values[1].value;
    const change = recentValue - previousValue;
    const changePercent = previousValue !== 0 
      ? (change / previousValue) * 100 
      : 0;

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const threshold = 0.05; // 5% change threshold
    if (Math.abs(changePercent) > threshold * 100) {
      trend = change > 0 ? 'up' : 'down';
    }

    const unit = tests
      .flatMap(t => t.parameters)
      .find(p => p.name === name)?.unit || '';

    trends.push({
      name,
      values,
      unit,
      trend,
      recentValue,
      previousValue,
      change,
      changePercent,
    });
  });

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Quality Trends</CardTitle>
          <CardDescription>No consistent parameters found across tests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      case 'stable':
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-orange-600';
      case 'down':
        return 'text-blue-600';
      case 'stable':
        return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ideal':
        return 'bg-green-500';
      case 'acceptable':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Water Quality Trends</CardTitle>
        <CardDescription>
          Parameter changes from last {tests.length} tests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {trends.map((trend) => (
          <div key={trend.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{trend.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">
                    {trend.recentValue}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {trend.unit}
                    </span>
                  </span>
                  <Badge variant="outline" className={getTrendColor(trend.trend)}>
                    {getTrendIcon(trend.trend)}
                    <span className="ml-1">
                      {trend.change > 0 ? '+' : ''}
                      {trend.change.toFixed(2)} ({trend.changePercent.toFixed(1)}%)
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Previous: {trend.previousValue}{trend.unit}</div>
                <div className="text-xs">{format(trend.values[1].date, 'MMM d')}</div>
              </div>
            </div>

            {/* Mini timeline */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 h-8">
                {trend.values.slice(0, 10).reverse().map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    title={`${value.value}${trend.unit} on ${format(value.date, 'MMM d, yyyy')}`}
                  >
                    <div
                      className={`w-full rounded-t ${getStatusColor(value.status)}`}
                      style={{
                        height: `${Math.max(20, Math.min(100, (value.value / (trend.recentValue || 1)) * 60))}%`,
                        opacity: index === trend.values.length - 1 ? 1 : 0.7,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(trend.values[Math.min(9, trend.values.length - 1)].date, 'MMM d')}</span>
                <span>{format(trend.values[0].date, 'MMM d')}</span>
              </div>
            </div>

            {/* Warning if recent status is not ideal */}
            {(trend.values[0].status === 'warning' || trend.values[0].status === 'critical') && (
              <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 p-2 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {trend.values[0].status === 'critical' 
                    ? 'Critical level - immediate attention needed'
                    : 'Warning level - monitor closely'}
                </span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
