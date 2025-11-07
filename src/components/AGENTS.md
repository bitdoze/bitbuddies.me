# Components Agent Instructions

This guide covers UI components, styling, accessibility, and design patterns.

## UI Instructions

### Shadcn Components

Use the latest version of Shadcn to install new components:

```bash
bunx shadcn@latest add button
```

Available components in `ui/`: Button, Dialog, Card, Form, etc.

### Icons

Use lucide-react for icons

### Theming

The website uses theme settings from `src/styles.css`. Changes there are reflected everywhere.
- Use theme tokens from styles.css
- Support dark/light mode via theme-provider.tsx
- Test components in both themes

## Design Pattern (December 2024)

### UI Redesign Style
- **Removed boxed Card components**, replaced with `rounded-2xl` containers with `border`, `bg-card`, and `shadow-md/lg`
- **Visual Elements**: Decorative blur circles, gradient backgrounds, icon badges, and improved spacing (py-16 sections)
- **Typography**: Larger headings (text-3xl/4xl/5xl), better hierarchy, improved line-height and spacing

### Examples
- Workshop list with hero section, decorative elements, and improved cards
- Workshop detail page with full-width hero, rounded containers, and section headers with icons
- Admin dashboard with gradient hero, improved table styling, and better empty states
- Create form with sectioned layout, icon headers, and improved visual hierarchy

## Image Library System

The image library provides a centralized way to manage and reuse uploaded images.

### Components
- `ImageUpload` - Upload UI with library access button
- `ImageLibrary` - Modal dialog for browsing/selecting images

### Usage
```typescript
<ImageUpload
	value={coverAssetId}
	imageUrl={coverAsset?.url}
	onChange={setCoverAssetId}
	label="Cover Image"
/>
```

### ImageUpload Component Features
- Upload new images with preview before saving
- Browse and select from previously uploaded images
- "Choose from Library" button opens image library dialog
- 16:9 aspect ratio maintained for all images
- Clear visual buttons: "Upload New" and "Choose from Library"

### ImageLibrary Component Features
- Grid view of all uploaded images (100 most recent)
- 16:9 aspect ratio thumbnails
- Hover to see file size and upload date
- Click to select, visual selection indicator
- Reusable across the application

### Image Display (all maintain 16:9 aspect ratio)
- Workshop cards (public list) - full-width hero with padding-bottom: 56.25%
- Admin table - 64x64 thumbnails
- Workshop detail page - full-width hero
- Upload preview - max-w-2xl with 16:9 ratio

### Benefits
- Reuse images across multiple workshops
- No need to re-upload the same image
- Central storage management
- Browse all previously uploaded images
- Reduces storage usage

### Database
- `mediaAssets` table stores all uploaded files
- `workshops.coverAssetId` references the asset
- Automatic cleanup when asset is deleted

## Accessibility

- **Interactive elements**: Use button/anchor, not div with onClick
- **Keyboard navigation**: Add onKeyDown handlers where onClick exists
- **ARIA labels**: Provide labels for screen readers
- **Alt text**: Describe images without redundant words (avoid "image of")

## React Patterns

- **Avoid premature optimization**: Profile before optimizing
- **Use proper hooks**: Follow React hooks rules (dependencies, etc.)
- **Error boundaries**: Wrap route components in error boundaries

## Component Structure

### Layout Components (in `layout/`)
- `Header.tsx` - Top navigation bar with auth
- `Footer.tsx` - Site footer
- `Sidebar.tsx` - App sidebar navigation

### Common Components (in `common/`)
- `theme-provider.tsx` - Theme provider for dark/light mode
- `UserSyncProvider.tsx` - Auto-sync Clerk users to Convex
- `UserSyncDebug.tsx` - Debug component for user sync
- `SEO.tsx` - SEO component using config

## Code Comments

IMPORTANT: NEVER add comments to explain code changes. Explanation belongs in your text response to the user, never in the code itself.

Only add code comments when:
- The user explicitly requests comments
- The code is complex and requires context for future developers

## Documentation

For detailed component and styling patterns, see:
- `docs/shadcn.md` - Component library usage
- `docs/tailwindcss.md` - Styling guidelines
