/**
 * Manual Water Test Entry Form
 * Allows users to manually enter water parameters without image upload
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createWaterTest } from '@/lib/actions/water-test';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { WaterParameter } from '@/types/aquarium';

const parameterSchema = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  value: z.coerce.number(),
  unit: z.string(),
  status: z.enum(['ideal', 'acceptable', 'warning', 'critical']),
  idealMin: z.coerce.number().optional(),
  idealMax: z.coerce.number().optional(),
});

const manualTestSchema = z.object({
  aquariumId: z.string().min(1, 'Aquarium is required'),
  testDate: z.string(),
  method: z.enum(['liquid-test', 'digital-meter', 'manual-entry']),
  parameters: z.array(parameterSchema).min(1, 'At least one parameter is required'),
  notes: z.string().optional(),
});

type ManualTestFormData = z.infer<typeof manualTestSchema>;

interface ManualTestFormProps {
  aquariumId: string;
  onSuccess?: () => void;
}

const commonParameters = [
  { name: 'pH', unit: '', idealMin: 6.5, idealMax: 8.5 },
  { name: 'Ammonia (NH3/NH4+)', unit: 'ppm', idealMin: 0, idealMax: 0 },
  { name: 'Nitrite (NO2-)', unit: 'ppm', idealMin: 0, idealMax: 0 },
  { name: 'Nitrate (NO3-)', unit: 'ppm', idealMin: 0, idealMax: 20 },
  { name: 'General Hardness (GH)', unit: 'dGH', idealMin: 4, idealMax: 12 },
  { name: 'Carbonate Hardness (KH)', unit: 'dKH', idealMin: 3, idealMax: 10 },
  { name: 'Temperature', unit: '°F', idealMin: 72, idealMax: 82 },
  { name: 'Salinity', unit: 'ppt', idealMin: 30, idealMax: 35 },
];

export function ManualTestForm({ aquariumId, onSuccess }: ManualTestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ManualTestFormData>({
    resolver: zodResolver(manualTestSchema),
    defaultValues: {
      aquariumId,
      testDate: new Date().toISOString().slice(0, 16),
      method: 'manual-entry',
      parameters: [
        { name: 'pH', value: 7.0, unit: '', status: 'acceptable', idealMin: 6.5, idealMax: 8.5 },
      ],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parameters',
  });

  const determineStatus = (value: number, idealMin?: number, idealMax?: number): 'ideal' | 'acceptable' | 'warning' | 'critical' => {
    if (idealMin === undefined || idealMax === undefined) return 'acceptable';
    
    if (value >= idealMin && value <= idealMax) return 'ideal';
    
    const minDiff = Math.abs(value - idealMin);
    const maxDiff = Math.abs(value - idealMax);
    const range = idealMax - idealMin;
    const tolerance = range * 0.2; // 20% tolerance
    
    if (value < idealMin) {
      if (minDiff <= tolerance) return 'acceptable';
      if (minDiff <= tolerance * 2) return 'warning';
      return 'critical';
    } else {
      if (maxDiff <= tolerance) return 'acceptable';
      if (maxDiff <= tolerance * 2) return 'warning';
      return 'critical';
    }
  };

  const onSubmit = async (data: ManualTestFormData) => {
    setIsSubmitting(true);
    try {
      // Convert form data to WaterParameter format
      const parameters: WaterParameter[] = data.parameters.map(p => ({
        name: p.name,
        value: p.value,
        unit: p.unit,
        status: determineStatus(p.value, p.idealMin, p.idealMax),
        idealRange: p.idealMin !== undefined && p.idealMax !== undefined 
          ? { min: p.idealMin, max: p.idealMax }
          : undefined,
      }));

      const result = await createWaterTest({
        aquariumId: data.aquariumId,
        testDate: new Date(data.testDate),
        method: data.method,
        parameters,
        notes: data.notes,
        recommendations: [],
      });

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Water test saved successfully',
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/aquariums/${aquariumId}`);
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error saving water test:', error);
      toast({
        title: 'Error',
        description: 'Failed to save water test',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParameter = (paramName?: string) => {
    const template = paramName 
      ? commonParameters.find(p => p.name === paramName)
      : undefined;
    
    append({
      name: template?.name || '',
      value: 0,
      unit: template?.unit || '',
      status: 'acceptable',
      idealMin: template?.idealMin,
      idealMax: template?.idealMax,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Test Information */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
          <CardDescription>When and how was the test performed?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testDate">Test Date & Time</Label>
              <Input
                id="testDate"
                type="datetime-local"
                {...form.register('testDate')}
              />
              {form.formState.errors.testDate && (
                <p className="text-sm text-destructive">{form.formState.errors.testDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Test Method</Label>
              <Select
                value={form.watch('method')}
                onValueChange={(value) => form.setValue('method', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquid-test">Liquid Test Kit</SelectItem>
                  <SelectItem value="digital-meter">Digital Meter</SelectItem>
                  <SelectItem value="manual-entry">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Water Parameters</CardTitle>
              <CardDescription>Enter measured values for each parameter</CardDescription>
            </div>
            <Select onValueChange={addParameter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add parameter..." />
              </SelectTrigger>
              <SelectContent>
                {commonParameters.map((param) => (
                  <SelectItem key={param.name} value={param.name}>
                    {param.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No parameters added yet. Use the dropdown above to add parameters.</p>
            </div>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Parameter {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Parameter Name</Label>
                  <Input
                    {...form.register(`parameters.${index}.name`)}
                    placeholder="e.g., pH"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`parameters.${index}.value`)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    {...form.register(`parameters.${index}.unit`)}
                    placeholder="ppm, dGH, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.watch(`parameters.${index}.status`)}
                    onValueChange={(value) => form.setValue(`parameters.${index}.status`, value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ideal">Ideal</SelectItem>
                      <SelectItem value="acceptable">Acceptable</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ideal Range Min (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`parameters.${index}.idealMin`)}
                    placeholder="e.g., 0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ideal Range Max (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`parameters.${index}.idealMax`)}
                    placeholder="e.g., 20"
                  />
                </div>
              </div>
            </div>
          ))}

          {form.formState.errors.parameters && (
            <p className="text-sm text-destructive">
              {form.formState.errors.parameters.message}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => addParameter()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Parameter
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes (Optional)</CardTitle>
          <CardDescription>Add any additional observations or comments</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('notes')}
            placeholder="e.g., Performed after 25% water change..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Test Results'
          )}
        </Button>
      </div>
    </form>
  );
}
