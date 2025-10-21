/**
 * Server Actions for Water Testing with Supabase
 * Handles CRUD operations for water quality tests with real-time data
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  createWaterTest, 
  getWaterTest, 
  getUserWaterTests,
  getAquariumWaterTests,
  updateWaterTest as dbUpdateWaterTest,
  deleteWaterTest as dbDeleteWaterTest
} from '@/lib/database';
import type { Database } from '@/lib/supabase';

type WaterTest = Database['public']['Tables']['water_tests']['Row'];
type WaterTestInsert = Database['public']['Tables']['water_tests']['Insert'];
type WaterTestUpdate = Database['public']['Tables']['water_tests']['Update'];

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
 * Create a new water test
 */
export async function createWaterTestAction(data: Omit<WaterTestInsert, 'user_id'>) {
  try {
    const user = await getCurrentUser();
    
    const waterTest = await createWaterTest({
      ...data,
      user_id: user.id,
      test_date: data.test_date || new Date().toISOString()
    });
    
    revalidatePath('/water-tests');
    revalidatePath('/water-tests/analytics');
    revalidatePath(`/aquariums/${data.aquarium_id}`);
    
    return { success: true, data: waterTest };
  } catch (error: any) {
    console.error('Error creating water test:', error);
    return { success: false, error: error.message || 'Failed to create water test' };
  }
}

/**
 * Get all water tests for the current user
 */
export async function getUserWaterTestsAction(limit?: number) {
  try {
    const user = await getCurrentUser();
    const waterTests = await getUserWaterTests(user.id, limit);
    
    return { success: true, data: waterTests };
  } catch (error: any) {
    console.error('Error fetching water tests:', error);
    return { success: false, error: error.message || 'Failed to fetch water tests' };
  }
}

/**
 * Get water tests for a specific aquarium
 */
export async function getAquariumWaterTestsAction(aquariumId: string, limit?: number) {
  try {
    const user = await getCurrentUser();
    const waterTests = await getAquariumWaterTests(aquariumId, limit);
    
    return { success: true, data: waterTests };
  } catch (error: any) {
    console.error('Error fetching aquarium water tests:', error);
    return { success: false, error: error.message || 'Failed to fetch aquarium water tests' };
  }
}

/**
 * Get a single water test by ID
 */
export async function getWaterTestAction(testId: string) {
  try {
    const user = await getCurrentUser();
    const waterTest = await getWaterTest(testId);
    
    if (!waterTest) {
      return { success: false, error: 'Water test not found' };
    }
    
    // Verify ownership through aquarium
    if ((waterTest as any).aquariums?.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    return { success: true, data: waterTest };
  } catch (error: any) {
    console.error('Error fetching water test:', error);
    return { success: false, error: error.message || 'Failed to fetch water test' };
  }
}

/**
 * Update a water test
 */
export async function updateWaterTestAction(testId: string, data: WaterTestUpdate) {
  try {
    const user = await getCurrentUser();
    
    // Verify ownership before updating
    const existingTest = await getWaterTest(testId);
    if (!existingTest || (existingTest as any).aquariums?.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const waterTest = await dbUpdateWaterTest(testId, data);
    
    revalidatePath('/water-tests');
    revalidatePath('/water-tests/analytics');
    revalidatePath(`/aquariums/${existingTest.aquarium_id}`);
    revalidatePath(`/water-tests/${testId}`);
    
    return { success: true, data: waterTest };
  } catch (error: any) {
    console.error('Error updating water test:', error);
    return { success: false, error: error.message || 'Failed to update water test' };
  }
}

/**
 * Delete a water test
 */
export async function deleteWaterTestAction(testId: string) {
  try {
    const user = await getCurrentUser();
    
    // Verify ownership before deleting
    const existingTest = await getWaterTest(testId);
    if (!existingTest || (existingTest as any).aquariums?.user_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    await dbDeleteWaterTest(testId);
    
    revalidatePath('/water-tests');
    revalidatePath('/water-tests/analytics');
    revalidatePath(`/aquariums/${existingTest.aquarium_id}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting water test:', error);
    return { success: false, error: error.message || 'Failed to delete water test' };
  }
}

/**
 * Upload water test image to Supabase Storage
 */
export async function uploadWaterTestImage(file: File, testId: string) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerSupabaseClient();
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${testId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('water-test-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('water-test-images')
      .getPublicUrl(fileName);
    
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}

/**
 * Delete water test image from Supabase Storage
 */
export async function deleteWaterTestImage(imageUrl: string) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerSupabaseClient();
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/water-test-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL');
    }
    
    const filePath = urlParts[1];
    
    // Verify ownership (file path should start with user ID)
    if (!filePath.startsWith(user.id)) {
      throw new Error('Unauthorized');
    }
    
    const { error } = await supabase.storage
      .from('water-test-images')
      .remove([filePath]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message || 'Failed to delete image' };
  }
}

/**
 * Get water test analytics for dashboard
 */
export async function getWaterTestAnalytics(aquariumId?: string, days: number = 30) {
  try {
    const user = await getCurrentUser();
    const supabase = await createServerSupabaseClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let query = supabase
      .from('water_tests')
      .select('*')
      .eq('user_id', user.id)
      .gte('test_date', startDate.toISOString())
      .order('test_date', { ascending: true });
    
    if (aquariumId) {
      query = query.eq('aquarium_id', aquariumId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: error.message || 'Failed to fetch analytics' };
  }
}