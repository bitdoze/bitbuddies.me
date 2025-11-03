import { Link } from "@tanstack/react-router";
import { LogoHeader } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, FileText, Calendar, BookOpen, LayoutDashboard } from "lucide-react";
import HeaderUser from "@/integrations/clerk/header-user";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
	const { isAdmin } = useAuth();

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-4">
					<SidebarTrigger />
					<Link to="/" className="flex items-center gap-2">
						<LogoHeader className="h-10 w-auto" />
					</Link>
				</div>

				<nav className="hidden lg:flex items-center gap-6">
					<Link
						to="/"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
						activeProps={{
							className:
								"text-sm font-medium text-foreground transition-colors",
						}}
					>
						Home
					</Link>
					<a
						href="/courses"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
					>
						Courses
					</a>
					<Link
						to="/workshops"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
						activeProps={{
							className:
								"text-sm font-medium text-foreground transition-colors",
						}}
					>
						Workshops
					</Link>
					<Link
						to="/posts"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
						activeProps={{
							className:
								"text-sm font-medium text-foreground transition-colors",
						}}
					>
						Blog
					</Link>
					<Link
						to="/about"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
						activeProps={{
							className:
								"text-sm font-medium text-foreground transition-colors",
						}}
					>
						About
					</Link>
					<Link
						to="/contact"
						className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
						activeProps={{
							className:
								"text-sm font-medium text-foreground transition-colors",
						}}
					>
						Contact
					</Link>
				</nav>

				<div className="flex items-center gap-2">
					<ThemeToggle />
					{isAdmin && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="hidden md:inline-flex gap-2">
									<Shield className="h-4 w-4" />
									Admin
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/admin" className="cursor-pointer" {...({} as any)}>
										<LayoutDashboard className="mr-2 h-4 w-4" />
										Dashboard
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link to="/admin/posts" className="cursor-pointer">
										<FileText className="mr-2 h-4 w-4" />
										Manage Posts
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/admin/workshops" className="cursor-pointer">
										<Calendar className="mr-2 h-4 w-4" />
										Manage Workshops
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/admin/courses" className="cursor-pointer">
										<BookOpen className="mr-2 h-4 w-4" />
										Manage Courses
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					<HeaderUser />
					<Button asChild size="sm" className="hidden md:inline-flex">
						<a href="#get-started">Get Started</a>
					</Button>
				</div>
			</div>
		</header>
	);
}
