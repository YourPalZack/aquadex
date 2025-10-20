/**
 * Server Actions for Water Testing
 * Handles CRUD operations for water quality tests
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getAuthClient, getDbClient } from '@/lib/config';
import {
  createWaterTestSchema,
  updateWaterTestSchema,
  waterTestFiltersSchema,
} from '@/lib/validations/aquarium';
import type {
  WaterTest,
  WaterTestResponse,
  CreateWaterTestData,
  UpdateWaterTestData,
  WaterTestFilters,
} from '@/types/aquarium';

/**
 * Get water tests for the current user
 * Optionally filter by aquarium, date range, or method
 */
export async function getWaterTests(
  filters?: WaterTestFilters
): Promise<WaterTestResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate filters
    const validatedFilters = waterTestFiltersSchema.safeParse(filters);
    if (!validatedFilters.success) {
      return { error: 'Invalid filters' };
    }

    const db = await getDbClient();
    const waterTests = await db.waterTests.findMany({
      where: {
        userId: user.id,
        ...validatedFilters.data,
      },
      orderBy: {
        testDate: 'desc',
      },
    });

    return { waterTests };
  } catch (error) {
    console.error('Error fetching water tests:', error);
    return { error: 'Failed to fetch water tests' };
  }
}

/**
 * Get a single water test by ID
 */
export async function getWaterTestById(
  id: string
): Promise<WaterTestResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    if (!id) {
      return { error: 'Water test ID is required' };
    }

    const db = await getDbClient();
    const waterTest = await db.waterTests.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user owns this test
      },
    });

    if (!waterTest) {
      return { error: 'Water test not found' };
    }

    return { waterTest };
  } catch (error) {
    console.error('Error fetching water test:', error);
    return { error: 'Failed to fetch water test' };
  }
}

/**
 * Create a new water test
 */
export async function createWaterTest(
  data: CreateWaterTestData
): Promise<WaterTestResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validated = createWaterTestSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message || 'Invalid input' };
    }

    // Verify aquarium belongs to user
    const db = await getDbClient();
    const aquarium = await db.aquariums.findFirst({
      where: {
        id: validated.data.aquariumId,
        userId: user.id,
      },
    });

    if (!aquarium) {
      return { error: 'Aquarium not found or access denied' };
    }

    // Create water test
    const waterTest = await db.waterTests.create({
      data: {
        ...validated.data,
        userId: user.id,
        testDate: new Date(validated.data.testDate),
      },
    });

    // Revalidate relevant paths
    revalidatePath('/aquariums');
    revalidatePath(`/aquariums/${validated.data.aquariumId}`);
    revalidatePath('/history');

    return { waterTest };
  } catch (error) {
    console.error('Error creating water test:', error);
    return { error: 'Failed to create water test' };
  }
}

/**
 * Update an existing water test
 */
export async function updateWaterTest(
  data: UpdateWaterTestData
): Promise<WaterTestResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Validate input
    const validated = updateWaterTestSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message || 'Invalid input' };
    }

    const { id, ...updateData } = validated.data;

    // Verify water test belongs to user
    const db = await getDbClient();
    const existingTest = await db.waterTests.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTest) {
      return { error: 'Water test not found or access denied' };
    }

    // If aquarium is being changed, verify new aquarium belongs to user
    if (updateData.aquariumId) {
      const aquarium = await db.aquariums.findFirst({
        where: {
          id: updateData.aquariumId,
          userId: user.id,
        },
      });

      if (!aquarium) {
        return { error: 'Aquarium not found or access denied' };
      }
    }

    // Update water test
    const waterTest = await db.waterTests.update({
      where: { id },
      data: {
        ...updateData,
        testDate: updateData.testDate ? new Date(updateData.testDate) : undefined,
      },
    });

    // Revalidate relevant paths
    revalidatePath('/aquariums');
    revalidatePath(`/aquariums/${waterTest.aquariumId}`);
    revalidatePath('/history');

    return { waterTest };
  } catch (error) {
    console.error('Error updating water test:', error);
    return { error: 'Failed to update water test' };
  }
}

/**
 * Delete a water test
 */
export async function deleteWaterTest(id: string): Promise<WaterTestResponse> {
  try {
    const auth = await getAuthClient();
    const user = await auth.getCurrentUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    if (!id) {
      return { error: 'Water test ID is required' };
    }

    // Verify water test belongs to user
    const db = await getDbClient();
    const waterTest = await db.waterTests.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!waterTest) {
      return { error: 'Water test not found or access denied' };
    }

    // Delete water test
    await db.waterTests.delete({
      where: { id },
    });

    // Revalidate relevant paths
    revalidatePath('/aquariums');
    revalidatePath(`/aquariums/${waterTest.aquariumId}`);
    revalidatePath('/history');

    return { waterTest };
  } catch (error) {
    console.error('Error deleting water test:', error);
    return { error: 'Failed to delete water test' };
  }
}

/**
 * Get water tests for a specific aquarium
 * Convenience function for aquarium detail pages
 */
export async function getAquariumWaterTests(
  aquariumId: string
): Promise<WaterTestResponse> {
  return getWaterTests({ aquariumId });
}

/**
 * Get the latest water test for an aquarium
 */
export async function getLatestWaterTest(
  aquariumId: string
): Promise<WaterTestResponse> {
  try {
    const result = await getWaterTests({ aquariumId });
    
    if (result.error || !result.waterTests || result.waterTests.length === 0) {
      return { error: result.error || 'No water tests found' };
    }

    return { waterTest: result.waterTests[0] };
  } catch (error) {
    console.error('Error fetching latest water test:', error);
    return { error: 'Failed to fetch latest water test' };
  }
}
