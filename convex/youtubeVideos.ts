/**
 * YouTube Videos - Backend functions for syncing and querying YouTube videos
 * Fetches videos from YouTube RSS feeds and stores them in the database
 */

import { v } from "convex/values"
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

/**
 * Helper function to require admin role (for mutations/queries)
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
 * Helper function to require admin role (for actions)
 */
async function requireAdminAction(
	ctx: any,
	clerkId: string,
): Promise<Id<"users">> {
	const user = await ctx.runQuery(internal.youtubeVideos.getUserByClerkId, {
		clerkId,
	}) as any

	if (!user) {
		throw new Error("User not found")
	}

	if (user.role !== "admin") {
		throw new Error("Unauthorized: Admin access required")
	}

	return user._id
}

/**
 * List videos with filtering and pagination
 */
export const list = query({
	args: {
		channelId: v.optional(v.string()), // Filter by channel ID
		channelRef: v.optional(v.id("youtubeChannels")),
		limit: v.optional(v.number()),
		cursor: v.optional(v.number()), // Offset for pagination
		publishedAfter: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit || 12
		const cursor = args.cursor || 0
		const publishedAfter = args.publishedAfter

		// Filter by channel if specified
		const allVideos = args.channelRef
			? await ctx.db
					.query("youtubeVideos")
					.withIndex("by_channel_ref", (q) => q.eq("channelRef", args.channelRef!))
					.collect()
			: args.channelId
				? await ctx.db
						.query("youtubeVideos")
						.withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId as string))
						.collect()
				: await ctx.db.query("youtubeVideos").collect()

		// Filter by published date if requested
		const filteredVideos = publishedAfter
			? allVideos.filter((video) => video.publishedAt >= publishedAfter)
			: allVideos

		// Sort by published date descending (newest first)
		const sortedVideos = filteredVideos.sort(
			(a, b) => b.publishedAt - a.publishedAt,
		)

		// Paginate
		const videos = sortedVideos.slice(cursor, cursor + limit)
		const hasMore = sortedVideos.length > cursor + limit

		return {
			videos,
			hasMore,
			nextCursor: hasMore ? cursor + limit : null,
		}
	},
})

/**
 * Get all unique channels that have videos
 */
export const getChannelList = query({
	args: {},
	handler: async (ctx) => {
		const channels = await ctx.db.query("youtubeChannels").collect()

		// Only return active channels with videos
		return channels
			.filter((c) => c.isActive && c.videoCount > 0)
			.map((c) => ({
				id: c._id,
				channelId: c.channelId,
				channelName: c.channelName,
				videoCount: c.videoCount,
			}))
			.sort((a, b) => a.channelName.localeCompare(b.channelName))
	},
})

/**
 * Get a single video by ID
 */
export const get = query({
	args: {
		id: v.id("youtubeVideos"),
	},
	handler: async (ctx, args) => {
		const video = await ctx.db.get(args.id)
		if (!video) {
			throw new Error("Video not found")
		}
		return video
	},
})

/**
 * Parse YouTube RSS feed XML
 * Helper function to extract video data from XML
 */
function parseYouTubeFeed(xmlText: string) {
	const videos: Array<{
		videoId: string
		channelId: string
		channelName: string
		title: string
		description: string
		thumbnailUrl: string
		videoUrl: string
		views: number
		publishedAt: Date
		updatedAt: Date
	}> = []

	// Extract channel info
	const channelIdMatch = xmlText.match(
		/<yt:channelId>([^<]+)<\/yt:channelId>/,
	)
	const channelNameMatch = xmlText.match(
		/<author>\s*<name>([^<]+)<\/name>/,
	)

	const channelId = channelIdMatch?.[1] || ""
	const channelName = channelNameMatch?.[1] || ""

	// Extract all entries
	const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
	let entryMatch

	while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
		const entry = entryMatch[1]

		// Extract video details
		const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
		const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
		const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
		const updatedMatch = entry.match(/<updated>([^<]+)<\/updated>/)
		const thumbnailMatch = entry.match(
			/<media:thumbnail url="([^"]+)"/,
		)
		const descriptionMatch = entry.match(
			/<media:description>([^<]*)<\/media:description>/,
		)
		const viewsMatch = entry.match(/<media:statistics views="([^"]+)"/)

		if (videoIdMatch && titleMatch) {
			const videoId = videoIdMatch[1]
			const title = titleMatch[1]
			const published = publishedMatch?.[1]
				? new Date(publishedMatch[1])
				: new Date()
			const updated = updatedMatch?.[1]
				? new Date(updatedMatch[1])
				: new Date()
			const thumbnailUrl = thumbnailMatch?.[1] || ""
			const description = descriptionMatch?.[1] || ""
			const views = viewsMatch?.[1] ? Number.parseInt(viewsMatch[1], 10) : 0
			const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

			videos.push({
				videoId,
				channelId,
				channelName,
				title,
				description,
				thumbnailUrl,
				videoUrl,
				views,
				publishedAt: published,
				updatedAt: updated,
			})
		}
	}

	return videos
}

/**
 * Sync videos from a single YouTube channel
 * This is an action because it fetches external data
 */
export const syncChannel = internalAction({
	args: {
		channelDbId: v.id("youtubeChannels"),
	},
	handler: async (ctx, args): Promise<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }> => {
		// Get channel info
		const channel = await ctx.runQuery(internal.youtubeChannels.getInternal, {
			id: args.channelDbId,
		}) as any

		if (!channel) {
			throw new Error("Channel not found")
		}

		if (!channel.isActive) {
			console.log(`Channel ${channel.channelName} is not active, skipping`)
			return { success: false, message: "Channel is not active" }
		}

		try {
			console.log(`Starting sync for channel: ${channel.channelName} (${channel.channelId})`)

			// Fetch RSS feed
			const response = await fetch(channel.feedUrl)
			if (!response.ok) {
				throw new Error(`Failed to fetch feed: ${response.statusText}`)
			}

			const xmlText = await response.text()

			// Parse feed
			const videos = parseYouTubeFeed(xmlText)
			console.log(`Parsed ${videos.length} videos from feed for ${channel.channelName}`)

			// Deduplicate videos by videoId (in case feed has duplicates)
			const uniqueVideos = Array.from(
				new Map(videos.map((v) => [v.videoId, v])).values(),
			)

			if (uniqueVideos.length < videos.length) {
				console.log(
					`Removed ${videos.length - uniqueVideos.length} duplicate videos from feed`,
				)
			}

			// Store videos
			let newVideos = 0
			let updatedVideos = 0

			for (const video of uniqueVideos) {
				// Check if video already exists
				const existing = await ctx.runQuery(
					internal.youtubeVideos.getByVideoId,
					{
						videoId: video.videoId,
					},
				)

				const now = Date.now()

				if (existing) {
					// Update existing video
					await ctx.runMutation(internal.youtubeVideos.updateVideo, {
						id: existing._id,
						title: video.title,
						description: video.description,
						thumbnailUrl: video.thumbnailUrl,
						views: video.views,
						updatedAt: video.updatedAt.getTime(),
						syncedAt: now,
					})
					updatedVideos++
				} else {
					// Insert new video
					await ctx.runMutation(internal.youtubeVideos.insertVideo, {
						videoId: video.videoId,
						channelId: video.channelId,
						channelRef: args.channelDbId,
						channelName: video.channelName,
						title: video.title,
						description: video.description,
						thumbnailUrl: video.thumbnailUrl,
						videoUrl: video.videoUrl,
						views: video.views,
						publishedAt: video.publishedAt.getTime(),
						updatedAt: video.updatedAt.getTime(),
						syncedAt: now,
					})
					newVideos++
				}
			}

			// Update channel sync status
			const totalVideos = await ctx.runQuery(
				internal.youtubeVideos.countByChannel,
				{
					channelDbId: args.channelDbId,
				},
			) as number

			await ctx.runMutation(internal.youtubeChannels.updateSyncStatus, {
				id: args.channelDbId,
				status: "success",
				videoCount: totalVideos,
			})

			console.log(
				`✓ Sync completed for ${channel.channelName}: ` +
				`${newVideos} new, ${updatedVideos} updated, ${totalVideos} total videos`
			)

			return {
				success: true,
				channelName: channel.channelName,
				newVideos,
				updatedVideos,
				totalVideos,
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			console.error(`✗ Sync failed for ${channel.channelName}: ${errorMessage}`)

			// Update channel sync status with error
			await ctx.runMutation(internal.youtubeChannels.updateSyncStatus, {
				id: args.channelDbId,
				status: "failed",
				error: errorMessage,
			})

			throw error
		}
	},
})

/**
 * Public action: Manually sync a channel (for admin use)
 */
export const manualSyncChannel = action({
	args: {
		clerkId: v.string(),
		channelDbId: v.id("youtubeChannels"),
	},
	handler: async (ctx, args): Promise<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }> => {
		// Verify admin authorization
		await requireAdminAction(ctx, args.clerkId)

		return await ctx.runAction(internal.youtubeVideos.syncChannel, {
			channelDbId: args.channelDbId,
		}) as any
	},
})

/**
 * Public action: Manually sync all channels (for admin use)
 */
export const manualSyncAllChannels = action({
	args: {
		clerkId: v.string(),
	},
	handler: async (ctx, args): Promise<Array<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }>> => {
		// Verify admin authorization
		await requireAdminAction(ctx, args.clerkId)

		return await ctx.runAction(internal.youtubeVideos.syncAllChannels, {}) as any
	},
})

/**
 * Batched cleanup wrapper - schedules continuation if more videos need cleanup
 * This is called by the daily cron job
 */
export const cleanupOldVideosBatched = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Directly perform the first batch of cleanup
		const result = await cleanupOldVideosInternal(ctx, { batchSize: 100 })

		return {
			message: "Cleanup started",
			...result,
		}
	},
})

/**
 * Internal helper function for cleanup logic
 */
async function cleanupOldVideosInternal(
	ctx: any,
	args: { batchSize?: number },
): Promise<{ removed: number; hasMore: boolean; channelsAffected: number }> {
		const now = Date.now()
		const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
		const cutoff = now - fourteenDaysMs
		const maxBatchSize = args.batchSize ?? 100

		// Query old videos with limit to avoid loading too many at once
		const oldVideos = await ctx.db
			.query("youtubeVideos")
			.withIndex("by_published_at", (q: any) => q.lt("publishedAt", cutoff))
			.take(maxBatchSize)

		if (oldVideos.length === 0) {
			return {
				removed: 0,
				hasMore: false,
				channelsAffected: 0,
			}
		}

		// Track removals per channel for efficient count updates
		const removedByChannel = new Map<Id<"youtubeChannels">, number>()

		// Delete videos
		for (const video of oldVideos) {
			await ctx.db.delete(video._id)
			const current = removedByChannel.get(video.channelRef) ?? 0
			removedByChannel.set(video.channelRef, current + 1)
		}

		// Update channel video counts efficiently (decrement instead of recount)
		for (const [channelRef, removedCount] of removedByChannel) {
			const channel = await ctx.db.get(channelRef)
			if (channel) {
				const newCount = Math.max(0, channel.videoCount - removedCount)
				await ctx.db.patch(channelRef, {
					videoCount: newCount,
					updatedAt: now,
				})
			}
		}

		// Check if there are more videos to clean up
		const hasMore = oldVideos.length === maxBatchSize

		// Log warning if we're removing many videos
		if (oldVideos.length > 50) {
			console.warn(
				`Cleanup removed ${oldVideos.length} videos older than 14 days. ` +
				`Channels affected: ${removedByChannel.size}. ` +
				`${hasMore ? "More videos to clean up in next run." : "Cleanup complete."}`,
			)
		}

		// If there are more videos to cleanup, schedule another batch
		if (hasMore) {
			console.log(
				`Scheduling another cleanup batch. ${oldVideos.length} videos removed in this batch.`,
			)
			await ctx.scheduler.runAfter(
				1000, // Wait 1 second between batches
				internal.youtubeVideos.cleanupOldVideos,
				{ batchSize: maxBatchSize },
			)
		}

		return {
			removed: oldVideos.length,
			hasMore,
			channelsAffected: removedByChannel.size,
		}
}

/**
 * Internal: Remove videos older than retention window
 * Uses batching to avoid mutation timeouts with large datasets
 */
export const cleanupOldVideos = internalMutation({
	args: {
		batchSize: v.optional(v.number()), // Max videos to delete per run (default: 100)
	},
	handler: async (ctx, args) => {
		return await cleanupOldVideosInternal(ctx, args)
	},
})

/**
 * Sync all active channels
 * This is called by the daily cron job
 */
export const syncAllChannels = internalAction({
	args: {},
	handler: async (ctx): Promise<Array<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }>> => {
		// Get all active channels
		const channels = await ctx.runQuery(internal.youtubeChannels.listInternal, {
			activeOnly: true,
		}) as any[]

		console.log(`Starting daily sync for ${channels.length} active channels`)
		const startTime = Date.now()

		const results = []
		let successCount = 0
		let failureCount = 0
		let totalNewVideos = 0
		let totalUpdatedVideos = 0

		for (const channel of channels) {
			try {
				const result = await ctx.runAction(internal.youtubeVideos.syncChannel, {
					channelDbId: channel._id,
				}) as any
				results.push(result)
				successCount++
				totalNewVideos += result.newVideos || 0
				totalUpdatedVideos += result.updatedVideos || 0
			} catch (error) {
				console.error(
					`Failed to sync channel ${channel.channelName}:`,
					error,
				)
				failureCount++
				results.push({
					success: false,
					channelName: channel.channelName,
					error: error instanceof Error ? error.message : "Unknown error",
				})
			}
		}

		const duration = Date.now() - startTime
		console.log(
			`Daily sync completed in ${Math.round(duration / 1000)}s: ` +
			`${successCount} succeeded, ${failureCount} failed. ` +
			`Total: ${totalNewVideos} new videos, ${totalUpdatedVideos} updated.`
		)

		return results
	},
})

/**
 * Internal: Get video by YouTube video ID
 */
export const getByVideoId = internalQuery({
	args: {
		videoId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("youtubeVideos")
			.withIndex("by_video_id", (q) => q.eq("videoId", args.videoId))
			.unique()
	},
})

/**
 * Internal: Insert a new video
 */
export const insertVideo = internalMutation({
	args: {
		videoId: v.string(),
		channelId: v.string(),
		channelRef: v.id("youtubeChannels"),
		channelName: v.string(),
		title: v.string(),
		description: v.string(),
		thumbnailUrl: v.string(),
		videoUrl: v.string(),
		views: v.number(),
		publishedAt: v.number(),
		updatedAt: v.number(),
		syncedAt: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now()

		return await ctx.db.insert("youtubeVideos", {
			videoId: args.videoId,
			channelId: args.channelId,
			channelRef: args.channelRef,
			channelName: args.channelName,
			title: args.title,
			description: args.description,
			thumbnailUrl: args.thumbnailUrl,
			videoUrl: args.videoUrl,
			views: args.views,
			publishedAt: args.publishedAt,
			updatedAt: args.updatedAt,
			syncedAt: args.syncedAt,
			createdAt: now,
		})
	},
})

/**
 * Internal: Update an existing video
 */
export const updateVideo = internalMutation({
	args: {
		id: v.id("youtubeVideos"),
		title: v.string(),
		description: v.string(),
		thumbnailUrl: v.string(),
		views: v.number(),
		updatedAt: v.number(),
		syncedAt: v.number(),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args

		await ctx.db.patch(id, updates)
	},
})

/**
 * Internal: Count videos for a channel
 */
export const countByChannel = internalQuery({
	args: {
		channelDbId: v.id("youtubeChannels"),
	},
	handler: async (ctx, args) => {
		const videos = await ctx.db
			.query("youtubeVideos")
			.withIndex("by_channel_ref", (q) => q.eq("channelRef", args.channelDbId))
			.collect()

		return videos.length
	},
})

/**
 * Internal: Get user by Clerk ID (for action authorization)
 */
export const getUserByClerkId = internalQuery({
	args: {
		clerkId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
			.unique()
	},
})

/**
 * Manual cleanup action for admins
 * Allows admins to manually trigger cleanup with custom parameters
 */
export const manualCleanupOldVideos = action({
	args: {
		clerkId: v.string(),
		daysOld: v.optional(v.number()), // Custom retention period (default: 14 days)
		dryRun: v.optional(v.boolean()), // Preview what would be deleted without deleting
	},
	handler: async (ctx, args) => {
		// Verify admin authorization
		await requireAdminAction(ctx, args.clerkId)

		const daysOld = args.daysOld ?? 14
		const dryRun = args.dryRun ?? false

		// Safety check: don't allow less than 7 days
		if (daysOld < 7) {
			throw new Error("Safety limit: Cannot delete videos newer than 7 days old")
		}

		const now = Date.now()
		const retentionMs = daysOld * 24 * 60 * 60 * 1000
		const cutoff = now - retentionMs

		// Query videos that would be deleted
		const oldVideos = await ctx.runQuery(
			internal.youtubeVideos.getVideosByPublishedDate,
			{ cutoff, limit: 500 }, // Safety limit: max 500 videos per manual cleanup
		) as any[]

		if (oldVideos.length === 0) {
			return {
				removed: 0,
				dryRun,
				message: `No videos found older than ${daysOld} days`,
			}
		}

		// Count by channel for reporting
		const videosByChannel = new Map<string, number>()
		for (const video of oldVideos) {
			const count = videosByChannel.get(video.channelName) ?? 0
			videosByChannel.set(video.channelName, count + 1)
		}

		if (dryRun) {
			// Preview mode - don't delete anything
			return {
				removed: 0,
				dryRun: true,
				wouldRemove: oldVideos.length,
				affectedChannels: Array.from(videosByChannel.entries()).map(
					([channelName, count]) => ({
						channelName,
						videoCount: count,
					}),
				),
				oldestVideo: oldVideos[oldVideos.length - 1]?.publishedAt,
				message: `Would delete ${oldVideos.length} videos older than ${daysOld} days`,
			}
		}

		// Actually delete videos
		let removed = 0
		for (const video of oldVideos) {
			await ctx.runMutation(internal.youtubeVideos.deleteVideo, {
				id: video._id,
			})
			removed++
		}

		// Update channel counts
		for (const [channelName, count] of videosByChannel) {
			console.log(`Cleaned up ${count} videos from channel: ${channelName}`)
		}

		return {
			removed,
			dryRun: false,
			affectedChannels: Array.from(videosByChannel.entries()).map(
				([channelName, count]) => ({
					channelName,
					videoCount: count,
				}),
			),
			message: `Successfully deleted ${removed} videos older than ${daysOld} days`,
		}
	},
})

/**
 * Internal: Get videos by published date for cleanup operations
 */
export const getVideosByPublishedDate = internalQuery({
	args: {
		cutoff: v.number(),
		limit: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("youtubeVideos")
			.withIndex("by_published_at", (q) => q.lt("publishedAt", args.cutoff))
			.take(args.limit)
	},
})

/**
 * Internal: Delete a single video
 */
export const deleteVideo = internalMutation({
	args: {
		id: v.id("youtubeVideos"),
	},
	handler: async (ctx, args) => {
		const video = await ctx.db.get(args.id)
		if (!video) {
			return
		}

		// Delete the video
		await ctx.db.delete(args.id)

		// Update channel video count
		const channel = await ctx.db.get(video.channelRef)
		if (channel) {
			await ctx.db.patch(video.channelRef, {
				videoCount: Math.max(0, channel.videoCount - 1),
				updatedAt: Date.now(),
			})
		}
	},
})
