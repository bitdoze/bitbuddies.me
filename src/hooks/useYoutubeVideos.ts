/**
 * YouTube Videos Hook - Frontend hook for querying YouTube videos
 * Provides queries for listing videos with filtering and pagination
 */

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./useAuth";

/**
 * Hook to list YouTube videos with pagination
 */
export function useYoutubeVideos(options?: {
	channelId?: string;
	channelRef?: Id<"youtubeChannels">;
	limit?: number;
	cursor?: number;
	publishedAfter?: number;
}) {
	return useQuery(api.youtubeVideos.list, {
		channelId: options?.channelId,
		channelRef: options?.channelRef,
		limit: options?.limit,
		cursor: options?.cursor,
		publishedAfter: options?.publishedAfter,
	});
}

/**
 * Hook to get a single video by ID
 */
export function useYoutubeVideo(id: Id<"youtubeVideos"> | undefined) {
	return useQuery(api.youtubeVideos.get, id ? { id } : "skip");
}

/**
 * Hook to get list of channels that have videos
 */
export function useYoutubeChannelList() {
	return useQuery(api.youtubeVideos.getChannelList);
}

/**
 * Hook to manually sync a single channel
 * Automatically includes clerkId from current user
 */
export function useSyncYoutubeChannel() {
	const { user } = useAuth();
	const syncAction = useAction(api.youtubeVideos.manualSyncChannel);

	return async (args: { channelDbId: Id<"youtubeChannels"> }) => {
		if (!user?.id) {
			throw new Error("User not authenticated");
		}
		return await syncAction({
			clerkId: user.id,
			channelDbId: args.channelDbId,
		});
	};
}

/**
 * Hook to manually sync all channels
 * Automatically includes clerkId from current user
 */
export function useSyncAllYoutubeChannels() {
	const { user } = useAuth();
	const syncAction = useAction(api.youtubeVideos.manualSyncAllChannels);

	return async () => {
		if (!user?.id) {
			throw new Error("User not authenticated");
		}
		return await syncAction({
			clerkId: user.id,
		});
	};
}

/**
 * Combined hook with all video operations
 */
export function useYoutubeVideoOperations(options?: {
	channelId?: string;
	channelRef?: Id<"youtubeChannels">;
	limit?: number;
	cursor?: number;
	publishedAfter?: number;
}) {
	const videos = useYoutubeVideos(options);
	const channelList = useYoutubeChannelList();
	const syncChannel = useSyncYoutubeChannel();
	const syncAllChannels = useSyncAllYoutubeChannels();

	return {
		videos,
		channelList,
		syncChannel,
		syncAllChannels,
	};
}
