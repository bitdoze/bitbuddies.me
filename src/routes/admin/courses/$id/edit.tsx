import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	FileText,
	Lock,
	Plus,
	Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ImageUpload } from "@/components/common/ImageUpload";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCourse, useUpdateCourse } from "@/hooks/useCourses";
import { useMediaAsset } from "@/hooks/useMediaAssets";

export const Route = createFileRoute("/admin/courses/$id/edit")({
	component: EditCoursePage,
});

function EditCoursePage() {
	const params = Route.useParams();
	const courseId = (params as any).id as string;
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
	const course = useCourse(courseId as any);
	const updateCourse = useUpdateCourse();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [coverAssetId, setCoverAssetId] = useState<
		Id<"mediaAssets"> | undefined
	>();
	const coverAsset = useMediaAsset(user?.id, coverAssetId);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		description: "",
		shortDescription: "",
		level: "beginner" as "beginner" | "intermediate" | "advanced",
		category: "",
		tags: "",
		duration: "",
		accessLevel: "authenticated" as "public" | "authenticated" | "subscription",
		requiredTier: undefined as "basic" | "premium" | undefined,
		isPublished: false,
		isFeatured: false,
	});

	// Load course data into form
	useEffect(() => {
		if (course) {
			setCoverAssetId(course.coverAssetId);
			setFormData({
				title: course.title,
				slug: course.slug,
				description: course.description,
				shortDescription: course.shortDescription || "",
				level: course.level,
				category: course.category || "",
				tags: course.tags.join(", "),
				duration: course.duration?.toString() || "",
				accessLevel: course.accessLevel,
				requiredTier: course.requiredTier,
				isPublished: course.isPublished,
				isFeatured: course.isFeatured,
			});
		}
	}, [course]);

	if (isLoading || course === undefined) {
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
								The course you're trying to edit doesn't exist.
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
			slug: generateSlug(title),
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const tagsArray = formData.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			await updateCourse({
				clerkId: user.id,
				courseId: courseId as any,
				patch: {
					title: formData.title,
					slug: formData.slug,
					description: formData.description,
					shortDescription: formData.shortDescription || undefined,
					coverAssetId: coverAssetId,
					level: formData.level,
					category: formData.category || undefined,
					tags: tagsArray,
					duration: formData.duration
						? Number.parseInt(formData.duration)
						: undefined,
					accessLevel: formData.accessLevel || "authenticated",
					requiredTier: formData.requiredTier || undefined,
					isPublished: formData.isPublished,
					isFeatured: formData.isFeatured,
				},
			});

			window.location.href = "/admin/courses";
		} catch (error) {
			console.error("Failed to update course:", error);
			alert("Failed to update course. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<SEO
				title={`Edit ${course.title}`}
				description="Edit course details"
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button variant="ghost" asChild className="mb-6">
							<a href="/admin/courses">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Courses
							</a>
						</Button>
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<BookOpen className="h-6 w-6" />
							</div>
							<h1 className="text-3xl md:text-4xl font-bold">Edit Course</h1>
						</div>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Form */}
				<section className="py-12">
					<div className="container mx-auto px-4">
						<form
							onSubmit={handleSubmit}
							className="max-w-4xl mx-auto space-y-8"
						>
							{/* Basic Information */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="flex items-center gap-3 mb-6">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<FileText className="h-5 w-5" />
									</div>
									<h2 className="text-xl font-semibold">Basic Information</h2>
								</div>

								<div className="space-y-6">
									<div>
										<Label htmlFor="title">Course Title *</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) => handleTitleChange(e.target.value)}
											placeholder="e.g., Complete Web Development Bootcamp"
											required
										/>
									</div>

									<div>
										<Label htmlFor="slug">URL Slug *</Label>
										<Input
											id="slug"
											value={formData.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
											placeholder="e.g., complete-web-development-bootcamp"
											required
										/>
										<p className="text-sm text-muted-foreground mt-1">
											This will be used in the URL: /courses/
											{formData.slug || "your-slug"}
										</p>
									</div>

									<div>
										<Label htmlFor="shortDescription">Short Description</Label>
										<Input
											id="shortDescription"
											value={formData.shortDescription}
											onChange={(e) =>
												setFormData({
													...formData,
													shortDescription: e.target.value,
												})
											}
											placeholder="Brief one-line description"
										/>
									</div>

									<div>
										<Label htmlFor="description">Full Description *</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder="Detailed course description (HTML supported)"
											rows={8}
											required
										/>
										<p className="text-sm text-muted-foreground mt-1">
											HTML formatting is supported
										</p>
									</div>

									<div>
										<ImageUpload
											value={coverAssetId}
											imageUrl={coverAsset?.url}
											onChange={setCoverAssetId}
											label="Cover Image"
										/>
									</div>
								</div>
							</div>

							{/* Course Details */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="flex items-center gap-3 mb-6">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Settings className="h-5 w-5" />
									</div>
									<h2 className="text-xl font-semibold">Course Details</h2>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<Label htmlFor="level">Level *</Label>
										<Select
											value={formData.level}
											onValueChange={(value: any) =>
												setFormData({ ...formData, level: value })
											}
										>
											<SelectTrigger id="level">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="beginner">Beginner</SelectItem>
												<SelectItem value="intermediate">
													Intermediate
												</SelectItem>
												<SelectItem value="advanced">Advanced</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="duration">Total Duration (minutes)</Label>
										<Input
											id="duration"
											type="number"
											value={formData.duration}
											onChange={(e) =>
												setFormData({ ...formData, duration: e.target.value })
											}
											placeholder="e.g., 180"
										/>
									</div>

									<div>
										<Label htmlFor="category">Category</Label>
										<Input
											id="category"
											value={formData.category}
											onChange={(e) =>
												setFormData({ ...formData, category: e.target.value })
											}
											placeholder="e.g., Web Development"
										/>
									</div>

									<div>
										<Label htmlFor="tags">Tags (comma-separated)</Label>
										<Input
											id="tags"
											value={formData.tags}
											onChange={(e) =>
												setFormData({ ...formData, tags: e.target.value })
											}
											placeholder="e.g., react, typescript, web"
										/>
									</div>
								</div>
							</div>

							{/* Access Control */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="flex items-center gap-3 mb-6">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Lock className="h-5 w-5" />
									</div>
									<h2 className="text-xl font-semibold">Access Control</h2>
								</div>

								<div className="space-y-6">
									<div>
										<Label htmlFor="accessLevel">Access Level *</Label>
										<Select
											value={formData.accessLevel}
											onValueChange={(value: any) =>
												setFormData({ ...formData, accessLevel: value })
											}
										>
											<SelectTrigger id="accessLevel">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="public">
													Public (anyone can view)
												</SelectItem>
												<SelectItem value="authenticated">
													Authenticated (login required)
												</SelectItem>
												<SelectItem value="subscription">
													Subscription (paid members only)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{formData.accessLevel === "subscription" && (
										<div>
											<Label htmlFor="requiredTier">Required Tier</Label>
											<Select
												value={formData.requiredTier}
												onValueChange={(value: any) =>
													setFormData({ ...formData, requiredTier: value })
												}
											>
												<SelectTrigger id="requiredTier">
													<SelectValue placeholder="Select tier" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="basic">Basic</SelectItem>
													<SelectItem value="premium">Premium</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}

									<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
										<div>
											<Label htmlFor="isPublished" className="cursor-pointer">
												Publish Course
											</Label>
											<p className="text-sm text-muted-foreground">
												Make this course visible to users
											</p>
										</div>
										<Switch
											id="isPublished"
											checked={formData.isPublished}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isPublished: checked })
											}
										/>
									</div>

									<div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
										<div>
											<Label htmlFor="isFeatured" className="cursor-pointer">
												Feature Course
											</Label>
											<p className="text-sm text-muted-foreground">
												Show this course in featured section
											</p>
										</div>
										<Switch
											id="isFeatured"
											checked={formData.isFeatured}
											onCheckedChange={(checked) =>
												setFormData({ ...formData, isFeatured: checked })
											}
										/>
									</div>
								</div>
							</div>

							{/* Submit */}
							<div className="flex items-center gap-4">
								<Button
									type="submit"
									size="lg"
									disabled={isSubmitting}
									className="shadow-md"
								>
									{isSubmitting ? (
										<>
											<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Updating...
										</>
										) : (
											<>
												<Plus className="mr-2 h-4 w-4" />
												Update Course
											</>
										)}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="lg"
									asChild
									disabled={isSubmitting}
								>
									<a href="/admin/courses">Cancel</a>
								</Button>
							</div>
						</form>
					</div>
				</section>
			</div>
		</>
	);
}
