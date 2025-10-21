# Server Actions Contracts

**Feature**: Local Fish Store Directory  
**Date**: October 20, 2025  
**Phase**: 1 - Design & Contracts

## Overview

Server actions provide type-safe mutations for store and deal management. All actions follow the pattern:

```typescript
'use server';

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

---

## Store Actions

### `createStoreAction`

**Purpose**: Create a new store profile after user registration

**Location**: `src/lib/actions/store-supabase.ts`

**Signature**:
```typescript
async function createStoreAction(
  data: StoreFormData
): Promise<ActionResult<Store>>
```

**Input** (`StoreFormData`):
```typescript
interface StoreFormData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  business_hours: BusinessHours;
  specialties: StoreCategory[];
  payment_methods?: string[];
  social_links?: SocialLinks;
}
```

**Process**:
1. Validate input with Zod schema
2. Check user is authenticated
3. Check user doesn't already have a store
4. Geocode address using Mapbox API
5. Generate slug from business name + city + state
6. Insert into `stores` table with location as PostGIS POINT
7. Revalidate `/local-fish-stores` path
8. Return created store

**Output**:
```typescript
{
  success: true,
  data: Store, // Full store object with id
  message: "Store created successfully. Email verification required."
}
```

**Errors**:
- "Not authenticated" (401)
- "User already has a store" (400)
- "Invalid address - could not geocode" (400)
- "Store name already taken" (409)
- Database error (500)

---

### `updateStoreAction`

**Purpose**: Update store profile details

**Signature**:
```typescript
async function updateStoreAction(
  storeId: string,
  data: Partial<StoreFormData>
): Promise<ActionResult<Store>>
```

**Input**:
- `storeId`: UUID of store to update
- `data`: Partial store form data (only fields to update)

**Process**:
1. Validate input
2. Check user owns this store
3. If address changed, re-geocode
4. If business_name changed, regenerate slug
5. Update store record
6. Revalidate store profile path
7. Return updated store

**Output**:
```typescript
{
  success: true,
  data: Store,
  message: "Store updated successfully"
}
```

**Errors**:
- "Not authenticated" (401)
- "Store not found" (404)
- "Unauthorized - not store owner" (403)
- "Business name already taken" (409)
- Database error (500)

---

### `uploadStoreImageAction`

**Purpose**: Upload profile or gallery image to Supabase Storage

**Signature**:
```typescript
async function uploadStoreImageAction(
  storeId: string,
  file: File,
  imageType: 'profile' | 'gallery'
): Promise<ActionResult<string>> // Returns image URL
```

**Input**:
- `storeId`: Store UUID
- `file`: Image file (max 5MB, jpg/png/webp)
- `imageType`: 'profile' for main image, 'gallery' for gallery images

**Process**:
1. Validate user owns store
2. Validate file size and type
3. Generate unique filename: `{storeId}/{imageType}-{timestamp}.{ext}`
4. Upload to Supabase Storage bucket `store-images`
5. Get public URL
6. Update store record with image URL
7. Return image URL

**Output**:
```typescript
{
  success: true,
  data: "https://supabase.co/storage/v1/object/public/store-images/...",
  message: "Image uploaded successfully"
}
```

**Errors**:
- "Not authenticated" (401)
- "Unauthorized" (403)
- "File too large (max 5MB)" (400)
- "Invalid file type" (400)
- "Gallery limit reached (max 5)" (400)
- Storage error (500)

---

### `deleteStoreImageAction`

**Purpose**: Delete gallery image from store

**Signature**:
```typescript
async function deleteStoreImageAction(
  storeId: string,
  imageUrl: string
): Promise<ActionResult<void>>
```

**Input**:
- `storeId`: Store UUID
- `imageUrl`: Full URL of image to delete

**Process**:
1. Validate user owns store
2. Check image belongs to this store
3. Delete from Supabase Storage
4. Remove URL from store's `gallery_images` array
5. Return success

**Output**:
```typescript
{
  success: true,
  message: "Image deleted successfully"
}
```

---

### `deactivateStoreAction`

**Purpose**: Temporarily deactivate store (soft delete)

**Signature**:
```typescript
async function deactivateStoreAction(
  storeId: string,
  reason?: string
): Promise<ActionResult<void>>
```

**Process**:
1. Validate user owns store
2. Set `is_active = false` and `inactive_since = NOW()`
3. Automatically deactivate all active deals
4. Revalidate directory path
5. Return success

**Output**:
```typescript
{
  success: true,
  message: "Store deactivated. Reactivate within 90 days to avoid data deletion."
}
```

---

### `reactivateStoreAction`

**Purpose**: Reactivate a deactivated store (within 90 days)

**Signature**:
```typescript
async function reactivateStoreAction(
  storeId: string
): Promise<ActionResult<Store>>
```

**Process**:
1. Validate user owns store
2. Check inactive_since is within 90 days
3. Set `is_active = true` and `inactive_since = null`
4. Require re-verification if > 90 days
5. Revalidate directory
6. Return updated store

**Output**:
```typescript
{
  success: true,
  data: Store,
  message: "Store reactivated successfully"
}
```

**Errors**:
- "Store data expired. Please re-register." (if > 90 days)

---

## Deal Actions

### `createDealAction`

**Purpose**: Create a new promotional deal

**Signature**:
```typescript
async function createDealAction(
  storeId: string,
  data: DealFormData
): Promise<ActionResult<Deal>>
```

**Input** (`DealFormData`):
```typescript
interface DealFormData {
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value?: number;
  discount_text?: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  applicable_categories?: string[];
  terms_conditions?: string;
}
```

**Process**:
1. Validate input with Zod schema
2. Check user owns store
3. Check store is verified
4. Check active deals count < 10
5. Validate dates (end >= start, start >= today)
6. Insert deal with status = 'active'
7. Revalidate store profile and deals pages
8. Return created deal

**Output**:
```typescript
{
  success: true,
  data: Deal,
  message: "Deal created successfully"
}
```

**Errors**:
- "Not authenticated" (401)
- "Store not verified" (403)
- "Maximum 10 active deals reached" (400)
- "Invalid date range" (400)
- "Title already exists for this store" (409)

---

### `updateDealAction`

**Purpose**: Update existing deal details

**Signature**:
```typescript
async function updateDealAction(
  dealId: string,
  data: Partial<DealFormData>
): Promise<ActionResult<Deal>>
```

**Process**:
1. Validate input
2. Check user owns the store this deal belongs to
3. Check deal is not expired
4. Update deal record
5. Revalidate paths
6. Return updated deal

**Output**:
```typescript
{
  success: true,
  data: Deal,
  message: "Deal updated successfully"
}
```

**Errors**:
- "Deal not found" (404)
- "Cannot edit expired deal" (400)
- "Unauthorized" (403)

---

### `deactivateDealAction`

**Purpose**: Manually deactivate a deal before expiration

**Signature**:
```typescript
async function deactivateDealAction(
  dealId: string
): Promise<ActionResult<void>>
```

**Process**:
1. Check user owns store
2. Set deal status = 'inactive'
3. Revalidate pages
4. Return success

**Output**:
```typescript
{
  success: true,
  message: "Deal deactivated"
}
```

---

### `reactivateDealAction`

**Purpose**: Reactivate an inactive deal (if not expired)

**Signature**:
```typescript
async function reactivateDealAction(
  dealId: string
): Promise<ActionResult<Deal>>
```

**Process**:
1. Check user owns store
2. Check end_date >= today
3. Check active deals count < 10
4. Set status = 'active'
5. Return updated deal

**Output**:
```typescript
{
  success: true,
  data: Deal,
  message: "Deal reactivated"
}
```

**Errors**:
- "Deal has expired" (400)
- "Maximum active deals reached" (400)

---

### `deleteDealAction`

**Purpose**: Permanently delete a deal

**Signature**:
```typescript
async function deleteDealAction(
  dealId: string
): Promise<ActionResult<void>>
```

**Process**:
1. Check user owns store
2. Delete deal record
3. Revalidate pages
4. Return success

**Output**:
```typescript
{
  success: true,
  message: "Deal deleted permanently"
}
```

---

## Query Actions (Read-Only)

### `searchStoresAction`

**Purpose**: Search stores by location and filters

**Signature**:
```typescript
async function searchStoresAction(
  params: StoreSearchParams
): Promise<ActionResult<StoreSearchResult>>
```

**Input**:
```typescript
interface StoreSearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // miles (default: 25, max: 100)
  specialties?: StoreCategory[];
  searchQuery?: string; // search in business_name, city
  limit?: number; // default: 20, max: 100
  offset?: number; // for pagination
}

interface StoreSearchResult {
  stores: Store[]; // with distance_miles and is_open computed
  total_count: number;
  has_more: boolean;
}
```

**Process**:
1. Validate inputs
2. Build PostGIS query with ST_DWithin for radius filter
3. Add specialty filters if provided
4. Add text search if query provided
5. Calculate distance for each result
6. Order by distance ASC
7. Apply pagination
8. Return stores with metadata

**Output**:
```typescript
{
  success: true,
  data: {
    stores: Store[],
    total_count: 42,
    has_more: true
  }
}
```

---

### `getStoreBySlugAction`

**Purpose**: Get full store profile by slug

**Signature**:
```typescript
async function getStoreBySlugAction(
  slug: string
): Promise<ActionResult<StoreWithDeals>>
```

**Process**:
1. Query store by slug
2. Check store is verified and active
3. JOIN active deals
4. Calculate is_open status
5. Return store with deals

**Output**:
```typescript
{
  success: true,
  data: StoreWithDeals // Store + deals array
}
```

**Errors**:
- "Store not found" (404)

---

### `getStoreDealsAction`

**Purpose**: Get all deals for a store (including inactive for owner)

**Signature**:
```typescript
async function getStoreDealsAction(
  storeId: string,
  includeInactive?: boolean // only if user owns store
): Promise<ActionResult<Deal[]>>
```

**Process**:
1. Query deals for store
2. If not owner, filter to active only
3. Order by end_date ASC
4. Return deals

**Output**:
```typescript
{
  success: true,
  data: Deal[]
}
```

---

### `searchDealsAction`

**Purpose**: Search all active deals across stores

**Signature**:
```typescript
async function searchDealsAction(
  params: DealSearchParams
): Promise<ActionResult<DealSearchResult>>
```

**Input**:
```typescript
interface DealSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  categories?: string[];
  discount_type?: DiscountType;
  sort_by?: 'distance' | 'end_date' | 'discount_value';
  limit?: number;
  offset?: number;
}

interface DealSearchResult {
  deals: Deal[]; // with store info and distance
  total_count: number;
  has_more: boolean;
}
```

**Process**:
1. Query active_deals view
2. Apply location filter if provided
3. Apply category and type filters
4. Sort by selected field
5. Paginate and return

**Output**:
```typescript
{
  success: true,
  data: {
    deals: Deal[],
    total_count: 156,
    has_more: true
  }
}
```

---

## Geocoding Helper

### `geocodeAddressAction`

**Purpose**: Convert address to coordinates (used internally)

**Signature**:
```typescript
async function geocodeAddressAction(
  address: string
): Promise<ActionResult<{ latitude: number; longitude: number }>>
```

**Process**:
1. Call Mapbox Geocoding API
2. Parse response
3. Return coordinates

**Output**:
```typescript
{
  success: true,
  data: { latitude: 42.3601, longitude: -71.0589 }
}
```

**Errors**:
- "Address not found" (404)
- "Geocoding service unavailable" (503)

---

## Error Handling Pattern

All actions follow this error handling pattern:

```typescript
try {
  // Validation
  const validated = schema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: 'Validation failed',
      message: validated.error.errors[0].message
    };
  }

  // Business logic
  const result = await performOperation(validated.data);

  return {
    success: true,
    data: result,
    message: 'Operation successful'
  };

} catch (error) {
  console.error('Action error:', error);
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    message: 'Operation failed. Please try again.'
  };
}
```

---

## Revalidation Strategy

**After Mutations**:
- Store create/update: `revalidatePath('/local-fish-stores')`
- Store profile update: `revalidatePath(`/local-fish-stores/${slug}`)`
- Deal create/update/delete: `revalidatePath('/discounts-deals')` + store path
- Image upload: `revalidatePath(/local-fish-stores/${slug})`

**Cache Tags** (Optional future enhancement):
- `store-${storeId}`
- `deal-${dealId}`
- `stores-search-${locationHash}`

---

## Server Actions Complete

All CRUD operations defined with type-safe signatures, validation, and error handling. Ready for implementation.
