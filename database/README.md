# AquaDex Database Documentation

## Overview

AquaDex uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies. The database is designed to support a full-featured aquarium management and community platform.

## Architecture

### Core Entities

1. **Users** - Extended user profiles beyond Supabase auth
2. **Aquariums** - User aquarium/tank management
3. **Water Tests** - Water parameter tracking and history
4. **Marketplace Listings** - Buy/sell marketplace functionality
5. **Questions & Answers** - Community Q&A system
6. **Notifications** - System and user notifications
7. **Reminders** - Aquarium maintenance reminders

### Security Model

- **Row Level Security (RLS)** enabled on all tables
- **User-based access control** - users can only access their own data
- **Public data access** for marketplace and Q&A (where appropriate)
- **Automatic user profile creation** via database triggers

## Database Schema

### Users Table

Extended profile information for authenticated users.

```sql
public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  photo_url TEXT,
  location TEXT,
  bio TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  specialties TEXT[] DEFAULT '{}',
  contact_preferences JSONB DEFAULT '{"email_notifications": true, "marketing_emails": false}',
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_location": false}',
  is_seller_approved BOOLEAN DEFAULT false,
  seller_rating DECIMAL(3,2) DEFAULT 0.00,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Automatic profile creation when user signs up (via trigger)
- Seller approval system for marketplace
- Privacy controls for profile visibility
- Experience level and specialties for community features

### Aquariums Table

Stores information about user aquariums and tanks.

```sql
public.aquariums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('freshwater', 'saltwater', 'brackish', 'pond')),
  size_gallons INTEGER,
  size_liters INTEGER,
  setup_date DATE,
  description TEXT,
  equipment JSONB DEFAULT '{}',
  inhabitants JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  maintenance_schedule JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Support for multiple tank types
- Flexible JSON storage for equipment, inhabitants, and parameters
- Photo gallery with array of URLs
- Maintenance scheduling system

### Water Tests Table

Comprehensive water parameter tracking.

```sql
public.water_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE NOT NULL,
  test_date TIMESTAMPTZ DEFAULT NOW(),
  temperature DECIMAL(4,2),
  ph DECIMAL(3,2),
  ammonia DECIMAL(4,2),
  nitrite DECIMAL(4,2),
  nitrate DECIMAL(4,2),
  gh INTEGER,
  kh INTEGER,
  tds INTEGER,
  salinity DECIMAL(3,2),
  alkalinity INTEGER,
  phosphate DECIMAL(4,2),
  chlorine DECIMAL(4,2),
  copper DECIMAL(4,3),
  iron DECIMAL(4,3),
  calcium INTEGER,
  magnesium INTEGER,
  notes TEXT,
  test_kit_used TEXT,
  photo_url TEXT,
  ai_analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Comprehensive parameter tracking (20+ parameters)
- Support for both freshwater and saltwater parameters
- AI analysis integration for test strip photos
- Automated recommendations based on test results

### Marketplace Listings Table

Buy/sell marketplace functionality.

```sql
public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('fish', 'plants', 'equipment', 'food', 'chemicals', 'decoration', 'other')),
  subcategory TEXT,
  condition TEXT CHECK (condition IN ('new', 'used_like_new', 'used_good', 'used_fair')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  location TEXT,
  shipping_available BOOLEAN DEFAULT false,
  local_pickup_only BOOLEAN DEFAULT false,
  photos TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived', 'draft')),
  featured_until TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Categorized listings with subcategories
- Condition-based pricing
- Shipping and pickup options
- Featured listing system
- View tracking and analytics

### Questions & Answers Tables

Community Q&A system.

```sql
public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'freshwater', 'saltwater', 'planted', 'disease', 'equipment', 'breeding', 'water_chemistry')),
  tags TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  votes_count INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Categorized questions by aquarium type/topic
- Voting system for quality control
- Photo support for visual questions/answers
- Solution marking system

### Notifications Table

System and user notifications.

```sql
public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  category TEXT CHECK (category IN ('system', 'marketplace', 'qa', 'aquarium', 'water_test')) DEFAULT 'system',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Typed notifications (info, warning, success, error)
- Categorized by system area
- Expiration support for time-sensitive notifications
- Additional context data in JSON format

### Reminders Table

Aquarium maintenance reminders.

```sql
public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  aquarium_id UUID REFERENCES public.aquariums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('water_change', 'feeding', 'testing', 'maintenance', 'medication', 'other')) NOT NULL,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  frequency_days INTEGER,
  next_due TIMESTAMPTZ NOT NULL,
  last_completed TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Key Features:**
- Flexible frequency system (predefined + custom)
- Automatic next due date calculation
- Type-based categorization of maintenance tasks
- Active/inactive state management

## Row Level Security Policies

### Users
- Users can view and update their own profiles
- Public profiles are viewable by all users (respects privacy settings)

### Aquariums & Water Tests
- Users can only access their own aquariums and test data
- Complete CRUD access for own data

### Marketplace
- All users can view active listings
- Sellers can manage their own listings only

### Questions & Answers
- Public read access for all questions and answers
- Authenticated users can create questions/answers
- Users can update/delete their own content

### Notifications & Reminders
- Users can only access their own notifications and reminders

## Database Functions

### Utility Functions

1. **handle_updated_at()** - Automatically updates `updated_at` timestamp
2. **handle_new_user()** - Creates user profile when auth user is created
3. **increment_question_views()** - Increments question view count
4. **increment_listing_views()** - Increments listing view count
5. **update_question_answer_count()** - Updates answer count when answers are added/removed
6. **cleanup_expired_notifications()** - Removes expired notifications
7. **calculate_next_reminder_date()** - Calculates next reminder due date

### Triggers

- **updated_at triggers** on all tables with timestamps
- **User profile creation** on auth.users insert
- **Answer count update** on answers insert/delete

## Indexes

Performance indexes are created for:
- User lookups (email, experience_level, seller_approved)
- Aquarium queries (user_id, type, active status)
- Water test history (user_id, aquarium_id, test_date)
- Marketplace searches (category, status, location, featured)
- Q&A system (category, votes, solved status)
- Notifications (user_id, unread status)
- Reminders (user_id, next_due date)

## Data Types and Formats

### JSON Schema Examples

**Aquarium Equipment:**
```json
{
  "filter": "Fluval 306 Canister Filter",
  "heater": "Eheim Jager 150W",
  "lighting": "Fluval Plant 3.0 LED",
  "substrate": "Fluval Stratum"
}
```

**Aquarium Inhabitants:**
```json
{
  "fish": [
    {"species": "Neon Tetra", "count": 12},
    {"species": "Corydoras Panda", "count": 6}
  ],
  "plants": [
    {"species": "Amazon Sword", "count": 3}
  ]
}
```

**Water Test AI Analysis:**
```json
{
  "confidence": 0.95,
  "detected_parameters": {
    "ph": 7.2,
    "ammonia": 0.0,
    "nitrite": 0.0,
    "nitrate": 15.0
  },
  "analysis_timestamp": "2025-10-20T10:30:00Z"
}
```

## Migration and Deployment

1. **Initial Schema** - Run `database/migrations/001_initial_schema.sql`
2. **Sample Data** - Optionally run `database/sample_data.sql` for testing
3. **Type Generation** - Use Supabase CLI to generate TypeScript types
4. **Deployment Script** - Use `scripts/deploy-database.sh` for automated deployment

## Best Practices

### Performance
- Use appropriate indexes for query patterns
- Limit large JSON document sizes
- Use pagination for large result sets
- Monitor query performance with `EXPLAIN ANALYZE`

### Security
- Always use RLS policies - never disable them in production
- Validate data at application level before database insertion
- Use prepared statements to prevent SQL injection
- Regularly audit access logs

### Data Integrity
- Use foreign key constraints to maintain referential integrity
- Implement check constraints for enum-like values
- Use NOT NULL constraints where appropriate
- Consider using database-level defaults

### Maintenance
- Regularly clean up expired notifications
- Archive old water test data if volume becomes large
- Monitor storage usage for photo arrays
- Keep database statistics up to date

## Development Workflow

1. **Schema Changes** - Create new migration files
2. **Testing** - Test migrations on local Supabase instance
3. **Type Generation** - Regenerate TypeScript types after schema changes
4. **Application Updates** - Update application code to use new schema
5. **Deployment** - Deploy to staging first, then production

## Monitoring and Analytics

### Key Metrics to Track
- User registration and retention rates
- Aquarium creation and activity levels
- Water test frequency and patterns
- Marketplace listing performance
- Q&A engagement and solution rates

### Database Performance
- Query execution times
- Connection pool usage
- Storage consumption
- Index effectiveness
- RLS policy performance

## Backup and Recovery

- **Automated Backups** - Supabase provides daily backups
- **Point-in-time Recovery** - Available for critical data loss scenarios
- **Data Export** - Regular exports for additional backup security
- **Testing Recovery** - Periodically test backup restoration procedures

---

*Last Updated: October 20, 2025*
*Version: 1.0.0*