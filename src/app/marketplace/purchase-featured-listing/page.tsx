
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCurrentUser } from "@/types";
import Link from "next/link";
import { ArrowLeft, CheckCircle, DollarSign, Eye, Info, ShoppingCart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PurchaseFeaturedListingPage() {
  const { toast } = useToast();
  const user = mockCurrentUser;

  const handlePurchase = () => {
    toast({
      title: "Purchase Successful (Mock)",
      description: "Your featured listing slot has been 'purchased'. You can now feature one of your listings.",
    });
    // In a real app, this would trigger backend logic and potentially redirect
  };

  if (!user.isSellerApproved) {
    return (
      <div className="container mx-auto py-8">
         <div className="mb-6">
             <Button variant="outline" asChild>
                <Link href="/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                </Link>
            </Button>
        </div>
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="text-3xl flex items-center text-destructive">
              <Info className="w-8 h-8 mr-3" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">
              You must be an approved seller to purchase featured listing slots.
            </p>
            <Button asChild>
              <Link href="/marketplace/apply-to-sell">Apply to Become a Seller</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
        <div className="mb-6">
             <Button variant="outline" asChild>
                <Link href="/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
                </Link>
            </Button>
        </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-amber-500/10 border-b border-amber-500/30">
          <CardTitle className="text-3xl flex items-center text-amber-600 dark:text-amber-500">
            <Star className="w-8 h-8 mr-3 fill-amber-500" />
            Feature Your Listing!
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2">
            Boost your item's visibility by purchasing a featured listing slot on AquaDex.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-primary" /> Why Feature Your Listing?
            </h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-muted/50 p-4 rounded-md border">
              <li>Prominent placement on the marketplace homepage and category pages.</li>
              <li>Increased exposure to potential buyers.</li>
              <li>Stand out from standard listings.</li>
              <li>Faster sales and more inquiries (potentially).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" /> Pricing (Example)
            </h2>
            <Card className="bg-card border">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">7-Day Featured Slot</p>
                  <p className="text-2xl font-bold text-primary">$10.00</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your listing will be highlighted for one week.
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert variant="default" className="bg-sky-500/10 border-sky-500/30">
            <Info className="h-4 w-4 text-sky-600" />
            <AlertTitle className="text-sky-700 dark:text-sky-500">How it Works (Conceptual)</AlertTitle>
            <AlertDescription className="text-sky-700/80 dark:text-sky-500/80">
              After purchasing, you'll be able to select one of your active listings to feature.
              This is a demonstration and no actual payment will be processed.
            </AlertDescription>
          </Alert>

          <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={handlePurchase}>
            <ShoppingCart className="w-5 h-5 mr-2" /> Purchase Featured Slot ($10.00)
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                This is a conceptual feature. Payment processing is not implemented.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
