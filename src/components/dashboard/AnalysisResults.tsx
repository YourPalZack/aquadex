
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AnalyzeTestStripOutput } from '@/types';
import { CheckCircle, AlertTriangle, Info, Share2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/shared/ShareButton';

interface AnalysisResultsProps {
  analysis: AnalyzeTestStripOutput | null;
}

// Basic parser, assumes "Parameter: Value Unit" format
const parseParameters = (paramString: string): Array<{ name: string; value: string; status: 'good' | 'warning' | 'danger' }> => {
  if (!paramString) return [];
  
  // Heuristic to identify ideal ranges - this should ideally come from AI or be configurable
  const idealRanges: Record<string, { warnLow?: number, idealLow?: number, idealHigh?: number, warnHigh?: number, dangerLow?: number, dangerHigh?: number }> = {
    'ph': { idealLow: 6.5, idealHigh: 7.5, warnLow: 6.0, warnHigh: 8.0, dangerLow: 5.5, dangerHigh: 8.5 },
    'ammonia': { idealHigh: 0.0, warnHigh: 0.25, dangerHigh: 0.5 }, // ppm
    'nitrite': { idealHigh: 0.0, warnHigh: 0.25, dangerHigh: 0.5 }, // ppm
    'nitrate': { idealHigh: 20, warnHigh: 40, dangerHigh: 80 }, // ppm
    'gh': { idealLow: 4, idealHigh: 8, warnLow: 2, warnHigh: 12 }, // dGH
    'kh': { idealLow: 4, idealHigh: 8, warnLow: 2, warnHigh: 12 }, // dKH
    'chlorine': { idealHigh: 0.0, warnHigh: 0.01, dangerHigh: 0.1 }, // ppm
  };

  return paramString.split(',').map(part => {
    const [name, ...valueParts] = part.trim().split(':');
    const valueWithUnit = valueParts.join(':').trim();
    const numericValue = parseFloat(valueWithUnit);
    let status: 'good' | 'warning' | 'danger' = 'good';

    const paramKey = name.trim().toLowerCase();
    if (idealRanges[paramKey] && !isNaN(numericValue)) {
        const range = idealRanges[paramKey];
        if ((range.dangerLow !== undefined && numericValue < range.dangerLow) || (range.dangerHigh !== undefined && numericValue > range.dangerHigh)) {
            status = 'danger';
        } else if ((range.warnLow !== undefined && numericValue < range.warnLow) || (range.warnHigh !== undefined && numericValue > range.warnHigh)) {
            status = 'warning';
        } else if ((range.idealLow !== undefined && numericValue < range.idealLow) || (range.idealHigh !== undefined && numericValue > range.idealHigh)) {
             // If it's outside ideal but not warning/danger, it might just be slightly off or a specific type of "warning"
             status = 'warning'; // Default to warning if outside ideal but not critical
        }
    }


    return { name: name.trim(), value: valueWithUnit, status };
  });
};

const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'danger' }) => {
  if (status === 'good') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  if (status === 'danger') return <AlertTriangle className="h-5 w-5 text-red-500" />;
  return <Info className="h-5 w-5 text-blue-500" />;
};

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (!analysis) {
    return (
      <section aria-labelledby="analysis-results-title">
        <Card className="w-full">
          <CardHeader>
            <CardTitle id="analysis-results-title" className="flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              Water Test Result
            </CardTitle>
            <CardDescription>Upload an image to see your water parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground" role="status" aria-live="polite">
              <Info className="h-10 w-10 mb-2" />
              <p>No analysis data yet.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const parameters = parseParameters(analysis.waterParameters);
  const shareText = `My Aquarium Water Analysis:\n${parameters.map(p => `${p.name}: ${p.value}`).join('\n')}`;


  return (
    <section aria-labelledby="analysis-results-title">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle id="analysis-results-title" className="text-2xl flex items-center">
                  <FileText className="w-7 h-7 mr-3 text-primary" />
                  Water Test Result
              </CardTitle>
              <CardDescription>Here are the results from your most recent test strip.</CardDescription>
            </div>
            <ShareButton title="Share Water Analysis" text={shareText} />
          </div>
        </CardHeader>
        <CardContent>
          {parameters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/12">Status</TableHead>
                  <TableHead className="w-5/12">Parameter</TableHead>
                  <TableHead className="w-6/12 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map((param, index) => (
                  <TableRow key={index} className={
                    param.status === 'danger' ? 'bg-red-50 dark:bg-red-900/30' : 
                    param.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30' : ''
                  }>
                    <TableCell><StatusIcon status={param.status} /></TableCell>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell className="text-right">{param.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Could not parse parameters from the analysis.</p>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1.5" />
          Results are AI-generated estimates. Always cross-verify with reliable test kits if unsure.
        </CardFooter>
      </Card>
    </section>
  );
}
