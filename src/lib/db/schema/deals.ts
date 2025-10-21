/**
 * Drizzle ORM Schema: Deals Table
 * Local Fish Store Directory Feature
 */

import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, date, integer, index, foreignKey } from 'drizzle-orm/pg-core';
import { stores } from './stores';

export const deals = pgTable(
  'deals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    store_id: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    
    // Deal details
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    
    // Discount information
    discount_type: varchar('discount_type', { length: 20 }).notNull(),
    discount_value: decimal('discount_value', { precision: 10, scale: 2 }),
    original_price: decimal('original_price', { precision: 10, scale: 2 }),
    sale_price: decimal('sale_price', { precision: 10, scale: 2 }),
    terms_conditions: text('terms_conditions'),
    
    // Validity period
    start_date: date('start_date').notNull(),
    end_date: date('end_date').notNull(),
    
    // Status
    is_active: boolean('is_active').notNull().default(true),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    
    // Analytics
    view_count: integer('view_count').notNull().default(0),
    
    // Timestamps
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    storeIdIdx: index('deals_store_id_idx').on(table.store_id),
    statusEndDateIdx: index('deals_status_end_date_idx').on(table.status, table.end_date),
    endDateIdx: index('deals_end_date_idx').on(table.end_date),
    createdAtIdx: index('deals_created_at_idx').on(table.created_at),
  })
);

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
