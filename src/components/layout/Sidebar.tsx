import { Link } from "@tanstack/react-router";
import { BookOpen, Calendar, Home, Mail, Info, X, FileText } from "lucide-react";
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
import HeaderUser from "@/integrations/clerk/header-user";

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
		isRoute: false,
	},
	{
		title: "Workshops",
		url: "/workshops",
		icon: Calendar,
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

export function AppSidebar() {
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar>
			<SidebarHeader className="border-b border-sidebar-border p-4">
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
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										{item.isRoute ? (
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										) : (
											<a href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-t border-sidebar-border p-4">
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
