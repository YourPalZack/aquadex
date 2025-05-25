# Aquarium Management Feature Documentation

## Overview
The Aquarium Management feature is the core of AquaDex, allowing users to create, manage, and track multiple aquarium profiles with detailed parameters, maintenance schedules, and historical data.

## Feature Components

### 1. Aquarium Profiles
- Create and manage multiple aquarium profiles
- Track tank specifications (size, type, setup date)
- Maintain livestock lists
- Equipment inventory
- Photo galleries

### 2. Parameter Tracking
- Water parameters (pH, ammonia, nitrite, nitrate, temperature)
- Historical trending and charts
- Automated alerts for parameter deviations

### 3. Maintenance Scheduling
- Water change reminders
- Filter maintenance schedules
- Equipment service tracking
- Custom task creation

## User Flows

### Creating an Aquarium
1. Navigate to `/aquariums`
2. Click "Add New Aquarium"
3. Fill in tank details:
   - Name and location
   - Tank size and type (freshwater/saltwater/planted)
   - Equipment list
   - Initial parameters
4. Save aquarium profile

### Viewing Aquarium Details
1. From `/dashboard` or `/aquariums`, select a tank
2. View at `/aquariums/[aquariumId]`:
   - Current parameters
   - Recent test results
   - Maintenance schedule
   - Livestock inventory
   - Equipment status

## Technical Implementation

### Data Models

```typescript
interface Aquarium {
  id: string;
  userId: string;
  name: string;
  type: 'freshwater' | 'saltwater' | 'planted' | 'reef';
  size: number; // in gallons
  setupDate: Date;
  location?: string;
  description?: string;
  equipment: Equipment[];
  livestock: Livestock[];
  parameters: WaterParameters;
  maintenanceSchedule: MaintenanceTask[];
  photos: Photo[];
  createdAt: Date;
  updatedAt: Date;
}

interface Equipment {
  id: string;
  type: 'filter' | 'heater' | 'light' | 'pump' | 'other';
  brand: string;
  model: string;
  installDate: Date;
  lastServiceDate?: Date;
  notes?: string;
}

interface Livestock {
  id: string;
  type: 'fish' | 'invertebrate' | 'coral' | 'plant';
  species: string;
  commonName: string;
  quantity: number;
  addedDate: Date;
  source?: string;
  notes?: string;
}
```

### Components

- `AquariumCard` - Display aquarium summary in list views
- `AquariumForm` - Create/edit aquarium profiles
- `AquariumDetailView` - Full aquarium details page (planned)
- `ParameterChart` - Visualize parameter trends (planned)
- `MaintenanceCalendar` - Schedule view (planned)

### Firebase Integration

Collections:
- `aquariums` - Main aquarium profiles
- `aquariums/{id}/tests` - Water test results subcollection
- `aquariums/{id}/maintenance` - Maintenance log subcollection

## Future Enhancements

1. **Smart Recommendations**
   - AI-powered stocking suggestions
   - Compatibility warnings
   - Parameter optimization tips

2. **Social Features**
   - Share aquarium profiles
   - Public aquarium galleries
   - Achievement badges

3. **Advanced Analytics**
   - Parameter correlation analysis
   - Predictive maintenance alerts
   - Cost tracking and budgeting

## Related Features
- [Water Testing](../water-testing/) - Analyze and track water parameters
- [AI Tools](../ai-tools/) - Find compatible fish and equipment
- [Marketplace](../marketplace/) - Purchase supplies and livestock