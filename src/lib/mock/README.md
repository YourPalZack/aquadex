# Mock Data System

This directory contains mock implementations for local development, allowing you to test the UI without setting up external services (Neon database, Supabase auth, Google AI API).

## Overview

The mock system provides three main components:

1. **Mock Data** (`data.ts`) - Realistic sample data for all entities
2. **Mock Database** (`db.ts`) - In-memory database operations
3. **Mock Auth** (`auth.ts`) - Authentication without Supabase
4. **Mock AI** (`ai.ts`) - AI responses without Google AI API

## Usage

### Enable Mock Mode

Set the feature flag in `.env.local`:

```bash
USE_MOCK_DATA="true"
```

### Use in Code

The feature flag system automatically routes to mock implementations:

```typescript
import { getDbClient, getAuthClient, getAiClient } from '@/lib/config';

// Automatically uses mock or real based on USE_MOCK_DATA
const db = await getDbClient();
const auth = await getAuthClient();
const ai = await getAiClient();

// Use normally
const aquariums = await db.aquariums.findMany();
const user = await auth.getCurrentUser();
const analysis = await ai.analyzeTestStrip(imageUrl);
```

### Direct Mock Import

For testing or forced mock usage:

```typescript
import { mockData, mockDb, mockAuth, mockAi } from '@/lib/mock';

// Access mock data directly
console.log(mockData.aquariums); // Array of 3 sample tanks

// Use mock database
const tests = await mockDb.waterTests.findMany();

// Use mock auth
const user = await mockAuth.getCurrentUser();

// Use mock AI
const analysis = await mockAi.analyzeTestStrip(imageUrl);
```

## Mock Data Contents

### User Profile
- Demo user with reputation score 142
- Standard role (not verified seller)
- Located in Seattle, WA

### Aquariums (3 tanks)
1. **75g Reef Tank** - Living room, mixed coral setup
2. **20g Planted Community** - Office, tetras + shrimp
3. **10g Betta Tank** - Bedroom, blue betta

### Livestock
- Ocellaris Clownfish (pair)
- Torch Coral (3 heads)
- Cleaner Shrimp

### Equipment
- Fluval FX6 canister filter
- AI Hydra 32HD LED light
- Eheim Jager heater

### Water Tests (3 recent)
- Realistic parameters (pH 8.1-8.2, ammonia 0, nitrates 5-10ppm)
- AI confidence scores ~92%
- Different test methods (strip, API, Seachem)

### Maintenance Tasks
- 20% water change (14-day cycle)
- Test parameters (7-day cycle)
- Clean filter (90-day cycle)

### Community Content
- 2 questions with answers
- Voting and view counts
- Accepted answers

### Marketplace Listings
- AI Hydra 26HD LED ($180)
- Java Fern bunch ($15)

## Mock Database Operations

The mock database simulates real async operations with realistic delays (100-300ms).

### Supported Operations

```typescript
// Find many with filters
const userAquariums = await mockDb.aquariums.findMany({
  where: { userId: 'user_mock_123' }
});

// Find first/single
const aquarium = await mockDb.aquariums.findFirst({
  where: { id: 'aquarium_reef_001' }
});

// Insert (returns object with generated ID)
const newAquarium = await mockDb.aquariums.insert({
  name: 'New Tank',
  userId: 'user_mock_123',
  // ... other fields
});

// Update
await mockDb.aquariums.update({
  id: 'aquarium_reef_001',
  name: 'Updated Name'
});

// Delete
await mockDb.aquariums.delete({ id: 'aquarium_reef_001' });
```

## Mock Authentication

Mock auth always succeeds and uses the demo user:

```typescript
// Sign in (always succeeds)
const { user, session } = await mockAuth.signIn('any@email.com', 'password');

// Get current user
const user = await mockAuth.getCurrentUser();

// Check roles
const isAdmin = mockAuth.hasRole('admin'); // false
const canSell = mockAuth.hasMinRole('verified_seller'); // false (user is 'standard')

// React hook for client components
function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useMockAuth();
  // ... use auth state
}
```

## Mock AI Flows

Mock AI returns realistic responses without API calls:

```typescript
// Water test analysis (1-3 second delay)
const result = await mockAi.analyzeTestStrip(imageUrl);
// Returns: parameters with 90%+ confidence, status, warnings, recommendations

// Treatment recommendations
const treatment = await mockAi.recommendTreatment({ ammonia: 0.5 });
// Returns: urgency level, products, dosages, advice

// Product discovery
const fish = await mockAi.findFish({ tankSize: 20, waterType: 'freshwater' });
const plants = await mockAi.findPlant({ lighting: 'low', difficulty: 'beginner' });
const filter = await mockAi.findFilter({ tankSize: 75, type: 'canister' });

// Deals and food
const deals = await mockAi.findDeals('equipment');
const food = await mockAi.getFoodLinks('marine');
```

## Switching to Real Services

When ready to use real services:

1. **Sign up for services:**
   - Neon: https://console.neon.tech
   - Supabase: https://app.supabase.com
   - Google AI: https://aistudio.google.com/apikey

2. **Update `.env.local`:**
   ```bash
   USE_MOCK_DATA="false"
   DATABASE_URL="postgresql://real-connection-string"
   NEXT_PUBLIC_SUPABASE_URL="https://real-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="real-anon-key"
   GOOGLE_AI_API_KEY="real-api-key"
   ```

3. **Run migrations:**
   ```bash
   npm run db:push
   ```

4. **Test with real data:**
   - Code remains the same
   - Feature flag automatically routes to real implementations
   - No mock-specific code to remove

## Development Tips

- **UI Testing**: Mock data is perfect for testing layouts, components, and interactions
- **Performance**: Mock operations are fast (100-300ms) for quick iteration
- **Consistency**: Mock data is deterministic - same data every time
- **Safety**: No risk of accidentally modifying production data
- **Offline**: Work without internet connection or external services

## Limitations

- **No Persistence**: Changes are lost on server restart
- **Single User**: Only supports the demo user
- **Limited Data**: Only 3 aquariums, 3 tests, etc.
- **No Validation**: Mock database doesn't enforce schema constraints
- **No Real AI**: AI responses are hardcoded, not intelligent

## Extending Mock Data

To add more mock data, edit `src/lib/mock/data.ts`:

```typescript
export const mockData = {
  user: { /* ... */ },
  aquariums: [
    // Add more aquariums here
    {
      id: 'aquarium_nano_004',
      name: '5g Nano Reef',
      // ... other fields
    },
  ],
  // ... other entities
};
```

To add mock operations, edit `src/lib/mock/db.ts`:

```typescript
export const mockDb = {
  // ... existing tables
  newTable: {
    findMany: async () => { /* ... */ },
    insert: async () => { /* ... */ },
  },
};
```
