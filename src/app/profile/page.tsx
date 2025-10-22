
'use client';

import { mockCurrentUser, type UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    User, Mail, MapPin, Edit3, Droplet, History, MessageSquare, ShoppingCart, PlusCircle, CheckCircle, AlertCircle, FileText, HeartHandshake, Star 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default function ProfilePage() {
  const user = mockCurrentUser; // Using the mock current user

  return (
    <div className="container mx-auto py-8">
      <h1 className="sr-only">Profile</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Profile' },
        ]}
        className="mb-4"
      />
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-primary/10 border-b border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
              <AvatarFallback className="text-3xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl md:text-4xl text-primary">{user.name}</CardTitle>
              {user.email && (
                <CardDescription className="text-base text-foreground/80 mt-1 flex items-center justify-center md:justify-start">
                  <Mail className="w-4 h-4 mr-2" /> {user.email}
                </CardDescription>
              )}
              {user.location && (
                <CardDescription className="text-sm text-muted-foreground mt-1 flex items-center justify-center md:justify-start">
                  <MapPin className="w-4 h-4 mr-2" /> {user.location}
                </CardDescription>
              )}
            </div>
            <Button variant="outline" size="sm" className="ml-auto mt-4 md:mt-0 self-start md:self-center" asChild>
              <Link href="/profile/settings">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {user.bio && (
            <section>
              <h2 className="text-xl font-semibold mb-2 text-foreground/90">About Me</h2>
              <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md border">{user.bio}</p>
            </section>
          )}

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground/90">My AquaDex Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/aquariums" passHref>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Droplet className="w-5 h-5 mr-2 text-primary" />My Aquariums</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Manage your tanks and track maintenance.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/history" passHref>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><History className="w-5 h-5 mr-2 text-primary" />Test History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">View all your past water test results.</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/qa" passHref>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-primary" />My Q&A Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">View your questions and answers. (Placeholder)</p>
                    </CardContent>
                </Card>
              </Link>
            </div>
          </section>
          
          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground/90">Marketplace</h2>
            <div className="space-y-4">
                <Card className="bg-card border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            Seller Status
                            {user.isSellerApproved ? (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approved Seller
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                                    <AlertCircle className="w-4 h-4 mr-1.5" /> Not a Seller
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {user.isSellerApproved ? (
                        <p className="text-sm text-muted-foreground flex-grow">You can list items for sale and purchase featured slots.</p>
                        ) : (
                        <p className="text-sm text-muted-foreground mb-3 sm:mb-0 flex-grow">
                            Interested in selling your aquarium-related items? Apply to become a seller.
                        </p>
                        )}
                         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button variant="outline" asChild className="w-full sm:w-auto">
                                <Link href={user.isSellerApproved ? "/marketplace/my-listings" : "/marketplace/apply-to-sell"}>
                                    {user.isSellerApproved ? <ShoppingCart className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                                    {user.isSellerApproved ? "Manage Listings" : "Apply to Sell"}
                                </Link>
                            </Button>
                            {user.isSellerApproved && (
                                <Button variant="default" asChild className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white">
                                    <Link href="/marketplace/purchase-featured-listing">
                                        <Star className="w-4 h-4 mr-2" /> Purchase Feature
                                    </Link>
                                </Button>
                            )}
                         </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/marketplace/my-listings" passHref>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-primary" />My Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View and manage items you have listed for sale. (Placeholder)</p>
                        </CardContent>
                        </Card>
                    </Link>
                    <Link href="/items-wanted" passHref>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center"><HeartHandshake className="w-5 h-5 mr-2 text-primary" />My Wanted Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View and manage items you are looking for. (Placeholder)</p>
                        </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
