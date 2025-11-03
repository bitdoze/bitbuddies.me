import { createFileRoute, Link } from "@tanstack/react-router";
import {
	LayoutDashboard,
	FileText,
	Calendar,
	BookOpen,
	TrendingUp,
	Plus,
	Settings,
	BarChart3,
	Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useWorkshops } from "@/hooks/useWorkshops";
import { useCourses } from "@/hooks/useCourses";

export const Route = createFileRoute("/admin/" as any)({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { isAdmin, isLoading: authLoading, user } = useAuth();
	const posts = usePosts({ publishedOnly: false });
	const workshops = useWorkshops({ publishedOnly: false });
	const courses = useCourses({ publishedOnly: false });

	if (authLoading) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						<p className="mt-4 text-muted-foreground">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="w-full">
				<div className="container mx-auto px-4 py-20">
					<div className="mx-auto max-w-2xl">
						<div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
							<div className="mb-4 inline-flex rounded-full bg-muted p-4">
								<Settings className="h-12 w-12 text-muted-foreground" />
							</div>
							<h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
							<p className="mb-6 text-muted-foreground">
								You don't have permission to access the admin dashboard.
							</p>
							<Button asChild variant="outline" size="lg">
								<Link to="/">
									Back to Home
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Calculate stats
	const totalPosts = posts?.length || 0;
	const publishedPosts = posts?.filter((p) => p.isPublished).length || 0;
	const draftPosts = posts?.filter((p) => !p.isPublished).length || 0;

	const totalWorkshops = workshops?.length || 0;
	const publishedWorkshops = workshops?.filter((w) => w.isPublished).length || 0;
	const upcomingWorkshops = workshops?.filter(
		(w) => w.startDate && w.startDate > Date.now()
	).length || 0;

	const totalCourses = courses?.length || 0;
	const publishedCourses = courses?.filter((c) => c.isPublished).length || 0;

	const quickActions = [
		{
			title: "New Post",
			description: "Create a new blog post",
			icon: FileText,
			href: "/admin/posts/create",
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			title: "New Workshop",
			description: "Create a new workshop",
			icon: Calendar,
			href: "/admin/workshops/create",
			color: "text-green-500",
			bgColor: "bg-green-500/10",
		},
		{
			title: "New Course",
			description: "Create a new course",
			icon: BookOpen,
			href: "/admin/courses/create",
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
		},
	];

	const managementLinks = [
		{
			title: "Manage Posts",
			description: `${totalPosts} total posts`,
			icon: FileText,
			href: "/admin/posts",
			stats: [
				{ label: "Published", value: publishedPosts, color: "text-green-600" },
				{ label: "Drafts", value: draftPosts, color: "text-yellow-600" },
			],
		},
		{
			title: "Manage Workshops",
			description: `${totalWorkshops} total workshops`,
			icon: Calendar,
			href: "/admin/workshops",
			stats: [
				{ label: "Published", value: publishedWorkshops, color: "text-green-600" },
				{ label: "Upcoming", value: upcomingWorkshops, color: "text-blue-600" },
			],
		},
		{
			title: "Manage Courses",
			description: `${totalCourses} total courses`,
			icon: BookOpen,
			href: "/admin/courses",
			stats: [
				{ label: "Published", value: publishedCourses, color: "text-green-600" },
				{ label: "Total", value: totalCourses, color: "text-blue-600" },
			],
		},
	];

	return (
		<div className="w-full">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b">
				<div className="container mx-auto px-4 py-12">
					<div className="max-w-6xl mx-auto">
						<div className="flex items-center gap-4 mb-6">
							<div className="rounded-2xl bg-primary/10 p-4 shadow-lg">
								<LayoutDashboard className="h-10 w-10 text-primary" />
							</div>
							<div>
								<h1 className="text-4xl font-bold tracking-tight">
									Admin Dashboard
								</h1>
								<p className="text-lg text-muted-foreground mt-1">
									Welcome back, {user?.firstName || "Admin"}
								</p>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex items-center justify-between mb-2">
									<div className="rounded-lg bg-blue-500/10 p-2">
										<FileText className="h-5 w-5 text-blue-500" />
									</div>
									<Badge variant="secondary">{totalPosts}</Badge>
								</div>
								<h3 className="font-semibold text-sm text-muted-foreground">Total Posts</h3>
								<p className="text-2xl font-bold mt-1">{publishedPosts}</p>
								<p className="text-xs text-muted-foreground mt-1">Published</p>
							</div>

							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex items-center justify-between mb-2">
									<div className="rounded-lg bg-green-500/10 p-2">
										<Calendar className="h-5 w-5 text-green-500" />
									</div>
									<Badge variant="secondary">{totalWorkshops}</Badge>
								</div>
								<h3 className="font-semibold text-sm text-muted-foreground">Total Workshops</h3>
								<p className="text-2xl font-bold mt-1">{publishedWorkshops}</p>
								<p className="text-xs text-muted-foreground mt-1">Published</p>
							</div>

							<div className="rounded-2xl border border-border bg-card p-6 shadow-md">
								<div className="flex items-center justify-between mb-2">
									<div className="rounded-lg bg-purple-500/10 p-2">
										<Clock className="h-5 w-5 text-purple-500" />
									</div>
									<Badge variant="secondary">{upcomingWorkshops}</Badge>
								</div>
								<h3 className="font-semibold text-sm text-muted-foreground">Upcoming</h3>
								<p className="text-2xl font-bold mt-1">{upcomingWorkshops}</p>
								<p className="text-xs text-muted-foreground mt-1">Workshops</p>
							</div>
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute left-0 top-0 -z-10 h-full w-full">
					<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
				</div>
			</section>

			{/* Quick Actions */}
			<section className="py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="mb-8 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Plus className="h-6 w-6" />
							</div>
							<h2 className="text-3xl font-bold">Quick Actions</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{quickActions.map((action) => (
								<Link
									key={action.title}
									to={action.href}
									className="group rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/50"
								>
									<div className="flex items-start gap-4">
										<div className={`rounded-xl ${action.bgColor} p-3 group-hover:scale-110 transition-transform`}>
											<action.icon className={`h-6 w-6 ${action.color}`} />
										</div>
										<div className="flex-1">
											<h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
												{action.title}
											</h3>
											<p className="text-sm text-muted-foreground">
												{action.description}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Management Links */}
			<section className="py-12">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="mb-8 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<BarChart3 className="h-6 w-6" />
							</div>
							<h2 className="text-3xl font-bold">Content Management</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{managementLinks.map((link) => (
								<Link
									key={link.title}
									to={link.href}
									className="group rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/50"
								>
									<div className="flex items-start gap-4 mb-4">
										<div className="rounded-xl bg-muted p-3 group-hover:bg-primary/10 transition-colors">
											<link.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
										</div>
										<div className="flex-1">
											<h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
												{link.title}
											</h3>
											<p className="text-sm text-muted-foreground">
												{link.description}
											</p>
										</div>
									</div>

									{link.stats.length > 0 && (
										<div className="flex items-center gap-4 pt-4 border-t border-border">
											{link.stats.map((stat) => (
												<div key={stat.label} className="flex-1">
													<p className="text-xs text-muted-foreground mb-1">
														{stat.label}
													</p>
													<p className={`text-2xl font-bold ${stat.color}`}>
														{stat.value}
													</p>
												</div>
											))}
										</div>
									)}
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* System Status */}
			<section className="py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<div className="mb-8 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<TrendingUp className="h-6 w-6" />
							</div>
							<h2 className="text-3xl font-bold">System Status</h2>
						</div>

						<div className="rounded-2xl border border-border bg-card p-8 shadow-md">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="flex items-center gap-4">
									<div className="rounded-full bg-green-500/10 p-3">
										<div className="h-3 w-3 rounded-full bg-green-500" />
									</div>
									<div>
										<p className="font-semibold">Database</p>
										<p className="text-sm text-muted-foreground">All systems operational</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="rounded-full bg-green-500/10 p-3">
										<div className="h-3 w-3 rounded-full bg-green-500" />
									</div>
									<div>
										<p className="font-semibold">Storage</p>
										<p className="text-sm text-muted-foreground">Files syncing normally</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="rounded-full bg-green-500/10 p-3">
										<div className="h-3 w-3 rounded-full bg-green-500" />
									</div>
									<div>
										<p className="font-semibold">Authentication</p>
										<p className="text-sm text-muted-foreground">Clerk services active</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="rounded-full bg-green-500/10 p-3">
										<div className="h-3 w-3 rounded-full bg-green-500" />
									</div>
									<div>
										<p className="font-semibold">API</p>
										<p className="text-sm text-muted-foreground">Response time: 45ms</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
