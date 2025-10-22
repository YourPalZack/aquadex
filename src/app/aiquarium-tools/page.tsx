
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Sparkles,
  FileScan,
  Fish,
  Leaf,
  Archive,
  Filter as FilterIcon,
  Sun,
  ArrowRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon: Icon, title, description, href }) => {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-primary" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardContent className="pt-2 pb-4">
        <Button asChild className="w-full">
          <Link href={href}>
            Use Tool <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const aiTools = [
  {
    icon: FileScan,
    title: 'Water Test Analyzer',
    description: 'Analyze your aquarium test strips instantly. Upload a photo to get water parameters and AI-driven treatment suggestions.',
    href: '/analyze',
  },
  {
    icon: Fish,
    title: 'Fish Finder',
    description: 'Looking for a specific fish or invertebrate? Our AI searches various online sources to help you find listings.',
    href: '/fish-finder',
  },
  {
    icon: Leaf,
    title: 'Plant Finder',
    description: 'Discover where to find specific aquatic plants. Our AI scours online stores to bring you listings for your aquascape.',
    href: '/plant-finder',
  },
  {
    icon: Archive,
    title: 'Tank Finder',
    description: 'Find the perfect aquarium tank for your needs. Specify type, size, and brand, and let our AI search for you.',
    href: '/tank-finder',
  },
  {
    icon: FilterIcon,
    title: 'Filtration Finder',
    description: 'Search for aquarium filters by type, brand, or tank size. Get AI-assisted listing suggestions for optimal water quality.',
    href: '/filtration-finder',
  },
  {
    icon: Sun,
    title: 'Lighting Finder',
    description: 'Need new aquarium lighting? Specify your requirements and our AI will find potential listings and recommendations.',
    href: '/lighting-finder',
  },
];

export default function AIQuariumToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">AIQuarium Tools</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'AI Tools' },
        ]}
        className="mb-4"
      />
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center text-primary">
            <Sparkles className="w-8 h-8 mr-3" />
            AIQuarium Tools
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Leverage the power of AI to enhance your aquarium hobby. Explore our suite of smart tools designed to help you manage, find, and analyze.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => (
          <ToolCard
            key={tool.title}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}
