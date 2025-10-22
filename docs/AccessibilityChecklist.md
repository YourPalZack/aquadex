# Accessibility Baseline Checklist

This document tracks our app-wide a11y baseline and page-by-page status. Use it during reviews and before releases.

## Baseline Standards

- Landmarks
  - [ ] Each page contains semantic regions: header, main, footer
  - [ ] Primary nav is a <nav> with accessible name
  - [ ] Breadcrumbs use <nav aria-label="Breadcrumb">
- Headings
  - [ ] Exactly one visible H1 per page OR an sr-only H1 when design uses a card/hero title
  - [ ] Logical heading order (no skipping levels for presentation)
- Labels & Names
  - [ ] Interactive controls (inputs, buttons, links) have clear, descriptive names/labels
  - [ ] Icons have accessible names via aria-label, title, or visually associated text
- Focus
  - [ ] Global skip link is present and works
  - [ ] :focus-visible styles are clearly visible and meet contrast
  - [ ] Tab order is logical; no focus traps
- Color & Contrast
  - [ ] Text and interactive elements meet WCAG AA contrast
  - [ ] States (hover, focus, disabled, selected) maintain sufficient contrast
- Structure & Semantics
  - [ ] Lists, tables, and forms use semantic elements
  - [ ] Breadcrumbs separators are hidden from screen readers
- Media & Images
  - [ ] Informative images have descriptive alt text
  - [ ] Decorative images use empty alt ("")
- ARIA (only when needed)
  - [ ] No redundant or conflicting ARIA
  - [ ] Regions and widgets expose expected roles/states
- Errors & Validation
  - [ ] Forms surface errors with text, not just color
  - [ ] Error messages are associated with fields and announced to AT
- Performance & Motion
  - [ ] Respect reduced motion where applicable
  - [ ] Avoid auto-playing or looping animations without controls

## Page-by-Page Checklist

Legend: [ ] Pending / [x] Verified

- Global Layout
  - [x] Header/Main/Footer landmarks
  - [x] Skip link and focus-visible styles
- Local Fish Stores
  - [x] Directory page: Breadcrumbs + sr-only H1; keyboard access to map popups
  - [x] Store profile page: Heading hierarchy, labels for hours/services
- AI Tools
  - [x] AIQuarium Tools page: Breadcrumbs + sr-only H1
  - [ ] Analyze page: Verify labels for image upload, progress, and results regions
- Marketplace
  - [x] Root page: Breadcrumbs + sr-only H1; EmptyState semantics
  - [x] Category page: Breadcrumbs + sr-only H1; No-results EmptyState
  - [x] Listing page: Breadcrumbs; error/not-found branch semantics
  - [ ] Apply to sell: Form labels and validation announcements
- Water Tests Suite
  - [x] Pages instrumented with Breadcrumbs and sr-only H1 where appropriate
  - [ ] Chart colors meet contrast; legends/series have accessible names
- Profile/Dashboard
  - [x] Breadcrumbs + sr-only H1
  - [ ] Notifications and Settings controls labeled for AT
- Marketing Pages
  - [x] For Brands & Stores: Breadcrumbs + single visible H1
  - [x] For Breeders & Sellers: Breadcrumbs + single visible H1
  - [x] For Fishkeepers: Breadcrumbs + single visible H1

## Review Workflow

1. Run through each page with keyboard only; note any traps or confusing order
2. Test with VoiceOver (macOS) or NVDA/JAWS (Windows) basic navigation
3. Use axe DevTools or Lighthouse for quick automated checks
4. Capture any issues as actionable tasks with page, component, and severity

## Notes

- Keep Breadcrumbs items concise; the last crumb should reflect the page’s H1 text
- Avoid duplicating H1 (don’t combine a visible H1 and an sr-only H1)
- Prefer native semantics; add ARIA only when native elements can’t express intent
