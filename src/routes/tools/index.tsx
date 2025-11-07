import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle2,
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
		{ label: "AI Tools", value: toolCount, detail: "Ready to use", icon: Rocket },
		{ label: "Real-time", value: "Stream", detail: "Live output", icon: Zap },
		{ label: "No Config", value: "Env", detail: "Just works", icon: CheckCircle2 },
	];

	const featureHighlights = [
		{
			title: "Real-time streaming",
			description:
				"Watch AI generate content in real-time. Powered by Vercel AI Gateway with abort support for full control.",
			icon: <Zap className="h-5 w-5" />,
			gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
			iconBg: "bg-violet-500/10",
			iconColor: "text-violet-600 dark:text-violet-400",
		},
		{
			title: "Smart output parsing",
			description:
				"Automatically formats JSON, JSONL, and text responses with tool-specific renderers and one-click copy.",
			icon: <Puzzle className="h-5 w-5" />,
			gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
			iconBg: "bg-blue-500/10",
			iconColor: "text-blue-600 dark:text-blue-400",
		},
		{
			title: "Centralized config",
			description:
				"Switch AI providers or models once and every tool updates instantly. No code changes needed.",
			icon: <Wand2 className="h-5 w-5" />,
			gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-600 dark:text-emerald-400",
		},
	];

	const toolCategories = Array.from(
		new Set(TOOL_REGISTRY.map((tool) => tool.category)),
	);

	return (
		<div className="w-full">
			<SEO
				title="AI Tools Hub"
				description="Discover the BitBuddies library of streaming AI tools for titles, scripts, posts, and more."
				canonicalUrl="/tools"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b bg-linear-to-br from-primary/5 via-background to-secondary/5 py-24">
				{/* Background decoration */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute left-12 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
					<div className="absolute right-10 bottom-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-pulse [animation-delay:1s]" />
				</div>

				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-6xl">
						{/* Badge */}
						<div className="mb-8 flex justify-center">
							<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-5 py-2.5 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-md">
								<Sparkles className="h-4 w-4 text-primary animate-pulse" />
								<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
									Powered by AI Gateway
								</span>
							</div>
						</div>

						{/* Main Heading */}
						<div className="text-center space-y-6 mb-12">
							<h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-linear-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
								AI Tools That Actually Work
							</h1>
							<p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl leading-relaxed">
								Professional-grade AI tools with streaming responses, smart formatting,
								and zero configuration. Pick a tool, add your input, and watch the magic happen.
							</p>
						</div>

						{/* Metrics Cards */}
						<div className="grid gap-4 sm:grid-cols-3 mb-10">
							{heroMetrics.map((metric) => {
								const Icon = metric.icon;
								return (
									<Card
										key={metric.label}
										className="group border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-primary/30"
									>
										<CardContent className="flex items-center gap-4 p-6">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
												<Icon className="h-6 w-6" />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium text-muted-foreground">
													{metric.label}
												</p>
												<p className="text-2xl font-bold text-foreground">
													{metric.value}
												</p>
												<p className="text-xs text-muted-foreground/80">
													{metric.detail}
												</p>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{/* Config Info */}
						<div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm px-8 py-5 text-sm shadow-sm">
							<div className="flex items-center gap-2.5">
								<Wand2 className="h-4 w-4 text-primary" />
								<span className="font-semibold text-foreground">{modelId}</span>
							</div>
							<div className="h-6 w-px bg-border/60" />
							<div className="flex items-center gap-2.5">
								<Layers className="h-4 w-4 text-primary" />
								<span className="font-semibold text-foreground">{AI_CONFIG.provider}</span>
							</div>
							<div className="h-6 w-px bg-border/60" />
							<div className="flex items-center gap-2.5">
								<Rocket className="h-4 w-4 text-primary" />
								<span className="font-semibold text-foreground">{toolCount} Tools</span>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-wrap justify-center gap-4 mt-10">
							<Button
								asChild
								size="lg"
								className="rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
							>
								<Link to="/tools/$toolSlug" params={{ toolSlug: "title-generator" }}>
									Try Title Generator
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="rounded-full border-border/70 backdrop-blur-sm"
							>
								<a href="#tools-library">Browse All Tools</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Feature Highlights */}
			<section className="container mx-auto px-4 py-20">
				<div className="mx-auto max-w-6xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
							Why Use These Tools?
						</h2>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto">
							Built with modern AI infrastructure and developer experience in mind
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{featureHighlights.map((feature) => (
							<Card
								key={feature.title}
								className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-md transition-all hover:shadow-xl hover:-translate-y-2"
							>
								{/* Gradient background */}
								<div
									className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
								/>

								<CardHeader className="relative space-y-4 pb-6">
									<div
										className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor} transition-transform group-hover:scale-110 group-hover:rotate-3`}
									>
										{feature.icon}
									</div>
									<CardTitle className="text-xl font-bold text-foreground">
										{feature.title}
									</CardTitle>
								</CardHeader>

								<CardContent className="relative">
									<p className="text-sm leading-relaxed text-muted-foreground">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Tools Library */}
			<section id="tools-library" className="container mx-auto px-4 pb-24">
				<div className="mx-auto max-w-6xl">
					{/* Section Header */}
					<div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div className="space-y-3">
							<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
								Tools Library
							</h2>
							<p className="text-muted-foreground text-lg max-w-2xl">
								Choose a tool to start generating content with AI-powered assistance
							</p>
						</div>
						<Badge
							variant="outline"
							className="w-fit rounded-full border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
						>
							{toolCategories.length} {toolCategories.length === 1 ? "Category" : "Categories"}
						</Badge>
					</div>

					{/* Tools Grid */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{TOOL_REGISTRY.map((tool, index) => (
							<Card
								key={tool.slug}
								className="group relative flex h-full flex-col justify-between overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm shadow-md transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30"
								style={{
									animationDelay: `${index * 50}ms`,
								}}
							>
								{/* Hover gradient overlay */}
								<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative">
									<CardHeader className="space-y-4 pb-4">
										<div className="flex items-start justify-between gap-3">
											<div
												className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:rotate-6"
												dangerouslySetInnerHTML={{ __html: tool.icon }}
											/>
											<Badge
												variant="secondary"
												className="shrink-0 rounded-full bg-secondary/80 text-xs font-medium"
											>
												{tool.category}
											</Badge>
										</div>

										<div className="space-y-2">
											<CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
												{tool.name}
											</CardTitle>
											<CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
												{tool.description}
											</CardDescription>
										</div>
									</CardHeader>

									<CardContent className="pb-4">
										<div className="space-y-2">
											{tool.tips?.slice(0, 2).map((tip, tipIndex) => (
												<div key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-primary/60 mt-0.5" />
													<span className="line-clamp-1">{tip}</span>
												</div>
											))}
										</div>
									</CardContent>
								</div>

								<CardFooter className="relative border-t border-border/60 bg-background/40 backdrop-blur-sm px-6 py-4">
									<Button
										asChild
										variant="ghost"
										className="w-full justify-between gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-all group/btn"
									>
										<Link to="/tools/$toolSlug" params={{ toolSlug: tool.slug }}>
											<span className="font-semibold">Open Tool</span>
											<ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
										</Link>
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>

					{/* Bottom CTA */}
					<div className="mt-16 text-center">
						<Card className="mx-auto max-w-2xl border-primary/20 bg-linear-to-br from-primary/5 via-background to-secondary/5 shadow-lg">
							<CardContent className="p-8 space-y-4">
								<div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-2">
									<Sparkles className="h-8 w-8" />
								</div>
								<h3 className="text-2xl font-bold">Ready to boost your content creation?</h3>
								<p className="text-muted-foreground">
									All tools are free to use and powered by the latest AI models. Start creating better content today.
								</p>
								<Button asChild size="lg" className="rounded-full shadow-md">
									<Link to="/tools/$toolSlug" params={{ toolSlug: "title-generator" }}>
										Get Started
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
}
