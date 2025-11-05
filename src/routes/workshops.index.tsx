import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import {
	ArrowRight,
	Calendar,
	Clock,
	Sparkles,
	Star,
	Users,
	Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	generateStructuredData,
	SEO,
	SEO_CONFIGS,
} from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatBadge } from "@/components/common/StatBadge";
import { ContentCard } from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWorkshops } from "@/hooks/useWorkshops";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/workshops/")({
	component: WorkshopsPage,
	loader: async () => {
		// Prefetch workshops data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn(
					"VITE_CONVEX_URL not found, skipping server-side prefetch",
				);
				return { workshops: null };
			}

			const client = new ConvexHttpClient(convexUrl);
			const workshops = await client.query(api.workshops.list, {
				publishedOnly: true,
			});
			return { workshops };
		} catch (error) {
			console.error("Failed to prefetch workshops:", error);
			return { workshops: null };
		}
	},
});

type EnrichedWorkshop = Doc<"workshops"> & {
	coverAsset: (Doc<"mediaAssets"> & { url?: string | null }) | null;
};

function WorkshopsPage() {
	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData() as
		| { workshops: EnrichedWorkshop[] | null }
		| undefined;
	const clientWorkshops = useWorkshops({ publishedOnly: true }) as
		| EnrichedWorkshop[]
		| undefined;
	const { isAuthenticated } = useAuth();

	// Prefer loader data, fallback to client fetch
	const workshops = loaderData?.workshops ?? clientWorkshops;

	if (workshops === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}
	const featuredWorkshops =
		workshops?.filter((workshop) => workshop.isFeatured) ?? [];
	const regularWorkshops =
		workshops?.filter((workshop) => !workshop.isFeatured) ?? [];

	const siteOrigin =
		typeof window !== "undefined" ? window.location.origin : "";
	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "";
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const heroStats = [
		{
			label: "Live events hosted",
			value: `${workshops?.length ?? 0}+`,
			icon: <Sparkles className="h-4 w-4" />,
		},
		{
			label: "Average session",
			value: "90 mins",
			icon: <Clock className="h-4 w-4" />,
		},
		{
			label: "Community builders",
			value: "150+",
			icon: <Users className="h-4 w-4" />,
		},
	];

	const renderWorkshopCard = (workshop: EnrichedWorkshop) => {
		const status = getWorkshopStatus(workshop);
		const requiresAuth = workshop.accessLevel !== "public";
		const badges = [
			workshop.level
				? { label: workshop.level, variant: "secondary" as const }
				: undefined,
			status === "live"
				? { label: "Live now", variant: "destructive" as const }
				: undefined,
			status === "upcoming"
				? { label: "Upcoming", variant: "default" as const }
				: undefined,
			status === "past" && workshop.videoUrl
				? { label: "Recording", variant: "outline" as const }
				: undefined,
			!isAuthenticated && requiresAuth
				? {
						label:
							workshop.accessLevel === "subscription"
								? "Subscription required"
								: "Login required",
						variant: "outline" as const,
					}
				: undefined,
		].filter(Boolean) as Array<{
			label: string;
			variant?: "default" | "secondary" | "outline" | "destructive";
		}>;

		const meta = [
			workshop.startDate
				? {
						icon: <Calendar className="h-3.5 w-3.5" />,
						label: formatDate(workshop.startDate),
					}
				: null,
			workshop.duration
				? {
						icon: <Clock className="h-3.5 w-3.5" />,
						label: `${workshop.duration} minutes`,
					}
				: null,
			workshop.maxParticipants
				? {
						icon: <Users className="h-3.5 w-3.5" />,
						label: `${workshop.currentParticipants ?? 0}/${workshop.maxParticipants} seats`,
					}
				: null,
		].filter(Boolean) as Array<{ icon: ReactNode; label: string }>;

		const actionVariant =
			!requiresAuth || isAuthenticated ? "default" : "outline";
		const actionLabel =
			!requiresAuth || isAuthenticated ? "View workshop" : "Preview workshop";

		return (
			<ContentCard
				key={workshop._id}
				className="group"
				cover={
					workshop.coverAsset?.url ? (
						<div className="relative aspect-[16/9] overflow-hidden">
							<img
								src={workshop.coverAsset.url}
								alt={workshop.title}
								className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
							/>
						</div>
					) : (
						<div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 to-primary/5" />
					)
				}
				title={workshop.title}
				description={workshop.shortDescription ?? workshop.description}
				badges={badges}
				meta={meta}
				footer={
					<Button
						asChild
						variant={actionVariant}
						className="w-full justify-center gap-2"
					>
						<Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
							{actionLabel}
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				}
			/>
		);
	};

	return (
		<>
			<SEO
				title={SEO_CONFIGS.workshops.title}
				description={SEO_CONFIGS.workshops.description}
				keywords={SEO_CONFIGS.workshops.keywords}
				canonicalUrl="/workshops"
				ogType="website"
			/>
			{generateStructuredData({
				type: "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: siteOrigin,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Workshops",
						item: siteOrigin ? `${siteOrigin}/workshops` : "",
					},
				],
			})}
			<div className="section-spacing relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
				<div className="container grid gap-12 md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] md:items-center">
					<div className="space-y-8">
						<SectionHeader
							eyebrow="Live, collaborative sprints"
							title="Workshops that help you ship faster"
							description="Join focused sessions, meet peers tackling similar problems, and walk away with finished deliverables."
							icon={<Calendar className="h-4 w-4" />}
						/>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild size="lg" className="gap-2">
								<Link to="/workshops">
									Upcoming workshops
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link to="/courses">
									View courses
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
					<div className="grid gap-4">
						<StatBadge
							label="Formats"
							value="Live, async & hybrid"
							icon={<Zap className="h-4 w-4" />}
						/>
						{heroStats.map((stat) => (
							<StatBadge
								key={stat.label}
								label={stat.label}
								value={stat.value}
								icon={stat.icon}
							/>
						))}
					</div>
				</div>
				<div
					className="pointer-events-none absolute -right-32 top-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -left-40 bottom-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
					aria-hidden="true"
				/>
			</div>

			<div className="section-spacing">
				<div className="container space-y-16">
					{featuredWorkshops.length > 0 ? (
						<div className="space-y-8">
							<SectionHeader
								eyebrow="Community favorites"
								title="Featured workshops"
								description="Sessions that consistently deliver breakthroughs for teams and solo builders."
								icon={<Star className="h-4 w-4" />}
							/>
							<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
								{featuredWorkshops.map(renderWorkshopCard)}
							</div>
						</div>
					) : null}
					<div className="space-y-8">
						<SectionHeader
							eyebrow={
								featuredWorkshops.length
									? "All sessions"
									: "Kick off your journey"
							}
							title={
								featuredWorkshops.length
									? "All workshops"
									: "Available workshops"
							}
							description="Pick the format that fits your schedule—each workshop includes recordings and guided templates."
						/>
						{regularWorkshops.length === 0 && featuredWorkshops.length === 0 ? (
							<div className="surface-muted mx-auto max-w-2xl space-y-3 p-10 text-center">
								<Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
								<h3 className="text-xl font-semibold">No workshops yet</h3>
								<p className="text-sm text-muted-foreground">
									We’re planning the next lineup—join the community to get early
									access when new sessions drop.
								</p>
							</div>
						) : regularWorkshops.length === 0 ? (
							<div className="surface-muted mx-auto max-w-2xl p-8 text-center">
								<p className="text-sm text-muted-foreground">
									All live sessions are highlighted above.
								</p>
							</div>
						) : (
							<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
								{regularWorkshops.map(renderWorkshopCard)}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

function getWorkshopStatus(workshop: EnrichedWorkshop) {
	if (!workshop.isLive || !workshop.startDate) return null;

	const now = Date.now();
	if (workshop.startDate > now) return "upcoming";
	if (workshop.endDate && workshop.endDate < now) return "past";
	if (
		workshop.startDate <= now &&
		(!workshop.endDate || workshop.endDate >= now)
	)
		return "live";
	return null;
}
