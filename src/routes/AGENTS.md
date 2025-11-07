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


---
id: routing
title: Routing
---

TanStack Start is built on top of TanStack Router, so all of the features of TanStack Router are available to you.

> [!NOTE]
> We highly recommend reading the [TanStack Router documentation](/router/latest/docs/framework/react/overview) to learn more about the features and capabilities of TanStack Router. What you learn here is more of a high-level overview of TanStack Router and how it works in Start.

## The Router

The `router.tsx` file is the file that will dictate the behavior of TanStack Router used within Start. It's located in the `src` directory of your project.

```
src/
├── router.tsx
```

Here, you can configure everything from the default [preloading functionality](/router/latest/docs/framework/react/guide/preloading) to [caching staleness](/router/latest/docs/framework/react/guide/data-loading).

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// You must export a getRouter function that
// returns a new router instance each time
export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })

  return router
}
```

## File-Based Routing

Start uses TanStack Router's file-based routing approach to ensure proper code-splitting and advanced type-safety.

You can find your routes in the `src/routes` directory.

```
src/
├── routes <-- This is where you put your routes
│   ├── __root.tsx
│   ├── index.tsx
│   ├── about.tsx
│   ├── posts.tsx
│   ├── posts/$postId.tsx
```

## The Root Route

The root route is the top-most route in the entire tree and encapsulates all other routes as children. It's found in the `src/routes/__root.tsx` file and must be named `__root.tsx`.

```
src/
├── routes
│   ├── __root.tsx <-- The root route
```

- It has no path and is **always** matched
- Its `component` is **always** rendered
- This is where you render your document shell, e.g. `<html>`, `<body>`, etc.
- Because it is **always rendered**, it is the perfect place to construct your application shell and take care of any global logic

```tsx
// src/routes/__root.tsx
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

Notice the `Scripts` component at the bottom of the `<body>` tag. This is used to load all of the client-side JavaScript for the application and should always be included for proper functionality.

## The HeadContent Component

The `HeadContent` component is used to render the head, title, meta, link, and head-related script tags of the document.

It should be **rendered in the `<head>` tag of your root route's layout.**

## The Outlet Component

The `Outlet` component is used to render the next potentially matching child route. `<Outlet />` doesn't take any props and can be rendered anywhere within a route's component tree. If there is no matching child route, `<Outlet />` will render `null`.

## The Scripts Component

The `Scripts` component is used to render the body scripts of the document.

It should be **rendered in the `<body>` tag of your root route's layout.**

## Route Tree Generation

You may notice a `routeTree.gen.ts` file in your project.

```
src/
├── routeTree.gen.ts <-- The generated route tree file
```

This file is automatically generated when you run TanStack Start (via `npm run dev` or `npm run start`). This file contains the generated route tree and a handful of TS utilities that make TanStack Start's type-safety extremely fast and fully inferred.

**You may gitignore this file, since it is a build artifact.**

## Nested Routing

TanStack Router uses nested routing to match the URL with the correct component tree to render.

For example, given the following routes:

```
routes/
├── __root.tsx <-- Renders the <Root> component
├── posts.tsx <-- Renders the <Posts> component
├── posts.$postId.tsx <-- Renders the <Post> component
```

And the URL: `/posts/123`

The component tree would look like this:

```
<Root>
  <Posts>
    <Post />
  </Posts>
</Root>
```

## Types of Routes

There are a few different types of routes that you can create in your project.

- Index Routes - Matched when the URL is exactly the same as the route's path
- Dynamic/Wildcard/Splat Routes - Dynamically capture part or all of the URL path into a variable to use in your application

There are also a few different utility route types that you can use to group and organize your routes

- Pathless Layout Routes (Apply layout or logic to a group of routes without nesting them in a path)
- Non-Nested Routes (Un-nest a route from its parents and render its own component tree)
- Grouped Routes (Group routes together in a directory simply for organization, without affecting the path hierarchy)

## Route Tree Configuration

The route tree is configured in the `src/routes` directory.

## Creating File Routes

To create a route, create a new file that corresponds to the path of the route you want to create. For example:

| Path             | Filename            | Type           |
| ---------------- | ------------------- | -------------- |
| `/`              | `index.tsx`         | Index Route    |
| `/about`         | `about.tsx`         | Static Route   |
|                  | `posts.tsx`         | "Layout" Route |
| `/posts/`        | `posts/index.tsx`   | Index Route    |
| `/posts/:postId` | `posts/$postId.tsx` | Dynamic Route  |
| `/rest/*`        | `rest/$.tsx`        | Wildcard Route |

## Defining Routes

To define a route, use the `createFileRoute` function to export the route as the `Route` variable.

For example, to handle the `/posts/:postId` route, you would create a file named `posts/$postId.tsx` here:

```
src/
├── routes
│   ├── posts/$postId.tsx
```

Then, define the route like this:

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})
```

> [!NOTE]
> The path string passed to `createFileRoute` is **automatically written and managed by the router for you via the TanStack Router Bundler Plugin or Router CLI.** So, as you create new routes, move routes around or rename routes, the path will be updated for you automatically.

## This is just the "start"

This has been just a high-level overview of how to configure routes using TanStack Router. For more detailed information, please refer to the [TanStack Router documentation](/router/latest/docs/framework/react/routing/file-based-routing).
