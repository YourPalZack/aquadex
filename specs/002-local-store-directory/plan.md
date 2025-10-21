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
- [NEEDS CLARIFICATION: Mapping service - Google Maps API, Mapbox, or Leaflet?]
- [NEEDS CLARIFICATION: Geocoding service - Google Geocoding API, Mapbox, or PostGIS?]

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

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

