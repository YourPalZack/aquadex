
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
import { 
    marketplaceCategoriesData, 
    marketplaceItemConditions, 
    type MarketplaceListingFormValues,
    type MarketplaceItemCondition
} from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const listingFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title cannot exceed 100 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  price: z.string().min(1, { message: 'Price is required.' }).max(50, { message: 'Price display cannot exceed 50 characters (e.g., "$25.00", "Contact for Price").' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  condition: z.enum(marketplaceItemConditions, { required_error: 'Please select the item condition.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).min(1, {message: 'Image URL is required.'}),
  imageHint: z.string().max(50, { message: 'Image hint cannot exceed 50 characters.' }).optional(),
  location: z.string().max(100, { message: 'Location cannot exceed 100 characters.' }).optional(),
  tags: z.union([
    z.string().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
    z.array(z.string())
  ]).optional(),
});


interface MarketplaceListingFormProps {
  onSubmit: (values: MarketplaceListingFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<MarketplaceListingFormValues>;
}

export default function MarketplaceListingForm({ onSubmit, onCancel, isLoading: parentIsLoading, defaultValues }: MarketplaceListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MarketplaceListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      price: defaultValues?.price || '',
      categorySlug: defaultValues?.categorySlug || '',
      condition: defaultValues?.condition || marketplaceItemConditions[0],
      imageUrl: defaultValues?.imageUrl || '',
      imageHint: defaultValues?.imageHint || '',
      location: defaultValues?.location || '',
      tags: defaultValues?.tags || [],
    },
  });

  const handleSubmit = async (values: MarketplaceListingFormValues) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
    // form.reset(); // Parent component will handle redirection/toast, so reset might not be needed here.
  };
  
  const conditionDisplay: Record<MarketplaceItemCondition, string> = {
    'new': 'New',
    'used-like-new': 'Used - Like New',
    'used-good': 'Used - Good',
    'used-fair': 'Used - Fair',
    'for-parts': 'For Parts/Not Working',
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Beautiful Blue Ram Cichlid Pair" {...field} />
              </FormControl>
              <FormDescription>
                A clear, concise title for your item.
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category for your item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {marketplaceCategoriesData.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $25.00 or OBO or Contact for Price" {...field} />
              </FormControl>
              <FormDescription>
                Enter the price or how buyers should inquire.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {marketplaceItemConditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {conditionDisplay[cond]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Describe your item thoroughly. Include details like age, size, quantity, specific features, reasons for selling, etc. Be honest about any flaws if it's a used item."
                  className="resize-none min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/your-item.jpg" {...field} />
              </FormControl>
              <FormDescription>
                A direct link to an image of your item. Use a service like Imgur if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
         <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Hint (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., blue cichlid, planted tank light" {...field} />
              </FormControl>
              <FormDescription>
                One or two keywords for the placeholder image if a real image URL isn't used immediately (e.g., during testing).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Springfield, IL or Local Pickup Only" {...field} />
              </FormControl>
              <FormDescription>
                City/State, or if it's for local pickup only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                 <Input 
                    placeholder="e.g., freshwater, cichlid, rare, LED light" 
                    {...field}
                    // @ts-ignore 
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                 />
              </FormControl>
              <FormDescription>
                Comma-separated keywords to help buyers find your item.
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
            Create Listing
          </Button>
        </div>
      </form>
    </Form>
  );
}
