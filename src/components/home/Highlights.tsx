import {
	ArrowRight,
	BookOpen,
	Calendar,
	FileText,
	PlaySquare,
	Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HighlightItem = {
	id: string;
	link?: ReactNode;
	card?: ReactNode;
};

export type HighlightSection = {
	id: string;
	eyebrow?: string;
	title: string;
	description?: string;
	items: HighlightItem[];
	viewAllLink?: string;
	viewAllText?: string;
	icon?: ReactNode;
	tone?: "violet" | "sky" | "amber" | "emerald" | "slate";
};

type HighlightsProps = {
	sections: HighlightSection[];
};

export function Highlights({ sections }: HighlightsProps) {
	// Map section IDs to icons
	const sectionIcons: Record<string, ReactNode> = {
		courses: <BookOpen className="h-5 w-5" />,
		workshops: <Calendar className="h-5 w-5" />,
		posts: <FileText className="h-5 w-5" />,
		videos: <PlaySquare className="h-5 w-5" />,
		tools: <Sparkles className="h-5 w-5" />,
	};

	const toneThemes: Record<
		NonNullable<HighlightSection["tone"]>,
		{
			background: string;
			iconBg: string;
			iconColor: string;
			headerGradient: string;
		}
	> = {
		violet: {
			background: "bg-gradient-to-br from-violet-50 via-purple-50/50 to-white dark:from-violet-950/20 dark:via-purple-950/10 dark:to-background",
			iconBg: "bg-violet-100 dark:bg-violet-900/30",
			iconColor: "text-violet-600 dark:text-violet-400",
			headerGradient: "from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400",
		},
		sky: {
			background: "bg-gradient-to-br from-sky-50 via-cyan-50/50 to-white dark:from-sky-950/20 dark:via-cyan-950/10 dark:to-background",
			iconBg: "bg-sky-100 dark:bg-sky-900/30",
			iconColor: "text-sky-600 dark:text-sky-400",
			headerGradient: "from-sky-600 to-cyan-600 dark:from-sky-400 dark:to-cyan-400",
		},
		amber: {
			background: "bg-gradient-to-br from-amber-50 via-orange-50/50 to-white dark:from-amber-950/20 dark:via-orange-950/10 dark:to-background",
			iconBg: "bg-amber-100 dark:bg-amber-900/30",
			iconColor: "text-amber-600 dark:text-amber-400",
			headerGradient: "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400",
		},
		emerald: {
			background: "bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-background",
			iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
			iconColor: "text-emerald-600 dark:text-emerald-400",
			headerGradient: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
		},
		slate: {
			background: "bg-gradient-to-br from-slate-50 via-gray-50/50 to-white dark:from-slate-900/40 dark:via-slate-950/20 dark:to-background",
			iconBg: "bg-slate-100 dark:bg-slate-800/50",
			iconColor: "text-slate-600 dark:text-slate-400",
			headerGradient: "from-slate-600 to-gray-600 dark:from-slate-400 dark:to-gray-400",
		},
	};

	const defaultTheme = {
		background: "bg-background",
		iconBg: "bg-primary/10",
		iconColor: "text-primary",
		headerGradient: "from-primary to-primary",
	};

	return (
		<div className="space-y-16">
			{sections.map((section) => {
				const theme = section.tone ? toneThemes[section.tone] : defaultTheme;

				return (
					<section
						key={section.id}
						className={cn(
							"relative overflow-hidden rounded-3xl",
							theme.background
						)}
					>
						{/* Decorative elements */}
						<div className="absolute inset-0 opacity-30">
							<div className={cn(
								"absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl",
								theme.iconBg
							)} />
							<div className={cn(
								"absolute -left-20 -bottom-20 h-64 w-64 rounded-full blur-3xl",
								theme.iconBg
							)} />
						</div>

						<div className="relative px-6 py-12 sm:px-8 lg:px-12">
							{/* Header */}
							<div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
								<div className="flex-1 space-y-4">
									<div className="flex items-center gap-3">
										<div className={cn(
											"flex h-12 w-12 items-center justify-center rounded-2xl",
											theme.iconBg
										)}>
											<span className={theme.iconColor}>
												{section.icon || sectionIcons[section.id]}
											</span>
										</div>
										{section.eyebrow && (
											<span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
												{section.eyebrow}
											</span>
										)}
									</div>
									<h2 className={cn(
										"text-3xl font-bold tracking-tight sm:text-4xl bg-linear-to-r bg-clip-text text-transparent",
										theme.headerGradient
									)}>
										{section.title}
									</h2>
									{section.description && (
										<p className="max-w-2xl text-base text-muted-foreground/90 leading-relaxed">
											{section.description}
										</p>
									)}
								</div>

								{section.viewAllLink && (
									<Button
										variant="outline"
										asChild
										className="group gap-2 rounded-full border-2 px-6 shadow-sm hover:shadow-md transition-all"
									>
										<a href={section.viewAllLink}>
											{section.viewAllText || "View all"}
											<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
										</a>
									</Button>
								)}
							</div>

							{/* Content Grid */}
							{section.items.length > 0 ? (
								<div className={cn(
									"grid gap-6",
									section.items.length === 1 && "grid-cols-1 max-w-sm",
									section.items.length === 2 && "grid-cols-1 sm:grid-cols-2 max-w-4xl",
									section.items.length === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
									section.items.length === 3 && (section.id === "courses" || section.id === "workshops" || section.id === "posts") && "max-w-6xl",
									section.items.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
								)}>
									{section.items.map((item, index) => (
										<div
											key={item.id}
											className="motion-safe:animate-fade-up"
											style={{
												animationDelay: `${index * 100}ms`,
												animationFillMode: "backwards",
											}}
										>
											{item.link ?? item.card}
										</div>
									))}
								</div>
							) : (
								<div className="rounded-2xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm p-16 text-center">
									<div className="mx-auto max-w-md space-y-4">
										<div className={cn(
											"mx-auto flex h-20 w-20 items-center justify-center rounded-2xl",
											theme.iconBg
										)}>
											<span className="text-4xl">📚</span>
										</div>
										<h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
										<p className="text-sm text-muted-foreground">
											We're working on amazing content for this section. Check back soon!
										</p>
									</div>
								</div>
							)}
						</div>
					</section>
				);
			})}
		</div>
	);
}
