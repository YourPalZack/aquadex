/**
 * Mock database client for local development
 * Simulates Drizzle ORM operations using in-memory data
 */

import { mockData } from './data';

// Simulate async database operations with realistic delays
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

export const mockDb = {
  // User Profiles
  userProfiles: {
    findFirst: async () => {
      await simulateDelay();
      return mockData.user;
    },
    findMany: async () => {
      await simulateDelay();
      return [mockData.user];
    },
  },

  // Aquariums
  aquariums: {
    findMany: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.userId === mockData.user.id) {
        return mockData.aquariums;
      }
      return mockData.aquariums;
    },
    findFirst: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.id) {
        return mockData.aquariums.find(a => a.id === options.where.id) || null;
      }
      return mockData.aquariums[0];
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
    update: async (data: any) => {
      await simulateDelay();
      return data;
    },
    delete: async () => {
      await simulateDelay();
      return true;
    },
  },

  // Livestock
  livestock: {
    findMany: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.aquariumId) {
        return mockData.livestock.filter(l => l.aquariumId === options.where.aquariumId);
      }
      return mockData.livestock;
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
    update: async (data: any) => {
      await simulateDelay();
      return data;
    },
    delete: async () => {
      await simulateDelay();
      return true;
    },
  },

  // Equipment
  equipment: {
    findMany: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.aquariumId) {
        return mockData.equipment.filter(e => e.aquariumId === options.where.aquariumId);
      }
      return mockData.equipment;
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
    update: async (data: any) => {
      await simulateDelay();
      return data;
    },
    delete: async () => {
      await simulateDelay();
      return true;
    },
  },

  // Water Tests
  waterTests: {
    findMany: async (options?: { where?: any; orderBy?: any; limit?: number }) => {
      await simulateDelay();
      let tests = [...mockData.waterTests];
      
      if (options?.where?.userId) {
        tests = tests.filter(t => t.userId === options.where.userId);
      }
      
      if (options?.where?.aquariumId) {
        tests = tests.filter(t => t.aquariumId === options.where.aquariumId);
      }
      
      if (options?.where?.startDate || options?.where?.endDate) {
        const startDate = options.where?.startDate ? new Date(options.where.startDate) : null;
        const endDate = options.where?.endDate ? new Date(options.where.endDate) : null;
        
        tests = tests.filter(t => {
          const testDate = new Date(t.testDate);
          if (startDate && testDate < startDate) return false;
          if (endDate && testDate > endDate) return false;
          return true;
        });
      }
      
      if (options?.orderBy?.testDate === 'desc') {
        tests.sort((a, b) => b.testDate.getTime() - a.testDate.getTime());
      } else if (options?.orderBy?.testDate === 'asc') {
        tests.sort((a, b) => a.testDate.getTime() - b.testDate.getTime());
      }
      
      if (options?.limit) {
        tests = tests.slice(0, options.limit);
      }
      
      return tests;
    },
    findFirst: async (options?: { where?: any }) => {
      await simulateDelay();
      let tests = [...mockData.waterTests];
      
      if (options?.where?.aquariumId) {
        tests = tests.filter(t => t.aquariumId === options.where.aquariumId);
      }
      
      if (options?.where?.userId) {
        tests = tests.filter(t => t.userId === options.where.userId);
      }
      
      if (options?.where?.id) {
        return tests.find(t => t.id === options.where.id);
      }
      
      return tests[0];
    },
    findUnique: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.id) {
        const test = mockData.waterTests.find(t => t.id === options.where.id);
        if (test && options.where.userId && test.userId !== options.where.userId) {
          return null;
        }
        return test || null;
      }
      return null;
    },
    create: async (data: any) => {
      await simulateDelay();
      const newTest = {
        ...data.data,
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockData.waterTests.unshift(newTest); // Add to beginning for most recent
      return newTest;
    },
    update: async (options: any) => {
      await simulateDelay();
      const index = mockData.waterTests.findIndex(t => t.id === options.where.id);
      if (index !== -1) {
        mockData.waterTests[index] = {
          ...mockData.waterTests[index],
          ...options.data,
          updatedAt: new Date(),
        };
        return mockData.waterTests[index];
      }
      throw new Error('Water test not found');
    },
    delete: async (options: any) => {
      await simulateDelay();
      const index = mockData.waterTests.findIndex(t => t.id === options.where.id);
      if (index !== -1) {
        const deleted = mockData.waterTests.splice(index, 1)[0];
        return deleted;
      }
      throw new Error('Water test not found');
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
  },

  // Maintenance Tasks
  maintenanceTasks: {
    findMany: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.aquariumId) {
        return mockData.maintenanceTasks.filter(t => t.aquariumId === options.where.aquariumId);
      }
      return mockData.maintenanceTasks;
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
    update: async (data: any) => {
      await simulateDelay();
      return data;
    },
    delete: async () => {
      await simulateDelay();
      return true;
    },
  },

  // Questions
  questions: {
    findMany: async (options?: { orderBy?: any; limit?: number }) => {
      await simulateDelay();
      let questions = [...mockData.questions];
      
      if (options?.orderBy) {
        questions.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
      }
      
      if (options?.limit) {
        questions = questions.slice(0, options.limit);
      }
      
      return questions;
    },
    findFirst: async (options?: { where?: any }) => {
      await simulateDelay();
      return mockData.questions[0];
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
  },

  // Marketplace Listings
  marketplaceListings: {
    findMany: async (options?: { where?: any; orderBy?: any; limit?: number }) => {
      await simulateDelay();
      let listings = [...mockData.marketplaceListings];
      
      if (options?.where?.status === 'active') {
        listings = listings.filter(l => l.status === 'active');
      }
      
      if (options?.orderBy) {
        listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      if (options?.limit) {
        listings = listings.slice(0, options.limit);
      }
      
      return listings;
    },
    findFirst: async (options?: { where?: any }) => {
      await simulateDelay();
      if (options?.where?.id) {
        return mockData.marketplaceListings.find(l => l.id === options.where.id) || null;
      }
      return mockData.marketplaceListings[0];
    },
    insert: async (data: any) => {
      await simulateDelay();
      return { ...data, id: `mock_${Date.now()}` };
    },
  },
};

export type MockDb = typeof mockDb;
