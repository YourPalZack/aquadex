import { Droplets } from 'lucide-react';
import type { SVGProps } from 'react';

// Using Droplets icon as a placeholder for a more specific logo
const AquaDropIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.5 10.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 1.99-1.21 3.68-3 4.34" />
      <path d="M17.73 10.67a6.004 6.004 0 0 0-10.26-.02" />
      <path d="M12 12.5a6.97 6.97 0 0 0-7 5.36c0 2.06 1.78 3.28 3.88 2.95" />
      <path d="M15.12 20.82A6.97 6.97 0 0 0 19 17.86c0-2.06-1.78-3.28-3.88-2.95" />
    </svg>
);


export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-2">
      <AquaDropIcon className={`${iconSize} text-primary`} />
      <span className={`font-semibold ${textSize} text-primary`}>AquaDex</span>
    </div>
  );
}
