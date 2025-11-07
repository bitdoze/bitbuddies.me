# Convex Backend Agent Instructions

This guide covers backend development with Convex, including security, authorization, and data patterns.

## Database Schema

- **Schema location**: `schema.ts`
- **Validators**: Use `v` validators from `convex/values`
- **System fields**: `_id` and `_creationTime` are auto-generated
- **Indexes**: Define indexes for all fields used in `.withIndex()` or frequently filtered

## Security Best Practices

### Always Verify Authorization

**Pattern**: Every mutation that modifies data must verify the caller's identity and role

**Implementation**: Pass `clerkId` as parameter, call `requireAdmin(ctx, clerkId)` at start of handler

```typescript
export const create = mutation({
	args: {
		clerkId: v.string(),
		// ... other args
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId);
		// ... proceed with mutation
	},
});
```

### Protected Mutations (IMPLEMENTED)

All admin mutations now require `clerkId` and verify `role=admin`:
- `workshopAttachments.ts` - create/update/remove require admin
- `mediaAssets.ts` - create/update/remove require admin
- `users.setUserRole` - requires caller to be admin

### Never Trust Client Input

- **Validate all data**: Use Convex validators (`v.*`) for all mutation arguments
- **Sanitize user content**: HTML content should be sanitized before storage/display
- **Check relationships**: Verify user owns resource before allowing modifications

## User Authentication Flow

1. User signs in via Clerk
2. `UserSyncProvider` (in `__root.tsx`) automatically syncs to Convex
3. Creates record in `users` table with Clerk ID (default role: `user`)
4. Creates associated `profiles` record
5. `useAuth()` hook provides both Clerk user and Convex user

## Admin Access Control (IMPLEMENTED)

- **Backend Authorization**: All admin mutations (create/update/delete workshops) require `role=admin` in Convex users table
- **Setup**: Use `/debug/admin-setup` to grant admin privileges to users
- **Backend Functions**:
  - `users.setUserRole()` - Set user role by Clerk ID (requires caller to be admin)
  - All workshop mutations require `clerkId` parameter for authorization
  - All workshopAttachments mutations require `clerkId` and admin verification
  - All mediaAssets mutations require `clerkId` and admin verification
  - `requireAdmin()` helper validates admin role before mutations (used across all protected mutations)

## Performance Best Practices

### Avoid N+1 Queries (IMPLEMENTED)

**Don't**: Call useQuery in map/loops for related data

**Do**: Fetch related data in backend, return as single enriched response

**Example**: Workshop queries return enriched data with `coverAsset` included

```typescript
// In convex/workshops.ts
const enriched = await Promise.all(
	workshops.map(async (workshop) => {
		let coverAsset = null;
		if (workshop.coverAssetId) {
			coverAsset = await ctx.db.get(workshop.coverAssetId);
		}
		return { ...workshop, coverAsset };
	}),
);
```

**Performance**: 10 workshops = 1 query (was 11 queries before)

### Use Proper Indexes

- **Index foreign keys**: All fields used in `.withIndex()` should have indexes
- **Index filters**: Fields used in `.filter()` benefit from indexes
- **Check schema**: `schema.ts` defines all indexes

## Data Loading Optimization (IMPLEMENTED)

- **Enriched Queries**: Workshop queries return complete data including cover assets
- **Eliminated N+1**: Single query returns workshop + coverAsset (no separate lookups)
- **Pattern**: Backend joins asset data, frontend receives enriched objects

## Image Upload & Storage

- **Storage**: Uses Convex storage (no external CDN needed)
- **Three-step upload process**:
  1. Generate upload URL via `mediaAssets.generateUploadUrl()`
  2. POST file to upload URL → receives storage ID
  3. Create `mediaAssets` record with storage ID
- **File validation**: max 10MB, images only
- **Recommended dimensions**: 1200×675 pixels (16:9 ratio)
- **Automatic URL generation** from storage ID
- **Authorization**: All upload/modify/delete operations require admin role

## TypeScript

- **Avoid `any`**: Use proper types or `unknown` with type guards
- **Type Convex responses**: Use generated types from `convex/_generated/dataModel`
- **Strict mode**: Keep TypeScript strict mode enabled

### Type Patterns and Examples

#### Using Generated Types

```typescript
import type { Doc, Id } from "./_generated/dataModel";

// Type a document from the database
const workshop: Doc<"workshops"> | null = await ctx.db.get(workshopId);

// Type an ID reference
const userId: Id<"users"> = args.userId;

// Type arrays of documents
const workshops: Doc<"workshops">[] = await ctx.db.query("workshops").collect();
```

#### Enriched Response Types

```typescript
// Define enriched types for responses that include related data
type WorkshopWithAsset = Doc<"workshops"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

export const list = query({
	args: { publishedOnly: v.boolean() },
	handler: async (ctx, args): Promise<WorkshopWithAsset[]> => {
		const workshops = await ctx.db.query("workshops").collect();

		return await Promise.all(
			workshops.map(async (workshop) => {
				let coverAsset = null;
				if (workshop.coverAssetId) {
					coverAsset = await ctx.db.get(workshop.coverAssetId);
				}
				return { ...workshop, coverAsset };
			}),
		);
	},
});
```

#### Validator Types for Reusable Args

```typescript
// Define reusable validator schemas
const workshopWriteFields = {
	title: v.string(),
	slug: v.string(),
	description: v.string(),
	level: v.union(
		v.literal("beginner"),
		v.literal("intermediate"),
		v.literal("advanced"),
	),
	tags: v.array(v.string()),
	isPublished: v.optional(v.boolean()),
};

// Use in multiple mutations
export const create = mutation({
	args: {
		...workshopWriteFields,
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId);
		// ...
	},
});

export const update = mutation({
	args: {
		...workshopWriteFields,
		workshopId: v.id("workshops"),
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId);
		// ...
	},
});
```

#### Type-Safe Query Filters

```typescript
// Use proper typing for query filters
export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args): Promise<Doc<"workshops"> | null> => {
		return await ctx.db
			.query("workshops")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();
	},
});
```

#### Context Types for Helper Functions

```typescript
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Type helper functions that work with both mutations and queries
type Ctx = MutationCtx | QueryCtx;

export const requireAdmin = async (
	ctx: Ctx,
	clerkId: string,
): Promise<Doc<"users">> => {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
		.first();

	if (!user) {
		throw new Error("User not found");
	}

	if (user.role !== "admin") {
		throw new Error("Admin access required");
	}

	return user;
};
```

#### Optional Fields and Undefined Handling

```typescript
export const update = mutation({
	args: {
		workshopId: v.id("workshops"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const workshop = await ctx.db.get(args.workshopId);
		if (!workshop) {
			throw new Error("Workshop not found");
		}

		// Build updates object with proper typing
		const updates: Partial<Doc<"workshops">> = {
			updatedAt: Date.now(),
		};

		if (args.title !== undefined) {
			updates.title = args.title;
		}
		if (args.description !== undefined) {
			updates.description = args.description;
		}

		await ctx.db.patch(args.workshopId, updates);
	},
});
```

## Utility Functions

Located in `utils.ts`:
- Slug validation helpers
- Common data transformations
- Shared validation logic

## Documentation

For detailed Convex patterns, see `docs/convex.md`
