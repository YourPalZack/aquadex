# Phase 0: Research & Technology Decisions

**Feature**: Comprehensive Aquarium Management Toolkit  
**Date**: 2025-10-20  
**Status**: Complete

## Overview

This document resolves all technology choices and architectural patterns for implementing the aquarium toolkit. The primary research focus was replacing Firebase with superior cloud-native alternatives while maintaining serverless, browser-testable architecture.

## Key Decisions

### 1. Authentication & Storage: Supabase

**Decision**: Use Supabase for authentication and file storage (replaces Firebase entirely)

**Rationale**:
- **Unified PostgreSQL Integration**: Supabase is built on PostgreSQL, providing seamless integration with our Neon database
- **Open Source & Transparent**: Full visibility into authentication flows and storage mechanisms
- **Feature Parity**: Offers email/password auth, OAuth providers (Google, GitHub), magic links, and row-level security
- **Built-in Storage**: S3-compatible storage with automatic image optimization and CDN
- **Real-time Capabilities**: PostgreSQL-based real-time subscriptions for future features
- **Better Developer Experience**: Type-safe client libraries, auto-generated TypeScript types from database schema
- **Cost Effective**: Generous free tier (50,000 monthly active users, 1GB database, 1GB storage)

**Alternatives Considered**:
- **Firebase**: Rejected per user requirement; also creates vendor lock-in and uses proprietary Firestore instead of standard SQL
- **Auth0 + AWS S3**: More expensive, requires managing two separate services, more complex configuration
- **Clerk + Cloud Storage**: Higher cost, less integration with PostgreSQL, limited free tier
- **NextAuth.js + Vercel Blob**: Requires more manual setup, less feature-complete than Supabase

**Implementation Pattern**:
```typescript
// Browser client for client components
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Server client for server components/actions
import { createServerClient } from '@supabase/ssr'
const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookies: { get, set, remove }
})
```

### 2. Database & ORM: Neon + Drizzle

**Decision**: Use Neon PostgreSQL with Drizzle ORM

**Rationale**:
- **Serverless PostgreSQL**: Neon provides true serverless PostgreSQL with auto-scaling and instant branching
- **Type Safety**: Drizzle generates TypeScript types from schema, eliminating type/schema mismatches
- **SQL-First**: Drizzle uses SQL-like syntax, making it familiar and predictable
- **Performance**: Drizzle is one of the fastest ORMs, with minimal overhead
- **Migration Management**: Built-in migration generator and runner
- **Edge Compatible**: Works with Vercel Edge Functions and Cloudflare Workers
- **Free Tier**: Neon offers 0.5GB storage, 10GB transfer/month free

**Alternatives Considered**:
- **Prisma**: More mature but slower performance, larger bundle size, more opinionated migrations
- **TypeORM**: Older, decorator-based (less idiomatic TypeScript), heavier runtime
- **Kysely**: Type-safe query builder but lacks schema definition and migration tools
- **Raw SQL**: Maximum control but loses type safety and requires manual migrations

**Implementation Pattern**:
```typescript
// Define schema
import { pgTable, text, timestamp, integer, real } from 'drizzle-orm/pg-core'

export const aquariums = pgTable('aquariums', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  size: real('size').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// Type-safe queries
import { drizzle } from 'drizzle-orm/neon-http'
const db = drizzle(process.env.DATABASE_URL)
const userAquariums = await db.select().from(aquariums).where(eq(aquariums.userId, userId))
```

### 3. AI Integration: Genkit + Google AI

**Decision**: Continue using Genkit with Google AI (Gemini)

**Rationale**:
- **Already Implemented**: Project already has Genkit flows in `src/ai/flows/`
- **Next.js Integration**: Official @genkit-ai/next package for seamless integration
- **Structured Outputs**: Excellent for extracting structured data from images (test strips)
- **Multimodal**: Gemini handles both image and text inputs natively
- **Cost Effective**: Gemini offers generous free tier (60 requests/minute)
- **Flow-Based**: Genkit's flow abstraction makes AI logic testable and reusable
- **Type Safe**: Zod schema integration for input/output validation

**Alternatives Considered**:
- **OpenAI GPT-4 Vision**: More expensive, requires separate API key management
- **Anthropic Claude**: Excellent but newer vision capabilities, higher cost
- **Vercel AI SDK**: Less structured, more low-level, requires more manual integration
- **LangChain**: Too complex for our needs, adds unnecessary abstraction

**Implementation Pattern**:
```typescript
// Define flow with Zod schemas
import { defineFlow } from 'genkit'
import { z } from 'zod'

export const analyzeTestStrip = defineFlow({
  name: 'analyzeTestStrip',
  inputSchema: z.object({
    imageUrl: z.string(),
    aquariumId: z.string()
  }),
  outputSchema: z.object({
    ph: z.number(),
    ammonia: z.number(),
    // ... other parameters
  })
}, async (input) => {
  // AI logic here
})

// Expose via API route
export async function POST(req: Request) {
  const data = await req.json()
  const result = await runFlow(analyzeTestStrip, data)
  return Response.json(result)
}
```

### 4. Form Handling: React Hook Form + Zod

**Decision**: Use React Hook Form with Zod validation

**Rationale**:
- **Performance**: Minimal re-renders, uses uncontrolled components
- **Type Safety**: Direct Zod schema integration via @hookform/resolvers
- **Developer Experience**: Simple API, great TypeScript support
- **Bundle Size**: Only 8.5KB minified + gzipped
- **Accessibility**: Built-in error handling and ARIA attributes
- **Shadcn Integration**: Shadcn UI Form components built on React Hook Form

**Alternatives Considered**:
- **Formik**: Larger bundle size, slower performance, less TypeScript-friendly
- **Remix/Next.js Forms**: Server-only validation, less client-side UX
- **Plain React**: Too much boilerplate, manual validation logic

**Implementation Pattern**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aquariumSchema } from '@/lib/validations/aquarium'

const form = useForm({
  resolver: zodResolver(aquariumSchema),
  defaultValues: { name: '', size: 0, type: 'freshwater' }
})

const onSubmit = form.handleSubmit(async (data) => {
  await createAquarium(data) // Server action
})
```

### 5. UI Components: Shadcn UI + Tailwind CSS

**Decision**: Use Shadcn UI with Tailwind CSS (already chosen in constitution)

**Rationale**:
- **Copy-Paste Components**: Components live in your codebase, fully customizable
- **Accessibility First**: Built on Radix UI primitives (WCAG compliant)
- **Type Safe**: Full TypeScript support
- **Consistent Design**: Pre-styled with Tailwind, follows design system
- **Tree Shakeable**: Only bundle components you use
- **No Runtime**: Pure React components, no additional runtime

**Implementation Pattern**:
- Install components as needed: `npx shadcn-ui@latest add button card form`
- Customize in `components/ui/` directory
- Use with Tailwind utilities for feature-specific styling

### 6. State Management: React Server Components + URL State

**Decision**: Use React Server Components with URL state (searchParams, router) for most state, Zustand for complex client state

**Rationale**:
- **Server Components**: Fetch data on server, reducing client JavaScript
- **URL as State**: Search filters, pagination in URL enables bookmarking and sharing
- **Minimal Client State**: Most data fetching happens server-side
- **Zustand When Needed**: Lightweight (1KB), for complex UI state (modals, multi-step forms)

**Alternatives Considered**:
- **Redux**: Too complex, unnecessary boilerplate for this application
- **Jotai/Recoil**: Atomic state management overkill for current needs
- **React Context**: Sufficient for simple cases, but Zustand better for complex state

### 7. Image Optimization: Next.js Image + Supabase Storage

**Decision**: Use Next.js Image component with Supabase Storage transformations

**Rationale**:
- **Automatic Optimization**: Next.js Image handles srcset, lazy loading, blur placeholders
- **Supabase Transforms**: On-the-fly image resizing via URL parameters
- **CDN Distribution**: Supabase Storage includes CDN for fast global delivery
- **Format Conversion**: Automatic WebP/AVIF conversion for modern browsers

**Implementation Pattern**:
```typescript
import Image from 'next/image'

// Upload to Supabase Storage
const { data } = await supabase.storage
  .from('test-strips')
  .upload(`${aquariumId}/${filename}`, file)

// Get optimized URL
const { data: { publicUrl } } = supabase.storage
  .from('test-strips')
  .getPublicUrl(data.path, {
    transform: { width: 800, height: 600, resize: 'contain' }
  })

// Use with Next.js Image
<Image src={publicUrl} alt="Test strip" width={800} height={600} />
```

### 8. Deployment: Vercel

**Decision**: Deploy to Vercel

**Rationale**:
- **Next.js Creator**: Best Next.js support, zero-config deployments
- **Edge Functions**: Fast global performance for API routes
- **Automatic Preview**: PR previews for testing
- **Environment Variables**: Secure environment management
- **Free Tier**: Generous for hobby projects
- **Supabase & Neon Compatibility**: Both have official Vercel integrations

**Alternatives Considered**:
- **Netlify**: Good but less Next.js-optimized features
- **Railway/Render**: More suited for traditional backends
- **Cloudflare Pages**: Excellent but Edge runtime has some limitations

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15.2+ | Full-stack React framework with App Router |
| **Language** | TypeScript | 5.3+ | Type-safe development |
| **Database** | Neon PostgreSQL | Latest | Serverless PostgreSQL database |
| **ORM** | Drizzle | 0.30+ | Type-safe database queries |
| **Auth** | Supabase Auth | 2.39+ | Authentication and authorization |
| **Storage** | Supabase Storage | 2.39+ | Image and file storage |
| **AI** | Genkit + Gemini | 1.8+ | AI flows and image analysis |
| **Forms** | React Hook Form | 7.54+ | Form state management |
| **Validation** | Zod | 3.24+ | Runtime type validation |
| **UI Components** | Shadcn UI | Latest | Accessible component library |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Icons** | Lucide React | 0.475+ | Icon library |
| **Charts** | Recharts | 2.15+ | Data visualization |
| **Deployment** | Vercel | Latest | Hosting and edge functions |

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...@....neon.tech/aquadex?sslmode=require

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only

# Google AI (Genkit)
GOOGLE_GENAI_API_KEY=AIza...

# App
NEXT_PUBLIC_APP_URL=https://aquadex.vercel.app
```

## Best Practices & Patterns

### 1. Server Actions for Mutations

Use Server Actions instead of API routes for data mutations:
```typescript
'use server'
import { db } from '@/lib/db'
import { aquariums } from '@/lib/db/schema'

export async function createAquarium(data: AquariumInput) {
  const user = await getCurrentUser()
  return await db.insert(aquariums).values({ ...data, userId: user.id })
}
```

### 2. API Routes for AI Flows

Use API routes for AI workflows that may take longer:
```typescript
// app/api/ai/analyze-test/route.ts
export async function POST(req: Request) {
  const { imageUrl } = await req.json()
  const result = await runFlow(analyzeTestStrip, { imageUrl })
  return Response.json(result)
}
```

### 3. Progressive Enhancement

Build forms that work without JavaScript:
```typescript
<form action={createAquariumAction}>
  {/* Works with JS disabled */}
</form>
```

### 4. Error Boundaries

Wrap features in error boundaries with fallbacks:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <WaterTestAnalysis />
</ErrorBoundary>
```

### 5. Loading States

Use Suspense for better loading UX:
```typescript
<Suspense fallback={<LoadingSkeleton />}>
  <AquariumList />
</Suspense>
```

## Security Considerations

1. **Row Level Security**: Enable Supabase RLS policies to ensure users only access their own data
2. **API Route Protection**: Validate authentication in all API routes
3. **Input Validation**: Use Zod schemas on both client and server
4. **Environment Variables**: Never expose service keys to client
5. **Rate Limiting**: Implement rate limiting on AI endpoints
6. **Image Upload Validation**: Validate file types and sizes

## Performance Optimizations

1. **Server Components**: Use by default, client components only when needed
2. **Streaming**: Stream server components for faster initial load
3. **Image Optimization**: Always use Next.js Image component
4. **Database Indexing**: Index foreign keys and frequently queried columns
5. **Edge Caching**: Cache static content at CDN edge
6. **Lazy Loading**: Code-split heavy components (charts, AI tools)

## Next Steps

With all technology decisions finalized, proceed to:
1. **Phase 1**: Define database schema (data-model.md)
2. **Phase 1**: Design API contracts (contracts/*.yaml)
3. **Phase 1**: Create developer quickstart guide (quickstart.md)
