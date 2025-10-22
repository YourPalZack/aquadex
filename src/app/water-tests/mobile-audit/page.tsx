"use client"

import MobileResponsivenessAudit from '@/components/aquariums/mobile-responsiveness-audit'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export default function MobileAuditPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="sr-only">Water Tests Mobile Audit</h1>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Water Tests', href: '/water-tests' },
          { label: 'Mobile Audit' },
        ]}
        className="mb-4"
      />
      <MobileResponsivenessAudit />
    </div>
  )
}