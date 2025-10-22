
'use client';

import type { Question, UserProfile, Category, QuestionFormValues } from '@/types';
import { questionCategories } from '@/types';
import QuestionCard from '@/components/qa/QuestionCard';
import QuestionForm from '@/components/qa/QuestionForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Search, MessageSquare, Tag, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

const mockUsers: UserProfile[] = [
  { id: 'user1', name: 'Alice Aqua', avatarUrl: 'https://placehold.co/40x40.png?text=AA&bg=22c55e&fc=ffffff' , dataAiHint: 'female avatar' },
  { id: 'user2', name: 'Bob Fishman', avatarUrl: 'https://placehold.co/40x40.png?text=BF&bg=3b82f6&fc=ffffff', dataAiHint: 'male avatar' },
  { id: 'user3', name: 'Charlie Coral', avatarUrl: 'https://placehold.co/40x40.png?text=CC&bg=f97316&fc=ffffff', dataAiHint: 'person avatar' },
  { id: 'user4', name: 'Diana Driftwood', avatarUrl: 'https://placehold.co/40x40.png?text=DD&bg=8b5cf6&fc=ffffff', dataAiHint: 'avatar' },
];

const initialMockQuestions: Question[] = [
  {
    id: 'q1',
    title: 'My freshwater tank is cloudy, what should I do?',
    content: "Hey everyone,\nI set up my 20-gallon freshwater tank about a week ago, cycled it with some starter bacteria, and added a few guppies yesterday. This morning, the water is quite cloudy, like a milky white. \n\nWater parameters (API Master Kit):\n- pH: 7.4\n- Ammonia: 0.25 ppm\n- Nitrite: 0 ppm\n- Nitrate: 5 ppm\n\nIs this a bacterial bloom? Should I do a water change or just wait it out? Any advice appreciated!",
    author: mockUsers[0],
    createdAt: new Date('2024-07-20T10:00:00Z'),
    tags: ['freshwater', 'cloudy water', 'new tank', 'cycling'],
    category: 'freshwater',
    answers: [
      {
        id: 'a1-1',
        author: mockUsers[1],
        content: "Sounds like a classic bacterial bloom, especially with new fish added. The 0.25 ppm ammonia is likely feeding it. I'd hold off on a large water change unless ammonia spikes higher. It should clear up on its own in a few days to a week as the beneficial bacteria populations stabilize. Keep monitoring ammonia and nitrite!",
        createdAt: new Date('2024-07-20T11:30:00Z'),
        upvotes: 15,
      },
      {
        id: 'a1-2',
        author: mockUsers[2],
        content: "Agree with Bob. Don't overfeed your guppies during this period, as that will just add more ammonia. Make sure your filter is running properly with good circulation.",
        createdAt: new Date('2024-07-20T14:00:00Z'),
        upvotes: 7,
      },
    ],
  },
  {
    id: 'q2',
    title: 'Best beginner-friendly corals for a nano reef tank (10 gallons)?',
    content: "Hi reefers! I'm starting my first nano reef tank (10 gallons) and looking for some hardy, beginner-friendly corals. My lighting is an AI Prime 16HD. I'm aiming for soft corals or LPS that are relatively forgiving. What are your top recommendations?",
    author: mockUsers[2],
    createdAt: new Date('2024-07-19T15:20:00Z'),
    tags: ['saltwater', 'reef', 'nano tank', 'corals', 'beginner'],
    category: 'reef-tanks',
    answers: [
      {
        id: 'a2-1',
        author: mockUsers[3],
        content: "Great choice on the AI Prime! For beginners, you can't go wrong with Zoanthids (Zoos) or Palythoas (Palys). They come in amazing colors and are quite resilient. Green Star Polyps (GSP) are also super easy and grow fast – just give them their own rock as they can take over. Mushrooms (Discosoma, Rhodactis) are another excellent option.",
        createdAt: new Date('2024-07-19T18:00:00Z'),
        upvotes: 22,
      },
    ],
  },
  {
    id: 'q3',
    title: 'How often should I clean my canister filter?',
    content: "I have a Fluval 307 canister filter on my 55-gallon planted tank. How often do you guys typically clean yours out? I've heard conflicting advice, from every month to every 3-4 months. Worried about disturbing the beneficial bacteria too much.",
    author: mockUsers[1],
    createdAt: new Date('2024-07-18T08:00:00Z'),
    tags: ['equipment', 'filter', 'maintenance', 'canister filter'],
    category: 'equipment-setup',
    answers: [
       {
        id: 'a3-1',
        author: mockUsers[0],
        content: "For my canister filters, I usually do a full clean (rinsing media in tank water, cleaning impellers, etc.) every 2-3 months. I clean the intake/outtake hoses more frequently, maybe monthly, if I notice flow reduction. The key is to rinse the biological media (like ceramic rings or bio-balls) in siphoned tank water, not tap water, to preserve bacteria.",
        createdAt: new Date('2024-07-18T10:30:00Z'),
        upvotes: 18,
      },
    ],
  },
  {
    id: 'q4',
    title: 'Is my Betta fish sick? Lethargic and not eating.',
    content: "My Betta, Finny, has been very lethargic for the past two days. He's mostly hiding in his cave or lying at the bottom. He also refused his food yesterday and today. Water parameters are stable (0 ammonia, 0 nitrite, 10 nitrate, pH 7.0, temp 78F) in his 5-gallon heated, filtered tank. No visible signs of ich or fin rot. Any ideas what could be wrong or what I should try?",
    author: mockUsers[3],
    createdAt: new Date('2024-07-21T09:00:00Z'),
    tags: ['betta', 'fish health', 'sick fish', 'freshwater'],
    category: 'fish-health',
    answers: [],
  }
];

export default function QAPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>(initialMockQuestions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredQuestions = questions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    question.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleFormSubmit = async (data: QuestionFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      author: mockUsers[Math.floor(Math.random() * mockUsers.length)], // Random mock user
      createdAt: new Date(),
      answers: [],
      ...data,
    };
    setQuestions(prev => [newQuestion, ...prev]);
    setIsLoading(false);
    setIsFormOpen(false);
    toast({
      title: "Question Submitted!",
      description: "Your question has been added to the Q&A.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Community Q&amp;A</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Q&A' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center text-primary">
                <MessageSquare className="w-8 h-8 mr-3" />
                Community Q&amp;A
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Ask questions, share advice, and learn from fellow aquarists. Or browse by category.
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
                placeholder="Search all questions, tags, or content..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Tag className="w-5 h-5 mr-2 text-primary" />
            Browse by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {questionCategories.map(category => (
            <Button key={category.slug} variant="outline" asChild>
              <Link href={`/qa/${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Questions Found"
          description="Try broadening your search or ask a new question!"
          icon={<Search className="w-10 h-10" />}
          action={(
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <MessageSquarePlus className="w-4 h-4 mr-2" /> Ask a Question
            </Button>
          )}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ask a New Question</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your question to the community.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

