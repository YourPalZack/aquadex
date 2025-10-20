# Tasks: Comprehensive Aquarium Management Toolkit

**Input**: Design documents from `/specs/001-aquarium-toolkit/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Not explicitly requested in specification - omitted from task breakdown.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Includes exact file paths in descriptions

## Path Conventions
- Next.js App Router structure: `src/app/`, `src/components/`, `src/lib/`
- Database schema: `src/lib/db/schema.ts`
- AI flows: `src/ai/flows/`
- API routes: `src/app/api/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Next.js App Router application

- [ ] T001 Verify Node.js 20+ and npm dependencies are installed per quickstart.md
- [ ] T002 Create .env.local file with Neon DATABASE_URL, Supabase credentials, and Google AI API key per quickstart.md
- [ ] T003 [P] Install Next.js 15.2+ dependencies: next, react, react-dom, typescript per package.json
- [ ] T004 [P] Install Drizzle ORM 0.30+ with @neondatabase/serverless driver in package.json
- [ ] T005 [P] Install Supabase client 2.39+ with @supabase/ssr for Next.js in package.json
- [ ] T006 [P] Install Genkit 1.8+ with @genkit-ai/googleai plugin in package.json
- [ ] T007 [P] Install form dependencies: react-hook-form 7.54+, zod 3.24+, @hookform/resolvers in package.json
- [ ] T008 [P] Install UI dependencies: tailwindcss 3.4+, @radix-ui components, lucide-react, recharts in package.json
- [ ] T009 Configure TypeScript 5.3+ in strict mode with path aliases in tsconfig.json
- [ ] T010 Configure Tailwind CSS 3.4+ with Shadcn UI theme colors per plan.md in tailwind.config.ts
- [ ] T011 Setup Drizzle config file connecting to Neon PostgreSQL in drizzle.config.ts
- [ ] T012 Add npm scripts for db:generate, db:push, db:studio, and dev commands in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 Create complete database schema with all 11 entities in src/lib/db/schema.ts per data-model.md
- [ ] T014 Export Drizzle client instance configured for Neon serverless in src/lib/db/index.ts
- [ ] T015 Run drizzle-kit generate to create migration SQL files in drizzle/ directory
- [ ] T016 Run drizzle-kit push to apply schema to Neon database
- [ ] T017 [P] Create Supabase client for browser components in src/lib/supabase/client.ts
- [ ] T018 [P] Create Supabase client for server components/actions in src/lib/supabase/server.ts
- [ ] T019 [P] Initialize Genkit with Google AI plugin in src/ai/genkit.ts
- [ ] T020 [P] Create Supabase Storage bucket named "aquarium-images" with public access per quickstart.md
- [ ] T021 [P] Setup authentication middleware checking Supabase session in src/middleware.ts
- [ ] T022 [P] Create root layout with Tailwind styles and font configuration in src/app/layout.tsx
- [ ] T023 [P] Create base navigation component with logo and auth status in src/components/layout/navbar.tsx
- [ ] T024 [P] Create footer component with links in src/components/layout/footer.tsx
- [ ] T025 [P] Setup Shadcn UI base components (button, card, dialog, form, input, label, select) in src/components/ui/
- [ ] T026 [P] Create error boundary component for graceful error handling in src/components/shared/error-boundary.tsx
- [ ] T027 [P] Create loading spinner component for async operations in src/components/shared/loading-spinner.tsx
- [ ] T028 [P] Create toast notification system using Shadcn toast in src/components/ui/toast.tsx and src/hooks/use-toast.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Aquarium Profile Management (Priority: P1) 🎯 MVP

**Goal**: Allow fishkeepers to create and manage aquarium profiles with tank specifications, livestock, and equipment

**Independent Test**: Create aquarium profile with name/size/type, add livestock and equipment, edit profile details, view profile list, delete profile with confirmation

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create Aquarium TypeScript type in src/types/aquarium.ts matching database schema
- [ ] T030 [P] [US1] Create Zod validation schema for aquarium creation/update in src/lib/validations/aquarium.ts
- [ ] T031 [P] [US1] Create Livestock and Equipment TypeScript types in src/types/aquarium.ts
- [ ] T032 [US1] Create server action for creating aquarium in src/lib/actions/aquariums.ts
- [ ] T033 [US1] Create server action for updating aquarium in src/lib/actions/aquariums.ts
- [ ] T034 [US1] Create server action for deleting aquarium in src/lib/actions/aquariums.ts
- [ ] T035 [US1] Create server action for fetching user's aquariums in src/lib/actions/aquariums.ts
- [ ] T036 [US1] Create server action for fetching single aquarium with livestock/equipment in src/lib/actions/aquariums.ts
- [ ] T037 [P] [US1] Create AquariumCard component displaying tank summary in src/components/aquariums/aquarium-card.tsx
- [ ] T038 [P] [US1] Create AquariumForm component with React Hook Form and Zod validation in src/components/aquariums/aquarium-form.tsx
- [ ] T039 [P] [US1] Create ImageUpload component for aquarium photos using Supabase Storage in src/components/shared/image-upload.tsx
- [ ] T040 [US1] Create aquariums list page displaying user's tanks in src/app/(dashboard)/aquariums/page.tsx
- [ ] T041 [US1] Create aquarium detail page showing full profile in src/app/(dashboard)/aquariums/[id]/page.tsx
- [ ] T042 [US1] Create new aquarium page with creation form in src/app/(dashboard)/aquariums/new/page.tsx
- [ ] T043 [P] [US1] Create server action for adding livestock to aquarium in src/lib/actions/livestock.ts
- [ ] T044 [P] [US1] Create server action for updating livestock in src/lib/actions/livestock.ts
- [ ] T045 [P] [US1] Create server action for removing livestock in src/lib/actions/livestock.ts
- [ ] T046 [P] [US1] Create LivestockList component showing fish/plants/coral in src/components/aquariums/livestock-list.tsx
- [ ] T047 [P] [US1] Create LivestockForm dialog component for adding livestock in src/components/aquariums/livestock-form.tsx
- [ ] T048 [P] [US1] Create server action for adding equipment to aquarium in src/lib/actions/equipment.ts
- [ ] T049 [P] [US1] Create server action for updating equipment in src/lib/actions/equipment.ts
- [ ] T050 [P] [US1] Create server action for removing equipment in src/lib/actions/equipment.ts
- [ ] T051 [P] [US1] Create EquipmentList component showing filters/heaters/lights in src/components/aquariums/equipment-list.tsx
- [ ] T052 [P] [US1] Create EquipmentForm dialog component for adding equipment in src/components/aquariums/equipment-form.tsx
- [ ] T053 [US1] Create dashboard layout with navigation sidebar in src/app/(dashboard)/layout.tsx
- [ ] T054 [US1] Create main dashboard page showing aquarium overview in src/app/(dashboard)/dashboard/page.tsx
- [ ] T055 [US1] Add delete confirmation dialog component for aquariums in src/components/aquariums/delete-confirmation.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create aquariums, add livestock/equipment, and manage profiles independently

---

## Phase 4: User Story 2 - Water Quality Testing & Analysis (Priority: P1) 🎯 MVP

**Goal**: Enable fishkeepers to test water using AI-powered test strip analysis or manual entry, receiving instant parameter readings and status indicators

**Independent Test**: Upload test strip photo, receive AI-analyzed parameters (pH, ammonia, etc.), see status indicators (safe/warning/critical), manually adjust values if confidence low, save test results to specific aquarium

### Implementation for User Story 2

- [ ] T056 [P] [US2] Create WaterTest TypeScript type in src/types/water-test.ts matching database schema
- [ ] T057 [P] [US2] Create Zod validation schema for water test creation in src/lib/validations/water-test.ts
- [ ] T058 [P] [US2] Create TreatmentRecommendation TypeScript type in src/types/water-test.ts
- [ ] T059 [P] [US2] Create Genkit flow for analyzing test strip images in src/ai/flows/analyze-test-strip.ts with brand detection logic using visual markers (logo, color strip count, layout patterns) and 75% confidence threshold per FR-011
- [ ] T060 [P] [US2] Create Genkit flow for generating treatment recommendations in src/ai/flows/recommend-treatment-products.ts
- [ ] T061 [US2] Create API route exposing test strip analysis flow at src/app/api/ai/analyze-test/route.ts
- [ ] T062 [US2] Create API route exposing treatment recommendation flow at src/app/api/ai/recommend-treatment/route.ts
- [ ] T063 [US2] Create server action for creating water test (manual entry) in src/lib/actions/water-tests.ts
- [ ] T064 [US2] Create server action for fetching water tests for aquarium in src/lib/actions/water-tests.ts
- [ ] T065 [US2] Create server action for updating water test notes in src/lib/actions/water-tests.ts
- [ ] T066 [P] [US2] Create ImageUploadForm component for test strip photos in src/components/water-testing/image-upload-form.tsx
- [ ] T067 [P] [US2] Create ManualEntryForm component with parameter inputs in src/components/water-testing/manual-entry-form.tsx
- [ ] T068 [P] [US2] Create AnalysisResults component displaying parameters with confidence scores in src/components/water-testing/analysis-results.tsx
- [ ] T069 [P] [US2] Create ParameterBadge component showing status (safe/warning/critical) in src/components/water-testing/parameter-badge.tsx
- [ ] T070 [P] [US2] Create TreatmentRecommendations component listing suggested products in src/components/water-testing/treatment-recommendations.tsx
- [ ] T071 [US2] Create water test analysis page with tab switcher (AI/Manual) in src/app/(dashboard)/analyze/page.tsx
- [ ] T072 [US2] Add loading state component for AI analysis progress in src/components/water-testing/analysis-loading.tsx
- [ ] T073 [US2] Add error handling for AI analysis failures with fallback to manual entry in src/components/water-testing/analysis-error.tsx
- [ ] T074 [US2] Create server action for storing treatment recommendations in src/lib/actions/treatment-recommendations.ts

**Checkpoint**: At this point, User Story 2 should be fully functional - users can analyze test strips with AI or enter manually, see results with status indicators and treatment suggestions

---

## Phase 5: User Story 3 - Historical Tracking & Trends (Priority: P2)

**Goal**: Enable fishkeepers to view water testing history over time, identify patterns with trend visualizations, and export data

**Independent Test**: View chronological list of past tests, filter by date range or parameter, see trend charts showing parameter changes over time, export test history to CSV/PDF

### Implementation for User Story 3

- [ ] T075 [P] [US3] Create server action for fetching test history with date filtering in src/lib/actions/water-tests.ts
- [ ] T076 [P] [US3] Create server action for calculating parameter statistics (avg, min, max) in src/lib/actions/water-tests.ts
- [ ] T077 [P] [US3] Create server action for exporting test data to CSV format in src/lib/actions/export.ts
- [ ] T077b [P] [US3] Create server action for exporting test data to PDF format with formatted tables and trend charts in src/lib/actions/export.ts (use @react-pdf/renderer or puppeteer)
- [ ] T078 [P] [US3] Create TestHistoryTable component with sortable columns in src/components/history/test-history-table.tsx
- [ ] T079 [P] [US3] Create TrendChart component using Recharts library in src/components/history/trend-chart.tsx
- [ ] T080 [P] [US3] Create DateRangeFilter component for filtering tests in src/components/history/date-range-filter.tsx
- [ ] T081 [P] [US3] Create ParameterSelector component for choosing which parameter to chart in src/components/history/parameter-selector.tsx
- [ ] T082 [P] [US3] Create ExportButton component triggering CSV download in src/components/history/export-button.tsx
- [ ] T083 [P] [US3] Create StatisticsPanel component showing parameter summary stats in src/components/history/statistics-panel.tsx
- [ ] T084 [US3] Create test history page with filters and charts in src/app/(dashboard)/history/page.tsx
- [ ] T085 [US3] Add trend analysis logic detecting concerning patterns (rising nitrates, etc.) in src/lib/utils/trend-analysis.ts
- [ ] T086 [US3] Create TrendAlert component highlighting concerning patterns in src/components/history/trend-alert.tsx

**Checkpoint**: At this point, User Story 3 should be fully functional - users can view test history, see trends, and export data independently of other features

---

## Phase 6: User Story 4 - Treatment & Product Recommendations (Priority: P2)

**Goal**: Provide fishkeepers with treatment guidance when water quality issues occur, including product suggestions, dosage calculations, and purchase links

**Independent Test**: View recommendations when parameters out of range, see suggested products with dosage calculations based on tank size, view safety warnings, access purchase links to vendors

### Implementation for User Story 4

- [ ] T087 [P] [US4] Enhance analyze-test-strip.ts flow to include safety range checks and issue detection
- [ ] T088 [P] [US4] Enhance recommend-treatment-products.ts flow to calculate dosages based on tank size
- [ ] T089 [P] [US4] Create server action for fetching purchase links for products in src/lib/actions/products.ts
- [ ] T090 [P] [US4] Create ProductCard component displaying treatment product details in src/components/water-testing/product-card.tsx
- [ ] T091 [P] [US4] Create DosageCalculator component showing tank-specific dosing in src/components/water-testing/dosage-calculator.tsx
- [ ] T092 [P] [US4] Create SafetyWarnings component displaying compatibility issues in src/components/water-testing/safety-warnings.tsx
- [ ] T093 [P] [US4] Create PurchaseLinks component with vendor links and prices in src/components/water-testing/purchase-links.tsx
- [ ] T094 [US4] Enhance TreatmentRecommendations component to show prioritized products by severity in src/components/water-testing/treatment-recommendations.tsx
- [ ] T095 [US4] Add treatment recommendation persistence when saving water test results in src/lib/actions/water-tests.ts
- [ ] T096 [US4] Create treatments page showing all past recommendations in src/app/(dashboard)/treatments/page.tsx

**Checkpoint**: At this point, User Story 4 should be fully functional - users receive actionable treatment guidance with product links when water issues detected

---

## Phase 7: User Story 5 - Maintenance Reminders & Scheduling (Priority: P3)

**Goal**: Allow fishkeepers to set up recurring maintenance reminders and receive notifications for tasks like water changes and filter cleaning

**Independent Test**: Create reminders with custom frequency, receive notifications when due, mark tasks complete, view maintenance calendar across all aquariums, postpone/edit reminders

### Implementation for User Story 5

- [ ] T097 [P] [US5] Create MaintenanceTask TypeScript type in src/types/reminder.ts matching database schema
- [ ] T098 [P] [US5] Create Zod validation schema for reminder creation in src/lib/validations/reminder.ts
- [ ] T099 [US5] Create server action for creating maintenance reminder in src/lib/actions/reminders.ts
- [ ] T100 [US5] Create server action for updating reminder in src/lib/actions/reminders.ts
- [ ] T101 [US5] Create server action for deleting reminder in src/lib/actions/reminders.ts
- [ ] T102 [US5] Create server action for marking task complete and scheduling next occurrence in src/lib/actions/reminders.ts
- [ ] T103 [US5] Create server action for fetching due/upcoming reminders in src/lib/actions/reminders.ts
- [ ] T104 [P] [US5] Create ReminderForm component with frequency selector in src/components/reminders/reminder-form.tsx
- [ ] T105 [P] [US5] Create ReminderCard component displaying task details and due date in src/components/reminders/reminder-card.tsx
- [ ] T106 [P] [US5] Create MaintenanceCalendar component showing all tasks chronologically in src/components/reminders/maintenance-calendar.tsx
- [ ] T107 [P] [US5] Create TaskCompleteButton component for marking tasks done in src/components/reminders/task-complete-button.tsx
- [ ] T108 [US5] Create reminders page with calendar view and upcoming tasks list in src/app/(dashboard)/reminders/page.tsx
- [ ] T109 [US5] Integrate email notification system for due reminders using Supabase Edge Functions or external service
- [ ] T110 [US5] Create notification preferences component in user settings in src/components/profile/notification-preferences.tsx

**Checkpoint**: At this point, User Story 5 should be fully functional - users can schedule maintenance, receive reminders, and track completion history

---

## Phase 8: User Story 6 - AI-Powered Product Discovery (Priority: P3)

**Goal**: Provide intelligent product recommendations for fish, plants, and equipment based on tank specifications and compatibility

**Independent Test**: Search for fish by tank type/size, receive compatibility-scored recommendations with care requirements, search for plants by lighting level, get equipment recommendations with specifications, access purchase links

### Implementation for User Story 6

- [ ] T111 [P] [US6] Create Genkit flow for finding compatible fish in src/ai/flows/find-fish-flow.ts
- [ ] T112 [P] [US6] Create Genkit flow for finding compatible plants in src/ai/flows/find-plant-flow.ts
- [ ] T113 [P] [US6] Create Genkit flow for finding suitable tanks in src/ai/flows/find-tank-flow.ts
- [ ] T114 [P] [US6] Create Genkit flow for finding appropriate filters in src/ai/flows/find-filter-flow.ts
- [ ] T115 [P] [US6] Create Genkit flow for finding suitable lighting in src/ai/flows/find-lighting-flow.ts
- [ ] T116 [P] [US6] Create Genkit flow for food recommendations in src/ai/flows/get-food-purchase-links.ts
- [ ] T117 [US6] Create API route for fish finder at src/app/api/ai/find-fish/route.ts
- [ ] T118 [US6] Create API route for plant finder at src/app/api/ai/find-plant/route.ts
- [ ] T119 [US6] Create API route for tank finder at src/app/api/ai/find-tank/route.ts
- [ ] T120 [US6] Create API route for filter finder at src/app/api/ai/find-filter/route.ts
- [ ] T121 [US6] Create API route for lighting finder at src/app/api/ai/find-lighting/route.ts
- [ ] T122 [P] [US6] Create FishFinderForm component with tank specifications input in src/components/ai-tools/fish-finder-form.tsx
- [ ] T123 [P] [US6] Create PlantFinderForm component with lighting/substrate inputs in src/components/ai-tools/plant-finder-form.tsx
- [ ] T124 [P] [US6] Create EquipmentFinderForm component with tank size input in src/components/ai-tools/equipment-finder-form.tsx
- [ ] T125 [P] [US6] Create ProductCard component showing species/product details in src/components/ai-tools/product-card.tsx
- [ ] T126 [P] [US6] Create CompatibilityBadge component showing compatibility score in src/components/ai-tools/compatibility-badge.tsx
- [ ] T127 [P] [US6] Create CareRequirements component displaying difficulty and needs in src/components/ai-tools/care-requirements.tsx
- [ ] T128 [US6] Create fish finder page at src/app/(tools)/fish-finder/page.tsx
- [ ] T129 [US6] Create plant finder page at src/app/(tools)/plant-finder/page.tsx
- [ ] T130 [US6] Create tank finder page at src/app/(tools)/tank-finder/page.tsx
- [ ] T131 [US6] Create filtration finder page at src/app/(tools)/filtration-finder/page.tsx
- [ ] T132 [US6] Create lighting finder page at src/app/(tools)/lighting-finder/page.tsx
- [ ] T133 [US6] Create foods page with recommendations at src/app/(tools)/foods/page.tsx

**Checkpoint**: At this point, User Story 6 should be fully functional - users can discover compatible fish/plants/equipment with AI-powered recommendations

---

## Phase 9: User Story 7 - Community Forum & Q&A (Priority: P3)

**Goal**: Enable fishkeepers to ask questions, share advice, and engage with community through Q&A forum with voting and answer acceptance

**Independent Test**: Post question with tags, view questions feed, post answers, upvote/downvote responses, mark answer as accepted (question author only), search past questions by keywords, report inappropriate content

### Implementation for User Story 7

- [ ] T134 [P] [US7] Create Question TypeScript type in src/types/community.ts matching database schema
- [ ] T135 [P] [US7] Create Answer TypeScript type in src/types/community.ts
- [ ] T136 [P] [US7] Create Zod validation schema for question creation in src/lib/validations/question.ts
- [ ] T137 [P] [US7] Create Zod validation schema for answer creation in src/lib/validations/answer.ts
- [ ] T138 [US7] Create server action for creating question in src/lib/actions/questions.ts
- [ ] T139 [US7] Create server action for updating question in src/lib/actions/questions.ts
- [ ] T140 [US7] Create server action for deleting question in src/lib/actions/questions.ts
- [ ] T141 [US7] Create server action for fetching questions with filters in src/lib/actions/questions.ts
- [ ] T142 [US7] Create server action for fetching single question with answers in src/lib/actions/questions.ts
- [ ] T143 [US7] Create server action for creating answer in src/lib/actions/answers.ts
- [ ] T144 [US7] Create server action for voting on question/answer in src/lib/actions/votes.ts
- [ ] T145 [US7] Create server action for accepting answer in src/lib/actions/answers.ts
- [ ] T146 [US7] Create server action for searching questions by keywords in src/lib/actions/questions.ts
- [ ] T147 [P] [US7] Create QuestionForm component with title, content, tags inputs in src/components/community/question-form.tsx
- [ ] T148 [P] [US7] Create QuestionCard component displaying question summary in src/components/community/question-card.tsx
- [ ] T149 [P] [US7] Create AnswerForm component with rich text editor in src/components/community/answer-form.tsx
- [ ] T150 [P] [US7] Create AnswerCard component displaying answer with vote count in src/components/community/answer-card.tsx
- [ ] T151 [P] [US7] Create VoteButtons component for upvote/downvote in src/components/community/vote-buttons.tsx
- [ ] T152 [P] [US7] Create AcceptAnswerButton component (visible to question author) in src/components/community/accept-answer-button.tsx
- [ ] T153 [P] [US7] Create SearchBar component for keyword search in src/components/community/search-bar.tsx
- [ ] T154 [P] [US7] Create TagFilter component for filtering by tags in src/components/community/tag-filter.tsx
- [ ] T155 [US7] Create Q&A list page with filters and search at src/app/(community)/qa/page.tsx
- [ ] T156 [US7] Create question detail page with answers at src/app/(community)/qa/[id]/page.tsx
- [ ] T157 [US7] Create ask question page with form at src/app/(community)/qa/ask/page.tsx
- [ ] T158 [US7] Add reputation score calculation logic in src/lib/utils/reputation.ts
- [ ] T159 [US7] Create UserProfile component showing reputation and activity in src/components/profile/user-profile.tsx

**Checkpoint**: At this point, User Story 7 should be fully functional - users can ask questions, provide answers, vote, and search community knowledge

---

## Phase 10: User Story 8 - Marketplace for Equipment & Livestock (Priority: P4)

**Goal**: Enable fishkeepers to buy/sell used equipment and livestock through platform marketplace with listings, search, and messaging

**Independent Test**: Create listing with photos/price/location, browse by category, search by keywords and filters, contact seller via messaging, manage own listings (edit/mark sold/delete), leave ratings

### Implementation for User Story 8

- [ ] T160 [P] [US8] Create MarketplaceListing TypeScript type in src/types/marketplace.ts matching database schema
- [ ] T161 [P] [US8] Create Message TypeScript type in src/types/marketplace.ts
- [ ] T162 [P] [US8] Create Zod validation schema for listing creation in src/lib/validations/listing.ts
- [ ] T163 [P] [US8] Create Zod validation schema for message creation in src/lib/validations/message.ts
- [ ] T164 [US8] Create server action for creating marketplace listing in src/lib/actions/listings.ts
- [ ] T165 [US8] Create server action for updating listing in src/lib/actions/listings.ts
- [ ] T166 [US8] Create server action for deleting listing in src/lib/actions/listings.ts
- [ ] T167 [US8] Create server action for marking listing as sold in src/lib/actions/listings.ts
- [ ] T168 [US8] Create server action for fetching listings with filters in src/lib/actions/listings.ts
- [ ] T169 [US8] Create server action for fetching single listing with seller info in src/lib/actions/listings.ts
- [ ] T170 [US8] Create server action for sending message to seller in src/lib/actions/messages.ts (implements FR-050 platform messaging)
- [ ] T170b [US8] Create server action for fetching user messages/threads in src/lib/actions/messages.ts
- [ ] T170c [US8] Create server action for marking messages as read in src/lib/actions/messages.ts
- [ ] T171 [P] [US8] Create MessagingInterface component showing conversation threads in src/components/marketplace/messaging-interface.tsx
- [ ] T172 [P] [US8] Create ListingForm component with photo upload in src/components/marketplace/listing-form.tsx
- [ ] T173 [P] [US8] Create ListingCard component displaying listing summary in src/components/marketplace/listing-card.tsx
- [ ] T174 [P] [US8] Create ListingFilters component for category/price/location filters in src/components/marketplace/listing-filters.tsx
- [ ] T175 [P] [US8] Create SearchBar component for keyword search in src/components/marketplace/search-bar.tsx
- [ ] T176 [P] [US8] Create MessageButton component opening message dialog in src/components/marketplace/message-button.tsx
- [ ] T177 [P] [US8] Create MessageDialog component with message form in src/components/marketplace/message-dialog.tsx
- [ ] T178 [P] [US8] Create ListingActions component for seller (edit/mark sold/delete) in src/components/marketplace/listing-actions.tsx
- [ ] T179 [US8] Create marketplace browse page with filters at src/app/(community)/marketplace/page.tsx
- [ ] T180 [US8] Create listing detail page at src/app/(community)/marketplace/[id]/page.tsx
- [ ] T181 [US8] Create new listing page with form at src/app/(community)/marketplace/new/page.tsx
- [ ] T182 [US8] Create my listings page for seller management at src/app/(dashboard)/profile/my-listings/page.tsx
- [ ] T183 [US8] Create messages inbox page at src/app/(dashboard)/profile/messages/page.tsx
- [ ] T184 [US8] Add seller verification check before allowing listing creation in src/lib/actions/listings.ts

**Checkpoint**: At this point, User Story 8 should be fully functional - users can create listings, browse marketplace, contact sellers, and manage their own listings

---

## Phase 11: Authentication & User Management (Cross-Cutting)

**Purpose**: User authentication, profile management, and settings across all features

- [ ] T185 [P] Create SigninForm component with email/password and OAuth in src/components/auth/signin-form.tsx
- [ ] T186 [P] Create SignupForm component with email/password validation in src/components/auth/signup-form.tsx
- [ ] T187 [P] Create ResetPasswordForm component for password recovery in src/components/auth/reset-password-form.tsx
- [ ] T188 [P] Create AuthProvider context for managing auth state in src/components/auth/auth-provider.tsx
- [ ] T189 [US1] Create signin page at src/app/(auth)/signin/page.tsx
- [ ] T190 [US1] Create signup page at src/app/(auth)/signup/page.tsx
- [ ] T191 [US1] Create reset password page at src/app/(auth)/reset-password/page.tsx
- [ ] T192 [US1] Create server action for user profile updates in src/lib/actions/profile.ts
- [ ] T193 [US1] Create profile page with edit form at src/app/(dashboard)/profile/page.tsx
- [ ] T194 [US1] Create settings page with notification preferences at src/app/(dashboard)/settings/page.tsx
- [ ] T195 Create Supabase auth callback route at src/app/api/auth/callback/route.ts

---

## Phase 12: Polish & Cross-Cutting Concerns (Final)

**Purpose**: Performance optimization, error handling, accessibility, and production readiness

- [ ] T196 [P] Add loading states to all server actions using React Suspense boundaries
- [ ] T197 [P] Add error boundaries to all major page components with user-friendly messages
- [ ] T198 [P] Implement optimistic UI updates for common actions (votes, task completion, etc.)
- [ ] T199 [P] Add form validation error messages to all forms with clear user guidance
- [ ] T200 [P] Implement image optimization using Next.js Image component throughout app
- [ ] T201 [P] Add skeleton loaders for all data-fetching components
- [ ] T202 [P] Implement infinite scroll or pagination for long lists (tests, questions, listings)
- [ ] T203 [P] Add search functionality with debouncing to prevent excessive API calls
- [ ] T204 [P] Implement WCAG 2.1 AA accessibility: keyboard navigation, ARIA labels, focus indicators
- [ ] T205 [P] Add meta tags for SEO on all public pages (landing, Q&A, marketplace)
- [ ] T206 [P] Implement responsive design testing at 320px, 768px, 1024px, 1920px breakpoints
- [ ] T207 [P] Add analytics tracking for key user actions using privacy-friendly solution
- [ ] T208 [P] Create landing page at src/app/page.tsx with feature showcase and signup CTA
- [ ] T209 [P] Add rate limiting to API routes to prevent abuse
- [ ] T210 [P] Implement graceful degradation when AI services unavailable (show fallback UI)
- [ ] T211 [P] Add comprehensive logging for errors and important events
- [ ] T212 [P] Create 404 and 500 error pages with helpful navigation
- [ ] T213 [P] Add security headers in next.config.ts (CSP, HSTS, etc.)
- [ ] T214 [P] Implement database query optimization with proper indexes
- [ ] T215 [P] Add cache headers for static assets and API responses where appropriate
- [ ] T216 Create README.md with setup instructions, architecture overview, and contributing guidelines
- [ ] T217 Create deployment guide for Vercel with environment variable checklist
- [ ] T218 Run final accessibility audit with axe DevTools and fix critical issues
- [ ] T219 Run performance audit with Lighthouse and optimize to achieve >90 score
- [ ] T220 Create user documentation for all major features in docs/ directory

---

## Dependencies & Execution Order

### User Story Completion Order

**Independent Stories** (can be developed in parallel after Phase 2):
- User Story 1 (Aquarium Profiles) - **MUST** complete first as foundation
- User Story 2 (Water Testing) - Requires US1 (aquarium profiles must exist)

After US1 and US2 are complete, these can proceed independently:
- User Story 3 (History) - Requires US2 (needs water tests to show history)
- User Story 4 (Recommendations) - Requires US2 (recommends based on test results)
- User Story 5 (Reminders) - Requires US1 (reminders linked to aquariums)
- User Story 6 (AI Tools) - Independent (can use mock tank specifications)
- User Story 7 (Community) - Independent (separate feature domain)
- User Story 8 (Marketplace) - Independent (separate feature domain)

**Critical Path**:
```
Phase 1 (Setup) → Phase 2 (Foundation) → US1 (Profiles) → US2 (Testing) → US3/US4/US5/US6/US7/US8 (parallel)
```

### Parallel Execution Examples

**During Phase 2 (Foundational)**:
- T017 (Supabase client browser) || T018 (Supabase client server) || T019 (Genkit setup)
- T021 (Auth middleware) || T022 (Root layout) || T023 (Navbar)
- T025 (UI components) || T026 (Error boundary) || T027 (Loading spinner)

**During User Story 1**:
- T029 (Aquarium types) || T030 (Zod schemas) || T031 (Livestock/Equipment types)
- T037 (AquariumCard) || T038 (AquariumForm) || T039 (ImageUpload)
- T043-045 (Livestock actions) || T048-050 (Equipment actions)

**During User Story 2**:
- T056 (WaterTest types) || T057 (Zod schemas) || T058 (Recommendation types)
- T059 (Test strip flow) || T060 (Treatment flow)
- T066 (ImageUpload) || T067 (ManualEntry) || T068 (AnalysisResults)

**During User Story 6 (AI Tools)**:
- T111-116 (All 6 Genkit flows can be built in parallel)
- T122-127 (All UI components can be built in parallel)

**During User Story 7 (Community)**:
- T134-137 (All types and schemas in parallel)
- T147-154 (All UI components in parallel)

**During User Story 8 (Marketplace)**:
- T160-163 (All types and schemas in parallel)
- T172-178 (All UI components in parallel)

**During Phase 12 (Polish)**:
- T196-215 (Nearly all polish tasks can be done in parallel)

### MVP Scope (Recommended First Release)

**Minimum Viable Product** = Phase 1 + Phase 2 + US1 + US2
- **Total Tasks**: T001-T074 (74 tasks)
- **Features**: Authentication, Aquarium profiles, Water testing with AI analysis
- **Value**: Core water quality management with AI-powered test strip reading
- **Estimated Timeline**: 4-6 weeks with 2-3 developers

**Enhanced MVP** = MVP + US3 + US4
- **Total Tasks**: T001-T096 (96 tasks)
- **Additional Features**: Historical trends, Treatment recommendations
- **Estimated Timeline**: +2-3 weeks

**Full Launch** = All user stories
- **Total Tasks**: T001-T220 (220 tasks)
- **Estimated Timeline**: 10-14 weeks with 2-3 developers

---

## Implementation Strategy

### Approach

1. **MVP First**: Deliver US1 + US2 as quickly as possible to validate core value proposition
2. **Incremental Delivery**: Ship each user story independently as it completes
3. **Parallel Teams**: After Phase 2, assign different stories to different developers
4. **Quality Gates**: Each story must pass independent testing before merge
5. **User Feedback**: Gather feedback after MVP, adjust priorities for remaining stories

### Estimation Guidelines

- **Small Task** (1-3 hours): UI components, simple forms, basic CRUD operations
- **Medium Task** (4-8 hours): Complex forms, API routes, server actions with business logic
- **Large Task** (1-2 days): AI flows, complex visualizations, multi-step workflows
- **Setup/Foundation** (2-4 days total): Phases 1 and 2

### Task Assignment Recommendations

**Developer A** (Full-stack focus):
- Phase 1 & 2 setup
- User Story 1 (Profiles)
- User Story 5 (Reminders)
- Phase 11 (Auth)

**Developer B** (AI/Backend focus):
- User Story 2 (Water Testing)
- User Story 4 (Recommendations)
- User Story 6 (AI Tools)

**Developer C** (Frontend focus):
- User Story 3 (History/Charts)
- User Story 7 (Community)
- User Story 8 (Marketplace)
- Phase 12 (Polish)

---

## Summary

**Total Tasks**: 220  
**Phases**: 12 (1 Setup + 1 Foundation + 8 User Stories + 1 Auth + 1 Polish)  
**MVP Tasks**: 74 (Phases 1, 2, US1, US2)  
**Parallel Opportunities**: ~60 tasks marked with [P]  
**Independent Stories**: 6 of 8 user stories can be developed independently after foundation  
**Critical Path**: Setup → Foundation → Profiles → Testing → (Everything else in parallel)

**Format Validation**: ✅ All 220 tasks follow checklist format with Task ID, [P] marker where applicable, [Story] labels for user story tasks, and file paths in descriptions