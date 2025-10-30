# Data Model & Entity Relationship Diagram

## Overview

This document describes the complete data model for the BitBuddies platform, including users, subscriptions, courses, lessons, workshops, posts, enrollments, and progress tracking.

## Entity Relationship Diagram

```
┌──────────────────┐
│     USERS        │
│ ================ │
│ _id (PK)        │◄──────────────────────────────┐
│ clerkId (UK)    │                                │
│ email           │                                │
│ role            │                                │
│ isActive        │                                │
│ lastLoginAt     │                                │
└────────┬─────────┘                                │
         │ 1                                        │
         │                                          │
         │ 1                                        │
    ┌────┴──────────┐                              │
    │               │                               │
    │               │                               │
┌───▼────────┐ ┌───▼──────────────┐    ┌──────────┴────────┐
│  PROFILES  │ │  SUBSCRIPTIONS   │    │  ENROLLMENTS      │
│ ========== │ │ ================ │    │ ================= │
│ _id (PK)   │ │ _id (PK)        │    │ _id (PK)          │
│ userId (FK)│ │ userId (FK)     │    │ userId (FK)       │
│ firstName  │ │ tier            │    │ contentType       │
│ lastName   │ │ status          │    │ courseId (FK)     │──┐
│ bio        │ │ stripeCustomerId│    │ workshopId (FK)   │─┐│
│ avatarUrl  │ │ startDate       │    │ status            │ ││
└────────────┘ │ endDate         │    │ progressPercentage│ ││
               └──────┬───────────┘    │ completedLessons  │ ││
                      │ 1              │ enrolledAt        │ ││
                      │                └───────────┬───────┘ ││
                      │ N                          │ 1       ││
               ┌──────▼──────────────┐             │         ││
               │ SUBSCRIPTION_HISTORY│             │ N       ││
               │ =================== │        ┌────▼──────┐  ││
               │ _id (PK)           │        │ PROGRESS  │  ││
               │ userId (FK)        │        │ ========= │  ││
               │ subscriptionId (FK)│        │ _id (PK)  │  ││
               │ event              │        │ enrollId  │  ││
               │ eventDate          │        │ userId    │  ││
               └────────────────────┘        │ lessonId  │──┐││
                                             │ isComplete│  │││
                                             │ percentage│  │││
                                             └───────────┘  │││
                                                            │││
┌───────────────────────────────────────────────────────────┘││
│                                                             ││
│  ┌──────────────────┐         ┌──────────────────┐         ││
│  │    COURSES       │         │   WORKSHOPS      │         ││
│  │ ================ │         │ ================ │◄────────┘│
│  │ _id (PK)        │         │ _id (PK)        │           │
│  │ title           │         │ title           │           │
│  │ slug (UK)       │         │ slug (UK)       │           │
│  │ description     │         │ description     │           │
│  │ imageStorageId  │         │ imageStorageId  │           │
│  │ level           │         │ content (HTML)  │           │
│  │ accessLevel     │         │ isLive          │           │
│  │ instructorId(FK)│         │ startDate       │           │
│  │ isPublished     │         │ videoProvider   │           │
│  └────────┬─────────┘         │ accessLevel     │           │
│           │ 1                 │ instructorId(FK)│           │
│           │                   └─────────────────┘           │
│           │ N                                               │
│      ┌────▼─────────┐                                       │
│      │   LESSONS    │                                       │
│      │ ============ │◄──────────────────────────────────────┘
│      │ _id (PK)    │
│      │ courseId(FK)│
│      │ title       │
│      │ slug        │
│      │ content(HTML)│
│      │ videoProvider│
│      │ videoId     │
│      │ attachments[]│
│      │ order       │
│      │ isPublished │
│      └──────────────┘
│
│
│  ┌──────────────────┐
└──►     POSTS        │
   │ ================ │
   │ _id (PK)        │
   │ title           │
   │ slug (UK)       │
   │ content (HTML)  │
   │ imageStorageId  │
   │ accessLevel     │
   │ authorId (FK)   │
   │ isPublished     │
   │ viewCount       │
   └─────────────────┘
```

## Table Definitions

### 1. Users & Authentication

#### **users**
Primary user table synced from Clerk authentication.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key (auto-generated) |
| clerkId | string | Clerk user ID (unique) |
| email | string | User email address |
| role | enum | `user` \| `admin` |
| isActive | boolean | Account active status |
| lastLoginAt | number? | Last login timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_clerk_id` (clerkId)
- `by_email` (email)
- `by_role` (role)

---

#### **profiles**
Extended user profile information.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| userId | ID | Foreign key → users |
| firstName | string? | First name |
| lastName | string? | Last name |
| displayName | string? | Public display name |
| bio | string? | User biography |
| avatarUrl | string? | Avatar image URL |
| website | string? | Personal website |
| twitter | string? | Twitter handle |
| linkedin | string? | LinkedIn profile |
| github | string? | GitHub username |
| emailNotifications | boolean | Email notification preference |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_user_id` (userId)
- `by_display_name` (displayName)

**Relationship:** 1:1 with users

---

### 2. Subscriptions

#### **subscriptions**
Current active subscriptions.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| userId | ID | Foreign key → users |
| tier | enum | `free` \| `basic` \| `premium` |
| status | enum | `active` \| `cancelled` \| `expired` \| `trial` |
| stripeCustomerId | string? | Stripe customer ID |
| stripeSubscriptionId | string? | Stripe subscription ID |
| priceId | string? | Stripe price ID |
| currency | string? | Currency code (USD, EUR, etc.) |
| amount | number? | Subscription amount |
| startDate | number | Subscription start date |
| endDate | number? | Subscription end date |
| trialEndDate | number? | Trial end date |
| cancelledAt | number? | Cancellation timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_user_id` (userId)
- `by_status` (status)
- `by_stripe_subscription_id` (stripeSubscriptionId)
- `by_tier` (tier)

**Relationship:** 1:1 with users (current subscription)

---

#### **subscriptionHistory**
Historical record of subscription changes.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| userId | ID | Foreign key → users |
| subscriptionId | ID | Foreign key → subscriptions |
| tier | enum | Subscription tier at event time |
| status | enum | Status at event time |
| event | enum | `created` \| `updated` \| `cancelled` \| `expired` \| `renewed` |
| amount | number? | Amount at event time |
| currency | string? | Currency at event time |
| eventDate | number | When event occurred |
| createdAt | number | Record creation timestamp |

**Indexes:**
- `by_user_id` (userId)
- `by_subscription_id` (subscriptionId)
- `by_event_date` (eventDate)

**Relationship:** N:1 with subscriptions

---

### 3. Courses & Lessons

#### **courses**
Main course content container.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| title | string | Course title |
| slug | string | URL-friendly slug (unique) |
| description | string | Full course description |
| shortDescription | string? | Short summary |
| imageStorageId | ID? | Convex storage ID for cover image |
| imageUrl | string? | Public URL for cover image |
| level | enum | `beginner` \| `intermediate` \| `advanced` |
| duration | number? | Total duration in minutes |
| category | string? | Course category |
| tags | string[] | Array of tags |
| accessLevel | enum | `public` \| `authenticated` \| `subscription` |
| requiredTier | enum? | `basic` \| `premium` (if subscription required) |
| isPublished | boolean | Published status |
| isFeatured | boolean | Featured on homepage |
| instructorId | ID | Foreign key → users |
| instructorName | string? | Cached instructor name |
| enrollmentCount | number | Total enrollments |
| completionCount | number | Total completions |
| isDeleted | boolean | Soft delete flag |
| deletedAt | number? | Deletion timestamp |
| publishedAt | number? | Publication timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_slug` (slug)
- `by_instructor_id` (instructorId)
- `by_published` (isPublished)
- `by_access_level` (accessLevel)
- `by_category` (category)
- `by_is_deleted` (isDeleted)
- `by_featured` (isFeatured)
- Search: `search_title` (title, filtered by isPublished, isDeleted)

**Relationship:** 1:N with lessons

---

#### **lessons**
Individual lessons within courses.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| courseId | ID | Foreign key → courses |
| title | string | Lesson title |
| slug | string | URL-friendly slug |
| description | string? | Lesson description |
| content | string? | HTML content |
| videoProvider | enum? | `youtube` \| `bunny` |
| videoId | string? | Video ID from provider |
| videoUrl | string? | Full embed URL |
| videoDuration | number? | Duration in seconds |
| attachments | object[] | Array of attachment objects |
| ├─ storageId | ID | Convex storage ID |
| ├─ filename | string | Original filename |
| ├─ filesize | number | Size in bytes |
| ├─ mimeType | string | MIME type |
| └─ url | string? | Public URL |
| order | number | Sort order within course |
| isPublished | boolean | Published status |
| isFree | boolean | Preview available without enrollment |
| isDeleted | boolean | Soft delete flag |
| deletedAt | number? | Deletion timestamp |
| publishedAt | number? | Publication timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_course_id` (courseId)
- `by_course_and_order` (courseId, order)
- `by_slug` (slug)
- `by_published` (isPublished)
- `by_is_deleted` (isDeleted)

**Relationship:** N:1 with courses

---

### 4. Workshops

#### **workshops**
Standalone workshop content (can be live or recorded).

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| title | string | Workshop title |
| slug | string | URL-friendly slug (unique) |
| description | string | Full description |
| shortDescription | string? | Short summary |
| imageStorageId | ID? | Convex storage ID for cover image |
| imageUrl | string? | Public URL for cover image |
| content | string | HTML content |
| duration | number? | Duration in minutes |
| level | enum | `beginner` \| `intermediate` \| `advanced` |
| category | string? | Workshop category |
| tags | string[] | Array of tags |
| isLive | boolean | Is this a live/scheduled event |
| startDate | number? | Event start date (for live workshops) |
| endDate | number? | Event end date |
| maxParticipants | number? | Maximum attendees |
| currentParticipants | number | Current enrollment count |
| videoProvider | enum? | `youtube` \| `bunny` (for recordings) |
| videoId | string? | Video ID from provider |
| videoUrl | string? | Full embed URL |
| accessLevel | enum | `public` \| `authenticated` \| `subscription` |
| requiredTier | enum? | `basic` \| `premium` |
| isPublished | boolean | Published status |
| isFeatured | boolean | Featured on homepage |
| instructorId | ID | Foreign key → users |
| instructorName | string? | Cached instructor name |
| enrollmentCount | number | Total enrollments |
| isDeleted | boolean | Soft delete flag |
| deletedAt | number? | Deletion timestamp |
| publishedAt | number? | Publication timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_slug` (slug)
- `by_instructor_id` (instructorId)
- `by_published` (isPublished)
- `by_access_level` (accessLevel)
- `by_category` (category)
- `by_is_deleted` (isDeleted)
- `by_featured` (isFeatured)
- `by_live` (isLive)
- `by_start_date` (startDate)
- Search: `search_title` (title, filtered by isPublished, isDeleted)

---

### 5. Posts (Blog)

#### **posts**
Blog posts with HTML content and images.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| title | string | Post title |
| slug | string | URL-friendly slug (unique) |
| excerpt | string? | Short excerpt |
| content | string | HTML content (with embedded images) |
| imageStorageId | ID? | Featured image storage ID |
| imageUrl | string? | Featured image public URL |
| category | string? | Post category |
| tags | string[] | Array of tags |
| readTime | number? | Estimated read time in minutes |
| accessLevel | enum | `public` \| `authenticated` \| `subscription` |
| requiredTier | enum? | `basic` \| `premium` |
| isPublished | boolean | Published status |
| isFeatured | boolean | Featured on homepage |
| authorId | ID | Foreign key → users |
| authorName | string? | Cached author name |
| viewCount | number | Total views |
| likeCount | number | Total likes |
| metaTitle | string? | SEO title |
| metaDescription | string? | SEO description |
| isDeleted | boolean | Soft delete flag |
| deletedAt | number? | Deletion timestamp |
| publishedAt | number? | Publication timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_slug` (slug)
- `by_author_id` (authorId)
- `by_published` (isPublished)
- `by_access_level` (accessLevel)
- `by_category` (category)
- `by_is_deleted` (isDeleted)
- `by_featured` (isFeatured)
- `by_published_at` (publishedAt)
- Search: `search_title` (title, filtered by isPublished, isDeleted)

---

### 6. Enrollments & Progress

#### **enrollments**
User enrollments in courses or workshops.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| userId | ID | Foreign key → users |
| contentType | enum | `course` \| `workshop` |
| courseId | ID? | Foreign key → courses (if contentType=course) |
| workshopId | ID? | Foreign key → workshops (if contentType=workshop) |
| status | enum | `active` \| `completed` \| `dropped` |
| progressPercentage | number | Overall progress (0-100) |
| completedLessons | number | Number of completed lessons |
| totalLessons | number | Total lessons in course |
| enrolledAt | number | Enrollment timestamp |
| completedAt | number? | Completion timestamp |
| lastAccessedAt | number? | Last accessed timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_user_id` (userId)
- `by_course_id` (courseId)
- `by_workshop_id` (workshopId)
- `by_user_and_course` (userId, courseId)
- `by_user_and_workshop` (userId, workshopId)
- `by_status` (status)
- `by_content_type` (contentType)

**Relationships:**
- N:1 with users
- N:1 with courses (optional)
- N:1 with workshops (optional)

---

#### **progress**
Detailed lesson-level progress tracking.

| Field | Type | Description |
|-------|------|-------------|
| _id | ID | Primary key |
| enrollmentId | ID | Foreign key → enrollments |
| userId | ID | Foreign key → users |
| lessonId | ID | Foreign key → lessons |
| isCompleted | boolean | Lesson completed flag |
| completionPercentage | number | Video watch percentage (0-100) |
| watchedDuration | number? | Seconds watched |
| startedAt | number | When user started lesson |
| completedAt | number? | When user completed lesson |
| lastWatchedAt | number? | Last activity timestamp |
| createdAt | number | Creation timestamp |
| updatedAt | number | Last update timestamp |

**Indexes:**
- `by_enrollment_id` (enrollmentId)
- `by_user_id` (userId)
- `by_lesson_id` (lessonId)
- `by_user_and_lesson` (userId, lessonId)
- `by_enrollment_and_lesson` (enrollmentId, lessonId)
- `by_completed` (isCompleted)

**Relationships:**
- N:1 with enrollments
- N:1 with lessons

---

## Access Control Model

### Access Levels
Content (courses, workshops, posts) can have three access levels:

1. **public**: Anyone can view (no authentication required)
2. **authenticated**: Must be logged in to view
3. **subscription**: Must have an active subscription to view

### Required Tiers
When `accessLevel` is `subscription`, content may specify a `requiredTier`:

- **basic**: Requires basic or premium subscription
- **premium**: Requires premium subscription only

### Subscription Tiers
Users can have three subscription tiers:

1. **free**: Default tier, no payment required
2. **basic**: Paid subscription (lower tier)
3. **premium**: Paid subscription (higher tier)

---

## Data Flow Patterns

### User Registration Flow
```
1. User signs up via Clerk
2. Clerk webhook creates user in `users` table
3. System creates default `profiles` entry
4. System creates `subscriptions` entry with tier='free'
```

### Course Enrollment Flow
```
1. User browses courses (filtered by access level)
2. User clicks "Enroll" on accessible course
3. System checks access (subscription status if needed)
4. System creates `enrollments` entry with contentType='course'
5. System updates course.enrollmentCount
```

### Lesson Progress Flow
```
1. User opens lesson
2. System creates/retrieves `progress` entry
3. Video player tracks watch position
4. System updates progress.watchedDuration & completionPercentage
5. When video completed, sets progress.isCompleted = true
6. System recalculates enrollment.progressPercentage
7. System updates enrollment.completedLessons count
```

### Content Publishing Flow
```
1. Admin creates content (course/workshop/post) with isPublished=false
2. Admin uploads images → stored in Convex storage
3. Admin adds lessons (for courses) with video embeds
4. Admin adds attachments → stored in Convex storage
5. Admin sets isPublished=true
6. Content becomes visible based on accessLevel
```

---

## Image & File Storage

### Images (Courses, Workshops, Posts)
- Uploaded to Convex storage
- `imageStorageId` stores the Convex storage ID
- `imageUrl` stores the public URL after processing
- Images are optional for all content types

### Lesson Videos
- **Not hosted**: Videos are embedded from YouTube or Bunny Stream
- Store provider type: `videoProvider` (`youtube` | `bunny`)
- Store video identifier: `videoId`
- Store full embed URL: `videoUrl`

### Lesson Attachments
- Uploaded to Convex storage
- Stored as array of objects in `lessons.attachments[]`
- Each attachment includes:
  - `storageId`: Reference to Convex storage
  - `filename`: Original filename
  - `filesize`: Size in bytes
  - `mimeType`: File MIME type
  - `url`: Public download URL

### Post Content Images
- Embedded in HTML content
- Uploaded to Convex storage
- Image URLs in HTML reference Convex storage URLs
- System needs to handle inline image uploads during content editing

---

## Key Design Decisions

### 1. Soft Deletes
All major content tables use soft deletes via `isDeleted` and `deletedAt` fields to preserve data integrity and allow recovery.

### 2. Denormalization
Some fields are denormalized for performance:
- `instructorName` cached in courses/workshops
- `authorName` cached in posts
- `completedLessons` and `totalLessons` cached in enrollments
- Counters like `enrollmentCount`, `viewCount`, etc.

### 3. Flexible Content Type
Enrollments use `contentType` to support both courses and workshops with a single table, avoiding duplicate structures.

### 4. Video Flexibility
Lessons support multiple video providers (YouTube, Bunny Stream) via `videoProvider` field, making it easy to add new providers.

### 5. Subscription History
Separate table for tracking subscription changes over time, enabling billing history and analytics.

### 6. Progress Granularity
Track progress at lesson level with completion percentage, enabling resume-from-position features.

---

## Query Patterns

### Common Queries

**Get user's active enrollments:**
```
enrollments.by_user_id(userId).filter(status='active')
```

**Get course with lessons:**
```
courses.by_slug(slug) + lessons.by_course_id(courseId).orderBy(order)
```

**Check user access to content:**
```
1. Get content.accessLevel
2. If 'public' → grant access
3. If 'authenticated' → check if user logged in
4. If 'subscription' → check subscriptions.by_user_id(userId).status='active' && tier >= requiredTier
```

**Get user's course progress:**
```
enrollments.by_user_and_course(userId, courseId)
+ progress.by_enrollment_id(enrollmentId)
```

**Featured content for homepage:**
```
courses.by_featured(true).by_published(true).by_is_deleted(false)
workshops.by_featured(true).by_published(true).by_is_deleted(false)
posts.by_featured(true).by_published(true).by_is_deleted(false)
```

---

## Future Enhancements

Potential additions to consider:

1. **Comments/Discussions**: Add table for user comments on lessons/posts
2. **Certificates**: Generate certificates upon course completion
3. **Quizzes/Assessments**: Add quiz tables linked to lessons
4. **Ratings/Reviews**: User reviews and ratings for courses/workshops
5. **Notifications**: System notifications table
6. **Analytics**: Detailed analytics events table
7. **Teams/Organizations**: Support for team subscriptions
8. **Coupons/Discounts**: Promotional codes and discount management
9. **Bookmarks**: User-saved content for later
10. **Notes**: User notes tied to specific lessons

---

## Validation Rules

### Content Validation
- Slugs must be unique within their content type
- Slugs must be URL-safe (lowercase, alphanumeric, hyphens)
- If `accessLevel='subscription'`, `requiredTier` should be set
- If `contentType='course'`, `courseId` must be set; if `contentType='workshop'`, `workshopId` must be set
- Video provider requires video ID/URL

### Business Rules
- Users can only enroll once per course/workshop
- Progress can only be created for enrolled users
- Only active subscriptions grant access to subscription content
- Soft-deleted content should not appear in public queries
- Unpublished content only visible to admins and instructors

---

## Schema Version

**Version:** 1.0.0
**Last Updated:** 2024
**Convex Schema:** `convex/schema.ts`
