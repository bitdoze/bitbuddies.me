import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { ArrowRight, Calendar, Clock, Eye, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ContentCard } from "@/components/content/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import { SEO } from "../components/common/SEO";
import { useAuth } from "../hooks/useAuth";
import { usePosts } from "../hooks/usePosts";

export const Route = createFileRoute("/posts/")({
	component: PostsPage,
	loader: async () => {
		// Prefetch published posts on the server
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
			<div className="section-spacing bg-gradient-to-b from-primary/10 via-background to-background">
				<div className="container space-y-12">
					<SectionHeader
						eyebrow="The BitBuddies Journal"
						title="Latest articles & tutorials"
						description="Deep dives, playbooks, and community highlights to help you ship better products faster."
						align="center"
					/>
					{!posts || posts.length === 0 ? (
						<div className="surface-muted mx-auto max-w-xl p-10 text-center">
							<h2 className="text-2xl font-semibold">No posts yet</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								We’re drafting something special—check back soon.
							</p>
						</div>
					) : (
						<div className="space-y-12">
							{posts.find((p) => p.isFeatured)
								? (() => {
										const featured = posts.find((p) => p.isFeatured);
										if (!featured) return null;

										return (
											<div className="card-surface overflow-hidden rounded-3xl bg-card/90">
												<div className="grid gap-0 md:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]">
													<div className="relative hidden aspect-[4/3] md:block">
														{featured.coverAsset?.url ? (
															<img
																src={featured.coverAsset.url}
																alt={featured.title}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
														)}
													</div>
													<div className="space-y-6 p-8">
														<div className="flex flex-wrap items-center gap-2">
															<Badge variant="default">Featured</Badge>
															{featured.category ? (
																<Badge variant="secondary">
																	{featured.category}
																</Badge>
															) : null}
															{!canAccessPost(featured) ? (
																<Badge variant="secondary" className="gap-1">
																	<Lock className="h-3 w-3" />
																	{featured.accessLevel === "authenticated"
																		? "Login required"
																		: "Subscription"}
																</Badge>
															) : null}
														</div>
														<h2 className="text-3xl font-bold md:text-4xl">
															{featured.title}
														</h2>
														{featured.excerpt ? (
															<p className="text-base text-muted-foreground">
																{featured.excerpt}
															</p>
														) : null}
														<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
															{featured.publishedAt ? (
																<span className="flex items-center gap-1.5">
																	<Calendar className="h-4 w-4" />
																	{formatDate(featured.publishedAt)}
																</span>
															) : null}
															{featured.readTime ? (
																<span className="flex items-center gap-1.5">
																	<Clock className="h-4 w-4" />
																	{formatReadTime(featured.readTime)}
																</span>
															) : null}
															<span className="flex items-center gap-1.5">
																<Eye className="h-4 w-4" />
																{featured.viewCount} views
															</span>
														</div>
														<Button asChild size="lg" className="gap-2">
															<Link
																to="/posts/$slug"
																params={{ slug: featured.slug }}
															>
																{canAccessPost(featured)
																	? "Read article"
																	: "View details"}
																<ArrowRight className="h-4 w-4" />
															</Link>
														</Button>
													</div>
												</div>
											</div>
										);
									})()
								: null}
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
											<ContentCard
												cover={
													post.coverAsset?.url ? (
														<div className="relative aspect-[16/9] overflow-hidden">
															<img
																src={post.coverAsset.url}
																alt={post.title}
																className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
															/>
														</div>
													) : undefined
												}
												title={post.title}
												description={post.excerpt ?? post.metaDescription}
												badges={
													[
														post.category
															? { label: post.category, variant: "secondary" }
															: undefined,
														!canAccessPost(post)
															? {
																	label:
																		post.accessLevel === "authenticated"
																			? "Login required"
																			: "Subscription",
																	variant: "outline",
																}
															: undefined,
													].filter(Boolean) as Array<{
														label: string;
														variant?:
															| "default"
															| "secondary"
															| "outline"
															| "destructive";
													}>
												}
												meta={
													[
														post.publishedAt
															? {
																	icon: <Calendar className="h-3.5 w-3.5" />,
																	label: formatDate(post.publishedAt),
																}
															: null,
														post.readTime
															? {
																	icon: <Clock className="h-3.5 w-3.5" />,
																	label: formatReadTime(post.readTime) ?? "",
																}
															: null,
													].filter(Boolean) as Array<{
														icon: ReactNode;
														label: string;
													}>
												}
											/>
										</Link>
									))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
