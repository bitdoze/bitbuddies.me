/**
 * YouTube Channels - Backend functions for managing YouTube channels
 * Admin-only operations for adding/editing/removing channels to track
 */

import { v } from "convex/values"
import { internalMutation, internalQuery, mutation, query } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

/**
 * Helper function to require admin role
 */
async function requireAdmin(
	ctx: any,
	clerkId: string,
): Promise<Id<"users">> {
	const user = await ctx.db
		.query("users")
		.withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
		.unique()

	if (!user) {
		throw new Error("User not found")
	}

	if (user.role !== "admin") {
		throw new Error("Unauthorized: Admin access required")
	}

	return user._id
}

/**
 * List all YouTube channels (internal)
 * Returns all channels with stats
 */
export const listInternal = internalQuery({
	args: {
		activeOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const channels = args.activeOnly
			? await ctx.db
					.query("youtubeChannels")
					.withIndex("by_is_active", (q) => q.eq("isActive", true))
					.collect()
			: await ctx.db.query("youtubeChannels").collect()

		// Sort by name
		return channels.sort((a, b) => a.channelName.localeCompare(b.channelName))
	},
})

/**
 * List all YouTube channels (public)
 * Returns all channels with stats
 */
export const list = query({
	args: {
		activeOnly: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const channels = args.activeOnly
			? await ctx.db
					.query("youtubeChannels")
					.withIndex("by_is_active", (q) => q.eq("isActive", true))
					.collect()
			: await ctx.db.query("youtubeChannels").collect()

		// Sort by name
		return channels.sort((a, b) => a.channelName.localeCompare(b.channelName))
	},
})

/**
 * Get a single channel by ID (internal)
 */
export const getInternal = internalQuery({
	args: {
		id: v.id("youtubeChannels"),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.id)
		if (!channel) {
			throw new Error("Channel not found")
		}
		return channel
	},
})

/**
 * Get a single channel by ID (public)
 */
export const get = query({
	args: {
		id: v.id("youtubeChannels"),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.id)
		if (!channel) {
			throw new Error("Channel not found")
		}
		return channel
	},
})

/**
 * Get channel by YouTube channel ID
 */
export const getByChannelId = query({
	args: {
		channelId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("youtubeChannels")
			.withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
			.unique()
	},
})

/**
 * Get stats for admin dashboard
 */
export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const channels = await ctx.db.query("youtubeChannels").collect()
		const videos = await ctx.db.query("youtubeVideos").collect()

		const activeChannels = channels.filter((c) => c.isActive).length
		const totalVideos = videos.length

		// Calculate videos per channel
		const videosByChannel = channels.map((channel) => ({
			channelName: channel.channelName,
			videoCount: channel.videoCount,
		}))

		// Last sync info
		const lastSynced = channels
			.filter((c) => c.lastSyncedAt)
			.sort((a, b) => (b.lastSyncedAt || 0) - (a.lastSyncedAt || 0))[0]

		return {
			totalChannels: channels.length,
			activeChannels,
			totalVideos,
			videosByChannel,
			lastSyncedAt: lastSynced?.lastSyncedAt,
			lastSyncStatus: lastSynced?.lastSyncStatus,
		}
	},
})

/**
 * Create a new YouTube channel to track
 * Admin only
 */
export const create = mutation({
	args: {
		clerkId: v.string(),
		channelId: v.string(),
		channelName: v.string(),
		description: v.optional(v.string()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		// Check if channel already exists
		const existing = await ctx.db
			.query("youtubeChannels")
			.withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
			.unique()

		if (existing) {
			throw new Error("Channel already exists")
		}

		// Build URLs
		const channelUrl = `https://www.youtube.com/channel/${args.channelId}`
		const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${args.channelId}`

		const now = Date.now()

		const channelDbId = await ctx.db.insert("youtubeChannels", {
			channelId: args.channelId,
			channelName: args.channelName,
			channelUrl,
			feedUrl,
			description: args.description,
			videoCount: 0,
			isActive: args.isActive ?? true,
			createdAt: now,
			updatedAt: now,
		})

		return channelDbId
	},
})

/**
 * Update an existing YouTube channel
 * Admin only
 */
export const update = mutation({
	args: {
		clerkId: v.string(),
		id: v.id("youtubeChannels"),
		channelName: v.optional(v.string()),
		description: v.optional(v.string()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const channel = await ctx.db.get(args.id)
		if (!channel) {
			throw new Error("Channel not found")
		}

		await ctx.db.patch(args.id, {
			...(args.channelName && { channelName: args.channelName }),
			...(args.description !== undefined && { description: args.description }),
			...(args.isActive !== undefined && { isActive: args.isActive }),
			updatedAt: Date.now(),
		})

		return args.id
	},
})

/**
 * Delete a YouTube channel (and all its videos)
 * Admin only
 */
export const remove = mutation({
	args: {
		clerkId: v.string(),
		id: v.id("youtubeChannels"),
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.clerkId)

		const channel = await ctx.db.get(args.id)
		if (!channel) {
			throw new Error("Channel not found")
		}

		// Delete all videos from this channel
		const videos = await ctx.db
			.query("youtubeVideos")
			.withIndex("by_channel_ref", (q) => q.eq("channelRef", args.id))
			.collect()

		for (const video of videos) {
			await ctx.db.delete(video._id)
		}

		// Delete the channel
		await ctx.db.delete(args.id)

		return args.id
	},
})

/**
 * Update channel sync status
 * Internal function used by sync operations
 */
export const updateSyncStatus = internalMutation({
	args: {
		id: v.id("youtubeChannels"),
		status: v.union(v.literal("success"), v.literal("failed")),
		error: v.optional(v.string()),
		videoCount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.id)
		if (!channel) {
			throw new Error("Channel not found")
		}

		await ctx.db.patch(args.id, {
			lastSyncedAt: Date.now(),
			lastSyncStatus: args.status,
			...(args.error && { lastSyncError: args.error }),
			...(args.videoCount !== undefined && { videoCount: args.videoCount }),
			updatedAt: Date.now(),
		})
	},
})

/**
 * Get sync health status - monitors channels that haven't synced recently or have errors
 * Returns channels with issues for admin monitoring
 */
export const getSyncHealth = query({
	args: {},
	handler: async (ctx) => {
		const now = Date.now()
		const oneDayMs = 24 * 60 * 60 * 1000
		const threeDaysMs = 3 * 24 * 60 * 60 * 1000

		const channels = await ctx.db
			.query("youtubeChannels")
			.withIndex("by_is_active", (q) => q.eq("isActive", true))
			.collect()

		const issues: Array<{
			channelId: string
			channelName: string
			issue: string
			severity: "warning" | "error"
			lastSyncedAt?: number
			lastSyncError?: string
		}> = []

		for (const channel of channels) {
			// Check for channels that have never been synced
			if (!channel.lastSyncedAt) {
				issues.push({
					channelId: channel._id,
					channelName: channel.channelName,
					issue: "Never synced",
					severity: "error",
				})
				continue
			}

			// Check for channels with sync failures
			if (channel.lastSyncStatus === "failed") {
				issues.push({
					channelId: channel._id,
					channelName: channel.channelName,
					issue: `Sync failed: ${channel.lastSyncError || "Unknown error"}`,
					severity: "error",
					lastSyncedAt: channel.lastSyncedAt,
					lastSyncError: channel.lastSyncError,
				})
				continue
			}

			// Check for channels that haven't synced in 3 days (cron runs daily, so this is concerning)
			const timeSinceSync = now - channel.lastSyncedAt
			if (timeSinceSync > threeDaysMs) {
				issues.push({
					channelId: channel._id,
					channelName: channel.channelName,
					issue: `No sync for ${Math.floor(timeSinceSync / oneDayMs)} days`,
					severity: "error",
					lastSyncedAt: channel.lastSyncedAt,
				})
			} else if (timeSinceSync > oneDayMs * 1.5) {
				// Warning if sync is overdue by more than 12 hours
				issues.push({
					channelId: channel._id,
					channelName: channel.channelName,
					issue: `Sync overdue by ${Math.floor((timeSinceSync - oneDayMs) / (60 * 60 * 1000))} hours`,
					severity: "warning",
					lastSyncedAt: channel.lastSyncedAt,
				})
			}
		}

		return {
			totalActiveChannels: channels.length,
			healthyChannels: channels.length - issues.length,
			issues,
			lastChecked: now,
		}
	},
})

/**
 * Get detailed sync history for a specific channel
 * Useful for debugging sync issues
 */
export const getChannelSyncHistory = query({
	args: {
		channelId: v.id("youtubeChannels"),
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.channelId)
		if (!channel) {
			throw new Error("Channel not found")
		}

		// Get video count over time (most recent videos)
		const recentVideos = await ctx.db
			.query("youtubeVideos")
			.withIndex("by_channel_ref", (q) => q.eq("channelRef", args.channelId))
			.order("desc")
			.take(10)

		return {
			channel: {
				id: channel._id,
				name: channel.channelName,
				isActive: channel.isActive,
				videoCount: channel.videoCount,
			},
			syncStatus: {
				lastSyncedAt: channel.lastSyncedAt,
				lastSyncStatus: channel.lastSyncStatus,
				lastSyncError: channel.lastSyncError,
			},
			recentVideos: recentVideos.map((v) => ({
				title: v.title,
				publishedAt: v.publishedAt,
				syncedAt: v.syncedAt,
			})),
		}
	},
})
