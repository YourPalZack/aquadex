# Feature Specification: Comprehensive Aquarium Management Toolkit

**Feature Branch**: `001-aquarium-toolkit`  
**Created**: 2025-10-20  
**Status**: Draft  
**Input**: User description: "The primary goal of AquaDex is to provide aquarium enthusiasts with a comprehensive toolkit for managing their aquariums effectively. This includes features for water analysis, tracking, AI-powered insights, and community engagement."

## Clarifications

### Session 2025-10-20

- Q: When a user performs actions across multiple features (e.g., creates aquarium → logs water test → receives marketplace recommendations), how should their identity and preferences be managed? → A: Single session token with role-based access control (RBAC) - user roles: standard, verified_seller, moderator, admin (Note: Migrate away from Firebase to cost-effective alternative like Supabase Auth or NextAuth.js with Neon PostgreSQL session storage)
- Q: How should data ownership and access be enforced when one feature needs data created in another (e.g., treatment recommendations accessing aquarium size)? → A: Row-level security (RLS) with user_id foreign keys on all tables - PostgreSQL policies enforce ownership
- Q: What level of checklist detail should be added to each user story for comprehensive implementation guidance? → A: Detailed checklists with setup, development, testing, and deployment steps for each user story (10-15 items covering database setup, API endpoints, UI components, integration tests, deployment verification)
- Q: When Genkit AI services fail or timeout, how should the system handle user requests for test strip analysis and product recommendations? → A: Queue requests with automatic retry (max 3 attempts, exponential backoff) + immediately show manual entry option
- Q: What data retention strategy should be implemented for sensitive data like test strip photos, messages, or inactive accounts? → A: Tiered retention: Test strip images (90 days), messages (1 year), core data (aquarium profiles, test results, indefinite) + user export/delete controls in account settings

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aquarium Profile Management (Priority: P1)

A fishkeeper wants to create and manage profiles for their aquariums, tracking basic tank information, inhabitants, and equipment to have a centralized place for all aquarium data.

**Why this priority**: This is the foundational capability that enables all other features. Users cannot track water quality, schedule maintenance, or receive insights without first having aquarium profiles in the system.

**Independent Test**: Can be fully tested by creating an aquarium profile with tank specifications, viewing the profile details, editing information, and deleting a profile. Delivers immediate value by providing a digital inventory of the user's aquariums.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to create a new aquarium, **Then** they can enter tank name, size, type, setup date, and save the profile
2. **Given** a user with existing aquariums, **When** they view their aquarium list, **Then** they see all their tanks with key information displayed
3. **Given** an aquarium profile, **When** the user adds fish or equipment details, **Then** this information is saved and displayed in the profile
4. **Given** an aquarium profile, **When** the user edits any details, **Then** the changes are saved and reflected immediately
5. **Given** an aquarium profile, **When** the user deletes it, **Then** the profile and associated data are removed with confirmation

**Implementation Checklist**:

- [ ] **Setup**: Create database tables (users, aquariums, livestock, equipment) with user_id foreign keys and RLS policies
- [ ] **Setup**: Configure authentication middleware for session token validation and RBAC role checking
- [ ] **Setup**: Set up image storage bucket with appropriate access policies for aquarium photos
- [ ] **Development**: Implement aquarium CRUD API endpoints (/api/aquariums - POST, GET, PUT, DELETE) with user ownership validation
- [ ] **Development**: Build aquarium creation form component with validation (Zod schema for name, size, type, date)
- [ ] **Development**: Build aquarium list view with responsive grid layout and summary cards
- [ ] **Development**: Build aquarium detail view with tabs for info, livestock, equipment, photos
- [ ] **Development**: Implement livestock management UI (add/edit/delete fish, plants, invertebrates)
- [ ] **Development**: Implement equipment management UI (add/edit/delete filters, heaters, lights)
- [ ] **Development**: Add image upload component with preview and validation (max 5MB, EXIF stripping)
- [ ] **Testing**: Unit tests for aquarium validation schemas and data models
- [ ] **Testing**: Integration tests for aquarium CRUD operations with RLS enforcement
- [ ] **Testing**: E2E tests for complete user journey (signup → create aquarium → add livestock → edit → delete)
- [ ] **Testing**: Accessibility testing for keyboard navigation and screen reader support (WCAG 2.1 AA)
- [ ] **Deployment**: Verify RLS policies prevent cross-user data access in production
- [ ] **Deployment**: Confirm image uploads work with production storage bucket and URLs resolve correctly

---

### User Story 2 - Water Quality Testing & Analysis (Priority: P1)

A fishkeeper needs to test their aquarium water regularly and wants to quickly analyze test strip results using their phone camera, receiving instant digital readings and understanding whether parameters are safe.

**Why this priority**: Water quality is the most critical aspect of fishkeeping and directly impacts fish health. This is a core value proposition that differentiates the application and addresses a major pain point (manual color matching on test strips).

**Independent Test**: Can be fully tested by uploading or capturing a test strip photo, receiving AI-analyzed parameter readings (pH, ammonia, nitrite, nitrate), viewing parameter interpretations (safe/warning/danger), and storing the results. Delivers immediate value by eliminating manual color matching and providing instant feedback.

**Acceptance Scenarios**:

1. **Given** a user with an aquarium profile, **When** they capture or upload a test strip photo, **Then** the system analyzes the image and extracts water parameter values
2. **Given** analyzed test results, **When** displayed to the user, **Then** each parameter shows the numeric value, unit, and status indicator (safe/warning/critical)
3. **Given** critical parameter readings, **When** displayed, **Then** the user sees clear warnings about which parameters are dangerous and why
4. **Given** test strip analysis with low confidence, **When** results are displayed, **Then** the user is notified of potential inaccuracy and can manually adjust values
5. **Given** completed test analysis, **When** the user saves results, **Then** they are associated with the specific aquarium and timestamped

**Implementation Checklist**:

- [ ] **Setup**: Create water_tests table with aquarium_id foreign key, parameter columns, and RLS policies
- [ ] **Setup**: Configure Genkit AI flow for test strip image analysis with brand detection
- [ ] **Setup**: Set up image storage bucket for test strip photos with automatic cleanup policies
- [ ] **Setup**: Configure test strip brand database (API, Tetra, Seachem) with color scale mappings
- [ ] **Development**: Implement test strip upload/capture UI component with camera access and file validation
- [ ] **Development**: Build AI analysis API endpoint (/api/water-tests/analyze) with 15-second timeout
- [ ] **Development**: Create results display component with color-coded badges (#10b981 green, #f59e0b amber, #ef4444 red)
- [ ] **Development**: Implement manual adjustment UI for low-confidence results (<75% threshold)
- [ ] **Development**: Build parameter explanation tooltips with actionable guidance for warnings/critical
- [ ] **Development**: Add manual test entry form as fallback when AI unavailable
- [ ] **Testing**: Unit tests for parameter status calculation (safe/warning/critical thresholds)
- [ ] **Testing**: Integration tests for AI analysis flow with mock test strip images (3+ brands)
- [ ] **Testing**: Test confidence threshold logic (<75% triggers manual adjustment UI)
- [ ] **Testing**: Verify 85% of analyses complete within 10 seconds (performance benchmark)
- [ ] **Deployment**: Confirm AI service fallback works when Genkit unavailable
- [ ] **Deployment**: Verify color contrast ratios meet WCAG AA standards in production theme

---

### User Story 3 - Historical Tracking & Trends (Priority: P2)

A fishkeeper wants to view their water testing history over time to identify patterns, understand if their tank is stabilizing or having recurring issues, and make informed decisions about tank maintenance.

**Why this priority**: Historical data provides context and helps users understand trends, but isn't immediately necessary for basic water testing. It becomes valuable after multiple tests have been performed.

**Independent Test**: Can be fully tested by viewing a list of past test results for an aquarium, filtering by date range or parameter, seeing trend visualizations, and exporting data. Delivers value by helping users understand long-term water quality patterns.

**Acceptance Scenarios**:

1. **Given** an aquarium with multiple test results, **When** the user views test history, **Then** they see a chronological list of all tests with key parameters and dates
2. **Given** test history, **When** the user selects a specific parameter (e.g., ammonia), **Then** they see a trend chart showing that parameter over time
3. **Given** trend data, **When** parameters show concerning patterns (e.g., rising nitrates), **Then** the system highlights this trend with explanatory text
4. **Given** test history, **When** the user filters by date range, **Then** only tests within that period are displayed
5. **Given** test history, **When** the user exports data, **Then** they receive a downloadable file with all test results in a standard format

**Implementation Checklist**:

- [ ] **Setup**: Index water_tests table by aquarium_id and test_date for efficient queries
- [ ] **Setup**: Configure Recharts library for trend visualization components
- [ ] **Development**: Build test history list view with pagination and date range filters
- [ ] **Development**: Implement trend chart component with dual-axis support for multiple parameters
- [ ] **Development**: Create trend analysis algorithm (20% over 7 days, 50% over 30 days thresholds)
- [ ] **Development**: Build parameter statistics calculator (avg, min, max, trend direction)
- [ ] **Development**: Implement CSV export functionality with proper formatting
- [ ] **Development**: Implement PDF export with formatted tables and embedded chart images
- [ ] **Development**: Add concerning trend highlighting UI with explanatory tooltips
- [ ] **Testing**: Unit tests for trend detection algorithm with various data patterns
- [ ] **Testing**: Integration tests for history queries with RLS verification
- [ ] **Testing**: Test export functionality generates valid CSV and PDF files
- [ ] **Testing**: Verify charts render correctly with missing data points
- [ ] **Deployment**: Confirm history loads within 2 seconds for aquariums with 100+ tests
- [ ] **Deployment**: Verify exported files download correctly on mobile devices

---

### User Story 4 - Treatment & Product Recommendations (Priority: P2)

A fishkeeper discovers a water quality issue and needs guidance on how to fix it, including which treatment products to use and how much to dose based on their tank size.

**Why this priority**: This provides actionable guidance when problems occur, making the app more valuable. However, users can manually research solutions, so it's not critical for MVP.

**Independent Test**: Can be fully tested by viewing recommendations when water parameters are out of range, seeing suggested products with purchase links, getting dosage calculations based on tank size, and viewing safety warnings. Delivers value by guiding users to solutions quickly.

**Acceptance Scenarios**:

1. **Given** test results with elevated ammonia, **When** displayed, **Then** the user sees recommended treatment products (e.g., ammonia removers) with explanations
2. **Given** product recommendations, **When** viewed, **Then** each product shows dosage calculations specific to the user's tank size
3. **Given** multiple parameter issues, **When** recommendations are shown, **Then** products are prioritized by severity and compatibility warnings are displayed
4. **Given** product recommendations, **When** the user clicks a product, **Then** they are directed to purchase options
5. **Given** recommendations, **When** displayed, **Then** users see warnings about treatment interactions and safety precautions

**Implementation Checklist**:

- [ ] **Setup**: Create treatment_recommendations table linked to water_tests with RLS policies
- [ ] **Setup**: Configure Genkit AI flow for treatment recommendations based on water parameters
- [ ] **Setup**: Build Treatment Compatibility Matrix database (Appendix A combinations)
- [ ] **Setup**: Set up product affiliate link tracking (Amazon, Chewy, Petco partnerships)
- [ ] **Development**: Implement severity calculation (CRITICAL: pH <6.0/>8.5, ammonia >0.25ppm; WARNING: nitrite >0.1ppm, nitrate >40ppm)
- [ ] **Development**: Build dosage calculator based on tank size (gallons/liters conversion)
- [ ] **Development**: Create compatibility checker for livestock (copper+invertebrates warnings)
- [ ] **Development**: Implement treatment recommendation UI with priority sorting
- [ ] **Development**: Add safety warning modals for dangerous combinations (Appendix A)
- [ ] **Development**: Build product card component with purchase links and dosage instructions
- [ ] **Testing**: Unit tests for severity level calculation with edge cases
- [ ] **Testing**: Integration tests for compatibility matrix warnings (all Appendix A combinations)
- [ ] **Testing**: Test dosage calculations for various tank sizes (10-200 gallons)
- [ ] **Testing**: Verify affiliate links open correctly and track conversions
- [ ] **Deployment**: Confirm AI recommendations align with Treatment Compatibility Matrix
- [ ] **Deployment**: Verify emergency response protocols display for CRITICAL combinations

---

### User Story 5 - Maintenance Reminders & Scheduling (Priority: P3)

A fishkeeper wants to be reminded about regular maintenance tasks like water changes, filter cleaning, and parameter testing so they don't forget critical aquarium care activities.

**Why this priority**: Reminders improve long-term aquarium maintenance but aren't essential for the core water testing functionality. Users can manage their own schedules initially.

**Independent Test**: Can be fully tested by setting up reminders for specific tasks, receiving notifications when tasks are due, marking tasks as complete, and viewing maintenance calendar. Delivers value by reducing forgotten maintenance.

**Acceptance Scenarios**:

1. **Given** an aquarium profile, **When** the user creates a water change reminder, **Then** they can set frequency (weekly, bi-weekly, monthly) and receive notifications
2. **Given** a scheduled maintenance task, **When** it becomes due, **Then** the user receives a notification via email or in-app
3. **Given** a maintenance reminder, **When** the user completes the task, **Then** they can mark it complete and the next occurrence is automatically scheduled
4. **Given** multiple aquariums, **When** viewing the maintenance calendar, **Then** all upcoming tasks across all tanks are displayed chronologically
5. **Given** a maintenance task, **When** the user postpones it, **Then** the reminder is rescheduled to a user-specified date

**Implementation Checklist**:

- [ ] **Setup**: Create maintenance_tasks table with aquarium_id, frequency, next_due_date, and RLS policies
- [ ] **Setup**: Create maintenance_history table for tracking completions with timestamps
- [ ] **Setup**: Configure email service (Resend or SendGrid) for reminder notifications
- [ ] **Setup**: Set up cron job or scheduled function to check due tasks daily at 9 AM user timezone
- [ ] **Development**: Build maintenance task creation form with frequency presets
- [ ] **Development**: Implement notification system (email + in-app) 1 day before and on due date
- [ ] **Development**: Create task completion UI with notes field and auto-reschedule logic
- [ ] **Development**: Build maintenance calendar view with multi-aquarium support
- [ ] **Development**: Add postpone functionality with date picker
- [ ] **Development**: Implement maintenance history view component (past 50 completions)
- [ ] **Testing**: Unit tests for next occurrence calculation (weekly, bi-weekly, monthly)
- [ ] **Testing**: Integration tests for notification sending at correct times
- [ ] **Testing**: Test auto-reschedule logic when tasks marked complete
- [ ] **Testing**: Verify calendar shows all tasks across user's aquariums with RLS
- [ ] **Deployment**: Confirm cron job runs reliably in production timezone-aware
- [ ] **Deployment**: Verify email notifications not flagged as spam (SPF/DKIM records)

---

### User Story 6 - AI-Powered Product Discovery (Priority: P3)

A fishkeeper is setting up a new tank or upgrading equipment and wants intelligent recommendations for compatible fish, plants, filters, lighting, and other equipment based on their tank specifications.

**Why this priority**: This enhances the platform's value as a comprehensive toolkit but isn't essential for the core water quality mission. Users can research products elsewhere initially.

**Independent Test**: Can be fully tested by searching for fish/plants/equipment, receiving AI-generated recommendations based on tank type and size, viewing compatibility information, and accessing purchase links. Delivers value by simplifying product research.

**Acceptance Scenarios**:

1. **Given** a user specifies they want to add fish, **When** they provide tank type and size, **Then** they receive a curated list of compatible fish species with care requirements
2. **Given** a search for filtration systems, **When** the user enters their tank size, **Then** recommended filters are shown with appropriate capacity and features
3. **Given** plant recommendations, **When** displayed, **Then** lighting and substrate requirements are included for each plant
4. **Given** multiple product searches, **When** the user views a fish species, **Then** compatible tank mates and incompatible species are highlighted
5. **Given** product recommendations, **When** the user selects an item, **Then** they can access purchase links from multiple vendors

**Implementation Checklist**:

- [ ] **Setup**: Create species_compatibility database with aggression levels (1-5 scale)
- [ ] **Setup**: Create equipment_specifications database with capacity ranges
- [ ] **Setup**: Configure Genkit AI flows for fish, plant, filter, lighting, and tank recommendations
- [ ] **Setup**: Build product vendor API integrations (Amazon Product API, pet store affiliates)
- [ ] **Development**: Implement fish finder with compatibility matrix (compatible/caution/incompatible)
- [ ] **Development**: Build plant finder with care requirements (lighting 1-5, difficulty 1-5)
- [ ] **Development**: Create filtration finder with capacity matching algorithm
- [ ] **Development**: Implement lighting finder with tank size and type considerations
- [ ] **Development**: Build product card components with vendor price comparison
- [ ] **Development**: Add "add to aquarium" functionality linking to livestock/equipment tables
- [ ] **Testing**: Unit tests for compatibility calculations (aggression levels, water parameters)
- [ ] **Testing**: Integration tests for AI recommendation flows with various tank specs
- [ ] **Testing**: Test equipment capacity matching (filter GPH for tank gallons)
- [ ] **Testing**: Verify purchase links resolve correctly for all vendor integrations
- [ ] **Deployment**: Confirm AI recommendations match actual product availability
- [ ] **Deployment**: Verify vendor affiliate tracking codes included in all links

---

### User Story 7 - Community Forum & Q&A (Priority: P3)

A fishkeeper has questions about aquarium care or wants to share experiences with other hobbyists, seeking advice from an engaged community of fellow fishkeepers.

**Why this priority**: Community features enhance engagement but aren't core to the water quality management mission. Users can find forums elsewhere initially.

**Independent Test**: Can be fully tested by posting questions, viewing answers from other users, upvoting helpful responses, searching previous questions, and reporting inappropriate content. Delivers value by creating a supportive community.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they post a question with tags, **Then** it appears in the community feed and other users can respond
2. **Given** a question with multiple answers, **When** viewing, **Then** answers are sorted by votes and the question asker can mark one as accepted
3. **Given** community content, **When** a user searches for keywords, **Then** relevant past questions and answers are displayed
4. **Given** inappropriate content, **When** a user reports it, **Then** moderators are notified and can take action
5. **Given** a user's profile, **When** viewed, **Then** their questions, answers, and reputation score are displayed

**Implementation Checklist**:

- [ ] **Setup**: Create questions, answers, votes, reports tables with user_id RLS policies
- [ ] **Setup**: Create moderator role permissions in RBAC system
- [ ] **Setup**: Set up notification system for answer notifications and moderator alerts
- [ ] **Setup**: Index questions and answers for full-text search (PostgreSQL tsvector)
- [ ] **Development**: Build question creation form with title, content, tags (multi-select)
- [ ] **Development**: Implement answer posting UI with rich text editor (markdown support)
- [ ] **Development**: Create voting system (upvote/downvote) with optimistic UI updates
- [ ] **Development**: Build accepted answer marking (only question author can mark)
- [ ] **Development**: Implement reputation calculation (10×accepted + 2×upvotes + 1×questions)
- [ ] **Development**: Create content moderation dashboard for moderators (flag review queue)
- [ ] **Development**: Build search interface with keyword and tag filtering
- [ ] **Development**: Implement user profile page with activity history
- [ ] **Testing**: Unit tests for reputation calculation formula
- [ ] **Testing**: Integration tests for voting system with concurrent vote handling
- [ ] **Testing**: Test moderation flow (report → moderator review → action taken)
- [ ] **Testing**: Verify search returns relevant results ranked by votes and recency
- [ ] **Testing**: Test RLS prevents users from voting multiple times on same content
- [ ] **Deployment**: Confirm notification emails sent within 5 minutes of new answers
- [ ] **Deployment**: Verify moderator dashboard only accessible to moderator/admin roles

---

### User Story 8 - Marketplace for Equipment & Livestock (Priority: P4)

A fishkeeper wants to buy or sell used aquarium equipment, fish, plants, or other aquarium-related items locally or nationally, connecting with other hobbyists for transactions.

**Why this priority**: Marketplace functionality is valuable but represents significant complexity (payments, shipping, trust) and isn't core to the aquarium management mission. Can be added later once core features are established.

**Independent Test**: Can be fully tested by creating listings with photos and prices, browsing available items by category, contacting sellers, and managing active listings. Delivers value by creating a dedicated marketplace for aquarium goods.

**Acceptance Scenarios**:

1. **Given** a verified user, **When** they create a listing, **Then** they can add title, description, photos, price, category, and location
2. **Given** marketplace listings, **When** a user browses by category, **Then** they see relevant items with key details and photos
3. **Given** an interesting listing, **When** a user wants to contact the seller, **Then** they can send a message through the platform
4. **Given** a user's own listings, **When** viewing, **Then** they can edit details, mark items as sold, or remove listings
5. **Given** marketplace activity, **When** users engage in transactions, **Then** both parties can leave feedback and ratings

**Implementation Checklist**:

- [ ] **Setup**: Create marketplace_listings, messages, transactions, ratings tables with RLS policies
- [ ] **Setup**: Implement verified_seller role with email + phone verification workflow
- [ ] **Setup**: Configure image storage with compression for listing photos (max 5 images per listing)
- [ ] **Setup**: Create categories taxonomy (fish, plants, equipment, tanks) with subcategories
- [ ] **Development**: Build seller verification flow (email confirmation, phone SMS code, optional ID upload)
- [ ] **Development**: Implement listing creation form with photo upload, pricing, location
- [ ] **Development**: Create marketplace browse interface with category filtering and search
- [ ] **Development**: Build messaging system (inbox, compose, thread view) linking to listings
- [ ] **Development**: Implement listing management dashboard (edit, mark sold, delete)
- [ ] **Development**: Create transaction rating system (5-star + optional text review, 500 char max)
- [ ] **Development**: Add seller profile page with ratings, active listings, transaction history
- [ ] **Development**: Implement location-based search (distance radius filter)
- [ ] **Testing**: Unit tests for seller verification logic (email + phone required)
- [ ] **Testing**: Integration tests for messaging system with read/unread status
- [ ] **Testing**: Test listing visibility (only verified sellers can create, all users can browse)
- [ ] **Testing**: Verify image upload compression reduces file sizes appropriately
- [ ] **Testing**: Test RLS ensures sellers can only edit/delete their own listings
- [ ] **Deployment**: Confirm phone verification SMS delivery in production
- [ ] **Deployment**: Verify listing photos load quickly on mobile (image CDN caching)
- [ ] **Deployment**: Test location search works with user geolocation permissions

---

### Edge Cases

- What happens when a test strip photo is too blurry or poorly lit for accurate analysis? → **Queue for retry (3 attempts), show manual entry immediately, display image quality tips (good lighting, flat surface, no shadows)**
- How does the system handle users trying to upload non-test-strip images? → **Validate image content, reject with helpful error message, suggest capturing test strip again**
- What happens when a user creates a reminder but later deletes the associated aquarium? → **Cascade delete all reminders for that aquarium, send confirmation notification listing affected reminders**
- How does the system handle extremely large or unusual tank sizes that fall outside normal parameters? → **Accept custom sizes, flag for review if >1000 gallons, adjust AI recommendations with wider safety margins**
- What happens when AI services are temporarily unavailable during test strip analysis? → **Queue request with retry (max 3 attempts: 2s, 4s, 8s exponential backoff), immediately show manual entry form, notify user when retry succeeds or fails**
- How does the system handle users entering parameters manually that conflict with photo analysis? → **Prioritize manual entry, mark as "user-corrected", store original AI values for quality improvement**
- What happens when a user has no aquarium profiles but tries to record a water test? → **Prompt to create aquarium first, offer quick-create modal without leaving test flow**
- How does the system handle different test strip brands with varying color scales? → **Auto-detect brand from photo (logo/layout), allow manual brand selection if confidence <75%, maintain brand-specific color calibration database**
- What happens when a user tries to delete an aquarium that has extensive historical data? → **Show confirmation with data count (X tests, Y livestock, Z reminders), offer export before deletion, soft-delete with 30-day recovery window**
- How does the system handle concurrent test entries for the same aquarium? → **Allow concurrent entries, timestamp each independently, display in chronological order, no conflict resolution needed**

## Requirements *(mandatory)*

### Functional Requirements

**Aquarium Profile Management**

- **FR-001**: System MUST allow authenticated users to create aquarium profiles with name, size (in gallons/liters), type (freshwater/saltwater/planted/reef), and setup date
- **FR-002**: System MUST allow users to view a list of all their aquarium profiles with summary information
- **FR-003**: System MUST allow users to edit any aquarium profile details after creation
- **FR-004**: System MUST allow users to delete aquarium profiles with confirmation to prevent accidental deletion
- **FR-005**: System MUST allow users to add livestock (fish, invertebrates, plants, coral) to aquarium profiles with species name and quantity
- **FR-006**: System MUST allow users to add equipment (filters, heaters, lights) to aquarium profiles with brand, model, and installation date
- **FR-007**: System MUST allow users to upload photos of their aquariums and associate them with profiles

**Water Testing & Analysis**

- **FR-008**: System MUST allow users to capture or upload photos of water test strips
- **FR-009**: System MUST analyze test strip images using AI to extract parameter values (pH, ammonia, nitrite, nitrate, KH, GH, chlorine)
- **FR-010**: System MUST display analyzed parameters with numeric values, units, and status indicators using color coding: safe (green #10b981), warning (yellow #f59e0b), critical (red #ef4444) with WCAG AA contrast ratios
- **FR-011**: System MUST provide confidence scores for AI analysis and allow manual value adjustment when confidence score is below 75%
- **FR-012**: System MUST save test results with timestamp and association to specific aquarium
- **FR-013**: System MUST allow users to manually enter test results without photo upload
- **FR-014**: System MUST support multiple test strip brands by identifying brand from photo or user selection
- **FR-015**: System MUST provide explanations for each parameter status (1-2 sentence explanations, max 200 characters, with actionable next steps when status is warning/critical)

**Historical Tracking**

- **FR-016**: System MUST store all water test results with timestamps for long-term tracking
- **FR-017**: System MUST display test history in chronological order with filtering by date range
- **FR-018**: System MUST generate trend visualizations using line charts with connected data points, dual-axis support for multiple parameters, showing parameter changes over time
- **FR-019**: System MUST allow users to export test history in standard formats (CSV, PDF)
- **FR-020**: System MUST highlight concerning trends (parameters exceeding 20% increase over 7 days or 50% over 30 days) with explanatory text
- **FR-021**: System MUST allow users to view statistics for each parameter (average, min, max, trend direction)

**Treatment Recommendations**

- **FR-022**: System MUST generate treatment recommendations when parameters are out of safe range
- **FR-023**: System MUST calculate dosages based on the specific aquarium's size
- **FR-024**: System MUST provide product suggestions with purchase links to multiple vendors
- **FR-025**: System MUST warn users about treatment compatibility issues and safety precautions (see Appendix A: Treatment Compatibility Matrix for dangerous combinations including copper+invertebrates, certain water conditioners with oxidizers, and medication interactions)
- **FR-026**: System MUST prioritize recommendations by severity levels: CRITICAL (pH <6.0 or >8.5, ammonia >0.25ppm), WARNING (nitrite >0.1ppm, nitrate >40ppm), CAUTION (parameters at thresholds)
- **FR-027**: System MUST explain the purpose and expected results of each recommended treatment, with expected timeframes (24-72 hours for most treatments, longer for biological cycle establishment)

**Maintenance Reminders**

- **FR-028**: System MUST allow users to create recurring maintenance reminders (water changes, filter cleaning, testing)
- **FR-029**: System MUST send notifications 1 day before due date and on due date at 9:00 AM user local time via email or in-app notifications
- **FR-030**: System MUST allow users to mark tasks as complete and automatically schedule next occurrence
- **FR-031**: System MUST display a maintenance calendar showing all upcoming tasks across all aquariums
- **FR-032**: System MUST allow users to postpone or edit reminder schedules
- **FR-033**: System MUST track maintenance completion history for each aquarium

**AI Product Discovery**

- **FR-034**: System MUST provide AI-powered fish recommendations based on tank type, size, and existing inhabitants
- **FR-035**: System MUST provide plant recommendations based on tank type, lighting, and substrate
- **FR-036**: System MUST provide equipment recommendations (filters, heaters, lights) based on tank specifications
- **FR-037**: System MUST show compatibility information for fish species with compatibility status (compatible/caution/incompatible), text explanation, and aggression level rating (1-5 scale)
- **FR-038**: System MUST include care requirements and difficulty ratings (1-5 scale: 1=beginner, 2=easy, 3=intermediate, 4=advanced, 5=expert) based on water stability requirements, feeding complexity, and aggression management
- **FR-039**: System MUST provide purchase links to multiple vendors for recommended products

**Community Features**

- **FR-040**: System MUST allow authenticated users to post questions with titles, descriptions, and tags
- **FR-041**: System MUST allow users to answer questions posted by others
- **FR-042**: System MUST allow users to upvote helpful answers and mark accepted solutions
- **FR-043**: System MUST allow users to search past questions and answers by keywords and tags
- **FR-044**: System MUST allow users to report inappropriate content (spam, harassment, off-topic, misinformation, illegal sales, explicit content) for moderator review
- **FR-045**: System MUST display user reputation based on community contributions and accepted answers (calculation: 10 × accepted_answers + 2 × helpful_upvotes + 1 × questions_asked)
- **FR-046**: System MUST send notifications via email or in-app when users receive answers to their questions

**Marketplace**

- **FR-047**: System MUST allow verified users to create listings with title, description, price, photos, category, and location
- **FR-048**: System MUST allow users to browse listings by category (fish, plants, equipment, tanks)
- **FR-049**: System MUST allow users to search listings by keywords, location, and price range
- **FR-050**: System MUST allow users to contact sellers through the platform messaging system
- **FR-051**: System MUST allow sellers to manage their listings (edit, mark as sold, delete)
- **FR-052**: System MUST allow users to leave ratings and reviews after transactions (5-star rating required, text review optional with 500 character max, transaction photos optional with max 5 images)
- **FR-053**: System MUST require seller verification (email confirmation + phone number verification, optional government ID upload for featured sellers) before allowing marketplace listing creation

**User Management & Authentication**

- **FR-054**: System MUST allow users to create accounts with email and password
- **FR-055**: System MUST authenticate users via email/password or social login (Google) using session token with RBAC (roles: standard, verified_seller, moderator, admin)
- **FR-056**: System MUST allow users to reset passwords via email
- **FR-057**: System MUST allow users to manage profile information (display name, photo, location)
- **FR-058**: System MUST maintain user sessions with server-side token validation across browser sessions until logout
- **FR-059**: System MUST protect all user data and aquarium information behind authentication with role-based access control enforcing permissions per feature (e.g., verified_seller required for marketplace listing creation, moderator for community content moderation)
- **FR-060**: System MUST persist all user data (profiles, aquariums, tests, settings) with tiered retention policy: test strip images (90 days auto-deletion), marketplace messages (1 year), core data (aquarium profiles, test results - indefinite until user deletion) with row-level security (RLS) enforcing user_id ownership on all tables; AND provide account settings with data export (JSON format), account deletion (immediate purge with 30-day audit log retention), and retention preferences (opt-in to keep test strip images >90 days)

**Data & Performance**

- **FR-061**: System MUST respond to user interactions within 2 seconds under normal load (up to 100 concurrent users with 95th percentile response time at 2 seconds)
- **FR-062**: System MUST process test strip image analysis within 10 seconds for 85% of requests, with 15-second timeout for remaining cases
- **FR-063**: System MUST be accessible on mobile devices (phones and tablets) with responsive design
- **FR-064**: System MUST work reliably with slow internet connections (3G) for core features (aquarium profile CRUD, manual test entry, test history viewing; excludes AI analysis, image uploads, marketplace browsing)
- **FR-065**: System MUST handle graceful degradation when AI services are temporarily unavailable by queuing analysis requests with automatic retry (max 3 attempts with exponential backoff: 2s, 4s, 8s) while immediately displaying manual entry form as fallback option

### Key Entities

- **User**: Represents a fishkeeper using the platform; attributes include id (UUID primary key), email, display name, profile photo, location, join date, reputation score, role (standard/verified_seller/moderator/admin), and notification preferences
- **Aquarium**: Represents a fish tank profile; attributes include id (UUID primary key), user_id (foreign key with RLS policy), name, size, unit (gallons/liters), type (freshwater/saltwater/planted/reef), setup date, location, description, photos, and current status
- **WaterTest**: Represents a water quality test result; attributes include id (UUID primary key), aquarium_id (foreign key), user_id (inherited via aquarium.user_id for RLS), test date, parameters (pH, ammonia, nitrite, nitrate, KH, GH, chlorine, temperature), image URL, confidence scores, notes, and entry method (AI/manual)
- **Livestock**: Represents fish, invertebrates, plants, or coral in an aquarium; attributes include id (UUID primary key), aquarium_id (foreign key), user_id (inherited via aquarium.user_id for RLS), type (fish/invertebrate/plant/coral), species name, common name, quantity, date added, source, and notes
- **Equipment**: Represents aquarium equipment; attributes include id (UUID primary key), aquarium_id (foreign key), user_id (inherited via aquarium.user_id for RLS), type (filter/heater/light/pump/other), brand, model, installation date, last service date, and notes
- **MaintenanceTask**: Represents a recurring maintenance reminder; attributes include id (UUID primary key), aquarium_id (foreign key), user_id (inherited via aquarium.user_id for RLS), task type (water change/filter clean/test water/other), frequency (days), last completed date, next due date, enabled status, and notes
- **TreatmentRecommendation**: Represents an AI-generated treatment suggestion; attributes include id (UUID primary key), water_test_id (foreign key), user_id (inherited via water_test for RLS), issue (elevated parameter), product name, dosage calculation, purchase links, priority, and safety warnings
- **Question**: Represents a community forum question; attributes include id (UUID primary key), author_id (foreign key to User with RLS), title, content, tags, view count, vote count, posted date, last activity date, and accepted answer
- **Answer**: Represents a response to a question; attributes include id (UUID primary key), question_id (foreign key), author_id (foreign key to User with RLS), content, vote count, is accepted flag, posted date, and last edited date
- **MarketplaceListing**: Represents an item for sale/trade; attributes include id (UUID primary key), seller_id (foreign key to User with RLS), title, description, price, category, condition, photos, location, status (active/sold/expired), posted date, and view count
- **Message**: Represents communication between users; attributes include id (UUID primary key), sender_id (foreign key to User), recipient_id (foreign key to User), subject, content, related_listing_id (foreign key), sent date, and read status (RLS allows access when user_id = sender_id OR user_id = recipient_id)

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Core Functionality**

- **SC-001**: Users can create an aquarium profile and record their first water test within 5 minutes of signup
- **SC-002**: AI test strip analysis produces results within 10 seconds with 90% or higher confidence in 85% of cases (confidence calibrated on API Master Test Kit, Tetra EasyStrips, and Seachem MultiTest)
- **SC-003**: 90% of users successfully complete water test analysis on their first attempt without assistance
- **SC-004**: Users can view their complete test history for any aquarium within 2 seconds

**User Engagement**

- **SC-005**: 70% of users who create an aquarium profile record at least 3 water tests within their first month
- **SC-006**: Users with active maintenance reminders (having 1+ enabled recurring reminders with at least 1 task completed in past 30 days) show 40% higher engagement than users without reminders
- **SC-007**: Community questions receive at least one substantive answer (minimum 25 words, not flagged as spam) within 24 hours in 80% of cases
- **SC-008**: 60% of users who receive treatment recommendations report improved water parameters within 2 weeks

**Performance & Reliability**

- **SC-009**: System supports 1,000 concurrent users without performance degradation
- **SC-010**: Page load times remain under 3 seconds for 95% of page views
- **SC-011**: System maintains 99.5% uptime during peak usage hours (evenings and weekends)
- **SC-012**: AI service availability is 98% or higher, with graceful fallback to manual entry when unavailable

**User Satisfaction**

- **SC-013**: 85% of users rate the water testing feature as "helpful" or "very helpful" in post-test surveys
- **SC-014**: Users report saving an average of 15 minutes per water test compared to manual color matching
- **SC-015**: 75% of users would recommend the platform to other fishkeepers
- **SC-016**: Support tickets related to water testing or profile management decrease by 60% after the first user interaction

**Business Outcomes**

- **SC-017**: 50% of users who receive product recommendations click through to purchase links
- **SC-018**: Marketplace listings receive an average of 10 views within the first 48 hours
- **SC-019**: Active user retention (users who return within 30 days) reaches 65%
- **SC-020**: Average user manages 2 or more aquarium profiles within their first 3 months

## Assumptions

1. **Test Strip Standards**: We assume most users will use common test strip brands (API, Tetra, Seachem) with standardized color scales that can be reliably analyzed via image recognition
2. **Mobile Camera Quality**: We assume users' mobile device cameras are of sufficient quality (5MP or higher) to capture clear test strip images for AI analysis
3. **Internet Connectivity**: We assume users have regular internet access to sync data and use AI features, though core profile viewing should work offline
4. **User Aquarium Knowledge**: We assume users have basic fishkeeping knowledge and understand fundamental concepts like nitrogen cycle and pH
5. **English Language**: Initial launch assumes English-speaking users; localization can be added later based on demand
6. **Water Parameter Ranges**: We assume standard safe ranges for common aquarium types (freshwater tropical, saltwater reef, planted tanks)
7. **Email Access**: We assume users have email accounts for authentication and notification delivery
8. **Free Tier Services**: We assume Neon PostgreSQL free tier is sufficient for initial user base (under 10,000 users); Supabase Auth/Storage or alternative cost-effective services for authentication and file storage
9. **Product Availability**: We assume recommended products are generally available through major online retailers and local stores
10. **Community Moderation**: We assume community will generally self-moderate with upvotes/downvotes, with manual moderator intervention for serious issues only
11. **Data Retention Compliance**: We assume users understand and accept tiered retention policy (test strip images 90 days, messages 1 year, core data indefinite) as disclosed in terms of service and privacy policy

## Dependencies

1. **Authentication Service**: Required for user authentication and session management (migrate from Firebase to Supabase Auth or NextAuth.js with Neon PostgreSQL for cost optimization)
2. **Neon PostgreSQL**: Required for storing all structured data (profiles, tests, community content, user sessions, RBAC roles)
3. **Object Storage**: Required for storing uploaded images (test strips, aquarium photos, listing images) - evaluate Supabase Storage or Cloudflare R2 as Firebase Storage alternatives
4. **Google AI / Genkit**: Required for test strip analysis and product recommendation AI flows
5. **Email Service Provider**: Required for sending reminder notifications and password reset emails
6. **Mobile Device Cameras**: Users must have device with camera capability for test strip photo capture
7. **Modern Web Browser**: Users must have recent version of Chrome, Safari, Firefox, or Edge with JavaScript enabled
8. **Product Data Sources**: May require partnerships or API access to aquarium product retailers for accurate purchase links and pricing

## Out of Scope

The following features are explicitly excluded from this specification:

1. **Payment Processing**: Direct payment handling or transaction processing within the marketplace (users handle payments externally)
2. **Shipping Integration**: Shipping label generation or carrier integration for marketplace items
3. **Video Content**: Video uploads for aquarium showcases or tutorials (photos only)
4. **Real-time Chat**: Live chat between users (async messaging only)
5. **Aquarium Design Tools**: Visual aquascaping or tank design planning features
6. **Water Chemistry Calculators**: Advanced calculators for custom salt mixes or CO2 systems
7. **Breeding Tracking**: Detailed breeding programs or fry development tracking
8. **Multi-language Support**: Languages other than English (future enhancement)
9. **Native Mobile Apps**: iOS/Android native applications (web-responsive only for MVP)
10. **Automated Dosing Integration**: Integration with physical automated dosing systems or IoT devices
11. **Professional Services**: Connections to professional aquarium maintenance services or veterinarians
12. **Inventory Management**: Detailed tracking of supplies like food, medications, and test kit expiration
13. **Social Feed**: Instagram-style social feed of aquarium photos and updates
14. **Fish Disease Diagnosis**: AI-powered fish disease identification from photos
15. **Competition/Contest Features**: Aquarium competitions or "tank of the month" contests

---

## Data Retention Policy

The following retention periods apply to optimize storage costs while preserving valuable user data:

### Automatic Deletion (Cost Optimization)
- **Test Strip Images**: Auto-deleted after 90 days (test result data preserved)
- **Marketplace Messages**: Auto-deleted after 1 year (listing history preserved)
- **Marketplace Listing Photos**: Deleted when listing marked sold/expired + 30 days
- **Temporary Upload Files**: Deleted within 24 hours if not associated with saved record

### Indefinite Retention (Core Data)
- **User Accounts**: Until user-initiated deletion
- **Aquarium Profiles**: Until user deletion or account deletion
- **Water Test Results**: Until user deletion (numeric data only after image deletion)
- **Livestock/Equipment Records**: Until user deletion or aquarium deletion
- **Community Content** (questions/answers): Until user deletion or content removal
- **Reputation Scores**: Until user account deletion

### User Controls (Account Settings)
- **Export All Data**: JSON file with complete user data downloadable anytime
- **Delete Account**: Immediate purge of all user data (30-day audit log retention for security)
- **Opt-in Extended Retention**: Keep test strip images >90 days (available for premium users)
- **Selective Deletion**: Delete specific aquariums, tests, or community posts

### Compliance Notes
- Audit logs retained 30 days post-deletion for security/fraud prevention (GDPR legitimate interest)
- Anonymized analytics data (no PII) retained indefinitely for product improvement
- Users notified 14 days before automatic deletion of test strip images (email reminder)

---

## Appendices

### Appendix A: Treatment Compatibility Matrix

The following combinations represent DANGEROUS interactions that must trigger safety warnings per FR-025:

**CRITICAL - Toxic Combinations:**
- **Copper-based treatments + Invertebrates**: Copper sulfate, chelated copper (e.g., Cupramine) are lethal to snails, shrimp, crabs, and corals at therapeutic doses
- **Potassium Permanganate + Organic Compounds**: Reacts violently with Seachem Prime, API Stress Coat, or any reducing agents - risk of fire/chemical burns
- **Formalin/Formaldehyde + High Temperature**: Toxic at >80°F / 27°C - respiratory failure in fish
- **Methylene Blue + UV Sterilizers/Strong Lighting**: Degrades rapidly, produces toxic byproducts

**HIGH RISK - Medication Interactions:**
- **Multiple Antibiotics Simultaneously**: Kanamycin + Erythromycin causes liver damage in fish
- **Malachite Green + Salt**: Amplifies toxicity - do NOT combine
- **Praziquantel + Copper**: Both stress liver - space treatments 7+ days apart

**MODERATE RISK - Water Chemistry Conflicts:**
- **pH Down + Ammonia Removers**: Creates unstable pH swings - dose separately by 12 hours
- **Water Conditioner (dechlorinator) + Oxidizers**: Neutralizes chlorine dioxide, iodine treatments - wait 24 hours
- **Carbon Filtration + Medications**: Removes therapeutic compounds - remove carbon during treatment

**INVERTEBRATE SENSITIVITIES:**
- Avoid ANY: Copper, malachite green, formalin, praziquantel with shrimp/snails/corals
- Safe alternatives: Hydrogen peroxide (low dose), manual removal, biological controls

**REFERENCE DOSAGES (per FR-023 tank-size calculations):**
- Copper sulfate: 0.15-0.20 ppm for fish-only systems
- Methylene blue: 2-5 ppm depending on tank volume
- API General Cure: 1 packet per 10 gallons
- Seachem Paraguard: 5 mL per 10 gallons daily

**IMPLEMENTATION NOTE**: AI recommendation flow (src/ai/flows/recommend-treatment-products.ts) must check aquarium livestock types and active equipment (UV sterilizers) before suggesting treatments.

