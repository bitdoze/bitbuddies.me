# Routes Agent Instructions

This guide covers routing, navigation, data loading, and SEO for TanStack Start routes.

## File-Based Routing (TanStack Start)

- Use **dot notation** for nested routes: `admin.workshops.tsx` creates `/admin/workshops`
- Use **dollar sign** for dynamic params: `workshops.$slug.tsx` creates `/workshops/:slug`
- Use **underscore** to prevent nesting: `admin.workshops_.create.tsx` prevents it from being a child
- Parent routes with children need `<Outlet />` component
- Routes auto-generate types in `src/routeTree.gen.ts`

## Server-Side Data Prefetching (IMPLEMENTED)

**Always use loaders**: Prefetch data on server for initial page loads

**Pattern**: ConvexHttpClient in loader, useQuery for reactivity

**Fallback**: Always provide client-side fallback for when loader fails

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

**Benefits**:
- No loading spinners on initial page load
- Better SEO with server-rendered data
- Faster perceived performance
- Hydration with data already available

**Implemented on**:
- `/workshops` - List workshops with prefetch
- `/workshops/:slug` - Workshop detail with prefetch
- `/admin/workshops` - Admin workshop list with prefetch

## Navigation Best Practices (IMPLEMENTED)

- **Use `<Link>` for internal routes**: All SPA navigation uses TanStack Router `<Link>` component
- **Use `<a>` for external links**: Social media, external resources use standard anchors
- **Proper route patterns**: Dynamic routes use params object `<Link to="/workshops/$slug" params={{ slug }}>`
- **Active states**: Use `activeProps` for highlighting current page
- **Implementation**: Header, Sidebar, Footer, and all route components use proper navigation

## Public Access & Authentication Flow (IMPLEMENTED)

### Workshop List (`/workshops`) - Publicly accessible
- All visitors can browse workshops
- Shows "Login Required" badge for non-authenticated users
- Preview images, titles, descriptions, and tags
- "Sign In to View" button on cards for non-authenticated users
- "View Workshop" button for authenticated users

### Workshop Detail Pages (`/workshops/:slug`) - Authentication required
**Non-authenticated users see**:
- Full workshop header with cover image
- Workshop title, description, and metadata
- Preview of content (limited)
- Call-to-action card explaining benefits of signing in
- List of features they'll get with an account
- "Sign In to Continue" button

**Authenticated users see**:
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

## SEO & Meta Tags (IMPLEMENTED)

### SEO Component
- **SEO component** with comprehensive meta tag support
- **Open Graph** tags for social media sharing
- **Twitter Card** support for enhanced Twitter previews
- **JSON-LD structured data** for rich search results
- **Canonical URLs** to prevent duplicate content
- **Dynamic SEO** based on workshop content

### Features
- Page-specific titles and descriptions
- Keywords for better search engine indexing
- Open Graph images (uses workshop cover images)
- Structured data for courses/workshops (Schema.org)
- Breadcrumb navigation for search engines
- noIndex flag for admin/debug pages
- Author and publication date metadata

### Components
- `SEO` - Main SEO component with props for all meta tags
- `StructuredData` - Helper for JSON-LD structured data
- `generateStructuredData()` - Function to generate schema.org data
- `SEO_CONFIGS` - Predefined configs for common pages

### Usage
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

### Implemented on pages
- `/` - Home page with WebSite and Organization schema
- `/workshops` - Workshops list with BreadcrumbList schema
- `/workshops/:slug` - Dynamic workshop pages with Course schema
- `/admin/*` - Admin pages with noIndex flag
- `/debug/*` - Debug pages with noIndex flag

### Benefits
- Better search engine rankings
- Rich previews on social media
- Improved click-through rates
- Professional appearance in search results
- Proper indexing by search engines
- Enhanced discoverability

## Debug Tools

- `/debug/user-sync` - Inspect and manually sync Clerk users to Convex
- `/debug/workshops-video` - Fix video embed issues, extract IDs from iframe HTML
- `/debug/admin-setup` - Grant admin privileges to users (⚠️ remove in production!)

### Protect Debug Routes
- **Production**: Remove or gate debug routes behind environment checks
- **Example routes to protect**: `/debug/*`, `/admin-setup`
- **Pattern**: Check `import.meta.env.MODE === "development"` in loader

## Video Embedding Best Practices

- Paste YouTube URL in Video URL field: `https://www.youtube.com/watch?v=VIDEO_ID`
- OR use Video ID field with just the ID: `VIDEO_ID` (select YouTube provider)
- System auto-converts to embed format: `https://www.youtube.com/embed/VIDEO_ID`
- **Don't paste iframe HTML** - use `/debug/workshops-video` to fix if needed

## Documentation

For detailed routing patterns, see `docs/tanstack-start-convex.md`
