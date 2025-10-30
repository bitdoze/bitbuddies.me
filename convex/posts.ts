import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { ensureUniqueSlug } from "./utils"

const writeFields = {
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
	requiredTier: v.optional(
		v.union(v.literal("basic"), v.literal("premium")),
	),
	isPublished: v.optional(v.boolean()),
	isFeatured: v.optional(v.boolean()),
	authorId: v.id("users"),
	authorName: v.optional(v.string()),
	metaTitle: v.optional(v.string()),
	metaDescription: v.optional(v.string()),
	publishedAt: v.optional(v.number()),
}

export const create = mutation({
	args: writeFields,
	handler: async (ctx, args) => {
		await ensureUniqueSlug(ctx, "posts", args.slug)

		const now = Date.now()
		const isPublished = args.isPublished ?? false
		const isFeatured = args.isFeatured ?? false

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
			publishedAt: isPublished
				? args.publishedAt ?? now
				: undefined,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
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
		const post = await ctx.db.get(args.postId)
		if (!post) {
			throw new Error("Post not found")
		}

		if (args.patch.slug) {
			await ensureUniqueSlug(ctx, "posts", args.patch.slug, args.postId)
		}

		const now = Date.now()
		const next: Partial<typeof post> = { updatedAt: now }

		for (const [key, value] of Object.entries(args.patch) as Array<
			[keyof typeof args.patch, unknown]
		>) {
			if (value !== undefined) {
				;(next as Record<string, unknown>)[key as string] = value
			}
		}

		if (
			typeof args.patch.isPublished === "boolean" &&
			args.patch.isPublished &&
			!next.publishedAt
		) {
			next.publishedAt = args.patch.publishedAt ?? now
		}

		return ctx.db.patch(args.postId, next)
	},
})

export const softDelete = mutation({
	args: {
		postId: v.id("posts"),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.postId)
		if (!post) {
			throw new Error("Post not found")
		}

		if (post.isDeleted) {
			return
		}

		return ctx.db.patch(args.postId, {
			isDeleted: true,
			deletedAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})
