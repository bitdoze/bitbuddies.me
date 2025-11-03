import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	AlertCircle,
	Edit,
	Eye,
	FileText,
	ImageIcon,
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
import { useDeletePost, usePosts } from "@/hooks/usePosts";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/admin/posts/")({
	component: AdminPostsPage,
	loader: async () => {
		// Prefetch all posts (including unpublished) on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
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
				<div className="container flex h-[60vh] items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-sm text-muted-foreground">Loading posts…</p>
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

	const totalPosts = posts?.length ?? 0;
	const publishedPosts = posts?.filter((post) => post.isPublished).length ?? 0;
	const draftPosts = posts?.filter((post) => !post.isPublished).length ?? 0;
	const featuredPosts = posts?.filter((post) => post.isFeatured).length ?? 0;
	const totalViews =
		posts?.reduce((sum, post) => sum + (post.viewCount ?? 0), 0) ?? 0;
	const readDurations = (posts ?? [])
		.map((post) => post.readTime)
		.filter((value): value is number => typeof value === "number" && value > 0);
	const averageReadTime = readDurations.length
		? `${Math.round(readDurations.reduce((sum, value) => sum + value, 0) / readDurations.length)} min`
		: "—";
	const accessCounts = (posts ?? []).reduce(
		(acc, post) => {
			acc[post.accessLevel as keyof typeof acc] += 1;
			return acc;
		},
		{ public: 0, authenticated: 0, subscription: 0 },
	);

	return (
		<>
			<SEO
				title="Manage Posts"
				description="Admin dashboard for managing blog posts, creating new content, and editing existing posts."
				noIndex={true}
			/>
			<div className="container space-y-12 py-12">
				<AdminShell>
					<AdminHeader
						eyebrow="Content management"
						title="Manage posts"
						description="Review performance, adjust visibility, and publish updates to keep the community in the loop."
						actions={
							<Button asChild size="lg" className="gap-2">
								<Link to="/admin/posts/create">
									<Plus className="h-5 w-5" />
									New post
								</Link>
							</Button>
						}
						stats={[
							{ label: "Published", value: publishedPosts },
							{ label: "Drafts", value: draftPosts },
							{ label: "Featured", value: featuredPosts },
							{ label: "Total views", value: totalViews.toLocaleString() },
						]}
					/>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<AdminStatCard
							label="Average read time"
							value={averageReadTime}
							description="Across posts with read-time estimates"
						/>
						<AdminStatCard
							label="Public access"
							value={accessCounts.public}
							description="Visible without signing in"
						/>
						<AdminStatCard
							label="Members"
							value={accessCounts.authenticated}
							description="Requires authenticated users"
						/>
						<AdminStatCard
							label="Premium"
							value={accessCounts.subscription}
							description="Subscription-only articles"
						/>
					</div>
					<AdminTable
						title="All posts"
						description="Synchronised with the public blog in real time."
						badge={<Badge variant="secondary">{totalPosts}</Badge>}
					>
						{!posts || posts.length === 0 ? (
							<div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
								<div className="rounded-full bg-muted p-5 text-muted-foreground">
									<FileText className="h-10 w-10" />
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold text-foreground">
										No posts yet
									</h3>
									<p className="text-sm text-muted-foreground">
										Launch the blog with your first announcement.
									</p>
								</div>
								<Button asChild size="sm" className="gap-2">
									<Link to="/admin/posts/create">
										<Plus className="h-4 w-4" />
										Create post
									</Link>
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-16" />
											<TableHead>Title</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Access</TableHead>
											<TableHead>Read time</TableHead>
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
														<div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
															<img
																src={post.coverAsset.url}
																alt={post.title}
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
														<div className="font-medium text-foreground">
															{post.title}
														</div>
														{post.excerpt ? (
															<p className="line-clamp-1 text-xs text-muted-foreground">
																{post.excerpt}
															</p>
														) : null}
														{post.isFeatured ? (
															<Badge variant="secondary" className="text-xs">
																Featured
															</Badge>
														) : null}
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
														variant={post.isPublished ? "default" : "secondary"}
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
												<TableCell>{formatReadTime(post.readTime)}</TableCell>
												<TableCell>{post.viewCount ?? 0}</TableCell>
												<TableCell>{formatDate(post.publishedAt)}</TableCell>
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
																deleteDialogOpen && selectedPostId === post._id
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
																	<DialogTitle>Delete post</DialogTitle>
																	<DialogDescription>
																		Are you sure you want to delete "
																		{post.title}"? This action cannot be undone.
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
					</AdminTable>
				</AdminShell>
			</div>
		</>
	);
}
