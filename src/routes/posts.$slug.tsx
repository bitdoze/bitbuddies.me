import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect } from "react";
import {
	ArrowLeft,
	Calendar,
	Clock,
	Eye,
	Lock,
	FileText,
	User,
	Sparkles,
	Tag,
} from "lucide-react";
import { generateStructuredData, SEO } from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../hooks/useAuth";
import { usePostBySlug, useIncrementPostViewCount } from "../hooks/usePosts";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/posts/$slug")({
	component: PostPage,
	loader: async ({ params }) => {
		// Prefetch post data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
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

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return null;
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
		// For now, treat as requiring authentication
		if (post.accessLevel === "subscription" && isAuthenticated) return true;
		return false;
	};

	// Parse JSON content
	const renderContent = (jsonContent: string) => {
		try {
			const content = JSON.parse(jsonContent);
			return <ContentRenderer content={content} />;
		} catch {
			return <p className="text-muted-foreground">Content unavailable</p>;
		}
	};

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

	// Generate structured data for SEO
	const structuredData = generateStructuredData({
		type: "Article",
		title: post.metaTitle || post.title,
		description: post.metaDescription || post.excerpt || post.title,
		url: `/posts/${post.slug}`,
		image: post.coverAsset?.url,
		datePublished: post.publishedAt
			? new Date(post.publishedAt).toISOString()
			: new Date(post.createdAt).toISOString(),
		dateModified: new Date(post.updatedAt).toISOString(),
		author: post.authorName || "BitBuddies",
	});

	const hasAccess = canAccessPost(post);

	// Preview mode for non-authorized users
	if (!hasAccess) {
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
				{structuredData}
				<div className="w-full">
					{/* Hero Section with Cover Image */}
					<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
						<div className="container mx-auto px-4 py-8">
							<Button variant="ghost" asChild className="mb-6">
								<Link to="/posts">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Posts
								</Link>
							</Button>

							{/* Cover Image */}
							{post.coverAsset?.url && (
								<div
									className="relative mb-8 w-full overflow-hidden rounded-2xl shadow-xl"
									style={{ paddingBottom: "56.25%" }}
								>
									<img
										src={post.coverAsset.url}
										alt={post.title}
										className="absolute inset-0 h-full w-full object-cover"
									/>
								</div>
							)}

							{/* Post Header */}
							<div className="mx-auto max-w-4xl">
								<div className="mb-4 flex flex-wrap items-center gap-3">
									{post.category && (
										<Badge variant="outline">{post.category}</Badge>
									)}
									<Badge variant="secondary" className="gap-1">
										<Lock className="h-3 w-3" />
										{post.accessLevel === "authenticated"
											? "Login Required"
											: "Subscription Required"}
									</Badge>
									{post.isFeatured && <Badge variant="default">Featured</Badge>}
								</div>

								<h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
									{post.title}
								</h1>

								{post.excerpt && (
									<p className="mb-6 text-xl text-muted-foreground">
										{post.excerpt}
									</p>
								)}

								<div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
									{post.authorName && (
										<div className="flex items-center gap-2">
											<User className="h-4 w-4" />
											{post.authorName}
										</div>
									)}
									{post.publishedAt && (
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											{formatDate(post.publishedAt)}
										</div>
									)}
									{post.readTime && (
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											{formatReadTime(post.readTime)}
										</div>
									)}
									<div className="flex items-center gap-2">
										<Eye className="h-4 w-4" />
										{post.viewCount} views
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Access Required Section */}
					<section className="py-16">
						<div className="container mx-auto px-4">
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
									<div className="mb-6 inline-flex rounded-full bg-primary/10 p-6">
										<Lock className="h-12 w-12 text-primary" />
									</div>
									<h2 className="mb-3 text-2xl font-bold">
										{post.accessLevel === "authenticated"
											? "Sign In to Continue Reading"
											: "Subscription Required"}
									</h2>
									<p className="mb-8 text-lg text-muted-foreground">
										{post.accessLevel === "authenticated"
											? "This content is available to all registered users. Sign in or create a free account to continue reading."
											: "This content is exclusive to our subscribers. Upgrade your account to access premium articles and tutorials."}
									</p>
									<div className="mb-8">
										<div className="mb-4">
											<h3 className="mb-3 font-semibold">
												What you'll get with access:
											</h3>
											<ul className="space-y-2 text-left text-sm text-muted-foreground">
												<li className="flex items-start gap-2">
													<Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
													<span>Full article with detailed explanations</span>
												</li>
												<li className="flex items-start gap-2">
													<Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
													<span>Code examples and best practices</span>
												</li>
												<li className="flex items-start gap-2">
													<Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
													<span>Access to all premium content</span>
												</li>
												<li className="flex items-start gap-2">
													<Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
													<span>Community discussions and support</span>
												</li>
											</ul>
										</div>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
										<Button asChild size="lg">
											<a href="/sign-in">Sign In to Continue</a>
										</Button>
										{post.accessLevel === "subscription" && (
											<Button asChild variant="outline" size="lg">
												<Link to="/workshops">View Workshops</Link>
											</Button>
										)}
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</>
		);
	}

	// Full post view for authorized users
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
			{structuredData}
			<div className="w-full">
				{/* Hero Section with Cover Image */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
					<div className="container mx-auto px-4 py-8">
						<Button variant="ghost" asChild className="mb-6">
							<Link to="/posts">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Posts
							</Link>
						</Button>

						{/* Cover Image */}
						{post.coverAsset?.url && (
							<div
								className="relative mb-8 w-full overflow-hidden rounded-2xl shadow-xl"
								style={{ paddingBottom: "56.25%" }}
							>
								<img
									src={post.coverAsset.url}
									alt={post.title}
									className="absolute inset-0 h-full w-full object-cover"
								/>
							</div>
						)}

						{/* Post Header */}
						<div className="mx-auto max-w-4xl">
							<div className="mb-4 flex flex-wrap items-center gap-3">
								{post.category && (
									<Badge variant="outline">{post.category}</Badge>
								)}
								{post.isFeatured && <Badge variant="default">Featured</Badge>}
								{post.accessLevel !== "public" && (
									<Badge variant="secondary">
										{post.accessLevel === "authenticated"
											? "Members Only"
											: "Premium"}
									</Badge>
								)}
							</div>

							<h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
								{post.title}
							</h1>

							{post.excerpt && (
								<p className="mb-6 text-xl text-muted-foreground">
									{post.excerpt}
								</p>
							)}

							<div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								{post.authorName && (
									<div className="flex items-center gap-2">
										<User className="h-4 w-4" />
										{post.authorName}
									</div>
								)}
								{post.publishedAt && (
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										{formatDate(post.publishedAt)}
									</div>
								)}
								{post.readTime && (
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										{formatReadTime(post.readTime)}
									</div>
								)}
								<div className="flex items-center gap-2">
									<Eye className="h-4 w-4" />
									{post.viewCount} views
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Content Section */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-4xl">
							<article className="prose prose-lg dark:prose-invert max-w-none">
								{renderContent(post.content)}
							</article>

							{/* Tags */}
							{post.tags.length > 0 && (
								<>
									<Separator className="my-12" />
									<div className="flex flex-wrap items-center gap-3">
										<div className="flex items-center gap-2 text-sm font-medium">
											<Tag className="h-4 w-4" />
											Tags:
										</div>
										{post.tags.map((tag) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								</>
							)}
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

// Content renderer for JSONContent with proper styling
function ContentRenderer({ content }: { content: any }) {
	if (!content || !content.content) {
		return <p className="text-muted-foreground">No content available</p>;
	}

	const renderNode = (node: any, index: number): React.ReactNode => {
		const key = `${node.type}-${index}`;

		switch (node.type) {
			case "paragraph":
				return (
					<p key={key} className="mb-4 leading-7">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</p>
				);

			case "heading":
				const level = node.attrs?.level || 1;
				const headingClasses: Record<number, string> = {
					1: "text-4xl font-bold tracking-tight mb-6 mt-8",
					2: "text-3xl font-bold tracking-tight mb-5 mt-7",
					3: "text-2xl font-bold tracking-tight mb-4 mt-6",
					4: "text-xl font-bold mb-3 mt-5",
					5: "text-lg font-bold mb-3 mt-4",
					6: "text-base font-bold mb-2 mt-4",
				};
				const className = headingClasses[level] || "text-base font-bold mb-2 mt-4";

				return React.createElement(
					`h${level}`,
					{ key, className },
					node.content?.map((child: any, i: number) => renderNode(child, i))
				);

			case "text":
				let text: React.ReactNode = node.text;
				if (node.marks) {
					for (const mark of node.marks) {
						switch (mark.type) {
							case "bold":
								text = <strong className="font-bold">{text}</strong>;
								break;
							case "italic":
								text = <em className="italic">{text}</em>;
								break;
							case "underline":
								text = <u className="underline">{text}</u>;
								break;
							case "strike":
								text = <s className="line-through">{text}</s>;
								break;
							case "code":
								text = <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{text}</code>;
								break;
							case "link":
								text = (
									<a
										href={mark.attrs?.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary underline underline-offset-4 hover:text-primary/80"
									>
										{text}
									</a>
								);
								break;
						}
					}
				}
				return <span key={key}>{text}</span>;

			case "bulletList":
				return (
					<ul key={key} className="my-6 ml-6 list-disc space-y-2">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</ul>
				);

			case "orderedList":
				return (
					<ol key={key} className="my-6 ml-6 list-decimal space-y-2" start={node.attrs?.start || 1}>
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</ol>
				);

			case "listItem":
				return (
					<li key={key} className="leading-7">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</li>
				);

			case "taskList":
				return (
					<ul key={key} className="my-6 ml-0 space-y-2 list-none">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</ul>
				);

			case "taskItem":
				return (
					<li key={key} className="flex items-start gap-2">
						<input
							type="checkbox"
							checked={node.attrs?.checked || false}
							readOnly
							className="mt-1 h-4 w-4 rounded border-gray-300"
						/>
						<div className="flex-1">
							{node.content?.map((child: any, i: number) => renderNode(child, i))}
						</div>
					</li>
				);

			case "blockquote":
				return (
					<blockquote key={key} className="my-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</blockquote>
				);

			case "codeBlock":
				const language = node.attrs?.language || "text";
				return (
					<pre key={key} className="my-6 overflow-x-auto rounded-lg bg-muted p-4">
						<code className="font-mono text-sm" data-language={language}>
							{node.content?.map((child: any, i: number) =>
								child.type === "text" ? child.text : renderNode(child, i)
							)}
						</code>
					</pre>
				);

			case "table":
				return (
					<div key={key} className="my-6 overflow-x-auto">
						<table className="w-full border-collapse border border-border">
							<tbody>
								{node.content?.map((child: any, i: number) => renderNode(child, i))}
							</tbody>
						</table>
					</div>
				);

			case "tableRow":
				return (
					<tr key={key} className="border-b border-border">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</tr>
				);

			case "tableCell":
				return (
					<td key={key} className="border border-border px-4 py-2">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</td>
				);

			case "tableHeader":
				return (
					<th key={key} className="border border-border bg-muted px-4 py-2 font-bold text-left">
						{node.content?.map((child: any, i: number) => renderNode(child, i))}
					</th>
				);

			case "hardBreak":
				return <br key={key} />;

			default:
				console.warn("Unhandled node type:", node.type);
				return null;
		}
	};

	return (
		<div className="content-renderer">
			{content.content.map((node: any, index: number) => renderNode(node, index))}
		</div>
	);
}
