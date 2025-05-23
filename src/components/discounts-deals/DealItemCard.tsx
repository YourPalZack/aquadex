
'use client';

import type { DealItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, Store, Info, Tag, Percent } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface DealItemCardProps {
  deal: DealItem;
}

export default function DealItemCard({ deal }: DealItemCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card">
      <div className="aspect-video relative w-full rounded-t-lg overflow-hidden bg-muted border-b">
        <Image 
          src={deal.imageUrl} 
          alt={deal.productName} 
          layout="fill" 
          objectFit="cover"
          data-ai-hint={deal.dataAiHint}
        />
        {deal.discountPercentage && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-sm py-1 px-2 shadow-md">
                <Percent className="w-4 h-4 mr-1" /> {deal.discountPercentage}
            </Badge>
        )}
      </div>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
          <a href={deal.url} target="_blank" rel="noopener noreferrer" title={`View ${deal.productName} on ${deal.sourceName}`}>
            {deal.productName}
          </a>
        </CardTitle>
        <CardDescription className="flex items-center text-xs pt-1 text-muted-foreground">
          <Store className="w-3 h-3 mr-1.5" />
          Source: {deal.sourceName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 py-3">
        <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-primary flex items-center">
                <DollarSign className="w-5 h-5 mr-0.5" />
                {deal.salePrice}
            </p>
            {deal.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
                {deal.originalPrice}
            </p>
            )}
        </div>
        {deal.description && (
            <p className="text-sm text-foreground/80 pt-1">
                {deal.description}
            </p>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Button asChild variant="outline" className="w-full hover:border-primary/70">
          <a href={deal.url} target="_blank" rel="noopener noreferrer">
            View Deal <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
