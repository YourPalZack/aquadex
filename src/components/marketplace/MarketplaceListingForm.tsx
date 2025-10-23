
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
import { useEffect, useRef, useState } from 'react';

const listingFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title cannot exceed 100 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  price: z.string().min(1, { message: 'Price is required.' }).max(50, { message: 'Price display cannot exceed 50 characters (e.g., "$25.00", "Contact for Price").' }),
  categorySlug: z.string({ required_error: 'Please select a category.' }),
  condition: z.enum(marketplaceItemConditions, { required_error: 'Please select the item condition.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).min(1, {message: 'Image URL is required.'}),
  imageHint: z.string().max(50, { message: 'Image hint cannot exceed 50 characters.' }).optional(),
  location: z.string().max(100, { message: 'Location cannot exceed 100 characters.' }).optional(),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
});


interface MarketplaceListingFormProps {
  onSubmit: (values: MarketplaceListingFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<MarketplaceListingFormValues>;
}

export default function MarketplaceListingForm({ onSubmit, onCancel, isLoading: parentIsLoading, defaultValues }: MarketplaceListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveMessage, setLiveMessage] = useState<string>('');
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const [errorList, setErrorList] = useState<Array<{ name: keyof MarketplaceListingFormValues; message: string }>>([]);
  
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
    setLiveMessage('Submitting your listing...');
    await onSubmit(values);
    setIsSubmitting(false);
    setLiveMessage('Listing submitted successfully.');
    // form.reset(); // Parent component will handle redirection/toast, so reset might not be needed here.
  };

  const handleError = (errors: Parameters<ReturnType<typeof form.handleSubmit>>[1]) => {
    // Build a flat error list and focus the first invalid field
    const entries = Object.entries(form.formState.errors) as Array<[
      keyof MarketplaceListingFormValues,
      { message?: string }
    ]>;
    const list = entries
      .filter(([, err]) => !!err)
      .map(([name, err]) => ({ name, message: err.message ?? 'This field is required.' }));
    setErrorList(list);
    setLiveMessage('Please correct the errors in the form.');

    // Focus first invalid field by name attribute
    const first = list[0]?.name as string | undefined;
    if (first) {
      const el = document.querySelector<HTMLElement>(`[name="${first}"]`) ||
                 document.getElementById(`listing-${first}`) as HTMLElement | null;
      if (el?.focus) el.focus();
    }

    // Move screen reader cursor to the error summary
    if (errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  };

  // Derive ids for accessibility wiring
  const ids = {
    title: 'listing-title',
    titleDesc: 'listing-title-desc',
    category: 'listing-category',
    categoryLabel: 'listing-category-label',
    categoryDesc: 'listing-category-desc',
    price: 'listing-price',
    priceDesc: 'listing-price-desc',
    condition: 'listing-condition',
    conditionLabel: 'listing-condition-label',
    description: 'listing-description',
    imageUrl: 'listing-image-url',
    imageUrlDesc: 'listing-image-url-desc',
    imageHint: 'listing-image-hint',
    imageHintDesc: 'listing-image-hint-desc',
    location: 'listing-location',
    locationDesc: 'listing-location-desc',
    tags: 'listing-tags',
    tagsDesc: 'listing-tags-desc',
  } as const;
  
  const conditionDisplay: Record<MarketplaceItemCondition, string> = {
    'new': 'New',
    'used-like-new': 'Used - Like New',
    'used-good': 'Used - Good',
    'used-fair': 'Used - Fair',
    'for-parts': 'For Parts/Not Working',
  };


  return (
    <Form {...form}>
      {/* Live region for submit and error updates */}
      <p aria-live="polite" role="status" className="sr-only">{liveMessage}</p>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleError)}
        className="space-y-6"
        noValidate
        aria-busy={isSubmitting || !!parentIsLoading}
      >
        {errorList.length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="listing-error-summary-title"
            className="rounded-md border border-destructive bg-destructive/5 p-4 text-destructive"
          >
            <h2 id="listing-error-summary-title" className="font-semibold">Please correct the following errors:</h2>
            <ul className="list-disc pl-5 mt-2">
              {errorList.map((err, idx) => (
                <li key={idx}>
                  <a href={`#listing-${err.name}`} className="underline">
                    {err.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.title}>Listing Title</FormLabel>
              <FormControl>
                <Input
                  id={ids.title}
                  placeholder="e.g., Beautiful Blue Ram Cichlid Pair"
                  aria-describedby={ids.titleDesc}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormDescription id={ids.titleDesc}>
                A clear, concise title for your item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorySlug"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel id={ids.categoryLabel}>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    id={ids.category}
                    aria-labelledby={ids.categoryLabel}
                    aria-describedby={ids.categoryDesc}
                    aria-invalid={!!fieldState.error}
                  >
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
              <FormDescription id={ids.categoryDesc}>
                Choose the most relevant category to help buyers find your item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.price}>Price</FormLabel>
              <FormControl>
                <Input
                  id={ids.price}
                  placeholder="e.g., $25.00 or OBO or Contact for Price"
                  aria-describedby={ids.priceDesc}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormDescription id={ids.priceDesc}>
                Enter the price or how buyers should inquire.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="condition"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel id={ids.conditionLabel}>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    id={ids.condition}
                    aria-labelledby={ids.conditionLabel}
                    aria-invalid={!!fieldState.error}
                  >
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.description}>Detailed Description</FormLabel>
              <FormControl>
                <Textarea
                  id={ids.description}
                  placeholder="Describe your item thoroughly. Include details like age, size, quantity, specific features, reasons for selling, etc. Be honest about any flaws if it's a used item."
                  className="resize-none min-h-[150px]"
                  aria-invalid={!!fieldState.error}
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.imageUrl}>Image URL</FormLabel>
              <FormControl>
                <Input
                  id={ids.imageUrl}
                  type="url"
                  placeholder="https://example.com/your-item.jpg"
                  aria-describedby={ids.imageUrlDesc}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormDescription id={ids.imageUrlDesc}>
                A direct link to an image of your item. Use a service like Imgur if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
         <FormField
          control={form.control}
          name="imageHint"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.imageHint}>Image Hint (Optional)</FormLabel>
              <FormControl>
                <Input
                  id={ids.imageHint}
                  placeholder="e.g., blue cichlid, planted tank light"
                  aria-describedby={ids.imageHintDesc}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormDescription id={ids.imageHintDesc}>
                One or two keywords for the placeholder image if a real image URL isn't used immediately (e.g., during testing).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.location}>Location (Optional)</FormLabel>
              <FormControl>
                <Input
                  id={ids.location}
                  placeholder="e.g., Springfield, IL or Local Pickup Only"
                  aria-describedby={ids.locationDesc}
                  aria-invalid={!!fieldState.error}
                  {...field}
                />
              </FormControl>
              <FormDescription id={ids.locationDesc}>
                City/State, or if it's for local pickup only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor={ids.tags}>Tags (Optional)</FormLabel>
              <FormControl>
                 <Input 
                    id={ids.tags}
                    placeholder="e.g., freshwater, cichlid, rare, LED light" 
                    {...field}
                    // @ts-ignore 
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                    aria-describedby={ids.tagsDesc}
                    aria-invalid={!!fieldState.error}
                 />
              </FormControl>
              <FormDescription id={ids.tagsDesc}>
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
