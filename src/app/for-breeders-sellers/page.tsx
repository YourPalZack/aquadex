
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart, Award, HeartHandshake, ListPlus, MessageSquare, Users2 } from "lucide-react";
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

export default function ForBreedersSellersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-green-100 dark:from-slate-900 dark:to-green-900/30">
      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Link href="/" passHref>
          <Logo />
        </Link>
        <nav className="space-x-4">
          <Link href="/marketplace/apply-to-sell" passHref>
            <Button>Apply to Sell</Button>
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
              { label: 'For Breeders & Sellers' },
            ]}
          />
        </div>
        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            Reach More Aquarists. Sell Your Stock with AquaDex.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            AquaDex connects dedicated fish breeders and aquatic sellers with a passionate community of hobbyists looking for quality livestock, plants, and equipment.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/marketplace/apply-to-sell" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Apply to Become a Seller <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
             <Link href="/marketplace" passHref>
              <Button size="lg" variant="outline">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="py-12 md:py-16 bg-background/30 dark:bg-slate-800/30">
            <div className="container mx-auto px-4 md:px-6">
                <Image 
                    src="https://placehold.co/1200x500.png?bg=22c55e&fc=FFFFFF&text=Showcase+Your+Best+Stock" 
                    alt="Showcase of fish and plants for sale" 
                    width={1200} 
                    height={500} 
                    className="rounded-xl shadow-2xl mx-auto"
                    data-ai-hint="fish for sale"
                />
            </div>
        </section>

        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Unlock Your Selling Potential
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={ShoppingCart}
              title="Targeted Marketplace"
              description="List your fish, plants, and equipment directly to engaged aquarium enthusiasts actively looking to buy."
            />
            <BenefitCard
              icon={Award}
              title="Showcase Your Expertise"
              description="Build your reputation and trust by answering questions in our Q&A community and sharing your knowledge."
            />
            <BenefitCard
              icon={HeartHandshake}
              title="Find What You Need"
              description="Post 'Items Wanted' listings to source specific broodstock, rare plants, or supplies for your operations."
            />
            <BenefitCard
              icon={ListPlus}
              title="Easy Listing Management"
              description="Utilize simple tools to create and manage your sales listings once your seller application is approved."
            />
            <BenefitCard
              icon={MessageSquare}
              title="Connect with Buyers"
              description="Engage directly with potential customers who are interested in your unique offerings and specialized stock."
            />
            <BenefitCard
              icon={Users2}
              title="Join a Growing Community"
              description="Become part of a vibrant network of hobbyists, breeders, and sellers passionate about aquatics."
            />
          </div>
        </section>

         <section className="py-12 md:py-20 bg-primary/10 dark:bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Ready to Grow Your Reach?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              AquaDex provides the platform and the audience. Start selling to dedicated aquarists today.
            </p>
            <Link href="/marketplace/apply-to-sell" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Apply to Sell on AquaDex
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
