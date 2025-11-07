import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Layers,
	Puzzle,
	Rocket,
	Sparkles,
	Wand2,
	Zap,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AI_CONFIG, getAiModelId } from "@/lib/config";
import { TOOL_REGISTRY } from "@/lib/ai-tools";

export const Route = createFileRoute("/tools/")({
	component: ToolsHub,
});

function ToolsHub() {
	const modelId = getAiModelId();
	const toolCount = TOOL_REGISTRY.length;
	const heroMetrics = [
		{ label: "Tools", value: toolCount, detail: "Preset workflows" },
		{ label: "Streaming", value: "Gateway", detail: "Realtime output" },
		{ label: "Setup", value: "Env-first", detail: "No extra wiring" },
	];
	const featureHighlights = [
		{
			title: "Streaming-first delivery",
			description: "Gateway-backed streaming keeps the UI responsive and shows results as they land.",
			icon: <Zap className="h-5 w-5" />,
			accent: "from-primary/25 via-primary/10 to-background",
		},
		{
			title: "Curated tool presets",
			description: "Each tool packages prompts, tips, and formatting so teams share the same guardrails.",
			icon: <Puzzle className="h-5 w-5" />,
			accent: "from-secondary/25 via-secondary/10 to-background",
		},
		{
			title: "Unified control plane",
			description: "Switch providers or models centrally and every tool instantly reflects the change.",
			icon: <Wand2 className="h-5 w-5" />,
			accent: "from-sky-200/40 via-sky-100/20 to-background",
		},
	];

	return (
		<div className="w-full">
			<SEO
				title="AI Tools Hub"
				description="Discover the BitBuddies library of streaming AI tools for titles, scripts, posts, and more."
				canonicalUrl="/tools"
			/>
			<section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
				<div className="absolute inset-0 -z-10">
					<div className="absolute left-12 top-0 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
					<div className="absolute right-10 bottom-0 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
				</div>
				<div className="container mx-auto px-4">
					<div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_420px]">
						<div className="space-y-8">
							<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm shadow-sm backdrop-blur">
								<Sparkles className="h-4 w-4 text-primary" />
								<span>BitBuddies AI Toolkit</span>
							</div>
							<h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
								Ship content experiences with reusable AI blueprints
							</h1>
							<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
								Select a workflow, tweak a few inputs, and stream results back instantly through the Vercel AI Gateway—no custom wiring or prompt drift across teams.
							</p>
							<div className="grid gap-4 sm:grid-cols-3">
								{heroMetrics.map((metric) => (
									<Card key={metric.label} className="border-border/60 bg-background/80 shadow-sm">
										<CardHeader className="space-y-1">
											<CardTitle className="text-sm font-semibold text-muted-foreground">
												{metric.label}
											</CardTitle>
											<CardDescription className="text-2xl font-semibold text-foreground">
												{metric.value}
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<p className="text-xs uppercase tracking-wide text-muted-foreground/80">
												{metric.detail}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
							<div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-background/70 px-6 py-4 text-sm text-muted-foreground shadow-sm">
								<div className="flex items-center gap-2">
									<Wand2 className="h-4 w-4 text-primary" />
									<span className="font-semibold text-foreground">{modelId}</span>
									<span className="uppercase tracking-wide text-muted-foreground/70">Model</span>
								</div>
								<div className="hidden h-6 w-px bg-border/60 sm:block" />
								<div className="flex items-center gap-2">
									<Layers className="h-4 w-4 text-primary" />
									<span className="font-semibold text-foreground">{AI_CONFIG.provider}</span>
									<span className="uppercase tracking-wide text-muted-foreground/70">Provider</span>
								</div>
								<div className="hidden h-6 w-px bg-border/60 sm:block" />
								<div className="flex items-center gap-2">
									<Rocket className="h-4 w-4 text-primary" />
									<span className="font-semibold text-foreground">{toolCount}</span>
									<span className="uppercase tracking-wide text-muted-foreground/70">Tools ready</span>
								</div>
							</div>
							<div className="flex flex-wrap gap-3">
								<Button asChild size="lg" className="rounded-full shadow-lg">
									<Link to="/tools/title-generator">
										Launch first tool <ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg" className="rounded-full border-border/70">
									<Link to="/tools" hash="library">
										Browse full library
									</Link>
								</Button>
							</div>
						</div>
						<Card className="border-border/70 bg-card/90 shadow-xl">
							<div className="h-28 w-full rounded-t-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
							<CardHeader className="space-y-4">
								<CardTitle className="text-lg font-semibold">What you get</CardTitle>
								<p className="text-sm text-muted-foreground">
									Opinionated prompts, tool-specific tips, and formatting helpers that keep every result actionable.
								</p>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<div className="flex items-start gap-3">
									<div className="mt-1 h-2 w-2 rounded-full bg-primary" />
									<span>Streaming responses with JSON, JSONL, and long-form parsing already handled for you.</span>
								</div>
								<div className="flex items-start gap-3">
									<div className="mt-1 h-2 w-2 rounded-full bg-primary" />
									<span>Built-in copy affordances so teams can drop outputs straight into workflows.</span>
								</div>
								<div className="flex items-start gap-3">
									<div className="mt-1 h-2 w-2 rounded-full bg-primary" />
									<span>Env-driven config—swap providers or models without touching the UI.</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 py-16">
				<div className="grid gap-6 md:grid-cols-3">
					{featureHighlights.map((feature) => (
						<Card
							key={feature.title}
							className="border-border/60 bg-card/90 shadow-md"
						>
							<CardHeader className={`space-y-3 rounded-2xl bg-gradient-to-br ${feature.accent} p-5`}>
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-primary">
									{feature.icon}
								</span>
								<CardTitle className="text-lg font-semibold text-foreground">
									{feature.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="px-5 pb-5 pt-4">
								<p className="text-sm text-muted-foreground">{feature.description}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section id="library" className="container mx-auto px-4 pb-20">
				<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="space-y-2">
						<h2 className="text-3xl font-bold tracking-tight">Tools library</h2>
						<p className="text-sm text-muted-foreground">
							Pick a tool to open its dedicated workspace with contextual tips, benefits, and formatted output.
						</p>
					</div>
					<Badge variant="outline" className="rounded-full border-primary/40 bg-primary/5 text-primary">
						Streaming via gateway
					</Badge>
				</div>
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{TOOL_REGISTRY.map((tool) => (
						<Card key={tool.slug} className="group flex h-full flex-col justify-between border-border/70 bg-card/90 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
							<CardHeader className="space-y-4">
								<div className="flex items-center gap-3">
									<span
										className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
										dangerouslySetInnerHTML={{ __html: tool.icon }}
									/>
									<div className="space-y-1">
										<CardTitle className="text-xl font-semibold">{tool.name}</CardTitle>
										<CardDescription className="text-sm text-muted-foreground">
											{tool.description}
										</CardDescription>
									</div>
								</div>
								<Badge variant="secondary" className="w-fit rounded-full bg-primary/10 text-primary">
									{tool.category}
								</Badge>
							</CardHeader>
							<CardContent className="flex-1">
								<ul className="space-y-2 text-sm text-muted-foreground">
									{tool.tips?.slice(0, 2).map((tip) => (
										<li key={tip} className="line-clamp-2">
											• {tip}
										</li>
									)) ?? (
										<li>Tailored prompt guidance included.</li>
									)}
								</ul>
							</CardContent>
							<CardFooter className="flex items-center justify-between border-t border-border/60 bg-background/60 px-6 py-4">
								<Button asChild variant="ghost" className="gap-2 text-primary">
									<Link to="/tools/$toolSlug" params={{ toolSlug: tool.slug }}>
										Open tool
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
