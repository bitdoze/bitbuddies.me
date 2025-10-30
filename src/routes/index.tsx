import { createFileRoute } from "@tanstack/react-router";
import { Award, BookOpen, Code, Rocket, Users, Zap } from "lucide-react";
import { LogoIcon } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const features = [
		{
			icon: <BookOpen className="w-10 h-10" />,
			title: "Expert-Led Courses",
			description:
				"Learn from industry professionals with real-world experience. Our courses are designed to take you from beginner to expert.",
		},
		{
			icon: <Users className="w-10 h-10" />,
			title: "Vibrant Community",
			description:
				"Connect with thousands of developers worldwide. Share knowledge, collaborate on projects, and grow together.",
		},
		{
			icon: <Zap className="w-10 h-10" />,
			title: "Hands-On Workshops",
			description:
				"Practice makes perfect. Join live workshops and build real projects while learning cutting-edge technologies.",
		},
		{
			icon: <Code className="w-10 h-10" />,
			title: "Modern Tech Stack",
			description:
				"Stay ahead of the curve with courses on the latest frameworks, tools, and best practices in software development.",
		},
		{
			icon: <Rocket className="w-10 h-10" />,
			title: "Career Growth",
			description:
				"Advance your career with portfolio-worthy projects and certifications recognized by top tech companies.",
		},
		{
			icon: <Award className="w-10 h-10" />,
			title: "Lifetime Access",
			description:
				"Once you enroll, the content is yours forever. Learn at your own pace and revisit materials anytime.",
		},
	];

	return (
		<div className="flex flex-col w-full">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-8 flex justify-center">
							<div className="rounded-2xl bg-primary/10 p-6">
								<LogoIcon className="h-20 w-auto" />
							</div>
						</div>
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
							Welcome to{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								BitBuddies
							</span>
						</h1>
						<p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
							Empowering developers to build amazing things together
						</p>
						<p className="mx-auto mb-12 max-w-2xl text-base text-muted-foreground md:text-lg">
							Join thousands of developers learning, building, and growing their
							careers with expert-led courses, hands-on workshops, and a
							supportive community.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button size="lg" className="w-full sm:w-auto" asChild>
								<a href="#features">Explore Courses</a>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="w-full sm:w-auto"
								asChild
							>
								<a href="#community">Join Community</a>
							</Button>
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute left-0 top-0 -z-10 h-full w-full">
					<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
							Why Choose BitBuddies?
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Everything you need to accelerate your development journey and
							achieve your career goals.
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature, index) => (
							<div
								key={index}
								className="group relative rounded-lg border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
							>
								<div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
									{feature.icon}
								</div>
								<h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section
				id="get-started"
				className="bg-gradient-to-b from-background to-primary/5 py-20 md:py-32"
			>
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Ready to Start Your Journey?
						</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							Join BitBuddies today and get access to premium courses, exclusive
							workshops, and a thriving community of developers.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button size="lg" className="w-full sm:w-auto">
								Get Started Free
							</Button>
							<Button size="lg" variant="outline" className="w-full sm:w-auto">
								View Pricing
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
