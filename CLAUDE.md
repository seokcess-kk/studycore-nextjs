# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Run production server

# Linting
npm run lint         # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4 + OKLCH color system
- **Backend**: Supabase (Auth + Database)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives + shadcn/ui pattern
- **Forms**: react-hook-form + zod validation
- **Animations**: framer-motion

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard (protected)
│   ├── auth/               # Authentication page
│   ├── notices/            # Notice board with [id] dynamic route
│   ├── providers.tsx       # Global providers (QueryClient, Theme, Auth)
│   └── globals.css         # Tailwind v4 @theme tokens + custom utilities
├── components/
│   ├── ui/                 # shadcn/ui components (Radix-based)
│   ├── admin/              # Admin-specific editors and tables
│   └── [Section].tsx       # Landing page sections (Hero, Space, System, etc.)
├── hooks/
│   ├── useAuth.tsx         # Supabase auth context + admin role check
│   ├── usePageSections.ts  # CMS content queries with TanStack Query
│   └── use*.ts             # Other data fetching hooks
└── lib/
    ├── supabase/
    │   ├── client.ts       # Browser Supabase client (lazy init with Proxy)
    │   ├── server.ts       # Server Supabase client (with cookies)
    │   └── types/          # TypeScript types for DB tables
    ├── utils.ts            # cn() utility for className merging
    └── section-defaults.ts # Fallback content when DB unavailable
```

### Key Patterns

**Supabase Clients**
- Browser: `import { supabase } from '@/lib/supabase/client'`
  - Uses Proxy pattern for lazy initialization (prevents build-time env errors)
- Server Components: `import { createClient } from '@/lib/supabase/server'` (async)

**Data Fetching with TanStack Query**
- Query key conventions:
  - `['page-sections', sectionKey]` - Public section data
  - `['page-sections-admin', sectionKey]` - Admin section with metadata
  - `['hero-stats']`, `['space-slides']`, `['system-cards']` - CMS list data
- Mutations include edit history tracking via `section_edit_history` table
- Fallback defaults in `section-defaults.ts` when DB fails

**Admin Authentication**
- Role-based access via `user_roles` table
- `has_role(user_id, 'admin')` RPC function for server-side verification
- Protected routes redirect to `/auth` if not authenticated

**Tailwind CSS v4 Patterns**
- Design tokens defined with `@theme { }` block in `globals.css`
- Custom utilities via `@utility` directive (e.g., `glass-card`, `teal-glow`, `text-gradient`)
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))`
- OKLCH color format: `oklch(55% 0.15 175)` for primary teal
- Custom animations: `fade-in`, `slide-up`, `scale-in`, `float`, `pulse-glow`

**Path Alias**
- `@/*` maps to `./src/*`

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Database Tables (Supabase)
- `page_sections` - CMS content fields by section (key: section_key + field_key)
- `hero_stats` - Landing page statistics
- `space_slides` - Space section carousel items
- `system_cards` - System section feature cards
- `operating_hours` - Operating schedule data
- `consultations` - Contact form submissions
- `notices` - Notice board posts
- `site_settings` - Key-value site configuration
- `user_roles` - Admin role assignments
- `section_edit_history` - Content edit audit log

### Database Migrations
- Location: `supabase/migrations/`
- RLS enabled on all tables with public read / admin write policies
