/**
 * Mock AI flows for local development
 * Returns sample responses without calling Google AI API
 */

// Simulate AI processing delay
const simulateAiDelay = () => new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

export const mockAi = {
  // Analyze water test strip
  analyzeTestStrip: async (imageUrl: string) => {
    await simulateAiDelay();
    
    return {
      success: true,
      confidence: 0.92,
      parameters: {
        pH: { value: 8.2, unit: 'pH', status: 'safe', confidence: 0.94 },
        ammonia: { value: 0, unit: 'ppm', status: 'safe', confidence: 0.91 },
        nitrite: { value: 0, unit: 'ppm', status: 'safe', confidence: 0.90 },
        nitrate: { value: 5, unit: 'ppm', status: 'safe', confidence: 0.93 },
        hardness: { value: 150, unit: 'ppm', status: 'safe', confidence: 0.89 },
        alkalinity: { value: 120, unit: 'ppm', status: 'safe', confidence: 0.88 },
      },
      warnings: [],
      recommendations: [
        'Water parameters are within safe ranges for most aquarium fish.',
        'Continue monitoring nitrate levels - consider water change if they rise above 20ppm.',
      ],
    };
  },

  // Recommend treatment products
  recommendTreatment: async (parameters: any) => {
    await simulateAiDelay();
    
    // Simulate different recommendations based on input
    if (parameters.ammonia > 0.25) {
      return {
        success: true,
        urgency: 'high',
        treatments: [
          {
            productName: 'Seachem Prime',
            purpose: 'Detoxifies ammonia, nitrite, and nitrate',
            dosage: '5ml per 50 gallons',
            frequency: 'Every 48 hours until levels normalize',
            estimatedCost: '$12.99',
            purchaseLinks: ['https://example.com/seachem-prime'],
          },
          {
            productName: 'API Ammo Lock',
            purpose: 'Locks up toxic ammonia',
            dosage: '5ml per 10 gallons',
            frequency: 'Daily until ammonia reaches 0ppm',
            estimatedCost: '$8.99',
            purchaseLinks: ['https://example.com/api-ammo-lock'],
          },
        ],
        additionalAdvice: [
          'Perform immediate 25-50% water change',
          'Stop feeding for 24-48 hours',
          'Test water daily until parameters stabilize',
          'Check filter for proper function',
        ],
      };
    }
    
    return {
      success: true,
      urgency: 'low',
      treatments: [],
      additionalAdvice: [
        'Water parameters are within safe ranges.',
        'Continue regular maintenance schedule.',
        'Monitor parameters weekly.',
      ],
    };
  },

  // Find compatible fish
  findFish: async (criteria: any) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          commonName: 'Neon Tetra',
          scientificName: 'Paracheirodon innesi',
          minTankSize: 10,
          temperatureRange: '72-78°F',
          phRange: '6.0-7.0',
          difficulty: 'beginner',
          schoolingSize: 6,
          description: 'Peaceful, colorful schooling fish perfect for planted tanks.',
          compatibility: 95,
          purchaseLinks: ['https://example.com/neon-tetra'],
        },
        {
          commonName: 'Cherry Shrimp',
          scientificName: 'Neocaridina davidi',
          minTankSize: 5,
          temperatureRange: '65-80°F',
          phRange: '6.5-8.0',
          difficulty: 'beginner',
          schoolingSize: 1,
          description: 'Hardy algae-eating shrimp available in many colors.',
          compatibility: 98,
          purchaseLinks: ['https://example.com/cherry-shrimp'],
        },
      ],
    };
  },

  // Find compatible plants
  findPlant: async (criteria: any) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          commonName: 'Java Fern',
          scientificName: 'Microsorum pteropus',
          lightingRequirement: 'low',
          growthRate: 'slow',
          difficulty: 'beginner',
          placement: 'midground/background',
          description: 'Hardy plant that attaches to rocks and driftwood.',
          compatibility: 100,
          purchaseLinks: ['https://example.com/java-fern'],
        },
        {
          commonName: 'Amazon Sword',
          scientificName: 'Echinodorus amazonicus',
          lightingRequirement: 'moderate',
          growthRate: 'moderate',
          difficulty: 'beginner',
          placement: 'background',
          description: 'Large, robust plant perfect as a centerpiece.',
          compatibility: 95,
          purchaseLinks: ['https://example.com/amazon-sword'],
        },
      ],
    };
  },

  // Find suitable tank
  findTank: async (criteria: any) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          brand: 'Fluval',
          model: 'Flex 15',
          capacity: 15,
          dimensions: '16" x 15" x 15"',
          included: ['LED light', 'filter', 'substrate'],
          priceRange: '$150-$180',
          suitableFor: ['nano reef', 'planted', 'betta'],
          compatibility: 92,
          purchaseLinks: ['https://example.com/fluval-flex-15'],
        },
      ],
    };
  },

  // Find filtration system
  findFilter: async (criteria: any) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          brand: 'Fluval',
          model: 'FX6',
          type: 'canister',
          flowRate: '925 gph',
          maxTankSize: 400,
          features: ['multi-stage filtration', 'self-priming', 'maintenance reminder'],
          priceRange: '$250-$300',
          compatibility: 98,
          purchaseLinks: ['https://example.com/fluval-fx6'],
        },
      ],
    };
  },

  // Find lighting system
  findLighting: async (criteria: any) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          brand: 'AI (Aqua Illumination)',
          model: 'Hydra 32HD',
          wattage: 90,
          spectrum: 'full spectrum with UV',
          coverage: '24" x 24"',
          features: ['WiFi control', 'customizable schedules', 'weather effects'],
          suitableFor: ['reef', 'planted'],
          priceRange: '$350-$400',
          compatibility: 95,
          purchaseLinks: ['https://example.com/ai-hydra-32'],
        },
      ],
    };
  },

  // Get food purchase links
  getFoodLinks: async (fishType: string) => {
    await simulateAiDelay();
    
    return {
      success: true,
      recommendations: [
        {
          productName: 'Hikari Marine A',
          type: 'pellet',
          size: '110g',
          suitableFor: ['marine fish', 'reef fish'],
          price: '$12.99',
          purchaseLinks: ['https://example.com/hikari-marine-a'],
        },
        {
          productName: 'Ocean Nutrition Formula One',
          type: 'frozen',
          size: '3.5oz cubes',
          suitableFor: ['marine fish', 'reef fish'],
          price: '$8.99',
          purchaseLinks: ['https://example.com/ocean-nutrition-formula-one'],
        },
      ],
    };
  },

  // Find aquarium deals
  findDeals: async (category?: string) => {
    await simulateAiDelay();
    
    return {
      success: true,
      deals: [
        {
          title: '20% Off All Fluval Filters',
          description: 'Limited time sale on canister and HOB filters',
          discount: '20%',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          retailer: 'Petco',
          link: 'https://example.com/fluval-sale',
        },
        {
          title: 'Buy 2 Get 1 Free - Seachem Products',
          description: 'Mix and match any Seachem water treatments',
          discount: '33%',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          retailer: 'Amazon',
          link: 'https://example.com/seachem-deal',
        },
      ],
    };
  },

  // Suggest water test prompt
  suggestPrompt: async (waterType: string) => {
    await simulateAiDelay();
    
    const prompts: Record<string, string> = {
      freshwater: 'Test pH, ammonia, nitrite, nitrate, and hardness for your freshwater aquarium.',
      saltwater: 'Test pH, ammonia, nitrite, nitrate, salinity, calcium, and alkalinity for your reef tank.',
      brackish: 'Test pH, ammonia, nitrite, nitrate, and salinity for your brackish water setup.',
    };
    
    return {
      success: true,
      prompt: prompts[waterType] || prompts.freshwater,
    };
  },
};

export type MockAi = typeof mockAi;
