import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	Calendar,
	FileText,
	LayoutDashboard,
	Shield,
} from "lucide-react";
import { LogoHeader } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import HeaderUser from "@/integrations/clerk/header-user";

const primaryLinks = [
	{ label: "Home", to: "/" },
	{ label: "Courses", to: "/courses" },
	{ label: "Workshops", to: "/workshops" },
	{ label: "Blog", to: "/posts" },
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact" },
];

export default function Header() {
	const { isAdmin } = useAuth();

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6">
				<div className="flex items-center gap-3">
					<SidebarTrigger className="rounded-full border border-border/60 bg-background/80 shadow-sm" />
					<Link
						to="/"
						className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-muted/60"
					>
						<LogoHeader className="h-10 w-auto" />
					</Link>
				</div>
				<nav className="hidden h-full items-center justify-center gap-1  px-2 py-1 lg:flex">
					{primaryLinks.map((link) => {
						return (
							<Link
								key={link.label}
								to={link.to}
								activeProps={{
									className: "text-foreground",
									"data-active": "true",
								}}
								className="group relative rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
							>
								<span>{link.label}</span>
								<span className="pointer-events-none absolute inset-x-3 -bottom-1 h-0.5 scale-x-0 rounded-full bg-primary transition-transform duration-200 group-data-[active=true]:scale-x-100" />
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					{isAdmin && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="hidden gap-2 rounded-full border-border/60 bg-background/80 shadow-sm md:inline-flex"
								>
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
					<Button
						asChild
						size="sm"
						className="hidden px-4 shadow-sm md:inline-flex"
					>
						<Link to="/" hash="highlights">
							Get Started
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
