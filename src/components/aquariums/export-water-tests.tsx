'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  exportAsCSV, 
  exportAsPDF, 
  generateExportFilename,
  getExportSummary 
} from '@/lib/utils/export';
import type { WaterTest } from '@/types/aquarium';

interface ExportWaterTestsProps {
  waterTests: WaterTest[];
  aquariumLookup?: Record<string, string>;
  disabled?: boolean;
}

export function ExportWaterTests({ 
  waterTests, 
  aquariumLookup = {},
  disabled = false 
}: ExportWaterTestsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const { toast } = useToast();

  const summary = getExportSummary(waterTests, aquariumLookup);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (waterTests.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Add some water tests to export their history.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const filename = generateExportFilename('water-test-history', format);
      
      if (format === 'csv') {
        exportAsCSV(waterTests, aquariumLookup, filename);
      } else {
        exportAsPDF(waterTests, aquariumLookup, filename);
      }

      toast({
        title: 'Export successful',
        description: `Downloaded ${summary.totalTests} test results as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error creating the export file.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
      setShowPreview(false);
    }
  };

  const showExportPreview = (format: 'csv' | 'pdf') => {
    setExportFormat(format);
    setShowPreview(true);
  };

  if (waterTests.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => showExportPreview('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => showExportPreview('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Water Test History</DialogTitle>
            <DialogDescription>
              Review your export details before downloading as {exportFormat.toUpperCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold">{summary.totalTests}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Aquariums</p>
                <p className="text-2xl font-bold">{summary.aquariumCount}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Date Range</p>
              <p className="text-sm text-muted-foreground">{summary.dateRange}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Parameters</p>
              <Badge variant="outline">{summary.parameterCount} measurements</Badge>
            </div>

            {exportFormat === 'csv' && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> Perfect for spreadsheet analysis. Each parameter measurement will be a separate row with columns for aquarium, date, parameter name, value, and status.
                </p>
              </div>
            )}

            {exportFormat === 'pdf' && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>PDF Format:</strong> Professional report format. Tests are grouped by aquarium with color-coded parameters and summary statistics.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleExport(exportFormat)}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : exportFormat === 'csv' ? (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Download {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}