# Implementation Planning Complete ✅

**Feature**: Local Fish Store Directory  
**Branch**: `002-local-store-directory`  
**Date**: October 20, 2025  
**Status**: Phase 0 & Phase 1 Complete - Ready for Task Breakdown

---

## Phase Completion Summary

### ✅ Phase 0: Research (COMPLETE)
**Output**: `research.md`

**6 Technical Decisions Made**:

1. **Mapping Service**: Mapbox GL JS
   - Free tier: 50k map loads/month (no credit card)
   - Modern WebGL rendering
   - Unified with geocoding service

2. **Geocoding Service**: Mapbox Geocoding API
   - Free tier: 100k requests/month
   - High accuracy with street-level precision
   - Matches mapping service for consistency

3. **Distance Calculation**: PostGIS ST_Distance
   - Uses `geography` type for accuracy (accounts for Earth curvature)
   - GiST spatial indexes for performance
   - ~1ms query time for <100 mile radius searches

4. **Email Verification**: Supabase Auth
   - Built-in email confirmation
   - `is_store_owner` flag in user metadata
   - Secure, tested, no custom implementation needed

5. **Deal Expiration**: Database View (MVP) → pg_cron (Future)
   - MVP: `active_deals` view filters by dates
   - Simple, no scheduled jobs needed
   - Path to automated cleanup with pg_cron

6. **Image Storage**: Supabase Storage + Next.js Image
   - 1GB free tier
   - Next.js automatic optimization
   - Public bucket with RLS policies

**All decisions documented with rationale in `research.md`**

---

### ✅ Phase 1: Design & Contracts (COMPLETE)
**Output**: `data-model.md`, `contracts/server-actions.md`, `quickstart.md`

#### Database Schema (data-model.md)

**Stores Table** (21 fields):
```sql
- id: UUID primary key
- user_id: UUID foreign key to auth.users
- business_name: TEXT unique (indexed)
- slug: TEXT unique (indexed)
- location: GEOGRAPHY(POINT,4326) with GiST index
- street_address, city, state, postal_code, country
- latitude, longitude (denormalized for quick access)
- phone, email, website, social_links: JSONB
- business_hours: JSONB (day-specific with exceptions)
- description: TEXT
- categories: TEXT[] (freshwater, saltwater, plants, etc.)
- profile_image_url: TEXT
- gallery_images: TEXT[] (max 5 images)
- verification_status: ENUM (pending, verified, rejected)
- verified_at: TIMESTAMPTZ
- is_active: BOOLEAN (default TRUE)
- created_at, updated_at: TIMESTAMPTZ
```

**Deals Table** (14 fields):
```sql
- id: UUID primary key
- store_id: UUID foreign key to stores (cascade delete)
- title: TEXT (max 100 chars)
- description: TEXT (max 500 chars)
- discount_type: ENUM (percentage, fixed_amount, bogo, freebie)
- discount_value: DECIMAL (validated by trigger)
- original_price, sale_price: DECIMAL
- terms_conditions: TEXT
- start_date, end_date: TIMESTAMPTZ (CHECK end > start)
- is_active: BOOLEAN (default TRUE)
- status: ENUM (draft, active, expired) (calculated)
- view_count: INTEGER (default 0)
- created_at, updated_at: TIMESTAMPTZ

CONSTRAINT: 10 active deals max per store (enforced by trigger)
```

**Indexes**:
- GiST spatial index on `stores.location` for distance queries
- B-tree indexes on `slug`, `city`, `state`, `verification_status`
- B-tree composite index on `deals(store_id, status, end_date)`

**RLS Policies**:
- Public read: Verified stores only
- Store owners: Full CRUD on own stores
- Store owners: Full CRUD on own deals

**TypeScript Interfaces**:
```typescript
interface Store {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  location: { type: 'Point'; coordinates: [number, number] };
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  social_links: { facebook?: string; instagram?: string; twitter?: string } | null;
  business_hours: BusinessHours;
  description: string | null;
  categories: StoreCategory[];
  profile_image_url: string | null;
  gallery_images: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  store_id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount' | 'bogo' | 'freebie';
  discount_value: number;
  original_price: number | null;
  sale_price: number | null;
  terms_conditions: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: 'draft' | 'active' | 'expired';
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface BusinessHours {
  [day: string]: { open: string; close: string; closed: boolean };
  exceptions?: { date: string; open: string; close: string; closed: boolean }[];
}

type StoreCategory = 
  | 'freshwater' 
  | 'saltwater' 
  | 'plants' 
  | 'reptiles' 
  | 'general';

interface StoreWithDeals extends Store {
  deals: Deal[];
}
```

#### Server Actions (contracts/server-actions.md)

**15+ Actions Defined**:

**Store Actions**:
- `createStoreAction(data: CreateStoreInput): Promise<ActionResult<Store>>`
  - Geocodes address using Mapbox
  - Generates unique slug from business name
  - Creates store record
  - Sets user metadata `is_store_owner = true`

- `updateStoreAction(storeId: string, data: UpdateStoreInput): Promise<ActionResult<Store>>`
  - Re-geocodes if address changed
  - Updates store record
  - Revalidates paths

- `uploadStoreImageAction(storeId: string, file: File, type: 'profile' | 'gallery'): Promise<ActionResult<string>>`
  - Validates file size (5MB max)
  - Validates image type (jpg, png, webp)
  - Uploads to Supabase Storage
  - Enforces 5 gallery image limit
  - Returns public URL

- `deleteStoreImageAction(storeId: string, imageUrl: string): Promise<ActionResult<void>>`
- `deactivateStoreAction(storeId: string): Promise<ActionResult<void>>`
- `reactivateStoreAction(storeId: string): Promise<ActionResult<void>>`

**Deal Actions**:
- `createDealAction(data: CreateDealInput): Promise<ActionResult<Deal>>`
  - Validates store has <10 active deals
  - Validates dates (end > start, end > now)
  - Creates deal record

- `updateDealAction(dealId: string, data: UpdateDealInput): Promise<ActionResult<Deal>>`
- `deactivateDealAction(dealId: string): Promise<ActionResult<void>>`
- `reactivateDealAction(dealId: string): Promise<ActionResult<void>>`
- `deleteDealAction(dealId: string): Promise<ActionResult<void>>`

**Query Actions**:
- `searchStoresAction(params: StoreSearchParams): Promise<ActionResult<StoreSearchResult>>`
  - PostGIS query: `ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat)::geometry, 4326)::geography, radius)`
  - Orders by distance: `ST_Distance(location, point)`
  - Filters by categories, verification status
  - Returns stores with distance in miles

- `getStoreBySlugAction(slug: string): Promise<ActionResult<StoreWithDeals>>`
  - Joins with active deals
  - Increments view count

- `getStoreDealsAction(storeId: string): Promise<ActionResult<Deal[]>>`

- `searchDealsAction(params: DealSearchParams): Promise<ActionResult<Deal[]>>`
  - Aggregates deals across stores
  - Filters by location, categories, discount type
  - Joins with store for location filtering

**Helper Actions**:
- `geocodeAddressAction(address: string): Promise<ActionResult<{ lat: number; lng: number }>>`
  - Calls Mapbox Geocoding API
  - Returns coordinates

**All actions use `ActionResult<T>` pattern**:
```typescript
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

#### Developer Quickstart (quickstart.md)

**Complete setup guide created** with:

1. **Prerequisites**: Node 20+, Supabase, Mapbox account
2. **Environment Variables**: NEXT_PUBLIC_MAPBOX_TOKEN setup
3. **Dependencies**: `npm install react-map-gl mapbox-gl`
4. **Database Setup**: PostGIS extension, run migrations
5. **Storage Setup**: Create `store-images` bucket with RLS
6. **Implementation Phases**: P1 (2-3 days), P2 (1-2 days), P3 (1 day)
7. **Component Examples**: Mapbox integration code samples
8. **Testing Checklist**: Store registration, search, profile, deals
9. **Common Issues**: Troubleshooting guide
10. **Performance Tips**: Indexing, pagination, caching

---

## Constitution Compliance ✅

**All 6 Principles Validated** (re-checked after Phase 1 design):

- ✅ **Component-First**: 10+ modular components in `src/components/local-fish-stores/`
- ✅ **Cloud-Native**: Supabase (PostgreSQL + Auth + Storage), Mapbox API
- ✅ **User Story Prioritization**: P1 MVP (store registration + search) clearly defined
- ✅ **AI-Enhanced**: N/A - This is CRUD feature, no AI/ML required
- ✅ **Type Safety**: TypeScript interfaces, Zod schemas, strict mode
- ✅ **Mobile-First**: Responsive design 320px-1920px with Tailwind breakpoints

**No Violations** - No complexity justification needed

---

## Project Structure

### Documentation Files Created

```
specs/002-local-store-directory/
├── spec.md                      # ✅ Feature specification (31 FRs, 4 user stories)
├── plan.md                      # ✅ Implementation plan (this phase's output)
├── research.md                  # ✅ Technical decisions (6 choices documented)
├── data-model.md                # ✅ Database schema (stores + deals tables)
├── quickstart.md                # ✅ Developer setup guide
├── checklists/
│   └── requirements.md          # ✅ Spec validation checklist (all passed)
└── contracts/
    └── server-actions.md        # ✅ API contracts (15+ actions)
```

### Source Code Structure (To Be Implemented)

```
src/
├── app/
│   ├── local-fish-stores/              # Directory page + store profiles
│   ├── store-signup/                   # Store registration
│   ├── store-dashboard/                # Store owner management
│   └── discounts-deals/                # Deal aggregation (enhance existing)
│
├── components/
│   └── local-fish-stores/              # 10 new components
│       ├── StoreCard.tsx
│       ├── StoreProfile.tsx
│       ├── StoreSearchForm.tsx
│       ├── StoreMap.tsx
│       ├── StoreGallery.tsx
│       ├── BusinessHoursDisplay.tsx
│       ├── DealCard.tsx
│       ├── DealForm.tsx
│       ├── DealsList.tsx
│       └── StoreSignupForm.tsx
│
├── lib/
│   └── actions/
│       ├── store-supabase.ts           # Store CRUD actions
│       └── deal-supabase.ts            # Deal CRUD actions
│
└── types/
    └── index.ts                        # Add Store, Deal types

database/
└── migrations/
    ├── XXXX_create_stores_table.sql
    └── XXXX_create_deals_table.sql
```

---

## Dependencies Added

### New NPM Packages
```json
{
  "react-map-gl": "^7.1.7",
  "mapbox-gl": "^3.1.0"
}
```

### New Environment Variables
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

### New Database Extensions
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mapbox API limits exceeded | High | Monitor usage, implement caching, free tier generous (50k/month) |
| PostGIS queries slow | Medium | GiST indexes, limit radius to 100 miles, log query times |
| Map rendering lag | Medium | Limit markers to 50 visible, use clustering for dense areas |
| Email verification unreliable | High | Supabase built-in (tested), add retry mechanism |
| Deal expiration drift | Low | MVP uses DB view (queries filter), upgrade to pg_cron later |

---

## Performance Targets

- **Store Search**: <2 seconds for 500+ stores
- **Store Profile**: <3 seconds page load
- **Map Rendering**: 50+ markers without lag
- **Image Gallery**: Optimized loading with Next.js Image
- **Distance Calculation**: ~1ms per PostGIS query

---

## Next Steps

### ⏳ Phase 2: Task Breakdown (PENDING)

**User Action Required**: Run `/speckit.tasks` command

This will generate `tasks.md` with:
- Prioritized implementation tasks from user stories
- P1 MVP broken down into subtasks
- Acceptance criteria for each task
- Timeline estimates and dependencies

**Expected Output**:
```
specs/002-local-store-directory/tasks.md
├── User Story 1 (P1): Store owner signup
│   ├── Task 1.1: Create stores table migration
│   ├── Task 1.2: Implement createStoreAction
│   ├── Task 1.3: Build StoreSignupForm
│   └── ...
├── User Story 2 (P1): Directory search
│   ├── Task 2.1: Implement searchStoresAction
│   ├── Task 2.2: Build StoreSearchForm
│   └── ...
└── ...
```

### ⏳ Phase 3: Implementation (PENDING)

**Start Condition**: After `tasks.md` created and reviewed

**Implementation Order**:
1. P1 MVP: Store registration + directory search (2-3 days)
2. P2: Deal management (1-2 days)
3. P3: Deal aggregation (1 day)

**Total Estimated Time**: 4-6 days

---

## Quality Gates (Before Ship)

Per constitution, must pass:
- [ ] TypeScript strict mode (no errors)
- [ ] Zod validation on all inputs
- [ ] RLS policies tested
- [ ] Performance targets met
- [ ] Mobile responsive (320px-1920px)
- [ ] Email verification working
- [ ] Image uploads working
- [ ] 10-deal limit enforced
- [ ] Distance calculations accurate

---

## Documentation Updated

### Agent Context
✅ Updated `.github/copilot-instructions.md` with:
- Mapbox technologies
- PostGIS extension
- react-map-gl library
- Local store directory structure

### Feature Tracking
✅ All planning documents created in `specs/002-local-store-directory/`

---

## Summary

**Phase 0 (Research)** and **Phase 1 (Design & Contracts)** are **COMPLETE** ✅

- 6 technical decisions made and documented
- Database schema fully designed (2 tables, indexes, RLS)
- 15+ server actions specified with type signatures
- TypeScript interfaces defined
- Developer quickstart guide created
- Constitution compliance validated
- All NEEDS CLARIFICATION markers resolved

**Ready for Phase 2**: User can now run `/speckit.tasks` to generate implementation tasks.

**Total Documentation**: 7 files created (plan, research, data-model, server-actions, quickstart, requirements checklist, this summary)

**Estimated Implementation Time**: 4-6 days after task breakdown

---

**Status**: 🟢 **GREEN** - Planning complete, ready to proceed

**Next Command**: `/speckit.tasks`
