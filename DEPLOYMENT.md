# Deployment Guide for bitbuddies.me

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Required Environment Variables
Create a `.env.production` or configure these in your hosting platform:

```bash
# Site Configuration
VITE_SITE_URL=https://bitbuddies.me
VITE_SITE_NAME=BitBuddies
VITE_SITE_DESCRIPTION=Empowering developers to build amazing things together

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...  # Use LIVE key, not test key

# Convex Backend
VITE_CONVEX_URL=https://your-production-project.convex.cloud

# Environment
NODE_ENV=production

# Feature Flags
VITE_ENABLE_DEBUG_ROUTES=false  # IMPORTANT: Disable debug routes in production
```

### 2. Third-Party Service Configuration

#### Clerk Setup (Authentication)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your production application
3. Add production URLs to **Allowed Redirect URLs**:
   - `https://bitbuddies.me`
   - `https://bitbuddies.me/*`
4. Add production URL to **Allowed Origins (CORS)**:
   - `https://bitbuddies.me`
5. Update **OAuth Redirect URIs** if using social login
6. Copy **Live Publishable Key** to `VITE_CLERK_PUBLISHABLE_KEY`

#### Convex Setup (Backend)
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Create production deployment or use existing
3. Navigate to **Settings** → **Environment Variables**
4. Add allowed origins if CORS is configured:
   - `https://bitbuddies.me`
5. Copy production deployment URL to `VITE_CONVEX_URL`
6. Run migrations if needed: `bunx convex deploy --prod`

#### Plausible Analytics (Already Configured)
- Analytics script is configured in `__root.tsx`
- Domain: `bitbuddies.me`
- Script source: `https://an.bitdoze.com/js/script.js`
- No additional configuration needed

### 3. Build & Test

#### Local Production Build Test
```bash
# Install dependencies
bun install

# Run production build
bun run build

# Preview production build locally (optional)
# Add preview script to package.json if needed
bun run preview
```

#### Verify Build Output
- Check `dist/` folder is created
- Verify all routes are built
- Check bundle size warnings (should be < 500KB per chunk)

### 4. SEO & Meta Configuration

#### Verify Meta Tags
- [ ] All pages have unique titles
- [ ] Meta descriptions are present and descriptive
- [ ] Open Graph images are configured
- [ ] Twitter Card tags are present
- [ ] Canonical URLs point to production domain

#### Sitemap & Robots.txt
- [ ] `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] `robots.txt` is accessible at `/robots.txt`
- [ ] Sitemap URL is correct: `https://bitbuddies.me/sitemap.xml`
- [ ] Admin and debug routes are disallowed in robots.txt

#### Update Sitemap Dates
Edit `public/sitemap.xml` and update `<lastmod>` dates to current date:
```xml
<lastmod>2024-12-01</lastmod>  <!-- Update this -->
```

### 5. Security Checklist

- [ ] Debug routes are disabled (`VITE_ENABLE_DEBUG_ROUTES=false`)
- [ ] `/debug/admin-setup` is not accessible in production
- [ ] All API mutations require authentication and authorization
- [ ] No secrets or API keys in client-side code
- [ ] HTTPS is enforced (configure at hosting level)
- [ ] Security headers are configured (CSP, HSTS, etc.)

### 6. Performance Optimization

- [ ] Images are optimized (1200×675px for workshop covers)
- [ ] Large bundles are code-split
- [ ] TanStack Router loaders are configured for SSR
- [ ] No console.log statements in production code
- [ ] Service worker/PWA is configured (via site.webmanifest)

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   bun add -g vercel

   # Login and deploy
   vercel login
   vercel
   ```

2. **Configure Build Settings**
   - Build Command: `bun run build`
   - Output Directory: `dist`
   - Install Command: `bun install`
   - Node Version: 18.x or higher

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Make sure to set them for "Production" environment

4. **Configure Domain**
   - Go to Project Settings → Domains
   - Add `bitbuddies.me`
   - Configure DNS records as instructed

5. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect to Git repository

2. **Configure Build Settings**
   - Build command: `bun run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (if using)

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all variables from `.env.production`

4. **Configure Domain**
   - Go to Domain settings
   - Add custom domain: `bitbuddies.me`
   - Configure DNS records

5. **Deploy**
   - Push to main branch or click "Deploy site"

### Option 3: Custom Server (Node.js)

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Set up server**
   ```bash
   # Install production dependencies
   bun install --production

   # Set environment variables
   export NODE_ENV=production
   export VITE_SITE_URL=https://bitbuddies.me
   # ... other env vars

   # Start server (configure based on hosting)
   node dist/server.js
   ```

3. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name bitbuddies.me www.bitbuddies.me;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name bitbuddies.me www.bitbuddies.me;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment Verification

### 1. Functional Testing
- [ ] Homepage loads correctly
- [ ] Workshop list displays
- [ ] Individual workshop pages work
- [ ] User authentication works (sign in/sign out)
- [ ] Admin dashboard is accessible (for admins only)
- [ ] Debug routes are NOT accessible
- [ ] Workshop creation/editing works (admin only)
- [ ] Image uploads work
- [ ] Video embeds display correctly

### 2. SEO Testing
- [ ] Submit sitemap to Google Search Console:
  ```
  https://bitbuddies.me/sitemap.xml
  ```
- [ ] Verify robots.txt is accessible:
  ```
  https://bitbuddies.me/robots.txt
  ```
- [ ] Test social sharing with tools:
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [ ] Verify canonical URLs in page source
- [ ] Check structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)

### 3. Analytics Verification
- [ ] Visit `https://bitbuddies.me` and verify analytics tracking
- [ ] Check Plausible dashboard for incoming data
- [ ] Verify page views are being tracked
- [ ] Test with ad-blocker to ensure script loads

### 4. PWA Testing
- [ ] Test "Add to Home Screen" on iOS (Safari)
- [ ] Test "Add to Home Screen" on Android (Chrome)
- [ ] Verify app icon displays correctly
- [ ] Check app name and description in installed app
- [ ] Verify theme color is applied

### 5. Performance Testing
- [ ] Run [Google PageSpeed Insights](https://pagespeed.web.dev/)
  - Target: Score > 90 for all metrics
- [ ] Check [Web.dev Measure](https://web.dev/measure/)
- [ ] Test on [GTmetrix](https://gtmetrix.com/)
- [ ] Verify First Contentful Paint (FCP) < 1.8s
- [ ] Verify Largest Contentful Paint (LCP) < 2.5s
- [ ] Verify Time to Interactive (TTI) < 3.8s

### 6. Security Testing
- [ ] SSL certificate is valid (check with [SSL Labs](https://www.ssllabs.com/ssltest/))
- [ ] HTTPS redirect works (http:// → https://)
- [ ] Security headers are present:
  ```bash
  curl -I https://bitbuddies.me
  ```
- [ ] CSP (Content Security Policy) is configured
- [ ] HSTS header is present

### 7. Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on various screen sizes
- [ ] Verify responsive design works
- [ ] Check touch interactions
- [ ] Test PWA installation

## Monitoring & Maintenance

### Analytics
- **Plausible Dashboard**: Monitor at your Plausible instance
- Check daily for:
  - Traffic patterns
  - Popular pages
  - Bounce rate
  - Session duration

### Error Monitoring (Recommended)
Consider adding error tracking:
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://www.datadog.com) - Full observability

### Regular Maintenance
- **Weekly**: Check analytics and performance metrics
- **Monthly**: Update dependencies (`bun update`)
- **Quarterly**: Review and update content in sitemap
- **Yearly**: Renew SSL certificates if self-managed

### Update Checklist
When deploying updates:
1. Test changes locally (`bun run dev`)
2. Run production build (`bun run build`)
3. Test production build locally
4. Deploy to staging (if available)
5. Deploy to production
6. Run post-deployment verification
7. Monitor for errors in first 24 hours

## Rollback Procedure

If issues occur after deployment:

### Vercel
```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

### Netlify
- Go to Deploys tab
- Click on a previous successful deploy
- Click "Publish deploy"

### Custom Server
```bash
# Restore from backup
git checkout <previous-commit>
bun run build
# Restart server
```

## Support & Resources

### Documentation
- [TanStack Start Docs](https://tanstack.com/start)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)

### Contact
- **Email**: hello@bitbuddies.me
- **GitHub**: Issues tab in repository

## Environment-Specific Notes

### Development
- Uses test Clerk keys
- Debug routes enabled
- Verbose logging
- Hot module reloading

### Production
- Uses live Clerk keys
- Debug routes DISABLED
- Minimal logging
- Optimized bundles
- Analytics enabled

---

**Last Updated**: December 2024
**Version**: 1.0.0
