import { Link } from "@tanstack/react-router";
import { Github, Mail, Twitter, Youtube, Globe } from "lucide-react";
import { SOCIAL_LINKS, SITE_CONFIG } from "@/lib/config";
import { Logo } from "@/components/common/logo";

export default function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="container px-4 py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					{/* Brand Section */}
					<div className="space-y-4">
						<Logo className="h-10 w-auto" />
						<p className="text-sm text-muted-foreground">
							Empowering developers to build amazing things together.
						</p>
						<div className="flex gap-4">
							<a
								href={SOCIAL_LINKS.github}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Github className="h-5 w-5" />
								<span className="sr-only">GitHub</span>
							</a>
							<a
								href={SOCIAL_LINKS.twitter}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Twitter className="h-5 w-5" />
								<span className="sr-only">Twitter</span>
							</a>
							<a
								href={SOCIAL_LINKS.bluesky}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Globe className="h-5 w-5" />
								<span className="sr-only">Bluesky</span>
							</a>
							<a
								href={SOCIAL_LINKS.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Youtube className="h-5 w-5" />
								<span className="sr-only">YouTube</span>
							</a>
							<a
								href={`mailto:${SITE_CONFIG.email}`}
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<Mail className="h-5 w-5" />
								<span className="sr-only">Email</span>
							</a>
						</div>
					</div>

					{/* Product Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Product</h3>
						<ul className="space-y-3">
							<li>
								<a
									href="/courses"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Courses
								</a>
							</li>
							<li>
								<Link
									to="/workshops"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Workshops
								</Link>
							</li>
							<li>
								<a
									href="/community"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Community
								</a>
							</li>
							<li>
								<a
									href="/pricing"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Pricing
								</a>
							</li>
						</ul>
					</div>

					{/* Resources Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Resources</h3>
						<ul className="space-y-3">
							<li>
								<a
									href={SOCIAL_LINKS.blog}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Blog
								</a>
							</li>
							<li>
								<Link
									to="/workshops"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Workshops
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Company Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Company</h3>
						<ul className="space-y-3">
							<li>
								<Link
									to="/about"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									to="/privacy"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Privacy
								</Link>
							</li>
							<li>
								<Link
									to="/terms"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Terms
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 border-t border-border pt-8">
					<p className="text-center text-sm text-muted-foreground">
						© {new Date().getFullYear()} BitBuddies. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
