# Agent Instructions for bitbuddies.me

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


## Demo Components to see how is Working

The demo code is under `src/routs/demo`
