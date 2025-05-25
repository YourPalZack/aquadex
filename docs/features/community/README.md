# Community Features Documentation

## Overview
The Community features foster knowledge sharing and local connections within the aquarium hobby through Q&A forums, local fish store directories, and social engagement tools.

## Feature Components

### 1. Q&A Forum
- Ask and answer questions
- Category-based organization
- Upvoting and accepted answers
- Expert badges and reputation

### 2. Local Fish Store Directory
- Find nearby stores
- Store profiles and reviews
- Special events calendar
- Exclusive deals

### 3. Items Wanted Board
- Post wanted items
- Connect buyers and sellers
- Location-based matching
- Safe transaction tips

## Q&A Forum

### User Flows

#### Asking a Question
1. Navigate to `/qa`
2. Click "Ask a Question"
3. Select category:
   - Freshwater
   - Saltwater
   - Planted Tanks
   - Equipment
   - Fish Health
4. Write detailed question
5. Add relevant tags
6. Submit and track responses

#### Answering Questions
1. Browse `/qa` or category pages
2. Filter by:
   - Unanswered
   - Recent
   - Popular
   - Your expertise
3. Provide detailed answer
4. Include sources/experience
5. Earn reputation points

### Technical Implementation

```typescript
interface Question {
  id: string;
  authorId: string;
  category: QuestionCategory;
  title: string;
  body: string;
  tags: string[];
  images?: string[];
  status: 'open' | 'answered' | 'closed';
  acceptedAnswerId?: string;
  upvotes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  body: string;
  images?: string[];
  isAccepted: boolean;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserReputation {
  userId: string;
  points: number;
  level: 'beginner' | 'intermediate' | 'expert' | 'master';
  badges: Badge[];
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
}
```

### Reputation System

#### Point Values
- Ask question: +2
- Answer question: +5
- Answer accepted: +15
- Answer upvoted: +2
- Question upvoted: +1

#### Levels
- Beginner: 0-99 points
- Intermediate: 100-499 points
- Expert: 500-1999 points
- Master: 2000+ points

#### Badges
- First Question
- First Answer
- Helpful (10 upvotes)
- Scholar (accepted answer)
- Teacher (10 accepted answers)
- Specialist (50 answers in category)

## Local Fish Store Directory

### Features

#### Store Profiles
- Basic information
- Hours and location
- Specialties
- Photos and virtual tours
- Current stock highlights
- Events calendar

#### User Interactions
- Reviews and ratings
- Check-in system
- Favorite stores
- Deal alerts
- Event RSVPs

### Technical Implementation

```typescript
interface LocalFishStore {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    social?: {
      facebook?: string;
      instagram?: string;
    };
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  specialties: string[];
  services: string[];
  brands: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  events: StoreEvent[];
}

interface StoreReview {
  id: string;
  storeId: string;
  userId: string;
  rating: number;
  title: string;
  body: string;
  visitDate: Date;
  helpful: number;
  images?: string[];
  response?: {
    body: string;
    date: Date;
  };
  createdAt: Date;
}
```

### Store Features

#### For Store Owners
- Claim and verify listing
- Update store information
- Post events and sales
- Respond to reviews
- Analytics dashboard

#### For Users
- Find stores by location
- Filter by specialties
- Read/write reviews
- Get directions
- Save favorites

## Items Wanted Board

### Features

#### Posting Wants
- Create detailed want posts
- Set location radius
- Specify budget range
- Add reference images
- Set expiration date

#### Matching System
- Location-based matching
- Category alerts
- Seller notifications
- Direct messaging
- Safety guidelines

### Technical Implementation

```typescript
interface WantedItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  budgetMin?: number;
  budgetMax?: number;
  location: {
    city: string;
    state: string;
    radius: number; // miles
  };
  images?: string[];
  status: 'active' | 'fulfilled' | 'expired';
  responses: number;
  expiresAt: Date;
  createdAt: Date;
}
```

## Community Guidelines

### Content Standards
- Family-friendly content
- No medical advice (vet referrals only)
- Accurate information
- Respectful communication
- No spam or self-promotion

### Moderation System
- Community flagging
- Automated content filtering
- Moderator review queue
- Warning system
- Ban appeals process

## Components

- `QuestionCard` - Display question summary
- `QuestionForm` - Create new question
- `AnswerForm` - Submit answer
- `LocalFishStoreCard` - Store summary card
- `StoreReviewForm` - Write store review
- `WantedItemCard` - Display wanted post
- `WantedItemForm` - Create wanted post

## Future Enhancements

### Q&A Forum
1. **Expert Verification**
   - Professional credentials
   - Verified experts program
   - AMA sessions

2. **Rich Content**
   - Video answers
   - Diagram tools
   - Code snippets for DIY

### Local Fish Stores
1. **Enhanced Features**
   - Live inventory
   - Order ahead
   - Loyalty programs
   - Virtual consultations

2. **Events Platform**
   - Workshop registration
   - Speaker series
   - Swap meets
   - Educational seminars

### Community Building
1. **Social Features**
   - Follow users
   - Private messaging
   - Groups/clubs
   - Mentorship program

2. **Gamification**
   - Challenges
   - Leaderboards
   - Seasonal events
   - Achievement system

## API Endpoints

```typescript
// Q&A Forum
// GET /api/qa/questions
// POST /api/qa/questions
// POST /api/qa/questions/:id/answers
// PUT /api/qa/answers/:id/accept

// Local Fish Stores
// GET /api/stores
// GET /api/stores/:slug
// POST /api/stores/:id/reviews

// Items Wanted
// GET /api/wanted
// POST /api/wanted
// POST /api/wanted/:id/respond
```

## Related Features
- [User Management](../user-management/) - Reputation and profiles
- [Marketplace](../marketplace/) - Fulfill wanted items
- [AI Tools](../ai-tools/) - Get product recommendations