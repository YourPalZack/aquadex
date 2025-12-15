'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const { toast } = useToast();
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canShare = typeof navigator !== 'undefined' && navigator.share !== undefined;

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: shareUrl,
        });
        toast({ title: 'Shared successfully!' });
      } catch (error) {
        console.error('Error sharing:', error);
        // Don't toast error if user cancels share dialog
        if ((error as Error).name !== 'AbortError') {
            toast({ title: 'Could not share', description: 'Something went wrong.', variant: 'destructive' });
        }
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(`${title}\n${text}\n${shareUrl}`);
        toast({ title: 'Copied to clipboard!', description: 'Link and text copied.' });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({ title: 'Could not copy', description: 'Failed to copy to clipboard.', variant: 'destructive' });
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share results">
            {canShare ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{canShare ? 'Share' : 'Copy to Clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}