import { pgTable, text, timestamp, real, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// User Profiles (extends Supabase Auth)
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  location: text('location'),
  bio: text('bio'),
  role: text('role').notNull().default('standard'), // standard, verified_seller, moderator, admin
  reputationScore: integer('reputation_score').default(0).notNull(),
  notificationPreferences: json('notification_preferences').$type<{
    email: boolean;
    inApp: boolean;
    reminders: boolean;
    community: boolean;
  }>().default({ email: true, inApp: true, reminders: true, community: true }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Aquariums
export const aquariums = pgTable('aquariums', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  size: real('size').notNull(),
  sizeUnit: text('size_unit').notNull().default('gallons'), // gallons or liters
  type: text('type').notNull(), // freshwater, saltwater, planted, reef
  setupDate: timestamp('setup_date').notNull(),
  location: text('location'),
  description: text('description'),
  imageUrls: json('image_urls').$type<string[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Water Tests
export const waterTests = pgTable('water_tests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  testDate: timestamp('test_date').defaultNow().notNull(),
  
  // Water parameters with confidence scores
  parameters: json('parameters').$type<{
    ph?: { value: number; confidence: number };
    ammonia?: { value: number; confidence: number };
    nitrite?: { value: number; confidence: number };
    nitrate?: { value: number; confidence: number };
    kh?: { value: number; confidence: number };
    gh?: { value: number; confidence: number };
    chlorine?: { value: number; confidence: number };
    temperature?: { value: number; confidence: number };
  }>().notNull(),
  
  // Analysis metadata
  imageUrl: text('image_url'),
  stripBrand: text('strip_brand'),
  entryMethod: text('entry_method').notNull(), // ai or manual
  overallConfidence: real('overall_confidence'),
  
  // User notes
  notes: text('notes'),
  
  // Status indicators
  hasWarnings: boolean('has_warnings').default(false).notNull(),
  hasCritical: boolean('has_critical').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Treatment Recommendations
export const treatmentRecommendations = pgTable('treatment_recommendations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  waterTestId: text('water_test_id').notNull().references(() => waterTests.id, { onDelete: 'cascade' }),
  
  // Issue identification
  parameter: text('parameter').notNull(),
  issue: text('issue').notNull(),
  severity: text('severity').notNull(), // warning or critical
  
  // Treatment details
  productName: text('product_name').notNull(),
  productType: text('product_type').notNull(),
  dosageCalculation: text('dosage_calculation').notNull(),
  instructions: text('instructions').notNull(),
  
  // Safety and compatibility
  safetyWarnings: json('safety_warnings').$type<string[]>().default([]).notNull(),
  compatibilityNotes: text('compatibility_notes'),
  
  // Purchase information
  purchaseLinks: json('purchase_links').$type<{
    vendor: string;
    url: string;
    price?: string;
  }[]>().default([]).notNull(),
  
  // Priority for multiple issues
  priority: integer('priority').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Livestock
export const livestock = pgTable('livestock', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  type: text('type').notNull(), // fish, invertebrate, plant, coral
  speciesName: text('species_name').notNull(),
  commonName: text('common_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  
  dateAdded: timestamp('date_added').defaultNow().notNull(),
  source: text('source'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  
  isAlive: boolean('is_alive').default(true).notNull(),
  dateRemoved: timestamp('date_removed'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Equipment
export const equipment = pgTable('equipment', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  type: text('type').notNull(), // filter, heater, light, pump, skimmer, etc.
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  
  installDate: timestamp('install_date').notNull(),
  lastServiceDate: timestamp('last_service_date'),
  
  specifications: json('specifications').$type<{
    wattage?: number;
    flowRate?: number;
    capacity?: number;
    [key: string]: any;
  }>(),
  
  notes: text('notes'),
  imageUrl: text('image_url'),
  
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Maintenance Tasks
export const maintenanceTasks = pgTable('maintenance_tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  aquariumId: text('aquarium_id').notNull().references(() => aquariums.id, { onDelete: 'cascade' }),
  
  taskType: text('task_type').notNull(), // water_change, filter_clean, test_water, etc.
  title: text('title').notNull(),
  description: text('description'),
  
  // Scheduling
  frequencyDays: integer('frequency_days').notNull(),
  lastCompletedDate: timestamp('last_completed_date'),
  nextDueDate: timestamp('next_due_date').notNull(),
  
  // Notification settings
  enabled: boolean('enabled').default(true).notNull(),
  notifyDaysBefore: integer('notify_days_before').default(1).notNull(),
  
  // Completion history
  completionHistory: json('completion_history').$type<{
    date: string;
    notes?: string;
  }[]>().default([]).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Questions (Community)
export const questions = pgTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  authorId: text('author_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: json('tags').$type<string[]>().default([]).notNull(),
  
  // Engagement metrics
  viewCount: integer('view_count').default(0).notNull(),
  voteCount: integer('vote_count').default(0).notNull(),
  answerCount: integer('answer_count').default(0).notNull(),
  
  // Status
  hasAcceptedAnswer: boolean('has_accepted_answer').default(false).notNull(),
  acceptedAnswerId: text('accepted_answer_id'),
  
  // Moderation
  isReported: boolean('is_reported').default(false).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});

// Answers (Community)
export const answers = pgTable('answers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  content: text('content').notNull(),
  
  // Engagement
  voteCount: integer('vote_count').default(0).notNull(),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  
  // Moderation
  isReported: boolean('is_reported').default(false).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Marketplace Listings
export const marketplaceListings = pgTable('marketplace_listings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sellerId: text('seller_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // fish, plant, equipment, tank, accessory
  subcategory: text('subcategory'),
  
  price: real('price').notNull(),
  currency: text('currency').default('USD').notNull(),
  condition: text('condition').notNull(), // new, like_new, good, fair
  
  // Media
  imageUrls: json('image_urls').$type<string[]>().default([]).notNull(),
  
  // Location
  location: text('location').notNull(),
  willingToShip: boolean('willing_to_ship').default(false).notNull(),
  
  // Status
  status: text('status').default('active').notNull(), // active, sold, expired, removed
  viewCount: integer('view_count').default(0).notNull(),
  
  // Moderation
  isVerified: boolean('is_verified').default(false).notNull(),
  isReported: boolean('is_reported').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Messages
export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  senderId: text('sender_id').notNull().references(() => userProfiles.id),
  recipientId: text('recipient_id').notNull().references(() => userProfiles.id),
  listingId: text('listing_id').references(() => marketplaceListings.id, { onDelete: 'set null' }),
  
  subject: text('subject'),
  content: text('content').notNull(),
  
  isRead: boolean('is_read').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
