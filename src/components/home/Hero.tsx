import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { StatBadge } from "@/components/common/StatBadge";
import { Button } from "@/components/ui/button";

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
		<section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pb-32 pt-24">
			<div className="absolute inset-0 -z-10">
				<div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
			</div>
			<div className="container">
				<div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
					<div className="space-y-8 motion-safe:animate-fade-up">
						<span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
							<PlayCircle className="h-4 w-4" />
							Learn, build, and launch faster
						</span>
						<h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
							Build your developer journey with
							<span className="bg-gradient-to-r from-primary via-primary/80 to-sky-500 bg-clip-text text-transparent">
								BitBuddies
							</span>
						</h1>
						<p className="text-lg text-muted-foreground sm:text-xl">
							Curated courses, live workshops, and an active community that
							helps you ship production-ready projects faster.
						</p>
						<div className="flex flex-col gap-4 sm:flex-row">
							<Button
								asChild
								size="lg"
								className="group gap-2"
								onClick={onPrimaryCta}
							>
								<a href={primaryHref}>
									Start exploring
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
								</a>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="gap-2"
								onClick={onSecondaryCta}
							>
								<a href={secondaryHref}>Join the community</a>
							</Button>
						</div>
						<div className="mt-8 grid gap-4 motion-safe:animate-stagger sm:grid-cols-2">
							{stats.map((stat) => (
								<StatBadge
									key={stat.label}
									label={stat.label}
									value={stat.value}
									icon={stat.icon}
								/>
							))}
						</div>
					</div>
					<div className="relative hidden h-full w-full justify-self-end sm:flex">
						<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-background to-background blur-3xl" />
						<div className="relative ml-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border/80 bg-card/80 p-6 shadow-2xl backdrop-blur">
							<div className="flex items-center gap-3">
								<div className="rounded-2xl bg-primary/10 p-3 text-primary">
									<Sparkles className="h-6 w-6" />
								</div>
								<div>
									<p className="text-sm font-semibold text-muted-foreground">
										This week on BitBuddies
									</p>
									<h3 className="text-lg font-semibold text-foreground">
										New AI course & live AMA
									</h3>
								</div>
							</div>
							<ul className="space-y-3 text-sm text-muted-foreground">
								<li>• Hands-on projects with expert mentors</li>
								<li>• Weekly community office hours and demos</li>
								<li>• Templates, checklists, and curated resources</li>
							</ul>
							<div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary">
								Members collaborate on 40+ builds every month.
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
