# Marketplace Feature Documentation

## Overview
The AquaDex Marketplace is a community-driven platform where verified sellers can list aquarium-related items, from livestock to equipment. It features seller verification, secure transactions, and category-based browsing.

## Feature Components

### 1. Marketplace Hub
- Browse by categories
- Featured listings
- Search and filters
- Seller spotlights

### 2. Listing Management
- Create detailed listings
- Upload multiple photos
- Set pricing and shipping
- Manage inventory

### 3. Seller Dashboard
- Application and verification process
- Listing analytics
- Order management
- Revenue tracking

### 4. Buyer Features
- Wishlist functionality
- Purchase history
- Seller ratings
- Secure messaging

## User Flows

### Becoming a Seller
1. Navigate to `/marketplace/apply-to-sell`
2. Complete application form:
   - Business information
   - Verification documents
   - Seller agreement
3. Wait for admin review (24-48 hours)
4. Upon approval, access `/marketplace/add-listing`
5. Create first listing

### Creating a Listing
1. Access `/marketplace/add-listing` (sellers only)
2. Select category
3. Fill listing details:
   - Title and description
   - Photos (up to 10)
   - Price and shipping options
   - Quantity available
   - Care instructions (for livestock)
4. Preview and publish
5. Manage via `/my-listings`

### Purchasing Process
1. Browse `/marketplace` or category pages
2. View listing details
3. Check seller ratings and reviews
4. Add to cart or contact seller
5. Complete purchase (external payment)
6. Leave feedback

## Technical Implementation

### Data Models

```typescript
interface MarketplaceListing {
  id: string;
  sellerId: string;
  category: MarketplaceCategory;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  images: string[];
  status: 'active' | 'sold' | 'reserved' | 'expired';
  featured: boolean;
  featuredUntil?: Date;
  shipping: {
    available: boolean;
    cost: number;
    locations: string[];
    restrictions?: string;
  };
  quantity: number;
  condition: 'new' | 'used' | 'like-new';
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Seller {
  id: string;
  userId: string;
  businessName: string;
  verified: boolean;
  verifiedAt?: Date;
  rating: number;
  totalSales: number;
  joinedAt: Date;
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  specialties: string[];
  responseTime: number; // hours
  policies: {
    shipping: string;
    returns: string;
    livestock: string;
  };
}

type MarketplaceCategory = 
  | 'fish'
  | 'plants'
  | 'invertebrates'
  | 'corals'
  | 'equipment'
  | 'supplies'
  | 'foods'
  | 'decorations';
```

### Components

- `MarketplaceListingCard` - Display listing in grid
- `MarketplaceListingForm` - Create/edit listings
- `MarketplaceCategoryCard` - Category navigation
- `SellerApplicationForm` - Seller onboarding
- `FeaturedSellerCard` - Highlight top sellers
- `ListingDetailView` - Full listing page (planned)
- `SellerDashboard` - Seller analytics (planned)

### Firebase Structure

Collections:
- `marketplace_listings` - All active listings
- `sellers` - Verified seller profiles
- `seller_applications` - Pending applications
- `marketplace_transactions` - Transaction records
- `seller_reviews` - Buyer feedback

### Security & Trust

1. **Seller Verification**
   - Identity verification
   - Business license check
   - References required
   - Probation period

2. **Transaction Safety**
   - Escrow recommendations
   - Seller ratings visible
   - Report functionality
   - Admin moderation

3. **Content Moderation**
   - Automated flag system
   - Community reporting
   - Admin review queue
   - Prohibited items list

## Categories & Guidelines

### Livestock Categories
- **Fish** - Live fish with health guarantee
- **Plants** - Aquatic plants and cultures
- **Invertebrates** - Shrimp, snails, crabs
- **Corals** - Marine corals (CITES compliant)

### Equipment Categories
- **Tanks** - New and used aquariums
- **Filtration** - Filters and media
- **Lighting** - LED, T5, etc.
- **Equipment** - Pumps, heaters, CO2

### Listing Requirements
- Clear, accurate photos
- Honest descriptions
- Accurate sizing/measurements
- Health status (livestock)
- Shipping capabilities

## Featured Listings

### How it Works
1. Sellers purchase featured slots via `/marketplace/purchase-featured-listing`
2. Featured for 7/14/30 days
3. Appear at top of category
4. Homepage showcase
5. Boost in search results

### Pricing Tiers
- 7 days: $9.99
- 14 days: $17.99
- 30 days: $29.99

## Analytics & Reporting

### Seller Metrics
- Listing views
- Conversion rates
- Response times
- Customer satisfaction
- Revenue tracking

### Platform Metrics
- Total listings
- Active sellers
- Transaction volume
- Popular categories
- Search trends

## Future Enhancements

1. **Payment Integration**
   - Stripe/PayPal integration
   - Escrow service
   - Cryptocurrency options

2. **Advanced Features**
   - Live auctions
   - Bundle deals
   - Subscription boxes
   - Wholesale options

3. **Social Commerce**
   - Live streaming sales
   - Social sharing
   - Influencer partnerships

4. **Logistics Support**
   - Shipping calculator
   - Label printing
   - Tracking integration
   - Insurance options

## API Endpoints

```typescript
// GET /api/marketplace/listings
// Get listings with filters

// POST /api/marketplace/listings
// Create new listing (sellers only)

// GET /api/marketplace/sellers/:id
// Get seller profile

// POST /api/marketplace/apply
// Submit seller application

// POST /api/marketplace/report
// Report listing or seller
```

## Related Features
- [AI Tools](../ai-tools/) - Find items to resell
- [Community Q&A](../community/) - Ask about products
- [User Management](../user-management/) - Seller profiles