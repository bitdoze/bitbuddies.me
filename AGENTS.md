# Agent Instructions for bitbuddies.me

You don't need to create any documentation with the implementation. I will tell you when to create the documentation. You only provide me a short summary with what was done.

Before implementing anything think that the structure and code is as simple as possible and secure.

## 📚 Directory-Specific Documentation

**When working in specific areas, ALWAYS read the AGENTS.md in that directory first:**

- **`convex/AGENTS.md`** - Backend functions, database schema, security, authorization, data patterns
- **`src/routes/AGENTS.md`** - Routing, navigation, data loading, SEO, authentication flow
- **`src/components/AGENTS.md`** - UI components, design patterns, accessibility, theming
- **`src/integrations/AGENTS.md`** - External services, auth providers (Clerk), analytics
- **`public/AGENTS.md`** - SEO configuration, favicons, static assets, PWA, production checklist

## 📖 Framework Documentation

**For detailed framework usage, consult the `docs/` folder:**

- `docs/convex.md` - Convex backend patterns and best practices
- `docs/tanstack-start-convex.md` - TanStack Router + Convex integration
- `docs/shadcn.md` - Component library usage and patterns
- `docs/tailwindcss.md` - Styling guidelines and theme system

## Commands

- **Dev**: `bun run dev` (runs on port 3000)
- **Build**: `bun run build`
- **Test**: `bun run test` (uses Vitest)
- **Lint/Format**: `bun run check` (runs Biome linter + formatter)
- **Convex backend**: `bun convex dev`

## Architecture Overview

- **Framework**: TanStack Start (React 19) with file-based routing in `src/routes/`
- **Backend**: Convex (schema in `convex/schema.ts`, functions in `convex/`)
- **Auth**: Clerk (requires `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`)
- **Styling**: Tailwind CSS v4 + shadcn components (add via `bunx shadcn@latest add <component>`)
- **State**: TanStack Router loaders (server-side prefetch) + React Query + TanStack Store
- **Structure**: `src/components/`, `src/hooks/`, `src/lib/`, `src/integrations/`

## Code Style (Biome)

- **Formatting**: Tabs for indentation, double quotes for strings
- **Imports**: Auto-organize imports; use path alias `@/*` for `src/*`
- **Types**: Strict TypeScript enabled; avoid `any`
- **Convex Schemas**: Use `v` validators from `convex/values`; system fields `_id` and `_creationTime` are auto-generated

## General Conventions

### File Paths
- Always use **absolute file paths** with file system tools (Read, edit_file, create_file)

### Code Quality
- Check existing patterns before adding new code (look at neighboring files)
- Never assume libraries are available - check package.json or existing imports first
- Follow security best practices - never expose or log secrets
- Do not suppress compiler/linter errors unless explicitly asked
- Only add code comments if user requests or code is highly complex

### Testing
- Never assume test framework - check AGENTS.md, README, or search codebase
- Run build/typecheck commands after completing tasks
- Address all errors related to your changes

### Background Processes
- NEVER use background processes with `&` operator in shell commands
- Background processes will not continue running

## Project Structure Reference

```
bitbuddies.me/
├── AGENTS.md                      # This file - general instructions + directory pointers
├── convex/
│   ├── AGENTS.md                  # Backend-specific instructions
│   ├── schema.ts                  # Database schema
│   └── *.ts                       # Convex functions (mutations, queries, actions)
├── src/
│   ├── routes/
│   │   ├── AGENTS.md              # Routing-specific instructions
│   │   └── *.tsx                  # Route components (use dot notation for nesting)
│   ├── components/
│   │   ├── AGENTS.md              # Component-specific instructions
│   │   ├── ui/                    # Shadcn components
│   │   ├── common/                # Shared components (SEO, theme, etc.)
│   │   └── layout/                # Layout components (Header, Footer, Sidebar)
│   ├── integrations/
│   │   ├── AGENTS.md              # Integration-specific instructions
│   │   ├── clerk/                 # Clerk auth integration
│   │   └── convex/                # Convex client integration
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility functions
│   │   ├── config.ts              # Centralized site configuration
│   │   └── utils.ts               # General helpers
│   └── styles.css                 # Global Tailwind theme
├── public/
│   ├── AGENTS.md                  # SEO/static assets instructions
│   ├── favicon.*                  # Favicon files
│   ├── robots.txt                 # Search engine directives
│   ├── sitemap.xml                # Site map
│   └── site.webmanifest           # PWA manifest
└── docs/                          # Framework documentation
    ├── convex.md
    ├── tanstack-start-convex.md
    ├── shadcn.md
    └── tailwindcss.md
```

## Quick Reference

### Adding New Features
1. Check relevant `AGENTS.md` file in the directory you're working in
2. Review existing patterns in similar files
3. Consult `docs/` for framework-specific guidance
4. Implement following established conventions
5. Run `bun run check` and `bun run build` to verify

### When In Doubt
- **Backend/Database**: See `convex/AGENTS.md`
- **Routes/Pages**: See `src/routes/AGENTS.md`
- **UI/Components**: See `src/components/AGENTS.md`
- **Auth/Services**: See `src/integrations/AGENTS.md`
- **SEO/Assets**: See `public/AGENTS.md`
- **Framework Details**: See `docs/` folder
