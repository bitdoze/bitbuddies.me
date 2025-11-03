import { CheckCircle2 } from "lucide-react";

type JourneyStep = {
	step: string;
	title: string;
	description: string;
};

type JourneyStepsProps = {
	steps: JourneyStep[];
};

export function JourneySteps({ steps }: JourneyStepsProps) {
	if (!steps.length) return null;

	return (
		<section className="section-spacing" aria-labelledby="journey-heading">
			<div className="container">
				<div
					className="section-heading motion-safe:animate-fade-up"
					id="journey-heading"
				>
					<h2 className="section-heading__title">Your learning journey</h2>
					<p className="section-heading__description">
						BitBuddies guides you from foundations to shipping polished products
						with curated checklists at every step.
					</p>
				</div>
				<ol className="relative mt-12 grid gap-10 md:grid-cols-3">
					{steps.map((step, index) => (
						<li
							key={step.step}
							className="relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm motion-safe:animate-fade-up"
							style={{ animationDelay: `${index * 0.07}s` }}
						>
							<div className="flex items-center gap-2 text-sm font-semibold text-primary">
								<CheckCircle2 className="h-4 w-4" />
								{step.step}
							</div>
							<h3 className="text-xl font-semibold">{step.title}</h3>
							<p className="text-sm text-muted-foreground">
								{step.description}
							</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
