# Local Fish Store Directory - Quick Reference

## 📁 Documentation Index

### Core Documents
- **[spec.md](./spec.md)** - Feature specification (31 requirements, 4 user stories)
- **[plan.md](./plan.md)** - Implementation plan (architecture & phases)
- **[tasks.md](./tasks.md)** - Implementation tasks (100 tasks organized by user story) ✨ NEW
- **[PLANNING_COMPLETE.md](./PLANNING_COMPLETE.md)** - Phase 0 & 1 completion report
- **[TASKS_GENERATED.md](./TASKS_GENERATED.md)** - Task generation summary ✨ NEW

### Technical Design
- **[research.md](./research.md)** - Technical decisions (Mapbox, PostGIS, etc.)
- **[data-model.md](./data-model.md)** - Database schema, TypeScript types
- **[contracts/server-actions.md](./contracts/server-actions.md)** - API signatures (15+ actions)

### Developer Guides
- **[quickstart.md](./quickstart.md)** - Setup & implementation guide
- **[checklists/requirements.md](./checklists/requirements.md)** - Quality validation

---

## 🎯 Feature Summary

**Purpose**: Local fish store directory with deals/discounts  
**Branch**: `002-local-store-directory`  
**Status**: Phase 3 in progress – Directory and Store Profiles implemented (URL-driven SSR search, pagination, map popups). Migrations/storage pending for distance and uploads.

### Priority Breakdown
- **P1 (MVP)**: Store registration + directory search (30 tasks)
- **P2**: Deal creation and management (21 tasks)
- **P3**: Deal discovery aggregation (11 tasks)
- **Setup + Foundation**: 13 tasks
- **Polish**: 25 tasks

### Estimated Timeline
- **MVP (P1 only)**: 3-4 days (51 tasks)
- **+ P2 (Deals)**: +2 days (72 tasks total)
- **Complete (All)**: 6-7 days (100 tasks total)

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 15.2+ | App Router, server components |
| Database | Supabase PostgreSQL | Data persistence |
| Geospatial | PostGIS | Distance calculations |
| Maps | Mapbox GL JS | Interactive maps |
| Geocoding | Mapbox API | Address → coordinates |
| Storage | Supabase Storage | Store images |
| Auth | Supabase Auth | Email verification |
| Forms | React Hook Form + Zod | Validation |
| UI | Tailwind + shadcn/ui | Components |

---

## 📊 Data Model

### Stores Table (21 fields)
- Core: `id`, `user_id`, `business_name`, `slug`
- Location: `location` (PostGIS), `street_address`, `city`, `state`, `postal_code`
- Contact: `phone`, `email`, `website`, `social_links`
- Details: `business_hours`, `description`, `categories`
- Media: `profile_image_url`, `gallery_images` (max 5)
- Status: `verification_status`, `is_active`, `verified_at`

### Deals Table (14 fields)
- Core: `id`, `store_id`, `title`, `description`
- Discount: `discount_type`, `discount_value`, `original_price`, `sale_price`
- Dates: `start_date`, `end_date` (validated)
- Status: `is_active`, `status` (calculated)
- Tracking: `view_count`, `created_at`, `updated_at`
- **Constraint**: Max 10 active deals per store

---

## 🔑 Key Server Actions

### Store CRUD
- `createStoreAction` - Register store + geocode
- `updateStoreAction` - Edit profile + re-geocode
- `uploadStoreImageAction` - Upload to Supabase Storage (5MB max)
- `deactivateStoreAction` / `reactivateStoreAction`

### Deal CRUD
- `createDealAction` - New deal (validate 10-deal limit)
- `updateDealAction` - Edit deal
- `deactivateDealAction` / `reactivateDealAction` / `deleteDealAction`

### Search & Discovery
- `searchStoresAction` - PostGIS radius search with distance sorting
- `getStoreBySlugAction` - Store profile + active deals
- `searchDealsAction` - Aggregate deals across stores

### Helpers
- `geocodeAddressAction` - Mapbox Geocoding API wrapper

---

## 🗺️ Page Structure

```
/local-fish-stores              # Directory listing with search
/local-fish-stores/[slug]       # Individual store profile
/store-signup                   # Store owner registration
/store-dashboard                # Store owner management
/store-dashboard/profile        # Edit store details
/store-dashboard/deals          # Manage deals
/store-dashboard/deals/new      # Create new deal
/discounts-deals                # Enhanced with store deals (existing page)
```

---

## 🧩 Components to Build

### Store Components (src/components/local-fish-stores/)
1. **StoreCard** - List item with distance
2. **StoreProfile** - Full profile display
3. **StoreSearchForm** - Location + filters
4. **StoreMap** - Mapbox with markers
5. **StoreGallery** - Image carousel
6. **BusinessHoursDisplay** - Open/closed status
7. **StoreSignupForm** - Registration form

### Deal Components
8. **DealCard** - Deal display
9. **DealForm** - Create/edit form
10. **DealsList** - Filtered list

---

## 🚀 Setup Quick Steps

1. **Environment**: Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local`
2. **Dependencies**: `npm install react-map-gl mapbox-gl`
3. **Database**: Enable PostGIS, run migrations
4. **Storage**: Create `store-images` bucket in Supabase
5. **Verify**: Start dev server, check pages (will 404 until implemented)

See [quickstart.md](./quickstart.md) for detailed setup.

---

## ✅ Quality Checklist

### MVP (P1) Criteria
- [x] Store signup working with email verification (UI + server actions)
- [x] Store profiles display core details (SSR; hours/gallery wired, data pending)
- [ ] Search by location within radius (waiting for PostGIS migrations)
- [ ] Distance calculated and displayed (waiting for PostGIS migrations)
- [x] Individual store pages load (via slug)
- [x] Gallery images display (when images exist; storage pending)

### Performance Targets
- [ ] Store search: <2s for 500+ stores
- [ ] Store profile: <3s load time
- [ ] Map rendering: 50+ markers smoothly

### Technical Requirements
- [ ] TypeScript strict mode (no errors)
- [ ] Zod validation on all forms
- [ ] RLS policies working
- [ ] Mobile responsive (320px-1920px)
- [ ] Image uploads (5MB limit enforced)
- [ ] 10-deal limit enforced

---

## 📋 Next Steps

### Current Implementation Highlights
- Directory page (`/local-fish-stores`):
	- SSR search via server action, driven by URL params: `q`, `categories`, `page`, `pageSize`, `lat`, `lng`, `radius`
	- Pagination with Prev/Next preserving filters
	- Results summary “Showing X–Y of Z”
	- Map with markers and popups (link to detail) when coordinates exist
- Store profile (`/local-fish-stores/[slug]`):
	- SSR page via `getStoreBySlugAction`
	- Business hours and gallery components wired (shown when data exists)
	- SEO metadata generated for both directory and profile pages

### What’s Pending (Manual + Follow-ups)
1. Supabase manual steps:
	 - Run migrations (enables coordinates + distance)
	 - Create `store-images` storage bucket (enables uploads)
2. Distance & radius filtering in `searchStoresAction` (PostGIS)
3. Map clustering and richer popovers
4. Typecheck/lint cleanup across unrelated legacy files
5. Deals pages and actions (P2)

### Quick Usage
- Search URL examples:
	- `/local-fish-stores?q=seattle`
	- `/local-fish-stores?categories=freshwater,plants&page=2&pageSize=36`
	- `/local-fish-stores?q=reef&lat=47.6&lng=-122.3&radius=25`

### Setup Reminders
1. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local`
2. Install dependencies (Mapbox packages present in `package.json`)
3. Run Supabase migrations and create storage bucket when ready

---

## 📚 Key Documents Deep Dive

### [research.md](./research.md) - 6 Decisions
1. Mapbox vs Google Maps vs Leaflet → **Mapbox** (generous free tier)
2. Mapbox vs Google vs PostGIS Nominatim → **Mapbox** (accuracy)
3. PostGIS vs Haversine vs Distance Matrix → **PostGIS** (performance)
4. Supabase Auth vs Custom vs SendGrid → **Supabase Auth** (built-in)
5. DB view vs pg_cron vs client vs Vercel → **DB view** (MVP simplicity)
6. Supabase vs Cloudinary vs optimization → **Supabase + Next.js** (unified)

### [data-model.md](./data-model.md) - Schema
- Complete SQL migrations for stores and deals tables
- PostGIS GEOGRAPHY(POINT,4326) for locations
- GiST spatial indexes for performance
- RLS policies for security
- TypeScript interfaces matching schema
- Business hours JSONB structure
- Gallery images TEXT[] with 5-image limit

### [contracts/server-actions.md](./contracts/server-actions.md) - APIs
- 15+ server actions with full signatures
- ActionResult<T> pattern for consistent error handling
- Zod validation schemas
- revalidatePath strategy for cache invalidation
- PostGIS query examples
- Error handling patterns

---

## 🎓 Learning Resources

- **Mapbox Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **PostGIS Workshop**: https://postgis.net/workshops/postgis-intro/
- **React Map GL**: https://visgl.github.io/react-map-gl/
- **Supabase PostGIS**: https://supabase.com/docs/guides/database/extensions/postgis

---

**Last Updated**: October 20, 2025  
**Version**: 1.0  
**Status**: 🟢 Phase 1 Complete
