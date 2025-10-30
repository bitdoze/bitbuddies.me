import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";
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

export const Route = createFileRoute("/workshops/")({
	component: WorkshopsPage,
});

function WorkshopsPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const workshops = useWorkshops({ publishedOnly: true });

	if (authLoading || workshops === undefined) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader>
						<CardTitle>Authentication Required</CardTitle>
						<CardDescription>
							You must be logged in to view workshops.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Please sign in to access our workshop content and materials.
						</p>
						<Button asChild>
							<Link to="/">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return null;
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getWorkshopStatus = (workshop: any) => {
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
	};

	const featuredWorkshops = workshops?.filter((w) => w.isFeatured) || [];
	const regularWorkshops = workshops?.filter((w) => !w.isFeatured) || [];

	return (
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
	);
}

function WorkshopCard({ workshop }: { workshop: any }) {
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
		<Card className="flex flex-col hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between gap-2 mb-2">
					<Badge variant="outline">{workshop.level}</Badge>
					{status === "live" && <Badge variant="destructive">Live Now</Badge>}
					{status === "upcoming" && <Badge variant="default">Upcoming</Badge>}
					{status === "past" && workshop.videoUrl && (
						<Badge variant="secondary">Recording Available</Badge>
					)}
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
				<Button asChild className="w-full">
					<a href={`/workshops/${workshop.slug}`}>
						View Workshop
						<ArrowRight className="ml-2 h-4 w-4" />
					</a>
				</Button>
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
