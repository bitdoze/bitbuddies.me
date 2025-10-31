import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Helper to verify admin role
 */
async function requireAdmin(ctx: any, clerkId: string) {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
		.first()

	if (!user) {
		throw new Error("User not found")
	}

	if (user.role !== "admin") {
		throw new Error("Admin access required")
	}

	return user
}

export const listByLesson = query({
	args: {
		lessonId: v.id("lessons"),
	},
	handler: async (ctx, args) => {
		const attachments = await ctx.db
			.query("lessonAttachments")
			.withIndex("by_lesson_id", (q) => q.eq("lessonId", args.lessonId))
			.collect()

		// Enrich with asset data
		const enriched = await Promise.all(
			attachments.map(async (attachment) => {
				const asset = await ctx.db.get(attachment.assetId)
				return {
					...attachment,
					asset,
				}
			}),
		)

		// Sort by sortOrder
		return enriched.sort((a, b) => a.sortOrder - b.sortOrder)
	},
})

export const create = mutation({
	args: {
		clerkId: v.string(),
		lessonId: v.id("lessons"),
		assetId: v.id("mediaAssets"),
		displayName: v.string(),
		sortOrder: v.number(),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		// Verify lesson exists
		const lesson = await ctx.db.get(args.lessonId)
		if (!lesson || lesson.isDeleted) {
			throw new Error("Lesson not found")
		}

		// Verify asset exists
		const asset = await ctx.db.get(args.assetId)
		if (!asset) {
			throw new Error("Asset not found")
		}

		const now = Date.now()

		return ctx.db.insert("lessonAttachments", {
			lessonId: args.lessonId,
			assetId: args.assetId,
			displayName: args.displayName,
			sortOrder: args.sortOrder,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const update = mutation({
	args: {
		clerkId: v.string(),
		attachmentId: v.id("lessonAttachments"),
		displayName: v.optional(v.string()),
		sortOrder: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const attachment = await ctx.db.get(args.attachmentId)
		if (!attachment) {
			throw new Error("Attachment not found")
		}

		const now = Date.now()
		const updates: any = { updatedAt: now }

		if (args.displayName !== undefined) {
			updates.displayName = args.displayName
		}

		if (args.sortOrder !== undefined) {
			updates.sortOrder = args.sortOrder
		}

		return ctx.db.patch(args.attachmentId, updates)
	},
})

export const remove = mutation({
	args: {
		clerkId: v.string(),
		attachmentId: v.id("lessonAttachments"),
	},
	handler: async (ctx, args) => {
		// Verify admin access
		await requireAdmin(ctx, args.clerkId)

		const attachment = await ctx.db.get(args.attachmentId)
		if (!attachment) {
			throw new Error("Attachment not found")
		}

		return ctx.db.delete(args.attachmentId)
	},
})
