'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAquarium, updateAquarium } from '@/lib/actions/aquarium';
import { createAquariumSchema, type CreateAquariumInput } from '@/lib/validations/aquarium';
import type { Aquarium } from '@/types/aquarium';
import { Loader2 } from 'lucide-react';

interface AquariumFormProps {
  aquarium?: Aquarium;
  mode?: 'create' | 'edit';
}

export function AquariumForm({ aquarium, mode = 'create' }: AquariumFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAquariumInput>({
    resolver: zodResolver(createAquariumSchema),
    defaultValues: aquarium
      ? {
          name: aquarium.name,
          sizeGallons: aquarium.sizeGallons,
          waterType: aquarium.waterType,
          location: aquarium.location || '',
          setupDate: aquarium.setupDate,
          imageUrls: aquarium.imageUrls || [],
          notes: aquarium.notes || '',
        }
      : {
          name: '',
          sizeGallons: 10,
          waterType: 'freshwater',
          location: '',
          setupDate: new Date(),
          imageUrls: [],
          notes: '',
        },
  });

  async function onSubmit(data: CreateAquariumInput) {
    setIsSubmitting(true);

    try {
      let result;
      
      if (mode === 'edit' && aquarium) {
        result = await updateAquarium({
          id: aquarium.id,
          ...data,
        });
      } else {
        result = await createAquarium(data);
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        return;
      }

      toast({
        title: 'Success',
        description: mode === 'create' 
          ? 'Aquarium created successfully!' 
          : 'Aquarium updated successfully!',
      });

      router.push('/aquariums');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Aquarium' : 'Edit Aquarium'}</CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Add a new aquarium to your collection' 
            : 'Update your aquarium details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="My Reef Tank" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your aquarium a memorable name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size and Water Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Size */}
              <FormField
                control={form.control}
                name="sizeGallons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (Gallons) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="75" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Water Type */}
              <FormField
                control={form.control}
                name="waterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select water type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="freshwater">Freshwater</SelectItem>
                        <SelectItem value="saltwater">Saltwater</SelectItem>
                        <SelectItem value="brackish">Brackish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Living Room" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where is this aquarium located?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Setup Date */}
            <FormField
              control={form.control}
              name="setupDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setup Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value instanceof Date 
                        ? field.value.toISOString().split('T')[0]
                        : field.value
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    When did you set up this aquarium?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mixed reef tank with soft and LPS corals..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add any additional information about your aquarium
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Aquarium' : 'Update Aquarium'}
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
        </Form>
      </CardContent>
    </Card>
  );
}
