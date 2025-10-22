"use client"

import HistoricalAnalytics from '@/components/aquariums/historical-analytics'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export default function HistoricalAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="sr-only">Water Test Analytics</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Water Tests', href: '/water-tests' },
          { label: 'Analytics' },
        ]}
        className="mb-4"
      />
      <HistoricalAnalytics />
    </div>
  )
}