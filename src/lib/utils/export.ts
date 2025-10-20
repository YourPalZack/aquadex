'use client';

import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';
import type { WaterTest } from '@/types/aquarium';

export interface ExportWaterTestData {
  aquariumName: string;
  testDate: string;
  testMethod: string;
  parameterName: string;
  value: number;
  unit: string;
  status: 'ideal' | 'acceptable' | 'warning' | 'critical';
  idealMin?: number;
  idealMax?: number;
  notes?: string;
}

/**
 * Convert WaterTest data to exportable format
 */
export function prepareExportData(
  waterTests: WaterTest[],
  aquariumLookup: Record<string, string> = {}
): ExportWaterTestData[] {
  const exportData: ExportWaterTestData[] = [];

  waterTests.forEach(test => {
    const aquariumName = aquariumLookup[test.aquariumId] || `Aquarium ${test.aquariumId}`;
    const testDate = format(test.testDate, 'yyyy-MM-dd HH:mm');
    
    test.parameters.forEach(param => {
      exportData.push({
        aquariumName,
        testDate,
        testMethod: test.method,
        parameterName: param.name,
        value: param.value,
        unit: param.unit,
        status: param.status,
        idealMin: param.idealRange?.min,
        idealMax: param.idealRange?.max,
        notes: test.notes || '',
      });
    });
  });

  return exportData;
}

/**
 * Export water test data as CSV
 */
export function exportAsCSV(
  waterTests: WaterTest[],
  aquariumLookup: Record<string, string> = {},
  filename: string = 'water-test-history.csv'
): void {
  const exportData = prepareExportData(waterTests, aquariumLookup);
  
  const csv = Papa.unparse(exportData, {
    header: true,
    columns: [
      'aquariumName',
      'testDate',
      'testMethod',
      'parameterName',
      'value',
      'unit',
      'status',
      'idealMin',
      'idealMax',
      'notes',
    ],
  });

  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export water test data as PDF
 */
export function exportAsPDF(
  waterTests: WaterTest[],
  aquariumLookup: Record<string, string> = {},
  filename: string = 'water-test-history.pdf'
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Water Test History Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Generation date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Group tests by aquarium
  const testsByAquarium = waterTests.reduce((acc, test) => {
    const aquariumName = aquariumLookup[test.aquariumId] || `Aquarium ${test.aquariumId}`;
    if (!acc[aquariumName]) acc[aquariumName] = [];
    acc[aquariumName].push(test);
    return acc;
  }, {} as Record<string, WaterTest[]>);

  Object.entries(testsByAquarium).forEach(([aquariumName, tests]) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Aquarium header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(aquariumName, margin, yPosition);
    yPosition += 10;

    // Sort tests by date (newest first)
    tests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    tests.forEach(test => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Test date and method
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${format(test.testedAt, 'PPP')} - ${test.method}`, margin, yPosition);
      yPosition += 8;

      // Parameters
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      test.parameters.forEach(param => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }

        const statusColor = 
          param.status === 'critical' ? [220, 53, 69] :
          param.status === 'warning' ? [255, 193, 7] :
          [40, 167, 69];

        doc.setTextColor(...statusColor);
        const paramText = `${param.name}: ${param.value} ${param.unit}`;
        doc.text(`• ${paramText}`, margin + 10, yPosition);
        
        // Reset color for ideal range
        doc.setTextColor(100, 100, 100);
        if (param.idealRange) {
          const rangeText = ` (Ideal: ${param.idealRange.min}-${param.idealRange.max} ${param.unit})`;
          const paramWidth = doc.getTextWidth(paramText);
          doc.text(rangeText, margin + 15 + paramWidth, yPosition);
        }
        
        yPosition += 6;
      });

      // Notes
      if (test.notes) {
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'italic');
        doc.text(`Notes: ${test.notes}`, margin + 10, yPosition);
        yPosition += 6;
      }

      // Reset text color
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      yPosition += 5; // Space between tests
    });

    yPosition += 10; // Space between aquariums
  });

  // Summary statistics
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Tests: ${waterTests.length}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Aquariums: ${Object.keys(testsByAquarium).length}`, margin, yPosition);
  yPosition += 6;
  
  const dateRange = waterTests.length > 0 ? 
    `${format(new Date(Math.min(...waterTests.map(t => new Date(t.testedAt).getTime()))), 'PP')} - ${format(new Date(Math.max(...waterTests.map(t => new Date(t.testedAt).getTime()))), 'PP')}` :
    'No tests found';
  doc.text(`Date Range: ${dateRange}`, margin, yPosition);

  // Save the PDF
  doc.save(filename);
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(prefix: string, extension: 'csv' | 'pdf'): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Get export summary for user feedback
 */
export function getExportSummary(
  waterTests: WaterTest[],
  aquariumLookup: Record<string, string> = {}
): { 
  totalTests: number;
  aquariumCount: number;
  dateRange: string;
  parameterCount: number;
} {
  const totalTests = waterTests.length;
  const aquariumIds = [...new Set(waterTests.map(t => t.aquariumId))];
  const aquariumCount = aquariumIds.length;
  
  const parameterCount = waterTests.reduce((sum, test) => sum + test.parameters.length, 0);
  
  const dateRange = waterTests.length > 0 ? 
    `${format(new Date(Math.min(...waterTests.map(t => new Date(t.testedAt).getTime()))), 'MMM d, yyyy')} - ${format(new Date(Math.max(...waterTests.map(t => new Date(t.testedAt).getTime()))), 'MMM d, yyyy')}` :
    'No tests available';

  return {
    totalTests,
    aquariumCount,
    dateRange,
    parameterCount,
  };
}