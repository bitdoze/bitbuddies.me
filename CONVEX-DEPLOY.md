# Convex Deployment Guide

This guide covers deploying your Convex backend to production for bitbuddies.me.

## Prerequisites

- Convex account created at [dashboard.convex.dev](https://dashboard.convex.dev)
- Convex CLI installed: `bunx convex --version`
- Environment variables configured (`.env.local`)

## Quick Deploy to Production

### 1. Initial Setup (First Time Only)

If you haven't initialized Convex yet:

```bash
# Initialize Convex project
bunx convex dev

# Follow prompts to:
# - Create or select a project
# - Choose a deployment name (e.g., "bitbuddies-prod")
# - This creates convex.json configuration file
```

### 2. Deploy to Production

```bash
# Deploy schema and functions to production
bunx convex deploy --prod

# Or with verbose output to see all changes
bunx convex deploy --prod --verbose
```

This will:
- ✅ Push your schema changes
- ✅ Deploy all function files (workshops.ts, users.ts, etc.)
- ✅ Generate TypeScript types
- ✅ Run any migrations

### 3. Get Production URL

After deployment, you'll see output like:
```
✔ Deployed!
  https://your-project-123.convex.cloud
```

Copy this URL and add it to your production environment variables:
```bash
VITE_CONVEX_URL=https://your-project-123.convex.cloud
```

## Environment-Specific Deployments

### Development Deployment

```bash
# Start dev server (creates dev deployment if needed)
bunx convex dev

# This runs continuously and watches for changes
```

### Preview/Staging Deployment

```bash
# Deploy to a preview deployment
bunx convex deploy --preview-create staging

# Or use preview deploy key from Convex dashboard
CONVEX_DEPLOY_KEY=your-preview-key bunx convex deploy
```

### Production Deployment

```bash
# Deploy to production
bunx convex deploy --prod

# Skip confirmation prompt
bunx convex deploy --prod -y
```

## Verifying Deployment

### 1. Check Dashboard

Visit [dashboard.convex.dev](https://dashboard.convex.dev) and verify:
- ✅ All tables appear in Data tab
- ✅ Functions are listed in Functions tab
- ✅ No errors in Logs tab

### 2. Test Functions

You can test functions directly in the dashboard:

```javascript
// In Dashboard → Functions → workshops.list
{
  "publishedOnly": true
}
```

### 3. Verify from Your App

Update your `.env.production` with the Convex URL and test:

```bash
VITE_CONVEX_URL=https://your-project-123.convex.cloud
```

## Managing Multiple Environments

### Option 1: Separate Projects

Create different Convex projects:
- `bitbuddies-dev` → Development
- `bitbuddies-staging` → Staging
- `bitbuddies-prod` → Production

Switch between them in `convex.json`:
```json
{
  "deployment": "bitbuddies-prod"
}
```

### Option 2: Same Project, Multiple Deployments

Use production + preview deployments in one project:
- Production deployment (default)
- Preview deployments (dev-*, staging-*)

```bash
# Deploy to prod
bunx convex deploy --prod

# Deploy to preview
bunx convex deploy --preview-create dev-yourname
```

## Common Deployment Tasks

### Update Schema

Edit `convex/schema.ts` and deploy:

```bash
bunx convex deploy --prod
```

Convex will:
- Automatically migrate existing data
- Add new tables/fields
- Create new indexes
- **Note**: Dropping fields requires manual migration

### Update Functions

Edit any `.ts` file in `convex/` folder:

```bash
bunx convex deploy --prod
```

Changes are atomic - old version runs until new version is ready.

### View Logs

```bash
# Stream live logs
bunx convex logs --prod

# Or view in dashboard → Logs tab
```

### Import/Export Data

```bash
# Export all data
bunx convex data export --path ./backup.zip --prod

# Import data
bunx convex data import --path ./backup.zip --prod
```

## Production Best Practices

### 1. Environment Variables

Set these in your production environment (Vercel/Netlify):

```bash
# Required
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...  # Use LIVE key!

# Optional
NODE_ENV=production
```

### 2. Convex Environment Variables

Set sensitive values in Convex Dashboard → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
# etc.
```

Access in functions:
```typescript
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

### 3. Testing Before Prod Deploy

```bash
# 1. Test locally
bunx convex dev

# 2. Deploy to preview
bunx convex deploy --preview-create test

# 3. Test preview URL in staging environment

# 4. If all good, deploy to prod
bunx convex deploy --prod
```

### 4. Monitoring

Monitor your deployment:
- **Dashboard**: [dashboard.convex.dev](https://dashboard.convex.dev)
- **Logs**: Real-time function logs
- **Metrics**: Function execution times, error rates
- **Alerts**: Set up in dashboard settings

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Convex

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Deploy to Convex
        run: bunx convex deploy --prod -y
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

Get deploy key from: Dashboard → Settings → Deploy Keys

### Vercel Integration

Vercel automatically deploys Convex if you have `convex.json`:

```json
{
  "deployment": "bitbuddies-prod"
}
```

Or set `CONVEX_DEPLOY_KEY` in Vercel environment variables.

## Troubleshooting

### "No deployment found"

```bash
# Re-initialize
bunx convex dev

# Select existing project when prompted
```

### "Schema validation failed"

Your schema has errors. Fix in `convex/schema.ts`:
- Check all field types match validators
- Ensure indexes reference correct fields
- Verify table names match references

### "Function not found"

Make sure function is exported:
```typescript
export const myFunction = query({...});
```

### "Deployment taking too long"

Large deployments can take 1-2 minutes. Check:
```bash
bunx convex deploy --prod --verbose
```

### "Type errors"

```bash
# Regenerate types
bunx convex dev --once

# Or disable typecheck temporarily
bunx convex deploy --prod --typecheck disable
```

## Rollback

Convex doesn't support automatic rollback, but you can:

### Option 1: Redeploy Previous Code

```bash
# Check out previous commit
git checkout <previous-commit>

# Redeploy
bunx convex deploy --prod -y

# Return to current
git checkout main
```

### Option 2: Use Backup

```bash
# Restore from exported backup
bunx convex data import --path ./backup.zip --prod --replace
```

### Option 3: Manual Fix

Fix the issue and deploy again:
```bash
# Fix code
# Then deploy
bunx convex deploy --prod
```

## Data Migration Example

When making breaking schema changes:

```typescript
// convex/migrations/001_add_user_roles.ts
import { mutation } from "./_generated/server";

export const migrateUserRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.role) {
        await ctx.db.patch(user._id, {
          role: "user", // default role
        });
      }
    }

    return { migrated: users.length };
  },
});
```

Run migration:
```bash
# Deploy with migration
bunx convex deploy --prod

# Run migration function in dashboard
# Or via CLI
bunx convex run migrations:migrateUserRoles --prod
```

## Cost Optimization

Convex has generous free tier, but for production:

### Monitor Usage

Dashboard → Settings → Billing shows:
- Function calls
- Database storage
- File storage
- Bandwidth

### Optimize Queries

```typescript
// ❌ Bad: Fetches all then filters
const users = await ctx.db.query("users").collect();
const admins = users.filter(u => u.role === "admin");

// ✅ Good: Uses index
const admins = await ctx.db
  .query("users")
  .withIndex("by_role", q => q.eq("role", "admin"))
  .collect();
```

### Use Caching

```typescript
// Cache expensive computations
const cached = await ctx.db.query("cache")
  .withIndex("by_key", q => q.eq("key", "stats"))
  .first();

if (cached && cached.validUntil > Date.now()) {
  return cached.data;
}

// Compute and cache...
```

## Security Checklist

- [ ] Production Convex URL is set in environment
- [ ] Debug functions are removed or protected
- [ ] All mutations require authentication
- [ ] Admin mutations verify role
- [ ] Environment variables are set in Convex dashboard (not code)
- [ ] CORS is configured if needed
- [ ] Rate limiting is considered for public functions

## Support

- **Documentation**: [docs.convex.dev](https://docs.convex.dev)
- **Discord**: [convex.dev/community](https://convex.dev/community)
- **Dashboard**: [dashboard.convex.dev](https://dashboard.convex.dev)

---

**Last Updated**: December 2024
**Version**: 1.0.0
