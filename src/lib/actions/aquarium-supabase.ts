/**
 * Server Actions for Aquarium Management with Supabase
 * Handles CRUD operations for aquariums with real-time data and photo storage
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  createAquarium, 
  getAquarium, 
  getUserAquariums,
  updateAquarium as dbUpdateAquarium,
  deleteAquarium as dbDeleteAquarium
} from '@/lib/database';
import type { Database } from '@/lib/supabase';

type Aquarium = Database['public']['Tables']['aquariums']['Row'];
type AquariumInsert = Database['public']['Tables']['aquariums']['Insert'];
type AquariumUpdate = Database['public']['Tables']['aquariums']['Update'];

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
 * Get current authenticated user
 */
async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Not authenticated');
  }
  
  return user;
}

/**
 * Create a new aquarium
 */
export async function createAquariumAction(data: Omit<AquariumInsert, 'user_id'>) {
  try {
    const user = await getCurrentUser();
    
    const aquarium = await createAquarium({
      ...data,
      user_id: user.id,
    });
    
    revalidatePath('/aquariums');
    revalidatePath('/dashboard');
    
    return { success: true, data: aquarium };
  } catch (error: any) {
    console.error('Error creating aquarium:', error);
    return { success: false, error: error.message || 'Failed to create aquarium' };
  }
}

/**
 * Get all aquariums for the current user
 */
export async function getUserAquariumsAction() {
  try {
    const user = await getCurrentUser();
    const aquariums = await getUserAquariums(user.id);
    
    return { success: true, data: aquariums };
  } catch (error: any) {
    console.error('Error fetching aquariums:', error);
    return { success: false, error: error.message || 'Failed to fetch aquariums' };
  }
}

/**
 * Get a single aquarium by ID
 */
export async function getAquariumAction(aquariumId: string) {
  try {
    const user = await getCurrentUser();
    const aquarium = await getAquarium(aquariumId);
    
    if (!aquarium) {
      return { success: false, error: 'Aquarium not found' };
    }
    
    // Verify ownership
    if (aquarium.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    return { success: true, data: aquarium };
  } catch (error: any) {
    console.error('Error fetching aquarium:', error);
    return { success: false, error: error.message || 'Failed to fetch aquarium' };
  }
}

/**
 * Update an aquarium
 */
export async function updateAquariumAction(aquariumId: string, data: AquariumUpdate) {
  try {
    const user = await getCurrentUser();
    
    // Verify ownership before updating
    const existingAquarium = await getAquarium(aquariumId);
    if (!existingAquarium || existingAquarium.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const aquarium = await dbUpdateAquarium(aquariumId, data);
    
    revalidatePath('/aquariums');
    revalidatePath('/dashboard');
    revalidatePath(`/aquariums/${aquariumId}`);
    
    return { success: true, data: aquarium };
  } catch (error: any) {
    console.error('Error updating aquarium:', error);
    return { success: false, error: error.message || 'Failed to update aquarium' };
  }
}

/**
 * Delete an aquarium
 */
export async function deleteAquariumAction(aquariumId: string) {
  try {
    const user = await getCurrentUser();
    
    // Verify ownership before deleting
    const existingAquarium = await getAquarium(aquariumId);
    if (!existingAquarium || existingAquarium.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    await dbDeleteAquarium(aquariumId);
    
    revalidatePath('/aquariums');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting aquarium:', error);
    return { success: false, error: error.message || 'Failed to delete aquarium' };
  }
}

/**
 * Upload aquarium photo to Supabase Storage
 */
export async function uploadAquariumPhoto(file: File, aquariumId: string) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerSupabaseClient();
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${aquariumId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('aquarium-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('aquarium-photos')
      .getPublicUrl(fileName);
    
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return { success: false, error: error.message || 'Failed to upload photo' };
  }
}

/**
 * Delete aquarium photo from Supabase Storage
 */
export async function deleteAquariumPhoto(photoUrl: string) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerSupabaseClient();
    
    // Extract file path from URL
    const urlParts = photoUrl.split('/aquarium-photos/');
    if (urlParts.length < 2) {
      throw new Error('Invalid photo URL');
    }
    
    const filePath = urlParts[1];
    
    // Verify ownership (file path should start with user ID)
    if (!filePath.startsWith(user.id)) {
      throw new Error('Unauthorized');
    }
    
    const { error } = await supabase.storage
      .from('aquarium-photos')
      .remove([filePath]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    return { success: false, error: error.message || 'Failed to delete photo' };
  }
}

/**
 * Upload multiple aquarium photos
 */
export async function uploadAquariumPhotos(files: File[], aquariumId: string) {
  try {
    const user = await getCurrentUser();
    const uploadPromises = files.map(file => uploadAquariumPhoto(file, aquariumId));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(r => r.success).map(r => r.url);
    const failedUploads = results.filter(r => !r.success);
    
    if (failedUploads.length > 0) {
      console.warn(`${failedUploads.length} photos failed to upload`);
    }
    
    return { 
      success: true, 
      urls: successfulUploads,
      failedCount: failedUploads.length 
    };
  } catch (error: any) {
    console.error('Error uploading photos:', error);
    return { success: false, error: error.message || 'Failed to upload photos' };
  }
}