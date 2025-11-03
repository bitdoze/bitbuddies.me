import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	ImageIcon,
	Users,
	Sparkles,
	FileText,
	Play,
} from "lucide-react";

import { generateStructuredData, SEO } from "../components/common/SEO";
import { WorkshopVideoPlayer } from "../components/common/VideoPlayer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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

	if (authLoading || workshop === undefined) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading workshop...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!workshop) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<FileText className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Workshop Not Found</h1>
							<p className="mb-6 text-muted-foreground">
								The workshop you're looking for doesn't exist or has been removed.
							</p>
							<Button asChild variant="outline" size="lg">
								<Link to="/workshops">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Workshops
								</Link>
							</Button>
						</div>
					</div>
				</div>
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
				<div className="w-full">
					{/* Hero Section with Cover Image */}
					<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
						<div className="container mx-auto px-4 py-8">
							<Button variant="ghost" asChild className="mb-6">
								<Link to="/workshops">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Workshops
								</Link>
							</Button>

							{/* Cover Image */}
							{workshop.coverAsset?.url ? (
								<div className="w-full relative rounded-2xl overflow-hidden shadow-xl mb-8" style={{ paddingBottom: "56.25%" }}>
									<img
										src={workshop.coverAsset.url}
										alt={workshop.title}
										className="absolute inset-0 w-full h-full object-cover"
									/>
								</div>
							) : (
								<div className="w-full relative bg-muted rounded-2xl mb-8 shadow-xl" style={{ paddingBottom: "56.25%" }}>
									<div className="absolute inset-0 flex items-center justify-center">
										<ImageIcon className="h-24 w-24 text-muted-foreground" />
									</div>
								</div>
							)}

							{/* Workshop Header */}
							<div className="max-w-4xl mx-auto text-center mb-12">
								<div className="flex flex-wrap items-center justify-center gap-2 mb-6">
									<Badge variant="outline" className="text-sm">{workshop.level}</Badge>
									{workshop.isLive && workshop.startDate && (
										<>
											{isUpcoming && <Badge variant="default">Upcoming</Badge>}
											{isOngoing && <Badge variant="destructive">Live Now</Badge>}
											{isPast && workshop.videoUrl && (
												<Badge variant="secondary">Recording Available</Badge>
											)}
										</>
									)}
									{workshop.isFeatured && <Badge variant="secondary">Featured</Badge>}
								</div>
								<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
									{workshop.title}
								</h1>
								{workshop.shortDescription && (
									<p className="text-xl text-muted-foreground mb-6">
										{workshop.shortDescription}
									</p>
								)}

								{/* Workshop Meta */}
								<div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
						</div>

						{/* Decorative elements */}
						<div className="absolute left-0 top-0 -z-10 h-full w-full">
							<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
							<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
						</div>
					</section>

					{/* Authentication Required Section */}
					<section className="py-16 bg-muted/30">
						<div className="container mx-auto px-4">
							<div className="max-w-3xl mx-auto">
								<div className="rounded-2xl border border-primary/30 bg-card p-8 md:p-12 shadow-lg">
									<div className="text-center mb-8">
										<div className="inline-flex rounded-full bg-primary/10 p-4 mb-4">
											<CheckCircle2 className="h-12 w-12 text-primary" />
										</div>
										<h2 className="text-3xl font-bold mb-3">
											Sign In to Access This Workshop
										</h2>
										<p className="text-lg text-muted-foreground">
											Create a free account or sign in to access workshop content, materials, and community features.
										</p>
									</div>

									<div className="space-y-4 mb-8">
										<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
											<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-sm">Full access to all workshop content and videos</span>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
											<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-sm">Download workshop materials and resources</span>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
											<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-sm">Track your progress across courses and workshops</span>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
											<CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-sm">Join live workshop sessions and Q&A</span>
										</div>
									</div>

									<Button size="lg" className="w-full shadow-md">
										Sign In to Continue
									</Button>
								</div>
							</div>
						</div>
					</section>

					{/* About Section */}
					<section className="py-16">
						<div className="container mx-auto px-4">
							<div className="max-w-4xl mx-auto">
								<div className="mb-8 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<FileText className="h-6 w-6" />
									</div>
									<h2 className="text-3xl font-bold">About This Workshop</h2>
								</div>
								<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
									<p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
										{workshop.description}
									</p>
								</div>

								{workshop.tags.length > 0 && (
									<div className="mt-8">
										<h3 className="text-xl font-semibold mb-4">Topics Covered</h3>
										<div className="flex flex-wrap gap-2">
											{workshop.tags.map((tag: string) => (
												<span
													key={tag}
													className="text-sm px-3 py-1.5 bg-muted rounded-lg text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
												>
													#{tag}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</section>
				</div>
			</>
		);
	}

	// Format dates for SEO
	const publishedTime = workshop.publishedAt
		? new Date(workshop.publishedAt).toISOString()
		: new Date(workshop.createdAt).toISOString();

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
			<div className="w-full">
				{/* Hero Section with Cover Image */}
				<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
					<div className="container mx-auto px-4 py-8">
						<Button variant="ghost" asChild className="mb-6">
							<Link to="/workshops">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Workshops
							</Link>
						</Button>

						{/* Cover Image */}
						{workshop.coverAsset?.url ? (
							<div className="w-full relative rounded-2xl overflow-hidden shadow-xl mb-8" style={{ paddingBottom: "56.25%" }}>
								<img
									src={workshop.coverAsset.url}
									alt={workshop.title}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							</div>
						) : (
							<div className="w-full relative bg-muted rounded-2xl mb-8 shadow-xl" style={{ paddingBottom: "56.25%" }}>
								<div className="absolute inset-0 flex items-center justify-center">
									<ImageIcon className="h-24 w-24 text-muted-foreground" />
								</div>
							</div>
						)}

						{/* Workshop Header */}
						<div className="max-w-4xl mx-auto text-center mb-12">
							<div className="flex flex-wrap items-center justify-center gap-2 mb-6">
								<Badge variant="outline" className="text-sm">{workshop.level}</Badge>
								{workshop.category && (
									<Badge variant="secondary" className="text-sm">{workshop.category}</Badge>
								)}
								{workshop.isLive && isUpcoming && <Badge variant="default" className="text-sm">Upcoming Live</Badge>}
								{workshop.isLive && isOngoing && <Badge variant="destructive" className="text-sm">Live Now</Badge>}
								{workshop.isLive && isPast && <Badge variant="secondary" className="text-sm">Ended</Badge>}
								{workshop.isFeatured && <Badge variant="secondary" className="text-sm">Featured</Badge>}
							</div>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
								{workshop.title}
							</h1>
							{workshop.shortDescription && (
								<p className="text-xl text-muted-foreground mb-6">
									{workshop.shortDescription}
								</p>
							)}

							{workshop.tags.length > 0 && (
								<div className="flex flex-wrap items-center justify-center gap-2 mb-6">
									{workshop.tags.map((tag) => (
										<span
											key={tag}
											className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground font-medium"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Decorative elements */}
					<div className="absolute left-0 top-0 -z-10 h-full w-full">
						<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
						<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
					</div>
				</section>

				{/* Video Player Section */}
				{(workshop.videoId || workshop.videoUrl) && (
					<section className="py-16 bg-muted/30">
						<div className="container mx-auto px-4">
							<div className="max-w-5xl mx-auto">
								<div className="mb-8 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										<Play className="h-6 w-6" />
									</div>
									<h2 className="text-3xl font-bold">Workshop Recording</h2>
								</div>
								<div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
									<WorkshopVideoPlayer workshop={workshop} />
								</div>
							</div>
						</div>
					</section>
				)}

				{/* Main Content Section */}
				<section className="py-16">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Content */}
							<div className="lg:col-span-2 space-y-8">
								{/* About Section */}
								<div>
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<FileText className="h-6 w-6" />
										</div>
										<h2 className="text-3xl font-bold">About This Workshop</h2>
									</div>
									<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
										<p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
											{workshop.description}
										</p>
									</div>
								</div>

								{/* Content Section */}
								<div>
									<div className="mb-6 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2 text-primary">
											<Sparkles className="h-6 w-6" />
										</div>
										<h2 className="text-3xl font-bold">Workshop Content</h2>
									</div>
									<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
										<div
											className="prose prose-sm max-w-none dark:prose-invert"
											dangerouslySetInnerHTML={{ __html: workshop.content }}
										/>
									</div>
								</div>

								{/* Attachments Section */}
								{attachments && attachments.length > 0 && (
									<div>
										<div className="mb-6 flex items-center gap-3">
											<div className="rounded-lg bg-primary/10 p-2 text-primary">
												<Download className="h-6 w-6" />
											</div>
											<h2 className="text-3xl font-bold">Workshop Materials</h2>
										</div>
										<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
											<p className="text-sm text-muted-foreground mb-4">
												Download resources and materials for this workshop
											</p>
											<div className="space-y-3">
												{attachments.map((attachment: any) => (
													<div
														key={attachment._id}
														className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all hover:shadow-sm"
													>
														<div className="flex items-center space-x-3">
															<div className="rounded-lg bg-primary/10 p-2">
																<Download className="h-4 w-4 text-primary" />
															</div>
															<div>
																<p className="font-medium text-sm">
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
															<Button size="sm" variant="ghost" asChild className="shadow-sm">
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
										</div>
									</div>
								)}
							</div>

							{/* Sidebar */}
							<div className="space-y-8">
								{/* Workshop Details */}
								<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
									<h3 className="text-xl font-bold mb-6">Workshop Details</h3>
									<div className="space-y-5">
										{workshop.duration && (
											<div className="flex items-start gap-3">
												<div className="rounded-lg bg-muted p-2">
													<Clock className="h-5 w-5 text-muted-foreground" />
												</div>
												<div>
													<p className="font-medium text-sm">Duration</p>
													<p className="text-sm text-muted-foreground">
														{workshop.duration} minutes
													</p>
												</div>
											</div>
										)}

										{workshop.startDate && (
											<div className="flex items-start gap-3">
												<div className="rounded-lg bg-muted p-2">
													<Calendar className="h-5 w-5 text-muted-foreground" />
												</div>
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
											<div className="flex items-start gap-3">
												<div className="rounded-lg bg-muted p-2">
													<Calendar className="h-5 w-5 text-muted-foreground" />
												</div>
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
											<div className="flex items-start gap-3">
												<div className="rounded-lg bg-muted p-2">
													<Users className="h-5 w-5 text-muted-foreground" />
												</div>
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
											<>
												<Separator className="my-4" />
												<div className="flex items-start gap-3">
													<div className="rounded-lg bg-muted p-2">
														<Users className="h-5 w-5 text-muted-foreground" />
													</div>
													<div>
														<p className="font-medium text-sm">Instructor</p>
														<p className="text-sm text-muted-foreground">
															{workshop.instructorName}
														</p>
													</div>
												</div>
											</>
										)}
									</div>
								</div>

								{/* Enrollment Status */}
								<div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-md">
									<h3 className="text-xl font-bold mb-4">Enrollment Status</h3>
									<div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
										<CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
										<div>
											<p className="font-medium text-sm">You have access</p>
											<p className="text-xs text-muted-foreground">
												You're enrolled and can access all materials
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
