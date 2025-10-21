# Research & Technical Decisions

**Feature**: Local Fish Store Directory  
**Date**: October 20, 2025  
**Phase**: 0 - Research & Analysis

## Research Questions

### 1. Mapping Service Selection

**Question**: Which mapping service should we use for store location display and distance calculations?

**Options Evaluated**:
1. **Google Maps API**
   - Pros: Comprehensive, accurate, familiar UX, excellent mobile support
   - Cons: Pricing ($7/1000 map loads after free tier), requires credit card
   - Free tier: $200/month credit (≈28k map loads)

2. **Mapbox**
   - Pros: Modern, customizable, good pricing, generous free tier
   - Cons: Less familiar to users, requires learning curve
   - Free tier: 50k map loads/month

3. **Leaflet + OpenStreetMap**
   - Pros: Free, open-source, no API key needed, full control
   - Cons: Manual geocoding needed, less polished, requires more setup
   - Free tier: Unlimited (self-hosted)

**Decision**: **Mapbox**

**Rationale**:
- Generous free tier (50k loads/month) sufficient for initial launch and growth
- Modern, customizable interface aligns with AquaDex design
- Good React integration via `react-map-gl` library
- No credit card required for free tier (better for MVP)
- Includes geocoding in same API (simpler architecture)

**Implementation Notes**:
- Use `react-map-gl` package for React integration
- Store coordinates in PostGIS format for efficient queries
- Cache geocoded addresses to minimize API calls
- Fallback to static image maps if quota exceeded

---

### 2. Geocoding Service Selection

**Question**: How should we convert store addresses to coordinates for distance calculations?

**Options Evaluated**:
1. **Google Geocoding API**
   - Pros: Highly accurate, handles edge cases well
   - Cons: Requires API key, costs $5/1000 requests after free tier
   - Free tier: $200/month credit

2. **Mapbox Geocoding**
   - Pros: Included with Mapbox API, same authentication, generous free tier
   - Cons: Slightly less accurate for complex addresses
   - Free tier: 100k requests/month (permanent forward geocoding)

3. **PostGIS Geocoding (Nominatim)**
   - Pros: Free, self-hosted option
   - Cons: Less accurate, rate-limited on public servers, requires setup
   - Free tier: Unlimited (self-hosted)

**Decision**: **Mapbox Geocoding API**

**Rationale**:
- Included in Mapbox subscription (same API key, unified billing)
- Generous permanent forward geocoding allowance (100k/month)
- Simplifies architecture (one API for maps + geocoding)
- Good accuracy for US addresses (primary market)
- Caching strategy reduces actual API calls significantly

**Implementation Notes**:
- Geocode on store profile creation/update only
- Store lat/lng in database (PostGIS POINT type)
- Cache results to avoid redundant API calls
- Validate addresses before geocoding
- Handle geocoding failures gracefully with manual coordinate entry fallback

---

### 3. Distance Calculation Approach

**Question**: How should we calculate distances between user location and stores?

**Options Evaluated**:
1. **Client-side Haversine Formula**
   - Pros: No API calls, instant calculation
   - Cons: Less accurate for long distances, doesn't account for curvature
   - Use case: Quick sorting, approximate distances

2. **PostGIS Distance Query**
   - Pros: Accurate, handles geospatial indexing, scales well
   - Cons: Requires PostGIS extension, database-side calculation
   - Use case: Primary search results, efficient filtering

3. **Google Distance Matrix API**
   - Pros: Considers actual driving distance/time
   - Cons: Expensive ($5-$10 per 1000 requests), slow for many stores
   - Use case: Detailed route planning (out of scope)

**Decision**: **PostGIS Distance Query (primary) + Client-side Haversine (fallback)**

**Rationale**:
- PostGIS `ST_Distance` with `geography` type provides accurate great-circle distances
- Built-in spatial indexing (GiST) makes queries fast even with thousands of stores
- No additional API costs beyond Supabase
- Client-side Haversine for dynamic re-sorting without re-query
- Aligns with Supabase PostgreSQL + PostGIS extension

**Implementation Notes**:
```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Query stores within radius
SELECT *, ST_Distance(
  location::geography,
  ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography
) / 1609.34 AS distance_miles
FROM stores
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography,
  $radius_meters
)
ORDER BY distance_miles;
```

---

### 4. Email Verification Flow

**Question**: How should we implement store email verification?

**Options Evaluated**:
1. **Supabase Auth Email Confirmation**
   - Pros: Built-in, handles tokens/expiry, secure
   - Cons: Ties to auth system, may conflict with user accounts
   - Use case: If stores are separate auth users

2. **Custom Verification Table + Tokens**
   - Pros: Full control, separate from user auth, flexible expiry
   - Cons: More code, security concerns, manual token generation
   - Use case: If stores are rows in a table, not auth users

3. **Third-party Email Service (SendGrid, Mailgun)**
   - Pros: Dedicated email infrastructure, analytics
   - Cons: Additional cost/complexity, another API to manage
   - Use case: High-volume transactional emails

**Decision**: **Supabase Auth with Store Role Flag**

**Rationale**:
- Stores ARE users (auth accounts) with `is_store_owner` flag in profiles table
- Leverages Supabase's built-in email verification (secure, tested, free)
- Store profile linked via `user_id` foreign key to auth.users
- Simplifies authentication (one system for users and stores)
- No additional email service needed

**Implementation Notes**:
- Store owners sign up via regular Supabase Auth (`signUp`)
- Set `is_store_owner: true` in user_profiles table on store signup
- Email verification handled by Supabase automatically
- Store profile visible only after `email_confirmed_at` is set
- Use Row Level Security (RLS) to enforce verification requirement

---

### 5. Deal Expiration Automation

**Question**: How should we automatically deactivate expired deals?

**Options Evaluated**:
1. **Database Trigger (PostgreSQL)**
   - Pros: Automatic, no external service, runs on schedule
   - Cons: Limited to DB events, not time-based triggers
   - Use case: On-update events

2. **Scheduled Function (Supabase Edge Functions + pg_cron)**
   - Pros: Native to Supabase, runs on schedule (e.g., every hour)
   - Cons: Requires pg_cron extension, potential cold starts
   - Use case: Periodic cleanup tasks

3. **Client-side Filter (UI-only)**
   - Pros: Simple, no backend logic needed
   - Cons: Deals still in database, confusing for store owners
   - Use case: Temporary solution, not production-ready

4. **Next.js API Route with Cron Job (Vercel Cron)**
   - Pros: Integrated with deployment, external trigger
   - Cons: Requires Vercel Pro plan for cron, adds complexity
   - Use case: Scheduled tasks on Vercel

**Decision**: **Database View + Client-side Filter (MVP) → pg_cron (Future)**

**Rationale**:
- **MVP Approach**: Create database view that filters `WHERE end_date >= NOW()` for active deals. Client queries only show active deals. Store dashboard shows all deals with expired status indicator.
- **Future Enhancement**: Use Supabase `pg_cron` extension to run nightly cleanup:
  ```sql
  UPDATE deals SET status = 'expired' WHERE end_date < NOW() AND status = 'active';
  ```
- No additional infrastructure needed for MVP
- Scales well with query performance (indexed date columns)
- Deferred automation to post-MVP reduces initial complexity

**Implementation Notes**:
```sql
-- MVP: View for active deals
CREATE VIEW active_deals AS
SELECT * FROM deals
WHERE end_date >= NOW() AND status = 'active';

-- Future: pg_cron job
SELECT cron.schedule(
  'expire-deals-daily',
  '0 0 * * *',  -- Run daily at midnight
  $$UPDATE deals SET status = 'expired' WHERE end_date < NOW() AND status = 'active'$$
);
```

---

### 6. Image Storage & Optimization

**Question**: How should we store and optimize store images?

**Options Evaluated**:
1. **Supabase Storage (Native)**
   - Pros: Integrated, secure, RLS policies, free tier (1GB)
   - Cons: No built-in image optimization/resizing
   - Use case: Primary storage

2. **Cloudinary**
   - Pros: Automatic optimization, transformations, CDN
   - Cons: Additional service, costs after free tier (25GB/month)
   - Use case: Image-heavy applications

3. **Next.js Image Optimization**
   - Pros: Built-in, automatic WebP conversion, responsive sizes
   - Cons: Works with external URLs, requires configuration
   - Use case: Optimize on delivery

**Decision**: **Supabase Storage + Next.js Image Component**

**Rationale**:
- Supabase Storage for persistence (1GB free tier = ~1000 images at 1MB each)
- Next.js `<Image>` component handles optimization automatically
- Set up Supabase public bucket for store images with RLS policies
- Images served via Supabase CDN, then optimized by Next.js
- No additional third-party service needed
- Good performance with lazy loading and WebP conversion

**Implementation Notes**:
```typescript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('store-images')
  .upload(`${storeId}/profile.jpg`, file);

// Display with Next.js Image
<Image
  src={supabaseUrl}
  alt="Store profile"
  width={400}
  height={300}
  className="object-cover"
/>
```

**Storage Structure**:
```
store-images/
├── {storeId}/
│   ├── profile.jpg          # Main profile image
│   ├── gallery-1.jpg        # Gallery image 1
│   ├── gallery-2.jpg        # Gallery image 2
│   └── ...                  # Up to gallery-5.jpg
```

---

## Best Practices Research

### Geospatial Queries with PostGIS

**Key Patterns**:
1. **Enable PostGIS Extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Store Coordinates as Geography Type**:
   ```sql
   ALTER TABLE stores ADD COLUMN location GEOGRAPHY(POINT, 4326);
   ```

3. **Create Spatial Index**:
   ```sql
   CREATE INDEX stores_location_idx ON stores USING GIST(location);
   ```

4. **Efficient Radius Queries**:
   - Use `ST_DWithin` for "within radius" filtering (uses index)
   - Calculate distance with `ST_Distance` for sorting
   - Convert meters to miles: `distance_meters / 1609.34`

**Performance Optimization**:
- Spatial indexes (GiST) are essential for performance
- Limit search radius (100 miles max) to reduce query scope
- Use `LIMIT` on queries to cap result set size
- Consider materialized views for frequently accessed aggregations

**Resources**:
- PostGIS documentation: https://postgis.net/docs/
- Supabase PostGIS guide: https://supabase.com/docs/guides/database/extensions/postgis

---

### React Hook Form + Zod Best Practices

**Recommended Pattern**:
```typescript
// 1. Define Zod schema
const storeSchema = z.object({
  name: z.string().min(1, 'Store name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone (10 digits)'),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}$/),
  }),
});

type StoreFormData = z.infer<typeof storeSchema>;

// 2. Use in React Hook Form
const form = useForm<StoreFormData>({
  resolver: zodResolver(storeSchema),
  defaultValues: { /* ... */ },
});

// 3. Submit handler
const onSubmit = async (data: StoreFormData) => {
  const result = await createStoreAction(data);
  // Handle result
};
```

**Benefits**:
- Type safety from form to server
- Client-side validation with instant feedback
- Server-side re-validation prevents tampering
- Error messages automatically map to form fields

---

### Next.js Server Actions for Mutations

**Pattern for Store Operations**:
```typescript
'use server';

export async function createStoreAction(
  data: StoreFormData
): Promise<{ success: boolean; store?: Store; error?: string }> {
  // 1. Re-validate with Zod
  const validated = storeSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid data' };
  }

  // 2. Check auth
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // 3. Geocode address
  const coordinates = await geocodeAddress(data.address);
  
  // 4. Insert into database
  const store = await db.insert(stores).values({
    ...validated.data,
    user_id: user.id,
    location: coordinates,
    status: 'pending_verification',
  }).returning();

  // 5. Revalidate cache
  revalidatePath('/local-fish-stores');
  
  return { success: true, store };
}
```

**Key Principles**:
- Always re-validate on server (never trust client)
- Return structured responses (success, data, error)
- Use revalidatePath/revalidateTag for cache management
- Handle errors gracefully with user-friendly messages

---

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Maps | Mapbox | Latest | Free tier, modern UX, includes geocoding |
| Geocoding | Mapbox API | Latest | Unified with maps, generous free tier |
| Distance | PostGIS | (extension) | Built-in, accurate, indexed queries |
| Email | Supabase Auth | Latest | Built-in verification, secure, no extra cost |
| Image Storage | Supabase Storage | Latest | Integrated, CDN, 1GB free |
| Image Optimization | Next.js Image | 15.2+ | Automatic WebP, lazy loading, responsive |
| Deal Expiration | DB View (MVP) | - | Simple, no cron needed initially |
| Form Validation | React Hook Form + Zod | Latest | Type-safe, instant feedback, server re-validation |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "react-map-gl": "^7.1.7",
    "mapbox-gl": "^3.1.0"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.1.0"
  }
}
```

**Environment Variables**:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

---

## Open Questions for Implementation Phase

1. **Store Slug Generation**: Use `business-name-city-state` format or UUID? (Recommendation: Readable slug with city for SEO)
2. **Search Radius UI**: Dropdown (5, 10, 25, 50, 100 mi) or slider? (Recommendation: Dropdown for simplicity)
3. **Map Zoom Level**: Default zoom when showing multiple stores? (Recommendation: Auto-fit bounds to show all results)
4. **Deal Categories**: Use existing marketplace categories or store-specific? (Recommendation: Reuse existing for consistency)
5. **Store Approval Workflow**: Auto-approve after email verification or manual admin review? (Recommendation: Auto-approve for MVP, add review later if abuse occurs)

---

## Phase 0 Complete

All technical decisions documented and rationale provided. Ready to proceed to Phase 1 (Design & Contracts).
