import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Calendar,
	Clock,
	ImageIcon,
	Lock,
	Users,
} from "lucide-react";
import {
	generateStructuredData,
	SEO,
	SEO_CONFIGS,
} from "../components/common/SEO";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
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
			<div className="container mx-auto py-8 space-y-8">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">Workshops</h1>
					<p className="text-xl text-muted-foreground">
						Learn from hands-on workshops and live sessions
					</p>
				</div>

				{/* Featured Workshops */}
				{featuredWorkshops.length > 0 && (
					<div className="space-y-4">
						<h2 className="text-2xl font-semibold">Featured Workshops</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{featuredWorkshops.map((workshop) => (
								<WorkshopCard key={workshop._id} workshop={workshop} />
							))}
						</div>
					</div>
				)}

				{/* All Workshops */}
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold">
						{featuredWorkshops.length > 0
							? "All Workshops"
							: "Available Workshops"}
					</h2>
					{regularWorkshops.length === 0 && featuredWorkshops.length === 0 ? (
						<Card>
							<CardContent className="py-12">
								<div className="text-center space-y-2">
									<p className="text-muted-foreground">
										No workshops available at the moment.
									</p>
									<p className="text-sm text-muted-foreground">
										Check back soon for new workshops!
									</p>
								</div>
							</CardContent>
						</Card>
					) : regularWorkshops.length === 0 ? (
						<Card>
							<CardContent className="py-8">
								<p className="text-center text-muted-foreground">
									All available workshops are featured above.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{regularWorkshops.map((workshop) => (
								<WorkshopCard key={workshop._id} workshop={workshop} />
							))}
						</div>
					)}
				</div>
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
		<Card className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
			{/* Cover Image with 16:9 aspect ratio */}
			{workshop.coverAsset?.url ? (
				<div className="w-full relative" style={{ paddingBottom: "56.25%" }}>
					<img
						src={workshop.coverAsset.url}
						alt={workshop.title}
						className="absolute inset-0 w-full h-full object-cover"
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
			<CardHeader>
				<div className="flex items-start justify-between gap-2 mb-2">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{workshop.level}</Badge>
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
				<CardTitle className="line-clamp-2">{workshop.title}</CardTitle>
				{workshop.shortDescription && (
					<CardDescription className="line-clamp-2">
						{workshop.shortDescription}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="flex-1">
				<p className="text-sm text-muted-foreground line-clamp-3">
					{workshop.description}
				</p>
				<div className="mt-4 space-y-2">
					{workshop.duration && (
						<div className="flex items-center text-sm text-muted-foreground">
							<Clock className="mr-2 h-4 w-4" />
							{workshop.duration} minutes
						</div>
					)}
					{workshop.startDate && (
						<div className="flex items-center text-sm text-muted-foreground">
							<Calendar className="mr-2 h-4 w-4" />
							{formatDate(workshop.startDate)}
						</div>
					)}
					{workshop.maxParticipants && (
						<div className="flex items-center text-sm text-muted-foreground">
							<Users className="mr-2 h-4 w-4" />
							{workshop.currentParticipants} / {workshop.maxParticipants}{" "}
							participants
						</div>
					)}
				</div>
				{workshop.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-3">
						{workshop.tags.slice(0, 3).map((tag: string) => (
							<span
								key={tag}
								className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground"
							>
								#{tag}
							</span>
						))}
						{workshop.tags.length > 3 && (
							<span className="text-xs px-2 py-0.5 text-muted-foreground">
								+{workshop.tags.length - 3}
							</span>
						)}
					</div>
				)}
			</CardContent>
			<CardFooter>
				{isAuthenticated ? (
					<Button asChild className="w-full">
						<Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
							View Workshop
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				) : (
					<Button asChild className="w-full" variant="outline">
						<Link to="/workshops/$slug" params={{ slug: workshop.slug }}>
							<Lock className="mr-2 h-4 w-4" />
							Sign In to View
						</Link>
					</Button>
				)}
			</CardFooter>
		</Card>
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
