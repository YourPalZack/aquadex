
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/layout/Logo";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, BotMessageSquare, ShoppingBag, Users2, UploadCloud, CalendarClock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <header className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo />
        <nav className="space-x-4">
          <Link href="/dashboard" passHref>
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="/auth/signin" passHref>
            <Button>Sign In</Button>
          </Link>
          <Link href="/auth/signup" passHref>
            <Button variant="outline">Sign Up</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto py-12 md:py-24 px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            AquaDex: The Fishkeeper's Toolkit
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Unlock smarter aquarium management with AquaDex. Analyze water, track parameters, get AI insights, and connect with a community of fishkeepers.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features" passHref>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <Image 
                    src="https://placehold.co/1200x600.png?bg=E0F7FA&text=AquaDex+App+Screenshot" 
                    alt="AquaDex in action" 
                    width={1200} 
                    height={600} 
                    className="rounded-xl shadow-2xl mx-auto"
                    data-ai-hint="aquarium management app"
                />
            </div>
        </section>

        <section id="features" className="container mx-auto py-12 md:py-24 px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Everything You Need for a Healthy Tank
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<UploadCloud className="h-10 w-10 text-primary" />}
              title="Instant Strip Analysis"
              description="Upload a photo of your test strip and get AI-powered readings in seconds."
            />
            <FeatureCard
              icon={<BotMessageSquare className="h-10 w-10 text-primary" />}
              title="AI-Powered Recommendations"
              description="Receive smart suggestions for water treatments and products based on your results."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Historical Data Tracking"
              description="Monitor your water parameters over time to spot trends and maintain stability."
            />
            <FeatureCard
              icon={<ShoppingBag className="h-10 w-10 text-primary" />}
              title="Treatment Product Info"
              description="Get information on recommended products to address water quality issues."
            />
            <FeatureCard
              icon={<Users2 className="h-10 w-10 text-primary" />}
              title="Community Support"
              description="Connect with fellow aquarists, ask questions, and share your experiences."
            />
             <FeatureCard
              icon={<CalendarClock className="h-10 w-10 text-primary" />}
              title="Water Change Reminders"
              description="Track your water changes and get notified so you never miss a schedule."
            />
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background/50 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} AquaDex. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, ReactNode, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="mt-4 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
