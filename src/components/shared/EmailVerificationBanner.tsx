/**
 * Email Verification Banner
 * Presentational component to prompt users to verify their email address.
 */

import { MailWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailVerificationBannerProps {
  email?: string | null;
  className?: string;
}

export function EmailVerificationBanner({ email, className }: EmailVerificationBannerProps) {
  return (
    <div className={cn('rounded-md border border-amber-300/50 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200 px-4 py-3 flex items-start gap-3', className)}>
      <MailWarning className="h-5 w-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm leading-relaxed">
        <p className="font-medium">Verify your email to activate your store</p>
        <p className="opacity-90">
          We've sent a verification link to {email ? <span className="font-mono">{email}</span> : 'your email address' }. Please verify your email to enable full functionality and make your store visible.
        </p>
      </div>
    </div>
  );
}
