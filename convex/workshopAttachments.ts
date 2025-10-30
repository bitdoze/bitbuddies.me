import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
	args: {
		workshopId: v.id("workshops"),
		assetId: v.id("mediaAssets"),
		displayName: v.string(),
		sortOrder: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now()

		return ctx.db.insert("workshopAttachments", {
			workshopId: args.workshopId,
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
		attachmentId: v.id("workshopAttachments"),
		displayName: v.optional(v.string()),
		sortOrder: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const attachment = await ctx.db.get(args.attachmentId)
		if (!attachment) {
			throw new Error("Attachment not found")
		}

		const now = Date.now()
		const updates: Partial<typeof attachment> = { updatedAt: now }

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
		attachmentId: v.id("workshopAttachments"),
	},
	handler: async (ctx, args) => {
		const attachment = await ctx.db.get(args.attachmentId)
		if (!attachment) {
			throw new Error("Attachment not found")
		}

		return ctx.db.delete(args.attachmentId)
	},
})

export const listByWorkshop = query({
	args: {
		workshopId: v.id("workshops"),
	},
	handler: async (ctx, args) => {
		const attachments = await ctx.db
			.query("workshopAttachments")
			.withIndex("by_workshop_id", (q) =>
				q.eq("workshopId", args.workshopId),
			)
			.order("asc")
			.collect()

		// Get asset details for each attachment
		const attachmentsWithAssets = await Promise.all(
			attachments.map(async (attachment) => {
				const asset = await ctx.db.get(attachment.assetId)
				return {
					...attachment,
					asset,
				}
			}),
		)

		// Sort by sortOrder
		return attachmentsWithAssets.sort((a, b) => a.sortOrder - b.sortOrder)
	},
})
