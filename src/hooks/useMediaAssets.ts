import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useMediaAsset(assetId?: Id<"mediaAssets">) {
	return useQuery(api.mediaAssets.getById, assetId ? { assetId } : "skip");
}

export function useMediaAssetUrl(storageId?: Id<"_storage">) {
	return useQuery(api.mediaAssets.getUrl, storageId ? { storageId } : "skip");
}

export function useListMediaAssets(options?: {
	assetType?: "image" | "attachment";
	limit?: number;
}) {
	return useQuery(api.mediaAssets.list, {
		assetType: options?.assetType,
		limit: options?.limit,
	});
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
