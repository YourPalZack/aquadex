/**
 * Server Actions for Local Fish Store Management
 * Handles CRUD operations for stores with geocoding and image storage
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { geocodeAddress } from '@/lib/mapbox';
import { mockStores } from '@/lib/mock/mock-stores';
import type { StoreFormData } from '@/types/store';

/**
 * Maximum file size for store images (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Create a Supabase server client for server actions
 */
async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  );
}

/**
 * Generate a URL-safe slug from store name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Haversine distance between two lat/lng points in miles
 */
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Create a new store with geocoding
 * T017: Implement createStoreAction
 */
export async function createStoreAction(data: StoreFormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a store'
      };
    }

    // Geocode the address
    const fullAddress = `${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zip}`;
    const geocodeResult = await geocodeAddress(fullAddress);

    if (!geocodeResult) {
      return {
        success: false,
        error: 'Unable to geocode the provided address. Please verify the address is correct.'
      };
    }

  // Generate unique slug
    let slug = generateSlug(data.business_name);
    let slugSuffix = 1;
    
    // Check if slug exists and make it unique
    while (true) {
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      
      slug = `${generateSlug(data.business_name)}-${slugSuffix}`;
      slugSuffix++;
    }

    // Prepare store data for insertion
    const storeData = {
      user_id: user.id,
      business_name: data.business_name,
      slug,
      email: data.email,
      phone: data.phone,
      website: data.website || null,
      description: data.description || null,
      street_address: data.address.street,
      city: data.address.city,
      state: data.address.state,
      postal_code: data.address.zip,
      country: data.address.country || 'US',
      location: `POINT(${geocodeResult.longitude} ${geocodeResult.latitude})`,
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      categories: data.categories,
      business_hours: data.business_hours,
      social_links: data.social_links || {},
      is_active: false, // Requires email verification or manual activation
      verification_status: 'pending' as const,
      gallery_images: [],
    } as const;

    // Insert store
    const { data: newStore, error: insertError } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (insertError) {
      console.error('Store creation error:', insertError);
      return {
        success: false,
        error: 'Failed to create store. Please try again.'
      };
    }

    // Revalidate paths
    revalidatePath('/local-fish-stores');
    revalidatePath('/store-dashboard');

    return {
      success: true,
      data: newStore
    };
  } catch (error) {
    console.error('Unexpected error in createStoreAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Upload store image to Supabase Storage
 * T018: Implement uploadStoreImageAction
 */
export async function uploadStoreImageAction(storeId: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to upload images'
      };
    }

    // Verify user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
  .select('user_id, gallery_images, slug')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.user_id !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to upload images to this store'
      };
    }

    // Check gallery limit (max 5 images)
    if (store.gallery_images && store.gallery_images.length >= 5) {
      return {
        success: false,
        error: 'Maximum of 5 images allowed per store'
      };
    }

    // Get image file from FormData
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return {
        success: false,
        error: 'No image file provided'
      };
    }

    // Validate file size
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: 'Image size must be less than 5MB'
      };
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return {
        success: false,
        error: 'Image must be JPEG, PNG, or WebP format'
      };
    }

    // Generate unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${storeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('store-images')
      .getPublicUrl(fileName);

    // Update store gallery_images array
    const updatedGallery = [...(store.gallery_images || []), publicUrl];
    
    const { error: updateError } = await supabase
      .from('stores')
      .update({ gallery_images: updatedGallery })
      .eq('id', storeId);

    if (updateError) {
      console.error('Gallery update error:', updateError);
      // Try to delete the uploaded file since we couldn't update the database
      await supabase.storage.from('store-images').remove([fileName]);
      
      return {
        success: false,
        error: 'Failed to update store gallery. Please try again.'
      };
    }

    // Revalidate paths
  revalidatePath(`/local-fish-stores/${store.slug}`);
    revalidatePath('/store-dashboard');

    return {
      success: true,
      data: {
        imageUrl: publicUrl,
        fileName: uploadData.path
      }
    };
  } catch (error) {
    console.error('Unexpected error in uploadStoreImageAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Update store information
 * T019: Implement updateStoreAction
 */
export async function updateStoreAction(storeId: string, data: Partial<StoreFormData>) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update a store'
      };
    }

    // Verify user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
  .select('user_id, slug, street_address, city, state, postal_code')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.user_id !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to update this store'
      };
    }

    // Prepare update data
    const updateData: any = {};

    // Check if address changed (requires re-geocoding)
    const addressChanged = data.address && (
      (data.address.street && data.address.street !== store.street_address) ||
      (data.address.city && data.address.city !== store.city) ||
      (data.address.state && data.address.state !== store.state) ||
      (data.address.zip && data.address.zip !== store.postal_code)
    );

    if (addressChanged && data.address) {
  const fullAddress = `${data.address.street || store.street_address}, ${data.address.city || store.city}, ${data.address.state || store.state} ${data.address.zip || store.postal_code}`;
      const geocodeResult = await geocodeAddress(fullAddress);

      if (!geocodeResult) {
        return {
          success: false,
          error: 'Unable to geocode the provided address. Please verify the address is correct.'
        };
      }

      updateData.location = `POINT(${geocodeResult.longitude} ${geocodeResult.latitude})`;
      updateData.latitude = geocodeResult.latitude;
      updateData.longitude = geocodeResult.longitude;
      if (data.address.street) updateData.street_address = data.address.street;
      if (data.address.city) updateData.city = data.address.city;
      if (data.address.state) updateData.state = data.address.state;
      if (data.address.zip) updateData.postal_code = data.address.zip;
    }

    // Update other fields
    if (data.business_name) updateData.business_name = data.business_name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.categories) updateData.categories = data.categories;
    if (data.business_hours) updateData.business_hours = data.business_hours;
    if (data.social_links !== undefined) updateData.social_links = data.social_links || {};

    // Update store
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Store update error:', updateError);
      return {
        success: false,
        error: 'Failed to update store. Please try again.'
      };
    }

    // Revalidate paths
    revalidatePath(`/local-fish-stores/${store.slug}`);
    revalidatePath('/store-dashboard');
    revalidatePath('/local-fish-stores');

    return {
      success: true,
      data: updatedStore
    };
  } catch (error) {
    console.error('Unexpected error in updateStoreAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Delete store image from gallery
 * T020: Implement deleteStoreImageAction
 */
export async function deleteStoreImageAction(storeId: string, imageUrl: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete images'
      };
    }

    // Verify user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
  .select('user_id, gallery_images, slug')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.user_id !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to delete images from this store'
      };
    }

    // Check if image exists in gallery
    if (!store.gallery_images || !store.gallery_images.includes(imageUrl)) {
      return {
        success: false,
        error: 'Image not found in store gallery'
      };
    }

    // Extract file path from URL
    const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/store-images/`;
    const filePath = imageUrl.replace(bucketUrl, '');

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('store-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Image deletion error:', deleteError);
      // Continue with database update even if storage deletion fails
    }

    // Update gallery_images array (remove the image URL)
    const updatedGallery = store.gallery_images.filter((url: string) => url !== imageUrl);
    
    const { error: updateError } = await supabase
      .from('stores')
      .update({ gallery_images: updatedGallery })
      .eq('id', storeId);

    if (updateError) {
      console.error('Gallery update error:', updateError);
      return {
        success: false,
        error: 'Failed to update store gallery. Please try again.'
      };
    }

    // Revalidate paths
    revalidatePath(`/local-fish-stores/${store.slug}`);
    revalidatePath('/store-dashboard');

    return {
      success: true,
      data: { imageUrl }
    };
  } catch (error) {
    console.error('Unexpected error in deleteStoreImageAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Search stores with optional filters
 * Note: Distance calculation will be added once PostGIS migrations are applied.
 */
export interface SimpleSearchParams {
  q?: string;
  categories?: string[];
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  radius?: number; // miles (UI only for now)
  sort_by?: 'latest' | 'nearest';
}

export async function searchStoresAction(params: SimpleSearchParams) {
  try {
    // Mock mode: return filtered/paginated mock stores without DB
    if (process.env.USE_MOCK_DATA === 'true') {
      const limit = params.limit ?? 24;
      const offset = params.offset ?? 0;
      const q = (params.q || '').trim().toLowerCase();

      // Filter
      let filtered = mockStores.filter((s) => s.verification_status !== 'rejected' && (s.is_active ?? true));
      if (q) {
        filtered = filtered.filter((s) => {
          const text = `${s.business_name} ${s.city} ${s.state} ${s.zip}`.toLowerCase();
          return text.includes(q);
        });
      }
      if (params.categories && params.categories.length) {
        const set = new Set(params.categories);
        filtered = filtered.filter((s) => s.categories.some((c) => set.has(c)));
      }

      // Compute distance from user if present
      const hasUser = typeof params.lat === 'number' && typeof params.lng === 'number';
      let withDistance = filtered.map((s) => {
        const latitude = s.latitude ?? null;
        const longitude = s.longitude ?? null;
        let distance_miles: number | null = null;
        if (hasUser && typeof latitude === 'number' && typeof longitude === 'number') {
          distance_miles = haversineMiles(params.lat as number, params.lng as number, latitude, longitude);
        }
        return {
          id: s.id,
          slug: s.slug,
          business_name: s.business_name,
          city: s.city,
          state: s.state,
          zip: s.zip,
          phone: s.phone ?? null,
          website: s.website ?? null,
          categories: s.categories,
          gallery_images: s.gallery_images ?? [],
          verification_status: s.verification_status ?? 'verified',
          latitude,
          longitude,
          distance_miles,
        };
      });

      // Apply radius if provided
      if (hasUser && typeof params.radius === 'number') {
        withDistance = withDistance.filter((s: any) => typeof s.distance_miles === 'number' && (s.distance_miles as number) <= (params.radius as number));
      }

      // Sort
      if (params.sort_by === 'nearest' && hasUser) {
        withDistance.sort((a: any, b: any) => (a.distance_miles ?? Infinity) - (b.distance_miles ?? Infinity));
      } else {
        // Stable order for mock: by name desc as a proxy for "latest"
        withDistance.sort((a: any, b: any) => b.business_name.localeCompare(a.business_name));
      }

      // Pagination on filtered set
      const total_count = withDistance.length;
      const paged = withDistance.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          stores: paged,
          total_count,
          has_more: total_count > offset + paged.length,
        },
      } as const;
    }

    const supabase = await createServerSupabaseClient();

    const limit = params.limit ?? 24;
    const offset = params.offset ?? 0;

    // Prefer RPC with PostGIS if available
    try {
      const { data: rpcData, error: rpcError } = await (async () => {
        // Call RPC when available; works for both geo and non-geo queries
        const payload: any = {
          p_q: params.q ?? null,
          p_categories: params.categories && params.categories.length ? params.categories : null,
          p_lat: typeof params.lat === 'number' ? params.lat : null,
          p_lng: typeof params.lng === 'number' ? params.lng : null,
          p_radius_miles: typeof params.radius === 'number' ? params.radius : null,
          p_limit: limit,
          p_offset: offset,
          p_sort_by: params.sort_by ?? 'latest',
        };
        return await supabase.rpc('search_stores', payload);
      })();

      if (!rpcError && Array.isArray(rpcData)) {
        const stores = rpcData.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          business_name: row.business_name,
          city: row.city,
          state: row.state,
          zip: row.postal_code,
          phone: row.phone,
          website: row.website,
          categories: row.categories,
          gallery_images: row.gallery_images,
          verification_status: row.verification_status,
          latitude: typeof row.latitude === 'number' ? row.latitude : Number(row.latitude),
          longitude: typeof row.longitude === 'number' ? row.longitude : Number(row.longitude),
          distance_miles: row.distance_miles != null ? Number(row.distance_miles) : null,
        }));

        const total_count = rpcData.length > 0 ? Number(rpcData[0].total_count) : 0;
        const has_more = total_count > offset + stores.length;

        return {
          success: true,
          data: { stores, total_count, has_more },
        } as const;
      }
      // If RPC exists but errored, fall through to legacy path
    } catch {
      // ignore and use legacy
    }

    // Base query: only verified and active stores
    let query = supabase
      .from('stores')
      .select(
        `id, slug, business_name, city, state, zip:postal_code, phone, website, categories, gallery_images, verification_status, is_active, latitude, longitude`
      , { count: 'exact' })
      .eq('is_active', true)
      .eq('verification_status', 'verified' as any)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Text search
    if (params.q && params.q.trim().length > 0) {
      const q = `%${params.q.trim()}%`;
      // PostgREST doesn't support OR ilike across multiple columns in one call; use filter() with or syntax
      query = query.or(
        `business_name.ilike.${q},city.ilike.${q},state.ilike.${q},postal_code.ilike.${q}`
      );
    }

    // Category overlap filter
    if (params.categories && params.categories.length > 0) {
      query = query.overlaps('categories' as any, params.categories as any);
    }

  const { data, error, count } = await query;

    if (error) {
      return { success: false, error: 'Failed to search stores' };
    }

    // Compute distance if user coordinates are provided
    const hasUserCoords = typeof params.lat === 'number' && typeof params.lng === 'number';
    let storesWithDistance = (data || []).map((s: any) => {
      let distance_miles: number | null = null;
      if (hasUserCoords && typeof s.latitude === 'number' && typeof s.longitude === 'number') {
        distance_miles = haversineMiles(params.lat as number, params.lng as number, s.latitude, s.longitude);
      }
      return { ...s, distance_miles };
    });

    // Temporary: apply radius filter client-side on current page until PostGIS is enabled
    if (hasUserCoords && typeof params.radius === 'number') {
      storesWithDistance = storesWithDistance.filter((s: any) => typeof s.distance_miles === 'number' && (s.distance_miles as number) <= (params.radius as number));
    }

    // Optional sort by nearest for current page results
    if (params.sort_by === 'nearest' && hasUserCoords) {
      storesWithDistance = storesWithDistance.sort((a: any, b: any) => {
        const da = typeof a.distance_miles === 'number' ? a.distance_miles : Number.POSITIVE_INFINITY;
        const db = typeof b.distance_miles === 'number' ? b.distance_miles : Number.POSITIVE_INFINITY;
        return da - db;
      });
    }

    return {
      success: true,
      data: {
        stores: storesWithDistance,
        total_count: count ?? (data?.length ?? 0),
        has_more: (count ?? 0) > offset + (data?.length ?? 0),
      },
    };
  } catch (err) {
    return { success: false, error: 'Unexpected error searching stores' };
  }
}

/**
 * Get a store by slug
 */
export async function getStoreBySlugAction(slug: string) {
  try {
    // Mock mode: find by slug
    if (process.env.USE_MOCK_DATA === 'true') {
      const s = mockStores.find((m) => m.slug === slug);
      if (!s) return { success: false, error: 'Store not found' } as const;
      return {
        success: true,
        data: {
          id: s.id,
          slug: s.slug,
          business_name: s.business_name,
          email: s.email ?? null,
          phone: s.phone ?? null,
          website: s.website ?? null,
          description: s.description ?? null,
          street: s.street ?? '123 Main Street',
          city: s.city,
          state: s.state,
          zip: s.zip,
          country: s.country ?? 'US',
          business_hours: s.business_hours ?? {
            monday: { open: '10:00', close: '19:00' },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '19:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '20:00' },
            saturday: { open: '10:00', close: '18:00' },
            sunday: { open: '12:00', close: '17:00' },
          },
          categories: s.categories,
          gallery_images: s.gallery_images ?? [],
          verification_status: s.verification_status ?? 'verified',
          is_active: s.is_active ?? true,
          latitude: s.latitude ?? null,
          longitude: s.longitude ?? null,
        },
      } as const;
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('stores')
      .select(`
        id, slug, business_name, email, phone, website, description,
        street:street_address, city, state, zip:postal_code, country,
        business_hours, categories, gallery_images,
        verification_status, is_active,
        latitude, longitude
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return { success: false, error: 'Store not found' };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Unexpected error fetching store' };
  }
}
