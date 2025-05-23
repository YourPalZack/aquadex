
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Share2, Trash2, CalendarDays, FileText, Edit3 } from 'lucide-react';
import type { TestResult } from '@/types';
import { format } from 'date-fns';
import { ShareButton } from '@/components/shared/ShareButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface HistoryTableProps {
  testResults: TestResult[];
  onViewDetails: (resultId: string) => void;
  onDeleteConfirm: (result: TestResult) => void;
  getShareText: (result: TestResult) => string;
}

export default function HistoryTable({ 
  testResults, 
  onViewDetails, 
  onDeleteConfirm,
  getShareText
}: HistoryTableProps) {

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TooltipProvider>
      <Table>
        <TableCaption>A list of your recent water test results.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">
                <CalendarDays className="inline-block w-4 h-4 mr-1" /> Date
            </TableHead>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>
                <FileText className="inline-block w-4 h-4 mr-1" /> Parameters
            </TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                {format(new Date(result.timestamp), 'MMM d, yyyy, p')}
              </TableCell>
              <TableCell>
                {result.imageUrl ? (
                   <Image 
                    src={result.imageUrl} 
                    alt={`Test strip for ${format(new Date(result.timestamp), 'PP')}`} 
                    width={60} 
                    height={40} 
                    className="rounded object-cover"
                    data-ai-hint="test strip" 
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No Image</span>
                )}
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default">{truncateText(result.parameters, 60)}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-xs">
                    <p className="text-sm whitespace-pre-wrap">{result.parameters}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                {result.notes ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">{truncateText(result.notes, 40)}</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-xs">
                      <p className="text-sm whitespace-pre-wrap">{result.notes}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : <span className="text-xs text-muted-foreground">N/A</span> }
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(result.id)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Details</p>
                  </TooltipContent>
                </Tooltip>
                <ShareButton 
                    title={`AquaStrip Test Result - ${format(new Date(result.timestamp), 'PP')}`}
                    text={getShareText(result)}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button variant="ghost" size="icon" onClick={() => onDeleteConfirm(result)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete Result</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Result</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
