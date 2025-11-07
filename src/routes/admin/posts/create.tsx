import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, FileText, Save } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMediaAsset } from "@/hooks/useMediaAssets";
import { useCreatePost } from "@/hooks/usePosts";

export const Route = createFileRoute("/admin/posts/create")({
	component: CreatePostPage,
});

function CreatePostPage() {
	const { isAuthenticated, isLoading, isAdmin, user, convexUser } = useAuth();
	const createPost = useCreatePost();
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
		excerpt: "",
		category: "",
		tags: "",
		readTime: "",
		accessLevel: "public" as "public" | "authenticated" | "subscription",
		requiredTier: undefined as "basic" | "premium" | undefined,
		isPublished: false,
		isFeatured: false,
		metaTitle: "",
		metaDescription: "",
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

			await createPost({
				clerkId: user.id,
				title: formData.title,
				slug: formData.slug,
				excerpt: formData.excerpt || undefined,
				content: JSON.stringify(content),
				coverAssetId: coverAssetId,
				category: formData.category || undefined,
				tags: tagsArray,
				readTime: formData.readTime ? Number(formData.readTime) : undefined,
				accessLevel: formData.accessLevel || "public",
				requiredTier: formData.requiredTier || undefined,
				isPublished: formData.isPublished,
				isFeatured: formData.isFeatured,
				authorId: convexUser._id,
				authorName: user.fullName || user.primaryEmailAddress?.emailAddress,
				metaTitle: formData.metaTitle || undefined,
				metaDescription: formData.metaDescription || undefined,
			});

			navigate({ to: "/admin/posts" });
		} catch (error) {
			console.error("Failed to create post:", error);
			alert("Failed to create post. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<SEO
				title="Create Post"
				description="Create a new blog post with rich content, images, and access controls."
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<Button
							variant="ghost"
							onClick={() => navigate({ to: "/admin/posts" })}
							className="mb-6"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Posts
						</Button>

						<div className="relative z-10">
							<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
								<FileText className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-primary">
									Admin Dashboard
								</span>
							</div>
							<h1 className="mb-3 text-4xl font-bold tracking-tight">
								Create New Post
							</h1>
							<p className="text-lg text-muted-foreground">
								Write and publish engaging content for your community
							</p>
						</div>
					</div>

					{/* Decorative elements */}
					<div className="pointer-events-none absolute -right-32 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
					<div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
				</section>

				{/* Form Section */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
							{/* Basic Information */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">Basic Information</h2>
								</div>

								<div className="space-y-6">
									<div>
										<Label htmlFor="title">Title *</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) => handleTitleChange(e.target.value)}
											placeholder="Enter post title"
											required
										/>
									</div>

									<div>
										<Label htmlFor="slug">Slug *</Label>
										<Input
											id="slug"
											value={formData.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
											placeholder="post-url-slug"
											required
										/>
										<p className="mt-1 text-sm text-muted-foreground">
											URL-friendly version of the title
										</p>
									</div>

									<div>
										<Label htmlFor="excerpt">Excerpt</Label>
										<Textarea
											id="excerpt"
											value={formData.excerpt}
											onChange={(e) =>
												setFormData({ ...formData, excerpt: e.target.value })
											}
											placeholder="Brief summary of the post (shown in lists)"
											rows={3}
										/>
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

							{/* Content */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">Content</h2>
								</div>

								<div className="min-h-[500px]">
									<RichTextEditor
										content={content}
										onChange={setContent}
										placeholder="Start writing your post..."
										className="min-h-[500px]"
									/>
								</div>
							</div>

							{/* Metadata */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">Metadata</h2>
								</div>

								<div className="space-y-6">
									<div className="grid gap-6 md:grid-cols-2">
										<div>
											<Label htmlFor="category">Category</Label>
											<Input
												id="category"
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												placeholder="e.g., Tutorials, News"
											/>
										</div>

										<div>
											<Label htmlFor="readTime">Read Time (minutes)</Label>
											<Input
												id="readTime"
												type="number"
												min="1"
												value={formData.readTime}
												onChange={(e) =>
													setFormData({ ...formData, readTime: e.target.value })
												}
												placeholder="e.g., 5"
											/>
										</div>
									</div>

									<div>
										<Label htmlFor="tags">Tags</Label>
										<Input
											id="tags"
											value={formData.tags}
											onChange={(e) =>
												setFormData({ ...formData, tags: e.target.value })
											}
											placeholder="Separate tags with commas (e.g., react, typescript, tutorial)"
										/>
										<p className="mt-1 text-sm text-muted-foreground">
											Comma-separated list of tags
										</p>
									</div>
								</div>
							</div>

							{/* Access Control */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">Access Control</h2>
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
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="public">
													Public - Available to everyone
												</SelectItem>
												<SelectItem value="authenticated">
													Authenticated - Requires login
												</SelectItem>
												<SelectItem value="subscription">
													Subscription - Requires active subscription
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{formData.accessLevel === "subscription" && (
										<div>
											<Label htmlFor="requiredTier">Required Tier</Label>
											<Select
												value={formData.requiredTier || ""}
												onValueChange={(value: any) =>
													setFormData({
														...formData,
														requiredTier: value || undefined,
													})
												}
											>
												<SelectTrigger>
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

							{/* SEO */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">SEO Settings</h2>
								</div>

								<div className="space-y-6">
									<div>
										<Label htmlFor="metaTitle">Meta Title</Label>
										<Input
											id="metaTitle"
											value={formData.metaTitle}
											onChange={(e) =>
												setFormData({ ...formData, metaTitle: e.target.value })
											}
											placeholder="Custom title for search engines (defaults to post title)"
										/>
									</div>

									<div>
										<Label htmlFor="metaDescription">Meta Description</Label>
										<Textarea
											id="metaDescription"
											value={formData.metaDescription}
											onChange={(e) =>
												setFormData({
													...formData,
													metaDescription: e.target.value,
												})
											}
											placeholder="Brief description for search engines (defaults to excerpt)"
											rows={3}
										/>
									</div>
								</div>
							</div>

							{/* Publishing Options */}
							<div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-md">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<h2 className="text-2xl font-bold">Publishing Options</h2>
								</div>

								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="isPublished"
											checked={formData.isPublished}
											onCheckedChange={(checked) =>
												setFormData({
													...formData,
													isPublished: checked as boolean,
												})
											}
										/>
										<Label
											htmlFor="isPublished"
											className="cursor-pointer font-normal"
										>
											Publish immediately
										</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="isFeatured"
											checked={formData.isFeatured}
											onCheckedChange={(checked) =>
												setFormData({
													...formData,
													isFeatured: checked as boolean,
												})
											}
										/>
										<Label
											htmlFor="isFeatured"
											className="cursor-pointer font-normal"
										>
											Feature this post (show prominently on homepage)
										</Label>
									</div>
								</div>
							</div>

							{/* Submit Button */}
							<div className="flex justify-end gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate({ to: "/admin/posts" })}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting} className="gap-2">
									{isSubmitting ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Creating...
										</>
										) : (
											<>
												<Save className="h-4 w-4" />
												Create Post
											</>
										)}
								</Button>
							</div>
						</form>
					</div>
				</section>
			</div>
		</>
	);
}
