
'use client';

import type { FishFood, AmazonLink } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface FoodCardProps {
  food: FishFood;
  onDelete: (foodId: string) => void;
}

export default function FoodCard({ food, onDelete }: FoodCardProps) {
  return (
    <Card className="w-full shadow-lg flex flex-col h-full bg-card hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xl flex items-center">
            <ShoppingCart className="w-6 h-6 mr-3 text-primary" />
            {food.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onDelete(food.id)} aria-label="Delete food item" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {food.brand && (
          <CardDescription className="flex items-center">
            <Tag className="w-4 h-4 mr-1.5 text-muted-foreground" /> Brand: {food.brand}
          </CardDescription>
        )}
        {food.variant && (
          <CardDescription className="mt-1">Variant/Size: {food.variant}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow">
        {food.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center text-muted-foreground"><Info className="w-4 h-4 mr-2"/>Notes:</h4>
            <p className="text-sm text-foreground/80 p-2 bg-muted/50 rounded-md border whitespace-pre-wrap">
              {food.notes}
            </p>
          </div>
        )}

        {food.amazonLinks && food.amazonLinks.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Purchase Links:</h4>
            <ul className="space-y-2">
              {food.amazonLinks.map((link, index) => (
                <li key={index}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="w-full justify-start text-left hover:border-primary/50"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" title={`Search for ${food.name} on ${link.storeName}`}>
                      <Image 
                        src={`https://logo.clearbit.com/${new URL(link.url).hostname.replace('www.','')}`} 
                        alt={`${link.storeName} logo`} 
                        width={16} 
                        height={16} 
                        className="mr-2 rounded-sm object-contain"
                        data-ai-hint="amazon logo"
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if logo fails
                      />
                      {link.storeName}
                      <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
             <p className="text-xs text-muted-foreground mt-2 text-center">
                Note: Links may contain affiliate tags. Prices and availability are subject to change.
            </p>
          </div>
        )}
        {(!food.amazonLinks || food.amazonLinks.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No purchase links generated for this item.</p>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-3">
        <Info className="w-3 h-3 mr-1.5" />
        Always verify product details on the seller's website before purchasing. 
        Referral tags in links are placeholders and need to be configured.
      </CardFooter>
    </Card>
  );
}
