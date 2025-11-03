import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Get a media asset by ID (admin only)
 * Requires clerkId for authentication
 */
export function useMediaAsset(clerkId?: string, assetId?: Id<"mediaAssets">) {
	return useQuery(
		api.mediaAssets.getById,
		clerkId && assetId ? { clerkId, assetId } : "skip",
	);
}

/**
 * Get URL for a media asset (public)
 */
export function useMediaAssetUrl(storageId?: Id<"_storage">) {
	return useQuery(api.mediaAssets.getUrl, storageId ? { storageId } : "skip");
}

/**
 * List media assets (admin only)
 * Requires clerkId for authentication
 */
export function useListMediaAssets(
	clerkId?: string,
	options?: {
		assetType?: "image" | "attachment";
		limit?: number;
	},
) {
	return useQuery(
		api.mediaAssets.list,
		clerkId
			? {
					clerkId,
					assetType: options?.assetType,
					limit: options?.limit,
			  }
			: "skip",
	);
}

export function useGenerateUploadUrl() {
	return useMutation(api.mediaAssets.generateUploadUrl);
}

export function useCreateMediaAsset() {
	return useMutation(api.mediaAssets.create);
}

export function useUpdateMediaAsset() {
	return useMutation(api.mediaAssets.update);
}

export function useRemoveMediaAsset() {
	return useMutation(api.mediaAssets.remove);
}
