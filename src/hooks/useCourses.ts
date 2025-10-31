import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useCourses(options?: {
	publishedOnly?: boolean;
	limit?: number;
}) {
	return useQuery(api.courses.list, {
		publishedOnly: options?.publishedOnly ?? true,
		limit: options?.limit,
	});
}

export function useCourse(courseId?: Id<"courses">) {
	return useQuery(api.courses.getById, courseId ? { courseId } : "skip");
}

export function useCourseBySlug(slug?: string) {
	return useQuery(api.courses.getBySlug, slug ? { slug } : "skip");
}

export function useCreateCourse() {
	return useMutation(api.courses.create);
}

export function useUpdateCourse() {
	return useMutation(api.courses.update);
}

export function useDeleteCourse() {
	return useMutation(api.courses.softDelete);
}
