/**
 * YouTube Videos - Backend functions for syncing and querying YouTube videos
 * Fetches videos from YouTube RSS feeds and stores them in the database
 */

import { v } from "convex/values"
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

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
			// Fetch RSS feed
			const response = await fetch(channel.feedUrl)
			if (!response.ok) {
				throw new Error(`Failed to fetch feed: ${response.statusText}`)
			}

			const xmlText = await response.text()

			// Parse feed
			const videos = parseYouTubeFeed(xmlText)

			// Store videos
			let newVideos = 0
			let updatedVideos = 0

			for (const video of videos) {
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

			return {
				success: true,
				channelName: channel.channelName,
				newVideos,
				updatedVideos,
				totalVideos,
			}
		} catch (error) {
			// Update channel sync status with error
			await ctx.runMutation(internal.youtubeChannels.updateSyncStatus, {
				id: args.channelDbId,
				status: "failed",
				error: error instanceof Error ? error.message : "Unknown error",
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
		channelDbId: v.id("youtubeChannels"),
	},
	handler: async (ctx, args): Promise<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }> => {
		return await ctx.runAction(internal.youtubeVideos.syncChannel, {
			channelDbId: args.channelDbId,
		}) as any
	},
})

/**
 * Public action: Manually sync all channels (for admin use)
 */
export const manualSyncAllChannels = action({
	args: {},
	handler: async (ctx): Promise<Array<{ success: boolean; channelName?: string; newVideos?: number; updatedVideos?: number; totalVideos?: number; message?: string; error?: string }>> => {
		return await ctx.runAction(internal.youtubeVideos.syncAllChannels, {}) as any
	},
})

/**
 * Internal: Remove videos older than retention window
 */
export const cleanupOldVideos = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now()
		const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
		const cutoff = now - fourteenDaysMs

		const oldVideos = await ctx.db
			.query("youtubeVideos")
			.withIndex("by_published_at", (q) => q.lt("publishedAt", cutoff))
			.collect()

		if (oldVideos.length === 0) {
			return { removed: 0 }
		}

		const removedByChannel = new Map<Id<"youtubeChannels">, number>()

		for (const video of oldVideos) {
			await ctx.db.delete(video._id)
			const current = removedByChannel.get(video.channelRef) ?? 0
			removedByChannel.set(video.channelRef, current + 1)
		}

		for (const [channelRef] of removedByChannel) {
			const remainingVideos = await ctx.db
				.query("youtubeVideos")
				.withIndex("by_channel_ref", (q) => q.eq("channelRef", channelRef))
				.collect()
			const channel = await ctx.db.get(channelRef)
			if (channel) {
				await ctx.db.patch(channelRef, {
					videoCount: remainingVideos.length,
					updatedAt: now,
				})
			}
		}

		return { removed: oldVideos.length }
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

		const results = []

		for (const channel of channels) {
			try {
				const result = await ctx.runAction(internal.youtubeVideos.syncChannel, {
					channelDbId: channel._id,
				}) as any
				results.push(result)
			} catch (error) {
				console.error(
					`Failed to sync channel ${channel.channelName}:`,
					error,
				)
				results.push({
					success: false,
					channelName: channel.channelName,
					error: error instanceof Error ? error.message : "Unknown error",
				})
			}
		}

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
