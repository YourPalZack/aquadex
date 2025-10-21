# Implementation Plan: Local Fish Store Directory

**Branch**: `002-local-store-directory` | **Date**: October 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-local-store-directory/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Local Fish Store Directory enables local aquarium stores to create verified business profiles with contact details, hours, and photo galleries, then publish time-limited deals and discounts. Users can search the directory by location, filter by store specialties, and discover deals from nearby stores. The feature prioritizes store registration and user search (P1) as the MVP foundation, followed by deal management (P2) and deal discovery aggregation (P3).

**Technical Approach**: Implement as cloud-native Next.js feature using Supabase for data persistence, authentication, and image storage. Location-based search requires geospatial queries and map integration. Store verification uses email confirmation flow. Deal expiration handled via automated database triggers or scheduled tasks.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode), Node.js 20+  
**Framework**: Next.js 15.2+ with App Router (server and client components)  
**Primary Dependencies**: 
- React 18.3+ (UI components)
- Supabase 2.39+ (database, auth, storage)
- Drizzle ORM 0.30+ (database queries and migrations)
- Zod 3.24+ (validation)
- React Hook Form (form management)
- Tailwind CSS + Shadcn UI (styling)
- Lucide React (icons)
- Mapbox GL JS 3.1+ with react-map-gl 7.1+ (mapping, 50k loads/month free)
- Mapbox Geocoding API (address to coordinates, 100k requests/month free)
- PostGIS extension (geospatial distance queries)

**Storage**: Supabase PostgreSQL with PostGIS extension for geospatial queries, Supabase Storage for store images  
**Authentication**: Supabase Auth with email/password and email verification  
**Testing**: React Testing Library + Jest (when requested)  
**Target Platform**: Web (desktop and mobile browsers)  
**Project Type**: Web application (Next.js monolith)  
**Performance Goals**: 
- Store search results in under 2 seconds for 500+ stores
- Store profile page load under 3 seconds
- Map rendering with 50+ markers without lag
- Image optimization for fast gallery loading

**Constraints**: 
- Search radius limited to 100 miles maximum
- 5 gallery images + 1 profile image per store (6 total)
- 10 concurrent active deals per store maximum
- 90-day inactive store data retention
- Mobile-first responsive design (320px to 1920px)

**Scale/Scope**: 
- Support 500+ store profiles initially, scalable to 10k+
- Expected 100k+ monthly users searching directory
- 5-10 pages (signup, directory, store profile, deals list, dashboard)
- 15-20 new React components
- 4-5 database tables with relationships

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` version 1.0.0

### Required Checks:
- [x] **Component-First**: Feature designed as modular React components in `src/components/local-fish-stores/` with clear single responsibilities (StoreCard, StoreProfile, DealCard, StoreSearchForm, etc.)
- [x] **Cloud-Native**: Uses Supabase PostgreSQL (cloud-hosted), Supabase Auth, and Supabase Storage. No localhost-only dependencies. All data and auth flows work in browser.
- [x] **User Story Prioritization**: Specification defines P1 (store registration + directory search), P2 (deal management), P3 (deal aggregation). MVP is clearly P1 stories only.
- [x] **AI-Enhanced**: N/A - This feature does not require AI flows. Directory search and filtering are standard database queries.
- [x] **Type Safety**: Will define TypeScript interfaces for Store, Deal, StoreCategory entities in `src/types/index.ts`. Zod schemas for store registration and deal creation forms.
- [x] **Mobile-First**: Responsive design required per spec. Cards layout, search filters, and map views must work on mobile (320px+). Using Tailwind breakpoints and Shadcn UI responsive components.

### Violations (if any):
**None**. All constitution principles are followed. AI-Enhanced principle not applicable as this is a CRUD feature without ML/AI requirements.

## Project Structure

### Documentation (this feature)

```
specs/002-local-store-directory/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-routes.md    # Next.js API route specifications
│   └── server-actions.md # Server action signatures
├── checklists/
│   └── requirements.md  # Already created - spec validation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── local-fish-stores/              # Main directory page
│   │   ├── page.tsx                    # Store directory listing with search
│   │   ├── loading.tsx                 # Loading skeleton
│   │   ├── error.tsx                   # Error boundary
│   │   └── [storeSlug]/                # Individual store pages
│   │       ├── page.tsx                # Store profile view
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── store-signup/                   # Store owner registration
│   │   └── page.tsx
│   ├── store-dashboard/                # Store owner management (auth required)
│   │   ├── page.tsx                    # Dashboard overview
│   │   ├── profile/
│   │   │   └── page.tsx                # Edit store profile
│   │   └── deals/
│   │       ├── page.tsx                # Manage deals
│   │       └── new/
│   │           └── page.tsx            # Create new deal
│   └── discounts-deals/                # Already exists, enhance for stores
│       └── page.tsx                    # Aggregate deals from all stores
│
├── components/
│   └── local-fish-stores/              # New feature components
│       ├── StoreCard.tsx               # Store listing card with distance
│       ├── StoreProfile.tsx            # Full store profile display
│       ├── StoreSearchForm.tsx         # Location + filter search
│       ├── StoreMap.tsx                # Map view with markers
│       ├── StoreGallery.tsx            # Image gallery component
│       ├── BusinessHoursDisplay.tsx    # Hours with open/closed status
│       ├── DealCard.tsx                # Individual deal display
│       ├── DealForm.tsx                # Create/edit deal form
│       ├── DealsList.tsx               # List of deals with filters
│       ├── StoreSignupForm.tsx         # Store registration form
│       └── StoreDashboard.tsx          # Dashboard layout
│
├── lib/
│   ├── actions/
│   │   ├── store-supabase.ts           # Store CRUD server actions
│   │   └── deal-supabase.ts            # Deal CRUD server actions
│   └── db/
│       └── schema/
│           ├── stores.ts               # Drizzle schema for stores
│           └── deals.ts                # Drizzle schema for deals
│
├── types/
│   └── index.ts                        # Add Store, Deal, StoreCategory types
│
└── hooks/
    ├── use-geolocation.tsx             # Hook for user location
    └── use-store-search.tsx            # Hook for store search state

database/
└── migrations/
    ├── XXXX_create_stores_table.sql
    ├── XXXX_create_deals_table.sql
    ├── XXXX_add_postgis_extension.sql
    └── XXXX_create_store_indexes.sql
```

**Structure Decision**: Using Next.js App Router structure (Option 2 variant). All pages in `src/app/` directory following Next.js 15 conventions. Components organized by feature domain in `src/components/local-fish-stores/`. Server actions in `src/lib/actions/` for database operations. Database schema using Drizzle ORM in `src/lib/db/schema/`. This aligns with existing AquaDex architecture.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**None**. All constitution principles followed without exceptions.

## Implementation Phases

### Phase 0: Research (COMPLETED)
**Completion Date**: October 20, 2025  
**Output**: `research.md`

✅ **Completed Research**:
- Mapping service selection: Mapbox chosen (generous free tier, unified with geocoding)
- Geocoding service: Mapbox Geocoding API (100k requests/month free)
- Distance calculation: PostGIS ST_Distance with geography type (accuracy + performance)
- Email verification: Supabase Auth with is_store_owner flag
- Deal expiration: Database view (MVP) with path to pg_cron for automation
- Image storage: Supabase Storage + Next.js Image optimization

**Key Decisions**:
1. Use Mapbox GL JS over Google Maps (no credit card required, 50k map loads/month free)
2. Use PostGIS spatial queries over client-side Haversine (better performance at scale)
3. Use Supabase Auth email verification over custom tokens (built-in, secure)
4. Use database views for deal expiration in MVP (simple), upgrade to pg_cron later
5. Use Supabase Storage over Cloudinary (unified platform, 1GB free)

### Phase 1: Design & Contracts (COMPLETED)
**Completion Date**: October 20, 2025  
**Output**: `data-model.md`, `contracts/server-actions.md`, `quickstart.md`

✅ **Completed Design**:
- Database schema: 2 main tables (`stores` with 21 fields, `deals` with 14 fields)
- PostGIS integration: `location` as GEOGRAPHY(POINT,4326) with GiST spatial index
- RLS policies: Public read verified stores, owners CRUD own stores/deals
- TypeScript interfaces: Store, Deal, BusinessHours, StoreCategory types
- Server actions: 15+ actions for CRUD, search, geocoding (createStoreAction, searchStoresAction, etc.)
- Migration SQL: Complete with constraints, indexes, triggers
- Development setup: Environment variables, dependencies, Mapbox config

**Constitution Re-Check**: ✅ **PASSED** (all 6 principles validated in Constitution Check section)

### Phase 2: Task Breakdown (PENDING)
**Command**: `/speckit.tasks` (user must run after Phase 1 completion)  
**Output**: `tasks.md`

**Expected Tasks** (will be auto-generated from user stories):
- User Story 1 (P1): Store owner signup and profile creation
  - Task: Create stores table migration with PostGIS
  - Task: Implement createStoreAction with geocoding
  - Task: Build StoreSignupForm component
  - Task: Create /store-signup page
  - Task: Add email verification flow
  
- User Story 2 (P1): Directory search and filtering
  - Task: Implement searchStoresAction with radius query
  - Task: Build StoreSearchForm component
  - Task: Build StoreCard component
  - Task: Create /local-fish-stores page
  - Task: Integrate Mapbox map view
  
- User Story 3 (P2): Deal creation and management
  - Task: Create deals table migration
  - Task: Implement deal server actions
  - Task: Build DealForm component
  - Task: Create /store-dashboard/deals page
  
- User Story 4 (P3): Deal discovery aggregation
  - Task: Enhance /discounts-deals page
  - Task: Implement searchDealsAction with aggregation
  - Task: Build deal filtering UI

**Estimated Timeline**: 4-6 days total (P1: 2-3 days, P2: 1-2 days, P3: 1 day)

### Phase 3: Implementation (NOT STARTED)
**Start Condition**: After Phase 2 tasks.md created and reviewed  
**Output**: Working feature code in repository

**Implementation Order** (by priority):
1. **P1 MVP** (Store Registration + Directory):
   - Database migrations (stores table with PostGIS)
   - Server actions for store CRUD and search
   - Store signup flow with email verification
   - Store directory page with search and filters
   - Individual store profile pages
   - Map integration with Mapbox
   
2. **P2 Deal Management**:
   - Database migrations (deals table)
   - Server actions for deal CRUD
   - Store dashboard with deal management
   - Deal creation/editing forms
   - Deal display on store profiles
   
3. **P3 Deal Discovery**:
   - Enhanced /discounts-deals page
   - Deal aggregation across stores
   - Location-based deal filtering
   - Deal sorting and pagination

**Testing Strategy**:
- Unit tests for server actions (validation, error handling)
- Integration tests for database queries (PostGIS distance calculations)
- E2E tests for critical flows (store signup, store search, deal creation)
- Manual testing for map interactions and image uploads

### Phase 4: Quality Assurance (NOT STARTED)
**Start Condition**: After Phase 3 implementation complete  
**Quality Gates** (per constitution):
- [ ] All TypeScript strict mode errors resolved
- [ ] Zod validation on all form inputs
- [ ] RLS policies tested and working
- [ ] Performance: Store search under 2s for 500+ stores
- [ ] Performance: Map renders 50+ markers smoothly
- [ ] Mobile responsive (320px to 1920px tested)
- [ ] Email verification flow working end-to-end
- [ ] Image uploads working with 5MB limit enforced
- [ ] 10-deal limit enforced via trigger
- [ ] Geocoding accuracy verified (test known addresses)
- [ ] Distance calculations verified (spot-check PostGIS results)

## Dependencies & Risks

### External Dependencies
1. **Mapbox API** (Maps + Geocoding)
   - Risk: Free tier limits (50k map loads, 100k geocoding requests/month)
   - Mitigation: Monitor usage, implement caching, upgrade if needed
   - Fallback: Switch to OpenStreetMap + Nominatim (lower UX)

2. **Supabase PostGIS Extension**
   - Risk: PostGIS not enabled or not available
   - Mitigation: Verify extension in project setup, document enablement
   - Fallback: Use Haversine formula client-side (slower)

3. **Supabase Storage**
   - Risk: 1GB free tier limit for images
   - Mitigation: Image compression, Next.js optimization, monitor usage
   - Fallback: Cloudinary or AWS S3 (requires code changes)

### Internal Dependencies
1. **Existing Authentication System**
   - Dependency: Supabase Auth already configured
   - Risk: Low - existing auth used by other features

2. **Existing UI Components**
   - Dependency: shadcn/ui components (Card, Form, Button, etc.)
   - Risk: Low - components already in use

### Technical Risks
1. **PostGIS Query Performance**
   - Risk: Spatial queries slow with 1000+ stores
   - Mitigation: GiST indexes on location column, limit search radius to 100 miles
   - Monitoring: Log query times, optimize if >2s

2. **Map Rendering Performance**
   - Risk: Lag with 100+ markers on map
   - Mitigation: Limit markers to 50 visible, use clustering for dense areas
   - Monitoring: Test on mobile devices

3. **Email Verification Reliability**
   - Risk: Verification emails not delivered
   - Mitigation: Use Supabase built-in email (tested), add retry mechanism
   - Monitoring: Track verification completion rate

4. **Deal Expiration Accuracy**
   - Risk: Expired deals still showing
   - Mitigation: MVP uses database view (queries filter), upgrade to pg_cron for automation
   - Monitoring: Spot-check expired deals

### Timeline Risks
- **Risk**: P1 MVP takes longer than 3 days
  - Mitigation: Start with store signup only, defer search to separate PR
  
- **Risk**: Mapbox integration complex
  - Mitigation: Follow quickstart.md examples, use react-map-gl abstraction

## Success Criteria

### MVP (P1) Success Criteria (from spec.md)
- [ ] Store owners can successfully sign up and create verified profiles
- [ ] Store profiles display all required information (name, address, hours, contact)
- [ ] Users can search for stores within specified radius of their location
- [ ] Search results show distance from user and filter by category
- [ ] Individual store pages load with complete details
- [ ] Gallery images display properly
- [ ] Email verification works end-to-end

### P2 Success Criteria
- [ ] Store owners can create/edit/delete deals from dashboard
- [ ] Deal validation enforces all business rules (dates, limits)
- [ ] Deals display on store profile pages
- [ ] Deal status (active/expired) calculated correctly

### P3 Success Criteria
- [ ] /discounts-deals page shows aggregated deals from all stores
- [ ] Filtering by location, category, discount type works
- [ ] Sorting options work correctly

### Performance Criteria
- [ ] Store search completes in <2s for 500+ stores
- [ ] Store profile page loads in <3s
- [ ] Map renders 50+ markers without lag
- [ ] Image gallery loads optimized images

### Quality Criteria (Constitution Compliance)
- [ ] All TypeScript interfaces defined with strict mode
- [ ] Zod schemas validate all user inputs
- [ ] Components are modular and reusable
- [ ] Mobile responsive on 320px to 1920px screens
- [ ] RLS policies prevent unauthorized access
- [ ] Error boundaries handle failures gracefully

## Next Steps

1. ✅ **Phase 0 Complete**: Research decisions documented in `research.md`
2. ✅ **Phase 1 Complete**: Design and contracts documented in `data-model.md`, `contracts/server-actions.md`, `quickstart.md`
3. ⏳ **Phase 2 Required**: User must run `/speckit.tasks` command to generate `tasks.md`
4. ⏳ **Phase 3 Pending**: Implementation starts after tasks breakdown reviewed
5. ⏳ **Phase 4 Pending**: QA and testing after implementation

**Ready for Task Breakdown**: Yes - all Phase 0 and Phase 1 deliverables complete.

---

**Last Updated**: October 20, 2025  
**Plan Version**: 1.0  
**Status**: Phase 1 Complete - Ready for `/speckit.tasks`

