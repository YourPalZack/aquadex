
// src/app/sitemap/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAquariumsData } from '@/types'; // Updated import path
import { questionCategories } from '@/types';
import { marketplaceCategoriesData } from '@/types';
import { mockLocalFishStoresData } from '@/app/local-fish-stores/page';
import Link from 'next/link';
import { MapIcon, ChevronRight } from 'lucide-react';

interface SitemapSectionProps {
  title: string;
  links: { href: string; label: string; subLinks?: { href: string; label: string }[] }[];
}

const SitemapSection: React.FC<SitemapSectionProps> = ({ title, links }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href} className="ml-4">
          <Link href={link.href} className="text-foreground hover:text-primary hover:underline flex items-center">
            <ChevronRight className="w-4 h-4 mr-2 shrink-0" />
            {link.label}
          </Link>
          {link.subLinks && (
            <ul className="ml-6 mt-1 space-y-1">
              {link.subLinks.map(subLink => (
                <li key={subLink.href}>
                  <Link href={subLink.href} className="text-muted-foreground hover:text-primary hover:underline text-sm flex items-center">
                     <ChevronRight className="w-3 h-3 mr-1 shrink-0" />
                     {subLink.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function SitemapPage() {
  const mainLinks = [
    { href: '/', label: 'Landing Page' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const featureLinks = [
    { href: '/analyze', label: 'Water Test Analysis' },
    { href: '/history', label: 'Test History' },
    { 
      href: '/aquariums', 
      label: 'My Aquariums',
      subLinks: mockAquariumsData.slice(0, 2).map(aq => ({ href: `/aquariums/${aq.id}`, label: `View: ${aq.name}` })) 
    },
    { href: '/foods', label: 'Manage Fish Foods' },
    { href: '/treatments', label: 'Manage Water Treatments' },
    { href: '/reminders', label: 'Reminders' },
  ];

  const qaLinks = [
    { 
      href: '/qa', 
      label: 'Q&A Home',
      subLinks: questionCategories.slice(0,3).map(cat => ({ href: `/qa/${cat.slug}`, label: `Category: ${cat.name}`}))
    },
  ];

  const aiToolsLinks = [
    { href: '/aiquarium-tools', label: 'AIQuarium Tools Hub' },
    { href: '/fish-finder', label: 'Fish Finder' },
    { href: '/plant-finder', label: 'Plant Finder' },
    { href: '/tank-finder', label: 'Tank Finder' },
    { href: '/filtration-finder', label: 'Filtration Finder' },
    { href: '/lighting-finder', label: 'Lighting Finder' },
  ];

  const marketplaceLinks = [
    { 
      href: '/marketplace', 
      label: 'Marketplace Home',
      subLinks: marketplaceCategoriesData.slice(0,2).map(cat => ({ href: `/marketplace/${cat.slug}`, label: `Category: ${cat.name}`}))
    },
    { href: '/marketplace/add-listing', label: 'Create New Listing' },
    { href: '/marketplace/apply-to-sell', label: 'Apply to Sell' },
    { href: '/items-wanted', label: 'Items Wanted' },
  ];
  
  const lfsLinks = [
    { 
      href: '/local-fish-stores', 
      label: 'Local Fish Stores Finder',
      subLinks: mockLocalFishStoresData.slice(0,2).map(store => ({ href: `/local-fish-stores/${store.slug}`, label: `Profile: ${store.name}`}))
    }
  ];

  const userLinks = [
    { href: '/profile', label: 'User Profile' },
    // Conceptual auth links
    { href: '/auth/signin', label: 'Sign In (Conceptual)' }, 
    { href: '/auth/signup', label: 'Sign Up (Conceptual)' },
  ];

  const informationalLinks = [
    { href: '/for-fishkeepers', label: 'For Fishkeepers' },
    { href: '/for-breeders-sellers', label: 'For Breeders & Sellers' },
    { href: '/for-brands-stores', label: 'For Brands & Stores' },
    { href: '/sitemap', label: 'Sitemap (This Page)' },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <CardTitle className="text-3xl md:text-4xl text-primary flex items-center">
            <MapIcon className="w-8 h-8 md:w-10 md:h-10 mr-3" />
            AquaDex Sitemap
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Navigate through all available pages and features of the AquaDex application.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SitemapSection title="Main Navigation" links={mainLinks} />
          <SitemapSection title="Core Features" links={featureLinks} />
          <SitemapSection title="Community Q&A" links={qaLinks} />
          <SitemapSection title="AIQuarium Tools" links={aiToolsLinks} />
          <SitemapSection title="Marketplace" links={marketplaceLinks} />
          <SitemapSection title="Local Fish Stores" links={lfsLinks} />
          <SitemapSection title="User Account" links={userLinks} />
          <SitemapSection title="Informational Pages" links={informationalLinks} />
        </CardContent>
      </Card>
    </div>
  );
}

    