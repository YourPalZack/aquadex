# Test Case Templates - 001 Aquarium Toolkit
**Feature:** 001-Aquarium Toolkit  
**Generated:** October 20, 2025  
**Based on:** Remediation fixes (27 issues resolved)

---

## Test Organization

```
tests/
├── unit/
│   ├── types/
│   │   └── aquarium.test.ts
│   ├── validations/
│   │   └── aquarium-validation.test.ts
│   ├── utils/
│   │   └── trend-analysis.test.ts
│   └── ai/
│       └── confidence-threshold.test.ts
├── integration/
│   ├── aquarium-crud.test.ts
│   ├── water-testing.test.ts
│   ├── marketplace-messaging.test.ts
│   └── maintenance-history.test.ts
├── e2e/
│   ├── user-journey.spec.ts
│   ├── mvp-flow.spec.ts
│   └── accessibility.spec.ts
└── fixtures/
    ├── mock-aquariums.ts
    ├── mock-water-tests.ts
    └── test-strip-images/
```

---

## 1. HIGH-SEVERITY REMEDIATION TEST CASES

### TC-FIX-001: AI Confidence Threshold (FR-011)
**Requirement:** System MUST allow manual value adjustment when confidence score is below 75%  
**Remediation:** Added explicit 75% threshold

```typescript
// tests/unit/ai/confidence-threshold.test.ts
import { analyzeTestStrip } from '@/ai/flows/analyze-test-strip';

describe('AI Confidence Threshold (FR-011)', () => {
  test('Confidence ≥75% - Manual adjustment UI hidden', async () => {
    const mockImage = Buffer.from('test-image-high-quality');
    const result = await analyzeTestStrip(mockImage);
    
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    expect(result.showManualAdjustment).toBe(false);
  });

  test('Confidence <75% - Manual adjustment UI shown', async () => {
    const mockImage = Buffer.from('test-image-poor-quality');
    const result = await analyzeTestStrip(mockImage);
    
    expect(result.confidence).toBeLessThan(0.75);
    expect(result.showManualAdjustment).toBe(true);
  });

  test('Confidence exactly 75% - Boundary test', async () => {
    const mockImage = Buffer.from('test-image-boundary');
    const result = await analyzeTestStrip(mockImage);
    
    if (result.confidence === 0.75) {
      expect(result.showManualAdjustment).toBe(false); // ≥75% means no adjustment
    }
  });

  test('Manual adjustment overrides AI values', async () => {
    const aiResult = { ph: 7.0, confidence: 0.65 };
    const manualOverride = { ph: 7.2 };
    
    const finalResult = applyManualAdjustment(aiResult, manualOverride);
    
    expect(finalResult.ph).toBe(7.2);
    expect(finalResult.source).toBe('manual');
  });
});
```

**Expected Outcomes:**
- ✅ Confidence ≥75%: No manual adjustment UI
- ✅ Confidence <75%: Manual adjustment UI appears
- ✅ User can override AI values
- ✅ Final result tracks source (AI vs manual)

---

### TC-FIX-002: Normal Load Definition (FR-061)
**Requirement:** System MUST respond to user interactions within 2 seconds under normal load (up to 100 concurrent users with 95th percentile response time at 2 seconds)  
**Remediation:** Defined normal load = 100 concurrent users

```typescript
// tests/integration/performance/load-testing.test.ts
import { test, expect } from '@playwright/test';
import autocannon from 'autocannon';

describe('Normal Load Performance (FR-061)', () => {
  test('100 concurrent users - 95th percentile <2s', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/api/aquariums',
      connections: 100,
      duration: 60, // 1 minute test
    });

    const p95 = result.latency.p95;
    
    expect(p95).toBeLessThan(2000); // 2 seconds in ms
  });

  test('Individual page load <2s under normal load', async ({ page }) => {
    // Simulate 100 concurrent users in background
    const loadSimulation = simulateConcurrentUsers(100);

    const startTime = Date.now();
    await page.goto('/aquariums');
    await page.waitForSelector('[data-testid="aquarium-card"]');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
    
    await loadSimulation.stop();
  });

  test('API response times under normal load', async () => {
    const results = [];
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      await fetch('/api/aquariums');
      const duration = performance.now() - start;
      results.push(duration);
    }

    const sorted = results.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[p95Index];

    expect(p95).toBeLessThan(2000);
  });
});
```

**Expected Outcomes:**
- ✅ 100 concurrent users: 95th percentile <2s
- ✅ Page loads remain fast under load
- ✅ API endpoints respond <2s

---

### TC-FIX-003: AI Analysis Performance (FR-062)
**Requirement:** System MUST process test strip image analysis within 10 seconds for 85% of requests, with 15-second timeout for remaining cases  
**Remediation:** Clarified 85% @ 10s, 15% @ 15s with timeout

```typescript
// tests/integration/ai/analysis-performance.test.ts
describe('AI Analysis Performance (FR-062)', () => {
  test('85% of analyses complete within 10 seconds', async () => {
    const testImages = generateMockTestStrips(100);
    const results = [];

    for (const image of testImages) {
      const start = Date.now();
      await analyzeTestStrip(image);
      const duration = Date.now() - start;
      results.push(duration);
    }

    const under10s = results.filter(d => d <= 10000).length;
    const percentageUnder10s = (under10s / results.length) * 100;

    expect(percentageUnder10s).toBeGreaterThanOrEqual(85);
  });

  test('15-second timeout enforced for slow analyses', async () => {
    const slowImage = generateComplexTestStrip(); // Poor quality image

    const promise = analyzeTestStrip(slowImage);
    
    await expect(promise).resolves.toBeDefined(); // Should complete
    
    const start = Date.now();
    await promise;
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(15000); // Must timeout by 15s
  });

  test('Timeout returns partial results with low confidence', async () => {
    const slowImage = generateComplexTestStrip();

    const result = await analyzeTestStrip(slowImage, { timeout: 15000 });

    if (result.timedOut) {
      expect(result.confidence).toBeLessThan(0.75);
      expect(result.showManualAdjustment).toBe(true);
    }
  });
});
```

**Expected Outcomes:**
- ✅ 85%+ analyses complete in ≤10s
- ✅ Remaining 15% complete by 15s timeout
- ✅ Timeout triggers manual adjustment UI

---

### TC-FIX-004: Treatment Compatibility Matrix (FR-025, Appendix A)
**Requirement:** System MUST warn users about treatment compatibility issues (Appendix A defines dangerous combinations)  
**Remediation:** Added comprehensive compatibility matrix

```typescript
// tests/unit/ai/treatment-compatibility.test.ts
import { checkTreatmentCompatibility } from '@/lib/utils/treatment-safety';

describe('Treatment Compatibility Matrix (FR-025, Appendix A)', () => {
  test('CRITICAL: Copper + Invertebrates → Warning', () => {
    const aquarium = {
      livestock: [{ category: 'invertebrate', species: 'Cherry Shrimp' }]
    };
    const treatment = { name: 'Copper Sulfate', type: 'copper-based' };

    const result = checkTreatmentCompatibility(aquarium, treatment);

    expect(result.severity).toBe('CRITICAL');
    expect(result.warning).toContain('toxic to invertebrates');
    expect(result.safe).toBe(false);
  });

  test('CRITICAL: Potassium Permanganate + Organic Compounds → Warning', () => {
    const recentTreatments = [{ name: 'Seachem Prime', appliedAt: Date.now() - 3600000 }]; // 1 hour ago
    const newTreatment = { name: 'Potassium Permanganate' };

    const result = checkTreatmentCompatibility({ recentTreatments }, newTreatment);

    expect(result.severity).toBe('CRITICAL');
    expect(result.warning).toContain('Reacts violently');
    expect(result.safe).toBe(false);
  });

  test('HIGH RISK: Multiple Antibiotics → Warning', () => {
    const recentTreatments = [{ name: 'Kanamycin', appliedAt: Date.now() - 86400000 }]; // 1 day ago
    const newTreatment = { name: 'Erythromycin' };

    const result = checkTreatmentCompatibility({ recentTreatments }, newTreatment);

    expect(result.severity).toBe('HIGH');
    expect(result.warning).toContain('liver damage');
    expect(result.safe).toBe(false);
  });

  test('SAFE: Compatible treatments → No warning', () => {
    const aquarium = { livestock: [{ category: 'fish', species: 'Neon Tetra' }] };
    const treatment = { name: 'API General Cure', type: 'antiparasitic' };

    const result = checkTreatmentCompatibility(aquarium, treatment);

    expect(result.severity).toBe('SAFE');
    expect(result.safe).toBe(true);
  });

  test('Dosage calculation based on tank size', () => {
    const aquarium = { size_value: 55, size_unit: 'gallons' };
    const treatment = { name: 'Methylene Blue', dosagePerGallon: 0.5 }; // 2-5 ppm

    const dosage = calculateDosage(aquarium, treatment);

    expect(dosage.amount).toBe(27.5); // 55 * 0.5
    expect(dosage.unit).toBe('mL');
    expect(dosage.concentration).toBe('2-5 ppm');
  });
});
```

**Expected Outcomes:**
- ✅ Copper + invertebrates: CRITICAL warning
- ✅ Dangerous chemical reactions: CRITICAL warning
- ✅ Medication interactions: HIGH warning
- ✅ Safe combinations: No warning
- ✅ Dosage calculated correctly by tank size

---

### TC-FIX-005: Test Strip Brand Detection (FR-014)
**Requirement:** System MUST support multiple test strip brands by identifying brand from photo or user selection  
**Remediation:** Enhanced T059 with brand detection logic

```typescript
// tests/unit/ai/brand-detection.test.ts
import { detectTestStripBrand } from '@/ai/flows/analyze-test-strip';

describe('Test Strip Brand Detection (FR-014)', () => {
  test('API Master Test Kit - Logo detection', async () => {
    const image = loadTestImage('api-master-kit.jpg');
    
    const result = await detectTestStripBrand(image);

    expect(result.brand).toBe('API Master Test Kit');
    expect(result.confidence).toBeGreaterThan(0.75);
    expect(result.stripCount).toBe(5);
    expect(result.colorOrder).toEqual(['yellow', 'green', 'blue', 'red', 'purple']);
  });

  test('Tetra EasyStrips - Layout pattern recognition', async () => {
    const image = loadTestImage('tetra-easystrips.jpg');
    
    const result = await detectTestStripBrand(image);

    expect(result.brand).toBe('Tetra EasyStrips');
    expect(result.stripCount).toBe(6);
    expect(result.logoPosition).toBe('center');
  });

  test('Seachem MultiTest - Logo + layout', async () => {
    const image = loadTestImage('seachem-multitest.jpg');
    
    const result = await detectTestStripBrand(image);

    expect(result.brand).toBe('Seachem MultiTest');
    expect(result.stripCount).toBe(5);
    expect(result.logoPosition).toBe('bottom-right');
  });

  test('Unknown brand - Low confidence triggers picker', async () => {
    const image = loadTestImage('generic-test-strip.jpg');
    
    const result = await detectTestStripBrand(image);

    expect(result.confidence).toBeLessThan(0.75);
    expect(result.showBrandPicker).toBe(true);
    expect(result.suggestedBrands).toHaveLength(3); // Top 3 matches
  });

  test('User manual brand selection overrides detection', async () => {
    const image = loadTestImage('api-master-kit.jpg');
    
    const result = await detectTestStripBrand(image, { manualBrand: 'Tetra EasyStrips' });

    expect(result.brand).toBe('Tetra EasyStrips'); // User override
    expect(result.source).toBe('manual');
  });
});
```

**Expected Outcomes:**
- ✅ API, Tetra, Seachem brands auto-detected
- ✅ Logo and layout patterns recognized
- ✅ Low confidence triggers brand picker UI
- ✅ Manual selection overrides auto-detection

---

### TC-FIX-006: PDF Export (FR-019)
**Requirement:** System MUST allow users to export test history in standard formats (CSV, PDF)  
**Remediation:** Added T077b for PDF generation

```typescript
// tests/integration/export/pdf-export.test.ts
import { exportTestHistoryToPDF } from '@/lib/actions/export';

describe('PDF Export (FR-019, T077b)', () => {
  test('Generate PDF with test history table', async () => {
    const aquariumId = 'test-aquarium-123';
    const dateRange = { start: new Date('2025-01-01'), end: new Date('2025-10-20') };

    const pdfBuffer = await exportTestHistoryToPDF(aquariumId, dateRange);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    
    // Verify PDF header
    const header = pdfBuffer.slice(0, 5).toString();
    expect(header).toBe('%PDF-');
  });

  test('PDF includes formatted tables with all parameters', async () => {
    const mockTests = [
      { date: '2025-10-01', ph: 7.0, ammonia: 0, nitrite: 0, nitrate: 10 },
      { date: '2025-10-15', ph: 7.2, ammonia: 0, nitrite: 0, nitrate: 15 },
    ];

    const pdf = await exportTestHistoryToPDF('aq-123', { tests: mockTests });

    // Parse PDF content (use pdf-parse library)
    const content = await parsePDFContent(pdf);

    expect(content).toContain('Water Test History');
    expect(content).toContain('7.0'); // pH value
    expect(content).toContain('2025-10-01'); // Date
  });

  test('PDF includes trend charts as embedded images', async () => {
    const aquariumId = 'test-aquarium-123';

    const pdf = await exportTestHistoryToPDF(aquariumId);

    // Verify PDF contains embedded images (Recharts exported)
    const images = await extractImagesFromPDF(pdf);
    expect(images.length).toBeGreaterThan(0);
  });

  test('PDF generation fails gracefully with error message', async () => {
    const invalidId = 'non-existent-aquarium';

    await expect(exportTestHistoryToPDF(invalidId)).rejects.toThrow('Aquarium not found');
  });
});
```

**Expected Outcomes:**
- ✅ Valid PDF buffer generated
- ✅ Table with all test parameters
- ✅ Charts embedded as images
- ✅ Error handling for invalid inputs

---

### TC-FIX-007: Platform Messaging System (FR-050)
**Requirement:** System MUST allow users to contact sellers through the platform messaging system  
**Remediation:** Added T170b, T170c, T171 for messaging

```typescript
// tests/integration/marketplace/messaging.test.ts
import { sendMessage, fetchMessageThreads, markMessagesAsRead } from '@/lib/actions/messages';

describe('Platform Messaging System (FR-050)', () => {
  test('Send message to seller', async () => {
    const listingId = 'listing-123';
    const senderId = 'buyer-456';
    const receiverId = 'seller-789';
    const messageText = 'Is this item still available?';

    const message = await sendMessage({
      listing_id: listingId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: messageText,
    });

    expect(message.id).toBeDefined();
    expect(message.read_status).toBe(false);
    expect(message.created_at).toBeInstanceOf(Date);
  });

  test('Fetch message threads grouped by listing', async () => {
    const userId = 'user-123';

    const threads = await fetchMessageThreads(userId);

    expect(threads).toHaveLength(2); // Mock: 2 conversations
    expect(threads[0]).toHaveProperty('listing_id');
    expect(threads[0]).toHaveProperty('other_user');
    expect(threads[0]).toHaveProperty('last_message');
    expect(threads[0]).toHaveProperty('unread_count');
  });

  test('Mark messages as read', async () => {
    const messageIds = ['msg-1', 'msg-2', 'msg-3'];

    await markMessagesAsRead(messageIds);

    // Verify in database
    const messages = await db.select().from(messagesTable).where(inArray(messagesTable.id, messageIds));
    
    messages.forEach(msg => {
      expect(msg.read_status).toBe(true);
    });
  });

  test('MessagingInterface component displays conversations', async () => {
    const { getByText, getAllByTestId } = render(<MessagingInterface userId="user-123" />);

    await waitFor(() => {
      expect(getByText('Messages')).toBeInTheDocument();
      expect(getAllByTestId('message-thread')).toHaveLength(2);
    });
  });

  test('Real-time message notification', async () => {
    const userId = 'user-123';
    const subscription = subscribeToMessages(userId);

    // Simulate new message from another user
    await sendMessage({ receiver_id: userId, message_text: 'Hello!' });

    await waitFor(() => {
      expect(subscription.lastMessage).toHaveProperty('message_text', 'Hello!');
    });
  });
});
```

**Expected Outcomes:**
- ✅ Messages sent successfully
- ✅ Threads grouped by listing
- ✅ Read status updates correctly
- ✅ UI displays conversations
- ✅ Real-time notifications (optional)

---

## 2. MEDIUM-SEVERITY REMEDIATION TEST CASES

### TC-FIX-008: Parameter Status Colors (FR-010)
**Requirement:** System MUST display status indicators using color coding: safe (green #10b981), warning (yellow #f59e0b), critical (red #ef4444) with WCAG AA contrast ratios

```typescript
// tests/unit/components/parameter-badge.test.tsx
import { render } from '@testing-library/react';
import { ParameterBadge } from '@/components/water-testing/parameter-badge';

describe('Parameter Status Colors (FR-010)', () => {
  test('Safe status - Green #10b981', () => {
    const { container } = render(<ParameterBadge status="safe" value="7.0" parameter="pH" />);
    
    const badge = container.querySelector('[data-status="safe"]');
    const styles = window.getComputedStyle(badge!);
    
    expect(styles.backgroundColor).toBe('rgb(16, 185, 129)'); // #10b981
  });

  test('Warning status - Yellow #f59e0b', () => {
    const { container } = render(<ParameterBadge status="warning" value="0.15" parameter="Nitrite" />);
    
    const badge = container.querySelector('[data-status="warning"]');
    const styles = window.getComputedStyle(badge!);
    
    expect(styles.backgroundColor).toBe('rgb(245, 158, 11)'); // #f59e0b
  });

  test('Critical status - Red #ef4444', () => {
    const { container } = render(<ParameterBadge status="critical" value="0.5" parameter="Ammonia" />);
    
    const badge = container.querySelector('[data-status="critical"]');
    const styles = window.getComputedStyle(badge!);
    
    expect(styles.backgroundColor).toBe('rgb(239, 68, 68)'); // #ef4444
  });

  test('WCAG AA contrast ratios', async () => {
    const { container } = render(
      <div>
        <ParameterBadge status="safe" value="7.0" parameter="pH" />
        <ParameterBadge status="warning" value="0.15" parameter="Nitrite" />
        <ParameterBadge status="critical" value="0.5" parameter="Ammonia" />
      </div>
    );

    // Use axe-core for accessibility testing
    const results = await axe(container);
    
    expect(results.violations).toHaveLength(0);
    expect(results.passes).toContainEqual(expect.objectContaining({ id: 'color-contrast' }));
  });
});
```

---

### TC-FIX-009: Trend Thresholds (FR-020)
**Requirement:** System MUST highlight concerning trends (parameters exceeding 20% increase over 7 days or 50% over 30 days)

```typescript
// tests/unit/utils/trend-analysis.test.ts
import { detectConcerningTrend } from '@/lib/utils/trend-analysis';

describe('Trend Thresholds (FR-020)', () => {
  test('20% increase over 7 days → Alert', () => {
    const tests = [
      { date: new Date('2025-10-13'), nitrate: 10 },
      { date: new Date('2025-10-20'), nitrate: 13 }, // 30% increase
    ];

    const result = detectConcerningTrend(tests, 'nitrate');

    expect(result.concerning).toBe(true);
    expect(result.percentageChange7d).toBeCloseTo(0.30, 2); // 30%
    expect(result.threshold).toBe(0.20);
  });

  test('19% increase over 7 days → No alert', () => {
    const tests = [
      { date: new Date('2025-10-13'), nitrate: 10 },
      { date: new Date('2025-10-20'), nitrate: 11.9 }, // 19% increase
    ];

    const result = detectConcerningTrend(tests, 'nitrate');

    expect(result.concerning).toBe(false);
  });

  test('50% increase over 30 days → Alert', () => {
    const tests = [
      { date: new Date('2025-09-20'), nitrate: 10 },
      { date: new Date('2025-10-20'), nitrate: 16 }, // 60% increase
    ];

    const result = detectConcerningTrend(tests, 'nitrate');

    expect(result.concerning).toBe(true);
    expect(result.percentageChange30d).toBeCloseTo(0.60, 2);
  });

  test('Stable trend → No alert', () => {
    const tests = [
      { date: new Date('2025-09-20'), nitrate: 10 },
      { date: new Date('2025-10-20'), nitrate: 10.5 }, // 5% increase
    ];

    const result = detectConcerningTrend(tests, 'nitrate');

    expect(result.concerning).toBe(false);
  });
});
```

---

### TC-FIX-010: Maintenance History (FR-033)
**Requirement:** System MUST track maintenance completion history for each aquarium  
**Remediation:** Added T102b, T107b

```typescript
// tests/integration/maintenance/history-tracking.test.ts
import { completeMaintenanceTask, fetchMaintenanceHistory } from '@/lib/actions/reminders';

describe('Maintenance History Tracking (FR-033)', () => {
  test('Complete task → Appears in history', async () => {
    const taskId = 'task-123';
    const completionNotes = 'Changed 50% water, cleaned filter';

    await completeMaintenanceTask(taskId, completionNotes);

    const history = await fetchMaintenanceHistory('aquarium-456');

    expect(history).toHaveLength(1);
    expect(history[0].task_id).toBe(taskId);
    expect(history[0].notes).toBe(completionNotes);
    expect(history[0].completed_at).toBeInstanceOf(Date);
  });

  test('Fetch history shows past 50 completions', async () => {
    // Create 60 mock completions
    for (let i = 0; i < 60; i++) {
      await completeMaintenanceTask(`task-${i}`, `Completion ${i}`);
    }

    const history = await fetchMaintenanceHistory('aquarium-456');

    expect(history).toHaveLength(50); // Limited to 50
    expect(history[0].completed_at.getTime()).toBeGreaterThan(history[49].completed_at.getTime()); // Newest first
  });

  test('MaintenanceHistory component renders log', async () => {
    const { getAllByTestId, getByText } = render(<MaintenanceHistory aquariumId="aq-123" />);

    await waitFor(() => {
      expect(getByText('Maintenance History')).toBeInTheDocument();
      expect(getAllByTestId('history-entry')).toHaveLength(5);
    });
  });
});
```

---

## 3. E2E USER JOURNEY TESTS

### TC-E2E-001: MVP User Flow
**Scenario:** New user signs up and creates first aquarium with water test

```typescript
// tests/e2e/mvp-flow.spec.ts
import { test, expect } from '@playwright/test';

test('MVP User Journey (SC-001: <5 minutes)', async ({ page }) => {
  const startTime = Date.now();

  // Step 1: Sign Up
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  // Step 2: Create Aquarium
  await page.click('text=Create New Aquarium');
  await page.fill('[name="name"]', 'My First Tank');
  await page.selectOption('[name="size_unit"]', 'gallons');
  await page.fill('[name="size_value"]', '55');
  await page.selectOption('[name="type"]', 'freshwater');
  await page.click('button:has-text("Create Aquarium")');
  
  await expect(page.locator('text=Aquarium saved successfully')).toBeVisible();

  // Step 3: Navigate to Water Testing
  await page.click('text=Test Water');
  
  // Step 4: Upload Test Strip Photo
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('./tests/fixtures/test-strip-images/api-master-kit.jpg');
  
  // Step 5: Wait for AI Analysis
  await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 15000 });
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000; // seconds

  // Verify SC-001: Complete within 5 minutes
  expect(totalTime).toBeLessThan(300); // 5 minutes = 300 seconds
  
  // Verify all parameters displayed
  await expect(page.locator('text=pH')).toBeVisible();
  await expect(page.locator('text=Ammonia')).toBeVisible();
  await expect(page.locator('text=Nitrite')).toBeVisible();
  
  console.log(`✅ MVP Flow completed in ${totalTime.toFixed(1)} seconds`);
});
```

---

### TC-E2E-002: Complete CRUD Operations
**Scenario:** Full aquarium management lifecycle

```typescript
test('Complete CRUD Lifecycle', async ({ page }) => {
  // CREATE
  await page.goto('/aquariums/new');
  await page.fill('[name="name"]', 'Test Tank');
  await page.selectOption('[name="type"]', 'reef');
  await page.fill('[name="size_value"]', '75');
  await page.click('button:has-text("Create")');
  
  const aquariumUrl = page.url();
  const aquariumId = aquariumUrl.split('/').pop();

  // READ
  await page.goto(`/aquariums/${aquariumId}`);
  await expect(page.locator('text=Test Tank')).toBeVisible();
  await expect(page.locator('text=75 gallons')).toBeVisible();

  // UPDATE
  await page.click('text=Edit');
  await page.fill('[name="name"]', 'Updated Tank Name');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Updated Tank Name')).toBeVisible();

  // DELETE
  await page.click('text=Delete');
  await page.click('button:has-text("Delete"):last-of-type'); // Confirmation dialog
  await page.waitForURL('/aquariums');
  await expect(page.locator('text=Updated Tank Name')).not.toBeVisible();
});
```

---

## 4. ACCESSIBILITY TEST CASES

### TC-A11Y-001: Keyboard Navigation
**Requirement:** Constitution Principle VI + WCAG 2.1 AA

```typescript
// tests/e2e/accessibility.spec.ts
test('Keyboard Navigation (WCAG 2.1 AA)', async ({ page }) => {
  await page.goto('/aquariums/new');

  // Tab through all form fields
  await page.keyboard.press('Tab'); // Focus on name
  await page.keyboard.type('Keyboard Test Tank');
  
  await page.keyboard.press('Tab'); // Focus on size_value
  await page.keyboard.type('40');
  
  await page.keyboard.press('Tab'); // Focus on size_unit
  await page.keyboard.press('Enter'); // Open dropdown
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter'); // Select option
  
  await page.keyboard.press('Tab'); // Focus on submit button
  await page.keyboard.press('Enter'); // Submit form

  await expect(page.locator('text=Aquarium saved successfully')).toBeVisible();
});

test('Focus indicators visible', async ({ page }) => {
  await page.goto('/aquariums');
  
  await page.keyboard.press('Tab');
  
  const focused = await page.locator(':focus');
  const outlineStyle = await focused.evaluate(el => window.getComputedStyle(el).outline);
  
  expect(outlineStyle).not.toBe('none');
  expect(outlineStyle).not.toBe('0px');
});
```

---

## 5. PERFORMANCE TEST MATRIX

| Test ID | Scenario | Target | Measurement |
|---------|----------|--------|-------------|
| PERF-001 | Page load (aquariums list) | <3s (SC-010) | Lighthouse |
| PERF-002 | AI analysis (85% of cases) | <10s (FR-062) | Custom timing |
| PERF-003 | API response (normal load) | <2s (FR-061) | Load testing |
| PERF-004 | Image upload (5MB) | <5s | Upload timing |
| PERF-005 | PDF export (100 tests) | <10s | Export timing |

---

## 6. TEST DATA FIXTURES

```typescript
// tests/fixtures/mock-aquariums.ts
export const mockAquariums = {
  freshwater55: {
    id: 'aq-fresh-55',
    name: 'Community Tank',
    size_value: 55,
    size_unit: 'gallons',
    type: 'freshwater',
    setup_date: new Date('2024-01-15'),
    livestock: [
      { category: 'fish', species_name: 'Neon Tetra', quantity: 12 },
      { category: 'fish', species_name: 'Corydoras', quantity: 6 },
    ],
    equipment: [
      { category: 'filter', brand: 'Fluval', model: '406' },
      { category: 'heater', brand: 'Eheim', model: 'Jager 150W' },
    ]
  },
  reef120: {
    id: 'aq-reef-120',
    name: 'Reef Paradise',
    size_value: 120,
    size_unit: 'gallons',
    type: 'reef',
    setup_date: new Date('2023-06-01'),
    livestock: [
      { category: 'coral', species_name: 'Acropora', quantity: 5 },
      { category: 'fish', species_name: 'Clownfish', quantity: 2 },
      { category: 'invertebrate', species_name: 'Cleaner Shrimp', quantity: 3 },
    ]
  }
};
```

---

## 7. CONTINUOUS INTEGRATION SETUP

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:a11y
      - uses: pa11y/pa11y-ci-action@v3
```

---

## Test Execution Checklist

- [ ] **Unit Tests:** `npm run test:unit` (≥80% coverage)
- [ ] **Integration Tests:** `npm run test:integration`
- [ ] **E2E Tests:** `npm run test:e2e`
- [ ] **Accessibility:** `npm run test:a11y` (axe + pa11y)
- [ ] **Performance:** `npm run test:perf` (Lighthouse CI)
- [ ] **Visual Regression:** Percy or Chromatic snapshots
- [ ] **Load Testing:** Artillery or k6 scripts

---

**✅ All test templates created and ready for implementation!**
