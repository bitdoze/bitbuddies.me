import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useChaptersByCourse(
	courseId?: Id<"courses">,
	options?: {
		publishedOnly?: boolean;
	},
) {
	return useQuery(
		api.chapters.listByCourse,
		courseId
			? {
					courseId,
					publishedOnly: options?.publishedOnly ?? true,
				}
			: "skip",
	);
}

export function useChapter(chapterId?: Id<"chapters">) {
	return useQuery(api.chapters.getById, chapterId ? { chapterId } : "skip");
}

export function useCreateChapter() {
	return useMutation(api.chapters.create);
}

export function useUpdateChapter() {
	return useMutation(api.chapters.update);
}

export function useDeleteChapter() {
	return useMutation(api.chapters.softDelete);
}

export function useReorderChapters() {
	return useMutation(api.chapters.reorder);
}
