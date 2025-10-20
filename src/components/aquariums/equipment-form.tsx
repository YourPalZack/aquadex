'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEquipment, updateEquipment } from '@/lib/actions/aquarium';
import { createEquipmentSchema } from '@/lib/validations/aquarium';
import type { Equipment, CreateEquipmentData, UpdateEquipmentData } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EquipmentFormProps {
  aquariumId: string;
  mode: 'create' | 'edit';
  initialData?: Equipment;
}

export function EquipmentForm({ aquariumId, mode, initialData }: EquipmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: initialData
      ? {
          aquariumId: initialData.aquariumId,
          name: initialData.name,
          type: initialData.type,
          brand: initialData.brand || '',
          model: initialData.model || '',
          purchaseDate: initialData.purchaseDate 
            ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
            : '',
          lastMaintenanceDate: initialData.lastMaintenanceDate
            ? new Date(initialData.lastMaintenanceDate).toISOString().split('T')[0]
            : '',
          maintenanceIntervalDays: initialData.maintenanceIntervalDays || 30,
          notes: initialData.notes || '',
        }
      : {
          aquariumId,
          name: '',
          type: 'filter',
          brand: '',
          model: '',
          purchaseDate: '',
          lastMaintenanceDate: '',
          maintenanceIntervalDays: 30,
          notes: '',
        },
  });

  const equipmentType = watch('type');

  const onSubmit = async (data: CreateEquipmentData | UpdateEquipmentData) => {
    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'create') {
        result = await createEquipment(data as CreateEquipmentData);
      } else {
        result = await updateEquipment({
          ...data,
          id: initialData!.id,
        } as UpdateEquipmentData);
      }

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: mode === 'create' ? 'Equipment added successfully' : 'Equipment updated successfully',
        });
        router.push(`/aquariums/${aquariumId}`);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Equipment Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Canister Filter, LED Light"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select
          value={equipmentType}
          onValueChange={(value) => setValue('type', value as any)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filter">Filter</SelectItem>
            <SelectItem value="heater">Heater</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="pump">Pump</SelectItem>
            <SelectItem value="skimmer">Skimmer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          {...register('brand')}
          placeholder="e.g., Fluval, Eheim, Aqueon"
        />
        {errors.brand && (
          <p className="text-sm text-destructive">{errors.brand.message}</p>
        )}
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          {...register('model')}
          placeholder="e.g., FX6, 2217, ProFlex"
        />
        {errors.model && (
          <p className="text-sm text-destructive">{errors.model.message}</p>
        )}
      </div>

      {/* Purchase Date */}
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          {...register('purchaseDate')}
        />
        {errors.purchaseDate && (
          <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>
        )}
      </div>

      {/* Last Maintenance Date */}
      <div className="space-y-2">
        <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
        <Input
          id="lastMaintenanceDate"
          type="date"
          {...register('lastMaintenanceDate')}
        />
        {errors.lastMaintenanceDate && (
          <p className="text-sm text-destructive">{errors.lastMaintenanceDate.message}</p>
        )}
      </div>

      {/* Maintenance Interval */}
      <div className="space-y-2">
        <Label htmlFor="maintenanceIntervalDays">Maintenance Interval (Days)</Label>
        <Input
          id="maintenanceIntervalDays"
          type="number"
          min="1"
          max="365"
          {...register('maintenanceIntervalDays', { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          How often this equipment needs maintenance (1-365 days)
        </p>
        {errors.maintenanceIntervalDays && (
          <p className="text-sm text-destructive">{errors.maintenanceIntervalDays.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional information, specifications, or maintenance notes..."
          rows={4}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Add Equipment' : 'Update Equipment'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
