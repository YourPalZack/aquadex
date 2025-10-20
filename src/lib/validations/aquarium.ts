/**
 * Zod validation schemas for aquarium management
 */

import { z } from 'zod';

// Aquarium schemas
export const waterTypeSchema = z.enum(['freshwater', 'saltwater', 'brackish']);

export const createAquariumSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  sizeGallons: z.number()
    .min(1, 'Size must be at least 1 gallon')
    .max(10000, 'Size must be less than 10,000 gallons'),
  waterType: waterTypeSchema,
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  setupDate: z.coerce.date(),
  imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export const updateAquariumSchema = createAquariumSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID is required'),
    isActive: z.boolean().optional(),
  });

// Livestock schemas
export const livestockTypeSchema = z.enum(['fish', 'coral', 'plant', 'invertebrate']);

export const createLivestockSchema = z.object({
  aquariumId: z.string().min(1, 'Aquarium is required'),
  type: livestockTypeSchema,
  species: z.string()
    .min(1, 'Species is required')
    .max(100, 'Species must be less than 100 characters'),
  commonName: z.string()
    .max(100, 'Common name must be less than 100 characters')
    .optional(),
  scientificName: z.string()
    .max(100, 'Scientific name must be less than 100 characters')
    .optional(),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must be less than 1000'),
  addedDate: z.coerce.date(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export const updateLivestockSchema = createLivestockSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID is required'),
    isAlive: z.boolean().optional(),
  });

// Equipment schemas
export const equipmentTypeSchema = z.enum(['filter', 'heater', 'light', 'pump', 'skimmer', 'other']);

export const createEquipmentSchema = z.object({
  aquariumId: z.string().min(1, 'Aquarium is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  type: equipmentTypeSchema,
  brand: z.string()
    .max(50, 'Brand must be less than 50 characters')
    .optional(),
  model: z.string()
    .max(50, 'Model must be less than 50 characters')
    .optional(),
  purchaseDate: z.coerce.date().optional(),
  lastMaintenanceDate: z.coerce.date().optional(),
  maintenanceIntervalDays: z.number()
    .int('Maintenance interval must be a whole number')
    .min(1, 'Maintenance interval must be at least 1 day')
    .max(365, 'Maintenance interval must be less than 365 days')
    .optional(),
  specifications: z.record(z.any()).optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export const updateEquipmentSchema = createEquipmentSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID is required'),
    isActive: z.boolean().optional(),
  });

// Filter schemas
export const aquariumFiltersSchema = z.object({
  waterType: waterTypeSchema.optional(),
  isActive: z.boolean().optional(),
  minSize: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
}).optional();

export const livestockFiltersSchema = z.object({
  aquariumId: z.string().optional(),
  type: livestockTypeSchema.optional(),
  isAlive: z.boolean().optional(),
}).optional();

export const equipmentFiltersSchema = z.object({
  aquariumId: z.string().optional(),
  type: equipmentTypeSchema.optional(),
  isActive: z.boolean().optional(),
  needsMaintenance: z.boolean().optional(),
}).optional();

// Water test schemas
export const waterParameterSchema = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  status: z.enum(['ideal', 'acceptable', 'warning', 'critical']),
  idealRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
});

export const testMethodSchema = z.enum(['test-strip', 'liquid-test', 'digital-meter', 'manual-entry']);

export const createWaterTestSchema = z.object({
  aquariumId: z.string().min(1, 'Aquarium is required'),
  testDate: z.coerce.date(),
  method: testMethodSchema,
  imageUrl: z.string().url('Invalid image URL').optional(),
  parameters: z.array(waterParameterSchema)
    .min(1, 'At least one parameter is required')
    .max(20, 'Maximum 20 parameters allowed'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  recommendations: z.array(z.string()).optional(),
});

export const updateWaterTestSchema = createWaterTestSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID is required'),
  });

export const waterTestFiltersSchema = z.object({
  aquariumId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  method: testMethodSchema.optional(),
}).optional();

// Type inference helpers
export type CreateAquariumInput = z.infer<typeof createAquariumSchema>;
export type UpdateAquariumInput = z.infer<typeof updateAquariumSchema>;
export type CreateLivestockInput = z.infer<typeof createLivestockSchema>;
export type UpdateLivestockInput = z.infer<typeof updateLivestockSchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type CreateWaterTestInput = z.infer<typeof createWaterTestSchema>;
export type UpdateWaterTestInput = z.infer<typeof updateWaterTestSchema>;
