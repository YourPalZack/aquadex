import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const lastIndex = items.length - 1
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === lastIndex
          return (
            <li key={`${item.label}-${i}`} className="flex items-center">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-foreground hover:underline focus:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-foreground' : ''}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="mx-2 select-none" aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
