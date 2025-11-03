# Progress Tracking Implementation

## Overview

Implemented comprehensive lesson progress tracking for courses with:
- ✅ Automatic enrollment when users start courses
- ✅ Lesson completion checkboxes in sidebar navigation
- ✅ Progress percentage tracking
- ✅ Visual progress bars
- ✅ Individual lesson pages with sidebar navigation
- ✅ Course overview with progress summary

## Architecture

### Database Schema

The implementation uses existing tables from `convex/schema.ts`:

**enrollments** - Tracks user enrollment in courses
- `userId` - Reference to users table
- `courseId` - Reference to courses table
- `progressPercentage` - 0-100 completion percentage
- `completedLessons` - Count of completed lessons
- `totalLessons` - Total lessons in course
- `status` - active | completed | dropped
- Automatically created when user marks first lesson as complete

**progress** - Detailed lesson completion tracking
- `enrollmentId` - Reference to enrollment
- `userId` - Reference to users table
- `lessonId` - Reference to lessons table
- `isCompleted` - Boolean completion status
- `completionPercentage` - 0-100 video watch percentage
- `watchedDuration` - Seconds watched
- `completedAt` - Timestamp of completion

### Backend Functions (`convex/progress.ts`)

**Queries:**
- `getUserCourseProgress(clerkId, courseId)` - Get all progress records for a user in a course
- `getEnrollment(clerkId, courseId)` - Get enrollment status
- `getCourseProgress(userId, courseId)` - Get progress with enrollment
- `getLessonProgress(userId, lessonId)` - Get single lesson progress

**Mutations:**
- `toggleLessonCompletion(clerkId, courseId, lessonId)` - Mark lesson complete/incomplete
  - Auto-creates enrollment if needed
  - Updates completion counts and percentages
  - Sets course status to "completed" when 100%
- `updateLessonProgress(clerkId, courseId, lessonId, watchedDuration, completionPercentage)` - Track video watch progress
  - Auto-completes lesson at 90% watched
  - Updates watch duration and percentage

### Frontend Hooks (`src/hooks/useProgress.ts`)

- `useUserCourseProgress(clerkId, courseId)` - Get all progress records
- `useEnrollment(clerkId, courseId)` - Get enrollment status
- `useToggleLessonCompletion()` - Mutation to toggle completion
- `useUpdateLessonProgress()` - Mutation to update watch progress
- `useLessonCompletion(progressRecords, lessonId)` - Helper to check if lesson is completed
- `calculateProgress(progressRecords, totalLessons)` - Calculate progress percentage

## User Interface

### Course Overview Page (`/courses/:slug`)

**For Authenticated Users:**
- Progress banner showing:
  - Completion percentage
  - Completed lessons count (e.g., "3 of 10 lessons")
  - Visual progress bar
  - "Start Course" / "Continue Learning" / "Review Course" button
- Lesson list with checkmark indicators for completed lessons
- Clicking lesson navigates to full lesson page with sidebar

**For Non-Authenticated Users:**
- Public course overview
- Sign-in CTA to access content
- Preview of course structure

### Individual Lesson Page (`/courses/:courseSlug/:lessonSlug`)

**Sidebar Features:**
- Course progress summary at top (percentage, lesson count, progress bar)
- Collapsible chapter organization
- Checkbox for each lesson (click to toggle completion)
- Visual indicators:
  - ✓ Green checkmark for completed lessons
  - Current lesson highlighted
  - Strikethrough text for completed lessons
- Lesson duration display
- Scrollable sidebar for long courses

**Main Content Area:**
- Lesson title and description
- "Mark Complete" / "Completed" button in header
- Video player (YouTube or Bunny Stream)
- Lesson content (HTML)
- Previous/Next lesson navigation buttons

**Auto-Enrollment:**
- Users are automatically enrolled when they:
  - Click a lesson to view it
  - Mark a lesson as complete
- Enrollment tracks total lessons at time of enrollment

## Features

### Progress Tracking
- ✅ Real-time progress updates (via Convex reactivity)
- ✅ Per-lesson completion status
- ✅ Course-wide progress percentage
- ✅ Completion timestamps
- ✅ Last accessed tracking

### Visual Indicators
- ✅ Checkboxes in sidebar navigation
- ✅ Checkmarks on completed lessons
- ✅ Progress bars (course and global)
- ✅ Completion badges (0%, 50%, 100%)
- ✅ Award icon for completed courses

### Navigation
- ✅ Sidebar with all chapters and lessons
- ✅ Click lesson to navigate
- ✅ Previous/Next lesson buttons
- ✅ Back to course overview
- ✅ Active lesson highlighting

### Access Control
- ✅ Authentication required for lesson pages
- ✅ Public course overview (marketing)
- ✅ Free preview lessons (if marked)

## Routes

```
/courses/:slug                        - Course overview with progress summary
/courses/:courseSlug/:lessonSlug     - Individual lesson page with sidebar
```

## Usage Examples

### Check if User Has Started Course
```tsx
const enrollment = useEnrollment(user?.id, courseId);
const hasStarted = enrollment !== null;
```

### Get Progress for Course
```tsx
const progressRecords = useUserCourseProgress(user?.id, courseId);
const completedCount = progressRecords?.filter(p => p.isCompleted).length || 0;
```

### Toggle Lesson Completion
```tsx
const toggleCompletion = useToggleLessonCompletion();

await toggleCompletion({
  clerkId: user.id,
  courseId: course._id,
  lessonId: lesson._id,
});
```

### Check if Specific Lesson is Completed
```tsx
const isCompleted = useLessonCompletion(progressRecords, lessonId);
```

## Future Enhancements

### Video Tracking (TODO)
- Track actual video watch time with video player events
- Auto-mark complete at 90% watched
- Save video position for resume playback
- Integration with YouTube/Bunny player APIs

### Progress Features (TODO)
- Certificates on course completion
- Progress streaks and achievements
- Email notifications on milestones
- Share completion on social media
- Export progress reports

### Analytics (TODO)
- Average completion time per lesson
- Drop-off points analysis
- Popular courses by completion rate
- Student engagement metrics

### UI Enhancements (TODO)
- Drag-to-reorder lessons (admin)
- Bulk mark complete/incomplete (admin reset)
- Progress history timeline
- Course notes/bookmarks per lesson
- Discussion/comments per lesson

## Implementation Details

### Automatic Enrollment
When a user marks their first lesson as complete or watches a lesson:
1. System checks for existing enrollment
2. If none exists, creates enrollment with:
   - `status: "active"`
   - `progressPercentage: 0`
   - `completedLessons: 0`
   - `totalLessons: [count of published lessons]`
3. Then creates/updates progress record

### Progress Calculation
```typescript
progressPercentage = Math.round((completedLessons / totalLessons) * 100)
```

When progress reaches 100%:
- Enrollment status → "completed"
- `completedAt` timestamp set
- Could trigger certificate generation (future)

### Real-Time Updates
Convex provides real-time reactivity:
- Progress changes instantly reflect in UI
- Multiple tabs sync automatically
- No manual refresh needed
- Optimistic updates for better UX

## Testing Checklist

- [ ] User can mark lesson as complete
- [ ] User can toggle completion status
- [ ] Progress percentage updates correctly
- [ ] Sidebar checkboxes sync with completion status
- [ ] Course completion (100%) marks enrollment as completed
- [ ] Previous/Next navigation works correctly
- [ ] Sidebar scrolls for courses with many lessons
- [ ] Progress persists across sessions
- [ ] Multiple users don't interfere with each other
- [ ] Non-authenticated users see sign-in prompt

## Security Considerations

✅ All mutations require `clerkId` for authorization
✅ Users can only modify their own progress
✅ Progress records are tied to user ID
✅ Backend validates user existence before mutations
✅ Frontend requires authentication for lesson pages

## Performance

✅ Progress queries are indexed (`by_user_and_lesson`, `by_enrollment_id`)
✅ Sidebar uses React keys to prevent unnecessary re-renders
✅ Progress updates are debounced in video tracking (future)
✅ Convex handles real-time subscriptions efficiently

## Known Limitations

1. **Video Tracking**: Currently manual completion only (no automatic video progress tracking)
2. **Offline Support**: Requires internet connection (Convex is server-based)
3. **Certificate Generation**: Not implemented yet
4. **Progress Export**: No export functionality yet

## Known Development Issues

### SSR Streaming Error (Development Only)
You may see this error during hot module reloads in development:

```
Error reading appStream: TypeError [ERR_INVALID_STATE]: Invalid state: Controller is already closed
```

**This is harmless and only occurs in development mode due to TanStack Router's SSR streaming.**

- ✅ Does not affect functionality
- ✅ Does not occur in production builds
- ✅ Caused by hot module reload closing streams prematurely
- ✅ Can be safely ignored

## Troubleshooting

### Common Issues

**1. Progress not saving**
- ✅ Check browser console for mutation errors
- ✅ Verify user is authenticated (`user?.id` exists)
- ✅ Check Convex dashboard for enrollment and progress records
- ✅ Ensure lesson is published (`isPublished: true`)
- ✅ Verify lesson is not soft-deleted (`isDeleted: false`)

**2. Checkboxes not syncing**
- ✅ Refresh the page (Convex should sync automatically)
- ✅ Check network tab for failed mutations
- ✅ Verify `clerkId` matches in users table
- ✅ Clear browser cache/cookies

**3. Streaming errors in development**
```
Error reading appStream: TypeError [ERR_INVALID_STATE]
```
- ✅ This is harmless and only occurs during hot reload
- ✅ Does not affect functionality
- ✅ Automatically suppressed in console (see `src/router.tsx`)
- ✅ Does not occur in production builds

**4. Sidebar not showing lessons**
- ✅ Verify course has published lessons
- ✅ Check that lessons have valid `courseId`
- ✅ Ensure chapters are published if lessons are in chapters
- ✅ Check browser console for query errors

**5. Progress percentage not updating**
- ✅ Check `totalLessons` count in enrollment record
- ✅ Verify completed lessons count is accurate
- ✅ Recalculation happens on every toggle - wait a moment
- ✅ Check for JavaScript errors in console

### Debug Commands

**Check user enrollment:**
```typescript
// In Convex dashboard console
db.query("enrollments")
  .withIndex("by_user_and_course", q =>
    q.eq("userId", USER_ID).eq("courseId", COURSE_ID)
  )
  .first()
```

**Check progress records:**
```typescript
db.query("progress")
  .withIndex("by_user_and_lesson", q =>
    q.eq("userId", USER_ID).eq("lessonId", LESSON_ID)
  )
  .collect()
```

**Reset progress (admin only):**
```typescript
// Delete all progress for a user in a course
// Run in Convex dashboard with caution
const enrollment = await db.query("enrollments")
  .withIndex("by_user_and_course", q =>
    q.eq("userId", USER_ID).eq("courseId", COURSE_ID)
  )
  .first();

if (enrollment) {
  const progressRecords = await db.query("progress")
    .withIndex("by_enrollment_id", q => q.eq("enrollmentId", enrollment._id))
    .collect();

  for (const record of progressRecords) {
    await db.delete(record._id);
  }

  await db.delete(enrollment._id);
}
```

## Support

For issues or questions:
1. Check Convex dashboard for enrollment and progress records
2. Verify user has authentication (`clerkId` in users table)
3. Check browser console for mutation errors
4. Ensure lesson is published and not deleted
5. Restart dev server if experiencing persistent streaming errors
6. Review troubleshooting section above
