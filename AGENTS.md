# Agent Instructions for bitbuddies.me

You don't need to create any documentation with the implementation. I will tell you when to create the documentation. You only provide me a short summary with what was done.
Before implementing anything think that the structure and code is as simple as possible and secure.

## Commands

- Dev: `bun run dev` (runs on port 3000)
- Build: `bun run build`
- Test: `bun run test` (uses Vitest)
- Lint/Format: `bun run check` (runs Biome linter + formatter)
- Convex backend: `bun convex dev`

## Architecture

- **Framework**: TanStack Start (React 19) with file-based routing in `src/routes/`
- **Backend**: Convex (schema in `convex/schema.ts`, functions in `convex/`)
- **Auth**: Clerk (requires `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`)
- **Styling**: Tailwind CSS v4 + shadcn components (add via `bunx shadcn@latest add <component>`)
- **State**: TanStack Router loaders + React Query + TanStack Store
- **Structure**: `src/components/`, `src/hooks/`, `src/lib/`, `src/integrations/`

```
bitbuddies.me/
├── bunfig.toml                    # Bun tooling configuration (paths, plugins, runtime flags)
├── package.json                   # Project metadata, scripts, dependencies
├── .env.example                   # Template of required environment variables (Clerk keys, etc.)
├── .gitignore                     # Git exclusions for node_modules, build outputs, env files
├── public/                        # Static assets served as-is
│   ├── favicon.ico                # Default site favicon
│   └── robots.txt                 # Search engine crawl directives
├── convex/                        # Convex backend schema + server functions
│   ├── schema.ts                  # Database schema definitions with `v` validators
│   ├── courses.ts                 # CRUD + queries for course content
│   ├── workshops.ts               # CRUD + queries for workshop content
│   ├── posts.ts                   # CRUD + queries for micro-posts
│   ├── users.ts                   # User management helpers (profiles, roles)
│   ├── enrollments.ts             # Enrollment lookups and mutations
│   └── tools.ts                   # Placeholder for future AI/utility endpoints
└── src/                           # TanStack Start application source
    ├── styles.css                 # Global Tailwind theme tokens + base styles
    ├── main.tsx                   # Client entry; mounts router/app
    ├── app.config.ts              # TanStack Start configuration (router, themes, metadata)
    ├── components/                # Reusable UI building blocks
    │   ├── ui/                    # Generated shadcn components (Button, Dialog, etc.)
    │   ├── common/                # Cross-domain pieces (SEO, shared headers, empty states)
    │   │   ├── SEO.tsx            # Head tags wrapper for per-page metadata
    │   │   ├── PageHeader.tsx     # Generic page header with title/CTA slot
    │   │   └── EmptyState.tsx     # Generic empty-state renderer with icon/message
    │   ├── layout/                # Global layout primitives
    │   │   ├── Header.tsx         # Top navigation bar (logo, auth, theme toggle)
    │   │   ├── Footer.tsx         # Site footer with links/legal
    │   │   └── Sidebar.tsx        # Optional sidebar for dashboard/admin views
    │   ├── courses/               # Course-specific presentation components
    │   │   ├── CourseCard.tsx     # Compact course summary card
    │   │   ├── CourseList.tsx     # Grid/list layout for multiple courses
    │   │   └── CourseDetail.tsx   # Detailed course view with syllabus
    │   ├── workshops/             # Workshop-specific presentation components
    │   │   ├── WorkshopCard.tsx   # Workshop teaser card
    │   │   └── WorkshopList.tsx   # Listing layout for workshops
    │   ├── posts/                 # Blog/post presentation components
    │   │   ├── PostCard.tsx       # Post preview card
    │   │   └── PostList.tsx       # List renderer for posts/feed
    │   ├── profile/               # Profile/account UI pieces
    │   │   ├── ProfileHeader.tsx  # Cover/profile summary header
    │   │   ├── ProfileInfo.tsx    # Detailed profile info panel
    │   │   ├── EnrollmentsList.tsx# Enrolled courses/workshops table
    │   │   └── ProfileSettings.tsx# Settings form for account preferences
    │   └── admin/                 # Admin dashboard widgets
    │       ├── AdminNav.tsx       # Admin sidebar/top navigation
    │       ├── ContentEditor.tsx  # Rich editor for managing content entries
    │       └── ContentTable.tsx   # Table view for filtering and bulk actions
    ├── routes/                    # File-based TanStack Start routes
    │   ├── __root.tsx             # Root layout, theme provider, persistent shells
    │   ├── index.tsx              # Landing page route
    │   ├── courses/               # Public course routes
    │   │   ├── index.tsx          # `/courses` listing route
    │   │   └── $courseId.tsx      # `/courses/:courseId` detail route
    │   ├── workshops/             # Public workshop routes
    │   │   ├── index.tsx          # `/workshops` listing route
    │   │   └── $workshopId.tsx    # `/workshops/:workshopId` detail route
    │   ├── posts/                 # Public post routes
    │   │   ├── index.tsx          # `/posts` listing route
    │   │   └── $postId.tsx        # `/posts/:postId` detail route
    │   ├── profile/               # Authenticated profile routes
    │   │   ├── index.tsx          # `/profile` current-user dashboard
    │   │   ├── settings.tsx       # `/profile/settings` preferences page
    │   │   └── $userId.tsx        # `/profile/:userId` public profile view
    │   ├── admin/                 # Admin-only routes
    │   │   ├── index.tsx          # `/admin` overview
    │   │   ├── courses.tsx        # `/admin/courses` management panel
    │   │   ├── workshops.tsx      # `/admin/workshops` management panel
    │   │   └── posts.tsx          # `/admin/posts` management panel
    │   └── demo/                  # Demo pages for component/system checks
    ├── hooks/                     # Domain-specific React hooks
    │   ├── useAuth.ts             # Clerk-based auth helpers and user info
    │   ├── useCourses.ts          # Course fetching/caching via Convex + React Query
    │   ├── useWorkshops.ts        # Workshop fetching/caching helpers
    │   ├── usePosts.ts            # Post fetching/caching helpers
    │   └── useEnrollments.ts      # Enrollment status and mutations
    ├── integrations/              # External service initializers
    │   ├── clerk.ts               # Clerk client setup, providers, helpers
    │   ├── convex.ts              # Convex client and query/mutation adapters
    │   └── analytics.ts           # Analytics/tracking bootstrap (optional)
    ├── lib/                       # Typed utility functions
    │   ├── seo.ts                 # SEO helper utilities shared across routes
    │   ├── utils.ts               # General-purpose helpers (formatting, guards)
    │   └── formatters.ts          # String/date/number formatting utilities
    └── store/                     # TanStack Store slices
        └── index.ts               # Central store configuration (auth/ui slices)

```

## Code Style (Biome)

- **Formatting**: Tabs for indentation, double quotes for strings
- **Imports**: Auto-organize imports; use path alias `@/*` for `src/*`
- **Types**: Strict TypeScript enabled; avoid `any`
- **Convex Schemas**: Use `v` validators from `convex/values`; system fields `_id` and `_creationTime` are auto-generated

## UI Instructions

Use the latest version of Shadcn to install new components, like this command to add a button component:

```bash
bunx shadcn@latest add button
```

Use lucide-react for icons

The website needs to use the themes settings from styles.css, if I change them there to be reflected everywhere.

## Demo Components to see how is Working

The demo code is under `src/routs/demo`
