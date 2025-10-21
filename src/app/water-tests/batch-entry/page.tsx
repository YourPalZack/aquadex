/**
 * Batch Water Test Entry Page
 * Dedicated page for batch test entry functionality
 */

'use client';

import { BatchTestEntry } from '@/components/aquariums/batch-test-entry';
import type { WaterTest, Aquarium } from '@/types/aquarium';

// Mock aquarium data for demo
const mockAquariums: Aquarium[] = [
  {
    id: 'aqua1',
    userId: 'user1',
    name: 'Community Tank',
    sizeGallons: 55,
    waterType: 'freshwater',
    setupDate: new Date('2023-06-15'),
    location: 'Living Room',
    imageUrls: [],
    notes: 'Main display tank with tropical fish',
    isActive: true,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
  },
  {
    id: 'aqua2',
    userId: 'user1',
    name: 'Reef Tank',
    sizeGallons: 75,
    waterType: 'saltwater',
    setupDate: new Date('2023-08-20'),
    location: 'Office',
    imageUrls: [],
    notes: 'Saltwater reef aquarium',
    isActive: true,
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2023-08-20'),
  },
  {
    id: 'aqua3',
    userId: 'user1',
    name: 'Nano Tank',
    sizeGallons: 10,
    waterType: 'freshwater',
    setupDate: new Date('2024-01-10'),
    location: 'Bedroom',
    imageUrls: [],
    notes: 'Small desktop aquarium',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'aqua4',
    userId: 'user1',
    name: 'Brackish Setup',
    sizeGallons: 30,
    waterType: 'brackish',
    setupDate: new Date('2023-12-05'),
    location: 'Basement',
    imageUrls: [],
    notes: 'Experimental brackish water tank',
    isActive: true,
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2023-12-05'),
  },
];

export default function BatchTestEntryPage() {
  const handleSaveTests = async (tests: Partial<WaterTest>[]) => {
    // This would integrate with your data layer
    console.log('Saving batch tests:', tests);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would save to database here
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Batch Test Entry</h1>
        <p className="text-muted-foreground">
          Efficiently enter water tests for multiple aquariums at once. Save time with bulk actions and parameter templates.
        </p>
      </div>

      <BatchTestEntry 
        aquariums={mockAquariums}
        onSaveTests={handleSaveTests}
      />
    </div>
  );
}