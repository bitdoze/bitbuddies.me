# Public Assets Agent Instructions

This guide covers SEO configuration, static assets, favicons, and production deployment.

## Favicon Setup (IMPLEMENTED)

### Comprehensive favicon implementation for all devices and platforms

### Files included
- `favicon.ico` - Classic 32x32 ICO format for older browsers
- `favicon.svg` - Modern SVG format with theme support
- `favicon-16x16.png` - Small PNG for browser tabs
- `favicon-32x32.png` - Standard PNG for browser tabs
- `apple-touch-icon.png` - 180x180 for iOS home screen
- `android-chrome-192x192.png` - Android home screen
- `android-chrome-512x512.png` - Android high-res
- `site.webmanifest` - PWA manifest with app metadata
- `browserconfig.xml` - Windows tile configuration

### Implementation
In `__root.tsx`:

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

### Configuration
- **Theme colors**: `#6366f1` (indigo) matching the brand gradient
- **PWA support**: site.webmanifest enables "Add to Home Screen" on mobile

### Benefits
- Professional appearance across all platforms
- iOS home screen icon support
- Android adaptive icon support
- Windows tile support
- PWA installation capability
- Modern SVG with theme adaptation

## SEO Configuration Files

### robots.txt
Search engine directives (admin/debug routes disallowed)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /debug/

Sitemap: https://bitbuddies.me/sitemap.xml
```

### sitemap.xml
Search engine sitemap

**Important**: Update `lastmod` dates when content changes

Structure:
- Homepage - priority 1.0
- Main sections (workshops, courses) - priority 0.8
- Individual content pages - priority 0.6
- Static pages - priority 0.5

### site.webmanifest
PWA manifest with app metadata

```json
{
	"name": "BitBuddies",
	"short_name": "BitBuddies",
	"start_url": "https://bitbuddies.me",
	"scope": "https://bitbuddies.me",
	"theme_color": "#6366f1",
	"background_color": "#ffffff",
	"display": "standalone"
}
```

### browserconfig.xml
Windows tile configuration for Microsoft browsers

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

## Static Asset Best Practices

### File Organization
- Images: Use descriptive names, optimize size before upload
- Icons: Prefer SVG for scalability
- Documents: PDF, ZIP, etc. should be compressed

### Image Optimization
- Use modern formats (WebP, AVIF) with fallbacks
- Provide responsive images with srcset
- Lazy load images below the fold
- Use appropriate compression levels

### Caching
- Static assets are served with long cache headers
- Use versioning or cache-busting for updates
- Leverage CDN for global distribution

### Security
- Never commit sensitive files to public/
- Use .gitignore for any generated files
- Validate file uploads server-side
- Set appropriate CORS headers

## PWA Features

### Manifest Configuration
- Update `site.webmanifest` for app name, colors, icons
- Set appropriate `start_url` and `scope`
- Choose `display` mode (standalone, minimal-ui, browser)

### Icons
- Provide multiple sizes (192x192, 512x512)
- Use PNG format for Android icons
- Test on actual devices

### Testing
- Use Chrome DevTools Lighthouse for PWA audit
- Test "Add to Home Screen" on iOS and Android
- Verify offline functionality if implemented
- Check app icons and splash screens

## Documentation References

For detailed configuration, see `src/lib/config.ts` for centralized site settings.
