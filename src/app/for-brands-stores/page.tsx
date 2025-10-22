
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store as StoreIcon, ShoppingBag, Building, Users2, Sparkles, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center text-center">
        <div className="p-3 bg-primary/10 rounded-full inline-block mb-3">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-center text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default function ForBrandsStoresPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-purple-100 dark:from-slate-900 dark:to-purple-900/30">
      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Link href="/" passHref>
          <Logo />
        </Link>
        <nav className="space-x-4">
          {/* TODO: Link to contact page or specific LFS onboarding form */}
          <Link href="/contact-us" passHref> 
            <Button>Partner With Us</Button>
          </Link>
          <Link href="/auth/signin" passHref>
            <Button variant="outline">Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Breadcrumbs: keep visible H1 in hero; provide breadcrumb nav above */}
        <div className="container mx-auto px-4 md:px-6 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'For Brands & Stores' },
            ]}
          />
        </div>
        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            Connect Your Brand with the Aquarium Community.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            AquaDex offers a platform for aquatic brands, manufacturers, and local fish stores to engage with a dedicated audience of fishkeepers.
          </p>
          <div className="flex justify-center gap-4">
            {/* TODO: Update links to actual partnership/contact pages */}
            <Link href="/contact-us" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Partnership <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/local-fish-stores" passHref>
              <Button size="lg" variant="outline">
                See Store Listings
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="py-12 md:py-16 bg-background/30 dark:bg-slate-800/30">
            <div className="container mx-auto px-4 md:px-6">
                <Image 
                    src="https://placehold.co/1200x500.png?bg=8b5cf6&fc=FFFFFF&text=Brand+Showcase+AquaDex" 
                    alt="Brands and Stores connecting with AquaDex users" 
                    width={1200} 
                    height={500} 
                    className="rounded-xl shadow-2xl mx-auto"
                    data-ai-hint="business aquarium products"
                />
            </div>
        </section>

        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Amplify Your Aquatic Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={StoreIcon}
              title="Enhanced Store Visibility"
              description="Feature your local fish store profile, including hours, services, and location, to attract nearby customers."
            />
            <BenefitCard
              icon={ShoppingBag}
              title="Direct-to-Hobbyist Sales"
              description="List your products in our marketplace and reach active buyers looking for quality aquatic goods (for approved sellers)."
            />
            <BenefitCard
              icon={Building}
              title="Increase Brand Awareness"
              description="Showcase your brand to a targeted community of dedicated aquarium lovers and professionals."
            />
            <BenefitCard
              icon={Users2}
              title="Valuable Community Interaction"
              description="Participate in Q&A sessions, share expertise, and build trust directly with end-users and potential customers."
            />
            <BenefitCard
              icon={BarChart3}
              title="Market Insights (Future)"
              description="Gain insights into hobbyist trends, popular products, and common questions to inform your business strategies."
            />
            <BenefitCard
              icon={Sparkles}
              title="Product Recommendations (Future)"
              description="Explore opportunities for your products to be featured in our AI-driven recommendation engines."
            />
          </div>
        </section>

         <section className="py-12 md:py-20 bg-primary/10 dark:bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Elevate Your Aquatic Brand.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
             Partner with AquaDex to connect with the heart of the aquarium hobby.
            </p>
            {/* TODO: Link to a proper contact/partnership form */}
            <Link href="/contact-us" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Learn About Partnerships
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background/50 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} AquaDex. All rights reserved. <Link href="/" className="hover:underline">Back to Main Page</Link>
        </div>
      </footer>
    </div>
  );
}
