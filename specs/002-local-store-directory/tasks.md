# Tasks: Local Fish Store Directory

**Input**: Design documents from `/specs/002-local-store-directory/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Not explicitly requested in specification - tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- Next.js App Router: `src/app/` for pages
- React components: `src/components/local-fish-stores/`
- Server actions: `src/lib/actions/`
- Database schema: `src/lib/db/schema/`
- TypeScript types: `src/types/index.ts`
- Database migrations: `database/migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and environment configuration

- [ ] T001 Install Mapbox dependencies: `npm install react-map-gl mapbox-gl` and dev types: `npm install --save-dev @types/mapbox-gl`
- [ ] T002 [P] Add NEXT_PUBLIC_MAPBOX_TOKEN environment variable to `.env.local` (get token from mapbox.com)
- [ ] T003 [P] Create TypeScript interfaces in `src/types/index.ts` for Store, Deal, StoreCategory, BusinessHours, SocialLinks
- [ ] T004 Create Mapbox utility functions in `src/lib/mapbox.ts` for geocoding API wrapper

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Enable PostGIS extension in Supabase: Run `CREATE EXTENSION IF NOT EXISTS postgis;` in SQL Editor
- [ ] T006 Create stores table migration in `database/migrations/0001_create_stores_table.sql` with all 25 fields including PostGIS location
- [ ] T007 Create deals table migration in `database/migrations/0002_create_deals_table.sql` with all 15 fields and 10-deal constraint
- [ ] T008 [P] Create Drizzle schema for stores in `src/lib/db/schema/stores.ts` with PostGIS geography type
- [ ] T009 [P] Create Drizzle schema for deals in `src/lib/db/schema/deals.ts` with foreign key to stores
- [ ] T010 Run database migrations to create stores and deals tables in Supabase
- [ ] T011 Create Supabase Storage bucket `store-images` (public) with RLS policies for read/write access
- [ ] T012 Create database views in `database/migrations/0003_create_views.sql` for active_stores and active_deals
- [ ] T013 Create database indexes in `database/migrations/0004_create_indexes.sql` (GiST on location, B-tree on slug/city/state)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Store Registration and Profile Creation (Priority: P1) 🎯 MVP

**Goal**: Store owners can sign up, create profiles with business details, and have their store appear in the searchable directory after email verification.

**Independent Test**: Store owner completes registration form → profile created → email verification sent → store appears in directory with all details

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create StoreSignupForm component in `src/components/local-fish-stores/StoreSignupForm.tsx` with React Hook Form + Zod validation
- [ ] T015 [P] [US1] Create BusinessHoursDisplay component in `src/components/local-fish-stores/BusinessHoursDisplay.tsx` for showing hours and open/closed status
- [ ] T016 [P] [US1] Create StoreGallery component in `src/components/local-fish-stores/StoreGallery.tsx` for image carousel display
- [ ] T017 [US1] Implement createStoreAction in `src/lib/actions/store-supabase.ts` with geocoding, slug generation, and database insert
- [ ] T018 [US1] Implement uploadStoreImageAction in `src/lib/actions/store-supabase.ts` with 5MB limit and gallery max 5 enforcement
- [ ] T019 [US1] Implement updateStoreAction in `src/lib/actions/store-supabase.ts` with re-geocoding and slug regeneration
- [ ] T020 [US1] Implement deleteStoreImageAction in `src/lib/actions/store-supabase.ts` for gallery image removal
- [ ] T021 [US1] Create store signup page in `src/app/store-signup/page.tsx` with StoreSignupForm integration
- [ ] T022 [US1] Add email verification flow using Supabase Auth with is_store_owner user metadata flag
- [ ] T023 [US1] Create store profile edit page in `src/app/store-dashboard/profile/page.tsx` for store owners to update details
- [ ] T024 [US1] Add form validation error handling and success messages to StoreSignupForm

**Checkpoint**: At this point, User Story 1 should be fully functional - stores can register, verify email, and edit profiles

---

## Phase 4: User Story 2 - Browse and Search Store Directory (Priority: P1) 🎯 MVP

**Goal**: Users can search for stores by location, view results sorted by distance, filter by specialties, and access full store profiles.

**Independent Test**: User enters location → sees list of stores sorted by distance → filters by specialty → clicks store → views full profile with contact info

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create StoreCard component in `src/components/local-fish-stores/StoreCard.tsx` displaying name, distance, address, hours, deal indicator
- [ ] T026 [P] [US2] Create StoreSearchForm component in `src/components/local-fish-stores/StoreSearchForm.tsx` with location input and category filters
- [ ] T027 [P] [US2] Create StoreProfile component in `src/components/local-fish-stores/StoreProfile.tsx` showing full business details
- [ ] T028 [P] [US2] Create StoreMap component in `src/components/local-fish-stores/StoreMap.tsx` using react-map-gl with store markers
- [ ] T029 [US2] Implement searchStoresAction in `src/lib/actions/store-supabase.ts` with PostGIS radius query (ST_DWithin) and distance sorting
- [ ] T030 [US2] Implement getStoreBySlugAction in `src/lib/actions/store-supabase.ts` joining with active deals
- [ ] T031 [US2] Implement geocodeAddressAction in `src/lib/actions/store-supabase.ts` wrapping Mapbox Geocoding API
- [ ] T032 [US2] Create store directory page in `src/app/local-fish-stores/page.tsx` with search form, results grid, and map toggle
- [ ] T033 [US2] Create store profile page in `src/app/local-fish-stores/[storeSlug]/page.tsx` showing full details and deals
- [ ] T034 [US2] Create loading skeleton in `src/app/local-fish-stores/loading.tsx` matching card grid layout
- [ ] T035 [US2] Create error boundary in `src/app/local-fish-stores/error.tsx` with retry and home navigation
- [ ] T036 [US2] Add loading skeleton for store profile in `src/app/local-fish-stores/[storeSlug]/loading.tsx`
- [ ] T037 [US2] Add error boundary for store profile in `src/app/local-fish-stores/[storeSlug]/error.tsx`
- [ ] T038 [US2] Create use-geolocation custom hook in `src/hooks/use-geolocation.tsx` for browser geolocation API
- [ ] T039 [US2] Create use-store-search custom hook in `src/hooks/use-store-search.tsx` for search state management
- [ ] T040 [US2] Add "no results found" message with suggestions to expand search radius in directory page
- [ ] T041 [US2] Add distance calculation display in StoreCard (miles from user location)
- [ ] T042 [US2] Add current open/closed status badge using BusinessHoursDisplay in StoreCard and StoreProfile
- [ ] T043 [US2] Add contact links (directions, phone click-to-call, website) to StoreProfile component

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - complete MVP is functional

---

## Phase 5: User Story 3 - Create and Manage Deals/Discounts (Priority: P2)

**Goal**: Store owners can create deals with details, publish them, manage active deals, and have them automatically expire when dates pass.

**Independent Test**: Verified store owner logs in → creates deal with discount details and dates → deal appears on store profile → user sees deal → deal expires automatically

### Implementation for User Story 3

- [ ] T044 [P] [US3] Create DealCard component in `src/components/local-fish-stores/DealCard.tsx` displaying deal title, discount, dates, terms
- [ ] T045 [P] [US3] Create DealForm component in `src/components/local-fish-stores/DealForm.tsx` with React Hook Form + Zod for deal creation/editing
- [ ] T046 [P] [US3] Create DealsList component in `src/components/local-fish-stores/DealsList.tsx` for store owner's deal management view
- [ ] T047 [P] [US3] Create StoreDashboard component in `src/components/local-fish-stores/StoreDashboard.tsx` for dashboard layout
- [ ] T048 [US3] Implement createDealAction in `src/lib/actions/deal-supabase.ts` with 10-deal limit validation and date validation
- [ ] T049 [US3] Implement updateDealAction in `src/lib/actions/deal-supabase.ts` for editing deal details
- [ ] T050 [US3] Implement deactivateDealAction in `src/lib/actions/deal-supabase.ts` for manual deal deactivation
- [ ] T051 [US3] Implement reactivateDealAction in `src/lib/actions/deal-supabase.ts` with date validation (end_date >= today)
- [ ] T052 [US3] Implement deleteDealAction in `src/lib/actions/deal-supabase.ts` for permanent deal removal
- [ ] T053 [US3] Implement getStoreDealsAction in `src/lib/actions/deal-supabase.ts` to fetch all deals for a store
- [ ] T054 [US3] Create store dashboard overview page in `src/app/store-dashboard/page.tsx` showing active deals count and recent activity
- [ ] T055 [US3] Create deals management page in `src/app/store-dashboard/deals/page.tsx` with DealsList showing all store deals
- [ ] T056 [US3] Create deal creation page in `src/app/store-dashboard/deals/new/page.tsx` with DealForm
- [ ] T057 [US3] Add deal edit functionality to deals management page (inline editing or modal)
- [ ] T058 [US3] Add authentication check to store-dashboard pages (redirect if not store owner)
- [ ] T059 [US3] Add visual deal indicator badge to StoreCard in directory (integrate with US2)
- [ ] T060 [US3] Add active deals section to store profile page showing DealCards (integrate with US2)
- [ ] T061 [US3] Add deal expiration date display with countdown in DealCard
- [ ] T062 [US3] Add validation preventing deals with end_date in past
- [ ] T063 [US3] Add validation enforcing end_date > start_date
- [ ] T064 [US3] Add error handling for 10-deal limit with user-friendly message

**Checkpoint**: All P1 and P2 user stories should now be independently functional - store owners can manage deals

---

## Phase 6: User Story 4 - Featured Deals Discovery (Priority: P3)

**Goal**: Users can browse all active deals from all stores in their area, filter by category, sort by discount, and quickly find the best promotions.

**Independent Test**: User accesses deals page → sets location → sees aggregated deals from multiple stores → filters by category → sorts by discount → clicks deal → views store details

### Implementation for User Story 4

- [ ] T065 [P] [US4] Implement searchDealsAction in `src/lib/actions/deal-supabase.ts` aggregating deals across stores with location/category/type filters
- [ ] T066 [US4] Enhance existing `/discounts-deals` page in `src/app/discounts-deals/page.tsx` to integrate local store deals
- [ ] T067 [US4] Add location filter to discounts-deals page using geocoding for radius search
- [ ] T068 [US4] Add category filter (freshwater, saltwater, plants, equipment, etc.) to discounts-deals page
- [ ] T069 [US4] Add discount type filter (percentage, fixed_amount, bogo, freebie) to discounts-deals page
- [ ] T070 [US4] Add sort options (discount percentage, expiration date, distance) to discounts-deals page
- [ ] T071 [US4] Display DealCards in grid layout with associated store name and distance
- [ ] T072 [US4] Add "View Store" link on each DealCard linking to store profile page
- [ ] T073 [US4] Add pagination for deal results (20 deals per page)
- [ ] T074 [US4] Add loading skeleton to discounts-deals page during search
- [ ] T075 [US4] Add "no deals found" message with suggestions when filters return empty results

**Checkpoint**: All user stories (P1, P2, P3) should now be independently functional - complete feature delivered

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality gates

- [ ] T076 [P] Add SEO metadata to all new pages (local-fish-stores, store-signup, store-dashboard) in page.tsx files
- [ ] T077 [P] Add OpenGraph and Twitter card meta tags for store profile pages with dynamic store details
- [ ] T078 [P] Optimize store gallery images using Next.js Image component with proper sizing and lazy loading
- [ ] T079 [P] Add mobile-responsive breakpoints to all components (320px to 1920px) using Tailwind
- [ ] T080 [P] Test and optimize PostGIS query performance (ensure <2s for 500+ stores)
- [ ] T081 [P] Add map clustering for dense store areas (>50 stores in viewport)
- [ ] T082 Create comprehensive error messages for all server actions with user-friendly text
- [ ] T083 Add revalidatePath calls to all mutation actions (create/update/delete) for proper cache invalidation
- [ ] T084 Add logging for store creation, deal creation, and search queries using existing logging infrastructure
- [ ] T085 Add rate limiting for store signup (prevent spam registrations)
- [ ] T086 Add slug collision handling (append city-state suffix if business name slug exists)
- [ ] T087 Add inactive store cleanup job (mark stores inactive after 90 days of inactivity) - document for future pg_cron
- [ ] T088 Add deal view count increment on deal card clicks
- [ ] T089 Validate all forms work correctly with keyboard navigation (accessibility)
- [ ] T090 Add ARIA labels to all interactive elements for screen readers
- [ ] T091 Test email verification flow end-to-end with real Supabase emails
- [ ] T092 Test image upload with various file sizes (enforce 5MB limit)
- [ ] T093 Test gallery image limit enforcement (max 5 images)
- [ ] T094 Test 10-deal limit enforcement with database constraint
- [ ] T095 Run quickstart.md validation: verify all setup steps work from clean state
- [ ] T096 Update project documentation in `docs/AgentKnowledge.md` with local store directory feature overview
- [ ] T097 Code cleanup: Remove console.logs, commented code, unused imports across all new files
- [ ] T098 Final TypeScript strict mode check: ensure no errors in all new files
- [ ] T099 Run `npm run lint` and fix all linting errors in new components and pages
- [ ] T100 Performance test: Load test directory with 500+ stores and verify <2s search time

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - store registration and profiles
- **User Story 2 (Phase 4)**: Depends on Foundational phase - directory search (can parallelize with US1 if pre-populated test data)
- **User Story 3 (Phase 5)**: Depends on US1 completion (needs stores and store owners) - deal management
- **User Story 4 (Phase 6)**: Depends on US3 completion (needs deals to aggregate) - deal discovery
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Works with test stores, integrates with US1 in production
- **User Story 3 (P2)**: Requires US1 (needs authenticated store owners and existing stores)
- **User Story 4 (P3)**: Requires US3 (needs deals to aggregate and display)

### Within Each User Story

**US1 (Store Registration)**:
- Components (T014-T016) can be built in parallel
- Server actions (T017-T020) can be built in parallel after components
- Pages (T021, T023) depend on components and actions
- Email verification (T022) can be implemented in parallel with pages
- Validation (T024) is final step

**US2 (Directory Search)**:
- Components (T025-T028) can be built in parallel
- Server actions (T029-T031) can be built in parallel
- Pages (T032-T033) depend on components and actions
- Loading/error states (T034-T037) can be added in parallel after pages
- Hooks (T038-T039) can be built in parallel with components
- Polish items (T040-T043) are final steps

**US3 (Deal Management)**:
- Components (T044-T047) can be built in parallel
- Server actions (T048-T053) can be built in parallel after components
- Pages (T054-T056) depend on components and actions
- Integration tasks (T057-T064) are final steps

**US4 (Deal Discovery)**:
- Server action (T065) first
- Page enhancements (T066-T075) depend on server action

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002 (env vars) and T003 (types) can run in parallel

**Foundational Phase (Phase 2)**:
- T008 (Drizzle stores) and T009 (Drizzle deals) can run in parallel after migrations

**User Story 1 (Phase 3)**:
```bash
# Launch all components together:
- T014: StoreSignupForm component
- T015: BusinessHoursDisplay component
- T016: StoreGallery component

# Then launch server actions together:
- T017: createStoreAction
- T018: uploadStoreImageAction
- T019: updateStoreAction
- T020: deleteStoreImageAction
```

**User Story 2 (Phase 4)**:
```bash
# Launch all components together:
- T025: StoreCard component
- T026: StoreSearchForm component
- T027: StoreProfile component
- T028: StoreMap component

# Launch server actions together:
- T029: searchStoresAction
- T030: getStoreBySlugAction
- T031: geocodeAddressAction

# Launch hooks together:
- T038: use-geolocation hook
- T039: use-store-search hook
```

**User Story 3 (Phase 5)**:
```bash
# Launch all components together:
- T044: DealCard component
- T045: DealForm component
- T046: DealsList component
- T047: StoreDashboard component

# Launch server actions together:
- T048: createDealAction
- T049: updateDealAction
- T050: deactivateDealAction
- T051: reactivateDealAction
- T052: deleteDealAction
- T053: getStoreDealsAction
```

**Polish Phase (Phase 7)**:
```bash
# Many polish tasks can run in parallel:
- T076: SEO metadata
- T077: OpenGraph tags
- T078: Image optimization
- T079: Mobile responsive
- T080: Query performance
- T081: Map clustering
```

---

## Implementation Strategy

### MVP Scope (Recommended for First Release)

**Include**:
- User Story 1 (P1): Store registration and profiles ✅
- User Story 2 (P1): Directory search and browse ✅
- Core polish tasks (T076-T083) ✅

**Result**: Functional store directory where stores can register and users can discover them. This is independently valuable and shippable.

**Timeline**: ~3-4 days

### Extended MVP (Add Deal Management)

**Include**:
- MVP above +
- User Story 3 (P2): Deal creation and management ✅
- Additional polish tasks (T084-T095) ✅

**Result**: Complete store directory with promotional deals. Adds marketing value for stores.

**Timeline**: +2 days (~5-6 days total)

### Full Feature (All User Stories)

**Include**:
- Extended MVP above +
- User Story 4 (P3): Deal discovery aggregation ✅
- All polish tasks (T096-T100) ✅

**Result**: Complete feature with all planned functionality.

**Timeline**: +1 day (~6-7 days total)

### Incremental Delivery Approach

1. **Week 1**: Implement MVP (US1 + US2)
   - Days 1-2: Setup + Foundational (T001-T013)
   - Days 3-4: User Story 1 (T014-T024)
   - Days 5-6: User Story 2 (T025-T043)
   - Day 7: Core polish and testing

2. **Week 2** (if continuing): Add deal management
   - Days 8-9: User Story 3 (T044-T064)
   - Day 10: User Story 4 (T065-T075)
   - Days 11-12: Full polish phase (T076-T100)

---

## Task Summary

- **Total Tasks**: 100
- **Setup Phase**: 4 tasks (T001-T004)
- **Foundational Phase**: 9 tasks (T005-T013) - BLOCKS all user stories
- **User Story 1 (P1)**: 11 tasks (T014-T024) - Store registration
- **User Story 2 (P1)**: 19 tasks (T025-T043) - Directory search
- **User Story 3 (P2)**: 21 tasks (T044-T064) - Deal management
- **User Story 4 (P3)**: 11 tasks (T065-T075) - Deal discovery
- **Polish Phase**: 25 tasks (T076-T100) - Quality and optimization

### Parallel Opportunities Identified

- **Setup**: 2 tasks can run in parallel (T002, T003)
- **Foundational**: 2 tasks can run in parallel (T008, T009)
- **User Story 1**: 3 components + 4 actions = 7 parallel tasks
- **User Story 2**: 4 components + 3 actions + 2 hooks = 9 parallel tasks
- **User Story 3**: 4 components + 6 actions = 10 parallel tasks
- **Polish**: Up to 6 tasks can run in parallel (T076-T081)

**Total Parallelizable Tasks**: ~36 tasks (36% of all tasks)

### Independent Test Criteria

- **US1**: Store completes registration → profile appears in database → email sent → store can edit profile
- **US2**: User searches location → results display with distance → filters work → profile page loads
- **US3**: Store owner creates deal → deal appears on profile → expiration works → 10-deal limit enforced
- **US4**: User views deals page → sees aggregated deals → filters/sorts work → links to stores

### Suggested MVP Scope

**Minimum Viable Product**: User Stories 1 + 2 (P1 only)
- 13 foundational tasks (setup + foundational)
- 30 implementation tasks (US1 + US2)
- 8 core polish tasks (T076-T083)
- **Total**: ~51 tasks for functional MVP
- **Timeline**: 3-4 days

---

**Format Validation**: ✅ All tasks follow checklist format with checkboxes, task IDs, [P] markers for parallelizable tasks, [Story] labels for user story tasks, and specific file paths in descriptions.

**Ready for Implementation**: Yes - tasks can be executed sequentially or in parallel based on dependencies and team capacity.
