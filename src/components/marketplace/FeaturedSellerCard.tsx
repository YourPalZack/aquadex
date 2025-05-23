
'use client';

import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserCircle } from 'lucide-react';
import Link from 'next/link';

interface FeaturedSellerCardProps {
  seller: UserProfile; // Assuming featured sellers are UserProfiles
}

export default function FeaturedSellerCard({ seller }: FeaturedSellerCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card h-full">
      <CardHeader className="items-center text-center pb-3 pt-5">
        <Avatar className="h-20 w-20 mb-3 border-2 border-primary/30">
          <AvatarImage src={seller.avatarUrl} alt={seller.name} data-ai-hint={seller.dataAiHint || 'seller avatar'} />
          <AvatarFallback className="text-2xl">{seller.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl flex items-center">
          {seller.name}
        </CardTitle>
        {seller.location && (
            <CardDescription className="text-xs text-muted-foreground">{seller.location}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow text-center py-2">
        <p className="text-sm text-foreground/80 line-clamp-3">
          {seller.bio || "A passionate aquarist and seller in the AquaDex community."}
        </p>
      </CardContent>
      <CardFooter className="pt-3 border-t mt-auto">
        {/* Conceptual link, actual profile page for users might be different */}
        <Button asChild variant="outline" className="w-full hover:border-primary/70">
          <Link href={`/profile`}> {/* Ideally, this would be a dynamic link like /sellers/${seller.id} */}
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
