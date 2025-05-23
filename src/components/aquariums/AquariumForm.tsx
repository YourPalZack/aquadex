
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Aquarium, AquariumType } from '@/types';

const aquariumTypes: AquariumType[] = ['freshwater', 'saltwater', 'brackish', 'reef'];

const aquariumFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  volumeGallons: z.coerce.number().positive({ message: 'Volume must be a positive number.' }).optional().or(z.literal('')),
  type: z.enum(aquariumTypes, {
    required_error: 'You need to select an aquarium type.',
  }),
  lastWaterChange: z.date().optional(),
  nextWaterChangeReminder: z.date().optional(),
  notes: z.string().max(500, { message: 'Notes cannot exceed 500 characters.' }).optional(),
});

export type AquariumFormValues = z.infer<typeof aquariumFormSchema>;

interface AquariumFormProps {
  onSubmit: (values: AquariumFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<Aquarium>;
  isLoading?: boolean;
}

export default function AquariumForm({ onSubmit, onCancel, defaultValues, isLoading }: AquariumFormProps) {
  const form = useForm<AquariumFormValues>({
    resolver: zodResolver(aquariumFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      volumeGallons: defaultValues?.volumeGallons || undefined,
      type: defaultValues?.type || undefined,
      lastWaterChange: defaultValues?.lastWaterChange ? new Date(defaultValues.lastWaterChange) : undefined,
      nextWaterChangeReminder: defaultValues?.nextWaterChangeReminder ? new Date(defaultValues.nextWaterChangeReminder) : undefined,
      notes: defaultValues?.notes || '',
    },
  });

  const handleSubmit = (values: AquariumFormValues) => {
    const processedValues = {
      ...values,
      volumeGallons: values.volumeGallons ? Number(values.volumeGallons) : undefined,
    };
    onSubmit(processedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aquarium Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Living Room Reef" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="volumeGallons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume (Gallons)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="E.g., 75" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
              </FormControl>
              <FormDescription>Optional. Enter the volume of your aquarium in gallons.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aquarium Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aquarium type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {aquariumTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
          name="lastWaterChange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Last Water Change</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nextWaterChangeReminder"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Water Change Reminder</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any notes about your aquarium..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Aquarium'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
