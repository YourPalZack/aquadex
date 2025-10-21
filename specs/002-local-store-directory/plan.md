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
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

