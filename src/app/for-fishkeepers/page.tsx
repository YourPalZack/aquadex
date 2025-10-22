
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileScan, Lightbulb, History, BellRing, Search, Users2, Droplet, Store as StoreIcon } from "lucide-react";
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

export default function ForFishKeepersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Link href="/" passHref>
          <Logo />
        </Link>
        <nav className="space-x-4">
          <Link href="/auth/signup" passHref>
            <Button>Sign Up</Button>
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
              { label: 'For Fishkeepers' },
            ]}
          />
        </div>
        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            Your Aquarium, Simplified and Smarter.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            AquaDex empowers fish keepers of all levels with the tools to maintain a thriving aquatic environment, track progress, and connect with a passionate community.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features" passHref>
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="py-12 md:py-16 bg-background/30 dark:bg-slate-800/30">
            <div className="container mx-auto px-4 md:px-6">
                <Image 
                    src="https://placehold.co/1200x500.png?bg=45B6FE&fc=FFFFFF&text=Thriving+Aquarium+Showcase" 
                    alt="Beautiful aquarium managed with AquaDex" 
                    width={1200} 
                    height={500} 
                    className="rounded-xl shadow-2xl mx-auto"
                    data-ai-hint="beautiful aquarium fish"
                />
            </div>
        </section>

        <section className="container mx-auto py-12 md:py-20 px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Everything Your Aquarium Needs, All In One Place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <BenefitCard
              icon={FileScan}
              title="Instant Water Analysis"
              description="Upload test strip photos for quick, AI-powered water parameter readings and insights."
            />
            <BenefitCard
              icon={Lightbulb}
              title="Smart Recommendations"
              description="Get AI-driven advice on water treatments and products tailored to your tank's needs."
            />
            <BenefitCard
              icon={History}
              title="Track Your History"
              description="Monitor water parameters over time to understand trends and maintain tank stability."
            />
            <BenefitCard
              icon={BellRing}
              title="Never Miss Maintenance"
              description="Set and receive reminders for crucial tasks like water changes and feedings."
            />
            <BenefitCard
              icon={Droplet}
              title="Manage Your Tanks"
              description="Keep detailed logs, notes, and parameters for all your aquariums effortlessly."
            />
            <BenefitCard
              icon={Search}
              title="Discover & Find"
              description="Locate specific fish, plants, equipment, and deals with our AI-powered finder tools."
            />
             <BenefitCard
              icon={StoreIcon}
              title="Find Local Stores"
              description="Discover local fish stores in your area, check their services and hours."
            />
            <BenefitCard
              icon={Users2}
              title="Community Q&A"
              description="Ask questions, share your experiences, and learn from fellow aquarists in our forum."
            />
          </div>
        </section>

         <section className="py-12 md:py-20 bg-primary/10 dark:bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Ready to Dive In?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of hobbyists who are transforming their aquarium experience with AquaDex.
            </p>
            <Link href="/auth/signup" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Create Your Free Account
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

