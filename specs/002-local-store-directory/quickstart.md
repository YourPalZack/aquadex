# Developer Quickstart

**Feature**: Local Fish Store Directory  
**Last Updated**: October 20, 2025

## Overview

This feature adds a local fish store directory to AquaDex, allowing stores to register, create profiles, and share deals with users. Users can search for stores by location and discover deals from nearby stores.

## Prerequisites

- Node.js 20+
- AquaDex repository cloned
- Supabase project configured
- Mapbox account and API token

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```env
# Mapbox (for maps and geocoding)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get Mapbox Token**:
1. Sign up at https://mapbox.com
2. Go to Account > Tokens
3. Copy your default public token (starts with `pk.`)

### 2. Install Dependencies

```bash
npm install react-map-gl mapbox-gl
npm install --save-dev @types/mapbox-gl
```

### 3. Database Setup

Run migrations to create tables:

```bash
# Enable PostGIS extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations (or execute SQL from data-model.md)
npm run db:migrate

# Or manually in Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy/paste migration SQL from specs/002-local-store-directory/data-model.md
# 3. Run Migration 1 (stores table)
# 4. Run Migration 2 (deals table)
```

### 4. Configure Supabase Storage

Create storage bucket for store images:

1. Go to Supabase Dashboard > Storage
2. Create new bucket: `store-images`
3. Set to **public**
4. Configure policies (or use SQL):

```sql
-- Allow public read access
CREATE POLICY "Public can view store images"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-images');

-- Allow store owners to upload their images
CREATE POLICY "Store owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow store owners to delete their images
CREATE POLICY "Store owners can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Verify Setup

```bash
# Start development server
npm run dev

# Visit pages (should 404 until implemented):
# http://localhost:3000/local-fish-stores
# http://localhost:3000/store-signup
# http://localhost:3000/store-dashboard
```

## Implementation Phases

### Phase 1: Core Infrastructure (P1 - MVP)

**Goal**: Get store registration and directory search working

**Tasks**:
1. Create database schema (migrations already defined)
2. Create TypeScript types in `src/types/index.ts`
3. Implement server actions in `src/lib/actions/store-supabase.ts`
4. Build store registration form and page
5. Build store directory search page
6. Build individual store profile page

**Estimated Time**: 2-3 days

**Success Criteria**:
- Stores can sign up and create profiles
- Users can search stores by location
- Store profiles display with all details
- Email verification works
- Images upload successfully

### Phase 2: Deal Management (P2)

**Goal**: Enable stores to create and manage deals

**Tasks**:
1. Implement deal server actions in `src/lib/actions/deal-supabase.ts`
2. Build store dashboard page
3. Build deal creation/editing forms
4. Display deals on store profiles
5. Implement deal status management

**Estimated Time**: 1-2 days

**Success Criteria**:
- Store owners can create/edit/delete deals
- Deals display on store profiles
- Deal expiration handled correctly
- 10-deal limit enforced

### Phase 3: Deal Discovery (P3)

**Goal**: Aggregate deals across all stores

**Tasks**:
1. Enhance `/discounts-deals` page with store deals
2. Add filtering by location, category, discount type
3. Add sorting options
4. Implement deal detail view

**Estimated Time**: 1 day

**Success Criteria**:
- Users can browse all active deals
- Filtering and sorting work correctly
- Deals link back to store profiles

## Key Components to Build

### Store Components (`src/components/local-fish-stores/`)

1. **StoreCard.tsx** - Display in search results
   ```tsx
   interface StoreCardProps {
     store: Store;
     distance?: number;
     showDeals?: boolean;
   }
   ```

2. **StoreProfile.tsx** - Full store details
   ```tsx
   interface StoreProfileProps {
     store: StoreWithDeals;
   }
   ```

3. **StoreSearchForm.tsx** - Location + filter search
   ```tsx
   interface StoreSearchFormProps {
     onSearch: (params: StoreSearchParams) => void;
     initialValues?: Partial<StoreSearchParams>;
   }
   ```

4. **StoreMap.tsx** - Map with store markers
   ```tsx
   interface StoreMapProps {
     stores: Store[];
     center: [number, number];
     onStoreClick?: (store: Store) => void;
   }
   ```

5. **StoreSignupForm.tsx** - Registration form
   ```tsx
   // Uses React Hook Form + Zod
   // Submits to createStoreAction
   ```

### Deal Components

6. **DealCard.tsx** - Deal display card
7. **DealForm.tsx** - Create/edit deal form
8. **DealsList.tsx** - List with filters

### Utility Components

9. **BusinessHoursDisplay.tsx** - Show hours + open/closed status
10. **StoreGallery.tsx** - Image gallery with lightbox

## Mapbox Integration Example

```tsx
'use client';

import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function StoreMap({ stores, center }: StoreMapProps) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: center[0],
        latitude: center[1],
        zoom: 11
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {stores.map(store => (
        <Marker
          key={store.id}
          longitude={store.location.coordinates[0]}
          latitude={store.location.coordinates[1]}
          anchor="bottom"
        >
          <div className="text-primary">📍</div>
        </Marker>
      ))}
    </Map>
  );
}
```

## Testing Checklist

### Store Registration
- [ ] Form validation works
- [ ] Email verification sent
- [ ] Store appears in database
- [ ] Geocoding converts address correctly
- [ ] Slug generated properly
- [ ] Images upload successfully

### Store Search
- [ ] Search by location works
- [ ] Distance calculated correctly
- [ ] Filters apply properly
- [ ] Map displays stores
- [ ] Pagination works
- [ ] Open/closed status accurate

### Store Profile
- [ ] All details display
- [ ] Gallery images load
- [ ] Hours display correctly
- [ ] Contact links work
- [ ] Deals shown if active

### Deal Management
- [ ] Create deal form works
- [ ] Validation enforced
- [ ] Date validation works
- [ ] 10-deal limit enforced
- [ ] Edit/delete works
- [ ] Expiration handled

## Common Issues & Solutions

### Issue: Geocoding fails
**Solution**: Check Mapbox token in environment variables. Ensure address format is complete (street, city, state, zip).

### Issue: Map not displaying
**Solution**: Ensure `mapbox-gl` CSS is imported. Check Mapbox token is public token (starts with `pk.`).

### Issue: PostGIS queries failing
**Solution**: Verify PostGIS extension is enabled: `SELECT PostGIS_version();`

### Issue: Images not uploading
**Solution**: Check storage bucket is public and RLS policies are configured. Verify file size under 5MB.

### Issue: Store not appearing in search
**Solution**: Check `verification_status = 'verified'` and `is_active = TRUE`. Verify user's email is confirmed.

## Performance Tips

1. **Index Usage**: Ensure spatial indexes are created on `stores.location`
2. **Pagination**: Always use `LIMIT` on search queries
3. **Image Optimization**: Use Next.js `<Image>` component with proper sizing
4. **Caching**: Consider React Query for client-side caching of search results
5. **Map Performance**: Limit markers to 50-100 visible stores max

## Next Steps After MVP

1. Add store reviews/ratings
2. Implement store analytics dashboard
3. Add appointment booking
4. Send deal expiration reminders
5. Add store-to-user messaging
6. Implement deal saved/bookmarking
7. Add store categories/badges
8. Create admin approval workflow

## Resources

- **Spec**: `specs/002-local-store-directory/spec.md`
- **Data Model**: `specs/002-local-store-directory/data-model.md`
- **Server Actions**: `specs/002-local-store-directory/contracts/server-actions.md`
- **Mapbox Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **PostGIS Guide**: https://postgis.net/workshops/postgis-intro/
- **React Map GL**: https://visgl.github.io/react-map-gl/

## Support

For questions or issues during implementation, refer to:
- Constitution: `.specify/memory/constitution.md`
- Agent Knowledge: `docs/AgentKnowledge.md`
- Project Docs: `docs/ProjectDocumentation.md`

---

Happy coding! 🐠🗺️
