
'use client';

import type { Question, Answer, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

interface QuestionCardProps {
  question: Question;
}

function UserDisplay({ user, date }: { user: UserProfile; date: Date }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.name}.png`} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span>{user.name}</span>
      <span className="text-xs">&bull; {format(new Date(date), 'MMM d, yyyy')}</span>
    </div>
  );
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{question.title}</CardTitle>
        <UserDisplay user={question.author} date={question.createdAt} />
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{question.content}</p>
        
        {question.answers && question.answers.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className='flex items-center gap-2'>
                 <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{question.answers.length} Answer{question.answers.length > 1 ? 's' : ''}</h3>
            </div>
            <Separator />
            {question.answers.map((answer) => (
              <div key={answer.id} className="ml-2 p-4 rounded-md bg-muted/50 border border-border/50">
                <UserDisplay user={answer.author} date={answer.createdAt} />
                <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{answer.content}</p>
                {answer.upvotes !== undefined && (
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3 mr-1" /> {answer.upvotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {(!question.answers || question.answers.length === 0) && (
        <CardFooter>
            <p className="text-sm text-muted-foreground">No answers yet. Be the first to respond!</p>
        </CardFooter>
      )}
    </Card>
  );
}
