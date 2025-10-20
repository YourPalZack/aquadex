# Quick Start: Using Mock Data

Get started testing your UI immediately without setting up external services!

## 1. Verify Setup

The mock data system is already configured. Just verify your `.env.local`:

```bash
USE_MOCK_DATA="true"
```

## 2. Start Development Server

```bash
npm run dev
```

Your app will automatically use mock data for database, auth, and AI.

## 3. Create a Page Using Mock Data

Create a new page that displays aquariums:

```typescript
// app/test-mock/page.tsx
import { getAquariums } from '@/lib/actions-example';

export default async function TestMockPage() {
  const { aquariums } = await getAquariums();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Aquariums (Mock Data)</h1>
      
      <div className="grid gap-4">
        {aquariums?.map((tank) => (
          <div key={tank.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold">{tank.name}</h2>
            <p className="text-gray-600">
              {tank.sizeGallons} gallons • {tank.waterType}
            </p>
            <p className="text-sm text-gray-500">
              Location: {tank.location || 'Not specified'}
            </p>
            {tank.imageUrls && tank.imageUrls.length > 0 && (
              <img 
                src={tank.imageUrls[0]} 
                alt={tank.name}
                className="mt-4 rounded-lg w-full h-48 object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Visit Your Page

Navigate to http://localhost:9002/test-mock

You'll see 3 mock aquariums:
- 75g Reef Tank (Living room, saltwater)
- 20g Planted Community (Office, freshwater)
- 10g Betta Tank (Bedroom, freshwater)

## 5. Test Other Mock Data

### Water Tests
```typescript
import { getWaterTestHistory } from '@/lib/actions-example';

const { tests } = await getWaterTestHistory('aquarium_reef_001');
// Returns 3 mock water tests with realistic parameters
```

### Aquarium Details
```typescript
import { getAquariumById } from '@/lib/actions-example';

const data = await getAquariumById('aquarium_reef_001');
// Returns aquarium + livestock + equipment + waterTests + tasks
```

### Community Questions
```typescript
import { getCommunityQuestions } from '@/lib/actions-example';

const { questions } = await getCommunityQuestions();
// Returns 2 mock community questions
```

### Marketplace Listings
```typescript
import { getMarketplaceListings } from '@/lib/actions-example';

const { listings } = await getMarketplaceListings();
// Returns 2 mock marketplace listings
```

## 6. Test Authentication

```typescript
import { getAuthClient } from '@/lib/config';

const auth = await getAuthClient();
const user = await auth.getCurrentUser();

console.log(user);
// {
//   id: 'user_mock_123',
//   email: 'demo@aquadex.app',
//   displayName: 'Demo User',
//   role: 'standard',
//   reputationScore: 142,
//   ...
// }
```

## 7. Test AI Analysis

```typescript
import { getAiClient } from '@/lib/config';

const ai = await getAiClient();
const analysis = await ai.analyzeTestStrip('https://example.com/test-strip.jpg');

console.log(analysis);
// {
//   success: true,
//   confidence: 0.92,
//   parameters: {
//     pH: { value: 8.2, status: 'safe', confidence: 0.94 },
//     ammonia: { value: 0, status: 'safe', confidence: 0.91 },
//     ...
//   },
//   recommendations: [...]
// }
```

## What's Available

### Mock Data Includes:

**User Profile**
- Email: demo@aquadex.app
- Location: Seattle, WA
- Reputation: 142 points
- Role: standard

**3 Aquariums**
- Reef tank (75g saltwater with coral and clownfish)
- Planted tank (20g freshwater with tetras)
- Betta tank (10g freshwater)

**Livestock**
- 2 Ocellaris Clownfish
- 3-head Torch Coral
- 1 Cleaner Shrimp

**Equipment**
- Fluval FX6 canister filter
- AI Hydra 32HD LED light
- Eheim Jager heater

**Water Tests**
- 3 recent tests (Oct 6, 13, 20)
- Realistic parameters (pH, ammonia, nitrite, nitrate)
- AI confidence scores ~92%

**Maintenance Tasks**
- Water change (every 14 days)
- Water testing (every 7 days)
- Filter cleaning (every 90 days)

**Community**
- 2 questions with answers
- View counts and voting

**Marketplace**
- AI Hydra 26HD ($180)
- Java Fern bunch ($15)

## Development Tips

### 1. Fast Iteration
Mock operations complete in 100-300ms. Perfect for rapid UI development.

### 2. Consistent Data
Mock data is deterministic - you'll see the same data every time.

### 3. No External Dependencies
- Works offline
- No API keys needed
- No database setup required
- No authentication provider needed

### 4. Test Error States
Modify mock data to test edge cases:

```typescript
// In src/lib/mock/data.ts
export const mockData = {
  // ... existing data
  aquariums: [], // Test empty state
};
```

### 5. Add More Mock Data
Extend mock data for your specific tests:

```typescript
// Add a 4th aquarium
mockAquariums.push({
  id: 'aquarium_nano_004',
  name: '5g Nano Reef',
  sizeGallons: 5,
  waterType: 'saltwater',
  // ... other fields
});
```

## When to Switch to Real Services

Switch to real services when you're ready to:
- Test with actual database persistence
- Implement real user authentication
- Use live AI analysis
- Deploy to production

## Next Steps

1. ✅ Verify mock data works (visit test page)
2. Build remaining UI components using mock data
3. Test all user flows with mock data
4. When satisfied, switch to real services
5. Test with real data
6. Deploy to production

## Need Help?

See full documentation: `src/lib/mock/README.md`

Mock data is working when you see realistic aquarium data without any database or auth setup!
