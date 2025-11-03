import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	AlertCircle,
	BookOpen,
	Edit,
	Eye,
	ImageIcon,
	LayoutGrid,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useDeleteCourse } from "@/hooks/useCourses";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type EnrichedCourse = Doc<"courses"> & {
	coverAsset: Doc<"mediaAssets"> | null;
};

export const Route = createFileRoute("/admin/courses/" as any)({
	component: AdminCoursesPage,
	loader: async () => {
		// Prefetch all courses (including unpublished) on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { courses: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const courses = await client.query(api.courses.list, {
				publishedOnly: false,
			});
			return { courses };
		} catch (error) {
			console.error("Failed to prefetch courses:", error);
			return { courses: null };
		}
	},
});

function AdminCoursesPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientCourses = useCourses({ publishedOnly: false });

	// Prefer loader data, fallback to client fetch
	const courses = ((loaderData as any)?.courses ?? clientCourses) as
		| EnrichedCourse[]
		| null
		| undefined;
	const deleteCourse = useDeleteCourse();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading courses...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
							<p className="text-muted-foreground">
								You must be logged in to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Admin Access Required</h1>
							<p className="text-muted-foreground">
								You need admin privileges to access this page.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const handleDelete = async () => {
		if (!selectedCourseId || !user) return;

		try {
			await deleteCourse({
				clerkId: user.id,
				courseId: selectedCourseId as any,
			});
			setDeleteDialogOpen(false);
			setSelectedCourseId(null);
		} catch (error) {
			console.error("Failed to delete course:", error);
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp).toLocaleDateString();
	};

	const totalCourses = courses?.length ?? 0;
	const publishedCourses =
		courses?.filter((course) => course.isPublished).length ?? 0;
	const draftCourses = totalCourses - publishedCourses;
	const featuredCoursesCount =
		courses?.filter((course) => course.isFeatured).length ?? 0;
	const totalEnrollment =
		courses?.reduce((sum, course) => sum + (course.enrollmentCount ?? 0), 0) ??
		0;
	const durations = (courses ?? [])
		.map((course) => course.duration)
		.filter((value): value is number => typeof value === "number" && value > 0);
	const averageDuration = durations.length
		? `${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)} mins`
		: "—";
	const accessCounts = (courses ?? []).reduce(
		(acc, course) => {
			acc[course.accessLevel as keyof typeof acc] += 1;
			return acc;
		},
		{ public: 0, authenticated: 0, subscription: 0 },
	);

	return (
		<>
			<SEO
				title="Manage Courses"
				description="Admin dashboard for managing courses, creating new content, and editing existing courses."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Content management"
						title="Manage courses"
						description="Keep learning paths current, highlight premium tracks, and monitor student progress at a glance."
						actions={
							<Button asChild size="lg" className="gap-2">
								<Link to="/admin/courses/create">
									<Plus className="h-5 w-5" />
									New course
								</Link>
							</Button>
						}
						stats={[
							{ label: "Published", value: publishedCourses },
							{ label: "Drafts", value: draftCourses },
							{ label: "Featured", value: featuredCoursesCount },
							{
								label: "Total students",
								value: totalEnrollment.toLocaleString(),
							},
						]}
					/>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<AdminStatCard
							label="Average duration"
							value={averageDuration}
							description="Across published courses"
						/>
						<AdminStatCard
							label="Public access"
							value={accessCounts.public}
							description="Open to all visitors"
						/>
						<AdminStatCard
							label="Members"
							value={accessCounts.authenticated}
							description="Requires sign-in"
						/>
						<AdminStatCard
							label="Premium"
							value={accessCounts.subscription}
							description="Subscription exclusive"
						/>
					</div>
					<AdminTable
						title="All courses"
						description="Maintain curricula, enrollment, and visibility in one place."
						badge={<Badge variant="secondary">{totalCourses}</Badge>}
					>
						{!courses || courses.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<BookOpen className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No courses yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Launch your first curriculum to onboard learners.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to="/admin/courses/create">
										<Plus className="h-4 w-4" />
										Create course
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-20">Cover</TableHead>
											<TableHead>Course</TableHead>
											<TableHead>Level</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Published</TableHead>
											<TableHead>Students</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{courses.map((course) => (
											<CourseRow
												key={course._id}
												course={course}
												handleDelete={handleDelete}
												setSelectedCourseId={setSelectedCourseId}
												setDeleteDialogOpen={setDeleteDialogOpen}
												deleteDialogOpen={deleteDialogOpen}
												selectedCourseId={selectedCourseId}
												formatDate={formatDate}
											/>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</AdminTable>
				</AdminShell>
			</div>
		</>
	);
}

function CourseRow({
	course,
	handleDelete,
	setSelectedCourseId,
	setDeleteDialogOpen,
	deleteDialogOpen,
	selectedCourseId,
	formatDate,
}: {
	course: EnrichedCourse;
	handleDelete: () => void;
	setSelectedCourseId: (id: string | null) => void;
	setDeleteDialogOpen: (open: boolean) => void;
	deleteDialogOpen: boolean;
	selectedCourseId: string | null;
	formatDate: (timestamp?: number) => string;
}) {
	return (
		<TableRow>
			<TableCell>
				{course.coverAsset?.url ? (
					<div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
						<img
							src={course.coverAsset.url}
							alt={course.title}
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					<div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted">
						<ImageIcon className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
			</TableCell>
			<TableCell>
				<div className="space-y-1">
					<p className="font-medium text-foreground">{course.title}</p>
					{course.shortDescription ? (
						<p className="line-clamp-1 text-xs text-muted-foreground">
							{course.shortDescription}
						</p>
					) : null}
					{course.isFeatured ? (
						<Badge variant="secondary">Featured</Badge>
					) : null}
				</div>
			</TableCell>
			<TableCell>
				<Badge variant="outline">{course.level}</Badge>
			</TableCell>
			<TableCell>
				<Badge variant={course.isPublished ? "default" : "secondary"}>
					{course.isPublished ? "Published" : "Draft"}
				</Badge>
			</TableCell>
			<TableCell>{formatDate(course.publishedAt)}</TableCell>
			<TableCell>{course.enrollmentCount || 0}</TableCell>
			<TableCell className="text-right">
				<div className="flex justify-end gap-2">
					<Button variant="ghost" size="icon" asChild>
						<Link
							to="/courses/$slug"
							params={{ slug: course.slug }}
							target="_blank"
						>
							<Eye className="h-4 w-4" />
						</Link>
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<Link to="/admin/courses/$id/edit" params={{ id: course._id }}>
							<Edit className="h-4 w-4" />
						</Link>
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<a href={`/admin/courses/${course._id}/lessons`}>
							<LayoutGrid className="h-4 w-4" />
						</a>
					</Button>
					<Dialog
						open={deleteDialogOpen && selectedCourseId === course._id}
						onOpenChange={(open) => {
							setDeleteDialogOpen(open);
							if (!open) setSelectedCourseId(null);
						}}
					>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setSelectedCourseId(course._id)}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete course</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete "{course.title}"? This action
									cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setDeleteDialogOpen(false);
										setSelectedCourseId(null);
									}}
								>
									Cancel
								</Button>
								<Button variant="destructive" onClick={handleDelete}>
									Delete
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</TableCell>
		</TableRow>
	);
}
