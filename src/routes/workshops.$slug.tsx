import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { ArrowLeft, Calendar, Clock, FileText, Users } from "lucide-react";
import { useEffect } from "react";

import { api } from "../../convex/_generated/api";
import { generateStructuredData, SEO } from "../components/common/SEO";
import { SectionHeader } from "../components/common/SectionHeader";
import { WorkshopVideoPlayer } from "../components/common/VideoPlayer";
import type { MetaItem, Resource } from "../components/content";
import {
	AuthRequiredCard,
	ContentDetailCover,
	ContentDetailHeader,
	ContentDetailLayout,
	MetaInfoCard,
	ResourcesList,
	TiptapRenderer,
	TopicsTags,
	WorkshopStatus,
} from "../components/content";
import { WorkshopViews } from "../components/content/workshop/WorkshopViews";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import {
	useWorkshopAttachments,
	useWorkshopBySlug,
	useIncrementWorkshopViewCount,
} from "../hooks/useWorkshops";

export const Route = createFileRoute("/workshops/$slug")({
	component: WorkshopPage,
	loader: async ({ params }) => {
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
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
	const incrementViewCount = useIncrementWorkshopViewCount();

	// Increment view count on mount (only for accessible workshops)
	useEffect(() => {
		if (workshop && canAccessWorkshop(workshop)) {
			incrementViewCount({ workshopId: workshop._id });
		}
	}, [workshop?._id]);

	const canAccessWorkshop = (workshop: any) => {
		if (workshop.accessLevel === "public") return true;
		if (workshop.accessLevel === "authenticated" && isAuthenticated) return true;
		if (workshop.accessLevel === "subscription" && isAuthenticated) return true;
		return false;
	};

	// Loading state
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

	// Not found state
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
								The workshop you're looking for doesn't exist or has been
								removed.
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

	// Format date helper
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

	// Workshop status
	const isUpcoming = workshop.startDate && workshop.startDate > Date.now();
	const isOngoing =
		workshop.startDate &&
		workshop.endDate &&
		workshop.startDate <= Date.now() &&
		workshop.endDate >= Date.now();
	const isPast = workshop.endDate && workshop.endDate < Date.now();

	// Prepare meta items for sidebar
	const metaItems: MetaItem[] = [];

	if (workshop.instructorName) {
		metaItems.push({
			icon: <Users className="h-4 w-4" />,
			label: "Instructor",
			value: workshop.instructorName,
		});
	}

	if (workshop.duration) {
		metaItems.push({
			icon: <Clock className="h-4 w-4" />,
			label: "Duration",
			value: `${workshop.duration} minutes`,
		});
	}

	if (workshop.startDate) {
		metaItems.push({
			icon: <Calendar className="h-4 w-4" />,
			label: isUpcoming ? "Starts" : isPast ? "Started" : "Date",
			value: formatDate(workshop.startDate) || "TBA",
		});
	}

	// Prepare badges
	const badges: Array<{
		label: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}> = [{ label: workshop.level, variant: "secondary" }];

	if (isOngoing && workshop.isLive) {
		badges.push({ label: "Live Now", variant: "destructive" });
	} else if (isUpcoming) {
		badges.push({ label: "Upcoming", variant: "default" });
	} else if (isPast && workshop.videoUrl) {
		badges.push({ label: "Recording Available", variant: "secondary" });
	}

	if (workshop.isFeatured) {
		badges.push({ label: "Featured", variant: "secondary" });
	}

	// Prepare resources
	const resources: Resource[] =
		attachments?.map((attachment) => ({
			id: attachment._id,
			name: attachment.displayName || "Attachment",
			type: attachment.asset?.mimeType || "file",
			size: attachment.asset?.filesize
				? `${(attachment.asset.filesize / 1024 / 1024).toFixed(2)} MB`
				: "Unknown",
			url: attachment.asset?.url || "",
		})) || [];

	// Structured data for SEO
	const workshopStructuredData = generateStructuredData({
		type: "Course",
		data: {
			"@type": "Course",
			name: workshop.title,
			description: workshop.shortDescription || workshop.description,
			provider: {
				"@type": "Organization",
				name: "BitBuddies",
				sameAs: "https://bitbuddies.me",
			},
			...(workshop.instructorName && {
				instructor: {
					"@type": "Person",
					name: workshop.instructorName,
				},
			}),
		},
	});

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
			{workshopStructuredData}

			<ContentDetailLayout
				sidebarTitle="Workshop Info"
				sidebar={
					<>
						{/* Workshop Views */}
						<WorkshopViews viewCount={workshop.viewCount || 0} variant="default" />

						<MetaInfoCard title="Workshop Details" items={metaItems} />

						{workshop.isLive && (
							<WorkshopStatus
								startDate={workshop.startDate}
								endDate={workshop.endDate}
								isLive={workshop.isLive}
								maxParticipants={workshop.maxParticipants}
							/>
						)}

						{workshop.tags && workshop.tags.length > 0 && (
							<TopicsTags tags={workshop.tags} title="Topics" variant="card" />
						)}
					</>
				}
			>
				<ContentDetailHeader
					title={workshop.title}
					description={workshop.shortDescription}
					badges={badges}
					backLink={{ to: "/workshops", label: "Back to Workshops" }}
				/>

				<ContentDetailCover
					imageUrl={workshop.coverAsset?.url}
					alt={workshop.title}
				/>

				{/* Access Control Logic */}
				{workshop.accessLevel === "public" ? (
					// Public workshops - accessible to everyone
					<>
						{/* About Section */}
						<section>
							<SectionHeader eyebrow="Overview" title="About This Workshop" />
							<div className="prose prose-slate dark:prose-invert max-w-none mt-6">
								<p className="text-lg text-foreground leading-relaxed">
									{workshop.description}
								</p>
							</div>
						</section>

						{/* Video Section */}
						{(workshop.videoUrl || workshop.videoId) && (
							<section className="-mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
								<SectionHeader
									eyebrow="Video"
									title={isPast ? "Workshop Recording" : "Watch Workshop"}
								/>
								<div className="mt-6">
									<WorkshopVideoPlayer workshop={workshop} className="w-full" />
								</div>
							</section>
						)}

						{/* Content Section */}
						{workshop.content && (
							<section>
								<SectionHeader eyebrow="Content" title="Workshop Materials" />
								<div className="mt-6">
									<TiptapRenderer content={workshop.content} />
								</div>
							</section>
						)}

						{/* Resources Section */}
						{resources.length > 0 && (
							<ResourcesList
								resources={resources}
								title="Workshop Materials"
								eyebrow="Downloads"
							/>
						)}
					</>
				) : workshop.accessLevel === "authenticated" && !isAuthenticated ? (
					// Authenticated only - require login
					<AuthRequiredCard
						title="Sign In to Access This Workshop"
						description="Create a free account or sign in to access workshop content, materials, and community features."
						features={[
							"Full access to all workshop content and videos",
							"Download workshop materials and resources",
							"Track your progress across courses and workshops",
							"Join the community and participate in discussions",
						]}
					/>
				) : workshop.accessLevel === "subscription" && !isAuthenticated ? (
					// Subscription required but not logged in
					<AuthRequiredCard
						title="Subscription Required"
						description="This workshop is available exclusively to our subscribers. Sign in or upgrade your account to access premium content."
						features={[
							"Access to all premium workshops and courses",
							"Download exclusive materials and resources",
							"Priority support and community access",
							"Advanced tutorials and live sessions",
						]}
					/>
				) : workshop.accessLevel === "subscription" && isAuthenticated ? (
					// Subscription required and logged in - TODO: check actual subscription status
					// For now, show the content (later add subscription check)
					<>
						{/* About Section */}
						<section>
							<SectionHeader eyebrow="Overview" title="About This Workshop" />
							<div className="prose prose-slate dark:prose-invert max-w-none mt-6">
								<p className="text-lg text-foreground leading-relaxed">
									{workshop.description}
								</p>
							</div>
						</section>

						{/* Video Section */}
						{(workshop.videoUrl || workshop.videoId) && (
							<section>
								<SectionHeader
									eyebrow="Video"
									title={isPast ? "Workshop Recording" : "Watch Workshop"}
								/>
								<div className="mt-6">
									<WorkshopVideoPlayer workshop={workshop} />
								</div>
							</section>
						)}

						{/* Content Section */}
						{workshop.content && (
							<section>
								<SectionHeader eyebrow="Content" title="Workshop Materials" />
								<div className="mt-6">
									<TiptapRenderer content={workshop.content} />
								</div>
							</section>
						)}

						{/* Resources Section */}
						{resources.length > 0 && (
							<ResourcesList
								resources={resources}
								title="Workshop Materials"
								eyebrow="Downloads"
							/>
						)}
					</>
				) : (
					// Authenticated level and user is logged in - show content
					<>
						{/* About Section */}
						<section>
							<SectionHeader eyebrow="Overview" title="About This Workshop" />
							<div className="prose prose-slate dark:prose-invert max-w-none mt-6">
								<p className="text-lg text-foreground leading-relaxed">
									{workshop.description}
								</p>
							</div>
						</section>

						{/* Video Section */}
						{(workshop.videoUrl || workshop.videoId) && (
							<section>
								<SectionHeader
									eyebrow="Video"
									title={isPast ? "Workshop Recording" : "Watch Workshop"}
								/>
								<div className="mt-6">
									<WorkshopVideoPlayer workshop={workshop} />
								</div>
							</section>
						)}

						{/* Content Section */}
						{workshop.content && (
							<section>
								<SectionHeader eyebrow="Content" title="Workshop Materials" />
								<div className="mt-6">
									<TiptapRenderer content={workshop.content} />
								</div>
							</section>
						)}

						{/* Resources Section */}
						{resources.length > 0 && (
							<ResourcesList
								resources={resources}
								title="Workshop Materials"
								eyebrow="Downloads"
							/>
						)}
					</>
				)}
			</ContentDetailLayout>
		</>
	);
}
