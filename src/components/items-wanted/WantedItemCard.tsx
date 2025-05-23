
'use client';

import type { WantedItem, MarketplaceCategory } from '@/types';
import { marketplaceCategoriesData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tag, CalendarDays, UserCircle, MessageSquare, Info, SearchCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface WantedItemCardProps {
  item: WantedItem;
}

export default function WantedItemCard({ item }: WantedItemCardProps) {
  const category = item.categorySlug ? marketplaceCategoriesData.find(cat => cat.slug === item.categorySlug) : null;
  const CategoryIcon = category?.icon;

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-xl flex items-center">
                <SearchCheck className="w-6 h-6 mr-2 text-primary" />
                {item.title}
            </CardTitle>
            {category && (
                 <Link href={`/marketplace/${category.slug}`} passHref>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent whitespace-nowrap">
                        {CategoryIcon && <CategoryIcon className="w-3 h-3 mr-1" />}
                        {category.name}
                    </Badge>
                 </Link>
            )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.userAvatarUrl || `https://avatar.vercel.sh/${item.userName}.png`} alt={item.userName} data-ai-hint={item.userAvatarHint || 'avatar'} />
            <AvatarFallback>{item.userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <span>{item.userName}</span>
          <span className="text-xs">&bull; Posted: {format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
          {item.description}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">Looking for tags:</h4>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" onClick={() => alert(`Contacting ${item.userName} about "${item.title}" (Feature not implemented)`)}>
          <MessageSquare className="w-4 h-4 mr-2" /> Can You Help? (Contact User)
        </Button>
      </CardFooter>
    </Card>
  );
}
