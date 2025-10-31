import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useLessonsByCourse(courseId?: Id<"courses">, options?: {
	publishedOnly?: boolean;
}) {
	return useQuery(
		api.lessons.listByCourse,
		courseId ? {
			courseId,
			publishedOnly: options?.publishedOnly ?? true,
		} : "skip"
	);
}

export function useLesson(lessonId?: Id<"lessons">) {
	return useQuery(api.lessons.getById, lessonId ? { lessonId } : "skip");
}

export function useLessonBySlug(slug?: string) {
	return useQuery(api.lessons.getBySlug, slug ? { slug } : "skip");
}

export function useCreateLesson() {
	return useMutation(api.lessons.create);
}

export function useUpdateLesson() {
	return useMutation(api.lessons.update);
}

export function useDeleteLesson() {
	return useMutation(api.lessons.softDelete);
}

export function useReorderLessons() {
	return useMutation(api.lessons.reorder);
}

export function useLessonAttachments(lessonId?: Id<"lessons">) {
	return useQuery(
		api.lessonAttachments.listByLesson,
		lessonId ? { lessonId } : "skip",
	);
}

export function useCreateLessonAttachment() {
	return useMutation(api.lessonAttachments.create);
}

export function useUpdateLessonAttachment() {
	return useMutation(api.lessonAttachments.update);
}

export function useDeleteLessonAttachment() {
	return useMutation(api.lessonAttachments.remove);
}
