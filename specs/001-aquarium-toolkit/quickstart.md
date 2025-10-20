# Developer Quickstart Guide

## Comprehensive Aquarium Management Toolkit

Welcome! This guide will help you set up the AquaDex development environment and get the aquarium management toolkit running locally.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** (check with `node --version`)
- **npm 10+** (check with `npm --version`)
- **Git** (check with `git --version`)
- **Supabase Account** (free tier) - [Sign up at supabase.com](https://supabase.com)
- **Neon Account** (free tier) - [Sign up at neon.tech](https://neon.tech)
- **Google AI API Key** (free tier) - [Get from aistudio.google.com](https://aistudio.google.com)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd aquadex

# Checkout the feature branch
git checkout 001-aquarium-toolkit

# Install dependencies
npm install
```

**Expected packages** (from package.json):
- Next.js 15.2+
- React 19.0+
- TypeScript 5.3+
- Drizzle ORM 0.30+
- Supabase JS 2.39+
- Genkit 1.8+
- React Hook Form 7.54+
- Zod 3.24+
- Shadcn UI components
- Tailwind CSS 3.4+

---

## 2. Set Up Neon PostgreSQL Database

### Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click "Create Project"
3. Name: `aquadex-dev`
4. Region: Choose closest to you
5. PostgreSQL version: 16 (latest)
6. Click "Create Project"

### Get Connection String

1. In your Neon project dashboard, click "Connection Details"
2. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this for the next step

### Configure Database URL

Add to `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## 3. Set Up Supabase

### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name: `aquadex-dev`
4. Database Password: Choose a strong password (save it!)
5. Region: Choose same as Neon
6. Click "Create new project"

### Get API Credentials

1. In project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (long JWT token)

### Configure Supabase

Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name: `aquarium-images`
4. Make it **Public** (for image URLs)
5. Click "Create bucket"

---

## 4. Set Up Google AI (Gemini)

### Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### Configure Google AI

Add to `.env.local`:
```bash
GOOGLE_GENAI_API_KEY="your-google-ai-key-here"
```

---

## 5. Complete Environment Variables

Your `.env.local` should now have:

```bash
# Database (Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Google AI (Genkit)
GOOGLE_GENAI_API_KEY="your-google-ai-key-here"

# Optional: Environment
NODE_ENV="development"
```

**Security Note**: Never commit `.env.local` to Git! It's in `.gitignore` by default.

---

## 6. Initialize Database Schema

### Generate Drizzle Schema

```bash
# Generate migration files from schema
npm run db:generate
```

This reads `lib/db/schema.ts` and creates SQL migrations in `drizzle/` folder.

### Apply Migrations to Neon

```bash
# Push schema to database
npm run db:push
```

This creates all tables, indexes, and constraints in your Neon database.

### Verify Schema

```bash
# Open Drizzle Studio to inspect database
npm run db:studio
```

Opens a web UI at `https://local.drizzle.studio` to browse tables.

**Expected tables**:
- `user_profiles`
- `aquariums`
- `water_tests`
- `treatment_recommendations`
- `livestock`
- `equipment`
- `maintenance_tasks`
- `questions`
- `answers`
- `marketplace_listings`
- `messages`

---

## 7. Seed Development Data (Optional)

```bash
# Run seed script
npm run db:seed
```

This creates:
- Test user profile
- 2 sample aquariums (freshwater and reef)
- Sample water tests with AI confidence scores
- Sample livestock and equipment
- Community questions and answers
- Marketplace listings

---

## 8. Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.x.x:3000 (for mobile testing)

**Expected startup output**:
```
▲ Next.js 15.2.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

---

## 9. Test Core Features

### Test Authentication

1. Go to http://localhost:3000/auth/signup
2. Create an account with email/password
3. Check email for Supabase verification link
4. Click link to verify account
5. Sign in at http://localhost:3000/auth/signin

### Test Aquarium Creation

1. Navigate to http://localhost:3000/dashboard
2. Click "Add New Aquarium"
3. Fill in:
   - Name: "My First Tank"
   - Size: 20 gallons
   - Type: Freshwater
   - Setup Date: Today
4. Upload an image (tests Supabase Storage)
5. Click "Create Aquarium"

### Test Water Testing (AI)

1. Go to your aquarium detail page
2. Click "Test Water"
3. Choose "Analyze Test Strip Image"
4. Upload a test strip photo (or use sample)
5. Select strip brand (e.g., "API")
6. Click "Analyze"
7. Verify AI extracts parameters (pH, ammonia, etc.)
8. Check treatment recommendations appear

### Test Manual Water Test

1. Click "Test Water" → "Manual Entry"
2. Enter parameters manually
3. Save test
4. View test history chart

### Test AI Tools

1. Navigate to http://localhost:3000/fish-finder
2. Enter:
   - Tank size: 20
   - Water type: Freshwater
   - Experience: Beginner
3. Click "Find Fish"
4. Verify Genkit flow returns recommendations

### Test Community

1. Go to http://localhost:3000/qa
2. Click "Ask a Question"
3. Enter title and content
4. Add tags (e.g., "beginner", "freshwater")
5. Submit question
6. Test upvoting/downvoting

### Test Marketplace

1. Go to http://localhost:3000/marketplace
2. Click "Create Listing"
3. Fill in listing details
4. Upload product images
5. Submit listing
6. Test search and filtering

---

## 10. Development Scripts

```bash
# Development server (with hot reload)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:generate   # Generate migrations
npm run db:push       # Apply to database
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed test data

# Genkit development
npm run genkit:dev    # Genkit Developer UI
```

---

## 11. Project Structure Overview

```
aquadex/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Auth routes (signin, signup)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── (tools)/             # AI tools (fish-finder, etc.)
│   │   ├── (community)/         # Q&A forum
│   │   └── (marketplace)/       # Marketplace
│   ├── components/              # React components
│   │   ├── aquariums/           # Aquarium management UI
│   │   ├── auth/                # Authentication forms
│   │   ├── shared/              # Reusable components
│   │   └── ui/                  # Shadcn components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle schema definitions
│   │   │   └── index.ts         # Database client
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase client (browser)
│   │   │   └── server.ts        # Supabase client (server)
│   │   ├── actions.ts           # Server Actions
│   │   └── utils.ts             # Utilities
│   ├── ai/
│   │   ├── genkit.ts            # Genkit configuration
│   │   └── flows/               # AI flows
│   │       ├── analyze-test-strip.ts
│   │       ├── find-fish-flow.ts
│   │       ├── find-plant-flow.ts
│   │       └── ...
│   └── types/
│       └── index.ts             # TypeScript types
├── drizzle/                     # Database migrations
├── specs/                       # Feature specifications
│   └── 001-aquarium-toolkit/
│       ├── spec.md              # Feature requirements
│       ├── plan.md              # Implementation plan
│       ├── data-model.md        # Database schema
│       └── contracts/           # API contracts
└── docs/                        # Documentation
```

---

## 12. Testing the Stack

### Test Neon Connection

```bash
# Create a test script: scripts/test-db.ts
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const result = await db.execute(sql`SELECT NOW()`)
console.log('Database connected:', result)
```

Run with:
```bash
npx tsx scripts/test-db.ts
```

### Test Supabase Auth

```typescript
// In app/test-auth/page.tsx
import { createClient } from '@/lib/supabase/client'

export default function TestAuth() {
  const supabase = createClient()
  
  async function testAuth() {
    const { data, error } = await supabase.auth.getSession()
    console.log('Session:', data, error)
  }
  
  return <button onClick={testAuth}>Test Auth</button>
}
```

### Test Genkit Flow

```bash
# Start Genkit Developer UI
npm run genkit:dev
```

Opens at http://localhost:4000

1. Click "Flows" in sidebar
2. Find "analyzeTestStrip"
3. Click "Run"
4. Provide test input
5. Verify output

---

## 13. Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution**:
1. Check DATABASE_URL is correct
2. Verify Neon project is not suspended (free tier auto-suspends)
3. Test connection: `psql $DATABASE_URL`

### Issue: "Supabase Auth not working"

**Solution**:
1. Verify NEXT_PUBLIC_SUPABASE_URL and key
2. Check Supabase project is active
3. Confirm email settings in Supabase dashboard

### Issue: "Module not found" errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Issue: "Type errors in Drizzle schema"

**Solution**:
```bash
# Regenerate Drizzle types
npm run db:generate
```

### Issue: "Genkit flow fails"

**Solution**:
1. Check GOOGLE_GENAI_API_KEY is valid
2. Verify API key has Gemini API enabled
3. Check quota limits in Google AI Console

---

## 14. Next Steps

### Learn the Codebase

1. Read `specs/001-aquarium-toolkit/spec.md` - Feature requirements
2. Read `specs/001-aquarium-toolkit/plan.md` - Implementation architecture
3. Review `lib/db/schema.ts` - Database structure
4. Explore `src/ai/flows/` - AI workflows

### Start Development

1. Pick a user story from spec.md
2. Create a new branch: `git checkout -b feature/your-feature`
3. Implement components in `src/components/`
4. Create API routes in `src/app/api/`
5. Write Server Actions in `src/lib/actions.ts`
6. Test thoroughly
7. Submit PR for review

### Resources

- **Constitution**: `.specify/memory/constitution.md` - Project principles
- **Neon Docs**: https://neon.tech/docs/introduction
- **Supabase Docs**: https://supabase.com/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Genkit Docs**: https://firebase.google.com/docs/genkit
- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn UI**: https://ui.shadcn.com

---

## 15. Getting Help

### Check Documentation

1. Review `docs/` folder for guides
2. Check API contracts in `specs/001-aquarium-toolkit/contracts/`
3. Read inline code comments

### Debug Mode

```bash
# Run with verbose logging
DEBUG=* npm run dev
```

### Community

- Ask questions in project Q&A forum (once deployed)
- Check GitHub issues for known problems
- Review PR comments for implementation patterns

---

## Success Checklist

Before considering your environment fully set up:

- [ ] Node.js 20+ installed
- [ ] Neon database created and connected
- [ ] Supabase project configured (auth + storage)
- [ ] Google AI API key working
- [ ] `.env.local` complete with all variables
- [ ] Database schema migrated (11 tables created)
- [ ] Development server starts without errors
- [ ] Can create user account and sign in
- [ ] Can create aquarium profile
- [ ] Can upload images to Supabase Storage
- [ ] AI test strip analysis works (Genkit)
- [ ] Can view water test history charts
- [ ] AI tool flows return recommendations
- [ ] Community Q&A features work
- [ ] Marketplace listing creation works
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)

---

## Ready to Build! 🚀

You now have a fully functional development environment for the AquaDex comprehensive aquarium management toolkit. Start with the high-priority user stories (P1) from the spec and work your way through the implementation plan.

Happy coding! 🐠🌊
