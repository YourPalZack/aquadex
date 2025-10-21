'use server';

/**
 * Server actions for profile management using Supabase
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Database } from '@/lib/supabase';

/**
 * Create a Supabase server client for server actions
 */
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
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
            // Handle cookie setting errors in server actions
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

// Validation schemas
const updateProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  full_name: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  specialties: z.array(z.string()).optional(),
});

const updateNotificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  test_reminders: z.boolean().optional(),
  maintenance_alerts: z.boolean().optional(),
  marketplace_updates: z.boolean().optional(),
  community_digest: z.boolean().optional(),
});

const updatePrivacySettingsSchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'friends']),
  show_location: z.boolean(),
  show_email: z.boolean().optional(),
  show_aquariums: z.boolean().optional(),
});

// Types
export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  full_name: string | null;
  photo_url: string | null;
  location: string | null;
  bio: string | null;
  experience_level: string | null;
  specialties: string[] | null;
  contact_preferences: {
    email_notifications: boolean;
    marketing_emails: boolean;
  };
  privacy_settings: {
    profile_visibility: string;
    show_location: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Authentication error:', authError);
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(formData: FormData): Promise<ProfileUpdateResult> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'You must be logged in to update your profile',
    };
  }

  // Parse and validate form data
  const data = {
    display_name: formData.get('display_name') as string,
    full_name: formData.get('full_name') as string | null,
    bio: formData.get('bio') as string | null,
    location: formData.get('location') as string | null,
    experience_level: formData.get('experience_level') as string | null,
    specialties: formData.get('specialties') ? JSON.parse(formData.get('specialties') as string) : null,
  };

  const validation = updateProfileSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      error: validation.error.errors[0].message,
    };
  }

  // Update profile in database
  const { error } = await (supabase
    .from('users') as any)
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Profile updated successfully',
  };
}

/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(formData: FormData): Promise<ProfileUpdateResult & { url?: string }> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'You must be logged in to upload a photo',
    };
  }

  const file = formData.get('photo') as File;
  
  if (!file) {
    return {
      success: false,
      message: 'No file provided',
      error: 'Please select a photo to upload',
    };
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: 'Invalid file type',
      error: 'Please upload a JPEG, PNG, or WebP image',
    };
  }

  if (file.size > maxSize) {
    return {
      success: false,
      message: 'File too large',
      error: 'Photo must be less than 5MB',
    };
  }

  // Delete old photo if exists
  const { data: profile } = await (supabase
    .from('users') as any)
    .select('photo_url')
    .eq('id', user.id)
    .single();

  if (profile?.photo_url) {
    const oldPath = profile.photo_url.split('/').pop();
    if (oldPath) {
      await supabase.storage
        .from('profile-photos')
        .remove([`${user.id}/${oldPath}`]);
    }
  }

  // Upload new photo
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return {
      success: false,
      message: 'Failed to upload photo',
      error: uploadError.message,
    };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  // Update user profile with photo URL
  const { error: updateError } = await (supabase
    .from('users') as any)
    .update({
      photo_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile with photo URL:', updateError);
    return {
      success: false,
      message: 'Photo uploaded but failed to update profile',
      error: updateError.message,
    };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Profile photo updated successfully',
    url: publicUrl,
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationSettings(formData: FormData): Promise<ProfileUpdateResult> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'You must be logged in to update settings',
    };
  }

  // Parse settings from form data
  const settings = {
    email_notifications: formData.get('email_notifications') === 'true',
    marketing_emails: formData.get('marketing_emails') === 'true',
    test_reminders: formData.get('test_reminders') === 'true',
    maintenance_alerts: formData.get('maintenance_alerts') === 'true',
    marketplace_updates: formData.get('marketplace_updates') === 'true',
    community_digest: formData.get('community_digest') === 'true',
  };

  const validation = updateNotificationSettingsSchema.safeParse(settings);

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      error: validation.error.errors[0].message,
    };
  }

  // Update contact preferences in database
  const { error } = await (supabase
    .from('users') as any)
    .update({
      contact_preferences: validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating notification settings:', error);
    return {
      success: false,
      message: 'Failed to update notification settings',
      error: error.message,
    };
  }

  revalidatePath('/profile');
  revalidatePath('/profile/notifications');

  return {
    success: true,
    message: 'Notification settings updated successfully',
  };
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(formData: FormData): Promise<ProfileUpdateResult> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'You must be logged in to update settings',
    };
  }

  // Parse settings from form data
  const settings = {
    profile_visibility: formData.get('profile_visibility') as string,
    show_location: formData.get('show_location') === 'true',
    show_email: formData.get('show_email') === 'true',
    show_aquariums: formData.get('show_aquariums') === 'true',
  };

  const validation = updatePrivacySettingsSchema.safeParse(settings);

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      error: validation.error.errors[0].message,
    };
  }

  // Update privacy settings in database
  const { error } = await (supabase
    .from('users') as any)
    .update({
      privacy_settings: validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating privacy settings:', error);
    return {
      success: false,
      message: 'Failed to update privacy settings',
      error: error.message,
    };
  }

  revalidatePath('/profile');

  return {
    success: true,
    message: 'Privacy settings updated successfully',
  };
}

/**
 * Get user activity dashboard data
 */
export async function getUserDashboardData() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // Fetch counts for various user activities
  const [aquariumsResult, waterTestsResult, listingsResult] = await Promise.all([
    supabase
      .from('aquariums')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase
      .from('water_tests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('marketplace_listings')
      .select('id, status', { count: 'exact' })
      .eq('seller_id', user.id),
  ]);

  // Get recent water tests
  const { data: recentTests } = await supabase
    .from('water_tests')
    .select('id, test_date, aquarium_id, ph, temperature')
    .eq('user_id', user.id)
    .order('test_date', { ascending: false })
    .limit(5);

  // Get recent aquariums
  const { data: recentAquariums } = await supabase
    .from('aquariums')
    .select('id, name, type, size_gallons')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    aquariumCount: aquariumsResult.count || 0,
    waterTestCount: waterTestsResult.count || 0,
    activeListings: listingsResult.data?.filter((l: any) => l.status === 'active').length || 0,
    totalListings: listingsResult.count || 0,
    recentTests: recentTests || [],
    recentAquariums: recentAquariums || [],
  };
}

/**
 * Delete user account (soft delete - deactivate)
 */
export async function deactivateAccount(password: string): Promise<ProfileUpdateResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      message: 'Authentication required',
      error: 'You must be logged in to deactivate your account',
    };
  }

  // Verify password before deactivation
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });

  if (signInError) {
    return {
      success: false,
      message: 'Password verification failed',
      error: 'Incorrect password',
    };
  }

  // Soft delete: set all aquariums to inactive
  await (supabase
    .from('aquariums') as any)
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Mark user as inactive (you may want to add an is_active column to users table)
  const { error } = await (supabase
    .from('users') as any)
    .update({
      privacy_settings: { profile_visibility: 'private' },
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return {
      success: false,
      message: 'Failed to deactivate account',
      error: error.message,
    };
  }

  // Sign out the user
  await supabase.auth.signOut();

  return {
    success: true,
    message: 'Account deactivated successfully',
  };
}
