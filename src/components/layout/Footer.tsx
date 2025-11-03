import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Github,
	Globe,
	Mail,
	Twitter,
	Youtube,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG, SOCIAL_LINKS } from "@/lib/config";

export default function Footer() {
	return (
		<footer className="border-t border-border/60 bg-background/95">
			<div className="container space-y-12 py-16">
				<div className="card-surface flex flex-col gap-6 overflow-hidden bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 px-8 py-10 text-center shadow-lg md:flex-row md:items-center md:justify-between md:text-left">
					<div className="space-y-3">
						<span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
							Ready to build?
						</span>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Launch your next project with BitBuddies
						</h2>
						<p className="text-base text-muted-foreground md:max-w-2xl">
							Access workshops, courses, and community support tailored to every
							stage of your developer journey.
						</p>
					</div>
					<div className="flex flex-col items-center gap-3 md:flex-row">
						<Button asChild size="lg" className="gap-2">
							<a href="/workshops">
								Explore workshops
								<ArrowRight className="h-4 w-4" />
							</a>
						</Button>
						<Button asChild size="lg" variant="outline">
							<a href="/courses">Browse courses</a>
						</Button>
					</div>
				</div>

				<div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
					<div className="space-y-5">
						<Logo className="h-10 w-auto" />
						<p className="max-w-sm text-sm text-muted-foreground">
							Empowering developers to build amazing things together with
							curated learning and collaborative projects.
						</p>
						<div className="flex flex-wrap items-center gap-3">
							{[
								{
									icon: <Github className="h-5 w-5" />,
									label: "GitHub",
									href: SOCIAL_LINKS.github,
								},
								{
									icon: <Twitter className="h-5 w-5" />,
									label: "Twitter",
									href: SOCIAL_LINKS.twitter,
								},
								{
									icon: <Globe className="h-5 w-5" />,
									label: "Bluesky",
									href: SOCIAL_LINKS.bluesky,
								},
								{
									icon: <Youtube className="h-5 w-5" />,
									label: "YouTube",
									href: SOCIAL_LINKS.youtube,
								},
							].map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="group rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
								>
									<span className="sr-only">{social.label}</span>
									{social.icon}
								</a>
							))}
							<a
								href={`mailto:${SITE_CONFIG.email}`}
								className="group rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
							>
								<span className="sr-only">Email</span>
								<Mail className="h-5 w-5" />
							</a>
						</div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Product
							</h3>
							<ul className="mt-4 space-y-3 text-sm text-muted-foreground">
								<li>
									<a
										href="/courses"
										className="transition-colors hover:text-foreground"
									>
										Courses
									</a>
								</li>
								<li>
									<Link
										to="/workshops"
										className="transition-colors hover:text-foreground"
									>
										Workshops
									</Link>
								</li>
								<li>
									<a
										href="/community"
										className="transition-colors hover:text-foreground"
									>
										Community
									</a>
								</li>
								<li>
									<a
										href="/pricing"
										className="transition-colors hover:text-foreground"
									>
										Pricing
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Resources
							</h3>
							<ul className="mt-4 space-y-3 text-sm text-muted-foreground">
								<li>
									<a
										href={SOCIAL_LINKS.blog}
										target="_blank"
										rel="noopener noreferrer"
										className="transition-colors hover:text-foreground"
									>
										Blog
									</a>
								</li>
								<li>
									<Link
										to="/contact"
										className="transition-colors hover:text-foreground"
									>
										Contact
									</Link>
								</li>
								<li>
									<a
										href="/debug/user-sync"
										className="transition-colors hover:text-foreground"
									>
										Debug tools
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Company
						</h3>
						<ul className="mt-4 space-y-3 text-sm text-muted-foreground">
							<li>
								<Link
									to="/about"
									className="transition-colors hover:text-foreground"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									to="/privacy"
									className="transition-colors hover:text-foreground"
								>
									Privacy
								</Link>
							</li>
							<li>
								<Link
									to="/terms"
									className="transition-colors hover:text-foreground"
								>
									Terms
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} BitBuddies. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
