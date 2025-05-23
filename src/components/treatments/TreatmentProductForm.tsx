
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { WaterTreatmentProductFormValues } from '@/types';

const treatmentProductFormSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }).max(100, { message: 'Product name cannot exceed 100 characters.' }),
  brand: z.string().max(50, {message: 'Brand cannot exceed 50 characters.'}).optional(),
  type: z.string().max(50, {message: 'Type cannot exceed 50 characters.'}).optional(),
  notes: z.string().max(300, {message: 'Notes cannot exceed 300 characters.'}).optional(),
});


interface TreatmentProductFormProps {
  onSubmit: (values: WaterTreatmentProductFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<WaterTreatmentProductFormValues>;
  isSubmitting?: boolean;
}

export default function TreatmentProductForm({ onSubmit, onCancel, defaultValues, isSubmitting }: TreatmentProductFormProps) {
  const form = useForm<WaterTreatmentProductFormValues>({
    resolver: zodResolver(treatmentProductFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      brand: defaultValues?.brand || '',
      type: defaultValues?.type || '',
      notes: defaultValues?.notes || '',
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name*</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Seachem Prime" {...field} />
              </FormControl>
              <FormDescription>The specific name of the water treatment product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Seachem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Dechlorinator, Beneficial Bacteria, Algaecide" {...field} />
              </FormControl>
              <FormDescription>The category or type of the treatment product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any personal notes about this product, e.g., 'Use during water changes', 'Treats 100 gallons'."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            {isSubmitting ? 'Adding Product...' : 'Add Product & Get Links'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
