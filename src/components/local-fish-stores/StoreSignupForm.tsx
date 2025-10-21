'use client';

/**
 * Store Signup Form Component
 * Allows store owners to register and create their store profile
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { StoreFormData, StoreCategory } from '@/types';
import { createStoreAction } from '@/lib/actions/store-supabase';
import { useToast } from '@/hooks/use-toast';

// Validation schema
const storeSignupSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits (e.g., 5551234567)'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, 'State must be 2-letter code (e.g., MA)').regex(/^[A-Z]{2}$/, 'State must be uppercase'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required (e.g., 02101 or 02101-1234)'),
  
  categories: z.array(z.enum(['freshwater', 'saltwater', 'plants', 'reptiles', 'general'])).min(1, 'Select at least one specialty'),
  
  // Business hours - simplified for initial signup
  mondayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  mondayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  tuesdayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  tuesdayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  wednesdayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  wednesdayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  thursdayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  thursdayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  fridayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  fridayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  saturdayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  saturdayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  sundayOpen: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  sundayClose: z.string().regex(/^\d{2}:\d{2}$/, 'Time format: HH:MM'),
  
  mondayClosed: z.boolean().default(false),
  tuesdayClosed: z.boolean().default(false),
  wednesdayClosed: z.boolean().default(false),
  thursdayClosed: z.boolean().default(false),
  fridayClosed: z.boolean().default(false),
  saturdayClosed: z.boolean().default(false),
  sundayClosed: z.boolean().default(false),
  
  facebook: z.string().url('Valid Facebook URL').optional().or(z.literal('')),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});

type StoreSignupFormData = z.infer<typeof storeSignupSchema>;

interface StoreSignupFormProps {
  onSuccess?: (storeId: string) => void;
  onError?: (error: string) => void;
}

export function StoreSignupForm({ onSuccess, onError }: StoreSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StoreSignupFormData>({
    resolver: zodResolver(storeSignupSchema),
    defaultValues: {
      mondayOpen: '09:00',
      mondayClose: '18:00',
      tuesdayOpen: '09:00',
      tuesdayClose: '18:00',
      wednesdayOpen: '09:00',
      wednesdayClose: '18:00',
      thursdayOpen: '09:00',
      thursdayClose: '18:00',
      fridayOpen: '09:00',
      fridayClose: '18:00',
      saturdayOpen: '10:00',
      saturdayClose: '17:00',
      sundayOpen: '12:00',
      sundayClose: '17:00',
      categories: [],
    },
  });

  const watchCategories = watch('categories') || [];

  const toggleCategory = (category: StoreCategory) => {
    const current = watchCategories;
    return current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
  };

  const onSubmit = async (data: StoreSignupFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Transform form data to StoreFormData format
      const storeData: StoreFormData = {
        business_name: data.business_name,
        email: data.email,
        phone: data.phone,
        website: data.website || undefined,
        description: data.description || undefined,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
        business_hours: {
          monday: data.mondayClosed ? { open: '', close: '', closed: true } : { open: data.mondayOpen, close: data.mondayClose },
          tuesday: data.tuesdayClosed ? { open: '', close: '', closed: true } : { open: data.tuesdayOpen, close: data.tuesdayClose },
          wednesday: data.wednesdayClosed ? { open: '', close: '', closed: true } : { open: data.wednesdayOpen, close: data.wednesdayClose },
          thursday: data.thursdayClosed ? { open: '', close: '', closed: true } : { open: data.thursdayOpen, close: data.thursdayClose },
          friday: data.fridayClosed ? { open: '', close: '', closed: true } : { open: data.fridayOpen, close: data.fridayClose },
          saturday: data.saturdayClosed ? { open: '', close: '', closed: true } : { open: data.saturdayOpen, close: data.saturdayClose },
          sunday: data.sundayClosed ? { open: '', close: '', closed: true } : { open: data.sundayOpen, close: data.sundayClose },
        },
        categories: data.categories,
        social_links: {
          facebook: data.facebook || undefined,
          instagram: data.instagram || undefined,
          twitter: data.twitter || undefined,
        },
      };

      // Call createStoreAction
      const result = await createStoreAction(storeData);
      
      if (result.success) {
        console.log('Store created successfully:', result.data);
        setSubmitSuccess(true);
        toast({
          title: 'Store created',
          description: 'Your store has been created. Please verify your email to activate it.',
        });
        if (onSuccess) {
          onSuccess(result.data?.id || 'success');
        }
      } else {
        setSubmitError(result.error || 'An error occurred while creating your store');
        toast({
          title: 'Failed to create store',
          description: result.error || 'Please try again.',
        });
        if (onError) {
          onError(result.error || 'Failed to create store');
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create store';
      setSubmitError(errorMessage);
      toast({
        title: 'Unexpected error',
        description: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Registration Successful!
          </CardTitle>
          <CardDescription>
            Your store profile has been created. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              We&apos;ve sent a verification email to complete your registration. Once verified, your store will appear in the directory.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Basic details about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              {...register('business_name')}
              placeholder="Joe's Aquarium Shop"
            />
            {errors.business_name && (
              <p className="text-sm text-red-600 mt-1">{errors.business_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@joes-aquarium.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone * (10 digits, no dashes)</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="5551234567"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website')}
              placeholder="https://joes-aquarium.com"
            />
            {errors.website && (
              <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Tell customers about your store..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where customers can find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="123 Main Street"
            />
            {errors.street && (
              <p className="text-sm text-red-600 mt-1">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Boston"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State * (2 letters)</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="MA"
                maxLength={2}
              />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                {...register('zip')}
                placeholder="02101"
              />
              {errors.zip && (
                <p className="text-sm text-red-600 mt-1">{errors.zip.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>Store Specialties</CardTitle>
          <CardDescription>Select all that apply *</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: 'freshwater', label: 'Freshwater' },
              { value: 'saltwater', label: 'Saltwater/Marine' },
              { value: 'plants', label: 'Aquatic Plants' },
              { value: 'reptiles', label: 'Reptiles' },
              { value: 'general', label: 'General/All' },
            ].map((category) => (
              <Label key={category.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('categories')}
                  value={category.value}
                  className="rounded"
                />
                <span>{category.label}</span>
              </Label>
            ))}
          </div>
          {errors.categories && (
            <p className="text-sm text-red-600 mt-2">{errors.categories.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Business Hours - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>When are you open?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
            const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
            return (
              <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Label className="md:col-span-1">{dayCapitalized}</Label>
                
                <div>
                  <Label htmlFor={`${day}Open`} className="text-xs">Open</Label>
                  <Input
                    id={`${day}Open`}
                    type="time"
                    {...register(`${day}Open` as any)}
                    disabled={watch(`${day}Closed` as any)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`${day}Close`} className="text-xs">Close</Label>
                  <Input
                    id={`${day}Close`}
                    type="time"
                    {...register(`${day}Close` as any)}
                    disabled={watch(`${day}Closed` as any)}
                  />
                </div>
                
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`${day}Closed` as any)}
                    className="rounded"
                  />
                  <span className="text-sm">Closed</span>
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Social Media (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media (Optional)</CardTitle>
          <CardDescription>Connect with customers on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook">Facebook Page URL</Label>
            <Input
              id="facebook"
              {...register('facebook')}
              placeholder="https://facebook.com/your-page"
            />
            {errors.facebook && (
              <p className="text-sm text-red-600 mt-1">{errors.facebook.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input
              id="instagram"
              {...register('instagram')}
              placeholder="@yourstore"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter Handle</Label>
            <Input
              id="twitter"
              {...register('twitter')}
              placeholder="@yourstore"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Store Profile...
          </>
        ) : (
          'Create Store Profile'
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By submitting, you agree to our terms of service and that the information provided is accurate.
      </p>
    </form>
  );
}
