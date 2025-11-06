/**
 * YouTube Channels Hook - Frontend hook for managing YouTube channels
 * Provides queries and mutations for channel CRUD operations
 */

import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

/**
 * Hook to list all YouTube channels
 */
export function useYoutubeChannels(options?: { activeOnly?: boolean }) {
	return useQuery(api.youtubeChannels.list, {
		activeOnly: options?.activeOnly,
	})
}

/**
 * Hook to get a single channel by ID
 */
export function useYoutubeChannel(id: Id<"youtubeChannels"> | undefined) {
	return useQuery(api.youtubeChannels.get, id ? { id } : "skip")
}

/**
 * Hook to get channel stats for admin dashboard
 */
export function useYoutubeStats() {
	return useQuery(api.youtubeChannels.getStats)
}

/**
 * Hook to create a new YouTube channel
 */
export function useCreateYoutubeChannel() {
	return useMutation(api.youtubeChannels.create)
}

/**
 * Hook to update a YouTube channel
 */
export function useUpdateYoutubeChannel() {
	return useMutation(api.youtubeChannels.update)
}

/**
 * Hook to remove a YouTube channel
 */
export function useRemoveYoutubeChannel() {
	return useMutation(api.youtubeChannels.remove)
}

/**
 * Combined hook with all channel operations
 */
export function useYoutubeChannelOperations() {
	const channels = useYoutubeChannels()
	const stats = useYoutubeStats()
	const createChannel = useCreateYoutubeChannel()
	const updateChannel = useUpdateYoutubeChannel()
	const removeChannel = useRemoveYoutubeChannel()

	return {
		channels,
		stats,
		createChannel,
		updateChannel,
		removeChannel,
	}
}
