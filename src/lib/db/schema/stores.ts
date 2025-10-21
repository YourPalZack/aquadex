/**
 * Drizzle ORM Schema: Stores Table
 * Local Fish Store Directory Feature
 */

import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const stores = pgTable(
  'stores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull().unique(),
    business_name: varchar('business_name', { length: 200 }).notNull().unique(),
    slug: varchar('slug', { length: 250 }).notNull().unique(),
    
    // Location fields
    street_address: varchar('street_address', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 2 }).notNull(),
    postal_code: varchar('postal_code', { length: 10 }).notNull(),
    country: varchar('country', { length: 2 }).notNull().default('US'),
    // Note: location is GEOGRAPHY(POINT, 4326) - handled by raw SQL in migrations
    latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
    longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
    
    // Contact fields
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    website: varchar('website', { length: 500 }),
    social_links: jsonb('social_links').$type<{
      facebook?: string;
      instagram?: string;
      twitter?: string;
    }>(),
    
    // Business details
    description: text('description'),
    business_hours: jsonb('business_hours').$type<{
      monday: { open: string; close: string; closed?: boolean };
      tuesday: { open: string; close: string; closed?: boolean };
      wednesday: { open: string; close: string; closed?: boolean };
      thursday: { open: string; close: string; closed?: boolean };
      friday: { open: string; close: string; closed?: boolean };
      saturday: { open: string; close: string; closed?: boolean };
      sunday: { open: string; close: string; closed?: boolean };
    }>().notNull(),
    categories: text('categories').array().notNull(),
    payment_methods: text('payment_methods').array(),
    
    // Media
    profile_image_url: varchar('profile_image_url', { length: 500 }),
    gallery_images: text('gallery_images').array().notNull().default(sql`ARRAY[]::text[]`),
    
    // Status fields
    verification_status: varchar('verification_status', { length: 20 }).notNull().default('pending'),
    verified_at: timestamp('verified_at', { withTimezone: true }),
    is_active: boolean('is_active').notNull().default(true),
    
    // Timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index('stores_slug_idx').on(table.slug),
    cityStateIdx: index('stores_city_state_idx').on(table.city, table.state),
    verificationStatusIdx: index('stores_verification_status_idx').on(table.verification_status),
    userIdIdx: index('stores_user_id_idx').on(table.user_id),
  })
);

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
