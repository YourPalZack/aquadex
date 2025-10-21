# Local Fish Store Directory - Quick Reference

## 📁 Documentation Index

### Core Documents
- **[spec.md](./spec.md)** - Feature specification (31 requirements, 4 user stories)
- **[plan.md](./plan.md)** - Implementation plan (architecture & phases)
- **[PLANNING_COMPLETE.md](./PLANNING_COMPLETE.md)** - Phase 0 & 1 completion report

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
**Status**: Planning Complete (Phase 0 & 1) - Ready for `/speckit.tasks`

### Priority Breakdown
- **P1 (MVP)**: Store registration + directory search
- **P2**: Deal creation and management  
- **P3**: Deal discovery aggregation

### Estimated Timeline
- P1: 2-3 days
- P2: 1-2 days
- P3: 1 day
- **Total**: 4-6 days

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
- [ ] Store signup working with email verification
- [ ] Store profiles display all details
- [ ] Search by location within radius
- [ ] Distance calculated and displayed
- [ ] Individual store pages load
- [ ] Gallery images display

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

### Immediate: Phase 2 - Task Breakdown
**Command**: `/speckit.tasks`  
**Output**: `tasks.md` with implementation tasks

### After Tasks: Phase 3 - Implementation
1. Database migrations (stores + deals tables)
2. Server actions (CRUD + search)
3. UI components (10 components)
4. Pages (5-7 pages)
5. Mapbox integration
6. Image uploads
7. Testing

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
