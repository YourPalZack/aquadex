import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data - replace with actual data fetching
const mockListings = [
  {
    id: "1",
    title: "Beautiful Angelfish Pair",
    price: 45.00,
    status: "active",
    views: 23,
    datePosted: "2024-01-15",
    category: "fish",
    image: "/api/placeholder/150/150"
  },
  {
    id: "2", 
    title: "Java Moss - Premium Quality",
    price: 12.00,
    status: "sold",
    views: 67,
    datePosted: "2024-01-10",
    category: "plants",
    image: "/api/placeholder/150/150"
  },
  {
    id: "3",
    title: "Fluval 206 Canister Filter",
    price: 89.99,
    status: "active",
    views: 15,
    datePosted: "2024-01-20",
    category: "equipment",
    image: "/api/placeholder/150/150"
  }
]

function ListingCard({ listing }: { listing: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "sold": return "bg-gray-100 text-gray-800"
      case "expired": return "bg-red-100 text-red-800"
      default: return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
            {/* Placeholder for image */}
            <div className="w-full h-full bg-gray-300 rounded-md flex items-center justify-center text-gray-500 text-xs">
              Image
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold truncate">{listing.title}</h3>
              <Badge className={getStatusColor(listing.status)}>
                {listing.status}
              </Badge>
            </div>
            
            <p className="text-lg font-bold text-green-600 mt-1">
              ${listing.price.toFixed(2)}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{listing.views} views</span>
              <span>Posted {listing.datePosted}</span>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              {listing.status === "active" && (
                <>
                  <Button size="sm" variant="outline">
                    Mark Sold
                  </Button>
                  <Button size="sm" variant="outline">
                    Promote
                  </Button>
                </>
              )}
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyListingsPage() {
  const activeListings = mockListings.filter(l => l.status === "active")
  const soldListings = mockListings.filter(l => l.status === "sold")
  const allListings = mockListings

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-gray-600 mt-2">
            Manage your marketplace listings and track their performance
          </p>
        </div>
        
        <Link href="/marketplace/add-listing">
          <Button>Create New Listing</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{activeListings.length}</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{soldListings.length}</div>
            <div className="text-sm text-gray-600">Items Sold</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {mockListings.reduce((sum, l) => sum + l.views, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              ${soldListings.reduce((sum, l) => sum + l.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
          <TabsTrigger value="all">All Listings ({allListings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-6">
          {activeListings.length > 0 ? (
            activeListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-4">You don't have any active listings.</p>
                <Link href="/marketplace/add-listing">
                  <Button>Create Your First Listing</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sold" className="space-y-4 mt-6">
          {soldListings.length > 0 ? (
            soldListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No sold items yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          {allListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const metadata = {
  title: "My Listings - AquaDex",
  description: "Manage your marketplace listings and track their performance.",
}