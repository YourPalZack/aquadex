# Phase 1: Data Model & Database Schema

**Feature**: Comprehensive Aquarium Management Toolkit  
**Date**: 2025-10-20  
**Database**: Neon PostgreSQL with Drizzle ORM

## Overview

This document defines the complete database schema for all 8 user stories in the aquarium toolkit. The schema uses PostgreSQL on Neon with Drizzle ORM for type-safe access.

## Entity Relationship Diagram

```
User (Supabase Auth)
  ↓ 1:N
Aquarium
  ↓ 1:N
  ├── WaterTest
  ├── Livestock
  ├── Equipment
  └── MaintenanceTask

WaterTest
  ↓ 1:N
  └── TreatmentRecommendation

User
  ↓ 1:N
  ├── Question
  ├── Answer
  ├── MarketplaceListing
  └── Message

Question
  ↓ 1:N
  └── Answer
```

## Core Entities

### 1. User (Managed by Supabase Auth)

**Purpose**: Represents fishkeepers using the platform

**Supabase Auth Fields** (managed automatically):
- `id` (UUID): Primary key
- `email` (string): User's email
- `created_at` (timestamp): Account creation date
- `email_confirmed_at` (timestamp): Email verification date

**Extended Profile** (our table):

```typescript
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey().references(() => supabaseAuthUsers.id),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  location: text('location'),
  bio: text('bio'),
  reputationScore: integer('reputation_score').default(0),
  notificationPreferences: json('notification_preferences').$type<{
    email: boolean
    inApp: boolean
    reminders: boolean
    community: boolean
  }>().default({ email: true, inApp: true, reminders: true, community: true }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `display_name` (for user search)

**Relationships**:
- 1:N with `aquariums`
- 1:N with `questions`
- 1:N with `answers`
- 1:N with `marketplace_listings`

### 2. Aquarium

**Purpose**: Represents a fish tank profile with specifications and current status

```typescript
export const aquariums = pgTable('aquariums', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  size: real('size').notNull(), // in gallons
  sizeUnit: text('size_unit').notNull().default('gallons'), // or 'liters'
  type: text('type').notNull(), // freshwater, saltwater, planted, reef
  setupDate: timestamp('setup_date').notNull(),
  location: text('location'), // room/building where tank is located
  description: text('description'),
  imageUrls: json('image_urls').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `user_id` (for user's aquarium list)
- Index: `user_id, is_active` (for active aquariums)

**Validation Rules**:
- `name`: 1-100 characters
- `size`: > 0
- `type`: enum ['freshwater', 'saltwater', 'planted', 'reef']
- `sizeUnit`: enum ['gallons', 'liters']

**Relationships**:
- N:1 with `user_profiles`
- 1:N with `water_tests`
- 1:N with `livestock`
- 1:N with `equipment`
- 1:N with `maintenance_tasks`

### 3. WaterTest

**Purpose**: Stores water quality test results with AI analysis confidence scores

```typescript
export const waterTests = pgTable('water_tests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  testDate: timestamp('test_date').defaultNow(),
  
  // Water parameters
  parameters: json('parameters').$type<{
    ph?: { value: number; confidence: number }
    ammonia?: { value: number; confidence: number }
    nitrite?: { value: number; confidence: number }
    nitrate?: { value: number; confidence: number }
    kh?: { value: number; confidence: number }
    gh?: { value: number; confidence: number }
    chlorine?: { value: number; confidence: number }
    temperature?: { value: number; confidence: number }
  }>().notNull(),
  
  // Analysis metadata
  imageUrl: text('image_url'), // Supabase Storage URL
  stripBrand: text('strip_brand'), // e.g., 'API', 'Tetra', 'Seachem'
  entryMethod: text('entry_method').notNull(), // 'ai' or 'manual'
  overallConfidence: real('overall_confidence'), // 0-1 for AI analysis
  
  // User notes
  notes: text('notes'),
  
  // Status indicators (computed from parameters)
  hasWarnings: boolean('has_warnings').default(false),
  hasCritical: boolean('has_critical').default(false),
  
  createdAt: timestamp('created_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `aquarium_id, test_date DESC` (for test history)
- Index: `aquarium_id, has_critical` (for finding problems)

**Validation Rules**:
- `parameters`: At least one parameter must be present
- `entryMethod`: enum ['ai', 'manual']
- `overallConfidence`: 0-1 (nullable for manual entries)
- Parameter values must be within realistic ranges (e.g., pH 0-14)

**Relationships**:
- N:1 with `aquariums`
- 1:N with `treatment_recommendations`

### 4. TreatmentRecommendation

**Purpose**: AI-generated treatment suggestions linked to water test results

```typescript
export const treatmentRecommendations = pgTable('treatment_recommendations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  waterTestId: text('water_test_id').notNull().references(() => waterTests.id, { onDelete: 'cascade' }),
  
  // Issue identification
  parameter: text('parameter').notNull(), // e.g., 'ammonia', 'ph'
  issue: text('issue').notNull(), // e.g., 'Elevated ammonia'
  severity: text('severity').notNull(), // 'warning' or 'critical'
  
  // Treatment details
  productName: text('product_name').notNull(),
  productType: text('product_type').notNull(), // 'water_conditioner', 'bacteria', etc.
  dosageCalculation: text('dosage_calculation').notNull(),
  instructions: text('instructions').notNull(),
  
  // Safety and compatibility
  safetyWarnings: json('safety_warnings').$type<string[]>().default([]),
  compatibilityNotes: text('compatibility_notes'),
  
  // Purchase information
  purchaseLinks: json('purchase_links').$type<{
    vendor: string
    url: string
    price?: string
  }[]>().default([]),
  
  // Priority for multiple issues
  priority: integer('priority').notNull(), // 1-5, lower is higher priority
  
  createdAt: timestamp('created_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `water_test_id, priority` (for ordered recommendations)

**Validation Rules**:
- `severity`: enum ['warning', 'critical']
- `priority`: 1-5

**Relationships**:
- N:1 with `water_tests`

### 5. Livestock

**Purpose**: Tracks fish, invertebrates, plants, and coral in aquariums

```typescript
export const livestock = pgTable('livestock', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  type: text('type').notNull(), // fish, invertebrate, plant, coral
  speciesName: text('species_name').notNull(),
  commonName: text('common_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  
  dateAdded: timestamp('date_added').defaultNow(),
  source: text('source'), // e.g., 'Local Fish Store', 'Online'
  notes: text('notes'),
  imageUrl: text('image_url'),
  
  isAlive: boolean('is_alive').default(true),
  dateRemoved: timestamp('date_removed'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `aquarium_id, is_alive` (for current inhabitants)
- Index: `type` (for filtering by type)

**Validation Rules**:
- `type`: enum ['fish', 'invertebrate', 'plant', 'coral']
- `quantity`: > 0

**Relationships**:
- N:1 with `aquariums`

### 6. Equipment

**Purpose**: Tracks aquarium equipment with maintenance history

```typescript
export const equipment = pgTable('equipment', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  type: text('type').notNull(), // filter, heater, light, pump, skimmer, etc.
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  
  installDate: timestamp('install_date').notNull(),
  lastServiceDate: timestamp('last_service_date'),
  
  specifications: json('specifications').$type<{
    wattage?: number
    flowRate?: number
    capacity?: number
    [key: string]: any
  }>(),
  
  notes: text('notes'),
  imageUrl: text('image_url'),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `aquarium_id, is_active` (for active equipment)
- Index: `type` (for filtering by type)

**Validation Rules**:
- `type`: enum ['filter', 'heater', 'light', 'pump', 'skimmer', 'co2', 'wavemaker', 'other']

**Relationships**:
- N:1 with `aquariums`

### 7. MaintenanceTask

**Purpose**: Recurring maintenance reminders with completion tracking

```typescript
export const maintenanceTasks = pgTable('maintenance_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  taskType: text('task_type').notNull(), // water_change, filter_clean, test_water, etc.
  title: text('title').notNull(),
  description: text('description'),
  
  // Scheduling
  frequencyDays: integer('frequency_days').notNull(), // recurrence interval
  lastCompletedDate: timestamp('last_completed_date'),
  nextDueDate: timestamp('next_due_date').notNull(),
  
  // Notification settings
  enabled: boolean('enabled').default(true),
  notifyDaysBefore: integer('notify_days_before').default(1),
  
  // Completion history (recent completions)
  completionHistory: json('completion_history').$type<{
    date: string
    notes?: string
  }[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `aquarium_id, enabled` (for active reminders)
- Index: `next_due_date, enabled` (for finding due tasks)

**Validation Rules**:
- `taskType`: enum ['water_change', 'filter_clean', 'test_water', 'glass_clean', 'trim_plants', 'dose_fertilizer', 'check_equipment', 'other']
- `frequencyDays`: > 0
- `notifyDaysBefore`: >= 0

**Relationships**:
- N:1 with `aquariums`

## Community Features

### 8. Question

**Purpose**: Community Q&A forum questions

```typescript
export const questions = pgTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  authorId: text('author_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: json('tags').$type<string[]>().default([]),
  
  // Engagement metrics
  viewCount: integer('view_count').default(0),
  voteCount: integer('vote_count').default(0),
  answerCount: integer('answer_count').default(0),
  
  // Status
  hasAcceptedAnswer: boolean('has_accepted_answer').default(false),
  acceptedAnswerId: text('accepted_answer_id'),
  
  // Moderation
  isReported: boolean('is_reported').default(false),
  isHidden: boolean('is_hidden').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActivityAt: timestamp('last_activity_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `author_id` (for user's questions)
- Index: `last_activity_at DESC` (for recent questions feed)
- Index: `vote_count DESC` (for popular questions)
- Full-text search: `title, content` (PostgreSQL full-text search)

**Validation Rules**:
- `title`: 10-200 characters
- `content`: 20-10000 characters
- `tags`: max 5 tags

**Relationships**:
- N:1 with `user_profiles`
- 1:N with `answers`

### 9. Answer

**Purpose**: Responses to community questions

```typescript
export const answers = pgTable('answers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  content: text('content').notNull(),
  
  // Engagement
  voteCount: integer('vote_count').default(0),
  isAccepted: boolean('is_accepted').default(false),
  
  // Moderation
  isReported: boolean('is_reported').default(false),
  isHidden: boolean('is_hidden').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `question_id, vote_count DESC` (for sorted answers)
- Index: `author_id` (for user's answers)
- Index: `is_accepted` (for accepted answers)

**Validation Rules**:
- `content`: 20-10000 characters

**Relationships**:
- N:1 with `questions`
- N:1 with `user_profiles`

## Marketplace Features

### 10. MarketplaceListing

**Purpose**: Items for sale or trade in the marketplace

```typescript
export const marketplaceListings = pgTable('marketplace_listings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sellerId: text('seller_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // fish, plant, equipment, tank, accessory
  subcategory: text('subcategory'), // e.g., 'cichlid', 'LED_light', etc.
  
  price: real('price').notNull(),
  currency: text('currency').default('USD'),
  condition: text('condition').notNull(), // new, like_new, good, fair
  
  // Media
  imageUrls: json('image_urls').$type<string[]>().default([]),
  
  // Location
  location: text('location').notNull(), // city, state
  willingToShip: boolean('willing_to_ship').default(false),
  
  // Status
  status: text('status').default('active'), // active, sold, expired, removed
  viewCount: integer('view_count').default(0),
  
  // Moderation
  isVerified: boolean('is_verified').default(false),
  isReported: boolean('is_reported').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at') // auto-expire after 90 days
})
```

**Indexes**:
- Primary: `id`
- Index: `seller_id, status` (for seller's listings)
- Index: `category, status, created_at DESC` (for browsing)
- Index: `status, expires_at` (for cleanup)
- Full-text search: `title, description`

**Validation Rules**:
- `title`: 10-100 characters
- `description`: 20-2000 characters
- `category`: enum ['fish', 'plant', 'equipment', 'tank', 'accessory', 'other']
- `condition`: enum ['new', 'like_new', 'good', 'fair']
- `status`: enum ['active', 'sold', 'expired', 'removed']
- `price`: >= 0

**Relationships**:
- N:1 with `user_profiles`
- 1:N with `messages`

### 11. Message

**Purpose**: Communication between users about marketplace listings

```typescript
export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  senderId: text('sender_id').notNull().references(() => userProfiles.id),
  recipientId: text('recipient_id').notNull().references(() => userProfiles.id),
  listingId: text('listing_id').references(() => marketplaceListings.id, { onDelete: 'set null' }),
  
  subject: text('subject'),
  content: text('content').notNull(),
  
  isRead: boolean('is_read').default(false),
  isArchived: boolean('is_archived').default(false),
  
  createdAt: timestamp('created_at').defaultNow()
})
```

**Indexes**:
- Primary: `id`
- Index: `recipient_id, is_read` (for unread messages)
- Index: `sender_id, recipient_id, created_at DESC` (for conversations)
- Index: `listing_id` (for listing-related messages)

**Validation Rules**:
- `content`: 1-2000 characters

**Relationships**:
- N:1 with `user_profiles` (sender)
- N:1 with `user_profiles` (recipient)
- N:1 with `marketplace_listings` (optional)

## Drizzle Schema File Structure

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, real, integer, boolean, json } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Export all tables
export const userProfiles = pgTable('user_profiles', { /* ... */ })
export const aquariums = pgTable('aquariums', { /* ... */ })
export const waterTests = pgTable('water_tests', { /* ... */ })
export const treatmentRecommendations = pgTable('treatment_recommendations', { /* ... */ })
export const livestock = pgTable('livestock', { /* ... */ })
export const equipment = pgTable('equipment', { /* ... */ })
export const maintenanceTasks = pgTable('maintenance_tasks', { /* ... */ })
export const questions = pgTable('questions', { /* ... */ })
export const answers = pgTable('answers', { /* ... */ })
export const marketplaceListings = pgTable('marketplace_listings', { /* ... */ })
export const messages = pgTable('messages', { /* ... */ })

// Export types
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
// ... repeat for all tables
```

## Migration Strategy

1. **Initial Migration**: Create all tables with indexes
2. **Supabase RLS**: Enable Row Level Security policies
3. **Seed Data**: Optional test data for development
4. **Future Migrations**: Add columns/indexes as needed

## Row Level Security (Supabase)

While using Neon for data storage, we'll sync RLS-like policies through application logic:

```typescript
// Example: User can only see their own aquariums
export async function getUserAquariums(userId: string) {
  return await db.select()
    .from(aquariums)
    .where(eq(aquariums.userId, userId))
}
```

## Next Steps

1. Generate Drizzle schema in `lib/db/schema.ts`
2. Run initial migration: `drizzle-kit generate:pg && drizzle-kit push:pg`
3. Create seed data script for development
4. Proceed to API contracts (contracts/*.yaml)
