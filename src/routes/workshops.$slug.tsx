import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	ImageIcon,
	Users,
	Video,
} from "lucide-react";
import { useMemo } from "react";
import { generateStructuredData, SEO } from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../hooks/useAuth";
import {
	useWorkshopAttachments,
	useWorkshopBySlug,
} from "../hooks/useWorkshops";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/workshops/$slug")({
	component: WorkshopPage,
	loader: async ({ params }) => {
		// Prefetch workshop data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
				return { workshop: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const workshop = await client.query(api.workshops.getBySlug, {
				slug: params.slug,
			});
			return { workshop };
		} catch (error) {
			console.error("Failed to prefetch workshop:", error);
			return { workshop: null };
		}
	},
});

function WorkshopPage() {
	const { slug } = Route.useParams();
	const { isAuthenticated, isLoading: authLoading } = useAuth();

	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientWorkshop = useWorkshopBySlug(slug);

	// Prefer loader data, fallback to client fetch
	const workshop = loaderData?.workshop ?? clientWorkshop;

	const attachments = useWorkshopAttachments(workshop?._id);

	// Convert YouTube URL to embed URL
	const embedUrl = useMemo(() => {
		if (!workshop?.videoUrl && !workshop?.videoId) return null;

		// If videoUrl is already provided, use it
		if (workshop.videoUrl) {
			// Check if it's already an embed URL
			if (workshop.videoUrl.includes("/embed/")) {
				return workshop.videoUrl;
			}
			// Try to extract video ID from various YouTube URL formats
			const videoIdMatch = workshop.videoUrl.match(
				/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
			);
			if (videoIdMatch) {
				return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
			}
			return workshop.videoUrl;
		}

		// Use videoId if provided
		if (workshop.videoId) {
			if (workshop.videoProvider === "bunny") {
				return workshop.videoId; // Bunny stream URLs are used as-is
			}
			// Default to YouTube if no provider specified or if provider is youtube
			return `https://www.youtube.com/embed/${workshop.videoId}`;
		}

		return null;
	}, [workshop?.videoUrl, workshop?.videoId, workshop?.videoProvider]);

	if (authLoading || workshop === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (!workshop) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Workshop Not Found</CardTitle>
						<CardDescription>
							The workshop you're looking for doesn't exist or has been removed.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline">
							<Link to="/workshops">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Workshops
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Define variables needed for preview
	const formatDate = (timestamp?: number) => {
		if (!timestamp) return null;
		return new Date(timestamp).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isUpcoming = workshop.startDate && workshop.startDate > Date.now();
	const isOngoing =
		workshop.startDate &&
		workshop.endDate &&
		workshop.startDate <= Date.now() &&
		workshop.endDate >= Date.now();
	const isPast = workshop.endDate && workshop.endDate < Date.now();

	if (!isAuthenticated) {
		return (
			<>
				<SEO
					title={workshop.title}
					description={
						workshop.shortDescription || workshop.description.substring(0, 160)
					}
					keywords={workshop.tags.join(", ")}
					canonicalUrl={`/workshops/${workshop.slug}`}
					ogImage={workshop.coverAsset?.url}
					ogType="article"
				/>
				<div className="container mx-auto py-8 max-w-6xl">
					{/* Back Button */}
					<div className="mb-6">
						<Button variant="ghost" asChild>
							<Link to="/workshops">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Workshops
							</Link>
						</Button>
					</div>

					{/* Cover Image with 16:9 aspect ratio */}
					{workshop.coverAsset?.url ? (
						<div
							className="w-full relative rounded-lg overflow-hidden mb-6"
							style={{ paddingBottom: "56.25%" }}
						>
							<img
								src={workshop.coverAsset.url}
								alt={workshop.title}
								className="absolute inset-0 w-full h-full object-cover"
							/>
						</div>
					) : (
						<div
							className="w-full relative bg-muted rounded-lg mb-6"
							style={{ paddingBottom: "56.25%" }}
						>
							<div className="absolute inset-0 flex items-center justify-center">
								<ImageIcon className="h-24 w-24 text-muted-foreground" />
							</div>
						</div>
					)}

					{/* Workshop Preview Header */}
					<div className="space-y-6 mb-8">
						<div className="flex items-start justify-between">
							<div className="space-y-2">
								<h1 className="text-4xl font-bold tracking-tight">
									{workshop.title}
								</h1>
								{workshop.shortDescription && (
									<p className="text-xl text-muted-foreground">
										{workshop.shortDescription}
									</p>
								)}
								<div className="flex flex-wrap gap-2 mt-4">
									<Badge variant="outline">{workshop.level}</Badge>
									{workshop.isLive && workshop.startDate && (
										<>
											{isUpcoming && <Badge variant="default">Upcoming</Badge>}
											{isOngoing && (
												<Badge variant="destructive">Live Now</Badge>
											)}
											{isPast && workshop.videoUrl && (
												<Badge variant="secondary">Recording Available</Badge>
											)}
										</>
									)}
									{workshop.isFeatured && (
										<Badge variant="secondary">Featured</Badge>
									)}
								</div>
							</div>
						</div>

						{/* Workshop Meta */}
						<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
							{workshop.instructorName && (
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									<span>By {workshop.instructorName}</span>
								</div>
							)}
							{workshop.duration && (
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4" />
									<span>{workshop.duration} minutes</span>
								</div>
							)}
							{workshop.startDate && (
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									<span>{formatDate(workshop.startDate)}</span>
								</div>
							)}
						</div>
					</div>

					{/* Authentication Required Card */}
					<Card className="border-primary/50 bg-primary/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle2 className="h-5 w-5 text-primary" />
								Sign In to Access This Workshop
							</CardTitle>
							<CardDescription>
								Create a free account or sign in to access workshop content,
								materials, and community features.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<h4 className="font-medium">
									What you'll get with an account:
								</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
										<span>Full access to all workshop content and videos</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
										<span>Download workshop materials and resources</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
										<span>
											Track your progress across courses and workshops
										</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
										<span>Join live workshop sessions and Q&A</span>
									</li>
								</ul>
							</div>
							<Button size="lg" className="w-full sm:w-auto">
								Sign In to Continue
							</Button>
						</CardContent>
					</Card>

					{/* Workshop Description Preview */}
					<div className="mt-8 space-y-6">
						<div>
							<h2 className="text-2xl font-bold mb-4">About This Workshop</h2>
							<div className="prose prose-gray dark:prose-invert max-w-none">
								<p className="text-muted-foreground line-clamp-6">
									{workshop.description}
								</p>
							</div>
						</div>

						{workshop.tags.length > 0 && (
							<div>
								<h3 className="text-lg font-semibold mb-3">Topics Covered</h3>
								<div className="flex flex-wrap gap-2">
									{workshop.tags.map((tag: string) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</>
		);
	}

	// Format dates for SEO
	const publishedTime = workshop.publishedAt
		? new Date(workshop.publishedAt).toISOString()
		: new Date(workshop.createdAt).toISOString();
	const modifiedTime = new Date(workshop.updatedAt).toISOString();

	return (
		<>
			<SEO
				title={workshop.title}
				description={
					workshop.shortDescription || workshop.description.substring(0, 160)
				}
				keywords={workshop.tags.join(", ")}
				canonicalUrl={`/workshops/${workshop.slug}`}
				ogImage={workshop.coverAsset?.url}
				ogType="article"
				author={workshop.instructorName}
				publishedTime={publishedTime}
			/>
			{generateStructuredData({
				type: "Course",
				name: workshop.title,
				description: workshop.description,
				provider: {
					"@type": "Organization",
					name: "BitBuddies",
				},
				instructor: {
					"@type": "Person",
					name: workshop.instructorName || "BitBuddies Instructor",
				},
				...(workshop.duration && {
					timeRequired: `PT${workshop.duration}M`,
				}),
				...(workshop.coverAsset?.url && {
					image: workshop.coverAsset.url,
				}),
				...(workshop.isLive &&
					workshop.startDate && {
						courseMode: "online",
						startDate: new Date(workshop.startDate).toISOString(),
						...(workshop.endDate && {
							endDate: new Date(workshop.endDate).toISOString(),
						}),
					}),
				educationalLevel: workshop.level,
				inLanguage: "en",
				isAccessibleForFree: workshop.accessLevel === "public",
			})}
			{generateStructuredData({
				type: "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: typeof window !== "undefined" ? window.location.origin : "",
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Workshops",
						item:
							typeof window !== "undefined"
								? `${window.location.origin}/workshops`
								: "",
					},
					{
						"@type": "ListItem",
						position: 3,
						name: workshop.title,
						item:
							typeof window !== "undefined"
								? `${window.location.origin}/workshops/${workshop.slug}`
								: "",
					},
				],
			})}
			<div className="container mx-auto py-8 max-w-6xl">
				{/* Back Button */}
				<div className="mb-6">
					<Button variant="ghost" asChild>
						<Link to="/workshops">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Workshops
						</Link>
					</Button>
				</div>

				{/* Cover Image with 16:9 aspect ratio */}
				{workshop.coverAsset?.url ? (
					<div
						className="w-full relative rounded-lg overflow-hidden mb-6"
						style={{ paddingBottom: "56.25%" }}
					>
						<img
							src={workshop.coverAsset.url}
							alt={workshop.title}
							className="absolute inset-0 w-full h-full object-cover"
						/>
					</div>
				) : (
					<div
						className="w-full relative bg-muted rounded-lg mb-6"
						style={{ paddingBottom: "56.25%" }}
					>
						<div className="absolute inset-0 flex items-center justify-center">
							<ImageIcon className="h-24 w-24 text-muted-foreground" />
						</div>
					</div>
				)}

				{/* Workshop Header */}
				<div className="space-y-6">
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<h1 className="text-4xl font-bold tracking-tight">
								{workshop.title}
							</h1>
							{workshop.shortDescription && (
								<p className="text-xl text-muted-foreground">
									{workshop.shortDescription}
								</p>
							)}
						</div>
						{workshop.isFeatured && (
							<Badge variant="default" className="text-sm">
								Featured
							</Badge>
						)}
					</div>

					{/* Workshop Meta */}
					<div className="flex flex-wrap gap-3">
						<Badge variant="outline" className="text-sm">
							{workshop.level}
						</Badge>
						{workshop.category && (
							<Badge variant="secondary" className="text-sm">
								{workshop.category}
							</Badge>
						)}
						{workshop.isLive && isUpcoming && (
							<Badge variant="default" className="text-sm">
								Upcoming Live
							</Badge>
						)}
						{workshop.isLive && isOngoing && (
							<Badge variant="destructive" className="text-sm">
								Live Now
							</Badge>
						)}
						{workshop.isLive && isPast && (
							<Badge variant="secondary" className="text-sm">
								Ended
							</Badge>
						)}
					</div>

					{workshop.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{workshop.tags.map((tag) => (
								<span
									key={tag}
									className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Video Player - Full Width at Top */}
				{(embedUrl || workshop.videoId || workshop.videoUrl) && (
					<div className="mb-8">
						<Card>
							<CardHeader>
								<CardTitle>
									<Video className="inline-block mr-2 h-5 w-5" />
									Workshop Recording
								</CardTitle>
							</CardHeader>
							<CardContent>
								{embedUrl ? (
									<div className="aspect-video w-full">
										<iframe
											src={embedUrl}
											className="w-full h-full rounded-lg"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											title={workshop.title}
										/>
									</div>
								) : (
									<div className="bg-muted p-4 rounded-lg">
										<p className="text-sm font-medium mb-2">
											Video configuration issue
										</p>
										<pre className="text-xs bg-background p-2 rounded overflow-auto">
											{JSON.stringify(
												{
													videoUrl: workshop.videoUrl,
													videoId: workshop.videoId,
													videoProvider: workshop.videoProvider,
													generatedEmbedUrl: embedUrl,
												},
												null,
												2,
											)}
										</pre>
										<p className="text-xs text-muted-foreground mt-2">
											Please contact the workshop administrator to fix the video
											settings.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Description Card */}
						<Card>
							<CardHeader>
								<CardTitle>About This Workshop</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground whitespace-pre-wrap">
									{workshop.description}
								</p>
							</CardContent>
						</Card>

						{/* Content Card */}
						<Card>
							<CardHeader>
								<CardTitle>Workshop Content</CardTitle>
							</CardHeader>
							<CardContent>
								<div
									className="prose prose-sm max-w-none dark:prose-invert"
									dangerouslySetInnerHTML={{ __html: workshop.content }}
								/>
							</CardContent>
						</Card>

						{/* Attachments */}
						{attachments && attachments.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Workshop Materials</CardTitle>
									<CardDescription>
										Download resources and materials for this workshop
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{attachments.map((attachment: any) => (
											<div
												key={attachment._id}
												className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
											>
												<div className="flex items-center space-x-3">
													<Download className="h-4 w-4 text-muted-foreground" />
													<div>
														<p className="font-medium">
															{attachment.displayName}
														</p>
														{attachment.asset && (
															<p className="text-xs text-muted-foreground">
																{attachment.asset.mimeType} •{" "}
																{(
																	attachment.asset.filesize /
																	1024 /
																	1024
																).toFixed(2)}{" "}
																MB
															</p>
														)}
													</div>
												</div>
												{attachment.asset?.url && (
													<Button size="sm" variant="ghost" asChild>
														<a
															href={attachment.asset.url}
															download
															target="_blank"
															rel="noopener noreferrer"
														>
															Download
														</a>
													</Button>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Workshop Info */}
						<Card>
							<CardHeader>
								<CardTitle>Workshop Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{workshop.duration && (
									<div className="flex items-start space-x-3">
										<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium text-sm">Duration</p>
											<p className="text-sm text-muted-foreground">
												{workshop.duration} minutes
											</p>
										</div>
									</div>
								)}

								{workshop.startDate && (
									<div className="flex items-start space-x-3">
										<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium text-sm">
												{isUpcoming ? "Starts" : isPast ? "Started" : "Started"}
											</p>
											<p className="text-sm text-muted-foreground">
												{formatDate(workshop.startDate)}
											</p>
										</div>
									</div>
								)}

								{workshop.endDate && (
									<div className="flex items-start space-x-3">
										<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium text-sm">
												{isPast ? "Ended" : "Ends"}
											</p>
											<p className="text-sm text-muted-foreground">
												{formatDate(workshop.endDate)}
											</p>
										</div>
									</div>
								)}

								{workshop.maxParticipants && (
									<div className="flex items-start space-x-3">
										<Users className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium text-sm">Participants</p>
											<p className="text-sm text-muted-foreground">
												{workshop.currentParticipants} /{" "}
												{workshop.maxParticipants}
											</p>
										</div>
									</div>
								)}

								{workshop.instructorName && (
									<div>
										<Separator className="my-4" />
										<div>
											<p className="font-medium text-sm mb-1">Instructor</p>
											<p className="text-sm text-muted-foreground">
												{workshop.instructorName}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Enrollment Status */}
						<Card>
							<CardHeader>
								<CardTitle>Enrollment Status</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
									<CheckCircle2 className="h-5 w-5" />
									<span className="font-medium">You have access</span>
								</div>
								<p className="text-sm text-muted-foreground mt-2">
									You're enrolled and can access all workshop materials.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
