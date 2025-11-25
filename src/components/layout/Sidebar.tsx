import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	BookOpen,
	Calendar,
	FileImage,
	FileText,
	FileVideo,
	Home,
	Info,
	LayoutDashboard,
	Link2,
	Mail,
	Megaphone,
	PenLine,
	Plus,
	Shield,
	Sparkles,
	Type,
	X,
	Youtube,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import HeaderUser from "@/integrations/clerk/header-user";
import { cn } from "@/lib/utils";

const menuItems = [
	{
		title: "Home",
		url: "/",
		icon: Home,
		isRoute: true,
	},
	{
		title: "Courses",
		url: "/courses",
		icon: BookOpen,
		isRoute: true,
	},
	{
		title: "Workshops",
		url: "/workshops",
		icon: Calendar,
		isRoute: true,
	},
	{
		title: "Videos",
		url: "/youtube",
		icon: Youtube,
		isRoute: true,
	},
	{
		title: "Blog",
		url: "/posts",
		icon: FileText,
		isRoute: true,
	},
	{
		title: "About",
		url: "/about",
		icon: Info,
		isRoute: true,
	},
	{
		title: "Contact",
		url: "/contact",
		icon: Mail,
		isRoute: true,
	},
];

const toolMenuItems = [
	{
		title: "Tools Hub",
		url: "/tools",
		icon: Sparkles,
	},
	{
		title: "AI Title Generator",
		url: "/tools/title-generator",
		icon: Type,
	},
	{
		title: "AI Humanizer",
		url: "/tools/ai-humanizer",
		icon: PenLine,
	},
	{
		title: "Social Post Generator",
		url: "/tools/social-post-generator",
		icon: Megaphone,
	},
	{
		title: "YouTube Script Generator",
		url: "/tools/youtube-script-generator",
		icon: FileVideo,
	},
	{
		title: "YouTube Thumbnail Ideas",
		url: "/tools/youtube-thumbnail-generator",
		icon: FileImage,
	},
];

export function AppSidebar() {
	const { toggleSidebar } = useSidebar();
	const { isAdmin } = useAuth();
	const matchRoute = useMatchRoute();

	return (
		<Sidebar className="[&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-sidebar/80 [&_[data-sidebar=sidebar]]:to-sidebar/60">
			<SidebarHeader className="border-b border-sidebar-border/70 p-4 backdrop-blur">
				<div className="flex items-center justify-between gap-2 w-full">
					<Link to="/" className="flex items-center gap-2 flex-1">
						<Logo className="h-10 w-auto" />
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleSidebar}
						className="flex-shrink-0"
						aria-label="Close sidebar"
					>
						<X className="h-6 w-6" />
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="space-y-6 py-4">
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive =
									item.isRoute &&
									matchRoute({ to: item.url as any, fuzzy: item.url !== "/" });

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											className={cn(
												"group relative overflow-hidden rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-medium transition-all",
												isActive
													? "bg-primary/15 text-primary shadow-sm"
													: "hover:border-sidebar-border hover:bg-sidebar-accent/40",
											)}
											data-active={isActive ? "true" : undefined}
										>
											{item.isRoute ? (
												<Link to={item.url} className="flex items-center gap-3">
													<item.icon
														className={cn(
															"h-4 w-4 transition-transform",
															isActive && "scale-110",
														)}
													/>
													<span>{item.title}</span>
												</Link>
											) : (
												<a href={item.url} className="flex items-center gap-3">
													<item.icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
													<span>{item.title}</span>
												</a>
											)}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

	<SidebarGroup>
		<SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70">
			AI Tools
		</SidebarGroupLabel>
		<SidebarGroupContent>
			<SidebarMenu>
				{toolMenuItems.map((item) => {
					const isActive = matchRoute({ to: item.url as any, fuzzy: true });
					return (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								className={cn(
									"group relative overflow-hidden rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-medium transition-all",
									isActive
										? "bg-primary/15 text-primary shadow-sm"
										: "hover:border-sidebar-border hover:bg-sidebar-accent/40",
								)}
								data-active={isActive ? "true" : undefined}
							>
								<Link to={item.url} className="flex items-center gap-3">
									<item.icon
										className={cn(
											"h-4 w-4 transition-transform",
											isActive && "scale-110",
										)}
									/>
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroupContent>
	</SidebarGroup>

				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70">
							<Shield className="h-4 w-4" />
							Admin Panel
							<Button
								asChild
								size="sm"
								variant="outline"
								className="gap-1 rounded-full border-sidebar-border/70 px-3 py-1 text-xs"
							>
								<Link to="/admin/workshops/create">
									<Plus className="h-3 w-3" />
									New
								</Link>
							</Button>
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin" {...({} as any)}>
											<LayoutDashboard className="h-4 w-4" />
											<span>Dashboard</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin/posts">
											<FileText className="h-4 w-4" />
											<span>Manage Posts</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin/workshops">
											<Calendar className="h-4 w-4" />
											<span>Manage Workshops</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin/courses">
											<BookOpen className="h-4 w-4" />
											<span>Manage Courses</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin/youtube">
											<Youtube className="h-4 w-4" />
											<span>Manage YouTube</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/40"
									>
										<Link to="/admin/links">
											<Link2 className="h-4 w-4" />
											<span>Affiliate Links</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter className="border-t border-sidebar-border/70 p-4 backdrop-blur">
				<div className="flex flex-col gap-2">
					<HeaderUser />
					<p className="text-xs text-sidebar-foreground/60">
						© 2024 BitBuddies
					</p>
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
