
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { marketplaceCategoriesData, type WantedItemFormValues } from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const wantedItemFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title cannot exceed 100 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(1000, { message: 'Description cannot exceed 1000 characters.' }),
  categorySlug: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
});


interface WantedItemFormProps {
  onSubmit: (values: WantedItemFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function WantedItemForm({ onSubmit, onCancel, isLoading: parentIsLoading }: WantedItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<WantedItemFormValues>({
    resolver: zodResolver(wantedItemFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categorySlug: '',
      tags: [],
    },
  });

  const handleSubmit = async (values: WantedItemFormValues) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
    // form.reset(); // Optionally reset form, parent can control this
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Title / What are you looking for?</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Healthy Blue Ram Cichlids (Pair)" {...field} />
              </FormControl>
              <FormDescription>
                A clear and concise title for the item you want.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a relevant category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No Specific Category</SelectItem>
                  {marketplaceCategoriesData.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Helps others find your request if it relates to a specific marketplace category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item you're looking for in detail. Include specific requirements, condition (if applicable), quantity, etc. The more details, the better!"
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relevant Tags (Optional)</FormLabel>
              <FormControl>
                 <Input 
                    placeholder="e.g., freshwater, cichlid, breeding pair, local pickup" 
                    {...field}
                    // @ts-ignore // Handling string array for input
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                 />
              </FormControl>
              <FormDescription>
                Comma-separated tags. Helps people find your wanted ad.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || parentIsLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || parentIsLoading}>
            {(isSubmitting || parentIsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Wanted Item
          </Button>
        </div>
      </form>
    </Form>
  );
}
