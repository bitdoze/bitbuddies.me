import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, Eye, Lock, FileText, ArrowRight } from "lucide-react";
import { SEO } from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/posts/")({
	component: PostsPage,
	loader: async () => {
		// Prefetch published posts on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
				return { posts: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const posts = await client.query(api.posts.list, {
				publishedOnly: true,
			});
			return { posts };
		} catch (error) {
			console.error("Failed to prefetch posts:", error);
			return { posts: null };
		}
	},
});

function PostsPage() {
	const { isAuthenticated } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientPosts = usePosts({ publishedOnly: true });

	// Prefer loader data, fallback to client fetch
	const posts = loaderData?.posts ?? clientPosts;

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "";
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatReadTime = (minutes?: number) => {
		if (!minutes) return null;
		return `${minutes} min read`;
	};

	const canAccessPost = (post: any) => {
		if (post.accessLevel === "public") return true;
		if (post.accessLevel === "authenticated" && isAuthenticated) return true;
		// For subscription, would need to check subscription status
		return false;
	};

	return (
		<>
			<SEO
				title="Blog Posts"
				description="Read our latest articles, tutorials, and insights on web development, programming, and technology."
				keywords="blog, articles, tutorials, web development, programming, technology"
			/>
			<div className="w-full">
				{/* Hero Section */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20">
					<div className="container mx-auto px-4">
						<div className="relative z-10 mx-auto max-w-3xl text-center">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
								<FileText className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-primary">
									Our Blog
								</span>
							</div>
							<h1 className="mb-6 text-5xl font-bold tracking-tight">
								Latest Articles & Tutorials
							</h1>
							<p className="text-xl text-muted-foreground">
								Discover insights, tutorials, and best practices from our community
							</p>
						</div>
					</div>

					{/* Decorative blur circles */}
					<div className="pointer-events-none absolute -right-64 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
					<div className="pointer-events-none absolute -left-64 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
				</section>

				{/* Posts Grid Section */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						{!posts || posts.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-md">
									<div className="mb-4 inline-flex rounded-full bg-muted p-6">
										<FileText className="h-12 w-12 text-muted-foreground" />
									</div>
									<h2 className="mb-2 text-2xl font-bold">No posts yet</h2>
									<p className="text-muted-foreground">
										Check back soon for new content!
									</p>
								</div>
							</div>
						) : (
							<div className="mx-auto max-w-7xl">
								{/* Featured Post (if exists) */}
								{posts.find((p) => p.isFeatured) && (
									<div className="mb-12">
										{(() => {
											const featuredPost = posts.find((p) => p.isFeatured);
											if (!featuredPost) return null;

											return (
												<div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all hover:shadow-xl">
													{featuredPost.coverAsset?.url && (
														<div className="aspect-[21/9] overflow-hidden">
															<img
																src={featuredPost.coverAsset.url}
																alt={featuredPost.title}
																className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
															/>
														</div>
													)}
													<div className="p-8">
														<div className="mb-4 flex flex-wrap items-center gap-3">
															<Badge variant="default">Featured</Badge>
															{featuredPost.category && (
																<Badge variant="outline">
																	{featuredPost.category}
																</Badge>
															)}
															{!canAccessPost(featuredPost) && (
																<Badge variant="secondary" className="gap-1">
																	<Lock className="h-3 w-3" />
																	{featuredPost.accessLevel === "authenticated"
																		? "Login Required"
																		: "Subscription Required"}
																</Badge>
															)}
														</div>
														<h2 className="mb-3 text-3xl font-bold">
															{featuredPost.title}
														</h2>
														{featuredPost.excerpt && (
															<p className="mb-4 text-lg text-muted-foreground">
																{featuredPost.excerpt}
															</p>
														)}
														<div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
															{featuredPost.publishedAt && (
																<div className="flex items-center gap-1.5">
																	<Calendar className="h-4 w-4" />
																	{formatDate(featuredPost.publishedAt)}
																</div>
															)}
															{featuredPost.readTime && (
																<div className="flex items-center gap-1.5">
																	<Clock className="h-4 w-4" />
																	{formatReadTime(featuredPost.readTime)}
																</div>
															)}
															<div className="flex items-center gap-1.5">
																<Eye className="h-4 w-4" />
																{featuredPost.viewCount} views
															</div>
														</div>
														<Link
															to="/posts/$slug"
															params={{ slug: featuredPost.slug }}
														>
															<Button size="lg" className="gap-2">
																{canAccessPost(featuredPost)
																	? "Read Article"
																	: "View Details"}
																<ArrowRight className="h-4 w-4" />
															</Button>
														</Link>
													</div>
												</div>
											);
										})()}
									</div>
								)}

								{/* Posts Grid */}
								<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
									{posts
										.filter((post) => !post.isFeatured)
										.map((post) => (
											<Link
												key={post._id}
												to="/posts/$slug"
												params={{ slug: post.slug }}
												className="group"
											>
												<article className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-xl">
													{post.coverAsset?.url ? (
														<div className="aspect-[16/9] overflow-hidden">
															<img
																src={post.coverAsset.url}
																alt={post.title}
																className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
															/>
														</div>
													) : (
														<div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5" />
													)}
													<div className="p-6">
														<div className="mb-3 flex flex-wrap items-center gap-2">
															{post.category && (
																<Badge variant="outline">{post.category}</Badge>
															)}
															{!canAccessPost(post) && (
																<Badge variant="secondary" className="gap-1">
																	<Lock className="h-3 w-3" />
																	{post.accessLevel === "authenticated"
																		? "Login Required"
																		: "Subscription"}
																</Badge>
															)}
														</div>
														<h3 className="mb-2 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
															{post.title}
														</h3>
														{post.excerpt && (
															<p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
																{post.excerpt}
															</p>
														)}
														<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
															{post.publishedAt && (
																<div className="flex items-center gap-1">
																	<Calendar className="h-3 w-3" />
																	{formatDate(post.publishedAt)}
																</div>
															)}
															{post.readTime && (
																<div className="flex items-center gap-1">
																	<Clock className="h-3 w-3" />
																	{formatReadTime(post.readTime)}
																</div>
															)}
														</div>
													</div>
												</article>
											</Link>
										))}
								</div>
							</div>
						)}
					</div>
				</section>
			</div>
		</>
	);
}
