import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureUniqueSlug } from "./utils";

/**
 * Helper to verify admin role
 */
async function requireAdmin(ctx: any, clerkId: string) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
		.unique();

	if (!user || user.role !== "admin") {
		throw new Error("Admin access required");
	}

	return user;
}

const writeFields = {
	clerkId: v.string(), // For authorization
	title: v.string(),
	slug: v.string(),
	excerpt: v.optional(v.string()),
	content: v.string(),
	coverAssetId: v.optional(v.id("mediaAssets")),
	category: v.optional(v.string()),
	tags: v.array(v.string()),
	readTime: v.optional(v.number()),
	accessLevel: v.union(
		v.literal("public"),
		v.literal("authenticated"),
		v.literal("subscription"),
	),
	requiredTier: v.optional(v.union(v.literal("basic"), v.literal("premium"))),
	isPublished: v.optional(v.boolean()),
	isFeatured: v.optional(v.boolean()),
	authorId: v.id("users"),
	authorName: v.optional(v.string()),
	metaTitle: v.optional(v.string()),
	metaDescription: v.optional(v.string()),
	publishedAt: v.optional(v.number()),
};

export const create = mutation({
	args: writeFields,
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId);

		await ensureUniqueSlug(ctx, "posts", args.slug);

		const now = Date.now();
		const isPublished = args.isPublished ?? false;
		const isFeatured = args.isFeatured ?? false;

		return ctx.db.insert("posts", {
			title: args.title,
			slug: args.slug,
			excerpt: args.excerpt,
			content: args.content,
			coverAssetId: args.coverAssetId,
			category: args.category,
			tags: args.tags,
			readTime: args.readTime,
			accessLevel: args.accessLevel,
			requiredTier: args.requiredTier,
			isPublished,
			isFeatured,
			authorId: args.authorId,
			authorName: args.authorName,
			viewCount: 0,
			likeCount: 0,
			metaTitle: args.metaTitle,
			metaDescription: args.metaDescription,
			isDeleted: false,
			deletedAt: undefined,
			publishedAt: isPublished ? args.publishedAt ?? now : undefined,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		clerkId: v.string(),
		postId: v.id("posts"),
		patch: v.object({
			title: v.optional(v.string()),
			slug: v.optional(v.string()),
			excerpt: v.optional(v.string()),
			content: v.optional(v.string()),
			coverAssetId: v.optional(v.id("mediaAssets")),
			category: v.optional(v.string()),
			tags: v.optional(v.array(v.string())),
			readTime: v.optional(v.number()),
			accessLevel: v.optional(
				v.union(
					v.literal("public"),
					v.literal("authenticated"),
					v.literal("subscription"),
				),
			),
			requiredTier: v.optional(
				v.union(v.literal("basic"), v.literal("premium")),
			),
			isPublished: v.optional(v.boolean()),
			isFeatured: v.optional(v.boolean()),
			authorId: v.optional(v.id("users")),
			authorName: v.optional(v.string()),
			metaTitle: v.optional(v.string()),
			metaDescription: v.optional(v.string()),
			publishedAt: v.optional(v.number()),
			deletedAt: v.optional(v.number()),
		}),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId);

		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error("Post not found");
		}

		if (args.patch.slug) {
			await ensureUniqueSlug(ctx, "posts", args.patch.slug, args.postId);
		}

		const now = Date.now();
		const next: Partial<typeof post> = { updatedAt: now };

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			if (value !== undefined) {
				(next as Record<string, unknown>)[key as string] = value;
			}
		}

		if (
			typeof args.patch.isPublished === "boolean" &&
			args.patch.isPublished &&
			!next.publishedAt
		) {
			next.publishedAt = args.patch.publishedAt ?? now;
		}

		return ctx.db.patch(args.postId, next);
	},
});

export const softDelete = mutation({
	args: {
		clerkId: v.string(),
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId);

		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error("Post not found");
		}

		if (post.isDeleted) {
			return;
		}

		return ctx.db.patch(args.postId, {
			isDeleted: true,
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

/**
 * List all posts with optional filtering
 */
export const list = query({
	args: {
		publishedOnly: v.optional(v.boolean()),
		featuredOnly: v.optional(v.boolean()),
		category: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		let query = ctx.db
			.query("posts")
			.withIndex("by_is_deleted", (q) => q.eq("isDeleted", false));

		const posts = await query.collect();

		// Apply filters
		let filtered = posts;

		if (args.publishedOnly) {
			filtered = filtered.filter((p) => p.isPublished);
		}

		if (args.featuredOnly) {
			filtered = filtered.filter((p) => p.isFeatured);
		}

		if (args.category) {
			filtered = filtered.filter((p) => p.category === args.category);
		}

		// Sort by published date (newest first) or creation date
		filtered.sort((a, b) => {
			const aDate = a.publishedAt || a.createdAt;
			const bDate = b.publishedAt || b.createdAt;
			return bDate - aDate;
		});

		// Apply limit
		if (args.limit) {
			filtered = filtered.slice(0, args.limit);
		}

		// Enrich with cover asset
		const enriched = await Promise.all(
			filtered.map(async (post) => {
				let coverAsset = null;
				if (post.coverAssetId) {
					coverAsset = await ctx.db.get(post.coverAssetId);
					if (coverAsset && coverAsset.storageId) {
						const url = await ctx.storage.getUrl(coverAsset.storageId);
						coverAsset = { ...coverAsset, url };
					}
				}
				return { ...post, coverAsset };
			}),
		);

		return enriched;
	},
});

/**
 * Get a single post by ID
 */
export const getById = query({
	args: { postId: v.id("posts") },
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId);
		if (!post || post.isDeleted) {
			return null;
		}

		let coverAsset = null;
		if (post.coverAssetId) {
			coverAsset = await ctx.db.get(post.coverAssetId);
			if (coverAsset && coverAsset.storageId) {
				const url = await ctx.storage.getUrl(coverAsset.storageId);
				coverAsset = { ...coverAsset, url };
			}
		}

		return { ...post, coverAsset };
	},
});

/**
 * Get a single post by slug
 */
export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, args) => {
		const post = await ctx.db
			.query("posts")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!post || post.isDeleted) {
			return null;
		}

		let coverAsset = null;
		if (post.coverAssetId) {
			coverAsset = await ctx.db.get(post.coverAssetId);
			if (coverAsset && coverAsset.storageId) {
				const url = await ctx.storage.getUrl(coverAsset.storageId);
				coverAsset = { ...coverAsset, url };
			}
		}

		return { ...post, coverAsset };
	},
});

/**
 * Increment view count
 */
export const incrementViewCount = mutation({
	args: { postId: v.id("posts") },
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId);
		if (!post || post.isDeleted) {
			return;
		}

		return ctx.db.patch(args.postId, {
			viewCount: post.viewCount + 1,
		});
	},
});

/**
 * Get posts by category
 */
export const getByCategory = query({
	args: {
		category: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const posts = await ctx.db
			.query("posts")
			.withIndex("by_category", (q) => q.eq("category", args.category))
			.filter((q) => q.eq(q.field("isDeleted"), false))
			.filter((q) => q.eq(q.field("isPublished"), true))
			.collect();

		// Sort by published date
		posts.sort((a, b) => {
			const aDate = a.publishedAt || a.createdAt;
			const bDate = b.publishedAt || b.createdAt;
			return bDate - aDate;
		});

		// Apply limit
		const limited = args.limit ? posts.slice(0, args.limit) : posts;

		// Enrich with cover asset
		const enriched = await Promise.all(
			limited.map(async (post) => {
				let coverAsset = null;
				if (post.coverAssetId) {
					coverAsset = await ctx.db.get(post.coverAssetId);
					if (coverAsset && coverAsset.storageId) {
						const url = await ctx.storage.getUrl(coverAsset.storageId);
						coverAsset = { ...coverAsset, url };
					}
				}
				return { ...post, coverAsset };
			}),
		);

		return enriched;
	},
});
