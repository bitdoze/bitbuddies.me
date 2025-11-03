import { ArrowRight, CheckCircle2, Rocket, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type JourneyStep = {
	step: string;
	title: string;
	description: string;
};

type JourneyStepsProps = {
	steps: JourneyStep[];
};

const stepIcons = [Target, Rocket, Trophy];

export function JourneySteps({ steps }: JourneyStepsProps) {
	if (!steps.length) return null;

	return (
		<section className="section-spacing relative overflow-hidden" aria-labelledby="journey-heading">
			{/* Background decoration */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
				<div className="absolute right-1/4 bottom-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
			</div>

			<div className="container">
				{/* Section header */}
				<div
					className="mx-auto max-w-3xl text-center space-y-4 motion-safe:animate-fade-up"
					id="journey-heading"
				>
					<Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
						Your Path to Success
					</Badge>
					<h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
						Your learning journey
					</h2>
					<p className="text-lg text-muted-foreground">
						Follow our proven three-step framework to go from learning fundamentals to shipping production-ready applications.
					</p>
				</div>

				{/* Steps grid */}
				<div className="relative mt-16 grid gap-8 md:grid-cols-3">
					{/* Connection lines between steps (desktop only) */}
					<div className="absolute top-12 left-1/6 right-1/6 hidden h-0.5 md:block">
						<div className="h-full bg-gradient-to-r from-primary/50 via-sky-500/50 to-purple-500/50" />
					</div>

					{steps.map((step, index) => {
						const IconComponent = stepIcons[index] || CheckCircle2;
						const gradients = [
							"from-primary to-sky-500",
							"from-sky-500 to-purple-500",
							"from-purple-500 to-pink-500",
						];
						const gradient = gradients[index] || gradients[0];

						return (
							<div
								key={step.step}
								className="relative motion-safe:animate-fade-up"
								style={{ animationDelay: `${index * 150}ms` }}
							>
								{/* Card */}
								<div className="group relative h-full rounded-3xl border-2 border-border bg-card p-8 shadow-lg transition-all hover:shadow-2xl hover:border-primary/50">
									{/* Icon badge */}
									<div className="relative z-10 mb-6 inline-flex">
										<div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
											<IconComponent className="h-7 w-7 text-white" />
										</div>
										{/* Step number badge */}
										<div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card text-sm font-bold text-primary shadow-md">
											{index + 1}
										</div>
									</div>

									{/* Content */}
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
											{step.step}
										</div>
										<h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
											{step.title}
										</h3>
										<p className="text-muted-foreground leading-relaxed">
											{step.description}
										</p>
									</div>

									{/* Hover arrow indicator */}
									<div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
										<span>Learn more</span>
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</div>

									{/* Gradient overlay on hover */}
									<div className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 blur-xl transition-opacity group-hover:opacity-10`} />
								</div>

								{/* Arrow connector (mobile only) */}
								{index < steps.length - 1 && (
									<div className="flex justify-center py-4 md:hidden">
										<ArrowRight className="h-6 w-6 text-primary/30" />
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Bottom CTA */}
				<div className="mt-16 text-center motion-safe:animate-fade-up" style={{ animationDelay: "450ms" }}>
					<p className="text-muted-foreground">
						Ready to start your journey?{" "}
						<a href="#highlights" className="font-semibold text-primary hover:underline">
							Explore our courses
						</a>
					</p>
				</div>
			</div>
		</section>
	);
}
