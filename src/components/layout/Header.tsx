import { Link } from "@tanstack/react-router";
import { LogoHeader } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import HeaderUser from "@/integrations/clerk/header-user";

export default function Header() {
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
					<HeaderUser />
					<Button asChild size="sm" className="hidden md:inline-flex">
						<a href="#get-started">Get Started</a>
					</Button>
				</div>
			</div>
		</header>
	);
}
