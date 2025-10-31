# Agent Instructions for bitbuddies.me

You don't need to create any documentation with the implementation. I will tell you when to create the documentation. You only provide me a short summary with what was done.
Before implementing anything think that the structure and code is as simple as possible and secure.

## Architecture Review (Implemented - December 2024)

### ✅ Security Improvements (COMPLETED)
1. **Protected Convex Mutations** - All admin mutations now require `clerkId` and verify `role=admin`
   - `workshopAttachments.ts` - create/update/remove require admin
   - `mediaAssets.ts` - create/update/remove require admin
   - `users.setUserRole` - requires caller to be admin
2. **Eliminated N+1 Queries** - Workshop queries return enriched data with `coverAsset` included
3. **SPA Navigation** - Replaced all internal `<a href>` with `<Link to>` in Header, Sidebar, Footer, and routes
4. **Server-Side Data Prefetching** - Implemented TanStack Router loaders for workshops pages

### 🔄 Future Improvements (TODO)
1. **Testing** - Establish baseline Vitest suite for mutations and utilities
2. **Shared Utilities** - Extract repeated date/status helpers into shared modules
3. **Error Handling** - Replace `alert()` with toast notifications and add error boundaries
4. **Build Optimization** - Lazy-load dev tools in production builds
5. **Environment Protection** - Gate debug routes behind environment variable checks
6. **Type Safety** - Replace remaining `any` types with proper TypeScript types
7. **Accessibility** - Add keyboard event handlers to interactive div elements
8. **Structured Logging** - Implement observability around Convex failures

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
- **State**: TanStack Router loaders (server-side prefetch) + React Query + TanStack Store
- **Data Fetching**: Server-side prefetch via loaders using ConvexHttpClient, client-side reactivity via useQuery
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

### Production URL Configuration (IMPLEMENTED)
- **Site URL**: `https://bitbuddies.me` configured throughout the application
- **Environment Variables** (`.env.example`):
  ```bash
  VITE_SITE_URL=https://bitbuddies.me
  VITE_SITE_NAME=BitBuddies
  VITE_SITE_DESCRIPTION=Empowering developers to build amazing things together
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
  VITE_CONVEX_URL=https://your-project.convex.cloud
  VITE_ENABLE_DEBUG_ROUTES=true  # false in production
  NODE_ENV=development  # production in prod
  ```
- **Centralized Configuration** (`src/lib/config.ts`):
  - `SITE_CONFIG` - Site metadata (name, description, URL, email)
  - `SOCIAL_LINKS` - Social media URLs
  - `ROUTES` - Route path constants
  - `SEO_DEFAULTS` - Default SEO values
  - Helper functions: `buildUrl()`, `getCanonicalUrl()`
- **Configured in**:
  - `site.webmanifest` - start_url and scope set to production URL
  - `robots.txt` - Sitemap URL pointing to production
  - `sitemap.xml` - All URLs use production domain
  - `SEO.tsx` - Uses config for canonical URLs and OG images
  - `__root.tsx` - Analytics script with correct domain
- **Clerk Configuration**: Add `https://bitbuddies.me` to:
  - Allowed redirect URLs
  - Allowed origins (CORS)
  - OAuth redirect URIs
- **Convex Configuration**: Add production URL to allowed origins if needed

### Analytics Setup (IMPLEMENTED)
- **Plausible Analytics** - Privacy-friendly, GDPR-compliant analytics
- **Implementation** in `__root.tsx`:
  ```typescript
  scripts: [
    {
      src: "https://an.bitdoze.com/js/script.js",
      defer: true,
      "data-domain": "bitbuddies.me",
    },
  ]
  ```
- **Benefits**:
  - No cookies, no tracking, privacy-first
  - Lightweight script (< 1KB)
  - GDPR, CCPA, PECR compliant
  - No consent banner needed
  - Real-time analytics dashboard

### Favicon Setup (IMPLEMENTED)
- **Comprehensive favicon implementation** for all devices and platforms
- **Files included**:
  - `favicon.ico` - Classic 32x32 ICO format for older browsers
  - `favicon.svg` - Modern SVG format with theme support
  - `favicon-16x16.png` - Small PNG for browser tabs
  - `favicon-32x32.png` - Standard PNG for browser tabs
  - `apple-touch-icon.png` - 180x180 for iOS home screen
  - `android-chrome-192x192.png` - Android home screen
  - `android-chrome-512x512.png` - Android high-res
  - `site.webmanifest` - PWA manifest with app metadata
  - `browserconfig.xml` - Windows tile configuration
- **Implementation** in `__root.tsx`:
  ```typescript
  links: [
    { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/site.webmanifest" },
  ]
  ```
- **Theme colors**: `#6366f1` (indigo) matching the brand gradient
- **PWA support**: site.webmanifest enables "Add to Home Screen" on mobile
- **Benefits**:
  - Professional appearance across all platforms
  - iOS home screen icon support
  - Android adaptive icon support
  - Windows tile support
  - PWA installation capability
  - Modern SVG with theme adaptation

### Analytics (IMPLEMENTED)
- **Privacy-Friendly Analytics**: Plausible Analytics via self-hosted instance
- **Implementation**: Script added to `__root.tsx` head
  ```ck Router Loaders (IMPLEMENTED)
- **Server-Side Data Prefetching**: Routes prefetch data on the server for faster initial load
- **Pattern**: Use ConvexHttpClient in loader, fallback to useQuery on client
- **Implementation**:
  ```typescript
  export const Route = createFileRoute("/workshops/")({
    component: WorkshopsPage,
    loader: async () => {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      const client = new ConvexHttpClient(convexUrl);
      const workshops = await client.query(api.workshops.list, {
        publishedOnly: true,
      });
      return { workshops };
    },
  });

  function WorkshopsPage() {
    const loaderData = Route.useLoaderData();
    const clientWorkshops = useWorkshops({ publishedOnly: true });
    const workshops = loaderData?.workshops ?? clientWorkshops;
    // ...
  }
  ```
- **Benefits**:
  - No loading spinners on initial page load
  - Better SEO with server-rendered data
  - Faster perceived performance
  - Hydration with data already available
- **Implemented on**:
  - `/workshops` - List workshops with prefetch
  - `/workshops/:slug` - Workshop detail with prefetch
  - `/admin/workshops` - Admin workshop list with prefetch

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
  - `users.setUserRole()` - Set user role by Clerk ID (requires caller to be admin)
  - All workshop mutations require `clerkId` parameter for authorization
  - All workshopAttachments mutations require `clerkId` and admin verification
  - All mediaAssets mutations require `clerkId` and admin verification
  - `requireAdmin()` helper validates admin role before mutations (used across all protected mutations)

### Workshop Features (IMPLEMENTED)
- ✅ Create/Edit/Delete workshops (admin only)
- ✅ **Public workshop list** - visible to all visitors without authentication
- ✅ **Workshop detail pages** - require authentication to view content
- ✅ Visual indicators on cards for non-authenticated users ("Login Required" badge)
- ✅ Preview mode for unauthenticated users showing workshop info and CTA
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
- **Authorization**: All upload/modify/delete operations require admin role

### Data Loading Optimization (IMPLEMENTED)
- **Enriched Queries**: Workshop queries return complete data including cover assets
- **Eliminated N+1**: Single query returns workshop + coverAsset (no separate lookups)
- **Pattern**: Backend joins asset data, frontend receives enriched objects
- **Performance**: 10 workshops = 1 query (was 11 queries before)
- **Implementation**:
  ```typescript
  // In convex/workshops.ts
  const enriched = await Promise.all(
    workshops.map(async (workshop) => {
      let coverAsset = null;
      if (workshop.coverAssetId) {
        coverAsset = await ctx.db.get(workshop.coverAssetId);
      }
      return { ...workshop, coverAsset };
    }),
  );
  ```

### Navigation Best Practices (IMPLEMENTED)
- **Use `<Link>` for internal routes**: All SPA navigation uses TanStack Router `<Link>` component
- **Use `<a>` for external links**: Social media, external resources use standard anchors
- **Proper route patterns**: Dynamic routes use params object `<Link to="/workshops/$slug" params={{ slug }}>`
- **Active states**: Use `activeProps` for highlighting current page
- **Implementation**: Header, Sidebar, Footer, and all route components use proper navigation

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

### SEO & Meta Tags (IMPLEMENTED)
- **SEO component** with comprehensive meta tag support
- **Open Graph** tags for social media sharing
- **Twitter Card** support for enhanced Twitter previews
- **JSON-LD structured data** for rich search results
- **Canonical URLs** to prevent duplicate content
- **Dynamic SEO** based on workshop content

**Features**:
- Page-specific titles and descriptions
- Keywords for better search engine indexing
- Open Graph images (uses workshop cover images)
- Structured data for courses/workshops (Schema.org)
- Breadcrumb navigation for search engines
- noIndex flag for admin/debug pages
- Author and publication date metadata

**Components**:
- `SEO` - Main SEO component with props for all meta tags
- `StructuredData` - Helper for JSON-LD structured data
- `generateStructuredData()` - Function to generate schema.org data
- `SEO_CONFIGS` - Predefined configs for common pages

**Usage**:
```tsx
<SEO
  title="Workshop Title"
  description="Workshop description"
  keywords="react, typescript, workshop"
  canonicalUrl="/workshops/my-workshop"
  ogImage={coverAsset?.url}
  ogType="article"
/>
```

**Implemented on pages**:
- `/` - Home page with WebSite and Organization schema
- `/workshops` - Workshops list with BreadcrumbList schema
- `/workshops/:slug` - Dynamic workshop pages with Course schema
- `/admin/*` - Admin pages with noIndex flag
- `/debug/*` - Debug pages with noIndex flag

**Benefits**:
- Better search engine rankings
- Rich previews on social media
- Improved click-through rates
- Professional appearance in search results
- Proper indexing by search engines
- Enhanced discoverability

### Public Access & Authentication Flow (IMPLEMENTED)
- **Workshop List** (`/workshops`) - Publicly accessible
  - All visitors can browse workshops
  - Shows "Login Required" badge for non-authenticated users
  - Preview images, titles, descriptions, and tags
  - "Sign In to View" button on cards for non-authenticated users
  - "View Workshop" button for authenticated users

- **Workshop Detail Pages** (`/workshops/:slug`) - Authentication required
  - Non-authenticated users see:
    - Full workshop header with cover image
    - Workshop title, description, and metadata
    - Preview of content (limited)
    - Call-to-action card explaining benefits of signing in
    - List of features they'll get with an account
    - "Sign In to Continue" button
  - Authenticated users see:
    - Full workshop content and video
    - Downloadable attachments
    - Enrollment options
    - Complete materials

**Benefits**:
- Increased visibility and discoverability
- Better conversion funnel for visitors
- SEO-friendly public pages
- Clear value proposition before sign-in
- Professional user experience

## Security Best Practices

### Always Verify Authorization
- **Pattern**: Every mutation that modifies data must verify the caller's identity and role
- **Implementation**: Pass `clerkId` as parameter, call `requireAdmin(ctx, clerkId)` at start of handler
- **Example**:
  ```typescript
  export const create = mutation({
    args: {
      clerkId: v.string(),
      // ... other args
    },
    handler: async (ctx, args) => {
      await requireAdmin(ctx, args.clerkId);
      // ... proceed with mutation
    },
  });
  ```

### Never Trust Client Input
- **Validate all data**: Use Convex validators (`v.*`) for all mutation arguments
- **Sanitize user content**: HTML content should be sanitized before storage/display
- **Check relationships**: Verify user owns resource before allowing modifications

### Protect Debug Routes
- **Production**: Remove or gate debug routes behind environment checks
- **Example routes to protect**: `/debug/*`, `/admin-setup`
- **Pattern**: Check `import.meta.env.MODE === "development"` in loader

## Performance Best Practices

### Server-Side Data Prefetching
- **Always use loaders**: Prefetch data on server for initial page loads
- **Pattern**: ConvexHttpClient in loader, useQuery for reactivity
- **Fallback**: Always provide client-side fallback for when loader fails

### Avoid N+1 Queries
- **Join data in backend**: Return enriched objects from Convex queries
- **Don't**: Call useQuery in map/loops for related data
- **Do**: Fetch related data in backend, return as single enriched response

### Use Proper Indexes
- **Index foreign keys**: All fields used in `.withIndex()` should have indexes
- **Index filters**: Fields used in `.filter()` benefit from indexes
- **Check schema**: Convex schema.ts defines all indexes

## Code Quality Guidelines

### TypeScript
- **Avoid `any`**: Use proper types or `unknown` with type guards
- **Type Convex responses**: Use generated types from `convex/_generated/dataModel`
- **Strict mode**: Keep TypeScript strict mode enabled

### React Patterns
- **Avoid premature optimization**: Profile before optimizing
- **Use proper hooks**: Follow React hooks rules (dependencies, etc.)
- **Error boundaries**: Wrap route components in error boundaries

### Accessibility
- **Interactive elements**: Use button/anchor, not div with onClick
- **Keyboard navigation**: Add onKeyDown handlers where onClick exists
- **ARIA labels**: Provide labels for screen readers
- **Alt text**: Describe images without redundant words (avoid "image of")

## SEO & Production Checklist

### Before Deployment
- [ ] Set `VITE_SITE_URL=https://bitbuddies.me` in production env
- [ ] Set `NODE_ENV=production`
- [ ] Set `VITE_ENABLE_DEBUG_ROUTES=false`
- [ ] Update Clerk with production URL in allowed origins
- [ ] Update Convex with production URL if needed
- [ ] Verify analytics script domain matches `data-domain="bitbuddies.me"`
- [ ] Test all social sharing (OG tags, Twitter cards)
- [ ] Verify canonical URLs point to production
- [ ] Submit sitemap to Google Search Console: `https://bitbuddies.me/sitemap.xml`
- [ ] Verify robots.txt is accessible: `https://bitbuddies.me/robots.txt`
- [ ] Test PWA "Add to Home Screen" on mobile devices
- [ ] Verify all favicons load correctly
- [ ] Test all meta tags with social media preview tools
- [ ] Ensure SSL certificate is valid and HTTPS redirects work

### SEO Configuration Files
- `public/sitemap.xml` - Search engine sitemap (update lastmod dates when content changes)
- `public/robots.txt` - Search engine directives (admin/debug routes disallowed)
- `src/lib/config.ts` - Centralized site configuration
- `src/components/common/SEO.tsx` - SEO component using config
- `.env.example` - Template for required environment variables
