# Neon PostgreSQL Setup Guide

This guide will help you set up a free Neon PostgreSQL database for AquaDex.

## Why Neon?

Neon is a serverless PostgreSQL database that offers:
- ✅ **Free tier** with generous limits (0.5 GB storage, 10 GB data transfer/month)
- ✅ **Serverless** - no infrastructure to manage
- ✅ **Cloud-hosted** - accessible from anywhere
- ✅ **Fully compatible** with PostgreSQL
- ✅ **Auto-scaling** and branching capabilities

## Setup Steps

### 1. Create a Neon Account

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub, Google, or email
3. Verify your email address

### 2. Create Your First Project

1. Click **"Create a project"**
2. Enter project details:
   - **Name**: `aquadex` (or your preferred name)
   - **Region**: Choose closest to your users
   - **PostgreSQL version**: 16 (latest recommended)
3. Click **"Create project"**

### 3. Get Your Connection String

After project creation, you'll see your connection string:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Important**: Copy this connection string immediately - the password is only shown once!

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Neon connection string:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

### 5. Install Required Packages

Install the PostgreSQL client library:

```bash
npm install pg
npm install @types/pg --save-dev
```

For an ORM (recommended), install Prisma or Drizzle:

```bash
# Option 1: Prisma (more mature, great tooling)
npm install prisma @prisma/client
npx prisma init

# Option 2: Drizzle (lightweight, TypeScript-first)
npm install drizzle-orm postgres
npm install drizzle-kit --save-dev
```

### 6. Create Database Schema

#### Using Prisma:

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  displayName String?
  photoURL    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  aquariums   Aquarium[]
}

model Aquarium {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        String   // freshwater, saltwater, planted
  size        Float    // in gallons
  setupDate   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
  tests       WaterTest[]
}

model WaterTest {
  id          String   @id @default(uuid())
  aquariumId  String
  parameters  Json     // Store test results as JSON
  imageUrl    String?
  testDate    DateTime @default(now())
  
  aquarium    Aquarium @relation(fields: [aquariumId], references: [id])
}
```

2. Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Using Drizzle:

1. Create `src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, real, uuid, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aquariums = pgTable('aquariums', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: real('size').notNull(),
  setupDate: timestamp('setup_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const waterTests = pgTable('water_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  aquariumId: uuid('aquarium_id').notNull().references(() => aquariums.id),
  parameters: json('parameters').notNull(),
  imageUrl: text('image_url'),
  testDate: timestamp('test_date').defaultNow(),
});
```

2. Run migrations:

```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

### 7. Test Your Connection

Create `src/lib/db.ts`:

#### Prisma:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

#### Drizzle:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client);
```

### 8. Verify Setup

Create a simple test script `scripts/test-db.ts`:

```typescript
import { db } from '../src/lib/db';

async function testConnection() {
  try {
    // Prisma
    const userCount = await db.user.count();
    console.log('✅ Database connected! Users:', userCount);
    
    // Or Drizzle
    // const users = await db.select().from(users);
    // console.log('✅ Database connected! Users:', users.length);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
```

Run it:
```bash
npx tsx scripts/test-db.ts
```

## Neon Dashboard Features

### Monitor Your Database

1. **Queries**: View active and historical queries
2. **Storage**: Monitor database size and usage
3. **Branches**: Create database branches for testing
4. **Settings**: Manage compute resources and auto-suspend settings

### Free Tier Limits

- Storage: 0.5 GB
- Data Transfer: 10 GB/month
- Compute Time: 100 hours/month
- Projects: 1 project
- Branches: Unlimited

### Auto-Suspend

Neon automatically suspends your database after 5 minutes of inactivity (configurable). This helps save compute hours on the free tier.

## Troubleshooting

### Connection Timeout

If you experience connection timeouts:
1. Check your connection string is correct
2. Ensure `sslmode=require` is in the connection string
3. Verify your IP isn't blocked (Neon allows all IPs by default)

### Migration Errors

If migrations fail:
1. Check your DATABASE_URL in `.env.local`
2. Ensure the database exists in Neon console
3. Verify you have write permissions

### Pool Exhaustion

If you see "too many clients" errors:
1. Use connection pooling
2. Add `?connection_limit=5` to your connection string
3. Close connections properly in API routes

## Next Steps

1. ✅ Set up authentication (Firebase Auth)
2. ✅ Create API routes in `src/app/api/`
3. ✅ Build server actions in `src/lib/actions.ts`
4. ✅ Implement data models matching your schema

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Drizzle Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
