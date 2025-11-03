# Content Components Architecture

## Overview
This document outlines the reusable component architecture for Workshop, Course, and Post detail pages. The goal is to create a consistent, maintainable system that reduces code duplication and provides a unified user experience.

## Current Problems
1. **Code Duplication**: Workshops, courses, and posts have nearly identical layouts with slight variations
2. **Inconsistent Patterns**: Each page implements similar features differently
3. **Hard to Maintain**: Changes need to be replicated across multiple files
4. **Layout Issues**: Heavy gradients, oversized hero images, inconsistent spacing

## Common Patterns Across Content Types

### Shared Elements
- Back button to list page
- Header with badges, title, and description
- Cover image (needs to be contained, not full-width)
- Meta information sidebar (instructor, duration, date, tags)
- Main content with sections
- Authentication/enrollment requirements
- Resources/attachments section
- Related content suggestions

### Content-Specific Elements
- **Workshops**: Live status, video player, enrollment status, schedule
- **Courses**: Progress tracking, lesson list, curriculum accordion, enrollment
- **Posts**: View count, read time, author, comments, social sharing

## Proposed Component Structure

```
src/components/content/
├── layout/
│   ├── ContentDetailLayout.tsx      # Main layout with sidebar
│   ├── ContentDetailHeader.tsx      # Header with badges, title, description
│   ├── ContentDetailSidebar.tsx     # Sidebar meta information container
│   └── ContentDetailCover.tsx       # Contained cover image component
├── blocks/
│   ├── MetaInfoCard.tsx             # Reusable meta info display
│   ├── AuthRequiredCard.tsx         # CTA for non-authenticated users
│   ├── ResourcesList.tsx            # Downloadable resources section
│   ├── TopicsTags.tsx               # Tags/topics display
│   └── ContentRenderer.tsx          # JSON content renderer
├── workshop/
│   ├── WorkshopStatus.tsx           # Live/upcoming/past status
│   ├── WorkshopEnrollment.tsx       # Enrollment status card
│   └── WorkshopSchedule.tsx         # Schedule information
├── course/
│   ├── CourseProgress.tsx           # Progress tracking widget
│   ├── CourseCurriculum.tsx         # Lesson list/accordion
│   └── CourseEnrollment.tsx         # Enrollment CTA
└── post/
    ├── PostMeta.tsx                 # Author, date, read time
    ├── PostViews.tsx                # View counter
    └── PostSharing.tsx              # Social sharing buttons
```

## Core Components Specification

### 1. ContentDetailLayout
**Purpose**: Main layout wrapper with responsive sidebar

```typescript
interface ContentDetailLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  maxWidth?: "4xl" | "5xl" | "7xl";
  className?: string;
}
```

**Features**:
- Responsive grid layout (single column mobile, sidebar on desktop)
- Sticky sidebar on scroll
- Consistent max-width containers
- Proper spacing with `section-spacing` class

### 2. ContentDetailHeader
**Purpose**: Reusable header with consistent typography and spacing

```typescript
interface ContentDetailHeaderProps {
  title: string;
  description?: string;
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  }>;
  backLink: {
    to: string;
    label: string;
  };
  meta?: React.ReactNode; // Custom meta section
  className?: string;
}
```

**Features**:
- Back button with arrow icon
- Flexible badge system
- Large, readable title (text-4xl md:text-5xl)
- Optional description (text-xl text-muted-foreground)
- Meta information slot

### 3. ContentDetailCover
**Purpose**: Properly sized cover image container

```typescript
interface ContentDetailCoverProps {
  imageUrl?: string;
  alt: string;
  aspectRatio?: "video" | "square" | "wide";
  fallbackIcon?: React.ReactNode;
  className?: string;
}
```

**Features**:
- Contained within max-w-4xl
- Proper aspect-video ratio
- Rounded corners (rounded-2xl)
- Border and shadow (border border-border shadow-lg)
- Graceful fallback for missing images

### 4. ContentDetailSidebar
**Purpose**: Container for meta information cards

```typescript
interface ContentDetailSidebarProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}
```

**Features**:
- Sticky positioning on desktop
- Responsive (full width mobile, 400px desktop)
- Consistent card styling
- Proper spacing between cards

### 5. MetaInfoCard
**Purpose**: Reusable meta information display

```typescript
interface MetaItem {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

interface MetaInfoCardProps {
  title: string;
  items: MetaItem[];
  className?: string;
}
```

**Features**:
- Clean card with title and items
- Icon + label + value layout
- Consistent spacing and typography
- Text truncation for long values

### 6. AuthRequiredCard
**Purpose**: CTA for non-authenticated users

```typescript
interface AuthRequiredCardProps {
  title?: string;
  description?: string;
  features?: string[];
  buttonText?: string;
  onSignIn?: () => void;
}
```

**Features**:
- Eye-catching design with icon
- List of benefits/features
- Prominent CTA button
- Customizable copy

### 7. ResourcesList
**Purpose**: Display downloadable resources

```typescript
interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface ResourcesListProps {
  resources: Resource[];
  title?: string;
  description?: string;
  className?: string;
}
```

**Features**:
- SectionHeader integration
- List with download buttons
- File type and size display
- Hover states and transitions

### 8. TopicsTags
**Purpose**: Display tags/topics consistently

```typescript
interface TopicsTagsProps {
  tags: string[];
  title?: string;
  variant?: "default" | "badge" | "pill";
  className?: string;
}
```

**Features**:
- Flexible display styles
- Responsive wrapping
- Consistent spacing
- Optional title/heading

## Implementation Guidelines

### Design Principles
1. **Composition over Configuration**: Use slots/children for flexibility
2. **Progressive Enhancement**: Work without JavaScript, enhance with it
3. **Accessible by Default**: Proper ARIA labels, keyboard navigation
4. **Mobile First**: Responsive from smallest screens up
5. **Theme Aware**: Respect dark/light mode automatically

### Styling Standards
- Use Tailwind utility classes
- Follow existing design tokens from `styles.css`
- Consistent rounded corners: `rounded-2xl` for containers
- Borders: `border border-border`
- Shadows: `shadow-md` or `shadow-lg`
- Spacing: Use `section-spacing` class for sections

### TypeScript Standards
- Strict typing for all props
- Export all interfaces
- Use branded types where appropriate
- Document complex types with JSDoc

## Migration Plan

### Phase 1: Create Core Components
1. Create `src/components/content/` directory structure
2. Build and test `ContentDetailLayout`
3. Build and test `ContentDetailHeader`
4. Build and test `ContentDetailCover`
5. Build and test `ContentDetailSidebar`
6. Build and test `MetaInfoCard`

### Phase 2: Create Supporting Components
1. `AuthRequiredCard`
2. `ResourcesList`
3. `TopicsTags`
4. `ContentRenderer` (refactor existing)

### Phase 3: Create Content-Specific Components
1. Workshop components
2. Course components
3. Post components

### Phase 4: Refactor Existing Pages
1. Start with workshops (simplest)
2. Move to posts
3. Finally courses (most complex)
4. Test thoroughly at each step

### Phase 5: Polish and Optimize
1. Add loading states
2. Optimize bundle size
3. Add error boundaries
4. Performance testing
5. Accessibility audit

## Example Usage

### Workshop Detail Page
```tsx
function WorkshopPage() {
  // ... data fetching logic

  return (
    <ContentDetailLayout
      sidebar={
        <ContentDetailSidebar>
          <MetaInfoCard
            title="Workshop Details"
            items={[
              { icon: <Users />, label: "Instructor", value: workshop.instructorName },
              { icon: <Clock />, label: "Duration", value: `${workshop.duration} min` },
              { icon: <Calendar />, label: "Date", value: formatDate(workshop.startDate) },
            ]}
          />
          <WorkshopStatus workshop={workshop} />
          <TopicsTags tags={workshop.tags} title="Topics" />
        </ContentDetailSidebar>
      }
    >
      <ContentDetailHeader
        title={workshop.title}
        description={workshop.shortDescription}
        badges={[
          { label: workshop.level, variant: "secondary" },
          ...(workshop.isLive ? [{ label: "Live", variant: "destructive" }] : []),
        ]}
        backLink={{ to: "/workshops", label: "Back to Workshops" }}
      />

      <ContentDetailCover
        imageUrl={workshop.coverAsset?.url}
        alt={workshop.title}
      />

      <SectionHeader eyebrow="Overview" title="About This Workshop" />
      <p>{workshop.description}</p>

      {/* Video, content, resources, etc. */}
    </ContentDetailLayout>
  );
}
```

## Benefits

### For Developers
- **Faster Development**: Reuse components instead of duplicating code
- **Easier Maintenance**: Fix once, update everywhere
- **Better Testing**: Test components in isolation
- **Clear Patterns**: New developers understand structure quickly

### For Users
- **Consistent Experience**: Same layout across content types
- **Better Performance**: Optimized, shared code
- **Improved Accessibility**: Consistent ARIA patterns
- **Responsive Design**: Works great on all devices

### For the Project
- **Scalability**: Easy to add new content types
- **Maintainability**: Changes are localized
- **Quality**: Tested, reusable components
- **Documentation**: Self-documenting architecture

## Success Metrics
- Reduce code duplication by ~60%
- Consistent layout across all content types
- No accessibility regressions
- Build time stays under 30 seconds
- All pages pass Lighthouse audit (90+ scores)

## Next Steps
1. Review and approve this architecture
2. Create component stubs with TypeScript interfaces
3. Build core components with storybook examples
4. Test with one page (workshops)
5. Iterate based on feedback
6. Roll out to remaining pages

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Status**: Proposed - Awaiting Review
