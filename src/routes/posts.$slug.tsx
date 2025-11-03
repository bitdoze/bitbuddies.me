import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { ArrowLeft, FileText, User } from "lucide-react";
import { useEffect } from "react";

import { api } from "../../convex/_generated/api";
import { generateStructuredData, SEO } from "../components/common/SEO";
import { SectionHeader } from "../components/common/SectionHeader";
import {
	ContentDetailLayout,
	ContentDetailHeader,
	ContentDetailCover,
	AuthRequiredCard,
	TopicsTags,
	PostMeta,
	PostViews,
	PostSharing,
	TiptapRenderer,
} from "../components/content";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useIncrementPostViewCount, usePostBySlug } from "../hooks/usePosts";

export const Route = createFileRoute("/posts/$slug")({
	component: PostPage,
	loader: async ({ params }) => {
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { post: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const post = await client.query(api.posts.getBySlug, {
				slug: params.slug,
			});
			return { post };
		} catch (error) {
			console.error("Failed to prefetch post:", error);
			return { post: null };
		}
	},
});

function PostPage() {
	const { slug } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientPost = usePostBySlug(slug);

	// Prefer loader data, fallback to client fetch
	const post = loaderData?.post ?? clientPost;

	const incrementViewCount = useIncrementPostViewCount();

	// Increment view count on mount (only for accessible posts)
	useEffect(() => {
		if (post && canAccessPost(post)) {
			incrementViewCount({ postId: post._id });
		}
	}, [post?._id]);

	const canAccessPost = (post: any) => {
		if (post.accessLevel === "public") return true;
		if (post.accessLevel === "authenticated" && isAuthenticated) return true;
		if (post.accessLevel === "subscription" && isAuthenticated) return true;
		return false;
	};

	// Loading state
	if (authLoading || post === undefined) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading post...</p>
					</div>
				</div>
			</div>
		);
	}

	// Not found state
	if (!post) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<FileText className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Post Not Found</h1>
							<p className="mb-6 text-muted-foreground">
								The post you're looking for doesn't exist or has been removed.
							</p>
							<Button asChild variant="outline" size="lg">
								<Link to="/posts">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Posts
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Prepare badges
	const badges: Array<{
		label: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}> = [];

	if (post.isFeatured) {
		badges.push({ label: "Featured", variant: "default" });
	}

	if (post.category) {
		badges.push({ label: post.category, variant: "outline" });
	}

	// Structured data for SEO
	const postStructuredData = generateStructuredData({
		type: "Article",
		data: {
			"@type": "BlogPosting",
			headline: post.title,
			description: post.excerpt || post.title,
			image: post.coverAsset?.url,
			datePublished: post.publishedAt
				? new Date(post.publishedAt).toISOString()
				: new Date(post.createdAt).toISOString(),
			dateModified: new Date(post.updatedAt).toISOString(),
			author: {
				"@type": "Person",
				name: post.authorName || "BitBuddies Team",
			},
			publisher: {
				"@type": "Organization",
				name: "BitBuddies",
				logo: {
					"@type": "ImageObject",
					url: "https://bitbuddies.me/logo.png",
				},
			},
		},
	});

	return (
		<>
			<SEO
				title={post.metaTitle || post.title}
				description={post.metaDescription || post.excerpt || post.title}
				keywords={post.tags.join(", ")}
				canonicalUrl={`/posts/${post.slug}`}
				ogImage={post.coverAsset?.url || undefined}
				ogType="article"
			/>
			{postStructuredData}

			<ContentDetailLayout
				sidebar={
					<>
						{/* Post Views */}
						<PostViews viewCount={post.viewCount || 0} variant="default" />

						{/* Post Meta in sidebar */}
						<PostMeta
							author={post.authorName}
							publishedDate={post.publishedAt || post.createdAt}
							updatedDate={post.updatedAt}
							readTime={post.readTime}
							variant="default"
						/>

						{/* Social Sharing */}
						<PostSharing
							title={post.title}
							url={`https://bitbuddies.me/posts/${post.slug}`}
							description={post.excerpt}
							variant="default"
						/>

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<TopicsTags tags={post.tags} title="Tags" variant="card" />
						)}
					</>
				}
			>
				<ContentDetailHeader
					title={post.title}
					description={post.excerpt}
					badges={badges}
					backLink={{ to: "/posts", label: "Back to Posts" }}
					meta={
						<PostMeta
							author={post.authorName}
							publishedDate={post.publishedAt || post.createdAt}
							readTime={post.readTime}
							variant="compact"
						/>
					}
				/>

				<ContentDetailCover
					imageUrl={post.coverAsset?.url || undefined}
					alt={post.title}
				/>

				{!canAccessPost(post) ? (
					<AuthRequiredCard
						title="Sign In to Read This Post"
						description="Create a free account to access exclusive content and join our community."
						features={[
							"Access to all premium posts",
							"Bookmark your favorite articles",
							"Join discussions in comments",
							"Get personalized recommendations",
						]}
					/>
				) : (
					<>
						{/* Post Content */}
						<article className="prose prose-slate dark:prose-invert max-w-none">
							<TiptapRenderer content={post.content} />
						</article>

						{/* Author Bio Section */}
						{post.authorName && (
							<section className="mt-16">
								<SectionHeader eyebrow="Author" title="About the Author" />
								<div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
									<div className="flex items-start gap-4">
										<div className="shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
											<User className="h-8 w-8 text-primary" />
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-bold mb-2">
												{post.authorName}
											</h3>
											<p className="text-muted-foreground">
												Content creator and educator at BitBuddies, sharing
												knowledge and helping developers grow their skills.
											</p>
										</div>
									</div>
								</div>
							</section>
						)}

						{/* Related Posts Section */}
						<section className="mt-16">
							<SectionHeader
								eyebrow="More Reading"
								title="Related Posts"
							/>
							<div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
								<p className="text-muted-foreground">
									More related posts coming soon...
								</p>
							</div>
						</section>
					</>
				)}
			</ContentDetailLayout>
		</>
	);
}
