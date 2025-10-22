# Pre-Production Checklist (Local Fish Store Directory)

This checklist captures everything to prepare before going live with the Local Fish Store Directory. You can work through it later; it’s organized by systems and has quick verification steps.

## 1) Access and environments
- [ ] Production environment identified (Vercel project, Supabase project/DB)
- [ ] Team permissions verified (DB admin, Storage admin, Vercel deploy)
- [ ] Secrets management in place (Vercel env vars scoped to prod)

## 2) Environment variables (Production)
Set these in your hosting provider (e.g., Vercel → Project → Settings → Environment Variables):
- [ ] USE_MOCK_DATA=false
- [ ] NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
- [ ] DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
- [ ] NEXT_PUBLIC_MAPBOX_TOKEN=pk.****** (Mapbox public token)
- [ ] NEXTAUTH_SECRET=****** (random 32+ chars)
- [ ] NEXTAUTH_URL=https://your-domain
- [ ] GOOGLE_AI_API_KEY=****** (if AI features are enabled)

Notes:
- DATABASE_URL is used by scripts/migrations; app primarily uses Supabase client + RPCs.
- Keep service-role keys out of client-side envs.

## 3) Database migrations (PostgreSQL + PostGIS)
Choose ONE:

A) Automated (scripted)
- [ ] Point DATABASE_URL to your prod DB
- [ ] Run migrations (from CI/CD or a one-off machine):
  - npm run db:migrate
- [ ] Confirm runner recorded all files in migration_history

B) Manual (Supabase SQL Editor)
- [ ] 0001_create_stores_table.sql (enables postgis; creates stores + indexes/policies)
- [ ] 0002_create_deals_table.sql (deals + indexes/policies)
- [ ] 0003_create_views.sql (active_stores, active_deals, stores_with_deal_count)
- [ ] 0004_create_indexes.sql (extra indexes)
- [ ] 0005_create_search_stores_rpc.sql (RPC for geospatial search)
- [ ] 0006_create_store_images_bucket.sql (bucket + storage policies)

Verification (either path):
- [ ] Extension: SELECT extname FROM pg_extension WHERE extname='postgis'
- [ ] Tables: stores, deals exist
- [ ] Views: active_stores, active_deals, stores_with_deal_count exist
- [ ] Indexes: stores_location_idx (GIST), stores_verified_active_idx, deals_* indexes exist
- [ ] RPC: select * from public.search_stores(p_limit=>1) executes

## 4) Storage buckets (Supabase Storage)
- [ ] Bucket: store-images (public) created
- [ ] Public read policy for store-images
- [ ] Write policies constrained to owner via app logic (ownership enforced in server action)
- [ ] Max file size 5MB (enforced in app; optional storage limit rule)
- [ ] CORS rules as needed for your domain (optional)

## 5) RLS & policies (Security)
- [ ] stores: RLS enabled
  - Public can SELECT verified + active stores
  - Owners (auth.uid() = user_id) can SELECT/UPDATE their store
  - Auth users can INSERT exactly one store
- [ ] deals: RLS enabled with similar owner rules and public read for active deals
- [ ] RPC: GRANT EXECUTE ON FUNCTION public.search_stores TO anon, authenticated
- [ ] Storage: public read for store-images; writes scoped by application ownership logic

## 6) App configuration (Next.js)
- [ ] NEXT_PUBLIC_MAPBOX_TOKEN configured; map loads
- [ ] Allow Supabase Storage domain in next.config images.remotePatterns
- [ ] CSP/headers (if used) allow Mapbox and Supabase asset hosts
- [ ] SEO metadata present for directory and store profile pages
- [ ] Sitemap/robots configured (optional)

## 7) QA test plan (smoke tests)
- Store signup flow
  - [ ] Create store (geocode success; slug unique; store inactive/pending by default)
  - [ ] Update address triggers re-geocoding
  - [ ] Upload image (≤5MB, jpeg/png/webp); appears in gallery
- Directory (SSR)
  - [ ] Search by name/city/state/zip returns results
  - [ ] Category filter narrows results
  - [ ] Use location + radius filters results via SQL (RPC)
  - [ ] Sort=nearest orders by distance
  - [ ] Pagination shows correct total_count and has_more
  - [ ] Distances render consistently on cards and map popups
- Store profile page
  - [ ] Loads by slug; shows address, contact, business hours, images
  - [ ] Verified badge shows for verified stores

## 8) Performance & limits
- [ ] SQL EXPLAIN on search_stores with/without location looks reasonable
- [ ] Check Postgres row counts and index usage
- [ ] RPC timeout budgets acceptable; consider paging limits (24/60)
- [ ] Map tiles usage within Mapbox free tier (or billable plan set)

## 9) Monitoring & backups
- [ ] Supabase Postgres backups scheduled
- [ ] Error tracking (e.g., Sentry) configured (optional)
- [ ] Vercel logs/alerts enabled

## 10) Rollback & recovery
- [ ] Migration history recorded; SQL files are idempotent (use of IF NOT EXISTS / OR REPLACE)
- [ ] DB backup available prior to go-live
- [ ] Known procedure to disable directory temporarily (feature flag, maintenance page)

## 11) Go-live checks
- [ ] USE_MOCK_DATA=false in production
- [ ] search_stores RPC returns data; directory distances match expectations
- [ ] Image uploads go to store-images and render via public URLs
- [ ] SEO checks: titles/descriptions look good; OpenGraph cards render
- [ ] Page speed acceptable on directory and profile pages

## Appendix: where things live
- SQL migrations: `database/migrations/`
- Migration runner: `scripts/run-migrations.mjs` (npm run db:migrate)
- Server actions: `src/lib/actions/store-supabase.ts`
- Mock data (dev-only): `src/lib/mock/mock-stores.ts`
- Mapbox helpers: `src/lib/mapbox.ts`
- Store types: `src/types/store.ts`