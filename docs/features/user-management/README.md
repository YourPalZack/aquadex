# User Management Feature Documentation

## Overview
The User Management system handles authentication, profiles, preferences, and account settings for AquaDex users, providing a personalized experience across all features.

## Feature Components

### 1. Authentication
- Email/password sign up and sign in
- Social login (Google, Facebook)
- Password reset functionality
- Session management
- Multi-device support

### 2. User Profiles
- Personal information
- Aquarium hobbyist details
- Public profile settings
- Achievement showcase
- Activity history

### 3. Preferences & Settings
- Notification preferences
- Privacy settings
- Display preferences
- Email subscriptions
- Data export/deletion

### 4. Dashboard
- Personalized overview
- Quick actions
- Recent activity
- Reminders and alerts
- Statistics

## User Flows

### Registration Flow
1. Navigate to `/signup`
2. Choose registration method:
   - Email/password
   - Google OAuth
   - Facebook OAuth
3. Complete profile setup:
   - Display name
   - Experience level
   - Tank types owned
   - Interests
4. Email verification
5. Redirect to `/dashboard`

### Sign In Flow
1. Navigate to `/signin`
2. Enter credentials or use social login
3. Two-factor authentication (if enabled)
4. Redirect to intended page or `/dashboard`

### Profile Management
1. Access `/profile`
2. Edit sections:
   - Basic information
   - Bio and interests
   - Tank summary
   - Privacy settings
3. Save changes
4. View public profile preview

## Technical Implementation

### Data Models

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  tankTypes: ('freshwater' | 'saltwater' | 'planted' | 'reef')[];
  memberSince: Date;
  lastActive: Date;
  emailVerified: boolean;
  settings: UserSettings;
  stats: UserStats;
  badges: Badge[];
  social?: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

interface UserSettings {
  notifications: {
    email: {
      testReminders: boolean;
      maintenanceAlerts: boolean;
      marketplaceUpdates: boolean;
      communityDigest: boolean;
      promotions: boolean;
    };
    push: {
      enabled: boolean;
      testReminders: boolean;
      urgentAlerts: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'registered' | 'private';
    showAquariums: boolean;
    showActivity: boolean;
    allowMessages: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    units: 'imperial' | 'metric';
    timezone: string;
    language: string;
  };
}

interface UserStats {
  aquariumCount: number;
  testCount: number;
  questionsAsked: number;
  answersGiven: number;
  marketplaceListings: number;
  helpfulVotes: number;
  joinedDate: Date;
  lastTestDate?: Date;
}
```

### Authentication System

#### Firebase Auth Integration
```typescript
// Sign up with email
const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await createUserProfile(userCredential.user);
};

// Social login
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createOrUpdateUserProfile(result.user);
};

// Session management
const authStateListener = onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    updateLastActive(user.uid);
  } else {
    // User is signed out
    redirectToSignIn();
  }
});
```

### Components

- `SignInForm` - Email/password sign in
- `SignUpForm` - New user registration
- `ProfileEditForm` - Edit user profile
- `SettingsPanel` - Manage preferences
- `DashboardStats` - User statistics display
- `BadgeShowcase` - Achievement display
- `ActivityFeed` - Recent user activity

### Security Features

#### Account Protection
- Strong password requirements
- Two-factor authentication (planned)
- Session timeout
- Device management
- Login history

#### Data Privacy
- GDPR compliance
- Data export functionality
- Account deletion
- Privacy controls
- Cookie preferences

## Dashboard Features

### Personalized Widgets
1. **Quick Stats**
   - Active aquariums
   - Last test date
   - Maintenance due
   - Unread notifications

2. **Recent Activity**
   - Test results
   - Q&A interactions
   - Marketplace activity
   - Achievement unlocks

3. **Recommendations**
   - Suggested actions
   - Product recommendations
   - Content suggestions
   - Community highlights

### Quick Actions
- Add water test
- Create listing
- Ask question
- Find products
- Update parameters

## Notification System

### Channel Types
1. **Email Notifications**
   - Test reminders
   - Maintenance alerts
   - Q&A responses
   - Marketplace updates
   - Weekly digests

2. **Push Notifications** (planned)
   - Critical alerts
   - Real-time updates
   - Mobile app alerts

3. **In-App Notifications**
   - Bell icon alerts
   - Dashboard cards
   - Toast messages

### Notification Preferences
```typescript
interface NotificationPreferences {
  // Frequency
  testReminders: 'daily' | 'weekly' | 'monthly' | 'never';
  maintenanceAlerts: boolean;
  
  // Community
  questionAnswered: boolean;
  answerAccepted: boolean;
  mentioned: boolean;
  
  // Marketplace
  listingViews: boolean;
  listingMessages: boolean;
  priceAlerts: boolean;
  
  // Digest
  weeklyDigest: boolean;
  monthlyNewsletter: boolean;
}
```

## Achievement System

### Badge Categories
1. **Experience Badges**
   - First Tank
   - Multi-Tank Master
   - Year One
   - Veteran (5+ years)

2. **Activity Badges**
   - Test Streak (30 days)
   - Helper (50 answers)
   - Trader (10 sales)
   - Explorer (used all tools)

3. **Special Badges**
   - Beta Tester
   - Contest Winner
   - Featured Aquarium
   - Expert Verified

## Future Enhancements

1. **Advanced Authentication**
   - Biometric login
   - Passwordless auth
   - SSO integration
   - Hardware keys

2. **Social Features**
   - Follow system
   - Direct messaging
   - Profile comments
   - Share achievements

3. **Personalization**
   - AI recommendations
   - Custom dashboards
   - Saved searches
   - Workflow automation

4. **Premium Features**
   - Advanced analytics
   - Priority support
   - Exclusive content
   - Early access

## API Endpoints

```typescript
// Authentication
// POST /api/auth/signup
// POST /api/auth/signin
// POST /api/auth/signout
// POST /api/auth/reset-password

// User Profile
// GET /api/users/:id
// PUT /api/users/:id
// DELETE /api/users/:id

// Settings
// GET /api/users/:id/settings
// PUT /api/users/:id/settings

// Activity
// GET /api/users/:id/activity
// GET /api/users/:id/stats
```

## Related Features
- [Community](../community/) - Q&A reputation
- [Marketplace](../marketplace/) - Seller profiles
- [Aquarium Management](../aquarium-management/) - Tank ownership