# Feature Specification: Comprehensive Aquarium Management Toolkit

**Feature Branch**: `001-aquarium-toolkit`  
**Created**: 2025-10-20  
**Status**: Draft  
**Input**: User description: "The primary goal of AquaDex is to provide aquarium enthusiasts with a comprehensive toolkit for managing their aquariums effectively. This includes features for water analysis, tracking, AI-powered insights, and community engagement."

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

---

### Edge Cases

- What happens when a test strip photo is too blurry or poorly lit for accurate analysis?
- How does the system handle users trying to upload non-test-strip images?
- What happens when a user creates a reminder but later deletes the associated aquarium?
- How does the system handle extremely large or unusual tank sizes that fall outside normal parameters?
- What happens when AI services are temporarily unavailable during test strip analysis?
- How does the system handle users entering parameters manually that conflict with photo analysis?
- What happens when a user has no aquarium profiles but tries to record a water test?
- How does the system handle different test strip brands with varying color scales?
- What happens when a user tries to delete an aquarium that has extensive historical data?
- How does the system handle concurrent test entries for the same aquarium?

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
- **FR-010**: System MUST display analyzed parameters with numeric values, units, and status indicators (safe/warning/critical)
- **FR-011**: System MUST provide confidence scores for AI analysis and allow manual value adjustment when confidence score is below 75%
- **FR-012**: System MUST save test results with timestamp and association to specific aquarium
- **FR-013**: System MUST allow users to manually enter test results without photo upload
- **FR-014**: System MUST support multiple test strip brands by identifying brand from photo or user selection
- **FR-015**: System MUST provide explanations for each parameter status (why it's safe/warning/critical)

**Historical Tracking**

- **FR-016**: System MUST store all water test results with timestamps for long-term tracking
- **FR-017**: System MUST display test history in chronological order with filtering by date range
- **FR-018**: System MUST generate trend visualizations showing parameter changes over time
- **FR-019**: System MUST allow users to export test history in standard formats (CSV, PDF)
- **FR-020**: System MUST highlight concerning trends (e.g., steadily rising nitrates) with explanatory text
- **FR-021**: System MUST allow users to view statistics for each parameter (average, min, max, trend direction)

**Treatment Recommendations**

- **FR-022**: System MUST generate treatment recommendations when parameters are out of safe range
- **FR-023**: System MUST calculate dosages based on the specific aquarium's size
- **FR-024**: System MUST provide product suggestions with purchase links to multiple vendors
- **FR-025**: System MUST warn users about treatment compatibility issues and safety precautions (see Appendix A: Treatment Compatibility Matrix for dangerous combinations including copper+invertebrates, certain water conditioners with oxidizers, and medication interactions)
- **FR-026**: System MUST prioritize recommendations by severity of water quality issues
- **FR-027**: System MUST explain the purpose and expected results of each recommended treatment

**Maintenance Reminders**

- **FR-028**: System MUST allow users to create recurring maintenance reminders (water changes, filter cleaning, testing)
- **FR-029**: System MUST send notifications when maintenance tasks become due via email or in-app notifications
- **FR-030**: System MUST allow users to mark tasks as complete and automatically schedule next occurrence
- **FR-031**: System MUST display a maintenance calendar showing all upcoming tasks across all aquariums
- **FR-032**: System MUST allow users to postpone or edit reminder schedules
- **FR-033**: System MUST track maintenance completion history for each aquarium

**AI Product Discovery**

- **FR-034**: System MUST provide AI-powered fish recommendations based on tank type, size, and existing inhabitants
- **FR-035**: System MUST provide plant recommendations based on tank type, lighting, and substrate
- **FR-036**: System MUST provide equipment recommendations (filters, heaters, lights) based on tank specifications
- **FR-037**: System MUST show compatibility information for fish species (tank mates, incompatible species)
- **FR-038**: System MUST include care requirements and difficulty ratings for recommended species
- **FR-039**: System MUST provide purchase links to multiple vendors for recommended products

**Community Features**

- **FR-040**: System MUST allow authenticated users to post questions with titles, descriptions, and tags
- **FR-041**: System MUST allow users to answer questions posted by others
- **FR-042**: System MUST allow users to upvote helpful answers and mark accepted solutions
- **FR-043**: System MUST allow users to search past questions and answers by keywords and tags
- **FR-044**: System MUST allow users to report inappropriate content for moderator review
- **FR-045**: System MUST display user reputation based on community contributions and accepted answers
- **FR-046**: System MUST send notifications when users receive answers to their questions

**Marketplace**

- **FR-047**: System MUST allow verified users to create listings with title, description, price, photos, category, and location
- **FR-048**: System MUST allow users to browse listings by category (fish, plants, equipment, tanks)
- **FR-049**: System MUST allow users to search listings by keywords, location, and price range
- **FR-050**: System MUST allow users to contact sellers through the platform messaging system
- **FR-051**: System MUST allow sellers to manage their listings (edit, mark as sold, delete)
- **FR-052**: System MUST allow users to leave ratings and reviews after transactions
- **FR-053**: System MUST require seller verification before allowing marketplace listing creation

**User Management & Authentication**

- **FR-054**: System MUST allow users to create accounts with email and password
- **FR-055**: System MUST authenticate users via email/password or social login (Google)
- **FR-056**: System MUST allow users to reset passwords via email
- **FR-057**: System MUST allow users to manage profile information (display name, photo, location)
- **FR-058**: System MUST maintain user sessions across browser sessions until logout
- **FR-059**: System MUST protect all user data and aquarium information behind authentication

**Data & Performance**

- **FR-060**: System MUST persist all user data (profiles, aquariums, tests, settings) permanently until user deletion
- **FR-061**: System MUST respond to user interactions within 2 seconds under normal load (up to 100 concurrent users with 95th percentile response time at 2 seconds)
- **FR-062**: System MUST process test strip image analysis within 10 seconds for 85% of requests, with 15-second timeout for remaining cases
- **FR-063**: System MUST be accessible on mobile devices (phones and tablets) with responsive design
- **FR-064**: System MUST work reliably with slow internet connections (3G) for core features
- **FR-065**: System MUST handle graceful degradation when AI services are temporarily unavailable

### Key Entities

- **User**: Represents a fishkeeper using the platform; attributes include email, display name, profile photo, location, join date, reputation score, and notification preferences
- **Aquarium**: Represents a fish tank profile; attributes include name, owner (User), size, unit (gallons/liters), type (freshwater/saltwater/planted/reef), setup date, location, description, photos, and current status
- **WaterTest**: Represents a water quality test result; attributes include aquarium (Aquarium), test date, parameters (pH, ammonia, nitrite, nitrate, KH, GH, chlorine, temperature), image URL, confidence scores, notes, and entry method (AI/manual)
- **Livestock**: Represents fish, invertebrates, plants, or coral in an aquarium; attributes include aquarium (Aquarium), type (fish/invertebrate/plant/coral), species name, common name, quantity, date added, source, and notes
- **Equipment**: Represents aquarium equipment; attributes include aquarium (Aquarium), type (filter/heater/light/pump/other), brand, model, installation date, last service date, and notes
- **MaintenanceTask**: Represents a recurring maintenance reminder; attributes include aquarium (Aquarium), task type (water change/filter clean/test water/other), frequency (days), last completed date, next due date, enabled status, and notes
- **TreatmentRecommendation**: Represents an AI-generated treatment suggestion; attributes include water test (WaterTest), issue (elevated parameter), product name, dosage calculation, purchase links, priority, and safety warnings
- **Question**: Represents a community forum question; attributes include author (User), title, content, tags, view count, vote count, posted date, last activity date, and accepted answer
- **Answer**: Represents a response to a question; attributes include question (Question), author (User), content, vote count, is accepted flag, posted date, and last edited date
- **MarketplaceListing**: Represents an item for sale/trade; attributes include seller (User), title, description, price, category, condition, photos, location, status (active/sold/expired), posted date, and view count
- **Message**: Represents communication between users; attributes include sender (User), recipient (User), subject, content, related listing (MarketplaceListing), sent date, and read status

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Core Functionality**

- **SC-001**: Users can create an aquarium profile and record their first water test within 5 minutes of signup
- **SC-002**: AI test strip analysis produces results within 10 seconds with 90% or higher confidence in 85% of cases
- **SC-003**: 90% of users successfully complete water test analysis on their first attempt without assistance
- **SC-004**: Users can view their complete test history for any aquarium within 2 seconds

**User Engagement**

- **SC-005**: 70% of users who create an aquarium profile record at least 3 water tests within their first month
- **SC-006**: Users with active maintenance reminders show 40% higher engagement than users without reminders
- **SC-007**: Community questions receive at least one answer within 24 hours in 80% of cases
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
8. **Free Tier Services**: We assume Firebase free tier and Neon PostgreSQL free tier are sufficient for initial user base (under 10,000 users)
9. **Product Availability**: We assume recommended products are generally available through major online retailers and local stores
10. **Community Moderation**: We assume community will generally self-moderate with upvotes/downvotes, with manual moderator intervention for serious issues only

## Dependencies

1. **Firebase Authentication**: Required for user authentication and session management
2. **Neon PostgreSQL**: Required for storing all structured data (profiles, tests, community content)
3. **Firebase Storage**: Required for storing uploaded images (test strips, aquarium photos, listing images)
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

