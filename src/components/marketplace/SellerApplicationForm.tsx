
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
import type { SellerApplicationFormValues } from '@/types';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const sellerApplicationSchema = z.object({
  storeName: z.string().min(3, { message: 'Store name must be at least 3 characters.' }).max(50, { message: 'Store name cannot exceed 50 characters.' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  reasonToSell: z.string().min(20, { message: 'Please provide a brief reason (at least 20 characters).' }).max(500, { message: 'Reason cannot exceed 500 characters.' }),
  productTypes: z.string().min(10, { message: 'Please list the types of products you plan to sell (at least 10 characters).' }).max(300, { message: 'Product types description cannot exceed 300 characters.' }),
});


interface SellerApplicationFormProps {
  onSubmit: (values: SellerApplicationFormValues) => Promise<void>;
}

export default function SellerApplicationForm({ onSubmit }: SellerApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SellerApplicationFormValues>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      storeName: '',
      contactEmail: '',
      reasonToSell: '',
      productTypes: '',
    },
  });

  const handleSubmit = async (values: SellerApplicationFormValues) => {
    setIsLoading(true);
    await onSubmit(values);
    setIsLoading(false);
    // Reset form only if submission was truly successful, parent component can handle this logic.
    // form.reset(); 
  };

  // Focus first invalid field on failed submit
  const onInvalid = (errors: Record<string, unknown>) => {
    const first = Object.keys(errors)[0];
    if (first) {
      const el = document.querySelector(`[name="${first}"]`) as HTMLElement | null;
      el?.focus();
    }
  };

  const { errors } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-6" noValidate>
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>There’s a problem</AlertTitle>
            <AlertDescription>
              Please review the following fields:
              <ul className="list-disc list-inside mt-2">
                {Object.entries(errors).map(([name, err]) => {
                  const msg = (err as any)?.message as string | undefined;
                  return <li key={name}><strong>{name}</strong>{msg ? ` — ${msg}` : ''}</li>;
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Store/Seller Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bob's Rare Fish, AquaGreen Plants" required {...field} />
              </FormControl>
              <FormDescription>
                The name that will be displayed to buyers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" required {...field} />
              </FormControl>
              <FormDescription>
                We'll use this email to contact you regarding your application.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="productTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you plan to sell?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Home-bred freshwater fish, rare aquatic plants, used aquarium equipment, custom 3D printed accessories..."
                  className="resize-none"
                  rows={3}
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly describe the types of items you intend to list.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reasonToSell"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why do you want to sell on AquaDex?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., I'm a hobbyist breeder looking to share my fish, I have surplus equipment, I create custom aquarium products..."
                  className="resize-none"
                  rows={3}
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Help us understand your motivation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
