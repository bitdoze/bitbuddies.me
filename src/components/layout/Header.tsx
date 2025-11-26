import { Link } from "@tanstack/react-router";
import { Menu, Shield, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
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
import { TOOL_REGISTRY } from "@/lib/ai-tools";
import { cn } from "@/lib/utils";

const primaryLinks = [
	{ label: "Courses", to: "/courses" },
	{ label: "Workshops", to: "/workshops" },
	{ label: "Videos", to: "/youtube" },
	{ label: "Blog", to: "/posts" },
	{ label: "Recommended", to: "/recommended" },
];

const buildToolIconSrc = (svg: string) =>
	`data:image/svg+xml,${encodeURIComponent(svg)}`;

export default function Header() {
	const { isAdmin } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 24);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (!menuOpen) {
			return;
		}
		const closeOnResize = () => {
			if (window.innerWidth >= 1024) {
				setMenuOpen(false);
			}
		};
		window.addEventListener("resize", closeOnResize);
		return () => window.removeEventListener("resize", closeOnResize);
	}, [menuOpen]);

	return (
		<header className="sticky top-0 z-40 w-full">
			<nav
				data-state={menuOpen ? "active" : undefined}
				className="px-3 py-2 sm:px-4 lg:px-6"
			>
				<div
					className={cn(
						"mx-auto flex max-w-6xl flex-col rounded-3xl border border-transparent bg-transparent px-4 shadow-none transition-all duration-300",
						isScrolled &&
							"border-border/60 bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60",
					)}
				>
					<div className="flex flex-wrap items-center justify-between gap-4 py-3">
						<div className="flex items-center gap-3">
							<SidebarTrigger className="rounded-full border border-border/60 bg-background/80 p-2 shadow-sm" />
							<Link
								to="/"
								aria-label="Home"
								className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-muted/60"
							>
								<LogoHeader className="h-8 w-auto" />
							</Link>
						</div>
						<nav className="hidden lg:block">
							<ul className="flex items-center gap-6 text-sm font-medium">
								{primaryLinks.map((link) => (
									<li key={link.label}>
										<Link
											to={link.to}
											className="text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
											activeProps={{ "data-status": "active" }}
										>
											{link.label}
										</Link>
									</li>
								))}
								<li>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												type="button"
												className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
											>
												<Sparkles className="h-4 w-4 text-primary" />
												<span>Tools</span>
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="center" className="w-64">
											<DropdownMenuLabel>AI Tools</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link to="/tools" className="cursor-pointer">
													Overview
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											{TOOL_REGISTRY.map((tool) => (
												<DropdownMenuItem key={tool.slug} asChild>
													<Link
														to="/tools/$toolSlug"
														params={{ toolSlug: tool.slug }}
														className="flex items-center gap-2"
													>
														<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
															<img
																src={buildToolIconSrc(tool.icon)}
																alt=""
																className="h-4 w-4"
																loading="lazy"
																aria-hidden="true"
															/>
														</span>
														<span className="flex-1 text-sm">{tool.name}</span>
													</Link>
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</li>
								{isAdmin && (
									<li>
										<Link
											to="/admin"
											className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
											activeProps={{ "data-status": "active" }}
										>
											<Shield className="h-4 w-4" />
											Admin
										</Link>
									</li>
								)}
							</ul>
						</nav>
						<div className="flex items-center gap-2">
							<ThemeToggle />
							<HeaderUser />
							<Button
								asChild
								size="sm"
								className="hidden rounded-full px-4 lg:inline-flex"
							>
								<Link to="/courses">Get Started</Link>
							</Button>
							<button
								type="button"
								onClick={() => setMenuOpen((prev) => !prev)}
								aria-label={menuOpen ? "Close menu" : "Open menu"}
								className="inline-flex items-center rounded-full border border-border/60 p-2 lg:hidden"
							>
								{menuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>
					<div
						className={cn(
							"space-y-6 border-t border-border/50 py-4 lg:hidden",
							menuOpen ? "block" : "hidden",
						)}
					>
						<div className="space-y-4 text-sm font-medium">
							{primaryLinks.map((item) => (
								<Link
									key={item.label}
									to={item.to}
									className="block rounded-2xl border border-border/60 bg-muted/40 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
									activeProps={{ "data-status": "active" }}
									onClick={() => setMenuOpen(false)}
								>
									{item.label}
								</Link>
							))}
							<div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
								<div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
									<Sparkles className="h-4 w-4 text-primary" />
									<span>Tools</span>
								</div>
								<div className="space-y-2">
									<Link
										to="/tools"
										className="block rounded-xl border border-border/40 bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
										onClick={() => setMenuOpen(false)}
									>
										Overview
									</Link>
									<div className="divide-y divide-border/50 rounded-xl border border-border/40 bg-background/70">
										{TOOL_REGISTRY.map((tool) => (
											<Link
												key={tool.slug}
												to="/tools/$toolSlug"
												params={{ toolSlug: tool.slug }}
												className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
												onClick={() => setMenuOpen(false)}
											>
												<span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
													<img
														src={buildToolIconSrc(tool.icon)}
														alt=""
														className="h-4 w-4"
														loading="lazy"
														aria-hidden="true"
													/>
												</span>
												<span className="flex-1">{tool.name}</span>
											</Link>
										))}
									</div>
								</div>
							</div>
							{isAdmin && (
								<Link
									to="/admin"
									className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
									onClick={() => setMenuOpen(false)}
								>
									<Shield className="h-4 w-4" />
									Admin
								</Link>
							)}
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<Button
								asChild
								variant="outline"
								size="sm"
								className="w-full rounded-2xl border-border/70"
							>
								<Link to="/workshops" onClick={() => setMenuOpen(false)}>
									Explore workshops
								</Link>
							</Button>
							<Button asChild size="sm" className="w-full rounded-2xl">
								<Link to="/courses" onClick={() => setMenuOpen(false)}>
									Start learning
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
