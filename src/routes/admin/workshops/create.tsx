import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Eye,
	FileText,
	Lock,
	Plus,
	Settings,
	Video,
} from "lucide-react";
import { useState } from "react";
import type { JSONContent } from "@/components/kibo-ui/editor";
import type { Id } from "@/convex/_generated/dataModel";
import { ImageUpload } from "@/components/common/ImageUpload";
import {
	createEmptyContent,
	RichTextEditor,
} from "@/components/common/RichTextEditor";
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
import { useMediaAsset } from "@/hooks/useMediaAssets";
import { useCreateWorkshop } from "@/hooks/useWorkshops";

export const Route = createFileRoute("/admin/workshops/create")({
	component: CreateWorkshopPage,
});

function CreateWorkshopPage() {
	const { isAuthenticated, isLoading, isAdmin, user, convexUser } = useAuth();
	const createWorkshop = useCreateWorkshop();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [coverAssetId, setCoverAssetId] = useState<
		Id<"mediaAssets"> | undefined
	>();
	const coverAsset = useMediaAsset(user?.id, coverAssetId);

	const [content, setContent] = useState<JSONContent>(createEmptyContent());

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		description: "",
		shortDescription: "",
		level: "beginner" as "beginner" | "intermediate" | "advanced",
		category: "",
		tags: "",
		duration: "",
		isLive: false,
		startDate: "",
		endDate: "",
		maxParticipants: "",
		videoProvider: "youtube" as "youtube" | "bunny" | undefined,
		videoId: "",
		videoUrl: "",
		accessLevel: "authenticated" as "public" | "authenticated" | "subscription",
		requiredTier: undefined as "basic" | "premium" | undefined,
		isPublished: false,
		isFeatured: false,
	});

	if (isLoading) {
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

	if (!isAuthenticated || !user || !convexUser) {
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

			await createWorkshop({
				clerkId: user.id,
				title: formData.title,
				slug: formData.slug,
				description: formData.description,
				shortDescription: formData.shortDescription || undefined,
				coverAssetId: coverAssetId,
				content: JSON.stringify(content),
				level: formData.level,
				category: formData.category || undefined,
				tags: tagsArray,
				duration: formData.duration ? Number(formData.duration) : undefined,
				isLive: formData.isLive,
				startDate: formData.startDate
					? new Date(formData.startDate).getTime()
					: undefined,
				endDate: formData.endDate
					? new Date(formData.endDate).getTime()
					: undefined,
				maxParticipants: formData.maxParticipants
					? Number(formData.maxParticipants)
					: undefined,
				videoProvider: formData.videoId && formData.videoProvider
					? formData.videoProvider
					: undefined,
				videoId: formData.videoId || undefined,
				videoUrl: formData.videoUrl || undefined,
				accessLevel: formData.accessLevel || "authenticated",
				requiredTier: formData.requiredTier || undefined,
				isPublished: formData.isPublished,
				isFeatured: formData.isFeatured,
				instructorId: convexUser._id,
				instructorName: user.fullName || user.primaryEmailAddress?.emailAddress,
			});

			navigate({ to: "/admin/workshops" });
		} catch (error) {
			console.error("Failed to create workshop:", error);
			alert("Failed to create workshop. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<SEO
				title="Create Workshop"
				description="Create a new workshop with details, content, video, and scheduling options."
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button
							variant="ghost"
							onClick={() => navigate({ to: "/admin/workshops" })}
							className="mb-6"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Workshops
						</Button>

						<div className="mb-4 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Plus className="h-6 w-6" />
							</div>
							<h1 className="text-3xl font-bold md:text-4xl">
								Create New Workshop
							</h1>
						</div>
						<p className="text-lg text-muted-foreground">
							Add a new workshop with all the details and content
						</p>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Form Section */}
				<section className="py-12">
					<div className="container mx-auto max-w-4xl px-4">
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Basic Information */}
							<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<FileText className="h-5 w-5" />
									</div>
									<h2 className="text-2xl font-bold">Basic Information</h2>
								</div>
								<div className="space-y-4">
									<ImageUpload
										value={coverAssetId}
										imageUrl={coverAsset?.url}
										onChange={setCoverAssetId}
										label="Cover Image"
										disabled={isSubmitting}
									/>

									<div className="space-y-2">
										<Label htmlFor="title">Title *</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) => handleTitleChange(e.target.value)}
											placeholder="Workshop title"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="slug">Slug *</Label>
										<Input
											id="slug"
											value={formData.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
											placeholder="workshop-slug"
											required
										/>
										<p className="text-sm text-muted-foreground">
											URL-friendly identifier (auto-generated from title)
										</p>
									</div>

									<div className="space-y-2">
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

									<div className="space-y-2">
										<Label htmlFor="description">Description *</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder="Detailed workshop description"
											rows={4}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="content">Content *</Label>
										<div className="min-h-[500px]">
											<RichTextEditor
												content={content}
												onChange={setContent}
												placeholder="Write the full workshop content with rich formatting..."
												className="min-h-[500px]"
											/>
										</div>
										<p className="text-sm text-muted-foreground">
											Use the editor toolbar for rich text formatting
										</p>
									</div>
								</div>

								{/* Workshop Details */}
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Settings className="h-5 w-5" />
										</div>
										<h2 className="text-2xl font-bold">Workshop Details</h2>
									</div>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
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

											<div className="space-y-2">
												<Label htmlFor="duration">Duration (minutes)</Label>
												<Input
													id="duration"
													type="number"
													value={formData.duration}
											onChange={(e) =>
												setFormData({
													...formData,
													duration: e.target.value,
												})
											}
													placeholder="120"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="category">Category</Label>
											<Input
												id="category"
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												placeholder="Web Development, AI, etc."
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="tags">Tags</Label>
											<Input
												id="tags"
												value={formData.tags}
												onChange={(e) =>
													setFormData({ ...formData, tags: e.target.value })
												}
												placeholder="react, typescript, hooks (comma-separated)"
											/>
										</div>
									</div>
								</div>

								{/* Event Details */}
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Settings className="h-5 w-5" />
										</div>
										<h2 className="text-2xl font-bold">Event Details</h2>
									</div>
									<div className="space-y-4">
										<div className="flex items-center space-x-2">
											<Switch
												id="isLive"
												checked={formData.isLive}
												onCheckedChange={(checked) =>
													setFormData({ ...formData, isLive: checked })
												}
											/>
											<Label htmlFor="isLive">This is a live workshop</Label>
										</div>

										{formData.isLive && (
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="startDate">Start Date</Label>
													<Input
														id="startDate"
														type="datetime-local"
														value={formData.startDate}
														onChange={(e) =>
															setFormData({ ...formData, startDate: e.target.value })
														}
													/>
												</div>

												<div className="space-y-2">
													<Label htmlFor="endDate">End Date</Label>
													<Input
														id="endDate"
														type="datetime-local"
														value={formData.endDate}
														onChange={(e) =>
															setFormData({ ...formData, endDate: e.target.value })
														}
													/>
												</div>

												<div className="space-y-2">
													<Label htmlFor="maxParticipants">Max Participants</Label>
													<Input
														id="maxParticipants"
														type="number"
														value={formData.maxParticipants}
														onChange={(e) =>
															setFormData({
																...formData,
																maxParticipants: e.target.value,
															})
														}
														placeholder="50"
													/>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Video Details */}
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Video className="h-5 w-5" />
										</div>
										<h2 className="text-2xl font-bold">
											Video Recording (Optional)
										</h2>
									</div>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="videoProvider">Video Provider</Label>
										<Select
											value={formData.videoProvider}
											onValueChange={(value: any) =>
												setFormData({ ...formData, videoProvider: value })
											}
										>
											<SelectTrigger id="videoProvider">
												<SelectValue placeholder="Select provider" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="youtube">YouTube</SelectItem>
												<SelectItem value="bunny">Bunny Stream</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="videoId">Video ID</Label>
										<Input
											id="videoId"
											value={formData.videoId}
											onChange={(e) =>
												setFormData({ ...formData, videoId: e.target.value })
											}
											placeholder="dQw4w9WgXcQ"
										/>
									</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="videoUrl">
												Video URL (Full URL or Embed URL)
											</Label>
											<Input
												id="videoUrl"
												value={formData.videoUrl}
												onChange={(e) =>
													setFormData({ ...formData, videoUrl: e.target.value })
												}
												placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
											/>
											<p className="text-sm text-muted-foreground">
												Paste any YouTube URL - it will be converted to embed format automatically
											</p>
										</div>
									</div>
								</div>

								{/* Access Control */}
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Lock className="h-5 w-5" />
										</div>
										<h2 className="text-2xl font-bold">Access Control</h2>
									</div>
									<div className="space-y-4">
										<div className="space-y-2">
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
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="authenticated">
														Authenticated Users
													</SelectItem>
													<SelectItem value="subscription">
														Subscription Only
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{formData.accessLevel === "subscription" && (
											<div className="space-y-2">
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
									</div>
								</div>

								{/* Publishing Options */}
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Eye className="h-5 w-5" />
										</div>
										<h2 className="text-2xl font-bold">Publishing Options</h2>
									</div>
									<div className="space-y-4">
										<div className="flex items-center space-x-2">
											<Switch
												id="isPublished"
												checked={formData.isPublished}
												onCheckedChange={(checked) =>
													setFormData({ ...formData, isPublished: checked })
												}
											/>
											<Label htmlFor="isPublished">Publish immediately</Label>
										</div>

										<div className="flex items-center space-x-2">
											<Switch
												id="isFeatured"
												checked={formData.isFeatured}
												onCheckedChange={(checked) =>
													setFormData({ ...formData, isFeatured: checked })
												}
											/>
											<Label htmlFor="isFeatured">Feature this workshop</Label>
										</div>
									</div>
								</div>
							</div>

							{/* Form Actions */}
							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex justify-end gap-4">
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={() => navigate({ to: "/admin/workshops" })}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										size="lg"
										disabled={isSubmitting}
										className="shadow-md"
									>
										{isSubmitting ? "Creating..." : "Create Workshop"}
									</Button>
								</div>
							</div>
						</form>
					</div>
				</section>
			</div>
		</>
	);
}
