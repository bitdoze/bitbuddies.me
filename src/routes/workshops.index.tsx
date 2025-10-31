import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	Clock,
	ImageIcon,
	Lock,
	Users,
	Sparkles,
	Zap,
} from "lucide-react";
import {
	generateStructuredData,
	SEO,
	SEO_CONFIGS,
} from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useWorkshops } from "../hooks/useWorkshops";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/workshops/")({
	component: WorkshopsPage,
	loader: async () => {
		// Prefetch workshops data on the server
		try {
			const convexUrl = import.meta.env.VITE_CONVEX_URL;
			if (!convexUrl) {
				console.warn("VITE_CONVEX_URL not found, skipping server-side prefetch");
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

function WorkshopsPage() {
	// Use prefetched data from loader, fallback to client-side fetch
	const loaderData = Route.useLoaderData();
	const clientWorkshops = useWorkshops({ publishedOnly: true });

	// Prefer loader data, fallback to client fetch
	const workshops = loaderData?.workshops ?? clientWorkshops;

	if (workshops === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	const featuredWorkshops = workshops?.filter((w) => w.isFeatured) || [];
	const regularWorkshops = workshops?.filter((w) => !w.isFeatured) || [];

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
				],
			})}
				<div className="w-full">
					{/* Hero Section */}
					<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
						<div className="container mx-auto px-4">
							<div className="mx-auto max-w-4xl text-center">
								<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
									<Zap className="h-12 w-12 text-primary" />
								</div>
								<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
									Hands-On{" "}
									<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
										Workshops
									</span>
								</h1>
								<p className="text-xl text-muted-foreground md:text-2xl">
									Learn from live sessions and practical workshops designed to
									build real-world skills
								</p>
							</div>
						</div>

						{/* Decorative elements */}
						<div className="absolute left-0 top-0 -z-10 h-full w-full">
							<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
							<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
						</div>
					</section>

				{/* Featured Workshops */}
				{featuredWorkshops.length > 0 && (
					<section className="py-16 md:py-24">
						<div className="container mx-auto px-4">
							<div className="mb-12 flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-2 text-primary">
									<Sparkles className="h-6 w-6" />
								</div>
								<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
									Featured Workshops
								</h2>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{featuredWorkshops.map((workshop) => (
									<WorkshopCard key={workshop._id} workshop={workshop} />
								))}
							</div>
						</div>
					</section>
				)}

				{/* All Workshops */}
				<section className={`py-16 md:py-24 ${featuredWorkshops.length > 0 ? 'bg-muted/30' : ''}`}>
					<div className="container mx-auto px-4">
						<h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
							{featuredWorkshops.length > 0
								? "All Workshops"
								: "Available Workshops"}
						</h2>
						{regularWorkshops.length === 0 && featuredWorkshops.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
									<div className="mb-4 inline-flex rounded-full bg-muted p-4">
										<Calendar className="h-12 w-12 text-muted-foreground" />
									</div>
									<h3 className="mb-2 text-xl font-semibold">
										No Workshops Yet
									</h3>
									<p className="text-muted-foreground">
										Check back soon for new workshops!
									</p>
								</div>
							</div>
						) : regularWorkshops.length === 0 ? (
							<div className="mx-auto max-w-2xl">
								<div className="rounded-2xl border border-border bg-card p-8 text-center shadow-md">
									<p className="text-muted-foreground">
										All available workshops are featured above.
									</p>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{regularWorkshops.map((workshop) => (
									<WorkshopCard key={workshop._id} workshop={workshop} />
								))}
							</div>
						)}
					</div>
				</section>
			</div>
		</>
	);
}

function WorkshopCard({ workshop }: { workshop: any }) {
	const { isAuthenticated } = useAuth();
	const status = getWorkshopStatus(workshop);

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return null;
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all hover:shadow-xl hover:border-primary/50">
			{/* Cover Image with 16:9 aspect ratio */}
			<div className="relative overflow-hidden">
				{workshop.coverAsset?.url ? (
					<div className="w-full relative" style={{ paddingBottom: "56.25%" }}>
						<img
							src={workshop.coverAsset.url}
							alt={workshop.title}
							className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				) : (
					<div
						className="w-full relative bg-muted"
						style={{ paddingBottom: "56.25%" }}
					>
						<div className="absolute inset-0 flex items-center justify-center">
							<ImageIcon className="h-12 w-12 text-muted-foreground" />
						</div>
					</div>
				)}
			</div>
			<div className="flex flex-col flex-1 p-6">
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="shadow-sm">{workshop.level}</Badge>
						{!isAuthenticated && (
							<Badge variant="secondary" className="gap-1">
								<Lock className="h-3 w-3" />
								Login Required
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2">
						{status === "live" && <Badge variant="destructive">Live Now</Badge>}
						{status === "upcoming" && <Badge variant="default">Upcoming</Badge>}
						{status === "past" && workshop.videoUrl && (
							<Badge variant="secondary">Recording Available</Badge>
						)}
					</div>
				</div>
				<h3 className="text-xl font-semibold line-clamp-2 mb-2">{workshop.title}</h3>
				{workshop.shortDescription && (
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
						{workshop.shortDescription}
					</p>
				)}
			</div>
			<div className="flex-1 px-6">
				<p className="text-sm text-muted-foreground line-clamp-3">
					{workshop.description}
				</p>
				<div className="mt-4 space-y-2">
					{workshop.duration && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="rounded bg-muted p-1">
								<Clock className="h-4 w-4" />
							</div>
							<span>{workshop.duration} minutes</span>
						</div>
					)}
					{workshop.startDate && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="rounded bg-muted p-1">
								<Calendar className="h-4 w-4" />
							</div>
							<span>{formatDate(workshop.startDate)}</span>
						</div>
					)}
					{workshop.maxParticipants && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<div className="rounded bg-muted p-1">
								<Users className="h-4 w-4" />
							</div>
							<span>
								{workshop.currentParticipants} / {workshop.maxParticipants}{" "}
								participants
							</span>
						</div>
					)}
				</div>
				{workshop.tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-4">
						{workshop.tags.slice(0, 3).map((tag: string) => (
							<span
								key={tag}
								className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground font-medium"
							>
								#{tag}
							</span>
						))}
						{workshop.tags.length > 3 && (
							<span className="text-xs px-2 py-1 text-muted-foreground">
								+{workshop.tags.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
			<div className="p-6 pt-0 mt-auto">
				{isAuthenticated ? (
					<Button asChild className="w-full shadow-sm">
						<Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
							View Workshop
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button asChild className="w-full shadow-sm" variant="outline">
						<Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
							<Lock className="mr-2 h-4 w-4" />
							Sign In to View
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
}

function getWorkshopStatus(workshop: any) {
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
