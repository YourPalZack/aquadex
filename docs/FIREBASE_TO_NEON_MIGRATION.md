# Firebase to Neon Migration Guide

This guide helps transition AquaDex from a Firebase-only architecture to a hybrid architecture using Neon PostgreSQL for structured data while maintaining Firebase for authentication and file storage.

## Architecture Overview

### Before (Firebase-Only)
```
User ──→ Firebase Auth ──→ Firestore
                      ──→ Firebase Storage
```

### After (Hybrid)
```
User ──→ Firebase Auth ──→ Neon PostgreSQL (structured data)
                      ──→ Firebase Storage (images)
```

## What Stays in Firebase

✅ **Keep in Firebase:**
- **Authentication** - Firebase Auth is excellent and free
- **File Storage** - Firebase Storage for images (test strips, photos)
- **Hosting** - Firebase App Hosting (optional)

## What Moves to Neon

📦 **Move to Neon PostgreSQL:**
- User profiles (linked to Firebase Auth UIDs)
- Aquarium data and parameters
- Water test results (with Firebase Storage URLs for images)
- Marketplace listings
- Q&A forum posts and answers
- Reminders and maintenance logs

## Why This Architecture?

### Benefits
1. **Relational Data** - Better for complex queries and joins
2. **Type Safety** - First-class TypeScript support with Prisma/Drizzle
3. **Cost Efficiency** - Free Neon tier is generous for startups
4. **Performance** - Faster queries for complex data relationships
5. **Flexibility** - SQL for complex analytics and reports

### Trade-offs
1. **Two Systems** - Manage both Firebase and Neon
2. **Complexity** - Coordination between auth and database
3. **Real-time** - Less built-in real-time than Firestore (can use polling or websockets)

## Migration Strategy

### Phase 1: Setup (No Breaking Changes)

1. **Set up Neon database** (see [NEON_SETUP.md](./NEON_SETUP.md))
2. **Install ORM** (Prisma or Drizzle)
3. **Create database schema** matching existing Firestore structure
4. **Keep Firebase auth** as-is

### Phase 2: Dual-Write (Parallel Operation)

Write to both databases during transition:

```typescript
// Example: Creating a user
async function createUser(firebaseUser: User) {
  // Write to Firebase (existing)
  await setDoc(doc(firestore, 'users', firebaseUser.uid), {
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
  });
  
  // Also write to Neon (new)
  await db.user.create({
    data: {
      id: firebaseUser.uid, // Use Firebase UID as primary key
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
    },
  });
}
```

### Phase 3: Data Migration

Migrate existing data from Firestore to Neon:

```typescript
// scripts/migrate-firestore-to-neon.ts
import { firestore, db } from '../src/lib';
import { collection, getDocs } from 'firebase/firestore';

async function migrateUsers() {
  const usersSnapshot = await getDocs(collection(firestore, 'users'));
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    
    await db.user.upsert({
      where: { id: doc.id },
      update: {
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
      },
      create: {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate(),
      },
    });
  }
  
  console.log(`Migrated ${usersSnapshot.size} users`);
}

async function migrateAquariums() {
  // Similar pattern for aquariums
}

// Run all migrations
async function migrate() {
  await migrateUsers();
  await migrateAquariums();
  // ... other collections
}

migrate().catch(console.error);
```

### Phase 4: Switch Reads to Neon

Update queries to read from Neon:

```typescript
// Before: Firestore
const userDoc = await getDoc(doc(firestore, 'users', userId));
const user = userDoc.data();

// After: Neon
const user = await db.user.findUnique({
  where: { id: userId },
});
```

### Phase 5: Remove Firestore Writes

Once confident Neon is working:
1. Stop dual-writing
2. Remove Firestore write code
3. Keep only Firebase Auth and Storage

## Implementation Example

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Users table - linked to Firebase Auth
model User {
  id          String   @id // Firebase Auth UID
  email       String   @unique
  displayName String?
  photoURL    String?  // Firebase Storage URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  aquariums   Aquarium[]
  listings    MarketplaceListing[]
  questions   Question[]
  answers     Answer[]
}

model Aquarium {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        String   // freshwater, saltwater, planted
  size        Float    // gallons
  setupDate   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tests       WaterTest[]
  reminders   Reminder[]
  
  @@index([userId])
}

model WaterTest {
  id          String   @id @default(uuid())
  aquariumId  String
  parameters  Json     // { ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 20 }
  imageUrl    String?  // Firebase Storage URL
  testDate    DateTime @default(now())
  notes       String?
  
  aquarium    Aquarium @relation(fields: [aquariumId], references: [id], onDelete: Cascade)
  
  @@index([aquariumId])
  @@index([testDate])
}

model MarketplaceListing {
  id          String   @id @default(uuid())
  userId      String
  title       String
  description String
  price       Float
  category    String
  imageUrls   String[] // Array of Firebase Storage URLs
  status      String   @default("active") // active, sold, expired
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([category])
  @@index([status])
}

model Question {
  id          String   @id @default(uuid())
  userId      String
  title       String
  content     String
  tags        String[]
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers     Answer[]
  
  @@index([userId])
  @@index([createdAt])
}

model Answer {
  id          String   @id @default(uuid())
  questionId  String
  userId      String
  content     String
  isAccepted  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([questionId])
  @@index([userId])
}

model Reminder {
  id          String   @id @default(uuid())
  aquariumId  String
  type        String   // water_change, filter_clean, test_water
  frequency   Int      // days
  lastDone    DateTime
  nextDue     DateTime
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  aquarium    Aquarium @relation(fields: [aquariumId], references: [id], onDelete: Cascade)
  
  @@index([aquariumId])
  @@index([nextDue])
}
```

### Authentication Integration

```typescript
// src/lib/auth.ts
import { auth } from './firebase';
import { db } from './db';
import { onAuthStateChanged } from 'firebase/auth';

// Sync Firebase Auth with Neon
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Ensure user exists in Neon
    await db.user.upsert({
      where: { id: firebaseUser.uid },
      update: {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      },
      create: {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      },
    });
  }
});
```

### Server Actions Example

```typescript
// src/lib/actions/aquariums.ts
'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function createAquarium(
  userId: string,
  data: {
    name: string;
    type: string;
    size: number;
    setupDate: Date;
  }
) {
  // Verify user is authenticated (check Firebase token)
  // This would be done via middleware or session
  
  const aquarium = await db.aquarium.create({
    data: {
      userId,
      ...data,
    },
  });
  
  revalidatePath('/aquariums');
  return aquarium;
}

export async function getAquariumsForUser(userId: string) {
  return await db.aquarium.findMany({
    where: { userId },
    include: {
      tests: {
        orderBy: { testDate: 'desc' },
        take: 5, // Last 5 tests
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

## File Storage Pattern

Continue using Firebase Storage for images, but store URLs in Neon:

```typescript
// Upload image to Firebase Storage
async function uploadTestStripImage(
  file: File,
  aquariumId: string
): Promise<string> {
  const storage = getStorage();
  const path = `test-strips/${aquariumId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  // Store URL in Neon
  await db.waterTest.create({
    data: {
      aquariumId,
      imageUrl: url, // Firebase Storage URL
      parameters: {}, // Will be populated by AI
    },
  });
  
  return url;
}
```

## Testing the Migration

### 1. Test User Creation
```typescript
// Create user in Firebase Auth
const userCredential = await createUserWithEmailAndPassword(
  auth,
  'test@example.com',
  'password'
);

// Verify user exists in Neon
const neonUser = await db.user.findUnique({
  where: { id: userCredential.user.uid },
});

console.assert(neonUser !== null, 'User should exist in Neon');
```

### 2. Test Data Flow
```typescript
// Create aquarium → read back → verify
const aquarium = await createAquarium(userId, {
  name: 'Test Tank',
  type: 'freshwater',
  size: 20,
  setupDate: new Date(),
});

const retrieved = await db.aquarium.findUnique({
  where: { id: aquarium.id },
});

console.assert(retrieved?.name === 'Test Tank');
```

## Rollback Plan

If issues arise:
1. Keep Firebase Firestore code intact during Phase 2-3
2. Use feature flags to switch between databases
3. Can fall back to Firestore at any point before Phase 5

```typescript
const USE_NEON = process.env.NEXT_PUBLIC_USE_NEON === 'true';

async function getUser(userId: string) {
  if (USE_NEON) {
    return await db.user.findUnique({ where: { id: userId } });
  } else {
    const doc = await getDoc(doc(firestore, 'users', userId));
    return doc.data();
  }
}
```

## Monitoring

### Track Migration Progress
```typescript
// scripts/migration-stats.ts
async function getMigrationStats() {
  const firestoreUserCount = await getDocs(collection(firestore, 'users'));
  const neonUserCount = await db.user.count();
  
  console.log('Firestore users:', firestoreUserCount.size);
  console.log('Neon users:', neonUserCount);
  console.log('Migration progress:', 
    (neonUserCount / firestoreUserCount.size * 100).toFixed(2) + '%'
  );
}
```

## Next Steps

1. ✅ Complete Neon setup ([NEON_SETUP.md](./NEON_SETUP.md))
2. ✅ Define database schema
3. ✅ Run migrations
4. ✅ Implement dual-write for new features
5. ✅ Migrate existing data
6. ✅ Switch reads to Neon
7. ✅ Monitor for issues
8. ✅ Remove Firestore dependencies

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Firebase Auth with Custom Backend](https://firebase.google.com/docs/auth/admin)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
