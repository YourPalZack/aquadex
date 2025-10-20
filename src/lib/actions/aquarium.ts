'use server';

/**
 * Server actions for aquarium management
 * Handles CRUD operations for aquariums, livestock, and equipment
 */

import { revalidatePath } from 'next/cache';
import { getDbClient, getAuthClient } from '@/lib/config';
import {
  createAquariumSchema,
  updateAquariumSchema,
  createLivestockSchema,
  updateLivestockSchema,
  createEquipmentSchema,
  updateEquipmentSchema,
} from '@/lib/validations/aquarium';
import type {
  AquariumResponse,
  LivestockResponse,
  EquipmentResponse,
  AquariumFilters,
  LivestockFilters,
  EquipmentFilters,
} from '@/types/aquarium';

// ============================================
// AQUARIUM ACTIONS
// ============================================

/**
 * Get all aquariums for the current user
 */
export async function getAquariums(filters?: AquariumFilters): Promise<AquariumResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const db = await getDbClient();
    const aquariums = await db.aquariums.findMany({
      where: { userId: user.id, ...filters },
    });

    return { aquariums };
  } catch (error) {
    console.error('Error fetching aquariums:', error);
    return { error: 'Failed to fetch aquariums' };
  }
}

/**
 * Get a single aquarium by ID
 */
export async function getAquariumById(id: string): Promise<AquariumResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const db = await getDbClient();
    const aquarium = await db.aquariums.findFirst({
      where: { id, userId: user.id },
    });

    if (!aquarium) {
      return { error: 'Aquarium not found' };
    }

    return { aquarium };
  } catch (error) {
    console.error('Error fetching aquarium:', error);
    return { error: 'Failed to fetch aquarium' };
  }
}

/**
 * Create a new aquarium
 */
export async function createAquarium(data: unknown): Promise<AquariumResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = createAquariumSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Create aquarium
    const db = await getDbClient();
    const aquarium = await db.aquariums.insert({
      ...validatedData,
      userId: user.id,
      setupDate: new Date(validatedData.setupDate),
      imageUrls: validatedData.imageUrls || [],
      isActive: true,
    });

    revalidatePath('/aquariums');
    return { aquarium };
  } catch (error) {
    console.error('Error creating aquarium:', error);
    return { error: 'Failed to create aquarium' };
  }
}

/**
 * Update an existing aquarium
 */
export async function updateAquarium(data: unknown): Promise<AquariumResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = updateAquariumSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Check ownership
    const db = await getDbClient();
    const existing = await db.aquariums.findFirst({
      where: { id: validatedData.id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Aquarium not found' };
    }

    // Update aquarium
    const aquarium = await db.aquariums.update({
      ...validatedData,
      setupDate: validatedData.setupDate ? new Date(validatedData.setupDate) : undefined,
    });

    revalidatePath('/aquariums');
    revalidatePath(`/aquariums/${validatedData.id}`);
    return { aquarium };
  } catch (error) {
    console.error('Error updating aquarium:', error);
    return { error: 'Failed to update aquarium' };
  }
}

/**
 * Delete an aquarium
 */
export async function deleteAquarium(id: string): Promise<AquariumResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check ownership
    const db = await getDbClient();
    const existing = await db.aquariums.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Aquarium not found' };
    }

    // Delete aquarium
    await db.aquariums.delete({ id });

    revalidatePath('/aquariums');
    return { aquarium: existing };
  } catch (error) {
    console.error('Error deleting aquarium:', error);
    return { error: 'Failed to delete aquarium' };
  }
}

// ============================================
// LIVESTOCK ACTIONS
// ============================================

/**
 * Get livestock for an aquarium or all livestock for user
 */
export async function getLivestock(filters?: LivestockFilters): Promise<LivestockResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const db = await getDbClient();
    const livestockList = await db.livestock.findMany({
      where: { userId: user.id, ...filters },
    });

    return { livestockList };
  } catch (error) {
    console.error('Error fetching livestock:', error);
    return { error: 'Failed to fetch livestock' };
  }
}

/**
 * Create new livestock
 */
export async function createLivestock(data: unknown): Promise<LivestockResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = createLivestockSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Verify aquarium ownership
    const db = await getDbClient();
    const aquarium = await db.aquariums.findFirst({
      where: { id: validatedData.aquariumId, userId: user.id },
    });

    if (!aquarium) {
      return { error: 'Aquarium not found' };
    }

    // Create livestock
    const livestock = await db.livestock.insert({
      ...validatedData,
      userId: user.id,
      addedDate: new Date(validatedData.addedDate),
      isAlive: true,
    });

    revalidatePath(`/aquariums/${validatedData.aquariumId}`);
    return { livestock };
  } catch (error) {
    console.error('Error creating livestock:', error);
    return { error: 'Failed to create livestock' };
  }
}

/**
 * Update livestock
 */
export async function updateLivestock(data: unknown): Promise<LivestockResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = updateLivestockSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Check ownership
    const db = await getDbClient();
    const existing = await db.livestock.findFirst({
      where: { id: validatedData.id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Livestock not found' };
    }

    // Update livestock
    const livestock = await db.livestock.update({
      ...validatedData,
      addedDate: validatedData.addedDate ? new Date(validatedData.addedDate) : undefined,
    });

    revalidatePath(`/aquariums/${existing.aquariumId}`);
    return { livestock };
  } catch (error) {
    console.error('Error updating livestock:', error);
    return { error: 'Failed to update livestock' };
  }
}

/**
 * Delete livestock
 */
export async function deleteLivestock(id: string): Promise<LivestockResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check ownership
    const db = await getDbClient();
    const existing = await db.livestock.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Livestock not found' };
    }

    // Delete livestock
    await db.livestock.delete({ id });

    revalidatePath(`/aquariums/${existing.aquariumId}`);
    return { livestock: existing };
  } catch (error) {
    console.error('Error deleting livestock:', error);
    return { error: 'Failed to delete livestock' };
  }
}

// ============================================
// EQUIPMENT ACTIONS
// ============================================

/**
 * Get equipment for an aquarium or all equipment for user
 */
export async function getEquipment(filters?: EquipmentFilters): Promise<EquipmentResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const db = await getDbClient();
    const equipmentList = await db.equipment.findMany({
      where: { userId: user.id, ...filters },
    });

    return { equipmentList };
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return { error: 'Failed to fetch equipment' };
  }
}

/**
 * Create new equipment
 */
export async function createEquipment(data: unknown): Promise<EquipmentResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = createEquipmentSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Verify aquarium ownership
    const db = await getDbClient();
    const aquarium = await db.aquariums.findFirst({
      where: { id: validatedData.aquariumId, userId: user.id },
    });

    if (!aquarium) {
      return { error: 'Aquarium not found' };
    }

    // Create equipment
    const equipment = await db.equipment.insert({
      ...validatedData,
      userId: user.id,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
      lastMaintenanceDate: validatedData.lastMaintenanceDate ? new Date(validatedData.lastMaintenanceDate) : undefined,
      isActive: true,
    });

    revalidatePath(`/aquariums/${validatedData.aquariumId}`);
    return { equipment };
  } catch (error) {
    console.error('Error creating equipment:', error);
    return { error: 'Failed to create equipment' };
  }
}

/**
 * Update equipment
 */
export async function updateEquipment(data: unknown): Promise<EquipmentResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validationResult = updateEquipmentSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    const validatedData = validationResult.data;

    // Check ownership
    const db = await getDbClient();
    const existing = await db.equipment.findFirst({
      where: { id: validatedData.id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Equipment not found' };
    }

    // Update equipment
    const equipment = await db.equipment.update({
      ...validatedData,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
      lastMaintenanceDate: validatedData.lastMaintenanceDate ? new Date(validatedData.lastMaintenanceDate) : undefined,
    });

    revalidatePath(`/aquariums/${existing.aquariumId}`);
    return { equipment };
  } catch (error) {
    console.error('Error updating equipment:', error);
    return { error: 'Failed to update equipment' };
  }
}

/**
 * Delete equipment
 */
export async function deleteEquipment(id: string): Promise<EquipmentResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check ownership
    const db = await getDbClient();
    const existing = await db.equipment.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { error: 'Equipment not found' };
    }

    // Delete equipment
    await db.equipment.delete({ id });

    revalidatePath(`/aquariums/${existing.aquariumId}`);
    return { equipment: existing };
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return { error: 'Failed to delete equipment' };
  }
}
