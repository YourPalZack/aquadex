# AI Tools Feature Documentation

## Overview
The AI Tools suite provides intelligent search and discovery capabilities for aquarium enthusiasts, leveraging AI to find the perfect fish, plants, equipment, and supplies from multiple online sources.

## Feature Components

### 1. Fish Finder
- Search for specific fish species or characteristics
- Find compatible tank mates
- Locate rare or specialty species
- Compare prices across vendors

### 2. Plant Finder
- Discover aquatic plants by requirements
- Find plants for specific aquascaping styles
- Locate tissue cultures and rare varieties
- Get care guides and placement tips

### 3. Tank Finder
- Search by dimensions, volume, or style
- Find specialty tanks (rimless, bow front, etc.)
- Compare brands and prices
- Get setup recommendations

### 4. Filtration Finder
- Match filters to tank size and bioload
- Find specific filter media
- Compare filtration technologies
- Get maintenance tips

### 5. Lighting Finder
- Search by tank dimensions and plant needs
- Find specific spectrum requirements
- Compare LED vs other technologies
- Calculate PAR requirements

## User Flows

### Using Fish Finder
1. Navigate to `/fish-finder` from `/aiquarium-tools`
2. Enter search criteria:
   - Species name or common name
   - Tank size and parameters
   - Temperament preferences
   - Budget range
3. AI searches multiple sources
4. View consolidated results with:
   - Vendor information
   - Pricing
   - Availability
   - Care requirements
5. Click through to vendor sites

### Discovery Mode
1. Start from `/aiquarium-tools` hub
2. Choose a tool based on need
3. Use natural language queries
4. Refine results with filters
5. Save interesting finds to wishlist

## Technical Implementation

### AI Flow Architecture

```typescript
// Fish Finder Flow
const findFishFlow = defineFlow({
  name: 'findFish',
  inputSchema: z.object({
    query: z.string(),
    tankSize: z.number().optional(),
    waterType: z.enum(['freshwater', 'saltwater']).optional(),
    priceRange: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    compatibility: z.array(z.string()).optional()
  }),
  outputSchema: z.array(FishListingSchema)
});

interface FishListing {
  id: string;
  scientificName: string;
  commonName: string;
  vendor: {
    name: string;
    url: string;
    reputation: number;
  };
  price: number;
  availability: 'in-stock' | 'pre-order' | 'out-of-stock';
  size: string;
  careLevel: 'beginner' | 'intermediate' | 'expert';
  parameters: {
    tempMin: number;
    tempMax: number;
    phMin: number;
    phMax: number;
  };
  imageUrl: string;
  description: string;
}
```

### Search Sources Integration

Each AI tool searches across multiple sources:

**Fish Finder Sources:**
- LiveAquaria
- Aquatic Arts
- Imperial Tropicals
- Local fish store inventories
- Aquabid marketplace
- Facebook groups

**Equipment Finder Sources:**
- Amazon
- BRS (Bulk Reef Supply)
- Marine Depot
- Petco/Petsmart
- Specialty retailers

### Components

- `FishFinderForm` - Search interface for fish
- `PlantFinderForm` - Plant search interface
- `TankFinderForm` - Tank search interface
- `FiltrationFinderForm` - Filter search interface
- `LightingFinderForm` - Lighting search interface
- `*ListingCard` - Display search results
- `VendorComparisonTable` - Compare across vendors (planned)

### Caching Strategy

- Cache search results for 1 hour
- Store popular searches
- Pre-fetch common queries
- Background refresh for price updates

## Search Intelligence Features

### 1. Natural Language Processing
- Understand queries like "colorful fish for 20 gallon"
- Extract parameters from descriptions
- Handle common misspellings

### 2. Compatibility Checking
- Warn about incompatible selections
- Suggest better alternatives
- Consider existing livestock

### 3. Smart Recommendations
- Learn from user preferences
- Suggest based on tank profile
- Seasonal availability alerts

## API Integration

```typescript
// POST /api/ai-tools/search
{
  tool: 'fish' | 'plant' | 'tank' | 'filter' | 'lighting',
  query: string,
  filters: {
    // Tool-specific filters
  }
}

// GET /api/ai-tools/recommendations
// Get personalized recommendations

// POST /api/ai-tools/save-search
// Save search for alerts
```

## Future Enhancements

1. **Price Tracking**
   - Historical price charts
   - Price drop alerts
   - Bulk purchase optimization

2. **Advanced Features**
   - Visual search (upload photo)
   - AR preview in tank
   - Availability notifications

3. **Vendor Integration**
   - Direct ordering
   - Inventory sync
   - Exclusive deals

4. **Community Features**
   - User reviews integration
   - Success stories
   - Compatibility reports

## Performance Optimization

- Parallel vendor searches
- Progressive result loading
- Image lazy loading
- Search result pagination
- Intelligent caching

## Related Features
- [Aquarium Management](../aquarium-management/) - Apply to your tanks
- [Marketplace](../marketplace/) - Sell/trade findings
- [Community Q&A](../community/) - Ask about products