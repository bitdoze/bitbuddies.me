import { ArrowRight, PlayCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { StatBadge } from "@/components/common/StatBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type HeroStat = {
	label: string;
	value: string;
	icon?: ReactNode;
};

type HeroProps = {
	onPrimaryCta?: () => void;
	onSecondaryCta?: () => void;
	primaryHref?: string;
	secondaryHref?: string;
	stats: HeroStat[];
};

export function Hero({
	onPrimaryCta,
	onSecondaryCta,
	primaryHref = "#highlights",
	secondaryHref = "#community",
	stats,
}: HeroProps) {
	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
			{/* Background decorative elements */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -left-4 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
				<div className="absolute right-1/4 top-40 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
				<div className="absolute left-1/3 bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

				{/* Grid pattern overlay */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
			</div>

			<div className="container relative py-20 sm:py-28 lg:py-32">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					{/* Left content */}
					<div className="space-y-8 motion-safe:animate-fade-up">
						{/* Announcement badge */}
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
							<Star className="h-4 w-4 fill-current" />
							<span>Trusted by 8,000+ developers</span>
						</div>

						{/* Main heading */}
						<h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
							Master development,{" "}
							<span className="relative inline-block">
								<span className="relative z-10 bg-gradient-to-r from-primary via-sky-500 to-purple-500 bg-clip-text text-transparent">
									ship faster
								</span>
								<span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 via-sky-500/20 to-purple-500/20 blur-lg" />
							</span>
						</h1>

						{/* Subtitle */}
						<p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
							Join BitBuddies for hands-on courses, live workshops, and a thriving community.
							Learn from industry experts and build production-ready projects.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col gap-4 sm:flex-row">
							<Button
								asChild
								size="lg"
								className="group gap-2 text-base shadow-lg hover:shadow-xl transition-all"
								onClick={onPrimaryCta}
							>
								<a href={primaryHref}>
									Start learning free
									<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
								</a>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="gap-2 text-base border-2 hover:bg-accent/50"
								onClick={onSecondaryCta}
							>
								<a href={secondaryHref} className="flex items-center gap-2">
									<PlayCircle className="h-5 w-5" />
									Watch demo
								</a>
							</Button>
						</div>

						{/* Stats grid */}
						<div className="mt-12 grid gap-4 sm:grid-cols-2">
							{stats.map((stat, index) => (
								<div
									key={stat.label}
									className="motion-safe:animate-fade-up"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<StatBadge
										label={stat.label}
										value={stat.value}
										icon={stat.icon}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Right content - Feature showcase */}
					<div className="relative hidden lg:flex items-center justify-center">
						{/* Floating decorative cards */}
						<div className="relative w-full max-w-lg">
							{/* Main card */}
							<div className="relative z-10 rounded-3xl border-2 border-border bg-card p-8 shadow-2xl backdrop-blur-sm">
								<div className="space-y-6">
									<div className="flex items-center gap-4">
										<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 shadow-lg">
											<Sparkles className="h-7 w-7 text-white" />
										</div>
										<div>
											<Badge className="mb-2">This Week</Badge>
											<h3 className="text-xl font-bold text-foreground">
												Next.js 15 Masterclass
											</h3>
										</div>
									</div>

									<div className="space-y-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
												<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
											</div>
											<span className="text-sm font-medium text-green-600 dark:text-green-400">
												Live workshop starting soon
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											40+ developers already registered
										</p>
									</div>

									<ul className="space-y-3 text-sm text-muted-foreground">
										{[
											"Build a full-stack app from scratch",
											"Deploy to production in one session",
											"Get expert code reviews",
										].map((item, i) => (
											<li key={i} className="flex items-start gap-3">
												<div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
													<span className="text-xs">✓</span>
												</div>
												<span>{item}</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							{/* Floating badge - top right */}
							<div className="absolute -right-6 top-8 z-20 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-xl motion-safe:animate-float backdrop-blur-sm">
								<div className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-green-500" />
									<div>
										<div className="text-sm font-semibold text-foreground">250+</div>
										<div className="text-xs text-muted-foreground">Projects shipped</div>
									</div>
								</div>
							</div>

							{/* Floating badge - bottom left */}
							<div className="absolute -left-8 bottom-12 z-20 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-xl motion-safe:animate-float backdrop-blur-sm" style={{ animationDelay: "0.5s" }}>
								<div className="flex items-center gap-2">
									<div className="flex -space-x-2">
										<div className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-sky-500" />
										<div className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-purple-500 to-pink-500" />
										<div className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-orange-500 to-red-500" />
									</div>
									<div>
										<div className="text-sm font-semibold text-foreground">8k+</div>
										<div className="text-xs text-muted-foreground">Active learners</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
