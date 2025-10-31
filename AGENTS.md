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
│   ├── workshops.ts               # CRUD + queries for workshop content (IMPLEMENTED)
│   ├── workshopAttachments.ts     # Workshop attachments management (IMPLEMENTED)
│   ├── posts.ts                   # CRUD + queries for micro-posts
│   ├── users.ts                   # User management + Clerk sync (IMPLEMENTED)
│   ├── enrollments.ts             # Enrollment lookups and mutations
│   ├── subscriptions.ts           # Subscription management
│   ├── todos.ts                   # Demo table for testing
│   └── utils.ts                   # Utility functions (slug validation, etc.)
└── src/                           # TanStack Start application source
    ├── styles.css                 # Global Tailwind theme tokens + base styles
    ├── main.tsx                   # Client entry; mounts router/app
    ├── app.config.ts              # TanStack Start configuration (router, themes, metadata)
    ├── components/                # Reusable UI building blocks
    │   ├── ui/                    # Generated shadcn components (Button, Dialog, Card, Form, etc.)
    │   ├── common/                # Cross-domain pieces (IMPLEMENTED)
    │   │   ├── theme-provider.tsx # Theme provider for dark/light mode (IMPLEMENTED)
    │   │   ├── UserSyncProvider.tsx # Auto-sync Clerk users to Convex (IMPLEMENTED)
    │   │   └── UserSyncDebug.tsx  # Debug component for user sync (IMPLEMENTED)
    │   ├── layout/                # Global layout primitives (IMPLEMENTED)
    │   │   ├── Header.tsx         # Top navigation bar with auth (IMPLEMENTED)
    │   │   ├── Footer.tsx         # Site footer (IMPLEMENTED)
    │   │   └── Sidebar.tsx        # App sidebar navigation (IMPLEMENTED)
    │   └── demo.FormComponents.tsx # Demo form components for testing
    ├── routes/                    # File-based TanStack Start routes (use dot notation: admin.workshops.tsx)
    │   ├── __root.tsx             # Root layout with providers (IMPLEMENTED)
    │   ├── index.tsx              # Landing page route (IMPLEMENTED)
    │   ├── workshops.$slug.tsx    # `/workshops/:slug` - View workshop (IMPLEMENTED, auth required)
    │   ├── workshops.index.tsx    # `/workshops` - List workshops (IMPLEMENTED, auth required)
    │   ├── admin.workshops.tsx    # `/admin/workshops` - Layout with <Outlet /> (IMPLEMENTED)
    │   ├── admin.workshops.index.tsx # `/admin/workshops/` - List/manage workshops (IMPLEMENTED)
    │   ├── admin.workshops.create.tsx # `/admin/workshops/create` - Create workshop (IMPLEMENTED)
    │   ├── admin.workshops.$id.edit.tsx # `/admin/workshops/:id/edit` - Edit workshop (IMPLEMENTED)
    │   ├── debug.user-sync.tsx    # `/debug/user-sync` - Debug user sync (IMPLEMENTED)
    │   └── debug.workshops-video.tsx # `/debug/workshops-video` - Debug/fix video embeds (IMPLEMENTED)
    ├── hooks/                     # Domain-specific React hooks
    │   ├── useAuth.ts             # Clerk auth + Convex user integration (IMPLEMENTED)
    │   ├── useWorkshops.ts        # Workshop + attachment queries/mutations (IMPLEMENTED)
    │   ├── use-mobile.ts          # Mobile detection hook (IMPLEMENTED)
    │   └── demo.form*.ts          # Demo form hooks for testing
    ├── integrations/              # External service initializers
    │   ├── clerk/                 # Clerk authentication (IMPLEMENTED)
    │   │   ├── provider.tsx       # ClerkProvider wrapper (IMPLEMENTED)
    │   │   └── header-user.tsx    # User menu component (IMPLEMENTED)
    │   └── convex/                # Convex backend integration (IMPLEMENTED)
    │       └── provider.tsx       # ConvexProvider wrapper (IMPLEMENTED)
    └── lib/                       # Typed utility functions
        └── utils.ts               # General-purpose helpers (cn, etc.) (IMPLEMENTED)

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

## Important Notes

### File-Based Routing (TanStack Start)
- Use **dot notation** for nested routes: `admin.workshops.tsx` creates `/admin/workshops`
- Use **dollar sign** for dynamic params: `workshops.$slug.tsx` creates `/workshops/:slug`
- Use **underscore** to prevent nesting: `admin.workshops_.create.tsx` prevents it from being a child
- Parent routes with children need `<Outlet />` component
- Routes auto-generate types in `src/routeTree.gen.ts`

### User Authentication Flow
1. User signs in via Clerk
2. `UserSyncProvider` (in `__root.tsx`) automatically syncs to Convex
3. Creates record in `users` table with Clerk ID (default role: `user`)
4. Creates associated `profiles` record
5. `useAuth()` hook provides both Clerk user and Convex user

### Admin Access Control (IMPLEMENTED)
- **Backend Authorization**: All admin mutations (create/update/delete workshops) require `role=admin` in Convex users table
- **Frontend Protection**: Admin routes (`/admin/*`) check `isAdmin` from `useAuth()` hook
- **Setup**: Use `/debug/admin-setup` to grant admin privileges to users
  - Click "Make Me Admin" to promote yourself
  - View all users and manage their roles
  - **WARNING**: Remove or protect this route in production!
- **Hooks**:
  - `useAuth()` returns `isAdmin` boolean (true if user role is "admin")
  - `useRequireAdmin()` throws error if not admin (for route guards)
- **Backend Functions**:
  - `users.setUserRole()` - Set user role by Clerk ID
  - All workshop mutations require `clerkId` parameter for authorization
  - `requireAdmin()` helper validates admin role before mutations

### Workshop Features (IMPLEMENTED)
- ✅ Create/Edit/Delete workshops (admin only)
- ✅ List and view workshops (authenticated users only)
- ✅ Cover image upload with Convex storage (IMPLEMENTED)
- ✅ Image library for selecting previously uploaded images (IMPLEMENTED)
- ✅ YouTube video embedding (auto-converts URLs to embed format)
- ✅ Workshop attachments support
- ✅ Rich content with HTML support
- ✅ Live workshop scheduling with participant limits
- ✅ Access level controls (public/authenticated/subscription)

### Image Upload & Library (IMPLEMENTED)
- **Storage**: Uses Convex storage (no external CDN needed)
- **Three-step upload process**:
  1. Generate upload URL via `mediaAssets.generateUploadUrl()`
  2. POST file to upload URL → receives storage ID
  3. Create `mediaAssets` record with storage ID
- **ImageUpload component** with preview and library access:
  - Upload new images with preview before saving
  - Browse and select from previously uploaded images
  - "Choose from Library" button opens image library dialog
  - 16:9 aspect ratio maintained for all images
  - Clear visual buttons: "Upload New" and "Choose from Library"
- **ImageLibrary component** features:
  - Grid view of all uploaded images (100 most recent)
  - 16:9 aspect ratio thumbnails
  - Hover to see file size and upload date
  - Click to select, visual selection indicator
  - Reusable across the application
- **Image display** (all maintain 16:9 aspect ratio):
  - Workshop cards (public list) - full-width hero with padding-bottom: 56.25%
  - Admin table - 64x64 thumbnails
  - Workshop detail page - full-width hero
  - Upload preview - max-w-2xl with 16:9 ratio
- **File validation**: max 10MB, images only
- **Recommended dimensions**: 1200×675 pixels (16:9 ratio)
- **Automatic URL generation** from storage ID

### Video Embedding Best Practices
- Paste YouTube URL in Video URL field: `https://www.youtube.com/watch?v=VIDEO_ID`
- OR use Video ID field with just the ID: `VIDEO_ID` (select YouTube provider)
- System auto-converts to embed format: `https://www.youtube.com/embed/VIDEO_ID`
- **Don't paste iframe HTML** - use `/debug/workshops-video` to fix if needed

### Debug Tools
- `/debug/user-sync` - Inspect and manually sync Clerk users to Convex
- `/debug/workshops-video` - Fix video embed issues, extract IDs from iframe HTML
- `/debug/admin-setup` - Grant admin privileges to users (⚠️ remove in production!)

### Image Library System
The image library provides a centralized way to manage and reuse uploaded images:

**Components**:
- `ImageUpload` - Upload UI with library access button
- `ImageLibrary` - Modal dialog for browsing/selecting images

**Usage**:
```typescript
<ImageUpload
  value={coverAssetId}
  imageUrl={coverAsset?.url}
  onChange={setCoverAssetId}
  label="Cover Image"
/>
```

**Benefits**:
- Reuse images across multiple workshops
- No need to re-upload the same image
- Central storage management
- Browse all previously uploaded images
- Reduces storage usage

**Database**:
- `mediaAssets` table stores all uploaded files
- `workshops.coverAssetId` references the asset
- Automatic cleanup when asset is deleted
