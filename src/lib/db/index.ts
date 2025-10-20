import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';
import ws from 'ws';

// Configure Neon to use WebSocket
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool with specified limits
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum 10 connections
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export types for use in application
export type Database = typeof db;
