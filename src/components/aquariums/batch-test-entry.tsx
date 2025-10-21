/**
 * Batch Water Test Entry Component
 * Allows efficient entry of multiple water tests across multiple aquariums
 */

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Upload, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Beaker,
  Fish,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Aquarium, WaterTest, WaterParameter } from '@/types/aquarium';

interface BatchTestEntryProps {
  aquariums: Aquarium[];
  onSaveTests?: (tests: Partial<WaterTest>[]) => Promise<void>;
  className?: string;
}

interface BatchTestData {
  id: string;
  aquariumId: string;
  testDate: string;
  testTime: string;
  parameters: WaterParameter[];
  notes: string;
  selected: boolean;
}

// Common parameter templates for different aquarium types
const PARAMETER_TEMPLATES = {
  freshwater: [
    { name: 'pH', unit: '', defaultValue: '' },
    { name: 'Ammonia', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrite', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrate', unit: 'ppm', defaultValue: '' },
    { name: 'Temperature', unit: '°F', defaultValue: '' },
    { name: 'Alkalinity', unit: 'ppm', defaultValue: '' },
  ],
  saltwater: [
    { name: 'pH', unit: '', defaultValue: '' },
    { name: 'Ammonia', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrite', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrate', unit: 'ppm', defaultValue: '' },
    { name: 'Temperature', unit: '°F', defaultValue: '' },
    { name: 'Salinity', unit: 'sg', defaultValue: '' },
    { name: 'Alkalinity', unit: 'dKH', defaultValue: '' },
  ],
  brackish: [
    { name: 'pH', unit: '', defaultValue: '' },
    { name: 'Ammonia', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrite', unit: 'ppm', defaultValue: '' },
    { name: 'Nitrate', unit: 'ppm', defaultValue: '' },
    { name: 'Temperature', unit: '°F', defaultValue: '' },
    { name: 'Salinity', unit: 'sg', defaultValue: '' },
  ]
};

export function BatchTestEntry({ aquariums, onSaveTests, className }: BatchTestEntryProps) {
  const { toast } = useToast();
  const [batchTests, setBatchTests] = useState<BatchTestData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [bulkParameterValues, setBulkParameterValues] = useState<Record<string, string>>({});

  // Create a new batch test entry
  const createNewBatchTest = (aquariumId?: string) => {
    const selectedAquarium = aquariumId ? 
      aquariums.find(a => a.id === aquariumId) : 
      aquariums[0];
    
    if (!selectedAquarium) return;

    const template = PARAMETER_TEMPLATES[selectedAquarium.waterType];
    const now = new Date();
    
    const newTest: BatchTestData = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      aquariumId: selectedAquarium.id,
      testDate: format(now, 'yyyy-MM-dd'),
      testTime: format(now, 'HH:mm'),
      parameters: template.map(param => ({
        name: param.name,
        value: parseFloat(param.defaultValue) || 0,
        unit: param.unit,
        status: 'acceptable' as const,
      })),
      notes: '',
      selected: true,
    };

    setBatchTests(prev => [...prev, newTest]);
  };

  // Remove a batch test entry
  const removeBatchTest = (testId: string) => {
    setBatchTests(prev => prev.filter(test => test.id !== testId));
  };

  // Update a batch test field
  const updateBatchTest = useCallback((testId: string, field: keyof BatchTestData, value: any) => {
    setBatchTests(prev => prev.map(test => 
      test.id === testId ? { ...test, [field]: value } : test
    ));
  }, []);

  // Update a parameter value within a batch test
  const updateParameter = useCallback((testId: string, paramName: string, value: number) => {
    setBatchTests(prev => prev.map(test => 
      test.id === testId ? {
        ...test,
        parameters: test.parameters.map(param =>
          param.name === paramName ? { 
            ...param, 
            value,
            status: 'acceptable' as const // Reset status when value changes
          } : param
        )
      } : test
    ));
  }, []);

  // Copy values from one test to selected tests
  const copyTestValues = (sourceTestId: string) => {
    const sourceTest = batchTests.find(test => test.id === sourceTestId);
    if (!sourceTest) return;

    setBatchTests(prev => prev.map(test => {
      if (test.id !== sourceTestId && test.selected) {
        return {
          ...test,
          parameters: sourceTest.parameters.map(sourceParam => ({
            ...sourceParam,
            status: 'acceptable' as const
          })),
          testDate: sourceTest.testDate,
          testTime: sourceTest.testTime,
        };
      }
      return test;
    }));

    const copiedCount = batchTests.filter(test => test.id !== sourceTestId && test.selected).length;
    toast({
      title: "Values Copied",
      description: `Test values copied to ${copiedCount} selected test${copiedCount !== 1 ? 's' : ''}`,
    });
  };

  // Apply bulk parameter values to selected tests
  const applyBulkValues = () => {
    const selectedTests = batchTests.filter(test => test.selected);
    if (selectedTests.length === 0) {
      toast({
        title: "No Tests Selected",
        description: "Please select tests to apply bulk values",
        variant: "destructive",
      });
      return;
    }

    setBatchTests(prev => prev.map(test => {
      if (test.selected) {
        return {
          ...test,
          parameters: test.parameters.map(param => {
            const bulkValue = bulkParameterValues[param.name];
            return bulkValue ? {
              ...param,
              value: parseFloat(bulkValue),
              status: 'acceptable' as const
            } : param;
          })
        };
      }
      return test;
    }));

    toast({
      title: "Bulk Values Applied",
      description: `Values applied to ${selectedTests.length} selected test${selectedTests.length !== 1 ? 's' : ''}`,
    });
  };

  // Toggle selection for all tests
  const toggleAllTests = () => {
    const allSelected = batchTests.every(test => test.selected);
    setBatchTests(prev => prev.map(test => ({ ...test, selected: !allSelected })));
  };

  // Quick add tests for all aquariums
  const addTestsForAllAquariums = () => {
    aquariums.forEach(aquarium => {
      createNewBatchTest(aquarium.id);
    });
  };

  // Save all batch tests
  const handleSaveBatchTests = async () => {
    const selectedTests = batchTests.filter(test => test.selected);
    
    if (selectedTests.length === 0) {
      toast({
        title: "No Tests Selected",
        description: "Please select tests to save",
        variant: "destructive",
      });
      return;
    }

    // Validate tests
    const validationErrors: string[] = [];
    selectedTests.forEach((test, index) => {
      const aquarium = aquariums.find(a => a.id === test.aquariumId);
      if (!aquarium) {
        validationErrors.push(`Test ${index + 1}: Invalid aquarium`);
      }
      
      const hasValidParameters = test.parameters.some(param => param.value > 0);
      if (!hasValidParameters) {
        validationErrors.push(`Test ${index + 1} (${aquarium?.name}): No parameter values entered`);
      }
    });

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: `${validationErrors.length} error${validationErrors.length !== 1 ? 's' : ''} found. Please fix and try again.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);

    try {
      const testsToSave: Partial<WaterTest>[] = selectedTests.map(test => {
        const aquarium = aquariums.find(a => a.id === test.aquariumId)!;
        const testDateTime = new Date(`${test.testDate}T${test.testTime}`);
        
        return {
          aquariumId: test.aquariumId,
          testDate: testDateTime,
          parameters: test.parameters.filter(param => param.value > 0),
          notes: test.notes || undefined,
        };
      });

      // Simulate progress for batch saving
      for (let i = 0; i <= testsToSave.length; i++) {
        setSaveProgress((i / testsToSave.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate processing time
      }

      await onSaveTests?.(testsToSave);

      toast({
        title: "Batch Tests Saved",
        description: `Successfully saved ${testsToSave.length} water test${testsToSave.length !== 1 ? 's' : ''}`,
      });

      // Clear saved tests
      setBatchTests(prev => prev.filter(test => !test.selected));
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save batch tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const selectedTestsCount = batchTests.filter(test => test.selected).length;
  const totalParametersCount = batchTests.reduce((sum, test) => 
    sum + (test.selected ? test.parameters.filter(p => p.value > 0).length : 0), 0
  );

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Batch Test Entry
              </CardTitle>
              <CardDescription>
                Enter multiple water tests efficiently across your aquariums
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addTestsForAllAquariums}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Add All Aquariums
              </Button>
              <Button
                onClick={() => createNewBatchTest()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bulk Actions */}
          {batchTests.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Bulk Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Apply values to multiple tests at once
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllTests}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {batchTests.every(test => test.selected) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>

              {/* Bulk Parameter Values */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.keys(PARAMETER_TEMPLATES.freshwater).map(i => {
                  const param = PARAMETER_TEMPLATES.freshwater[parseInt(i)];
                  return (
                    <div key={param.name}>
                      <Label className="text-xs">{param.name} {param.unit && `(${param.unit})`}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Bulk value"
                        value={bulkParameterValues[param.name] || ''}
                        onChange={(e) => setBulkParameterValues(prev => ({
                          ...prev,
                          [param.name]: e.target.value
                        }))}
                        className="h-8"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyBulkValues}
                  disabled={selectedTestsCount === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Apply to Selected ({selectedTestsCount})
                </Button>
              </div>
            </div>
          )}

          {/* Test Entries */}
          <div className="space-y-4">
            {batchTests.map((test, index) => {
              const aquarium = aquariums.find(a => a.id === test.aquariumId);
              
              return (
                <Card key={test.id} className={cn('border-2', test.selected ? 'border-primary' : 'border-muted')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={test.selected}
                          onCheckedChange={(checked) => 
                            updateBatchTest(test.id, 'selected', checked)
                          }
                        />
                        <div>
                          <h4 className="font-medium">Test #{index + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            {aquarium?.name} • {aquarium?.waterType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTestValues(test.id)}
                          className="gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Values
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBatchTest(test.id)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Aquarium and Date/Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Aquarium</Label>
                        <Select 
                          value={test.aquariumId}
                          onValueChange={(value) => updateBatchTest(test.id, 'aquariumId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {aquariums.map(aquarium => (
                              <SelectItem key={aquarium.id} value={aquarium.id}>
                                <div className="flex items-center gap-2">
                                  <Fish className="h-3 w-3" />
                                  {aquarium.name}
                                  <Badge variant="outline" className="text-xs">
                                    {aquarium.waterType}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Date</Label>
                        <Input
                          type="date"
                          value={test.testDate}
                          onChange={(e) => updateBatchTest(test.id, 'testDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <Input
                          type="time"
                          value={test.testTime}
                          onChange={(e) => updateBatchTest(test.id, 'testTime', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Parameters */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Parameters</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {test.parameters.map((param) => (
                          <div key={param.name}>
                            <Label className="text-xs">
                              {param.name} {param.unit && `(${param.unit})`}
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={param.value || ''}
                              onChange={(e) => updateParameter(
                                test.id, 
                                param.name, 
                                parseFloat(e.target.value) || 0
                              )}
                              className="h-8"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-sm">Notes (Optional)</Label>
                      <Textarea
                        value={test.notes}
                        onChange={(e) => updateBatchTest(test.id, 'notes', e.target.value)}
                        placeholder="Add any observations or notes about this test..."
                        className="h-20 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {batchTests.length === 0 && (
            <Card className="p-8 text-center">
              <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Batch Tests</h3>
              <p className="text-muted-foreground mb-4">
                Add water tests to get started with batch entry
              </p>
              <Button onClick={() => createNewBatchTest()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Test
              </Button>
            </Card>
          )}

          {/* Save Section */}
          {batchTests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="font-medium">
                    {selectedTestsCount} test{selectedTestsCount !== 1 ? 's' : ''} selected
                  </div>
                  <div className="text-muted-foreground">
                    {totalParametersCount} parameter{totalParametersCount !== 1 ? 's' : ''} to save
                  </div>
                </div>
                {isSaving && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <div className="w-24">
                      <Progress value={saveProgress} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(saveProgress)}%
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleSaveBatchTests}
                disabled={selectedTestsCount === 0 || isSaving}
                className="gap-2"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Save Batch Tests
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}