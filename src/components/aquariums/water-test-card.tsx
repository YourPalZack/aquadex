/**
 * Water Test Card Component
 * Displays a single water test result with parameters and status
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplet, Calendar, FileText, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WaterTest } from '@/types/aquarium';
import Link from 'next/link';

interface WaterTestCardProps {
  test: WaterTest;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ideal':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'acceptable':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'critical':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ideal':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'warning':
    case 'critical':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Droplet className="h-4 w-4" />;
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case 'test-strip':
      return 'Test Strip';
    case 'liquid-test':
      return 'Liquid Test';
    case 'digital-meter':
      return 'Digital Meter';
    case 'manual-entry':
      return 'Manual Entry';
    default:
      return method;
  }
};

export function WaterTestCard({ test, showActions = true, onDelete }: WaterTestCardProps) {
  const hasWarnings = test.parameters.some(p => p.status === 'warning' || p.status === 'critical');
  const criticalCount = test.parameters.filter(p => p.status === 'critical').length;
  const warningCount = test.parameters.filter(p => p.status === 'warning').length;

  return (
    <Card className={hasWarnings ? 'border-yellow-500/50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              Water Test
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {criticalCount} Critical
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {warningCount} Warning
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(test.testDate), { addSuffix: true })}
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className="text-xs">
                {getMethodLabel(test.method)}
              </Badge>
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/water-tests/${test.id}`}>
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(test.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Parameters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {test.parameters.map((param, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getStatusColor(param.status)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{param.name}</span>
                {getStatusIcon(param.status)}
              </div>
              <div className="text-lg font-bold">
                {param.value}
                {param.unit && <span className="text-sm font-normal ml-1">{param.unit}</span>}
              </div>
              {param.idealRange && (
                <div className="text-xs text-muted-foreground mt-1">
                  Ideal: {param.idealRange.min}-{param.idealRange.max}
                  {param.unit && ` ${param.unit}`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {test.notes && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {test.notes}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {test.recommendations && test.recommendations.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Recommendations
            </h4>
            <ul className="space-y-1 text-sm">
              {test.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
