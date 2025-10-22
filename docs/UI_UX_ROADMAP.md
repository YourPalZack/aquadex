# UI/UX Roadmap

A pragmatic plan to polish AquaDex’s UI/UX without blocking feature work.

## 0) Baseline improvements (quick wins)
- Add a Skip to main content link (accessibility) — DONE
- Ensure `<main>` has a stable anchor id — DONE
- Verify focus styles are visible on interactive elements (global CSS check)
- Confirm responsive breakpoints at key pages (home, LFS directory/profile, marketplace)

## 1) Design tokens and theming
- Colors: establish semantic tokens (bg, surface, border, primary, muted, destructive)
- Spacing and radii: small/medium/large scales for consistent rhythm
- Typography scale: headings, subheadings, body, small, caption; line-height guidance
- Dark mode: audit current support and ensure contrast AA/AAA where feasible

## 2) Navigation & IA
- Global nav IA: ensure primary paths are discoverable (LFS, Marketplace, Tools)
- Breadcrumbs: add to detail pages (e.g., store profiles)
- Footer: surface key resources (help, contact, policies)

## 3) Components polish
- Cards: unify padding, shadow/elevation, hover/focus feedback
- Lists: consistent empty, loading, and error states
- Forms: label/description/help/error patterns; field spacing; success toasts
- Map: marker clustering (optional), accessible popovers, keyboard nav basics

## 4) A11y checklist
- Color contrast checks across primary surfaces/buttons/text
- Landmark roles: header, nav, main (in place), footer
- Keyboard: tab order, skip links (in place), focus trapping for modals
- ARIA: dialog titles, button labels, alt text, aria-expanded on disclosures

## 5) Content & microcopy
- Tone and clarity for actions (e.g., “Add listing”, “Contact store”)
- Empty-state guidance with next steps (e.g., “Try widening your radius”)
- Error messages with resolution hints

## 6) Performance & images
- Ensure next/image used for all media (supabase storage configured)
- Lazy loading lists and deferring heavy components (maps)
- Audit Core Web Vitals in a staging run

## 7) SEO & analytics
- Directory/profile metadata defaults and canonical URLs
- XML sitemap is in place; expand dynamically in non-mock mode — DONE
- Event tracking for key actions (search, filter, view store, call/visit site)

## 8) QA flows
- LFS search → store profile → outbound click flows
- Marketplace listing creation/edit → preview → share
- Water-test analyzer (mock) → results → export/print

## Implementation notes
- Favor small PRs that land visible wins steadily
- Keep styling at the component level with Tailwind; consider a design tokens file if patterns stabilize
- Document patterns in `docs/` as they’re adopted
