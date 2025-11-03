# Posts System - Troubleshooting Guide

## 🐛 Known Issues & Solutions

### Issue 1: Images Not Loading in Posts

**Symptoms:**
- Cover images show "No image selected" even after upload
- Images uploaded but don't display in admin or public views
- `imageUrl` is null or undefined

**Root Cause:**
The `mediaAssets.getById` query wasn't generating URLs from storage IDs.

**Solution (FIXED):**
Updated `convex/mediaAssets.ts` to generate URLs in the `getById` and `list` queries:

```typescript
export const getById = query({
  args: { assetId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) return null;

    // Generate URL from storage
    const url = await ctx.storage.getUrl(asset.storageId);
    return { ...asset, url: url ?? undefined };
  },
});
```

**How to Test:**
1. Upload a new image via `/admin/posts/create`
2. Check browser console for logs showing asset ID
3. Image should display immediately after upload
4. Refresh page - image should persist

**Debug Steps:**
1. Open browser console
2. Upload an image
3. Look for these logs:
   - "Selected file: ..."
   - "Got upload URL"
   - "File uploaded, storage ID: ..."
   - "Asset created with ID: ..."
   - "Upload complete!"
4. Check the `ImageUpload render:` log for imageUrl value

---

### Issue 2: Kibo Editor Not Working in Admin

**Symptoms:**
- Editor doesn't load or shows blank
- Can't type or use formatting tools
- Console errors about React/TipTap
- Editor freezes or crashes

**Possible Causes:**
1. Server-side rendering conflict
2. "use client" directive missing
3. Hydration mismatch
4. React version incompatibility

**Solution:**
The RichTextEditor now includes client-side check:

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  return <div>Loading editor...</div>;
}
```

**How to Test:**
1. Go to `/debug/editor` to test editor in isolation
2. Try typing, formatting, creating lists
3. Check JSON output updates correctly
4. Look for console errors

**Debug Steps:**
1. Open `/debug/editor` page
2. Try basic operations:
   - Type text
   - Select and format (bold, italic)
   - Create lists (bullet, ordered)
   - Insert table
   - Add code block
3. Click "Show JSON" to verify content structure
4. Check browser console for errors

**Common Errors:**

**Error: "TypeError: Cannot read property 'getJSON' of undefined"**
- Cause: Editor not initialized
- Fix: Wait for isClient to be true

**Error: "Hydration failed"**
- Cause: Server/client mismatch
- Fix: Editor only renders on client now

**Error: "Failed to execute 'removeChild'"**
- Cause: React 19 strict mode + TipTap
- Fix: Already handled in component

---

### Issue 3: Content Not Saving

**Symptoms:**
- Type in editor but content not saved to database
- JSON shows empty content after save
- Post displays with no content

**Causes:**
1. `onChange` handler not called
2. JSON stringify failing
3. Mutation not receiving content

**Debug Steps:**
1. Add console.log in create/edit handler:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  console.log("Submitting with content:", content);
  console.log("Content as JSON string:", JSON.stringify(content));
  // ... rest of submit
};
```

2. Check what's sent to mutation
3. Verify content in Convex dashboard

**Solution:**
Ensure content is stringified before sending:
```typescript
content: JSON.stringify(content), // Store as JSON string
```

---

### Issue 4: Editor Performance Issues

**Symptoms:**
- Editor lags when typing
- Slow to load
- High CPU usage
- Browser becomes unresponsive

**Causes:**
1. Too many re-renders
2. Large content (tables, lists)
3. Memory leaks

**Solutions:**

1. **Debounce onChange:**
```typescript
const debouncedOnChange = useMemo(
  () => debounce((newContent) => onChange(newContent), 300),
  [onChange]
);
```

2. **Limit content size:**
- Max 100,000 characters
- Warn user if exceeding

3. **Optimize re-renders:**
- Use React.memo for editor wrapper
- Don't pass new objects to onChange

**How to Test:**
1. Create large post (1000+ words)
2. Add tables with many rows
3. Type continuously
4. Monitor performance tab

---

### Issue 5: TypeScript Errors After Creating Routes

**Symptoms:**
- Red squiggles in route files
- Error: "Argument of type '/admin/posts' is not assignable"
- Build fails with route errors

**Cause:**
TanStack Router needs to regenerate route tree.

**Solution:**
```bash
# Stop dev server (Ctrl+C)
# Restart
bun run dev
```

Route tree auto-generates in `src/routeTree.gen.ts`

---

### Issue 6: Access Control Not Working

**Symptoms:**
- Protected posts visible without login
- "Login Required" badge not showing
- Preview mode not displaying

**Debug Steps:**
1. Check `canAccessPost()` function:
```typescript
const canAccessPost = (post: any) => {
  console.log("Checking access:", {
    accessLevel: post.accessLevel,
    isAuthenticated,
    result: /* ... */
  });
  // ... logic
};
```

2. Verify authentication state:
```typescript
const { isAuthenticated, user } = useAuth();
console.log("Auth state:", { isAuthenticated, user });
```

3. Test each access level:
- Public - no auth needed ✓
- Authenticated - requires login ✓
- Subscription - requires subscription ✓

---

## 🔧 General Debugging Tips

### 1. Check Browser Console
Always open DevTools console:
- Chrome/Edge: F12 or Ctrl+Shift+I
- Firefox: F12
- Safari: Cmd+Option+I

Look for:
- Red errors
- Yellow warnings
- Console.log outputs

### 2. Check Convex Dashboard
Visit your Convex dashboard:
1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Data" to view tables
4. Check "Logs" for backend errors

### 3. Verify Environment Variables
Check `.env.local` has:
```bash
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SITE_URL=http://localhost:3000  # or production URL
```

### 4. Clear Cache
If strange issues persist:
```bash
# Clear Convex cache
rm -rf .convex

# Clear Bun cache
rm -rf node_modules
bun install

# Restart everything
bun convex dev
bun run dev
```

### 5. Check Network Tab
In DevTools Network tab:
- Filter by "Fetch/XHR"
- Look for failed requests (red)
- Check response bodies for errors
- Verify Convex mutations succeed

---

## 🧪 Testing Checklist

### Image Upload Testing
- [ ] Upload new image
- [ ] Image displays in preview
- [ ] Image persists after page refresh
- [ ] Select from library works
- [ ] Remove image works
- [ ] Multiple images can be uploaded

### Editor Testing
- [ ] Editor loads without errors
- [ ] Can type text
- [ ] Can format text (bold, italic, etc.)
- [ ] Can create lists
- [ ] Can insert tables
- [ ] Can add code blocks
- [ ] Content saves correctly
- [ ] Content displays on post view
- [ ] JSON is valid after save

### Access Control Testing
- [ ] Public posts visible to all
- [ ] Authenticated posts show login CTA
- [ ] Subscription posts show upgrade CTA
- [ ] Preview mode shows for protected content
- [ ] Full content shows after login
- [ ] Badges display correctly

### Admin Functions Testing
- [ ] Create post with all fields
- [ ] Edit existing post
- [ ] Delete post with confirmation
- [ ] Publish/unpublish toggle
- [ ] Feature/unfeature toggle
- [ ] View post preview

### Public Access Testing
- [ ] Posts list loads
- [ ] Featured post displays
- [ ] Post cards have images
- [ ] Click post to view
- [ ] Single post loads
- [ ] Content renders correctly
- [ ] Tags display
- [ ] Metadata correct

---

## 🚨 Emergency Fixes

### If Editor Completely Broken
1. Go to `/debug/editor` to test in isolation
2. If still broken, check React DevTools for component errors
3. Temporarily disable editor and use textarea:
```typescript
<Textarea
  value={JSON.stringify(content, null, 2)}
  onChange={(e) => {
    try {
      setContent(JSON.parse(e.target.value));
    } catch {}
  }}
  rows={20}
/>
```

### If Images Won't Upload
1. Check Convex dashboard logs for errors
2. Verify file size < 10MB
3. Check admin role is set
4. Try uploading via `/debug/admin-setup`

### If Posts Won't Save
1. Check all required fields filled
2. Verify clerkId is passed
3. Check admin role active
4. Look for mutation errors in console
5. Test with minimal content first

---

## 📞 Getting Help

### Information to Provide
When reporting issues, include:
1. **Browser & Version**: Chrome 120, Firefox 121, etc.
2. **Error Messages**: Full text from console
3. **Steps to Reproduce**: Exact actions taken
4. **Screenshots**: Of error or unexpected behavior
5. **Console Logs**: From browser DevTools
6. **Convex Logs**: From dashboard

### Debugging Commands
```bash
# Check versions
bun --version
node --version

# Verify dependencies
bun pm ls

# Check Convex status
bun convex dev --help

# Run tests (if implemented)
bun test

# Build check
bun run build
```

---

## ✅ Verification Steps

After fixes, verify:

1. **Images Work**
   - Upload → See preview → Save → Reload → Still visible

2. **Editor Works**
   - Type → Format → Save → View post → Content correct

3. **Access Control Works**
   - Logout → View list → See badges → Click → See preview

4. **Admin Works**
   - Create → Edit → Delete → All succeed

5. **Performance OK**
   - No lag when typing
   - Pages load fast
   - No memory leaks

---

## 📚 Related Documentation

- `POSTS_IMPLEMENTATION.md` - Technical details
- `POSTS_QUICKSTART.md` - Getting started guide
- `IMAGE_UPLOAD_GUIDE.md` - Image system details
- `AGENTS.md` - Project architecture

---

**Last Updated**: December 2024
**Status**: Active troubleshooting document
