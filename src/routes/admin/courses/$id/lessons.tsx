import { createFileRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Edit,
	Eye,
	Folder,
	GripVertical,
	Lock,
	PlayCircle,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
	useChaptersByCourse,
	useCreateChapter,
	useDeleteChapter,
	useUpdateChapter,
} from "@/hooks/useChapters";
import { useCourse } from "@/hooks/useCourses";
import {
	useCreateLesson,
	useDeleteLesson,
	useLessonsByCourse,
	useUpdateLesson,
} from "@/hooks/useLessons";

export const Route = createFileRoute("/admin/courses/$id/lessons")({
	component: ManageLessonsPage,
});

function ManageLessonsPage() {
	const params = Route.useParams();
	const courseId = (params as any).id as string;
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
	const course = useCourse(courseId as any);
	const lessons = useLessonsByCourse(courseId as any, { publishedOnly: false });
	const chapters = useChaptersByCourse(courseId as any, {
		publishedOnly: false,
	});

	const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
	const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false);
	const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
	const [selectedLesson, setSelectedLesson] = useState<any>(null);

	const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false);
	const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false);
	const [deleteChapterDialogOpen, setDeleteChapterDialogOpen] = useState(false);
	const [selectedChapter, setSelectedChapter] = useState<any>(null);

	if (
		isLoading ||
		course === undefined ||
		lessons === undefined ||
		chapters === undefined
	) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated || !user) {
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

	if (!course) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<AlertCircle className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Course Not Found</h1>
							<p className="text-muted-foreground mb-6">
								The course you're looking for doesn't exist.
							</p>
							<Button asChild variant="outline" size="lg">
								<a href="/admin/courses">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Courses
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<SEO
				title={`Manage Lessons - ${course.title}`}
				description="Manage course lessons"
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button variant="ghost" asChild className="mb-6">
							<a href="/admin/courses">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Courses
							</a>
						</Button>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
							<div>
								<div className="mb-4 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<BookOpen className="h-6 w-6" />
									</div>
									<div>
										<h1 className="text-3xl md:text-4xl font-bold">
											Manage Lessons
										</h1>
										<p className="text-lg text-muted-foreground mt-1">
											{course.title}
										</p>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									{lessons?.length ?? 0} lesson(s) total
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									size="lg"
									variant="outline"
									className="shadow-md"
									onClick={() => setCreateChapterDialogOpen(true)}
								>
									<Folder className="mr-2 h-5 w-5" />
									Add Chapter
								</Button>
								<Button
									size="lg"
									className="shadow-md"
									onClick={() => setCreateLessonDialogOpen(true)}
								>
									<Plus className="mr-2 h-5 w-5" />
									Add Lesson
								</Button>
							</div>
						</div>

						{/* Decorative elements */}
						<div className="absolute left-0 top-0 -z-10 h-full w-full">
							<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
							<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
						</div>
			</div>
					</section>

					{/* Tabs for Chapters and Lessons */}
					<section className="py-12">
						<div className="container mx-auto px-4">
							<div className="max-w-5xl mx-auto">
								<Tabs defaultValue="lessons" className="w-full">
									<TabsList className="grid w-full grid-cols-2 mb-8">
										<TabsTrigger value="chapters">
											<Folder className="mr-2 h-4 w-4" />
											Chapters ({chapters?.length ?? 0})
										</TabsTrigger>
										<TabsTrigger value="lessons">
											<BookOpen className="mr-2 h-4 w-4" />
											Lessons ({lessons?.length ?? 0})
										</TabsTrigger>
									</TabsList>

									{/* Chapters Tab */}
									<TabsContent value="chapters">
										{!chapters || chapters.length === 0 ? (
											<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
												<div className="mb-4 inline-flex rounded-full bg-muted p-4">
													<Folder className="h-12 w-12 text-muted-foreground" />
												</div>
												<h3 className="text-xl font-semibold mb-2">
													No Chapters Yet
												</h3>
												<p className="text-muted-foreground mb-6">
													Add chapters to organize your lessons.
												</p>
												<Button
													size="lg"
													onClick={() => setCreateChapterDialogOpen(true)}
												>
													<Plus className="mr-2 h-5 w-5" />
													Add Chapter
												</Button>
											</div>
										) : (
											<div className="space-y-4">
												{chapters.map((chapter, index) => (
													<ChapterCard
														key={chapter._id}
														chapter={chapter}
														index={index}
														lessons={lessons || []}
														onEdit={(chapter) => {
															setSelectedChapter(chapter);
															setEditChapterDialogOpen(true);
														}}
														onDelete={(chapter) => {
															setSelectedChapter(chapter);
															setDeleteChapterDialogOpen(true);
														}}
													/>
												))}
										</div>
										)}
									</TabsContent>

									{/* Lessons Tab */}
									<TabsContent value="lessons">
										{!lessons || lessons.length === 0 ? (
											<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
												<div className="mb-4 inline-flex rounded-full bg-muted p-4">
													<BookOpen className="h-12 w-12 text-muted-foreground" />
												</div>
												<h3 className="text-xl font-semibold mb-2">
													No Lessons Yet
												</h3>
												<p className="text-muted-foreground mb-6">
													Add your first lesson to get started.
												</p>
												<Button
													size="lg"
													onClick={() => setCreateLessonDialogOpen(true)}
												>
													<Plus className="mr-2 h-5 w-5" />
													Add Lesson
												</Button>
											</div>
										) : (
											<div className="space-y-4">
												{lessons.map((lesson, index) => (
													<LessonCard
														key={lesson._id}
														lesson={lesson}
														index={index}
														chapters={chapters || []}
														onEdit={(lesson) => {
															setSelectedLesson(lesson);
															setEditLessonDialogOpen(true);
														}}
														onDelete={(lesson) => {
															setSelectedLesson(lesson);
															setDeleteLessonDialogOpen(true);
														}}
													/>
												))}
										</div>
										)}
									</TabsContent>
								</Tabs>
							</div>
						</div>
					</section>
				</div>

				{/* Create Chapter Dialog */}
				<ChapterFormDialog
					open={createChapterDialogOpen}
					onOpenChange={setCreateChapterDialogOpen}
					courseId={courseId as any}
					userId={user.id}
					nextOrder={(chapters?.length ?? 0) + 1}
				/>

				{/* Edit Chapter Dialog */}
				{selectedChapter && (
					<ChapterFormDialog
						open={editChapterDialogOpen}
						onOpenChange={setEditChapterDialogOpen}
						courseId={courseId as any}
						userId={user.id}
						chapter={selectedChapter}
					/>
				)}

				{/* Delete Chapter Dialog */}
				<DeleteChapterDialog
					open={deleteChapterDialogOpen}
					onOpenChange={setDeleteChapterDialogOpen}
					chapter={selectedChapter}
					userId={user.id}
					onDeleted={() => {
						setDeleteChapterDialogOpen(false);
						setSelectedChapter(null);
					}}
				/>

				{/* Create Lesson Dialog */}
				<LessonFormDialog
					open={createLessonDialogOpen}
					onOpenChange={setCreateLessonDialogOpen}
					courseId={courseId as any}
					userId={user.id}
					chapters={chapters || []}
					nextOrder={(lessons?.length ?? 0) + 1}
				/>

				{/* Edit Lesson Dialog */}
				{selectedLesson && (
					<LessonFormDialog
						open={editLessonDialogOpen}
						onOpenChange={setEditLessonDialogOpen}
						courseId={courseId as any}
						userId={user.id}
						chapters={chapters || []}
						lesson={selectedLesson}
					/>
				)}

				{/* Delete Lesson Dialog */}
				<DeleteLessonDialog
					open={deleteLessonDialogOpen}
					onOpenChange={setDeleteLessonDialogOpen}
					lesson={selectedLesson}
					userId={user.id}
					onDeleted={() => {
						setDeleteLessonDialogOpen(false);
						setSelectedLesson(null);
					}}
				/>
		</>
	);
}

function ChapterCard({
	chapter,
	index,
	lessons,
	onEdit,
	onDelete,
}: {
	chapter: any;
	index: number;
	lessons: any[];
	onEdit: (chapter: any) => void;
	onDelete: (chapter: any) => void;
}) {
	const lessonsInChapter = lessons.filter((l) => l.chapterId === chapter._id);

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow">
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
						{index + 1}
					</div>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-4 mb-2">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold mb-1">{chapter.title}</h3>
							{chapter.description && (
								<p className="text-sm text-muted-foreground line-clamp-2">
									{chapter.description}
								</p>
							)}
						</div>
						<div className="flex items-center gap-2">
							{chapter.isPublished ? (
								<Badge variant="default">Published</Badge>
							) : (
								<Badge variant="secondary">Draft</Badge>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<BookOpen className="h-4 w-4" />
							<span>{lessonsInChapter.length} lesson(s)</span>
						</div>
						<span>Order: {chapter.order}</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onEdit(chapter)}
						title="Edit Chapter"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(chapter)}
						className="hover:bg-destructive/10"
						title="Delete Chapter"
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function LessonCard({
	lesson,
	index,
	chapters,
	onEdit,
	onDelete,
}: {
	lesson: any;
	index: number;
	chapters: any[];
	onEdit: (lesson: any) => void;
	onDelete: (lesson: any) => void;
}) {
	const chapter = chapters.find((c) => c._id === lesson.chapterId);
	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow">
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
						{index + 1}
					</div>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-4 mb-2">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-semibold mb-1">{lesson.title}</h3>
							{lesson.description && (
								<p className="text-sm text-muted-foreground line-clamp-2">
									{lesson.description}
								</p>
							)}
						</div>
						<div className="flex items-center gap-2">
							{lesson.isPublished ? (
								<Badge variant="default">Published</Badge>
							) : (
								<Badge variant="secondary">Draft</Badge>
							)}
							{lesson.isFree && <Badge variant="outline">Free</Badge>}
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						{chapter && (
							<div className="flex items-center gap-1">
								<Folder className="h-4 w-4" />
								<span>{chapter.title}</span>
							</div>
						)}
						{lesson.videoDuration && (
							<div className="flex items-center gap-1">
								<PlayCircle className="h-4 w-4" />
								<span>{formatDuration(lesson.videoDuration)}</span>
							</div>
						)}
						<span>Order: {lesson.order}</span>
						{lesson.videoUrl && (
							<div className="flex items-center gap-1">
								<Eye className="h-4 w-4" />
								<span>Video</span>
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onEdit(lesson)}
						title="Edit Lesson"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onDelete(lesson)}
						className="hover:bg-destructive/10"
						title="Delete Lesson"
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function ChapterFormDialog({
	open,
	onOpenChange,
	courseId,
	userId,
	chapter,
	nextOrder,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	courseId: Id<"courses">;
	userId: string;
	chapter?: any;
	nextOrder?: number;
}) {
	const createChapter = useCreateChapter();
	const updateChapter = useUpdateChapter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isEdit = !!chapter;

	const [formData, setFormData] = useState({
		title: chapter?.title || "",
		description: chapter?.description || "",
		order: chapter?.order?.toString() || nextOrder?.toString() || "1",
		isPublished: chapter?.isPublished ?? false,
	});

	// Reset form when dialog opens or chapter changes
	useEffect(() => {
		if (open) {
			setFormData({
				title: chapter?.title || "",
				description: chapter?.description || "",
				order: chapter?.order?.toString() || nextOrder?.toString() || "1",
				isPublished: chapter?.isPublished ?? false,
			});
		}
	}, [open, chapter, nextOrder]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (isEdit) {
				await updateChapter({
					clerkId: userId,
					chapterId: chapter._id,
					patch: {
						title: formData.title,
						description: formData.description || undefined,
						order: Number.parseInt(formData.order),
						isPublished: formData.isPublished,
					},
				});
			} else {
				await createChapter({
					clerkId: userId,
					courseId,
					title: formData.title,
					description: formData.description || undefined,
					order: Number.parseInt(formData.order),
					isPublished: formData.isPublished,
				});
			}

			onOpenChange(false);
			// Reset form
			setFormData({
				title: "",
				description: "",
				order: nextOrder?.toString() || "1",
				isPublished: false,
			});
		} catch (error) {
			console.error("Failed to save chapter:", error);
			alert("Failed to save chapter. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Chapter" : "Add New Chapter"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update chapter details below."
							: "Fill in the details to create a new chapter."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="chapter-title">Chapter Title *</Label>
							<Input
								id="chapter-title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="e.g., Introduction to React"
								required
							/>
						</div>

						<div>
							<Label htmlFor="chapter-description">Description</Label>
							<Textarea
								id="chapter-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Brief description of the chapter"
								rows={3}
							/>
						</div>

						<div>
							<Label htmlFor="chapter-order">Order *</Label>
							<Input
								id="chapter-order"
								type="number"
								value={formData.order}
								onChange={(e) =>
									setFormData({ ...formData, order: e.target.value })
								}
								placeholder="e.g., 1"
								required
								min="1"
							/>
						</div>

						<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
							<div>
								<Label htmlFor="chapter-published" className="cursor-pointer">
									Publish Chapter
								</Label>
								<p className="text-sm text-muted-foreground">
									Make this chapter visible to users
								</p>
							</div>
							<Switch
								id="chapter-published"
								checked={formData.isPublished}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isPublished: checked })
								}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Saving...
								</>
							) : (
								<>{isEdit ? "Update Chapter" : "Create Chapter"}</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteChapterDialog({
	open,
	onOpenChange,
	chapter,
	userId,
	onDeleted,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chapter: any;
	userId: string;
	onDeleted: () => void;
}) {
	const deleteChapter = useDeleteChapter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!chapter) return;

		setIsDeleting(true);
		try {
			await deleteChapter({
				clerkId: userId,
				chapterId: chapter._id,
			});
			onDeleted();
		} catch (error) {
			console.error("Failed to delete chapter:", error);
			alert("Failed to delete chapter. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Chapter</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{chapter?.title}"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LessonFormDialog({
	open,
	onOpenChange,
	courseId,
	userId,
	chapters,
	lesson,
	nextOrder,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	courseId: Id<"courses">;
	userId: string;
	chapters: any[];
	lesson?: any;
	nextOrder?: number;
}) {
	const createLesson = useCreateLesson();
	const updateLesson = useUpdateLesson();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isEdit = !!lesson;

	const [formData, setFormData] = useState({
		title: lesson?.title || "",
		slug: lesson?.slug || "",
		description: lesson?.description || "",
		content: lesson?.content || "",
		chapterId: lesson?.chapterId || undefined,
		videoProvider: (lesson?.videoProvider || "youtube") as "youtube" | "bunny",
		videoId: lesson?.videoId || "",
		videoUrl: lesson?.videoUrl || "",
		videoDuration: lesson?.videoDuration?.toString() || "",
		order: lesson?.order?.toString() || nextOrder?.toString() || "1",
		isPublished: lesson?.isPublished ?? false,
		isFree: lesson?.isFree ?? false,
	});

	// Reset form when dialog opens or lesson changes
	useEffect(() => {
		if (open) {
			setFormData({
				title: lesson?.title || "",
				slug: lesson?.slug || "",
				description: lesson?.description || "",
				content: lesson?.content || "",
				chapterId: lesson?.chapterId || undefined,
				videoProvider: (lesson?.videoProvider || "youtube") as
					| "youtube"
					| "bunny",
				videoId: lesson?.videoId || "",
				videoUrl: lesson?.videoUrl || "",
				videoDuration: lesson?.videoDuration?.toString() || "",
				order: lesson?.order?.toString() || nextOrder?.toString() || "1",
				isPublished: lesson?.isPublished ?? false,
				isFree: lesson?.isFree ?? false,
			});
		}
	}, [open, lesson, nextOrder]);

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	};

	const handleTitleChange = (title: string) => {
		setFormData({
			...formData,
			title,
			slug: isEdit ? formData.slug : generateSlug(title),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			if (isEdit) {
				await updateLesson({
					clerkId: userId,
					lessonId: lesson._id,
					patch: {
						title: formData.title,
						slug: formData.slug,
						description: formData.description || undefined,
						content: formData.content || undefined,
						chapterId: formData.chapterId || undefined,
						videoProvider: formData.videoProvider,
						videoId: formData.videoId || undefined,
						videoUrl: formData.videoUrl || undefined,
						videoDuration: formData.videoDuration
							? Number.parseInt(formData.videoDuration)
							: undefined,
						order: Number.parseInt(formData.order),
						isPublished: formData.isPublished,
						isFree: formData.isFree,
					},
				});
			} else {
				await createLesson({
					clerkId: userId,
					courseId,
					title: formData.title,
					slug: formData.slug,
					description: formData.description || undefined,
					content: formData.content || undefined,
					chapterId: formData.chapterId || undefined,
					videoProvider: formData.videoProvider,
					videoId: formData.videoId || undefined,
					videoUrl: formData.videoUrl || undefined,
					videoDuration: formData.videoDuration
						? Number.parseInt(formData.videoDuration)
						: undefined,
					order: Number.parseInt(formData.order),
					isPublished: formData.isPublished,
					isFree: formData.isFree,
				});
			}

			onOpenChange(false);
			// Reset form
			setFormData({
				title: "",
				slug: "",
				description: "",
				content: "",
				chapterId: undefined,
				videoProvider: "youtube",
				videoId: "",
				videoUrl: "",
				videoDuration: "",
				order: nextOrder?.toString() || "1",
				isPublished: false,
				isFree: false,
			});
		} catch (error) {
			console.error("Failed to save lesson:", error);
			alert("Failed to save lesson. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update lesson details below."
							: "Fill in the details to create a new lesson."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="lesson-title">Lesson Title *</Label>
							<Input
								id="lesson-title"
								value={formData.title}
								onChange={(e) => handleTitleChange(e.target.value)}
								placeholder="e.g., Introduction to React Hooks"
								required
							/>
						</div>

						<div>
							<Label htmlFor="lesson-slug">URL Slug *</Label>
							<Input
								id="lesson-slug"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
								placeholder="e.g., introduction-to-react-hooks"
								required
							/>
						</div>

						<div>
							<Label htmlFor="lesson-description">Description</Label>
							<Input
								id="lesson-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Brief description of the lesson"
							/>
						</div>

						<div>
							<Label htmlFor="lesson-content">Content (HTML)</Label>
							<Textarea
								id="lesson-content"
								value={formData.content}
								onChange={(e) =>
									setFormData({ ...formData, content: e.target.value })
								}
								placeholder="Lesson content (HTML supported)"
								rows={6}
							/>
						</div>

						<div>
							<Label htmlFor="chapter-id">Chapter (Optional)</Label>
							<Select
								value={formData.chapterId || "none"}
								onValueChange={(value) =>
									setFormData({
										...formData,
										chapterId: value === "none" ? undefined : value,
									})
								}
							>
								<SelectTrigger id="chapter-id">
									<SelectValue placeholder="Select a chapter" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Chapter</SelectItem>
									{chapters.map((chapter) => (
										<SelectItem key={chapter._id} value={chapter._id}>
											{chapter.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="video-provider">Video Provider</Label>
								<Select
									value={formData.videoProvider}
									onValueChange={(value: any) =>
										setFormData({ ...formData, videoProvider: value })
									}
								>
									<SelectTrigger id="video-provider">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="youtube">YouTube</SelectItem>
										<SelectItem value="bunny">Bunny Stream</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="video-duration">Duration (seconds)</Label>
								<Input
									id="video-duration"
									type="number"
									value={formData.videoDuration}
									onChange={(e) =>
										setFormData({ ...formData, videoDuration: e.target.value })
									}
									placeholder="e.g., 600"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="video-id">Video ID</Label>
							<Input
								id="video-id"
								value={formData.videoId}
								onChange={(e) =>
									setFormData({ ...formData, videoId: e.target.value })
								}
								placeholder="e.g., dQw4w9WgXcQ (YouTube ID)"
							/>
						</div>

						<div>
							<Label htmlFor="video-url">Video URL</Label>
							<Input
								id="video-url"
								value={formData.videoUrl}
								onChange={(e) =>
									setFormData({ ...formData, videoUrl: e.target.value })
								}
								placeholder={
									formData.videoProvider === "bunny"
										? "e.g., https://iframe.mediadelivery.net/play/149616/8adcaaab..."
										: "e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
								}
							/>
							{formData.videoProvider === "bunny" && (
								<p className="text-xs text-muted-foreground mt-1">
									💡 Tip: Use the Bunny play URL (e.g., /play/...) - it will be
									automatically converted to embed format
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="lesson-order">Order *</Label>
							<Input
								id="lesson-order"
								type="number"
								value={formData.order}
								onChange={(e) =>
									setFormData({ ...formData, order: e.target.value })
								}
								placeholder="e.g., 1"
								required
								min="1"
							/>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
								<div>
									<Label htmlFor="is-published" className="cursor-pointer">
										Publish Lesson
									</Label>
									<p className="text-sm text-muted-foreground">
										Make this lesson visible to users
									</p>
								</div>
								<Switch
									id="is-published"
									checked={formData.isPublished}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, isPublished: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
								<div>
									<Label htmlFor="is-free" className="cursor-pointer">
										Free Preview
									</Label>
									<p className="text-sm text-muted-foreground">
										Allow unauthenticated users to view this lesson
									</p>
								</div>
								<Switch
									id="is-free"
									checked={formData.isFree}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, isFree: checked })
									}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Saving...
								</>
							) : (
								<>{isEdit ? "Update Lesson" : "Create Lesson"}</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteLessonDialog({
	open,
	onOpenChange,
	lesson,
	userId,
	onDeleted,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	lesson: any;
	userId: string;
	onDeleted: () => void;
}) {
	const deleteLesson = useDeleteLesson();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!lesson) return;

		setIsDeleting(true);
		try {
			await deleteLesson({
				clerkId: userId,
				lessonId: lesson._id,
			});
			onDeleted();
		} catch (error) {
			console.error("Failed to delete lesson:", error);
			alert("Failed to delete lesson. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Lesson</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{lesson?.title}"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
