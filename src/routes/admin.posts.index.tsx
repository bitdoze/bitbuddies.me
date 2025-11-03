import { createFileRoute } from "@tanstack/react-router";
import { Edit, Eye, ImageIcon, Plus, Trash2, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { SEO } from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useAuth } from "../hooks/useAuth";
import { useDeletePost, usePosts } from "../hooks/usePosts";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/posts/")({
	component: AdminPostsPage,
	loader: async () => {
		// Prefetch all posts (including unpublished) on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
				return { posts: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const posts = await client.query(api.posts.list, {
				publishedOnly: false,
			});
			return { posts };
		} catch (error) {
			console.error("Failed to prefetch posts:", error);
			return { posts: null };
		}
	},
});

function AdminPostsPage() {
	const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientPosts = usePosts({ publishedOnly: false });

	// Prefer loader data, fallback to client fetch
	const posts = loaderData?.posts ?? clientPosts;
	const deletePost = useDeletePost();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

	if (isLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading posts...</p>
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
		if (!selectedPostId || !user) return;

		try {
			await deletePost({
				clerkId: user.id,
				postId: selectedPostId as any,
			});
			setDeleteDialogOpen(false);
			setSelectedPostId(null);
		} catch (error) {
			console.error("Failed to delete post:", error);
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp).toLocaleDateString();
	};

	const formatReadTime = (minutes?: number) => {
		if (!minutes) return "N/A";
		return `${minutes} min read`;
	};

	return (
		<>
			<SEO
				title="Manage Posts"
				description="Admin dashboard for managing blog posts, creating new content, and editing existing posts."
				noIndex={true}
			/>
			<div className="w-full">
				{/* Header Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12">
					<div className="container mx-auto px-4">
						<div className="relative z-10 flex items-center justify-between">
							<div>
								<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
									<FileText className="h-4 w-4 text-primary" />
									<span className="text-sm font-medium text-primary">
										Admin Dashboard
									</span>
								</div>
								<h1 className="mb-3 text-4xl font-bold tracking-tight">
									Manage Posts
								</h1>
								<p className="text-lg text-muted-foreground">
									Create and manage blog posts for your community
								</p>
							</div>
							<Link to="/admin/posts/create">
								<Button size="lg" className="gap-2">
									<Plus className="h-5 w-5" />
									Create Post
								</Button>
							</Link>
						</div>
					</div>
					{/* Decorative blur circles */}
					<div className="pointer-events-none absolute -right-32 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
					<div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
				</section>

				{/* Posts Table Section */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						{!posts || posts.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-md">
									<div className="mb-4 inline-flex rounded-full bg-muted p-6">
										<FileText className="h-12 w-12 text-muted-foreground" />
									</div>
									<h2 className="mb-2 text-2xl font-bold">No posts yet</h2>
									<p className="mb-6 text-muted-foreground">
										Get started by creating your first blog post.
									</p>
									<Link to="/admin/posts/create">
										<Button size="lg" className="gap-2">
											<Plus className="h-5 w-5" />
											Create Your First Post
										</Button>
									</Link>
								</div>
							</div>
						) : (
							<div className="rounded-2xl border border-border bg-card shadow-lg">
								<div className="border-b border-border bg-card/50 px-6 py-4">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-lg font-semibold">All Posts</h2>
											<p className="text-sm text-muted-foreground">
												{posts.length} {posts.length === 1 ? "post" : "posts"}{" "}
												total
											</p>
										</div>
									</div>
								</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-16"></TableHead>
											<TableHead>Title</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Access</TableHead>
											<TableHead>Read Time</TableHead>
											<TableHead>Views</TableHead>
											<TableHead>Published</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{posts.map((post) => (
											<TableRow key={post._id}>
												<TableCell>
													{post.coverAsset?.url ? (
														<div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
															<img
																src={post.coverAsset.url}
																alt={post.title}
																className="h-full w-full object-cover"
															/>
														</div>
													) : (
														<div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
															<ImageIcon className="h-6 w-6 text-muted-foreground" />
														</div>
													)}
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{post.title}</div>
														{post.excerpt && (
															<div className="line-clamp-1 text-sm text-muted-foreground">
																{post.excerpt}
															</div>
														)}
														{post.isFeatured && (
															<Badge variant="secondary" className="mt-1">
																Featured
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell>
													{post.category ? (
														<Badge variant="outline">{post.category}</Badge>
													) : (
														<span className="text-muted-foreground">—</span>
													)}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															post.isPublished ? "default" : "secondary"
														}
													>
														{post.isPublished ? "Published" : "Draft"}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															post.accessLevel === "public"
																? "default"
																: "outline"
														}
													>
														{post.accessLevel === "public"
															? "Public"
															: post.accessLevel === "authenticated"
																? "Authenticated"
																: "Subscription"}
													</Badge>
												</TableCell>
												<TableCell>
													{formatReadTime(post.readTime)}
												</TableCell>
												<TableCell>{post.viewCount}</TableCell>
												<TableCell>
													{formatDate(post.publishedAt)}
												</TableCell>
												<TableCell>
													<div className="flex justify-end gap-2">
														<Link
															to="/posts/$slug"
															params={{ slug: post.slug }}
															target="_blank"
														>
															<Button variant="ghost" size="icon">
																<Eye className="h-4 w-4" />
															</Button>
														</Link>
														<Link
															to="/admin/posts/$id/edit"
															params={{ id: post._id }}
														>
															<Button variant="ghost" size="icon">
																<Edit className="h-4 w-4" />
															</Button>
														</Link>
														<Dialog
															open={
																deleteDialogOpen &&
																selectedPostId === post._id
															}
															onOpenChange={(open) => {
																setDeleteDialogOpen(open);
																if (!open) setSelectedPostId(null);
															}}
														>
															<DialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setSelectedPostId(post._id)}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Delete Post</DialogTitle>
																	<DialogDescription>
																		Are you sure you want to delete "{post.title}
																		"? This action cannot be undone.
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<Button
																		variant="outline"
																		onClick={() => {
																			setDeleteDialogOpen(false);
																			setSelectedPostId(null);
																		}}
																	>
																		Cancel
																	</Button>
																	<Button
																		variant="destructive"
																		onClick={handleDelete}
																	>
																		Delete
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				</section>
			</div>
		</>
	);
}
