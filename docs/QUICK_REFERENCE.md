# Data Model Quick Reference

## Table Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | Core user accounts (from Clerk) | → profiles, subscriptions, enrollments |
| `profiles` | Extended user information | ← users |
| `subscriptions` | Current subscription status | ← users, → subscriptionHistory |
| `subscriptionHistory` | Subscription change log | ← subscriptions |
| `courses` | Course containers | → lessons, ← enrollments |
| `lessons` | Course content units | ← courses, → progress |
| `workshops` | Standalone workshops | ← enrollments |
| `posts` | Blog posts | ← users (author) |
| `enrollments` | User course/workshop enrollments | ← users, courses, workshops → progress |
| `progress` | Lesson completion tracking | ← enrollments, lessons |

---

## Key Relationships

### User → Content (1:N)
```
User --instructs--> Courses
User --instructs--> Workshops
User --authors--> Posts
User --enrolls-in--> Enrollments
```

### Course → Lessons (1:N)
```
Course --contains--> Lessons (ordered by 'order' field)
```

### Enrollment → Progress (1:N)
```
Enrollment --tracks--> Progress (one per lesson)
```

### User → Subscription (1:1)
```
User --has--> Subscription (current active subscription)
Subscription --logs--> SubscriptionHistory (change events)
```

---

## Access Control Patterns

### Content Access Levels

```typescript
// 1. Public - anyone can access
accessLevel: "public"

// 2. Authenticated - must be logged in
accessLevel: "authenticated"

// 3. Subscription - must have active subscription
accessLevel: "subscription"
requiredTier: "basic" | "premium"
```

### Checking Access

```typescript
function canAccess(user, content) {
  if (content.accessLevel === "public") return true;
  if (!user) return false;
  if (content.accessLevel === "authenticated") return true;
  if (content.accessLevel === "subscription") {
    const sub = user.subscription;
    return sub.status === "active" &&
           tierMeetsRequirement(sub.tier, content.requiredTier);
  }
}
```

---

## Common Query Patterns

### Get User's Active Enrollments
```
Query: enrollments
Filter: by_user_id(userId) && status === "active"
Join: courses/workshops for full details
```

### Get Course with Lessons (Sorted)
```
Query: courses
Filter: by_slug(slug)
Join: lessons.by_course_id(courseId)
Sort: lessons by 'order' field
```

### Check Enrollment Status
```
Query: enrollments
Filter: by_user_and_course(userId, courseId)
Result: enrollment with progress percentage
```

### Get Lesson Progress
```
Query: progress
Filter: by_user_and_lesson(userId, lessonId)
Result: completion status and watch percentage
```

### Get Featured Content
```
Query: courses/workshops/posts
Filter: isFeatured === true && isPublished === true && isDeleted === false
Sort: by publishedAt (desc)
```

### Get User's Subscription
```
Query: subscriptions
Filter: by_user_id(userId)
Check: status === "active"
```

---

## Data Flow Examples

### 1. User Enrolls in Course
```
1. Check access: validate user can enroll (subscription if needed)
2. Create enrollment:
   - userId, courseId, contentType="course"
   - status="active", progressPercentage=0
   - Get totalLessons from lessons.by_course_id(courseId).length
3. Update course.enrollmentCount += 1
```

### 2. User Completes Lesson
```
1. Update progress:
   - isCompleted = true
   - completionPercentage = 100
   - completedAt = now()
2. Update enrollment:
   - completedLessons += 1
   - progressPercentage = (completedLessons / totalLessons) * 100
3. If progressPercentage === 100:
   - enrollment.status = "completed"
   - enrollment.completedAt = now()
   - course.completionCount += 1
```

### 3. User Watches Video
```
1. Create/update progress entry:
   - watchedDuration = currentTime
   - completionPercentage = (currentTime / totalDuration) * 100
   - lastWatchedAt = now()
2. If completionPercentage >= 90%:
   - Mark as completed (trigger lesson completion flow)
```

### 4. Publish Course
```
1. Ensure course has lessons
2. Set isPublished = true
3. Set publishedAt = now()
4. Content now appears in public queries based on accessLevel
```

---

## File Storage Patterns

### Images (Optional)
**Used in:** courses, workshops, posts

```typescript
// Upload flow
1. Upload to Convex storage → get storageId
2. Generate public URL
3. Store both:
   imageStorageId: Id<"_storage">
   imageUrl: string

// Access
<img src={course.imageUrl} alt={course.title} />
```

### Video Embeds (Required for Lessons)
**Used in:** lessons, workshops (optional)

```typescript
// YouTube
videoProvider: "youtube"
videoId: "dQw4w9WgXcQ"
videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"

// Bunny Stream
videoProvider: "bunny"
videoId: "abc123-video-guid"
videoUrl: "https://iframe.mediadelivery.net/embed/..."

// Frontend rendering
{lesson.videoProvider === "youtube" && (
  <iframe src={lesson.videoUrl} />
)}
{lesson.videoProvider === "bunny" && (
  <iframe src={lesson.videoUrl} />
)}
```

### Lesson Attachments (Optional)
**Used in:** lessons only

```typescript
attachments: [
  {
    storageId: Id<"_storage">,
    filename: "chapter-1-notes.pdf",
    filesize: 245678, // bytes
    mimeType: "application/pdf",
    url: "https://convex-storage-url..."
  }
]

// Download link
<a href={attachment.url} download={attachment.filename}>
  {attachment.filename} ({formatBytes(attachment.filesize)})
</a>
```

### Post Content Images (Inline)
**Used in:** posts, course/lesson content

```typescript
// Upload during WYSIWYG editing
1. User pastes/uploads image
2. Upload to Convex storage
3. Get public URL
4. Insert into HTML:
   <img src="https://convex-storage-url..." />

// Content stored as HTML
content: "<p>Here's an example:</p><img src='...' /><p>More text</p>"
```

---

## Index Usage

### Performance Tips

1. **Use indexed fields for filters**
   - `by_user_id` for user-specific queries
   - `by_published` for published content only
   - `by_slug` for single content lookup

2. **Compound indexes for complex queries**
   - `by_user_and_course` for enrollment checks
   - `by_course_and_order` for sorted lessons

3. **Search indexes**
   - `search_title` on courses/workshops/posts
   - Filter by `isPublished` and `isDeleted` in search

---

## Field Conventions

### Timestamps
- All tables have `_creationTime` (auto-generated by Convex)
- Most have `createdAt` and `updatedAt` (manually managed)
- Event-specific: `publishedAt`, `enrolledAt`, `completedAt`, `deletedAt`

### Status Fields
- `isPublished` - controls public visibility
- `isDeleted` - soft delete flag
- `isActive` - account/subscription status
- `isCompleted` - completion flag
- `isFeatured` - homepage highlight

### Counts & Stats
- `enrollmentCount` - cached count (update on enroll)
- `completionCount` - cached count (update on complete)
- `viewCount` - increment on view
- `likeCount` - increment on like
- `completedLessons` - cached in enrollment

### Foreign Keys
- Suffix with entity name: `userId`, `courseId`, `instructorId`, `authorId`
- Use Convex `Id<"table">` type

---

## Soft Delete Pattern

All major content uses soft deletes:

```typescript
// Delete
course.isDeleted = true
course.deletedAt = Date.now()

// Query (exclude deleted)
courses.filter(c => !c.isDeleted)

// Restore
course.isDeleted = false
course.deletedAt = undefined
```

---

## Denormalization Strategy

Some fields are duplicated for performance:

```typescript
// Cached names (avoid joins)
course.instructorName = instructor.displayName

// Cached counts (avoid aggregations)
course.enrollmentCount = enrollments.length

// Cached progress (avoid recalculation)
enrollment.completedLessons = progress.filter(p => p.isCompleted).length
```

**Update triggers:**
- When instructor updates profile → update all their courses
- When user enrolls → increment course.enrollmentCount
- When lesson completed → update enrollment.completedLessons

---

## Validation Rules

### Slugs
- Must be unique per content type
- Format: lowercase, alphanumeric, hyphens only
- No special characters: `/^\[a-z0-9\]+(?:-\[a-z0-9\]+)*$/`

### Enrollments
- User cannot enroll twice in same course
- Must check access level before enrolling
- One enrollment per user per course/workshop

### Progress
- One progress entry per user per lesson
- Progress percentage: 0-100
- Cannot mark lesson complete without enrollment

### Subscriptions
- One active subscription per user
- Cannot access subscription content without active subscription
- Tier hierarchy: free < basic < premium

---

## Admin vs User Access

### Admin Capabilities
```typescript
if (user.role === "admin") {
  // Can see all content (including unpublished, deleted)
  // Can create/edit/delete any content
  // Can manage users and subscriptions
  // Can view analytics
}
```

### User Capabilities
```typescript
if (user.role === "user") {
  // Can only see published, non-deleted content
  // Can enroll in accessible content
  // Can track own progress
  // Can edit own profile
}
```

---

## Migration Notes

When modifying schema:

1. **Adding fields**: Use optional (`v.optional()`) for backwards compatibility
2. **Removing fields**: Soft deprecate first, then remove
3. **Changing types**: Create new field, migrate data, remove old field
4. **Adding tables**: No migration needed
5. **Renaming**: Create new, migrate, remove old (can't rename in Convex)

---

## Quick Type Reference

```typescript
// Access a user's enrollments
const enrollments = await ctx.db
  .query("enrollments")
  .withIndex("by_user_id", q => q.eq("userId", userId))
  .filter(q => q.eq(q.field("status"), "active"))
  .collect();

// Get course with lessons
const course = await ctx.db
  .query("courses")
  .withIndex("by_slug", q => q.eq("slug", slug))
  .first();

const lessons = await ctx.db
  .query("lessons")
  .withIndex("by_course_id", q => q.eq("courseId", course._id))
  .filter(q => q.eq(q.field("isPublished"), true))
  .collect();

// Check user subscription
const subscription = await ctx.db
  .query("subscriptions")
  .withIndex("by_user_id", q => q.eq("userId", userId))
  .first();

const hasAccess = subscription?.status === "active" &&
                  subscription?.tier !== "free";
```
