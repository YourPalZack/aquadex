# Staging Validation: Local Fish Store Directory

Use this guide to validate the LFS feature against a staging Supabase project.

## Prereqs
- Supabase project with:
  - PostGIS enabled
  - Migrations applied (including `search_stores` RPC)
  - `stores` table populated with a few rows (`slug`, `is_active` true)
- Env:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

## 1) Run migrations
If you haven’t yet applied migrations to staging, use the migration runner (ensure creds are set appropriately for your staging environment).

> Note: You can also apply SQL manually in the Supabase SQL editor if preferred.

## 2) Quick connectivity + RPC check
```
# San Francisco example
NEXT_PUBLIC_SUPABASE_URL=... \
NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
npm run validate:stores -- --lat=37.7749 --lng=-122.4194 --radius=25
```
- Confirms DB connectivity
- Lists up to 5 store slugs
- Attempts `rpc('search_stores', ...)` and logs result count

If your RPC has different parameter names, tweak `scripts/validate-search-stores.mjs` accordingly.

## 3) XML sitemap expansion (non-mock)
When `USE_MOCK_DATA=false`, `src/app/sitemap.ts` will fetch up to 500 active store slugs from the `stores` table if `SITEMAP_FETCH_STORES` is not `false`.
- To enable DB-backed sitemaps in staging:
```
USE_MOCK_DATA=false \
SITEMAP_FETCH_STORES=true \
NEXT_PUBLIC_SUPABASE_URL=... \
NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
npm run build && npm start
```

If DB fetch fails, sitemap falls back to core routes only.

## 4) RLS & Storage policies
- Stores table RLS: ensure read for public (or restricted if needed), write for owners/admins
- Bucket `store-images`:
  - Public read or signed URL policy for reads
  - Owner-only write/delete on object paths (e.g., prefix by user or store id)

Sample policy outlines are included in the pre-production checklist; draft SQL can be added as a migration when your exact schema is finalized.

## 5) Manual UX checks
- Directory loads without mock data
- Filters, sorting (nearest, latest) function with live data
- Profile pages open; images load from `store-images`
- /sitemap.xml includes store slugs (if enabled)

## Troubleshooting
- If RPC fails, inspect Supabase SQL editor for the function signature and permissions (GRANT EXECUTE to `anon`/`authenticated` as appropriate).
- Check PostGIS availability (`CREATE EXTENSION IF NOT EXISTS postgis;`).
- Inspect policies in the Auth section (Policies tab) for RLS contexts.
