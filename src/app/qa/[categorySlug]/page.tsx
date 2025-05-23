
'use client';

import type { Question, UserProfile, Category, QuestionFormValues } from '@/types';
import { questionCategories } from '@/types';
import QuestionCard from '@/components/qa/QuestionCard';
import QuestionForm from '@/components/qa/QuestionForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Search, MessageSquare, Tag, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';

// Re-using mock data structure, could be fetched or passed differently in a real app
const mockUsers: UserProfile[] = [
  { id: 'user1', name: 'Alice Aqua', avatarUrl: 'https://placehold.co/40x40.png?text=AA&bg=22c55e&fc=ffffff', dataAiHint: 'female avatar' },
  { id: 'user2', name: 'Bob Fishman', avatarUrl: 'https://placehold.co/40x40.png?text=BF&bg=3b82f6&fc=ffffff', dataAiHint: 'male avatar' },
  { id: 'user3', name: 'Charlie Coral', avatarUrl: 'https://placehold.co/40x40.png?text=CC&bg=f97316&fc=ffffff', dataAiHint: 'person avatar' },
  { id: 'user4', name: 'Diana Driftwood', avatarUrl: 'https://placehold.co/40x40.png?text=DD&bg=8b5cf6&fc=ffffff', dataAiHint: 'avatar' },
];

const initialMockQuestions: Question[] = [
  {
    id: 'q1',
    title: 'My freshwater tank is cloudy, what should I do?',
    content: "Hey everyone, I set up my 20-gallon freshwater tank...",
    author: mockUsers[0],
    createdAt: new Date('2024-07-20T10:00:00Z'),
    tags: ['freshwater', 'cloudy water', 'new tank', 'cycling'],
    category: 'freshwater',
    answers: [
      { id: 'a1-1', author: mockUsers[1], content: "Sounds like a classic bacterial bloom...", createdAt: new Date('2024-07-20T11:30:00Z'), upvotes: 15 },
    ],
  },
  {
    id: 'q2',
    title: 'Best beginner-friendly corals for a nano reef tank (10 gallons)?',
    content: "Hi reefers! I'm starting my first nano reef tank...",
    author: mockUsers[2],
    createdAt: new Date('2024-07-19T15:20:00Z'),
    tags: ['saltwater', 'reef', 'nano tank', 'corals', 'beginner'],
    category: 'reef-tanks',
    answers: [
      { id: 'a2-1', author: mockUsers[3], content: "Great choice on the AI Prime!...", createdAt: new Date('2024-07-19T18:00:00Z'), upvotes: 22 },
    ],
  },
  {
    id: 'q3',
    title: 'How often should I clean my canister filter?',
    content: "I have a Fluval 307 canister filter...",
    author: mockUsers[1],
    createdAt: new Date('2024-07-18T08:00:00Z'),
    tags: ['equipment', 'filter', 'maintenance', 'canister filter'],
    category: 'equipment-setup',
    answers: [
       { id: 'a3-1', author: mockUsers[0], content: "For my canister filters, I usually do a full clean...", createdAt: new Date('2024-07-18T10:30:00Z'), upvotes: 18 },
    ],
  },
  {
    id: 'q4',
    title: 'Is my Betta fish sick? Lethargic and not eating.',
    content: "My Betta, Finny, has been very lethargic...",
    author: mockUsers[3],
    createdAt: new Date('2024-07-21T09:00:00Z'),
    tags: ['betta', 'fish health', 'sick fish', 'freshwater'],
    category: 'fish-health',
    answers: [],
  },
  {
    id: 'q5',
    title: 'Ideal water parameters for a planted freshwater tank?',
    content: "I'm setting up a new high-tech planted tank and want to ensure I target the right water parameters from the start. What are the ideal ranges for pH, GH, KH, and CO2 levels for lush plant growth?",
    author: mockUsers[0],
    createdAt: new Date('2024-07-22T14:00:00Z'),
    tags: ['freshwater', 'planted tank', 'water parameters', 'aquascaping'],
    category: 'aquascaping-plants',
    answers: [],
  }
];


export default function CategoryQAPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.categorySlug as string;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>(initialMockQuestions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentCategory = useMemo(() => {
    return questionCategories.find(cat => cat.slug === categorySlug);
  }, [categorySlug]);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(question => question.category === categorySlug)
      .filter(question => 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [questions, categorySlug, searchTerm]);


  const handleFormSubmit = async (data: QuestionFormValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      author: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      createdAt: new Date(),
      answers: [],
      ...data,
      // Ensure category from form is used, or default to current if applicable
      category: data.category || categorySlug, 
    };
    setQuestions(prev => [newQuestion, ...prev]);
    setIsLoading(false);
    setIsFormOpen(false);
    toast({
      title: "Question Submitted!",
      description: `Your question has been added to the ${currentCategory?.name || 'Q&A'}.`,
    });
  };

  if (!currentCategory) {
    // Handle case where category doesn't exist, maybe redirect or show 404
    // For now, just show a simple message
    return (
        <div className="container mx-auto py-8 text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Category Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The category <span className="font-semibold">{categorySlug}</span> does not exist.</p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/qa">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Q&A Home
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/qa')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Q&A
        </Button>
      </div>
      <Card className="mb-8 bg-primary/10 border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center text-primary">
                <Tag className="w-8 h-8 mr-3" />
                Q&amp;A: {currentCategory.name}
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                {currentCategory.description || `Browse questions and answers in the ${currentCategory.name} category.`}
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Ask a Question
            </Button>
          </div>
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder={`Search in ${currentCategory.name}...`}
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Questions Found</p>
              <p>There are no questions matching your search in the <span className="font-semibold">{currentCategory.name}</span> category yet. Be the first to ask!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ask a New Question</DialogTitle>
            <DialogDescription>
              Your question will be posted in the <span className="font-semibold">{currentCategory.name}</span> category.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
            initialCategory={categorySlug} // Pre-fill category
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

