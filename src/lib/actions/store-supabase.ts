/**
 * Server Actions for Local Fish Store Management
 * Handles CRUD operations for stores with geocoding and image storage
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { geocodeAddress } from '@/lib/mapbox';
import type { StoreFormData } from '@/types';

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
      owner_id: user.id,
      business_name: data.business_name,
      slug,
      email: data.email,
      phone: data.phone,
      website: data.website || null,
      description: data.description || null,
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zip: data.address.zip,
      location: `POINT(${geocodeResult.longitude} ${geocodeResult.latitude})`,
      categories: data.categories,
      business_hours: data.business_hours,
      social_links: data.social_links || {},
      is_active: false, // Requires email verification
      verification_status: 'pending' as const,
      gallery_images: [],
    };

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
      .select('owner_id, gallery_images')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.owner_id !== user.id) {
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
    revalidatePath(`/local-fish-stores/${store}`);
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
      .select('owner_id, slug, street, city, state, zip')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.owner_id !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to update this store'
      };
    }

    // Prepare update data
    const updateData: any = {};

    // Check if address changed (requires re-geocoding)
    const addressChanged = data.address && (
      (data.address.street && data.address.street !== store.street) ||
      (data.address.city && data.address.city !== store.city) ||
      (data.address.state && data.address.state !== store.state) ||
      (data.address.zip && data.address.zip !== store.zip)
    );

    if (addressChanged && data.address) {
      const fullAddress = `${data.address.street || store.street}, ${data.address.city || store.city}, ${data.address.state || store.state} ${data.address.zip || store.zip}`;
      const geocodeResult = await geocodeAddress(fullAddress);

      if (!geocodeResult) {
        return {
          success: false,
          error: 'Unable to geocode the provided address. Please verify the address is correct.'
        };
      }

      updateData.location = `POINT(${geocodeResult.longitude} ${geocodeResult.latitude})`;
      if (data.address.street) updateData.street = data.address.street;
      if (data.address.city) updateData.city = data.address.city;
      if (data.address.state) updateData.state = data.address.state;
      if (data.address.zip) updateData.zip = data.address.zip;
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
      .select('owner_id, gallery_images, slug')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    if (store.owner_id !== user.id) {
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
}

export async function searchStoresAction(params: SimpleSearchParams) {
  try {
    const supabase = await createServerSupabaseClient();

    const limit = params.limit ?? 24;
    const offset = params.offset ?? 0;

    // Base query: only verified and active stores
    let query = supabase
      .from('stores')
      .select(
        `id, slug, business_name, city, state, zip, phone, website, categories, gallery_images, verification_status, is_active`
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
        `business_name.ilike.${q},city.ilike.${q},state.ilike.${q},zip.ilike.${q}`
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

    return {
      success: true,
      data: {
        stores: (data || []).map((s) => ({
          ...s,
          distance_miles: null as unknown as number | null,
        })),
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
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
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
