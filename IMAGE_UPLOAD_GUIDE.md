# Image Upload Guide

## Overview

Workshops can have cover images uploaded and stored in Convex storage. Images are displayed in the workshop list, admin table, and workshop detail pages.

## How to Upload Images

### From Admin Interface

1. **Navigate to workshop form**:
   - Create: `/admin/workshops/create`
   - Edit: `/admin/workshops/:id/edit`

2. **Upload an image**:
   - Click "Choose File" under "Cover Image"
   - Select an image file (JPG, PNG, GIF, WebP)
   - Preview will appear immediately
   - Click "Upload Image" to upload to Convex storage
   - Image is saved and associated with the workshop

3. **Replace an image**:
   - Click the X button on the current image
   - Upload a new image following step 2

### Image Requirements

- **File types**: JPG, PNG, GIF, WebP, or any image/* MIME type
- **Max size**: 10 MB
- **Recommended dimensions**: 1200x630 (16:9 aspect ratio) for best display
- **Min dimensions**: 800x450 for quality display

## Where Images Display

### 1. Workshop Cards (Public List)
Location: `/workshops`

```
┌─────────────────────────┐
│                         │
│   Cover Image (h-48)    │  ← Hero image or icon placeholder
│                         │
├─────────────────────────┤
│ Workshop Title          │
│ Description             │
│ Duration • Date • Tags  │
└─────────────────────────┘
```

- Full card width
- Height: 192px (h-48)
- Object-fit: cover (maintains aspect ratio, crops if needed)
- Fallback: Gray placeholder with image icon

### 2. Admin Table
Location: `/admin/workshops`

```
┌────┬──────────────┬────────┬────────┐
│ 📷 │ Title        │ Level  │ Status │
│ 64 │ My Workshop  │ Beggr. │ ✓ Pub. │
│ x64│              │        │        │
└────┴──────────────┴────────┴────────┘
```

- Thumbnail: 64x64px
- Object-fit: cover
- Rounded corners
- Fallback: Gray box with icon

### 3. Workshop Detail Page
Location: `/workshops/:slug`

```
┌──────────────────────────────────┐
│                                  │
│       Cover Image (h-96)         │  ← Large hero image
│                                  │
├──────────────────────────────────┤
│ Workshop Title & Details         │
│ Video Player                     │
│ Content                          │
└──────────────────────────────────┘
```

- Full container width (max-w-6xl)
- Height: 384px (h-96)
- Object-fit: cover
- Rounded corners
- Fallback: Gray hero with large icon

## Technical Implementation

### Architecture

```
Frontend                    Convex Storage
────────                    ──────────────
1. generateUploadUrl()  →   Returns upload URL (1hr expiration)
2. POST file to URL     →   Stores file, returns storageId
3. createMediaAsset()   →   Saves metadata to mediaAssets table
4. Update workshop      →   Links coverAssetId to workshop
```

### Database Schema

**mediaAssets table**:
```typescript
{
  _id: Id<"mediaAssets">,
  storageId: Id<"_storage">,      // Reference to Convex storage
  url: string | undefined,         // Public URL
  mimeType: string,                // e.g., "image/jpeg"
  filesize: number,                // Bytes
  assetType: "image" | "attachment",
  altText?: string,
  caption?: string,
  createdBy?: Id<"users">,
  createdAt: number,
  updatedAt: number
}
```

**workshops table**:
```typescript
{
  // ... other fields
  coverAssetId?: Id<"mediaAssets">,  // Optional reference
}
```

### Component Usage

```typescript
import { ImageUpload } from "../components/common/ImageUpload";
import { useMediaAsset } from "../hooks/useMediaAssets";

function MyForm() {
  const [coverAssetId, setCoverAssetId] = useState<Id<"mediaAssets">>();
  const coverAsset = useMediaAsset(coverAssetId);

  return (
    <ImageUpload
      value={coverAssetId}
      imageUrl={coverAsset?.url}
      onChange={setCoverAssetId}
      label="Cover Image"
      disabled={false}
    />
  );
}
```

## API Reference

### Convex Functions

#### `mediaAssets.generateUploadUrl()`
Generate a short-lived upload URL (expires in 1 hour).

```typescript
const uploadUrl = await generateUploadUrl();
```

#### `mediaAssets.create()`
Create a media asset record after upload.

```typescript
const assetId = await createAsset({
  storageId: Id<"_storage">,
  mimeType: string,
  filesize: number,
  assetType: "image",
  altText?: string,
  caption?: string,
  createdBy?: Id<"users">
});
```

#### `mediaAssets.getById()`
Fetch media asset metadata by ID.

```typescript
const asset = await getById({ assetId: Id<"mediaAssets"> });
// Returns: { storageId, url, mimeType, filesize, ... }
```

#### `mediaAssets.getUrl()`
Get public URL for a storage ID.

```typescript
const url = await getUrl({ storageId: Id<"_storage"> });
// Returns: "https://.../files/..." or null
```

#### `mediaAssets.remove()`
Delete a media asset and its file from storage.

```typescript
await removeAsset({ assetId: Id<"mediaAssets"> });
// Deletes from storage AND database
```

### React Hooks

```typescript
// Get asset by ID
const asset = useMediaAsset(assetId);

// Get URL for storage ID
const url = useMediaAssetUrl(storageId);

// Upload mutations
const generateUploadUrl = useGenerateUploadUrl();
const createAsset = useCreateMediaAsset();
const updateAsset = useUpdateMediaAsset();
const removeAsset = useRemoveMediaAsset();
```

## Best Practices

### Image Optimization

1. **Compress before upload**: Use tools like TinyPNG or ImageOptim
2. **Recommended dimensions**: 1200x630px (16:9 ratio)
3. **Format**:
   - Photos: JPEG (smaller file size)
   - Graphics/logos: PNG (transparency support)
   - Animations: GIF or WebP
4. **File size**: Keep under 500KB for faster loading

### Accessibility

- Always provide meaningful alt text (future feature)
- Use high contrast images for readability
- Ensure images look good in both light/dark themes

### Performance

- Images are served via Convex CDN (globally distributed)
- URLs are cached by browsers
- `object-fit: cover` ensures consistent display
- Lazy loading on workshop cards (browser native)

## Troubleshooting

### Upload fails with "Upload failed"

**Causes**:
- File size > 10MB
- Not an image file
- Network timeout
- Convex storage quota exceeded

**Solution**:
1. Check file size and type
2. Compress the image
3. Retry the upload
4. Check Convex dashboard for storage limits

### Image not displaying

**Causes**:
- Upload completed but `coverAssetId` not saved
- Storage ID invalid or file deleted
- URL generation failed

**Solution**:
1. Check workshop record has `coverAssetId` field
2. Query `mediaAssets` table for the asset
3. Verify `storageId` exists in `_storage` table
4. Check browser console for errors

### Image shows placeholder icon

**Expected behavior**: If no image uploaded or `coverAssetId` is undefined

**To fix**: Upload an image through the workshop form

### Uploaded wrong image

**Solution**:
1. Click the X button on the current image
2. Confirms deletion (removes from storage)
3. Upload the correct image
4. Previous file is deleted from Convex storage

## Storage Management

### Viewing Uploaded Files

1. Go to Convex Dashboard
2. Navigate to Data → `_storage` table
3. See all uploaded files with metadata

### Storage Limits

- **Development**: 1 GB free
- **Production**: Depends on Convex plan
- Files count toward total storage quota
- Deleted files free up space immediately

### Cleanup

Orphaned files (not referenced by any workshop) should be cleaned up periodically:

```typescript
// Example cleanup query (run from Convex dashboard)
const allAssets = await ctx.db.query("mediaAssets").collect();
const workshopsWithImages = await ctx.db
  .query("workshops")
  .filter(q => q.neq(q.field("coverAssetId"), undefined))
  .collect();

const usedAssetIds = new Set(
  workshopsWithImages.map(w => w.coverAssetId)
);

const orphaned = allAssets.filter(
  asset => !usedAssetIds.has(asset._id)
);

// Review orphaned assets and delete if needed
```

## Future Enhancements

Potential improvements for image upload:

- [ ] Image cropping/editing UI
- [ ] Multiple images per workshop (gallery)
- [ ] Automatic thumbnail generation
- [ ] Alt text and caption fields in UI
- [ ] Drag-and-drop upload
- [ ] Copy/paste from clipboard
- [ ] Bulk upload
- [ ] Image optimization on upload
- [ ] CDN integration (optional)
- [ ] Usage analytics (storage per user)

## Summary

- ✅ Cover images stored in Convex storage
- ✅ Simple 3-step upload process
- ✅ Preview before upload
- ✅ Display in cards, tables, and detail pages
- ✅ Automatic cleanup on delete
- ✅ Max 10MB, images only
- ✅ Works in create and edit forms
- ✅ Fallback placeholders when no image

Images enhance the visual appeal of workshops and make them more recognizable in the list view!
