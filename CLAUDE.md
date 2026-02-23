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
- **Styling**: Tailwind CSS 4 + custom CSS variables
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
│   └── globals.css         # CSS variables + custom utilities
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
    │   ├── client.ts       # Browser Supabase client
    │   ├── server.ts       # Server Supabase client (with cookies)
    │   └── types/          # TypeScript types for DB tables
    ├── utils.ts            # cn() utility for className merging
    └── section-defaults.ts # Fallback content when DB unavailable
```

### Key Patterns

**Supabase Clients**
- Browser: `import { supabase } from '@/lib/supabase/client'`
- Server Components: `import { createClient } from '@/lib/supabase/server'` (async)

**Data Fetching**
- Public data uses TanStack Query hooks (e.g., `usePageSection`, `useHeroStats`)
- Admin mutations include edit history tracking via `section_edit_history` table
- Fallback defaults in `section-defaults.ts` when DB fails

**Admin Authentication**
- Role-based access via `user_roles` table
- Server-side verification using `has_role` RPC function
- Protected routes redirect to `/auth` if not authenticated

**Styling Conventions**
- CSS variables defined in `globals.css` for theming (light/dark)
- Primary color: teal (#14b8a6)
- Custom utilities: `.glass-card`, `.teal-glow`, `.text-gradient`, `.hover-lift`
- Path alias: `@/*` maps to `./src/*`

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Database Tables (Supabase)
- `page_sections` - CMS content fields by section
- `hero_stats` - Landing page statistics
- `space_slides` - Space section carousel items
- `system_cards` - System section feature cards
- `operating_hours` - Operating schedule data
- `consultations` - Contact form submissions
- `notices` - Notice board posts
- `site_settings` - Key-value site configuration
- `user_roles` - Admin role assignments
- `section_edit_history` - Content edit audit log
