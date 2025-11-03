# Content Components Visual Structure Guide

## Component Hierarchy

```
ContentDetailLayout
├── Main Content Area
│   ├── ContentDetailHeader
│   │   ├── Back Button (Link)
│   │   ├── Badges (optional)
│   │   ├── Title
│   │   ├── Description (optional)
│   │   └── Meta Slot (optional)
│   │
│   ├── ContentDetailCover
│   │   ├── Image (if URL provided)
│   │   └── Fallback Icon (if no URL)
│   │
│   ├── Content Sections
│   │   ├── SectionHeader (eyebrow + title)
│   │   ├── Text Content
│   │   ├── Video Embeds
│   │   └── ResourcesList
│   │       ├── SectionHeader
│   │       └── Resource Cards (download buttons)
│   │
│   └── AuthRequiredCard (if not authenticated)
│       ├── Lock Icon
│       ├── Title & Description
│       ├── Feature List (CheckCircle2 icons)
│       └── SignInButton
│
└── Sidebar (optional)
    ├── ContentDetailSidebar
    │   ├── MetaInfoCard
    │   │   ├── Card Header (title)
    │   │   └── Meta Items (icon + label + value)
    │   │
    │   ├── TopicsTags (variant="card")
    │   │   ├── Card Header (title)
    │   │   └── Badge List
    │   │
    │   └── Additional Cards
    │       ├── WorkshopStatus (Phase 3)
    │       ├── CourseProgress (Phase 3)
    │       └── Custom Components
```

## Layout Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    ContentDetailLayout                          │
│ ┌───────────────────────────────────┬───────────────────────┐   │
│ │                                   │                       │   │
│ │     ContentDetailHeader           │   ContentDetailSidebar│   │
│ │     ┌───────────────────────┐     │   ┌─────────────────┐ │   │
│ │     │ ← Back to List        │     │   │ MetaInfoCard    │ │   │
│ │     └───────────────────────┘     │   │ 📊 Details      │ │   │
│ │     🏷️ Badge  🏷️ Badge           │   │                 │ │   │
│ │     ┌───────────────────────┐     │   │ 👤 Instructor   │ │   │
│ │     │ Large Title Text      │     │   │ ⏰ Duration     │ │   │
│ │     │ Description text here │     │   │ 📅 Date         │ │   │
│ │     └───────────────────────┘     │   └─────────────────┘ │   │
│ │                                   │                       │   │
│ │     ContentDetailCover            │   ┌─────────────────┐ │   │
│ │     ┌───────────────────────┐     │   │ TopicsTags      │ │   │
│ │     │                       │     │   │ 📚 Topics       │ │   │
│ │     │   Cover Image         │     │   │                 │ │   │
│ │     │   (max-w-4xl)         │     │   │ React TypeScript│ │   │
│ │     │                       │     │   │ Hooks Workshop  │ │   │
│ │     └───────────────────────┘     │   └─────────────────┘ │   │
│ │                                   │                       │   │
│ │     Main Content                  │   (Sticky on desktop)│   │
│ │     ┌───────────────────────┐     │                       │   │
│ │     │ 📄 Section Header     │     │                       │   │
│ │     │ About This Content    │     │                       │   │
│ │     ├───────────────────────┤     │                       │   │
│ │     │ Text content...       │     │                       │   │
│ │     │ Paragraphs...         │     │                       │   │
│ │     └───────────────────────┘     │                       │   │
│ │                                   │                       │   │
│ │     ┌───────────────────────┐     │                       │   │
│ │     │ 🎥 Video Embed        │     │                       │   │
│ │     │ (if authenticated)    │     │                       │   │
│ │     └───────────────────────┘     │                       │   │
│ │                                   │                       │   │
│ │     ResourcesList                 │                       │   │
│ │     ┌───────────────────────┐     │                       │   │
│ │     │ 📁 Section Header     │     │                       │   │
│ │     │ Workshop Materials    │     │                       │   │
│ │     ├───────────────────────┤     │                       │   │
│ │     │ 📄 File.pdf  [⬇️ DL] │     │                       │   │
│ │     │ 🖼️ Image.png [⬇️ DL] │     │                       │   │
│ │     └───────────────────────┘     │                       │   │
│ │                                   │                       │   │
│ └───────────────────────────────────┴───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Non-Authenticated State

```
┌─────────────────────────────────────────────────────────────────┐
│ ContentDetailLayout                                             │
│ ┌───────────────────────────────────┬───────────────────────┐   │
│ │ ContentDetailHeader               │ ContentDetailSidebar  │   │
│ │ ContentDetailCover                │ MetaInfoCard          │   │
│ │                                   │ TopicsTags            │   │
│ │ AuthRequiredCard                  │                       │   │
│ │ ┌───────────────────────────────┐ │                       │   │
│ │ │         🔒                    │ │                       │   │
│ │ │                               │ │                       │   │
│ │ │  Sign In to Access            │ │                       │   │
│ │ │  This Workshop                │ │                       │   │
│ │ │                               │ │                       │   │
│ │ │  Create a free account...     │ │                       │   │
│ │ │                               │ │                       │   │
│ │ │  ✓ Access to content          │ │                       │   │
│ │ │  ✓ Download materials         │ │                       │   │
│ │ │  ✓ Track your progress        │ │                       │   │
│ │ │  ✓ Join the community         │ │                       │   │
│ │ │                               │ │                       │   │
│ │ │  [  Sign In to Continue  ]    │ │                       │   │
│ │ └───────────────────────────────┘ │                       │   │
│ └───────────────────────────────────┴───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Layout

```
┌─────────────────────────┐
│ ContentDetailLayout     │
│ ┌─────────────────────┐ │
│ │ ContentDetailHeader │ │
│ │ ← Back to List      │ │
│ │ 🏷️ Badge 🏷️ Badge  │ │
│ │ Large Title         │ │
│ │ Description...      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Sidebar (first)     │ │
│ │                     │ │
│ │ MetaInfoCard        │ │
│ │ 👤 Instructor       │ │
│ │ ⏰ Duration         │ │
│ │                     │ │
│ │ TopicsTags          │ │
│ │ React TypeScript    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ContentDetailCover  │ │
│ │ ┌─────────────────┐ │ │
│ │ │   Cover Image   │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Main Content        │ │
│ │ Text...             │ │
│ │ Video...            │ │
│ │ Resources...        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Component Composition Patterns

### Pattern 1: Workshop Page
```tsx
<ContentDetailLayout sidebar={<WorkshopSidebar />}>
  <ContentDetailHeader {...headerProps} />
  <ContentDetailCover {...coverProps} />
  {isAuthenticated ? (
    <>
      <SectionHeader />
      <ContentBody />
      <VideoEmbed />
      <ResourcesList />
    </>
  ) : (
    <AuthRequiredCard />
  )}
</ContentDetailLayout>
```

### Pattern 2: Course Page
```tsx
<ContentDetailLayout sidebar={<CourseSidebar />}>
  <ContentDetailHeader {...headerProps} />
  <ContentDetailCover {...coverProps} />
  <CourseProgress />              // Phase 3
  <SectionHeader />
  <ContentBody />
  <CourseCurriculum />            // Phase 3
  <ResourcesList />
</ContentDetailLayout>
```

### Pattern 3: Post Page
```tsx
<ContentDetailLayout sidebar={<PostSidebar />}>
  <ContentDetailHeader {...headerProps} />
  <PostMeta />                    // Phase 3
  <ContentDetailCover {...coverProps} />
  <ContentBody />
  <PostSharing />                 // Phase 3
</ContentDetailLayout>
```

## Sidebar Composition Patterns

### Workshop Sidebar
```tsx
<ContentDetailSidebar>
  <MetaInfoCard items={workshopDetails} />
  <WorkshopStatus workshop={workshop} />    // Phase 3
  <TopicsTags tags={tags} variant="card" />
</ContentDetailSidebar>
```

### Course Sidebar
```tsx
<ContentDetailSidebar>
  <MetaInfoCard items={courseDetails} />
  <CourseProgress progress={userProgress} /> // Phase 3
  <TopicsTags tags={tags} variant="card" />
</ContentDetailSidebar>
```

### Post Sidebar
```tsx
<ContentDetailSidebar>
  <MetaInfoCard items={postDetails} />
  <PostViews count={viewCount} />            // Phase 3
  <TopicsTags tags={categories} variant="card" />
</ContentDetailSidebar>
```

## Responsive Breakpoints

```
Mobile (< 1024px):
- Single column layout
- Sidebar shown first (order-first)
- Full width components
- Sidebar NOT sticky

Desktop (>= 1024px):
- Two column grid: [1fr_400px]
- Sidebar on right (order-last)
- Main content: flexible width
- Sidebar: 400px fixed width
- Sidebar: sticky (top-24)
- Gap: 12 (3rem / 48px)
```

## Spacing System

```
Section Spacing:
- section-spacing class (defined in styles.css)
- Vertical rhythm maintained throughout

Content Spacing:
- Between items: space-y-12 (mobile), space-y-16 (desktop)
- Card spacing: space-y-6
- Meta items: space-y-4

Container Widths:
- Layout: max-w-7xl (default)
- Cover image: max-w-4xl
- Sidebar: 400px (fixed on desktop)
```

## Color & Style Patterns

```css
/* Cards */
border: border-border
background: bg-card
shadow: shadow-md or shadow-lg
border-radius: rounded-2xl

/* Headers */
text-4xl md:text-5xl font-bold

/* Descriptions */
text-xl text-muted-foreground

/* Meta Info */
text-sm text-muted-foreground

/* Badges */
variant: secondary (for levels)
variant: destructive (for live/urgent)
variant: default (for general tags)

/* Icons */
h-4 w-4 (in meta info)
h-5 w-5 (in features/resources)
h-12 w-12 (in hero/CTA icons)
```

## Import Patterns

### Single Import
```tsx
import {
  ContentDetailLayout,
  ContentDetailHeader,
  ContentDetailCover,
  MetaInfoCard,
  AuthRequiredCard,
  ResourcesList,
  TopicsTags,
} from "@/components/content";
```

### With Types
```tsx
import type { MetaItem, Resource } from "@/components/content";
```

### Individual Imports (if needed)
```tsx
import { ContentDetailLayout } from "@/components/content/layout";
import { MetaInfoCard } from "@/components/content/blocks";
```

## Best Practices

1. **Always wrap content in ContentDetailLayout**
2. **Use ContentDetailHeader for consistent back navigation**
3. **Use ContentDetailCover instead of inline style hacks**
4. **Compose sidebar with ContentDetailSidebar**
5. **Leverage MetaInfoCard for all metadata displays**
6. **Use AuthRequiredCard for consistent auth CTAs**
7. **Keep content-specific logic in route components**
8. **Reuse components across all content types**

---

**Visual Guide Version:** 1.0
**Last Updated:** December 2024
**Status:** Complete for Phase 1 & 2
