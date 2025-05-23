
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormState as useReactHookFormState } from 'react-hook-form';
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
import type { FishFoodFormValues } from '@/types';

const fishFoodFormSchema = z.object({
  name: z.string().min(2, { message: 'Food name must be at least 2 characters.' }).max(100, { message: 'Food name cannot exceed 100 characters.' }),
  brand: z.string().max(50, {message: 'Brand cannot exceed 50 characters.'}).optional(),
  variant: z.string().max(100, {message: 'Variant/Size cannot exceed 100 characters.'}).optional(),
  notes: z.string().max(300, {message: 'Notes cannot exceed 300 characters.'}).optional(),
});


interface FoodFormProps {
  onSubmit: (values: FishFoodFormValues) => void; // Changed to accept FishFoodFormValues directly
  onCancel: () => void;
  defaultValues?: Partial<FishFoodFormValues>;
  isSubmitting?: boolean; // Renamed from isLoading for clarity
}

export default function FoodForm({ onSubmit, onCancel, defaultValues, isSubmitting }: FoodFormProps) {
  const form = useForm<FishFoodFormValues>({
    resolver: zodResolver(fishFoodFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      brand: defaultValues?.brand || '',
      variant: defaultValues?.variant || '',
      notes: defaultValues?.notes || '',
    },
  });
  
  // We don't need to use useFormStatus here if formAction is not directly used by this component.
  // The parent component (/foods/page.tsx) will handle the form submission state via useFormState.

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Name*</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Hikari Cichlid Gold Pellets" {...field} />
              </FormControl>
              <FormDescription>The specific name of the fish food product.</FormDescription>
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
                <Input placeholder="E.g., Hikari" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant/Size (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Medium Pellet, 8.8 oz, Color Enhancing" {...field} />
              </FormControl>
              <FormDescription>Specific type, size, or characteristic of the food.</FormDescription>
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
                  placeholder="Any personal notes about this food, e.g., 'Fish love this', 'Use sparingly'."
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
            {isSubmitting ? 'Adding Food...' : 'Add Food & Get Links'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
