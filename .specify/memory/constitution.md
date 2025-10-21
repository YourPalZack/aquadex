<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 0.0.0 → 1.0.0
Change Type: MAJOR - Initial constitution creation

Modified Principles:
  - N/A (Initial creation)

Added Sections:
  ✅ Core Principles (6 principles defined)
  ✅ Technical Stack Requirements
  ✅ Development Workflow & Quality Gates
  ✅ Governance

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section already in place
  ✅ spec-template.md - Aligned with user story prioritization requirements
  ✅ tasks-template.md - Aligned with independent testing requirements

Follow-up TODOs:
  - None

Rationale for MAJOR version:
  Initial constitution establishing all governance and technical principles
  for the AquaDex project.
=============================================================================
-->

# AquaDex Constitution

## Core Principles

### I. Component-First Architecture

All features MUST be built using modular, reusable React components following Next.js App Router conventions. Components MUST be:
- Self-contained with clear, single-responsibility purpose
- Independently testable through props and state management
- Documented with TypeScript interfaces for all props
- Organized in the `src/components/` directory by feature domain

**Rationale**: Ensures maintainability, reusability, and enables parallel development across the application while maintaining consistency in the UI layer.

### II. Cloud-Native & Browser-First

The application MUST be fully functional and testable in the browser without local service dependencies. This requires:
- Use of serverless cloud databases (Supabase PostgreSQL as primary database)
- Supabase services for authentication, storage, and real-time features
- All AI flows MUST be executable via API routes
- No localhost-only dependencies in production code paths
- Environment variables for all external service configurations

**Rationale**: Enables true cloud deployment, simplifies onboarding, and ensures the application is accessible and demonstrable without complex local setup.

### III. User Story Prioritization (NON-NEGOTIABLE)

Every feature specification MUST define user stories with explicit priorities (P1, P2, P3...) where:
- Each user story represents an independently testable and deployable value slice
- P1 stories form the Minimum Viable Product (MVP)
- Implementation MUST proceed in priority order
- Lower priority stories MUST NOT block higher priority deliverables

**Rationale**: Ensures focused delivery of core value, enables iterative development, and prevents scope creep from delaying essential functionality.

### IV. AI-Enhanced Development

AI features MUST be:
- Built using Genkit flows in `src/ai/flows/`
- Exposed through Next.js API routes for browser accessibility
- Documented with clear input/output contracts
- Tested with sample data before user integration
- Designed to gracefully handle API failures with fallback experiences

**Rationale**: Maintains consistency in AI integration, ensures testability, and provides reliable user experiences even when AI services are temporarily unavailable.

### V. Type Safety & Data Validation

TypeScript MUST be used throughout with strict mode enabled. All data boundaries require:
- Zod schemas for runtime validation of user inputs and API responses
- TypeScript interfaces in `src/types/` for all domain entities
- Form validation using React Hook Form with Zod resolvers
- Database schemas MUST match TypeScript types

**Rationale**: Prevents runtime errors, provides developer confidence, and ensures data integrity across all application layers.

### VI. Mobile-First Responsive Design

All UI components and pages MUST be:
- Designed mobile-first using Tailwind CSS
- Built with Shadcn UI components for consistency
- Tested on viewport sizes from 320px to 1920px
- Accessible (WCAG 2.1 AA compliant)
- Following the design system: primary (#45B6FE), background (#E0F7FA), accent (#4DB6AC)

**Rationale**: Ensures the application serves the majority mobile user base while providing excellent experiences across all devices and meeting accessibility standards.

## Technical Stack Requirements

### Mandatory Technologies

- **Framework**: Next.js 15+ with App Router (server and client components)
- **Language**: TypeScript 5+ with strict mode
- **Database**: Supabase PostgreSQL (serverless, cloud-hosted)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **AI/ML**: Genkit with Google AI integration
- **Styling**: Tailwind CSS + Shadcn UI components
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Prohibited Practices

- Local-only databases (SQLite, local PostgreSQL instances for production paths)
- Untyped JavaScript files in `src/` directory
- Direct DOM manipulation (use React patterns)
- Inline styles (use Tailwind utility classes)
- Hardcoded configuration values (use environment variables)

## Development Workflow & Quality Gates

### Feature Development Process

1. **Specification Phase**:
   - Create feature spec with prioritized user stories
   - Define acceptance criteria for each story
   - Identify required components and data models

2. **Planning Phase**:
   - Create implementation plan referencing constitution principles
   - Define database schema changes (Neon migrations)
   - Design API contracts and component interfaces

3. **Implementation Phase**:
   - Implement features in priority order (P1 first)
   - Each user story MUST be independently testable
   - Commit frequently with descriptive messages

4. **Testing Phase** (when explicitly requested):
   - Write component tests for complex logic
   - Test AI flows with sample data
   - Verify responsive design on multiple viewports

### Quality Gates

Before merging any feature branch:

- ✅ TypeScript compilation succeeds with no errors
- ✅ All forms include proper validation with user feedback
- ✅ Components are responsive (mobile, tablet, desktop)
- ✅ Environment variables documented in `.env.example`
- ✅ New AI flows tested with sample inputs/outputs
- ✅ Database schema changes include migration files
- ✅ P1 user stories are fully functional

### Code Organization Standards

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components by feature
├── ai/flows/              # Genkit AI workflows
├── lib/                   # Utilities and server actions
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## Governance

### Amendment Process

Constitution amendments require:
1. Documented rationale for the change
2. Impact assessment on existing features
3. Version bump following semantic versioning:
   - **MAJOR**: Breaking changes to principles or architecture
   - **MINOR**: New principles or expanded guidance
   - **PATCH**: Clarifications and wording improvements

### Versioning Policy

- Constitution version tracked in this file's footer
- Implementation plans MUST reference constitution version
- Breaking changes require migration guidance in `docs/`

### Compliance & Review

- Feature specifications MUST include constitution compliance check
- Implementation plans MUST document any principle violations with justification
- Regular reviews (quarterly) to ensure constitution alignment with project evolution

### Living Document

This constitution serves as the authoritative governance document for AquaDex. When conflicts arise between this constitution and other documentation, the constitution takes precedence. Refer to `docs/AgentKnowledge.md` for technical guidance and implementation patterns.

**Version**: 1.0.0 | **Ratified**: 2025-10-20 | **Last Amended**: 2025-10-20
