import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useWorkshops(options?: {
	publishedOnly?: boolean;
	limit?: number;
}) {
	return useQuery(api.workshops.list, {
		publishedOnly: options?.publishedOnly ?? true,
		limit: options?.limit,
	});
}

export function useWorkshop(workshopId?: Id<"workshops">) {
	return useQuery(api.workshops.getById, workshopId ? { workshopId } : "skip");
}

export function useWorkshopBySlug(slug?: string) {
	return useQuery(api.workshops.getBySlug, slug ? { slug } : "skip");
}

export function useCreateWorkshop() {
	return useMutation(api.workshops.create);
}

export function useUpdateWorkshop() {
	return useMutation(api.workshops.update);
}

export function useDeleteWorkshop() {
	return useMutation(api.workshops.softDelete);
}

export function useWorkshopAttachments(workshopId?: Id<"workshops">) {
	return useQuery(
		api.workshopAttachments.listByWorkshop,
		workshopId ? { workshopId } : "skip",
	);
}

export function useCreateWorkshopAttachment() {
	return useMutation(api.workshopAttachments.create);
}

export function useUpdateWorkshopAttachment() {
	return useMutation(api.workshopAttachments.update);
}

export function useDeleteWorkshopAttachment() {
	return useMutation(api.workshops.remove);
}

export function useIncrementWorkshopViewCount() {
	return useMutation(api.workshops.incrementViewCount);
}
