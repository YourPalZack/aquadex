# Phase 3 Kickoff Checklist - US1 Aquarium Profile Management
**Feature:** 001-Aquarium Toolkit  
**Sprint Start:** October 20, 2025  
**User Story:** US1 - Aquarium Profile Management (Priority: P1 - MVP)  
**Tasks:** T029 through T055 (27 tasks)  
**Estimated Duration:** 2-3 weeks

---

## 🎯 Sprint Goal

Enable fishkeepers to create, view, edit, and delete aquarium profiles with livestock, equipment, and photos through a responsive Next.js dashboard.

**Success Criteria (from spec.md):**
- ✅ Users can create aquarium profile within 5 minutes of signup
- ✅ All CRUD operations functional with proper validation
- ✅ Photos upload to Supabase Storage with proper validation
- ✅ Livestock and equipment can be added/managed independently
- ✅ Delete operations require confirmation

---

## ✅ Pre-Implementation Checklist

### Phase 1 & 2 Prerequisites (BLOCKING)

- [ ] **T001-T012: Setup Phase Complete**
  - [ ] Node.js 20+ installed and verified
  - [ ] `.env.local` file created with all credentials
  - [ ] All dependencies installed (Next.js, Drizzle, Supabase, Genkit)
  - [ ] TypeScript configured in strict mode
  - [ ] Tailwind CSS configured with theme colors
  - [ ] Drizzle config connected to Neon

- [ ] **T013-T028: Foundation Phase Complete**
  - [ ] Database schema deployed to Neon (11 entities)
  - [ ] Drizzle client exported and tested
  - [ ] Supabase clients (browser + server) configured
  - [ ] Genkit initialized with Google AI
  - [ ] Supabase Storage bucket "aquarium-images" created
  - [ ] Auth middleware functional
  - [ ] Root layout + navbar + footer rendered
  - [ ] Shadcn UI components installed (12 components per T025)
  - [ ] Error boundary + loading spinner + toast system working

### Specification Review

- [ ] **Read spec.md FR-001 through FR-007** (7 requirements)
- [ ] **Review data-model.md** - `aquariums`, `livestock`, `equipment` schemas
- [ ] **Study contracts/aquariums.yaml** - API contract for CRUD operations
- [ ] **Review constitution.md Principle I** - Component-First Architecture
- [ ] **Understand FR-007 image validation** - Max 5MB, jpg/png/webp, EXIF stripping (from remediation)

### Development Environment

- [ ] **IDE Setup**
  - [ ] VS Code extensions: TypeScript, Tailwind IntelliSense, Prettier, ESLint
  - [ ] Drizzle Studio running: `npm run db:studio` (verify schema visible)
  - [ ] Dev server running: `npm run dev` (verify http://localhost:3000)
  
- [ ] **Database Access**
  - [ ] Neon dashboard accessible
  - [ ] Test connection: `SELECT * FROM aquariums LIMIT 1;`
  - [ ] Verify foreign key constraints on `livestock` and `equipment` tables
  
- [ ] **Supabase Access**
  - [ ] Supabase dashboard accessible
  - [ ] Storage bucket "aquarium-images" visible
  - [ ] Test file upload manually (verify public access)
  - [ ] Auth provider enabled (email/password)

### Team Coordination

- [ ] **Assign Task Owners**
  - [ ] Types & Validation (T029-T031): [Developer Name]
  - [ ] Server Actions (T032-T036, T043-T050): [Developer Name]
  - [ ] Components (T037-T039, T046-T047, T051-T052): [Developer Name]
  - [ ] Pages (T040-T042, T053-T054): [Developer Name]
  - [ ] Delete Confirmation (T055): [Developer Name]

- [ ] **Parallel Execution Strategy**
  - [ ] Group 1 [P]: T029-T031 (types) → START IMMEDIATELY
  - [ ] Group 2 [P]: T037-T039, T046-T047, T051-T052 (components) → START IMMEDIATELY
  - [ ] Group 3: T032-T036 (actions) → START after Group 1 complete
  - [ ] Group 4: T043-T045, T048-T050 (livestock/equipment actions) → PARALLEL with Group 3
  - [ ] Group 5: T040-T042, T053-T054 (pages) → START after Groups 2+3 complete
  - [ ] Final: T055 (delete dialog) → AFTER all pages integrated

---

## 📋 Task-by-Task Breakdown

### **Block 1: Type Definitions (Start First - PARALLEL)**

#### T029 [P] [US1] - Aquarium TypeScript Type
**Owner:** [Assign]  
**Estimated Time:** 30 minutes  
**File:** `src/types/aquarium.ts`

**Acceptance Criteria:**
- [ ] Interface matches `aquariums` table schema from data-model.md
- [ ] Includes `size_value: number` and `size_unit: 'gallons' | 'liters'`
- [ ] Includes conversion utility: `convertToGallons(value, unit)` and `convertToLiters(value, unit)`
- [ ] Includes TypeScript enums for `type` field: `'freshwater' | 'saltwater' | 'planted' | 'reef'`
- [ ] Properly exports all types

**Code Template:**
```typescript
// src/types/aquarium.ts
export type AquariumType = 'freshwater' | 'saltwater' | 'planted' | 'reef';
export type SizeUnit = 'gallons' | 'liters';

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  size_value: number;
  size_unit: SizeUnit;
  type: AquariumType;
  setup_date: Date;
  location?: string;
  description?: string;
  photo_urls?: string[];
  created_at: Date;
  updated_at: Date;
}

// Utility functions
export const convertToGallons = (value: number, unit: SizeUnit): number => {
  return unit === 'liters' ? value * 0.264172 : value;
};

export const convertToLiters = (value: number, unit: SizeUnit): number => {
  return unit === 'gallons' ? value * 3.78541 : value;
};
```

**Testing:**
- [ ] Import type in another file, verify no TypeScript errors
- [ ] Test conversion: `convertToGallons(10, 'liters')` → ~2.64
- [ ] Test conversion: `convertToLiters(10, 'gallons')` → ~37.85

---

#### T030 [P] [US1] - Zod Validation Schema
**Owner:** [Assign]  
**Estimated Time:** 45 minutes  
**File:** `src/lib/validations/aquarium.ts`  
**Dependencies:** T029 (needs types)

**Acceptance Criteria:**
- [ ] Schema validates all required fields: `name`, `size_value`, `size_unit`, `type`, `setup_date`
- [ ] `name`: min 1, max 100 characters
- [ ] `size_value`: positive number, max 10000 (prevents typos like 100000)
- [ ] `size_unit`: enum validation ('gallons' | 'liters')
- [ ] `type`: enum validation per AquariumType
- [ ] `setup_date`: date not in future
- [ ] Optional fields: `location`, `description` (max 500 chars)

**Code Template:**
```typescript
// src/lib/validations/aquarium.ts
import { z } from 'zod';

export const aquariumSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  size_value: z.number().positive('Size must be positive').max(10000, 'Size seems unrealistic'),
  size_unit: z.enum(['gallons', 'liters']),
  type: z.enum(['freshwater', 'saltwater', 'planted', 'reef']),
  setup_date: z.date().max(new Date(), 'Setup date cannot be in the future'),
  location: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export type AquariumFormData = z.infer<typeof aquariumSchema>;
```

**Testing:**
- [ ] Valid input passes: `aquariumSchema.parse({ name: 'My Tank', size_value: 55, size_unit: 'gallons', type: 'freshwater', setup_date: new Date() })`
- [ ] Invalid name fails: `aquariumSchema.parse({ name: '', ... })` → throws error
- [ ] Future date fails: `aquariumSchema.parse({ setup_date: new Date('2026-01-01'), ... })` → throws error

---

#### T031 [P] [US1] - Livestock and Equipment Types
**Owner:** [Assign]  
**Estimated Time:** 30 minutes  
**File:** `src/types/aquarium.ts` (same file as T029)

**Acceptance Criteria:**
- [ ] `Livestock` interface matches `livestock` table schema
- [ ] `Equipment` interface matches `equipment` table schema
- [ ] Includes proper foreign key references to `aquarium_id`
- [ ] TypeScript enums for `livestock.category`: `'fish' | 'invertebrate' | 'plant' | 'coral'`
- [ ] TypeScript enums for `equipment.category`: `'filter' | 'heater' | 'light' | 'other'`

**Code Template:**
```typescript
// Add to src/types/aquarium.ts
export type LivestockCategory = 'fish' | 'invertebrate' | 'plant' | 'coral';
export type EquipmentCategory = 'filter' | 'heater' | 'light' | 'other';

export interface Livestock {
  id: string;
  aquarium_id: string;
  category: LivestockCategory;
  species_name: string;
  quantity: number;
  added_date: Date;
  notes?: string;
  created_at: Date;
}

export interface Equipment {
  id: string;
  aquarium_id: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  installation_date?: Date;
  notes?: string;
  created_at: Date;
}
```

**Testing:**
- [ ] Import types in another file, verify no errors
- [ ] Verify enum autocomplete works in IDE

---

### **Block 2: Components (Start in Parallel with Block 1)**

#### T037 [P] [US1] - AquariumCard Component
**Owner:** [Assign]  
**Estimated Time:** 1 hour  
**File:** `src/components/aquariums/aquarium-card.tsx`  
**Dependencies:** T029 (types)

**Acceptance Criteria:**
- [ ] Displays: name, type badge, size with unit, setup date (formatted)
- [ ] Shows thumbnail photo if available, placeholder if not
- [ ] Clickable card links to detail page (`/aquariums/[id]`)
- [ ] Hover state with subtle elevation
- [ ] Responsive: mobile (full width), tablet (2 cols), desktop (3 cols)
- [ ] Uses Shadcn `Card` component

**Code Template:**
```typescript
// src/components/aquariums/aquarium-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Aquarium } from '@/types/aquarium';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface AquariumCardProps {
  aquarium: Aquarium;
}

export function AquariumCard({ aquarium }: AquariumCardProps) {
  return (
    <Link href={`/aquariums/${aquarium.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={aquarium.photo_urls?.[0] || '/placeholder-aquarium.jpg'}
            alt={aquarium.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {aquarium.name}
            <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {aquarium.type}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {aquarium.size_value} {aquarium.size_unit}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Setup: {format(new Date(aquarium.setup_date), 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Testing:**
- [ ] Renders with mock data
- [ ] Link navigates correctly
- [ ] Hover state visible
- [ ] Responsive layout works on mobile/tablet/desktop

---

#### T038 [P] [US1] - AquariumForm Component
**Owner:** [Assign]  
**Estimated Time:** 2 hours  
**File:** `src/components/aquariums/aquarium-form.tsx`  
**Dependencies:** T029, T030 (types + validation)

**Acceptance Criteria:**
- [ ] Uses React Hook Form with Zod resolver
- [ ] All fields from schema: name, size_value, size_unit, type, setup_date
- [ ] Displays validation errors inline
- [ ] Submit button shows loading state during submission
- [ ] Success/error toast notifications
- [ ] Resets form on successful submission
- [ ] Pre-fills form when editing (receives `defaultValues` prop)

**Code Template:**
```typescript
// src/components/aquariums/aquarium-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aquariumSchema, type AquariumFormData } from '@/lib/validations/aquarium';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AquariumFormProps {
  defaultValues?: Partial<AquariumFormData>;
  onSubmit: (data: AquariumFormData) => Promise<void>;
  submitLabel?: string;
}

export function AquariumForm({ defaultValues, onSubmit, submitLabel = 'Create Aquarium' }: AquariumFormProps) {
  const { toast } = useToast();
  const form = useForm<AquariumFormData>({
    resolver: zodResolver(aquariumSchema),
    defaultValues: defaultValues || {
      name: '',
      size_value: 0,
      size_unit: 'gallons',
      type: 'freshwater',
      setup_date: new Date(),
    },
  });

  const handleSubmit = async (data: AquariumFormData) => {
    try {
      await onSubmit(data);
      toast({ title: 'Success!', description: 'Aquarium saved successfully' });
      form.reset();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aquarium Name</FormLabel>
              <FormControl>
                <Input placeholder="My Beautiful Tank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Add remaining fields: size_value, size_unit, type, setup_date, location, description */}
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
```

**Testing:**
- [ ] All fields render correctly
- [ ] Validation errors display on invalid input
- [ ] Form submission triggers `onSubmit` callback
- [ ] Loading state appears during submission
- [ ] Toast notifications appear

---

#### T039 [P] [US1] - ImageUpload Component
**Owner:** [Assign]  
**Estimated Time:** 2 hours  
**File:** `src/components/shared/image-upload.tsx`  
**Dependencies:** T020 (Supabase Storage bucket)

**Acceptance Criteria (per REMEDIATION):**
- [ ] Max file size: 5MB (show error if exceeded)
- [ ] Allowed formats: jpg, png, webp (reject others)
- [ ] Strip EXIF data before upload (prevents location leaks)
- [ ] Generate thumbnail (200x200) for card display
- [ ] Upload progress indicator
- [ ] Delete uploaded image (remove from Supabase Storage)
- [ ] Preview image before upload
- [ ] Multiple image upload support (max 5 per aquarium)

**Code Template:**
```typescript
// src/components/shared/image-upload.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  maxFiles?: number;
}

export function ImageUpload({ onUpload, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const supabase = createClient();

  const validateFile = (file: File): boolean => {
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File too large. Max 5MB.', variant: 'destructive' });
      return false;
    }

    // Allowed formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Error', description: 'Invalid format. Use JPG, PNG, or WebP.', variant: 'destructive' });
      return false;
    }

    return true;
  };

  const stripExifAndResize = async (file: File): Promise<File> => {
    // Use canvas to strip EXIF and resize
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Max dimensions 1920x1080
          let width = img.width;
          let height = img.height;
          if (width > 1920) {
            height = (height * 1920) / width;
            width = 1920;
          }
          if (height > 1080) {
            width = (width * 1080) / height;
            height = 1080;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + previews.length > maxFiles) {
      toast({ title: 'Error', description: `Maximum ${maxFiles} images allowed`, variant: 'destructive' });
      return;
    }

    setUploading(true);

    for (const file of files) {
      if (!validateFile(file)) continue;

      // Strip EXIF
      const processedFile = await stripExifAndResize(file);

      // Upload to Supabase
      const fileName = `${Date.now()}-${processedFile.name}`;
      const { data, error } = await supabase.storage
        .from('aquarium-images')
        .upload(fileName, processedFile);

      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('aquarium-images')
        .getPublicUrl(fileName);

      setPreviews((prev) => [...prev, publicUrl]);
      onUpload(publicUrl);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        disabled={uploading || previews.length >= maxFiles}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button type="button" disabled={uploading} asChild>
          <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
        </Button>
      </label>

      <div className="grid grid-cols-3 gap-4">
        {previews.map((url, i) => (
          <div key={i} className="relative">
            <Image src={url} alt={`Preview ${i}`} width={200} height={200} className="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Testing:**
- [ ] Upload valid image (jpg, png, webp under 5MB) → success
- [ ] Upload 6MB file → error message
- [ ] Upload .gif file → error message
- [ ] Verify EXIF stripped (check file metadata in browser dev tools)
- [ ] Verify image appears in Supabase Storage dashboard
- [ ] Delete image → removed from storage

---

### **Block 3: Server Actions (Start after Block 1)**

#### T032 [US1] - Create Aquarium Action
**Owner:** [Assign]  
**Estimated Time:** 1 hour  
**File:** `src/lib/actions/aquariums.ts`  
**Dependencies:** T029, T030 (types + validation)

**Acceptance Criteria:**
- [ ] Server action with `'use server'` directive
- [ ] Validates input with Zod schema
- [ ] Checks user authentication (get user from Supabase)
- [ ] Inserts into `aquariums` table via Drizzle
- [ ] Returns created aquarium ID or error
- [ ] Revalidates `/aquariums` path

**Code Template:**
```typescript
// src/lib/actions/aquariums.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { aquariums } from '@/lib/db/schema';
import { aquariumSchema } from '@/lib/validations/aquarium';

export async function createAquarium(formData: unknown) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const validatedData = aquariumSchema.parse(formData);

  const [aquarium] = await db
    .insert(aquariums)
    .values({
      user_id: user.id,
      ...validatedData,
    })
    .returning();

  revalidatePath('/aquariums');
  return aquarium;
}
```

**Testing:**
- [ ] Call with valid data → returns aquarium object
- [ ] Call without auth → throws "Unauthorized"
- [ ] Call with invalid data → throws Zod validation error
- [ ] Verify record in Neon database

---

#### T033-T036 - Update, Delete, Fetch Actions
Follow similar pattern as T032. Full implementations provided in kickoff documentation.

---

### **Block 4: Pages (Start after Blocks 2+3)**

#### T040 [US1] - Aquariums List Page
**Owner:** [Assign]  
**Estimated Time:** 1 hour  
**File:** `src/app/(dashboard)/aquariums/page.tsx`  
**Dependencies:** T029, T035, T037

**Acceptance Criteria:**
- [ ] Server component fetching user's aquariums
- [ ] Displays grid of AquariumCard components
- [ ] "Create New" button links to `/aquariums/new`
- [ ] Empty state when no aquariums: "Get started by creating your first aquarium"
- [ ] Loading skeleton during data fetch
- [ ] Mobile-responsive grid (1 col mobile, 2 tablet, 3 desktop)

**Code Template:**
```typescript
// src/app/(dashboard)/aquariums/page.tsx
import { fetchUserAquariums } from '@/lib/actions/aquariums';
import { AquariumCard } from '@/components/aquariums/aquarium-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AquariumsPage() {
  const aquariums = await fetchUserAquariums();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Aquariums</h1>
        <Button asChild>
          <Link href="/aquariums/new">Create New</Link>
        </Button>
      </div>

      {aquariums.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No aquariums yet. Get started by creating your first aquarium!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aquariums.map((aquarium) => (
            <AquariumCard key={aquarium.id} aquarium={aquarium} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Testing:**
- [ ] Page loads with data
- [ ] Grid responsive on different screen sizes
- [ ] Empty state displays when no aquariums
- [ ] "Create New" button navigates correctly

---

#### T041 [US1] - Aquarium Detail Page
**Owner:** [Assign]  
**Estimated Time:** 2 hours  
**File:** `src/app/(dashboard)/aquariums/[id]/page.tsx`  
**Dependencies:** T029, T031, T036, T046, T051

**Acceptance Criteria:**
- [ ] Dynamic route `[id]` parameter
- [ ] Fetches single aquarium with livestock and equipment
- [ ] Displays all aquarium details
- [ ] Shows photo gallery (if multiple photos)
- [ ] Lists livestock with categories
- [ ] Lists equipment with categories
- [ ] "Edit" and "Delete" buttons (Delete uses T055 confirmation)
- [ ] "Add Livestock" and "Add Equipment" buttons
- [ ] 404 page if aquarium not found

---

#### T042 [US1] - New Aquarium Page
**Owner:** [Assign]  
**Estimated Time:** 45 minutes  
**File:** `src/app/(dashboard)/aquariums/new/page.tsx`  
**Dependencies:** T029, T030, T032, T038, T039

**Acceptance Criteria:**
- [ ] Page title: "Create New Aquarium"
- [ ] Renders AquariumForm component
- [ ] Renders ImageUpload component
- [ ] Submits to createAquarium action
- [ ] Redirects to detail page on success
- [ ] Shows validation errors inline

---

### **Block 5: Livestock & Equipment (Parallel with Block 3)**

#### T043-T045 - Livestock Actions
#### T046-T047 - Livestock Components
#### T048-T050 - Equipment Actions
#### T051-T052 - Equipment Components

Similar patterns to aquarium actions/components. Full details in task descriptions.

---

### **Block 6: Final Polish**

#### T053 [US1] - Dashboard Layout
**Owner:** [Assign]  
**Estimated Time:** 1.5 hours  
**File:** `src/app/(dashboard)/layout.tsx`

**Acceptance Criteria:**
- [ ] Sidebar navigation: Dashboard, Aquariums, Water Testing, History, etc.
- [ ] Mobile: hamburger menu with drawer
- [ ] Desktop: persistent sidebar
- [ ] Active route highlighting
- [ ] User profile dropdown in header
- [ ] Logout button

---

#### T054 [US1] - Main Dashboard Page
**Owner:** [Assign]  
**Estimated Time:** 2 hours  
**File:** `src/app/(dashboard)/dashboard/page.tsx`

**Acceptance Criteria:**
- [ ] Quick stats: Total aquariums, Recent tests, Upcoming maintenance
- [ ] "Recent Activity" feed
- [ ] Quick action cards: "Add Aquarium", "Test Water", "View History"
- [ ] Displays first 3 aquariums with "View All" link

---

#### T055 [US1] - Delete Confirmation Dialog
**Owner:** [Assign]  
**Estimated Time:** 45 minutes  
**File:** `src/components/aquariums/delete-confirmation.tsx`

**Acceptance Criteria:**
- [ ] Uses Shadcn AlertDialog component
- [ ] Shows warning message: "This will permanently delete [Aquarium Name] and all associated data (tests, livestock, equipment). This action cannot be undone."
- [ ] "Cancel" and "Delete" buttons
- [ ] "Delete" button is destructive red style
- [ ] Shows loading state during deletion
- [ ] Closes dialog and redirects on success

---

## 🧪 Testing Checklist

### Unit Tests (Create in `__tests__/` directory)

- [ ] **Types & Validation**
  - [ ] `aquarium.types.test.ts` - Test conversion utilities
  - [ ] `aquarium.validation.test.ts` - Test Zod schema with valid/invalid inputs

- [ ] **Server Actions**
  - [ ] `aquariums.actions.test.ts` - Mock Drizzle + Supabase, test CRUD operations

- [ ] **Components**
  - [ ] `aquarium-card.test.tsx` - Render with mock data
  - [ ] `aquarium-form.test.tsx` - Test form submission, validation errors
  - [ ] `image-upload.test.tsx` - Test file validation, upload flow

### Integration Tests

- [ ] **Full User Flow**
  - [ ] Sign up → Create aquarium → Add livestock → Add equipment → View detail → Edit → Delete
  - [ ] Verify all data persists correctly in Neon database
  - [ ] Test image upload end-to-end (upload → view in detail → delete)

### Manual Testing

- [ ] **Cross-Browser**
  - [ ] Chrome, Firefox, Safari - all pages render correctly
  
- [ ] **Responsive Design**
  - [ ] Mobile (320px-767px): Hamburger menu, single column cards
  - [ ] Tablet (768px-1023px): 2-column grid
  - [ ] Desktop (1024px+): 3-column grid, persistent sidebar

- [ ] **Accessibility (WCAG 2.1 AA)**
  - [ ] Keyboard navigation works (Tab through forms, Enter to submit)
  - [ ] Screen reader announces all form labels
  - [ ] Color contrast ratios pass (use axe DevTools)
  - [ ] Focus indicators visible on all interactive elements

- [ ] **Error Handling**
  - [ ] Network error during form submission → shows toast
  - [ ] Invalid aquarium ID → shows 404 page
  - [ ] Unauthenticated access → redirects to login
  - [ ] File upload failure → shows error message

---

## 📊 Definition of Done

Before marking Phase 3 complete, verify:

- [ ] **All 27 tasks (T029-T055) completed and merged**
- [ ] **Test coverage ≥80%** for server actions and components
- [ ] **All 7 functional requirements (FR-001 to FR-007) verified**
- [ ] **Success criteria met:**
  - [ ] SC-001: User can create aquarium + record first test within 5 minutes (we'll verify test in Phase 4, but profile creation should be fast)
- [ ] **No TypeScript errors:** `npm run type-check`
- [ ] **No ESLint errors:** `npm run lint`
- [ ] **Lighthouse scores:** Performance ≥90, Accessibility ≥95
- [ ] **Documentation updated:** Add US1 to README.md "Completed Features"
- [ ] **Demo ready:** Can demonstrate full CRUD flow to stakeholders

---

## 🚀 Sprint Ceremonies

### Daily Standup (15 minutes)
- What did I complete yesterday?
- What will I work on today?
- Any blockers?

**Blockers to Watch:**
- Supabase Storage bucket permissions issues
- Drizzle schema migration failures
- Image EXIF stripping browser compatibility

### Mid-Sprint Review (Day 7-8)
- Demo: Create aquarium flow working end-to-end
- Review: Code quality, test coverage
- Adjust: Re-prioritize remaining tasks if behind

### Sprint Retrospective (End of Phase 3)
- What went well?
- What could be improved?
- Action items for Phase 4

---

## 📚 Resources

- **Specification:** `specs/001-aquarium-toolkit/spec.md` (FR-001 to FR-007)
- **Data Model:** `specs/001-aquarium-toolkit/data-model.md`
- **API Contracts:** `specs/001-aquarium-toolkit/contracts/aquariums.yaml`
- **Remediation Notes:** `REMEDIATION_APPLIED.md`, `REMEDIATION_MEDIUM_SEVERITY.md`
- **Constitution:** `.specify/memory/constitution.md` (Principle I: Component-First)

**External Docs:**
- [Next.js App Router](https://nextjs.org/docs/app)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [React Hook Form](https://react-hook-form.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

## ✅ Ready to Start!

**First 3 Tasks (Start TODAY):**
1. **T029** - Create Aquarium type (30 min)
2. **T030** - Create Zod schema (45 min)
3. **T037** - Create AquariumCard component (1 hour)

**Estimated completion:** 2-3 weeks for all 27 tasks

🎯 **Let's build something amazing!**
