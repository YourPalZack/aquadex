
'use client';

import type { MarketplaceCategory } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface MarketplaceCategoryCardProps {
  category: MarketplaceCategory;
}

export default function MarketplaceCategoryCard({ category }: MarketplaceCategoryCardProps) {
  const IconComponent = category.icon;

  return (
    <Link href={`/marketplace/${category.slug}`} passHref>
      <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent className="w-7 h-7 text-primary" />}
            <CardTitle className="text-xl">{category.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription>{category.description}</CardDescription>
        </CardContent>
        <CardContent className="pt-2 pb-4">
            <div className="flex items-center text-sm text-primary font-medium group">
                View Items <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
