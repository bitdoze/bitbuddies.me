# GPT-5 Review Recommendations

## Critical

### Harden role updates in `convex/users.ts`
- **Issue:** `updateRole` patches any user without validating the caller, enabling trivial privilege escalation.
- **Fix:** Require the caller’s Clerk ID, fetch the caller via `by_clerk_id`, and enforce `role === "admin"` before writing.

### Lock down contact message admin APIs (`convex/contactMessages.ts`)
- **Issue:** `list`, `getById`, `updateStatus`, and `remove` expose all messages with no auth.
- **Fix:** Add a shared `requireAdmin` guard (or equivalent Convex auth) and require the caller’s identity before any admin action.

### Enforce ownership checks for enrollments/progress (`convex/enrollments.ts`, `convex/progress.ts`)
- **Issue:** Mutations accept arbitrary `userId`/`enrollmentId` values without ensuring they belong to the caller.
- **Fix:** Look up the caller by Clerk ID and ensure the targeted enrollment/progress record references that user before mutating.

### Protect subscription mutations (`convex/subscriptions.ts`)
- **Issue:** `upsert` and `cancel` are publicly callable, allowing forged subscription states.
- **Fix:** Gate these behind server-side auth (admin guard or signed webhook secrets) and remove direct client exposure.

### Restrict media upload endpoints (`convex/mediaAssets.ts`)
- **Issue:** `generateUploadUrl`, `list`, and `getById` run without auth, enabling spam uploads and asset enumeration.
- **Fix:** Require authenticated callers for uploads and restrict listing/metadata to admins (or asset owners).

## Important

### Correct progress lookups (`convex/progress.ts`)
- **Issue:** `getCourseProgress`/`getLessonProgress` accept `userId: Id<"users">` but query `by_clerk_id`, so they always miss.
- **Fix:** Change args to `clerkId: v.string()` (or query by document ID) and update call sites accordingly.

### Push post filtering into Convex (`convex/posts.ts`)
- **Issue:** `list` loads every post into memory before filtering/sorting, making `limit` ineffective at scale.
- **Fix:** Use indexed filters (`withIndex`, `filter`, `order`) and only hydrate cover assets after slicing.

### Deduplicate admin guards
- **Issue:** Several Convex modules declare their own `requireAdmin` with `any` typing.
- **Fix:** Centralize a typed helper in `convex/utils.ts` (returning the admin user) to avoid drift and improve type safety.

## Minor

### Fix participant display in `src/routes/admin.workshops.index.tsx`
- **Issue:** The participants cell renders the literal string `" / ${workshop.maxParticipants}"`.
- **Fix:** Switch to a template literal: ``{workshop.maxParticipants && ` / ${workshop.maxParticipants}`}``.

### Guard debugging queries (`convex/users.ts`)
- **Issue:** `listAll` is meant for debugging but ships without auth.
- **Fix:** Remove it from production bundles or protect it with the same admin guard and a development-only flag.
