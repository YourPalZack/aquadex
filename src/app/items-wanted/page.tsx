
'use client';

import { useState, useEffect } from 'react';
import type { WantedItem, WantedItemFormValues, UserProfile } from '@/types';
import WantedItemCard from '@/components/items-wanted/WantedItemCard';
import WantedItemForm from '@/components/items-wanted/WantedItemForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartHandshake, PlusCircle, Info, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

// Mock user data (replace with actual user data if available)
const mockUsers: UserProfile[] = [
  { id: 'user1', name: 'Alice Aqua', avatarUrl: 'https://placehold.co/40x40.png?text=AA', dataAiHint: 'female avatar' },
  { id: 'user2', name: 'Bob Fishman', avatarUrl: 'https://placehold.co/40x40.png?text=BF', dataAiHint: 'male avatar' },
];

const mockWantedItemsData: WantedItem[] = [
  {
    id: 'wt1',
    title: 'Looking for Apistogramma cacatuoides pair',
    description: "Seeking a healthy, young breeding pair of Apistogramma cacatuoides (Orange Flash or Triple Red preferred). Preferably tank-raised and ready to breed. Willing to discuss shipping or local pickup within 50 miles of Springfield, MA.",
    categorySlug: 'live-fish',
    userId: 'user1',
    userName: 'Alice Aqua',
    userAvatarUrl: mockUsers[0].avatarUrl,
    userAvatarHint: mockUsers[0].dataAiHint,
    createdAt: new Date('2024-07-25T10:00:00Z'),
    status: 'approved',
    tags: ['apistogramma', 'dwarf cichlid', 'breeding pair', 'freshwater'],
  },
  {
    id: 'wt2',
    title: 'Wanted: Used Fluval FX4 or FX6 Canister Filter',
    description: "Looking to buy a used Fluval FX4 or FX6 canister filter in good working condition. All original parts and media trays are a plus. Located in San Diego, CA, willing to pay for shipping for a good deal.",
    categorySlug: 'used-equipment',
    userId: 'user2',
    userName: 'Bob Fishman',
    userAvatarUrl: mockUsers[1].avatarUrl,
    userAvatarHint: mockUsers[1].dataAiHint,
    createdAt: new Date('2024-07-23T14:30:00Z'),
    status: 'approved',
    tags: ['canister filter', 'fluval fx4', 'fluval fx6', 'used equipment'],
  },
  {
    id: 'wt3',
    title: 'ISO: ADA 60P Tank (Local Pickup - NYC)',
    description: "Searching for an ADA 60P (60x30x36cm) aquarium tank. Must be in excellent condition with no major scratches. Local pickup in or around New York City only.",
    categorySlug: 'new-equipment', // Could also be used-equipment
    userId: 'user1',
    userName: 'Alice Aqua',
    userAvatarUrl: mockUsers[0].avatarUrl,
    userAvatarHint: mockUsers[0].dataAiHint,
    createdAt: new Date('2024-07-28T09:00:00Z'),
    status: 'pending', // This one is pending approval
    tags: ['ADA tank', 'rimless tank', 'aquascaping', '60P'],
  },
];

export default function ItemsWantedPage() {
  const [wantedItems, setWantedItems] = useState<WantedItem[]>(mockWantedItemsData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const approvedItems = wantedItems.filter(item => item.status === 'approved');

  const filteredItems = approvedItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    item.userName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleFormSubmit = async (data: WantedItemFormValues) => {
    setIsLoading(true);
    // Simulate API call & admin approval process
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]; // Simulate current user

    const newWantedItem: WantedItem = {
      id: `wt${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarUrl: currentUser.avatarUrl,
      userAvatarHint: currentUser.dataAiHint,
      createdAt: new Date(),
      status: 'pending', // New items are pending approval
      ...data,
    };

    // Add to the main list (in a real app, this would be fetched after DB update)
    setWantedItems(prev => [newWantedItem, ...prev]);
    
    setIsLoading(false);
    setIsFormOpen(false);
    toast({
      title: 'Item Wanted Submitted!',
      description: 'Your request has been submitted and is pending admin approval. It will appear publicly once approved.',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 bg-primary/10 border-primary/30 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-3xl flex items-center text-primary">
                <HeartHandshake className="w-8 h-8 mr-3" />
                Items Wanted
              </CardTitle>
              <CardDescription className="text-base text-foreground/80 pt-2">
                Browse items other hobbyists are looking for, or post your own "In Search Of" (ISO) request.
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="w-5 h-5 mr-2" />
              Post an Item Wanted
            </Button>
          </div>
           <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search wanted items by title, description, tags, or user..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <WantedItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-10">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">No Wanted Items Found</p>
              <p>
                {searchTerm 
                    ? `No items match your search "${searchTerm}".`
                    : "There are currently no approved 'wanted' items listed. Be the first to post one!"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert variant="default" className="mt-8 bg-muted/50 border-border">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-muted-foreground font-semibold">Please Note</AlertTitle>
        <AlertDescription className="text-muted-foreground/80">
          Items posted here are requests from users. AquaDex is not directly involved in transactions. 
          All new "Item Wanted" posts are subject to admin review before appearing publicly.
        </AlertDescription>
      </Alert>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">Post an Item You're Looking For</DialogTitle>
            <DialogDescription>
              Describe the item you need. Your post will be reviewed by an admin before it goes live.
            </DialogDescription>
          </DialogHeader>
           <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <WantedItemForm 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
