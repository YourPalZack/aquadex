
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
import { questionCategories, type Category } from '@/types';
import { Loader2 } from 'lucide-react';

const questionFormSchema = z.object({
  title: z.string().min(10, { message: 'Title must be at least 10 characters.' }).max(150, { message: 'Title cannot exceed 150 characters.' }),
  content: z.string().min(20, { message: 'Question content must be at least 20 characters.' }).max(5000, { message: 'Content cannot exceed 5000 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<QuestionFormValues>;
  isLoading?: boolean;
  initialCategory?: string;
}

export default function QuestionForm({ onSubmit, onCancel, defaultValues, isLoading, initialCategory }: QuestionFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      content: defaultValues?.content || '',
      category: defaultValues?.category || initialCategory || '',
      tags: defaultValues?.tags || [],
    },
  });

  const handleSubmit = async (values: QuestionFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., How to cycle a new freshwater tank?" {...field} />
              </FormControl>
              <FormDescription>
                Be specific and imagine you&apos;re asking a question to another person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {questionCategories.map((cat: Category) => (
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Include all the information someone would need to answer your question. What are your water parameters? What fish or plants are involved?"
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., freshwater, cycling, new tank" {...field} 
                // @ts-ignore
                onChange={e => field.onChange(e.target.value)} value={Array.isArray(field.value) ? field.value.join(', ') : field.value} />
              </FormControl>
              <FormDescription>
                Comma-separated tags to help others find your question.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Submitting...' : 'Submit Question'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

