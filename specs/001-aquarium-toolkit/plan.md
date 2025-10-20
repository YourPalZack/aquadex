# Implementation Plan: Comprehensive Aquarium Management Toolkit

**Branch**: `001-aquarium-toolkit` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-aquarium-toolkit/spec.md`

**Note**: This plan implements all 8 user stories (P1-P4) with cloud-native architecture replacing Firebase with Supabase + Neon PostgreSQL.

## Summary

Build a comprehensive web application for aquarium enthusiasts featuring AI-powered water test analysis, aquarium profile management, historical tracking, treatment recommendations, maintenance reminders, product discovery, community Q&A, and marketplace functionality. The application prioritizes mobile-first responsive design with cloud-native architecture using Next.js 15, Supabase for auth/storage, Neon PostgreSQL for structured data, and Genkit for AI flows.

**Technical Approach**: Next.js full-stack application with server components and API routes, Supabase for authentication and file storage, Neon PostgreSQL with Drizzle ORM for type-safe database access, Genkit AI flows exposed via Next.js API routes, and Shadcn UI components with Tailwind CSS for consistent mobile-first design.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode), Node.js 20+  
**Primary Dependencies**: Next.js 15.2+, React 18.3+, Supabase 2.39+, Drizzle ORM 0.30+, Genkit 1.8+, Zod 3.24+  
**Storage**: Neon PostgreSQL (serverless, primary database), Supabase Storage (image uploads)  
**Authentication**: Supabase Auth (email/password + OAuth providers)  
**Testing**: Vitest (unit), Playwright (E2E when needed)  
**Target Platform**: Modern web browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+), mobile-responsive (320px-1920px)  
**Project Type**: Web application (Next.js App Router with server + client components)  
**Performance Goals**: 
  - Page load: <3s (95th percentile)
  - AI analysis: <10s per test strip
  - API responses: <2s under normal load
  - Support 1,000 concurrent users
**Constraints**: 
  - Must work on 3G connections for core features
  - Graceful degradation when AI services unavailable
  - WCAG 2.1 AA accessibility compliance
  - Mobile-first responsive design (320px minimum)
**Scale/Scope**: 
  - Initial target: 10,000 users
  - 65 functional requirements across 8 user stories
  - 11 database entities
  - ~50 UI components
  - 10+ AI flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` for current principles (v1.0.0)

### Initial Check (Pre-Research)

- [x] **Component-First**: Feature designed as modular React components?
  - ✅ All UI organized in `src/components/` by feature domain
  - ✅ Components follow single-responsibility: forms, cards, tables, dialogs
  - ✅ TypeScript interfaces for all component props
  - ✅ Shadcn UI base components with feature-specific compositions

- [x] **Cloud-Native**: No localhost-only dependencies? Uses Neon/Supabase?
  - ✅ Neon PostgreSQL (serverless, cloud-hosted) for structured data
  - ✅ Supabase Auth for authentication (replaces Firebase Auth)
  - ✅ Supabase Storage for images (replaces Firebase Storage)
  - ✅ All services accessible via environment variables
  - ✅ No local database or service dependencies

- [x] **User Story Prioritization**: P1/P2/P3 priorities defined with MVP identified?
  - ✅ 8 user stories with priorities: P1 (2), P2 (2), P3 (3), P4 (1)
  - ✅ MVP = P1 stories (Aquarium Profiles + Water Testing)
  - ✅ Each story independently testable and deployable
  - ✅ Clear acceptance criteria for all stories

- [x] **AI-Enhanced**: AI flows use Genkit with API route exposure?
  - ✅ Genkit 1.8+ with Google AI for test strip analysis
  - ✅ AI flows in `src/ai/flows/` (analyze-test-strip, recommend-treatment, find-fish, etc.)
  - ✅ Exposed via Next.js API routes at `/api/ai/*`
  - ✅ Fallback experiences for AI service unavailability

- [x] **Type Safety**: TypeScript interfaces + Zod schemas defined?
  - ✅ TypeScript 5.3+ strict mode enabled
  - ✅ Domain interfaces in `src/types/`
  - ✅ Zod schemas for form validation and API boundaries
  - ✅ Drizzle ORM for type-safe database access
  - ✅ Database schema matches TypeScript types

- [x] **Mobile-First**: Responsive design considerations documented?
  - ✅ Tailwind CSS mobile-first utilities
  - ✅ Shadcn UI responsive components
  - ✅ Viewport testing 320px-1920px
  - ✅ WCAG 2.1 AA compliance required
  - ✅ Design system colors: primary (#45B6FE), background (#E0F7FA), accent (#4DB6AC)

### Constitution Adjustments

**Note**: The constitution currently specifies Firebase for auth/storage. Per user requirement to avoid Firebase, we're using **Supabase** as a complete replacement:
- Supabase Auth (email/password + OAuth) replaces Firebase Auth
- Supabase Storage replaces Firebase Storage
- Both integrate seamlessly with PostgreSQL (Neon)
- Maintains cloud-native, serverless architecture
- No principle violations - Supabase is equally cloud-native

**Justification**: Supabase provides equivalent functionality to Firebase while offering better PostgreSQL integration, open-source transparency, and tighter alignment with our Neon database choice. All constitution principles remain satisfied.

### Post-Design Re-Check (Completed 2025-10-20)

- [x] **Component-First**: All components remain modular?
  - ✅ data-model.md defines 11 independent entities
  - ✅ API contracts organized by domain (aquariums, water-tests, ai-flows, community, marketplace)
  - ✅ Each component has clear single responsibility
  - ✅ No cross-cutting concerns or tight coupling

- [x] **Cloud-Native**: Architecture still uses Neon/Supabase?
  - ✅ Neon PostgreSQL confirmed in data-model.md
  - ✅ Supabase Auth + Storage confirmed in API contracts
  - ✅ All services use environment variables (quickstart.md)
  - ✅ No localhost dependencies introduced

- [x] **User Story Prioritization**: Priorities maintained?
  - ✅ All contracts map to original user stories
  - ✅ P1 features (aquariums, water-tests) have complete API contracts
  - ✅ P2-P4 features documented with appropriate scope
  - ✅ No scope creep detected

- [x] **AI-Enhanced**: Genkit flows properly designed?
  - ✅ ai-flows.yaml defines 8 Genkit flow endpoints
  - ✅ Test strip analysis uses Google AI/Gemini
  - ✅ All flows exposed via Next.js API routes
  - ✅ Fallback strategies documented in contracts

- [x] **Type Safety**: Database + API types consistent?
  - ✅ Drizzle schema types in data-model.md
  - ✅ OpenAPI 3.0 schemas in all contracts/*.yaml
  - ✅ Zod validation documented in quickstart.md
  - ✅ TypeScript strict mode maintained

- [x] **Mobile-First**: Design remains responsive?
  - ✅ API contracts are device-agnostic (REST endpoints)
  - ✅ Data model supports all screen sizes
  - ✅ Quickstart.md includes mobile testing instructions
  - ✅ Responsive testing (320px-1920px) in success checklist

**Verdict**: ✅ All constitution principles satisfied after Phase 1 design. No violations or concerns.

## Project Structure

### Documentation (this feature)

```
specs/001-aquarium-toolkit/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and patterns
├── data-model.md        # Phase 1: Database schema and entities
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API endpoint contracts
│   ├── aquariums.yaml
│   ├── water-tests.yaml
│   ├── ai-flows.yaml
│   ├── community.yaml
│   └── marketplace.yaml
├── checklists/
│   └── requirements.md  # Already complete
└── spec.md              # Feature specification (already complete)
```

### Source Code (repository root)

This is a Next.js web application using App Router (chosen structure):

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # Protected routes group
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── aquariums/
│   │   │   ├── page.tsx          # List view
│   │   │   ├── [id]/page.tsx     # Detail view
│   │   │   └── new/page.tsx      # Create form
│   │   ├── analyze/page.tsx      # Water test analysis
│   │   ├── history/page.tsx      # Test history
│   │   ├── reminders/page.tsx    # Maintenance calendar
│   │   ├── profile/page.tsx      # User profile
│   │   └── settings/page.tsx     # User settings
│   ├── (tools)/                  # AI tools routes group
│   │   ├── fish-finder/page.tsx
│   │   ├── plant-finder/page.tsx
│   │   ├── tank-finder/page.tsx
│   │   ├── filtration-finder/page.tsx
│   │   └── lighting-finder/page.tsx
│   ├── (community)/              # Community features
│   │   ├── qa/
│   │   │   ├── page.tsx          # Questions list
│   │   │   ├── [id]/page.tsx     # Question detail
│   │   │   └── ask/page.tsx      # New question
│   │   └── marketplace/
│   │       ├── page.tsx          # Browse listings
│   │       ├── [id]/page.tsx     # Listing detail
│   │       └── new/page.tsx      # Create listing
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI flow endpoints
│   │   │   ├── analyze-test/route.ts
│   │   │   ├── recommend-treatment/route.ts
│   │   │   ├── find-fish/route.ts
│   │   │   ├── find-plant/route.ts
│   │   │   └── find-equipment/route.ts
│   │   ├── aquariums/route.ts
│   │   ├── water-tests/route.ts
│   │   ├── reminders/route.ts
│   │   ├── questions/route.ts
│   │   └── listings/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components by feature
│   ├── aquariums/
│   │   ├── aquarium-card.tsx
│   │   ├── aquarium-form.tsx
│   │   ├── livestock-list.tsx
│   │   └── equipment-list.tsx
│   ├── water-testing/
│   │   ├── image-upload-form.tsx
│   │   ├── analysis-results.tsx
│   │   ├── parameter-badge.tsx
│   │   └── treatment-recommendations.tsx
│   ├── history/
│   │   ├── test-history-table.tsx
│   │   ├── trend-chart.tsx
│   │   └── export-button.tsx
│   ├── reminders/
│   │   ├── reminder-form.tsx
│   │   ├── reminder-card.tsx
│   │   └── maintenance-calendar.tsx
│   ├── ai-tools/
│   │   ├── fish-finder-form.tsx
│   │   ├── product-card.tsx
│   │   └── compatibility-badge.tsx
│   ├── community/
│   │   ├── question-form.tsx
│   │   ├── question-card.tsx
│   │   ├── answer-form.tsx
│   │   └── vote-buttons.tsx
│   ├── marketplace/
│   │   ├── listing-form.tsx
│   │   ├── listing-card.tsx
│   │   ├── listing-filters.tsx
│   │   └── message-button.tsx
│   ├── auth/
│   │   ├── signin-form.tsx
│   │   ├── signup-form.tsx
│   │   └── auth-provider.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   └── mobile-menu.tsx
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── toast.tsx
│       └── ... (other Shadcn components)
│
├── lib/                          # Utilities and services
│   ├── db/                       # Database
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Database schema
│   │   └── migrations/           # SQL migrations
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── actions/                  # Server actions
│   │   ├── aquariums.ts
│   │   ├── water-tests.ts
│   │   ├── reminders.ts
│   │   ├── questions.ts
│   │   └── listings.ts
│   ├── validations/              # Zod schemas
│   │   ├── aquarium.ts
│   │   ├── water-test.ts
│   │   ├── reminder.ts
│   │   ├── question.ts
│   │   └── listing.ts
│   └── utils.ts                  # Helper functions
│
├── ai/                           # AI workflows
│   ├── genkit.ts                 # Genkit configuration
│   ├── dev.ts                    # Genkit dev server
│   └── flows/                    # AI flows
│       ├── analyze-test-strip.ts
│       ├── recommend-treatment.ts
│       ├── find-fish-flow.ts
│       ├── find-plant-flow.ts
│       ├── find-tank-flow.ts
│       ├── find-filter-flow.ts
│       ├── find-lighting-flow.ts
│       ├── get-food-purchase-links.ts
│       └── index.ts
│
├── types/                        # TypeScript definitions
│   ├── index.ts                  # Main exports
│   ├── aquarium.ts
│   ├── water-test.ts
│   ├── reminder.ts
│   ├── community.ts
│   └── marketplace.ts
│
└── hooks/                        # Custom React hooks
    ├── use-aquariums.ts
    ├── use-water-tests.ts
    ├── use-reminders.ts
    ├── use-auth.ts
    └── use-toast.ts

tests/                            # Test files (when needed)
├── unit/                         # Component tests
└── e2e/                          # Playwright tests
```

**Structure Decision**: Next.js App Router (Option 2: Web application) chosen because:
1. This is a full-stack web application requiring both frontend and backend capabilities
2. Next.js App Router provides built-in routing, server components, and API routes
3. Single codebase simplifies deployment and development
4. Server actions eliminate need for separate backend API
5. App Router grouping enables clear feature organization
6. Aligns with constitution's Component-First and Cloud-Native principles

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations**: All constitution principles are satisfied. The Supabase substitution for Firebase maintains equivalent cloud-native, serverless architecture without adding complexity.

---

## Implementation Milestones

### Phase 0: Research & Technology Decisions ✅ COMPLETE

**Completed**: 2025-10-20  
**Artifact**: `research.md` (350+ lines)  
**Outcomes**:
- Selected Supabase (auth + storage) over Firebase
- Chose Drizzle ORM over Prisma for PostgreSQL-native performance
- Confirmed Genkit 1.8+ with Google AI/Gemini for AI flows
- Selected React Hook Form + Zod for form handling
- Documented implementation patterns for all technologies
- Defined complete environment variable requirements
- Established security best practices

**Key Decisions**:
1. **Database**: Neon PostgreSQL (serverless, 0.5GB free tier)
2. **Auth**: Supabase Auth (email/password + OAuth providers)
3. **Storage**: Supabase Storage (image uploads, public buckets)
4. **ORM**: Drizzle ORM 0.30+ (type-safe, schema-first)
5. **AI**: Genkit 1.8+ with Google AI (Gemini 2.0 Flash)
6. **Forms**: React Hook Form 7.54+ with Zod 3.24+ validation
7. **UI**: Shadcn UI + Tailwind CSS 3.4+
8. **Deployment**: Vercel (Next.js optimized)

### Phase 1: Detailed Design ✅ COMPLETE

**Completed**: 2025-10-20  
**Artifacts Created**:

1. **`data-model.md`** (11 entities, 400+ lines)
   - Complete Drizzle ORM schema definitions
   - Entity relationships with foreign keys
   - Indexes for query optimization
   - Validation rules and constraints
   - Migration strategy

2. **`contracts/aquariums.yaml`** (OpenAPI 3.0)
   - CRUD operations for aquarium profiles
   - Livestock management endpoints
   - Equipment tracking endpoints
   - ~250 lines with full request/response schemas

3. **`contracts/water-tests.yaml`** (OpenAPI 3.0)
   - Water test recording (manual + AI)
   - Test history with pagination
   - Trend analysis endpoints
   - Treatment recommendations
   - Test strip image analysis endpoint
   - ~300 lines

4. **`contracts/ai-flows.yaml`** (OpenAPI 3.0)
   - 8 AI tool endpoints (fish-finder, plant-finder, etc.)
   - Food recommendations
   - Treatment suggestions
   - Product deals finder
   - ~400 lines

5. **`contracts/community.yaml`** (OpenAPI 3.0)
   - Q&A question/answer CRUD
   - Voting system
   - Answer acceptance
   - Tag management
   - ~300 lines

6. **`contracts/marketplace.yaml`** (OpenAPI 3.0)
   - Listing CRUD operations
   - Search and filtering
   - Messaging system
   - Category management
   - ~350 lines

7. **`quickstart.md`** (Developer onboarding, 500+ lines)
   - Complete setup instructions
   - Neon PostgreSQL configuration
   - Supabase project setup
   - Google AI API key setup
   - Database migration commands
   - Testing workflows for all features
   - Common troubleshooting
   - Success checklist (20 items)

**Constitution Re-Check**: ✅ All principles satisfied (see Post-Design Re-Check above)

**Agent Context Update**: ✅ Completed via `.specify/scripts/bash/update-agent-context.sh copilot`
- Updated `.github/copilot-instructions.md` with technology stack
- Added TypeScript 5.3+, Next.js 15.2+, Supabase, Neon, Drizzle, Genkit, Zod

### Phase 2: Task Breakdown (Pending)

**Status**: Not started  
**Command**: Run `.specify/scripts/bash/setup-tasks.sh` to begin Phase 2  
**Expected Artifacts**:
- Individual task files for each component/feature
- Task dependencies and ordering
- Effort estimates
- Assignment to developers (when applicable)

**Next Steps**:
1. Break down implementation into granular tasks (~50-100 tasks expected)
2. Organize by user story priority (P1 → P4)
3. Create task files with acceptance criteria
4. Assign complexity scores (1-5)
5. Begin implementation starting with P1 features

---

## Ready for Implementation 🚀

**Phase 0 and Phase 1 Complete**. All design artifacts created. Next: Run task breakdown to begin coding.

