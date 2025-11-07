# Integrations Agent Instructions

This guide covers external service integrations including authentication, analytics, and third-party APIs.

## Clerk Authentication

### Setup
- Requires `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`
- Provider wrapper in `clerk/provider.tsx`
- User menu component in `clerk/header-user.tsx`

### User Flow
1. User signs in via Clerk
2. `UserSyncProvider` (in `__root.tsx`) automatically syncs to Convex
3. Creates record in `users` table with Clerk ID (default role: `user`)
4. Creates associated `profiles` record
5. `useAuth()` hook provides both Clerk user and Convex user

### Hooks
- `useAuth()` returns `isAdmin` boolean (true if user role is "admin")
- `useRequireAdmin()` throws error if not admin (for route guards)

### Frontend Protection
Admin routes (`/admin/*`) check `isAdmin` from `useAuth()` hook

## Convex Integration

### Setup
- Provider wrapper in `convex/provider.tsx`
- Requires `VITE_CONVEX_URL` in `.env.local`

### Data Fetching Pattern
- **Server-side prefetch** via loaders using ConvexHttpClient
- **Client-side reactivity** via useQuery
- Fallback to client query when loader data unavailable

## Analytics Setup (IMPLEMENTED)

### Plausible Analytics
- **Privacy-friendly, GDPR-compliant analytics**
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

### Benefits
- No cookies, no tracking, privacy-first
- Lightweight script (< 1KB)
- GDPR, CCPA, PECR compliant
- No consent banner needed
- Real-time analytics dashboard

## Production URL Configuration (IMPLEMENTED)

### Site URL
`https://bitbuddies.me` configured throughout the application

### Environment Variables
See `.env.example`:

```bash
VITE_SITE_URL=https://bitbuddies.me
VITE_SITE_NAME=BitBuddies
VITE_SITE_DESCRIPTION=Empowering developers to build amazing things together
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_ENABLE_DEBUG_ROUTES=true  # false in production
NODE_ENV=development  # production in prod
```

### Centralized Configuration
In `src/lib/config.ts`:
- `SITE_CONFIG` - Site metadata (name, description, URL, email)
- `SOCIAL_LINKS` - Social media URLs
- `ROUTES` - Route path constants
- `SEO_DEFAULTS` - Default SEO values
- Helper functions: `buildUrl()`, `getCanonicalUrl()`

### Configuration Locations
- `site.webmanifest` - start_url and scope set to production URL
- `robots.txt` - Sitemap URL pointing to production
- `sitemap.xml` - All URLs use production domain
- `SEO.tsx` - Uses config for canonical URLs and OG images
- `__root.tsx` - Analytics script with correct domain

### Clerk Configuration
Add `https://bitbuddies.me` to:
- Allowed redirect URLs
- Allowed origins (CORS)
- OAuth redirect URIs

### Convex Configuration
Add production URL to allowed origins if needed

## Third-Party Service Patterns

### Adding New Integrations
1. Create provider wrapper in `integrations/<service>/provider.tsx`
2. Add environment variables to `.env.example`
3. Document setup in this file
4. Add to root layout if needed globally
5. Create hooks in `src/hooks/` for service interaction

### Environment Variables
- Always add new env vars to `.env.example`
- Document purpose and example values
- Never commit actual values to repository
- Use `import.meta.env.VITE_*` for client-side access

## Security

### Never Trust Client Input
- Validate all data before sending to external services
- Sanitize user content before API calls
- Check rate limits and implement backoff strategies

### API Keys
- Never expose API keys in client code
- Use server-side proxies for sensitive operations
- Rotate keys regularly
- Monitor usage for anomalies
