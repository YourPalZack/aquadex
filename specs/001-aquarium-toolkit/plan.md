# Implementation Plan: Comprehensive Aquarium Management Toolkit

**Branch**: `001-aquarium-toolkit` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-aquarium-toolkit/spec.md`

**Note**: This implementation plan follows the SpecKit planning workflow and includes Phase 0 (Research) and Phase 1 (Design & Contracts) outputs.

## Summary

The Comprehensive Aquarium Management Toolkit provides aquarium enthusiasts with a complete platform for managing their aquariums effectively. Core features include:

1. **Aquarium Profile Management** (P1): Digital inventory of tanks with livestock and equipment tracking
2. **Water Quality Testing & AI Analysis** (P1): AI-powered test strip photo analysis with instant parameter readings and safety assessments
3. **Historical Tracking & Trends** (P2): Long-term water quality monitoring with trend detection and data export
4. **Treatment Recommendations** (P2): AI-generated product suggestions with dosage calculations and safety warnings
5. **Maintenance Reminders** (P3): Recurring task scheduling with notifications
6. **AI Product Discovery** (P3): Intelligent recommendations for fish, plants, and equipment
7. **Community Forum & Q&A** (P3): User questions, answers, voting, and reputation system
8. **Marketplace** (P4): Buying/selling equipment and livestock with messaging

**Technical Approach**: Next.js 15 App Router with TypeScript, Supabase Auth (migrating from Firebase), Neon PostgreSQL with Row-Level Security, Genkit AI flows, and Tailwind CSS + Shadcn UI for responsive mobile-first design.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode), Node.js 20+
**Primary Dependencies**: 
- Next.js 15.2+ (App Router with server/client components)
- React 18.3+
- Drizzle ORM 0.30+ (type-safe queries)
- Genkit 1.8+ (AI flows)
- Zod 3.24+ (validation)
- React Hook Form 7.54+
- Shadcn UI + Tailwind CSS 3+

**Storage**: 
- Neon PostgreSQL (serverless, cloud-hosted with connection pooling max 10 connections, 30s idle timeout)
- Supabase Storage or Cloudflare R2 (image storage - migrating from Firebase Storage)

**Authentication**: 
- Supabase Auth or NextAuth.js (migrating from Firebase Auth)
- RBAC with 4 roles: standard, verified_seller, moderator, admin
- Session token with server-side validation

**Testing**: Jest + React Testing Library (unit), Playwright (E2E), axe-core (accessibility)

**Target Platform**: Web (responsive mobile-first design, 320px-1920px viewports)

**Project Type**: Web application (Next.js full-stack)

**Performance Goals**: 
- Page load <3s (95th percentile)
- API response <2s under normal load (100 concurrent users)
- AI analysis <10s (85% of requests), 15s timeout
- 99.5% uptime during peak hours

**Constraints**: 
- Row-Level Security (RLS) enforcing user_id ownership on all tables
- WCAG 2.1 AA accessibility compliance
- Works on 3G connections for core features (excludes AI analysis, image uploads)
- Image uploads max 5MB with EXIF stripping
- Test strip images retained 90 days, messages 1 year, core data indefinite

**Scale/Scope**: 
- Initial target: <10,000 users
- 11 core entities (User, Aquarium, WaterTest, Livestock, Equipment, MaintenanceTask, TreatmentRecommendation, Question, Answer, MarketplaceListing, Message)
- 8 user stories (3 P1, 2 P2, 2 P3, 1 P4)
- 66 functional requirements across all features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` (Version 1.0.0)

### Required Checks:
- [x] **Component-First**: ✅ All features designed as modular React components organized in `src/components/` by feature domain (aquariums, water-testing, marketplace, community, etc.)
- [x] **Cloud-Native**: ✅ Neon PostgreSQL (serverless), Supabase/NextAuth (auth), Supabase Storage/R2 (images), Genkit AI via API routes. No localhost dependencies.
- [x] **User Story Prioritization**: ✅ 8 user stories with explicit P1-P4 priorities. MVP = P1 stories (Aquarium Management + Water Testing). Implementation order enforced via priority.
- [x] **AI-Enhanced**: ✅ Genkit flows in `src/ai/flows/` (analyze-test-strip, recommend-treatment-products, find-fish/plant/filter/lighting/tank). Exposed via Next.js API routes with graceful degradation (queue + retry + manual entry fallback).
- [x] **Type Safety**: ✅ TypeScript strict mode throughout. Zod schemas for all user inputs (aquarium forms, test entries, marketplace listings). Entity interfaces in `src/types/index.ts`. Drizzle ORM schema matches TypeScript types.
- [x] **Mobile-First**: ✅ Responsive design documented (1 col mobile, 2 col tablet, 3 col desktop). Shadcn UI components. Color system: safe (#10b981), warning (#f59e0b), critical (#ef4444). WCAG 2.1 AA compliance required.

### Violations (if any):
**None**. All constitution principles satisfied. Feature aligns with Next.js App Router conventions, cloud-native architecture, and mobile-first design requirements.

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

```
src/
├── app/                           # Next.js 15 App Router
│   ├── globals.css               # Global styles + Tailwind imports
│   ├── layout.tsx                # Root layout with auth provider
│   ├── page.tsx                  # Homepage
│   ├── aquariums/                # Aquarium management pages
│   │   ├── page.tsx              # List all aquariums
│   │   ├── [aquariumId]/         # Individual aquarium detail
│   │   │   └── page.tsx
│   │   └── new/                  # Create aquarium form
│   ├── water-tests/              # Water testing pages
│   │   ├── page.tsx              # Test history
│   │   └── analyze/              # Test strip analysis
│   ├── marketplace/              # Marketplace pages
│   ├── community/                # Q&A forum pages
│   ├── api/                      # API routes
│   │   ├── aquariums/            # CRUD endpoints
│   │   ├── water-tests/          # Test analysis + history
│   │   ├── treatments/           # Treatment recommendations
│   │   ├── maintenance/          # Reminder endpoints
│   │   └── ai/                   # AI flow proxies
│   └── auth/                     # Auth pages (signin, signup, reset)
│
├── components/                    # React components by feature
│   ├── aquariums/                # Aquarium-related components
│   │   ├── aquarium-form.tsx     # Create/edit form
│   │   ├── aquarium-card.tsx     # List item display
│   │   ├── livestock-manager.tsx # Add/edit fish/plants
│   │   └── equipment-manager.tsx # Add/edit equipment
│   ├── water-testing/            # Test strip components
│   │   ├── test-strip-upload.tsx # Camera/file upload
│   │   ├── parameter-badge.tsx   # Color-coded status
│   │   └── manual-entry-form.tsx # Fallback input
│   ├── history/                  # Trend visualization
│   │   ├── trend-chart.tsx       # Recharts wrapper
│   │   └── test-history-list.tsx # Chronological list
│   ├── treatments/               # Treatment recommendations
│   ├── reminders/                # Maintenance calendar
│   ├── marketplace/              # Marketplace components
│   ├── community/                # Q&A components
│   ├── shared/                   # Reusable components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── loading-spinner.tsx
│   └── ui/                       # Shadcn UI base components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       └── [12 other Shadcn components]
│
├── lib/                          # Server actions + utilities
│   ├── actions.ts                # Server actions (aquarium CRUD, etc.)
│   ├── db.ts                     # Drizzle ORM client + Neon connection
│   ├── auth.ts                   # Auth utilities (Supabase/NextAuth)
│   ├── storage.ts                # Image upload utilities
│   └── utils.ts                  # General utilities (cn, formatters)
│
├── ai/                           # Genkit AI flows
│   ├── genkit.ts                 # Genkit config + initialization
│   ├── dev.ts                    # Local dev server
│   └── flows/                    # Individual AI flows
│       ├── analyze-test-strip.ts
│       ├── recommend-treatment-products.ts
│       ├── find-fish-flow.ts
│       ├── find-plant-flow.ts
│       ├── find-filter-flow.ts
│       ├── find-lighting-flow.ts
│       └── find-tank-flow.ts
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # All entity interfaces
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx            # Mobile detection
│   └── use-toast.ts              # Toast notifications
│
└── db/                           # Database schema + migrations
    ├── schema.ts                 # Drizzle schema definitions
    └── migrations/               # SQL migration files

tests/
├── unit/                         # Unit tests (Jest)
│   ├── types/
│   ├── validations/
│   └── utils/
├── integration/                  # Integration tests
│   ├── aquarium-crud.test.ts
│   ├── water-testing.test.ts
│   └── ai/
└── e2e/                          # E2E tests (Playwright)
    ├── user-journey.spec.ts
    └── mvp-flow.spec.ts
```

**Structure Decision**: Next.js 15 App Router full-stack web application. All features implemented as server/client component mix with API routes for backend logic. Drizzle ORM for type-safe database access to Neon PostgreSQL. Genkit AI flows in dedicated `src/ai/` directory exposed via Next.js API proxies.

## Complexity Tracking

*No violations detected - section not applicable*

---

## Implementation Matrix

### Phase 0: Research (Complete ✅)
**Artifact**: `research.md` (360 lines)

**Key Decisions Validated**:
1. **Authentication & Storage**: Supabase (replaces Firebase) - aligns with Clarification Q1
2. **Database & ORM**: Neon PostgreSQL + Drizzle ORM with type-safe queries
3. **RLS Implementation**: PostgreSQL Row-Level Security with user_id foreign keys - aligns with Clarification Q2
4. **AI Failure Handling**: Queue+retry pattern with exponential backoff - aligns with Clarification Q4
5. **Data Retention**: Tiered retention policy (90d images, 1y messages) - aligns with Clarification Q5
6. **RBAC**: 4 roles (standard, verified_seller, moderator, admin) - aligns with Clarification Q1

**Status**: All decisions align with clarification session, no updates needed

### Phase 1: Design & Contracts (Complete ✅)
**Artifacts**:
- `data-model.md` (589 lines) - Entity schemas with Supabase Auth integration
- `contracts/` (5 API contract files):
  * `aquariums.yaml` - Aquarium management endpoints
  * `water-tests.yaml` - Water testing and AI analysis
  * `ai-flows.yaml` - Genkit AI flow specifications
  * `community.yaml` - Q&A forum endpoints
  * `marketplace.yaml` - Marketplace listings and messaging
- `quickstart.md` (565 lines) - Developer onboarding guide with Supabase setup

**Data Model Validation**:
- User entity managed by Supabase Auth with custom role field (RBAC)
- All 11 entities include user_id foreign keys for RLS enforcement
- WaterTest includes imageUrl with 90-day retention annotation
- Message entity has dual ownership RLS (sender_id OR recipient_id)
- Maintenance reminders include timezone support for scheduling

**Status**: All Phase 1 artifacts validated against clarifications, no updates needed

### Phase 2: Task Generation (Next Step)
**Command**: `/speckit.tasks`
**Output**: `tasks.md` with detailed task breakdown
**Input**: 8 user stories with 10-20 implementation checklist items each from spec.md

---

## Planning Complete

**Branch**: `001-aquarium-toolkit`
**Implementation Plan**: `/Users/zackhayes/webdev/aquadex/specs/001-aquarium-toolkit/plan.md`

**Generated Artifacts**:
- ✅ `spec.md` (600 lines) - Enhanced with clarifications, implementation checklists, retention policy
- ✅ `research.md` (360 lines) - Phase 0 technical decisions validated
- ✅ `data-model.md` (589 lines) - Phase 1 entity schemas validated
- ✅ `contracts/` (5 files) - API contract specifications validated
- ✅ `quickstart.md` (565 lines) - Developer onboarding guide validated
- ✅ `plan.md` (204 lines) - This implementation plan

**Constitution Compliance**: All 6 principles verified ✅
**Clarification Alignment**: All 5 decisions reflected in Phase 0-1 artifacts ✅

**Next Step**: Run `/speckit.tasks` to generate detailed task breakdown from implementation checklists

