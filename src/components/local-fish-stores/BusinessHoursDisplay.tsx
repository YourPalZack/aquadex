'use client';

/**
 * Business Hours Display Component
 * Shows store operating hours and current open/closed status
 */

import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { BusinessHours, DayHours } from '@/types';
import { cn } from '@/lib/utils';

interface BusinessHoursDisplayProps {
  businessHours: BusinessHours;
  className?: string;
  showStatus?: boolean; // Show open/closed badge
  compact?: boolean; // Compact view for cards
}

export function BusinessHoursDisplay({ 
  businessHours, 
  className,
  showStatus = true,
  compact = false
}: BusinessHoursDisplayProps) {
  const isCurrentlyOpen = checkIfOpen(businessHours);
  const currentDay = getCurrentDay();

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  if (compact) {
    // Compact view - show only today's hours
    const todayHours = businessHours[currentDay] as DayHours;
    
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {todayHours?.closed ? (
            <span className="text-muted-foreground">Closed today</span>
          ) : (
            <>
              {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
            </>
          )}
        </span>
        {showStatus && (
          <StatusBadge isOpen={isCurrentlyOpen} />
        )}
      </div>
    );
  }

  // Full view - show all days
  return (
    <div className={className}>
      {showStatus && (
        <div className="mb-4">
          <StatusBadge isOpen={isCurrentlyOpen} size="large" />
        </div>
      )}
      
      <div className="space-y-2">
        {days.map(({ key, label }) => {
          const dayHours = businessHours[key];
          const isToday = key === currentDay;
          
          return (
            <div
              key={key}
              className={cn(
                'flex justify-between items-center py-1.5 px-2 rounded',
                isToday && 'bg-muted font-medium'
              )}
            >
              <span className={cn('text-sm', isToday && 'font-semibold')}>
                {label}
              </span>
              <span className="text-sm text-muted-foreground">
                {dayHours.closed ? (
                  <span className="text-red-600">Closed</span>
                ) : (
                  <>
                    {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {businessHours.exceptions && businessHours.exceptions.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Special Hours</p>
          <div className="space-y-1">
            {businessHours.exceptions.map((exception, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {formatDate(exception.date)}: {' '}
                {exception.closed ? (
                  <span className="text-red-600">Closed</span>
                ) : (
                  <>{formatTime(exception.open)} - {formatTime(exception.close)}</>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
interface StatusBadgeProps {
  isOpen: boolean;
  size?: 'small' | 'large';
}

function StatusBadge({ isOpen, size = 'small' }: StatusBadgeProps) {
  if (size === 'large') {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium',
        isOpen 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      )}>
        {isOpen ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Open Now</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5" />
            <span>Closed Now</span>
          </>
        )}
      </div>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      isOpen 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    )}>
      {isOpen ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          <span>Open</span>
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          <span>Closed</span>
        </>
      )}
    </span>
  );
}

/**
 * Helper Functions
 */

function getCurrentDay(): keyof BusinessHours {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const today = new Date().getDay();
  return days[today];
}

function checkIfOpen(businessHours: BusinessHours): boolean {
  const currentDay = getCurrentDay();
  const dayHours = businessHours[currentDay] as DayHours;
  
  if (!dayHours || dayHours.closed) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
  
  const [openHour, openMinute] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = dayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}
