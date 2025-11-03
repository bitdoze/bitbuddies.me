# Posts System - Quick Start Guide

## ✅ Implementation Complete

The blog posts system has been fully implemented with rich text editing, access controls, and admin management.

## 📦 What's Included

### Backend (Convex)
- ✅ `convex/posts.ts` - Complete CRUD operations with admin authorization
- ✅ Queries: list, getById, getBySlug, getByCategory, incrementViewCount
- ✅ Mutations: create, update, softDelete (all require admin role)

### Frontend
- ✅ `src/hooks/usePosts.ts` - React hooks for all post operations
- ✅ `src/components/common/RichTextEditor.tsx` - Full-featured editor component

### Admin Routes
- ✅ `/admin/posts` - Dashboard with posts table
- ✅ `/admin/posts/create` - Create new post with rich text editor
- ✅ `/admin/posts/:id/edit` - Edit existing post

### Public Routes
- ✅ `/posts` - Public posts list with featured post section
- ✅ `/posts/:slug` - Single post view with access control

### Navigation
- ✅ Header and Sidebar updated with "Blog" links

## 🚀 Getting Started

### 1. Start Development Server

```bash
# Terminal 1 - Start Convex backend
bun convex dev

# Terminal 2 - Start TanStack Start dev server
bun run dev
```

The route tree will auto-generate on first run, fixing any TypeScript errors.

### 2. Create Your First Post

1. Navigate to `http://localhost:3000/admin/posts`
2. Click "Create Post" button
3. Fill in the form:
   - **Title**: Your post title (slug auto-generates)
   - **Excerpt**: Brief summary for post cards
   - **Cover Image**: Upload or select from library
   - **Content**: Use the rich text editor with all formatting options
   - **Category**: e.g., "Tutorials", "News", "Updates"
   - **Tags**: Comma-separated (e.g., "react, typescript, tutorial")
   - **Read Time**: Estimated minutes to read
   - **Access Level**: Choose public, authenticated, or subscription
   - **Publishing**: Check "Publish immediately" to make it live
4. Click "Create Post"

### 3. View Your Post

- Admin list: `http://localhost:3000/admin/posts`
- Public list: `http://localhost:3000/posts`
- Single post: `http://localhost:3000/posts/your-slug`

## 🎨 Rich Text Editor Features

The editor supports:
- **Text Formatting**: Bold, italic, underline, strikethrough, code
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists, ordered lists, task lists
- **Tables**: Full table support with add/remove rows/columns
- **Code Blocks**: With syntax highlighting
- **Blockquotes**: For callouts and quotes
- **Links**: Add hyperlinks to text
- **Special**: Subscript, superscript

## 🔐 Access Control

### Three Levels:
1. **Public** - Anyone can read
2. **Authenticated** - Requires login (shows preview + sign-in CTA to non-authenticated users)
3. **Subscription** - Requires active subscription (shows preview + upgrade CTA)

### Setting Access:
- In the "Access Control" section of create/edit form
- Choose access level from dropdown
- If "Subscription", select required tier (basic/premium)

## 📝 Content Storage

Content is stored as **JSON** (not HTML):
- Editor outputs ProseMirror JSONContent format
- Stored as JSON string in `posts.content` field
- Rendered by custom ContentRenderer component on single post view
- Benefits: Structured, parseable, future-proof

## 🖼️ Images

### Cover Images:
- 16:9 aspect ratio recommended (1200×675 pixels)
- Uploaded to Convex storage
- Reusable via image library
- Click "Choose from Library" to reuse existing images

### Content Images:
- Can be embedded via editor (future enhancement)
- For now, use external URLs in editor

## 🎯 SEO Features

Each post has:
- **Meta Title** (defaults to post title)
- **Meta Description** (defaults to excerpt)
- **Keywords** (from tags)
- **Open Graph** image (from cover image)
- **Structured Data** (Article schema for Google)
- **Canonical URLs**

## 📊 Admin Features

### Posts Dashboard (`/admin/posts`)
- View all posts (published and drafts)
- See metrics: views, read time, access level
- Quick actions: View, Edit, Delete
- Filter by status (via published badge)
- Empty state with "Create First Post" CTA

### Create Post (`/admin/posts/create`)
- Comprehensive form with 6 sections
- Auto-slug generation from title
- Rich text editor with 500px min height
- Image upload with library
- Publishing options (publish now, feature post)

### Edit Post (`/admin/posts/:id/edit`)
- Same form as create, pre-populated
- Updates existing post content
- Preserves formatting and images

## 🌐 Public Features

### Posts List (`/posts`)
- Featured post section (large hero)
- Grid of all published posts
- Cover images with hover effects
- Lock badges for protected content
- Empty state when no posts

### Single Post (`/posts/:slug`)
- Full post with cover image
- Rich content rendering
- Metadata display (author, date, read time, views)
- Tags section
- **Preview Mode** for protected content:
  - Shows header and excerpt
  - Lists benefits of signing in
  - Sign-in CTA button
  - Upgrade CTA for subscription content

## ⚙️ Common Tasks

### Publish a Draft
1. Go to `/admin/posts`
2. Click Edit on draft post
3. Check "Publish post" checkbox
4. Click "Update Post"

### Feature a Post
1. Edit the post
2. Check "Feature this post" checkbox
3. Save - it will appear in hero section on `/posts`

### Change Access Level
1. Edit the post
2. Change "Access Level" dropdown
3. Set tier if subscription
4. Save

### Delete a Post
1. Go to `/admin/posts`
2. Click trash icon on post
3. Confirm deletion
4. Post is soft-deleted (isDeleted = true)

## 🐛 Troubleshooting

### TypeScript Errors After Creating Routes
**Solution**: Restart dev server - route tree will regenerate

### "Admin Access Required" Error
**Solution**:
1. Go to `/debug/admin-setup`
2. Click "Make Me Admin"
3. Now you can access admin routes

### Images Not Showing
**Solution**:
- Check image was uploaded successfully
- Verify Convex storage URL is accessible
- Try re-uploading or selecting from library

### Content Not Rendering
**Solution**:
- Content is stored as JSON string
- Check JSON is valid in database
- ContentRenderer component handles parsing
- Check browser console for errors

## 📚 File Reference

```
bitbuddies.me3/
├── convex/
│   └── posts.ts                          # Backend queries/mutations
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── RichTextEditor.tsx        # Editor component
│   │   └── layout/
│   │       ├── Header.tsx                # Updated with Blog link
│   │       └── Sidebar.tsx               # Updated with Blog menu
│   ├── hooks/
│   │   └── usePosts.ts                   # React hooks
│   └── routes/
│       ├── admin.posts.tsx               # Admin layout
│       ├── admin.posts.index.tsx         # Posts dashboard
│       ├── admin.posts.create.tsx        # Create form
│       ├── admin.posts.$id.edit.tsx      # Edit form
│       ├── posts.index.tsx               # Public list
│       └── posts.$slug.tsx               # Single post view
```

## 🎓 Next Steps

1. **Create Content**: Start publishing blog posts
2. **Categories**: Organize posts with consistent categories
3. **Tags**: Use tags for better discovery
4. **Featured Posts**: Highlight important content
5. **Access Control**: Test protected content flow
6. **SEO**: Optimize meta tags for each post

## 🔗 Related Systems

- **Workshops**: Similar structure at `/workshops`
- **Courses**: Content management at `/courses`
- **Media Library**: Shared image storage system
- **User System**: Clerk authentication for access control

## 💡 Tips

- **Slugs**: Keep them short, descriptive, SEO-friendly
- **Excerpts**: Write compelling 1-2 sentence summaries
- **Categories**: Use consistent naming (capitalized)
- **Tags**: Use lowercase, be specific
- **Read Time**: 200-250 words per minute average
- **Images**: Always add cover images for better visuals
- **Preview**: Use preview mode to see before publishing

## ✨ Features to Explore

- Rich text formatting options
- Table creation and manipulation
- Task lists for tutorials
- Code blocks with syntax highlighting
- Image library for reusing assets
- Access control previews
- SEO meta tag customization
- Featured post highlighting

---

**Status**: ✅ Production Ready
**Last Updated**: December 2024
**Documentation**: See `POSTS_IMPLEMENTATION.md` for detailed technical docs
