# AquaDex Application Sitemap

## Overview
This document provides a comprehensive URL structure and sitemap for the AquaDex application, organized by feature category and user flow.

## URL Structure

### 🏠 Main Navigation

#### Landing & Marketing
- `/` - Homepage with feature overview and call-to-action
- `/for-fishkeepers` - Landing page for aquarium hobbyists
- `/for-brands-stores` - Landing page for businesses and retailers
- `/for-breeders-sellers` - Landing page for fish breeders and sellers

#### Core Features
- `/dashboard` - User dashboard (requires auth)
- `/profile` - User profile management (requires auth)
- `/sitemap` - Complete site navigation

### 🐠 Aquarium Management

#### Tank Management
- `/aquariums` - List all user aquariums
- `/aquariums/[aquariumId]` - View/edit specific aquarium details
- `/aquariums/new` - Add new aquarium (currently handled by form on /aquariums)

#### Water Testing & Analysis
- `/analyze` - AI-powered water test strip analyzer
- `/history` - Test history and trends
- `/treatments` - Treatment product recommendations based on test results

#### Maintenance
- `/reminders` - Water change and maintenance reminders

### 🤖 AI-Powered Tools

#### Discovery Hub
- `/aiquarium-tools` - Central hub for all AI tools

#### Product Finders
- `/fish-finder` - Find fish and invertebrates from multiple sources
- `/plant-finder` - Search for aquatic plants
- `/tank-finder` - Find aquarium tanks by specifications
- `/filtration-finder` - Search for filters by type/brand/size
- `/lighting-finder` - Find aquarium lighting solutions

### 🛒 Marketplace & Commerce

#### Marketplace
- `/marketplace` - Marketplace homepage
- `/marketplace/featured` - Featured listings
- `/marketplace/[categorySlug]` - Browse by category:
  - `/marketplace/fish` - Live fish listings
  - `/marketplace/plants` - Aquatic plants
  - `/marketplace/equipment` - Tanks, filters, lights, etc.
  - `/marketplace/supplies` - Food, treatments, accessories
- `/marketplace/[categorySlug]/[listingSlug]` - Individual listing details

#### Seller Features
- `/marketplace/add-listing` - Create new listing (approved sellers only)
- `/marketplace/apply-to-sell` - Seller application form
- `/marketplace/purchase-featured-listing` - Promote listings
- `/my-listings` - Manage seller listings (planned)

#### Shopping Tools
- `/foods` - Food recommendations and guides
- `/discounts-deals` - Current deals and promotions
- `/items-wanted` - Post and browse wanted items

### 👥 Community Features

#### Q&A Forum
- `/qa` - Question & Answer forum homepage
- `/qa/[categorySlug]` - Browse by category:
  - `/qa/freshwater` - Freshwater aquarium questions
  - `/qa/saltwater` - Marine aquarium questions
  - `/qa/planted` - Planted tank questions
  - `/qa/equipment` - Equipment and technical questions
  - `/qa/health` - Fish health and disease questions

#### Local Resources
- `/local-fish-stores` - Find local fish stores
- `/local-fish-stores/[storeSlug]` - Store details and information

### 🔐 Authentication (Planned)

- `/signin` - User sign in
- `/signup` - New user registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation

### 📱 Additional Pages (Planned)

- `/contact` - Contact form and support
- `/notification-settings` - Manage alerts and notifications
- `/privacy` - Privacy policy
- `/terms` - Terms of service

## User Flow Paths

### New User Journey
1. `/` → `/signup` → `/dashboard` → `/aquariums` (add first tank)
2. `/analyze` → `/treatments` (first water test)
3. `/aiquarium-tools` → `/fish-finder` (stock tank)

### Returning User Flow
1. `/signin` → `/dashboard`
2. `/analyze` → `/history` (track progress)
3. `/marketplace` → `/marketplace/[category]` → purchase

### Seller Journey
1. `/marketplace` → `/marketplace/apply-to-sell`
2. (After approval) → `/marketplace/add-listing`
3. `/my-listings` → manage inventory

## Mobile Navigation Priority

Primary mobile nav items:
1. Dashboard
2. Analyze (water testing)
3. AI Tools
4. Marketplace
5. Profile

## SEO-Friendly URL Guidelines

- Use lowercase letters and hyphens
- Keep URLs descriptive but concise
- Include relevant keywords where appropriate
- Maintain consistent naming conventions
- Use plural forms for list pages (e.g., /aquariums, /foods)
- Use singular forms for individual items (e.g., /aquarium/123)