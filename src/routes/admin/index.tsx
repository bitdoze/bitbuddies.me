import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	Calendar,
	FileText,
	LayoutDashboard,
	Plus,
	Settings,
	TrendingUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { usePosts } from "@/hooks/usePosts";
import { useWorkshops } from "@/hooks/useWorkshops";

export const Route = createFileRoute("/admin/")({
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
								<Link to="/">Back to Home</Link>
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
	const publishedWorkshops =
		workshops?.filter((w) => w.isPublished).length || 0;
	const upcomingWorkshops =
		workshops?.filter((w) => w.startDate && w.startDate > Date.now()).length ||
		0;

	const totalCourses = courses?.length || 0;
	const publishedCourses = courses?.filter((c) => c.isPublished).length || 0;
	const draftCourses = totalCourses - publishedCourses;
	const liveWorkshops = workshops?.filter((w) => w.isLive).length || 0;
	const totalEnrollment =
		courses?.reduce((sum, course) => sum + (course.enrollmentCount ?? 0), 0) ||
		0;
	const featuredPosts = posts?.filter((post) => post.isFeatured).length || 0;
	const featuredWorkshops =
		workshops?.filter((workshop) => workshop.isFeatured).length || 0;
	const featuredCourses =
		courses?.filter((course) => course.isFeatured).length || 0;
	const totalFeatured = featuredPosts + featuredWorkshops + featuredCourses;
	const totalContentItems = totalPosts + totalWorkshops + totalCourses;

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
				{
					label: "Published",
					value: publishedWorkshops,
					color: "text-green-600",
				},
				{ label: "Upcoming", value: upcomingWorkshops, color: "text-blue-600" },
			],
		},
		{
			title: "Manage Courses",
			description: `${totalCourses} total courses`,
			icon: BookOpen,
			href: "/admin/courses",
			stats: [
				{
					label: "Published",
					value: publishedCourses,
					color: "text-green-600",
				},
				{ label: "Drafts", value: draftCourses, color: "text-amber-600" },
			],
		},
	];

	const systemStatus = [
		{ label: "Database", helper: "All systems operational" },
		{ label: "Storage", helper: "Files syncing normally" },
		{ label: "Authentication", helper: "Clerk services active" },
		{ label: "API", helper: "Response time: 45ms" },
	];

	return (
		<div className="container space-y-12 py-12">
			<AdminShell>
				<AdminHeader
					eyebrow="Operations overview"
					title="Admin dashboard"
					description={`Welcome back, ${user?.firstName || "Admin"}.`}
					actions={
						<div className="flex flex-wrap items-center gap-2">
							<Button asChild size="sm" className="gap-2">
								<Link to="/admin/posts/create">
									<Plus className="h-4 w-4" />
									Create post
								</Link>
							</Button>
							<Button asChild variant="outline" size="sm">
								<Link to="/admin/workshops/create">Schedule workshop</Link>
							</Button>
						</div>
					}
					stats={[
						{ label: "Published posts", value: publishedPosts },
						{ label: "Upcoming workshops", value: upcomingWorkshops },
						{ label: "Active courses", value: publishedCourses },
						{
							label: "Students enrolled",
							value: totalEnrollment.toLocaleString(),
						},
					]}
				/>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<AdminStatCard
						label="Total content"
						value={totalContentItems}
						description="Posts, workshops, courses"
						icon={<LayoutDashboard className="h-4 w-4" />}
					/>
					<AdminStatCard
						label="Draft posts"
						value={draftPosts}
						description="Awaiting review"
						icon={<FileText className="h-4 w-4" />}
					/>
					<AdminStatCard
						label="Live workshops"
						value={liveWorkshops}
						description="Currently in session"
						icon={<Calendar className="h-4 w-4" />}
					/>
					<AdminStatCard
						label="Featured items"
						value={totalFeatured}
						description="Highlighted across the site"
						icon={<TrendingUp className="h-4 w-4" />}
					/>
				</div>

				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-foreground">
							Quick actions
						</h2>
						<p className="text-sm text-muted-foreground">
							Spin up new content or workflows in a single click.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{quickActions.map((action) => (
							<Link
								key={action.title}
								to={action.href}
								className="card-surface group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/85 p-6 shadow-sm transition-transform motion-safe:hover:-translate-y-1"
							>
								<div className="flex items-start gap-4">
									<div
										className={`rounded-xl ${action.bgColor} p-3 transition-transform group-hover:scale-110`}
									>
										<action.icon className={`h-6 w-6 ${action.color}`} />
									</div>
									<div className="space-y-1">
										<h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
											{action.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{action.description}
										</p>
									</div>
								</div>
								<span className="text-xs font-medium text-muted-foreground">
									Open form ▸
								</span>
							</Link>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-foreground">
							Content management
						</h2>
						<p className="text-sm text-muted-foreground">
							Jump into detailed views for each content type.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{managementLinks.map((link) => (
							<Link
								key={link.title}
								to={link.href}
								className="card-surface flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/85 p-6 shadow-sm transition-transform motion-safe:hover:-translate-y-1"
							>
								<div className="flex items-start gap-4">
									<div className="rounded-xl bg-muted p-3">
										<link.icon className="h-6 w-6 text-muted-foreground" />
									</div>
									<div className="space-y-1">
										<h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
											{link.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{link.description}
										</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4">
									{link.stats.map((stat) => (
										<div key={stat.label} className="space-y-1">
											<p className="text-xs text-muted-foreground">
												{stat.label}
											</p>
											<p className={`text-xl font-semibold ${stat.color}`}>
												{stat.value}
											</p>
										</div>
									))}
								</div>
								<span className="text-xs font-medium text-muted-foreground">
									Open dashboard ▸
								</span>
							</Link>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-foreground">
							System status
						</h2>
						<p className="text-sm text-muted-foreground">
							Infrastructure checks updated moments ago.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{systemStatus.map((item) => (
							<div
								key={item.label}
								className="card-surface flex items-center gap-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm"
							>
								<div className="rounded-full bg-green-500/10 p-3">
									<div className="h-3 w-3 rounded-full bg-green-500" />
								</div>
								<div>
									<p className="font-semibold text-foreground">{item.label}</p>
									<p className="text-sm text-muted-foreground">{item.helper}</p>
								</div>
							</div>
						))}
					</div>
				</section>
			</AdminShell>
		</div>
	);
}
