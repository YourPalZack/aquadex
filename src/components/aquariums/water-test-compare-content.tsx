'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { GitCompareArrows, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WaterTest, WaterParameter } from '@/types/aquarium';

interface WaterTestCompareContentProps {
  waterTests: WaterTest[];
  aquariumLookup: Record<string, string>;
}

interface ComparisonData {
  parameterName: string;
  unit: string;
  tests: {
    testId: string;
    value: number;
    status: 'ideal' | 'acceptable' | 'warning' | 'critical';
    change?: {
      type: 'up' | 'down' | 'same';
      percentage: number;
    };
  }[];
}

export function WaterTestCompareContent({ 
  waterTests, 
  aquariumLookup 
}: WaterTestCompareContentProps) {
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [selectedAquarium, setSelectedAquarium] = useState<string>('all');

  // Filter tests by aquarium
  const filteredTests = selectedAquarium === 'all' 
    ? waterTests 
    : waterTests.filter(test => test.aquariumId === selectedAquarium);

  // Sort tests by date (newest first)
  const sortedTests = filteredTests.sort((a, b) => 
    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
  );

  const selectedTests = sortedTests.filter(test => selectedTestIds.includes(test.id));

  const handleTestSelection = (testId: string, checked: boolean) => {
    if (checked) {
      if (selectedTestIds.length < 5) { // Limit to 5 tests for readability
        setSelectedTestIds([...selectedTestIds, testId]);
      }
    } else {
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    }
  };

  const clearSelection = () => {
    setSelectedTestIds([]);
  };

  // Generate comparison data
  const comparisonData = generateComparisonData(selectedTests);

  // Get unique aquarium IDs from filtered tests
  const aquariumIds = [...new Set(filteredTests.map(test => test.aquariumId))];

  if (sortedTests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GitCompareArrows className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Water Tests Available</h3>
          <p className="text-muted-foreground">
            Add some water tests to start comparing them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Select Tests to Compare</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedAquarium} onValueChange={setSelectedAquarium}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Filter by aquarium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Aquariums</SelectItem>
                  {aquariumIds.map((aquariumId) => (
                    <SelectItem key={aquariumId} value={aquariumId}>
                      {aquariumLookup[aquariumId] || `Aquarium ${aquariumId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTestIds.length > 0 && (
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection ({selectedTestIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedTestIds.includes(test.id)}
                  onCheckedChange={(checked) => 
                    handleTestSelection(test.id, checked as boolean)
                  }
                  disabled={
                    !selectedTestIds.includes(test.id) && selectedTestIds.length >= 5
                  }
                />
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {aquariumLookup[test.aquariumId] || `Aquarium ${test.aquariumId}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(test.testDate, 'MMM d, yyyy')} • {test.method}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {test.parameters.length} parameters
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedTestIds.length >= 5 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Maximum of 5 tests can be compared at once for better readability.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedTests.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Parameter Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Parameter</TableHead>
                    {selectedTests.map((test) => (
                      <TableHead key={test.id} className="text-center min-w-32">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {aquariumLookup[test.aquariumId]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(test.testDate, 'MMM d')}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {test.method}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((param) => (
                    <TableRow key={param.parameterName}>
                      <TableCell className="font-medium">
                        <div>
                          {param.parameterName}
                          <div className="text-xs text-muted-foreground">
                            ({param.unit})
                          </div>
                        </div>
                      </TableCell>
                      {param.tests.map((test, index) => (
                        <TableCell key={test.testId} className="text-center">
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-medium">{test.value}</span>
                              <StatusIcon status={test.status} />
                            </div>
                            {test.change && index > 0 && (
                              <div className="flex items-center justify-center gap-1">
                                <ChangeIcon change={test.change} />
                                <span className={cn(
                                  "text-xs",
                                  test.change.type === 'up' ? "text-red-600" :
                                  test.change.type === 'down' ? "text-green-600" :
                                  "text-muted-foreground"
                                )}>
                                  {test.change.percentage.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Legend */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-2">Status Legend:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ideal</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Acceptable</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTests.length === 1 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <GitCompareArrows className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select at least 2 tests to see the comparison.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateComparisonData(tests: WaterTest[]): ComparisonData[] {
  if (tests.length < 2) return [];

  // Get all unique parameter names
  const allParameters = new Set<string>();
  tests.forEach(test => {
    test.parameters.forEach(param => {
      allParameters.add(param.name);
    });
  });

  return Array.from(allParameters).map(paramName => {
    const paramData: ComparisonData = {
      parameterName: paramName,
      unit: '',
      tests: [],
    };

    tests.forEach((test, testIndex) => {
      const param = test.parameters.find(p => p.name === paramName);
      
      if (param) {
        paramData.unit = param.unit;
        
        let change: ComparisonData['tests'][0]['change'] | undefined;
        
        // Calculate change from previous test
        if (testIndex > 0) {
          const prevTest = tests[testIndex - 1];
          const prevParam = prevTest.parameters.find(p => p.name === paramName);
          
          if (prevParam) {
            const currentValue = param.value;
            const prevValue = prevParam.value;
            const percentChange = prevValue !== 0 ? 
              ((currentValue - prevValue) / prevValue) * 100 : 0;
            
            change = {
              type: Math.abs(percentChange) < 1 ? 'same' : 
                    currentValue > prevValue ? 'up' : 'down',
              percentage: Math.abs(percentChange),
            };
          }
        }

        paramData.tests.push({
          testId: test.id,
          value: param.value,
          status: param.status,
          change,
        });
      } else {
        // Parameter not found in this test
        paramData.tests.push({
          testId: test.id,
          value: 0,
          status: 'acceptable',
          change: undefined,
        });
      }
    });

    return paramData;
  }).filter(param => 
    // Only include parameters that exist in at least 2 tests
    param.tests.filter(test => test.value > 0).length >= 2
  );
}

function StatusIcon({ status }: { status: WaterParameter['status'] }) {
  switch (status) {
    case 'ideal':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'acceptable':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
}

function ChangeIcon({ change }: { change: { type: 'up' | 'down' | 'same'; percentage: number } }) {
  switch (change.type) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-red-600" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 text-green-600" />;
    case 'same':
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
}