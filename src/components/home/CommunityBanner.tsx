import { ArrowRight, MessageSquare, Users, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CommunityBannerProps = {
	primaryHref?: string;
	secondaryHref?: string;
	sectionId?: string;
};

export function CommunityBanner({
	primaryHref = "/workshops",
	secondaryHref = "/community",
	sectionId,
}: CommunityBannerProps) {
	return (
		<section id={sectionId} className="section-spacing relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
				<div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
			</div>

			<div className="container">
				<div className="relative overflow-hidden rounded-[2.5rem] border-2 border-border bg-gradient-to-br from-primary/10 via-background to-purple-500/10 shadow-2xl">
					{/* Grid pattern overlay */}
					<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />

					<div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16">
						<div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
							{/* Left content */}
							<div className="space-y-8">
								{/* Badge */}
								<div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/10 px-5 py-2 shadow-sm backdrop-blur-sm">
									<Users className="h-4 w-4 text-primary" />
									<span className="text-sm font-semibold text-primary">
										Join 8,000+ developers worldwide
									</span>
								</div>

								{/* Heading */}
								<div className="space-y-4">
									<h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
										Learn together,{" "}
										<span className="bg-gradient-to-r from-primary via-sky-500 to-purple-500 bg-clip-text text-transparent">
											grow faster
										</span>
									</h2>
									<p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
										Join our vibrant community of developers, attend live workshops, get expert feedback, and collaborate on real-world projects. Your next breakthrough is just one connection away.
									</p>
								</div>

								{/* Community features */}
								<div className="grid gap-4 sm:grid-cols-2">
									{[
										{
											icon: MessageSquare,
											title: "Live Q&A Sessions",
											description: "Ask questions and get instant feedback",
										},
										{
											icon: Zap,
											title: "Code Reviews",
											description: "Expert reviews on your projects",
										},
										{
											icon: Users,
											title: "Study Groups",
											description: "Learn together with peers",
										},
										{
											icon: Heart,
											title: "Supportive Community",
											description: "Encouraging environment for all levels",
										},
									].map((feature, index) => (
										<div
											key={feature.title}
											className="flex items-start gap-3 motion-safe:animate-fade-up"
											style={{ animationDelay: `${index * 100}ms` }}
										>
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
												<feature.icon className="h-5 w-5" />
											</div>
											<div className="space-y-1">
												<div className="font-semibold text-foreground">
													{feature.title}
												</div>
												<div className="text-sm text-muted-foreground">
													{feature.description}
												</div>
											</div>
										</div>
									))}
								</div>

								{/* CTA Buttons */}
								<div className="flex flex-col gap-4 sm:flex-row">
									<Button
										asChild
										size="lg"
										className="group gap-2 text-base shadow-lg hover:shadow-xl"
									>
										<a href={primaryHref}>
											Explore workshops
											<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
										</a>
									</Button>
									<Button
										asChild
										size="lg"
										variant="outline"
										className="gap-2 text-base border-2"
									>
										<a href={secondaryHref}>Join community</a>
									</Button>
								</div>
							</div>

							{/* Right content - Stats cards */}
							<div className="hidden lg:block">
								<div className="space-y-6">
									{/* Active members card */}
									<div className="rounded-2xl border-2 border-border bg-card/80 p-6 shadow-xl backdrop-blur-sm motion-safe:animate-fade-up">
										<div className="flex items-center gap-4">
											<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
												<Users className="h-7 w-7" />
											</div>
											<div>
												<div className="text-3xl font-bold text-foreground">
													8,247
												</div>
												<div className="text-sm text-muted-foreground">
													Active members this month
												</div>
											</div>
										</div>
									</div>

									{/* Workshops card */}
									<div className="rounded-2xl border-2 border-border bg-card/80 p-6 shadow-xl backdrop-blur-sm motion-safe:animate-fade-up" style={{ animationDelay: "150ms" }}>
										<div className="flex items-center gap-4">
											<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-500 text-white shadow-lg">
												<Zap className="h-7 w-7" />
											</div>
											<div>
												<div className="text-3xl font-bold text-foreground">
													40+
												</div>
												<div className="text-sm text-muted-foreground">
													Live events monthly
												</div>
											</div>
										</div>
									</div>

									{/* Projects card */}
									<div className="rounded-2xl border-2 border-border bg-card/80 p-6 shadow-xl backdrop-blur-sm motion-safe:animate-fade-up" style={{ animationDelay: "300ms" }}>
										<div className="flex items-center gap-4">
											<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
												<Heart className="h-7 w-7" />
											</div>
											<div>
												<div className="text-3xl font-bold text-foreground">
													250+
												</div>
												<div className="text-sm text-muted-foreground">
													Projects shipped
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Decorative elements */}
					<div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
					<div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl" />
				</div>
			</div>
		</section>
	);
}
