'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLivestock, updateLivestock } from '@/lib/actions/aquarium';
import { createLivestockSchema } from '@/lib/validations/aquarium';
import type { Livestock, CreateLivestockData, UpdateLivestockData } from '@/types/aquarium';
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

interface LivestockFormProps {
  aquariumId: string;
  mode: 'create' | 'edit';
  initialData?: Livestock;
}

export function LivestockForm({ aquariumId, mode, initialData }: LivestockFormProps) {
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
    resolver: zodResolver(createLivestockSchema),
    defaultValues: initialData
      ? {
          aquariumId: initialData.aquariumId,
          type: initialData.type,
          species: initialData.species,
          commonName: initialData.commonName || '',
          scientificName: initialData.scientificName || '',
          quantity: initialData.quantity,
          addedDate: initialData.addedDate,
          imageUrl: initialData.imageUrl || '',
          notes: initialData.notes || '',
        }
      : {
          aquariumId,
          type: 'fish',
          species: '',
          commonName: '',
          scientificName: '',
          quantity: 1,
          addedDate: new Date().toISOString().split('T')[0],
          imageUrl: '',
          notes: '',
        },
  });

  const livestockType = watch('type');

  const onSubmit = async (data: CreateLivestockData | UpdateLivestockData) => {
    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'create') {
        result = await createLivestock(data as CreateLivestockData);
      } else {
        result = await updateLivestock({
          ...data,
          id: initialData!.id,
        } as UpdateLivestockData);
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
          description: mode === 'create' ? 'Livestock added successfully' : 'Livestock updated successfully',
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
      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select
          value={livestockType}
          onValueChange={(value) => setValue('type', value as any)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fish">Fish</SelectItem>
            <SelectItem value="coral">Coral</SelectItem>
            <SelectItem value="plant">Plant</SelectItem>
            <SelectItem value="invertebrate">Invertebrate</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Species */}
      <div className="space-y-2">
        <Label htmlFor="species">Species *</Label>
        <Input
          id="species"
          {...register('species')}
          placeholder="e.g., Clownfish, Zoanthid, Java Fern"
        />
        {errors.species && (
          <p className="text-sm text-destructive">{errors.species.message}</p>
        )}
      </div>

      {/* Common Name */}
      <div className="space-y-2">
        <Label htmlFor="commonName">Common Name</Label>
        <Input
          id="commonName"
          {...register('commonName')}
          placeholder="e.g., Ocellaris Clownfish"
        />
        {errors.commonName && (
          <p className="text-sm text-destructive">{errors.commonName.message}</p>
        )}
      </div>

      {/* Scientific Name */}
      <div className="space-y-2">
        <Label htmlFor="scientificName">Scientific Name</Label>
        <Input
          id="scientificName"
          {...register('scientificName')}
          placeholder="e.g., Amphiprion ocellaris"
        />
        {errors.scientificName && (
          <p className="text-sm text-destructive">{errors.scientificName.message}</p>
        )}
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          {...register('quantity', { valueAsNumber: true })}
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity.message}</p>
        )}
      </div>

      {/* Added Date */}
      <div className="space-y-2">
        <Label htmlFor="addedDate">Added Date *</Label>
        <Input
          id="addedDate"
          type="date"
          {...register('addedDate')}
        />
        {errors.addedDate && (
          <p className="text-sm text-destructive">{errors.addedDate.message}</p>
        )}
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          {...register('imageUrl')}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional information about this livestock..."
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
          {mode === 'create' ? 'Add Livestock' : 'Update Livestock'}
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
