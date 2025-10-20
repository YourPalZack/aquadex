/**
 * Aquarium Management Types
 * Types for aquariums, livestock, equipment, and related entities
 */

// Base entity type
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Aquarium types
export type WaterType = 'freshwater' | 'saltwater' | 'brackish';

export interface Aquarium extends BaseEntity {
  userId: string;
  name: string;
  sizeGallons: number;
  waterType: WaterType;
  location?: string;
  setupDate: Date;
  imageUrls: string[];
  notes?: string;
  isActive: boolean;
  // Water test scheduling
  testFrequencyDays?: number;
  lastTestDate?: Date;
  nextTestDate?: Date;
  testReminderEnabled?: boolean;
}

export interface AquariumWithStats extends Aquarium {
  livestockCount: number;
  equipmentCount: number;
  lastMaintenanceDate?: Date;
  upcomingTestsCount?: number;
}

// Livestock types
export type LivestockType = 'fish' | 'coral' | 'plant' | 'invertebrate';

export interface Livestock extends BaseEntity {
  aquariumId: string;
  userId: string;
  type: LivestockType;
  species: string;
  commonName?: string;
  scientificName?: string;
  quantity: number;
  addedDate: Date;
  imageUrl?: string;
  notes?: string;
  isAlive: boolean;
}

export interface LivestockWithAquarium extends Livestock {
  aquarium: Pick<Aquarium, 'id' | 'name' | 'waterType'>;
}

// Equipment types
export type EquipmentType = 'filter' | 'heater' | 'light' | 'pump' | 'skimmer' | 'other';

export interface Equipment extends BaseEntity {
  aquariumId: string;
  userId: string;
  name: string;
  type: EquipmentType;
  brand?: string;
  model?: string;
  purchaseDate?: Date;
  lastMaintenanceDate?: Date;
  maintenanceIntervalDays?: number;
  specifications?: Record<string, any>;
  notes?: string;
  isActive: boolean;
}

export interface EquipmentWithAquarium extends Equipment {
  aquarium: Pick<Aquarium, 'id' | 'name'>;
}

// Form data types (for validation)
export interface CreateAquariumData {
  name: string;
  sizeGallons: number;
  waterType: WaterType;
  location?: string;
  setupDate: Date | string;
  imageUrls?: string[];
  notes?: string;
  testFrequencyDays?: number;
  testReminderEnabled?: boolean;
}

export interface UpdateAquariumData extends Partial<CreateAquariumData> {
  id: string;
  isActive?: boolean;
  lastTestDate?: Date | string;
  nextTestDate?: Date | string;
}

export interface CreateLivestockData {
  aquariumId: string;
  type: LivestockType;
  species: string;
  commonName?: string;
  scientificName?: string;
  quantity: number;
  addedDate: Date | string;
  imageUrl?: string;
  notes?: string;
}

export interface UpdateLivestockData extends Partial<CreateLivestockData> {
  id: string;
  isAlive?: boolean;
}

export interface CreateEquipmentData {
  aquariumId: string;
  name: string;
  type: EquipmentType;
  brand?: string;
  model?: string;
  purchaseDate?: Date | string;
  lastMaintenanceDate?: Date | string;
  maintenanceIntervalDays?: number;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {
  id: string;
  isActive?: boolean;
}

// Filter and query types
export interface AquariumFilters {
  waterType?: WaterType;
  isActive?: boolean;
  minSize?: number;
  maxSize?: number;
}

export interface LivestockFilters {
  aquariumId?: string;
  type?: LivestockType;
  isAlive?: boolean;
}

export interface EquipmentFilters {
  aquariumId?: string;
  type?: EquipmentType;
  isActive?: boolean;
  needsMaintenance?: boolean;
}

// Water test types
export interface WaterParameter {
  name: string;
  value: number;
  unit: string;
  status: 'ideal' | 'acceptable' | 'warning' | 'critical';
  idealRange?: {
    min: number;
    max: number;
  };
}

export interface WaterTest extends BaseEntity {
  aquariumId: string;
  userId: string;
  testDate: Date;
  method: 'test-strip' | 'liquid-test' | 'digital-meter' | 'manual-entry';
  imageUrl?: string;
  parameters: WaterParameter[];
  notes?: string;
  recommendations?: string[];
}

export interface WaterTestWithAquarium extends WaterTest {
  aquarium: Pick<Aquarium, 'id' | 'name' | 'waterType' | 'sizeGallons'>;
}

export interface CreateWaterTestData {
  aquariumId: string;
  testDate: Date | string;
  method: 'test-strip' | 'liquid-test' | 'digital-meter' | 'manual-entry';
  imageUrl?: string;
  parameters: WaterParameter[];
  notes?: string;
  recommendations?: string[];
}

export interface UpdateWaterTestData extends Partial<CreateWaterTestData> {
  id: string;
}

export interface WaterTestFilters {
  aquariumId?: string;
  startDate?: Date;
  endDate?: Date;
  method?: string;
}

// Response types for server actions
export interface AquariumResponse {
  aquarium?: Aquarium;
  aquariums?: Aquarium[];
  error?: string;
}

export interface LivestockResponse {
  livestock?: Livestock;
  livestockList?: Livestock[];
  error?: string;
}

export interface EquipmentResponse {
  equipment?: Equipment;
  equipmentList?: Equipment[];
  error?: string;
}

export interface WaterTestResponse {
  waterTest?: WaterTest;
  waterTests?: WaterTest[];
  error?: string;
}
