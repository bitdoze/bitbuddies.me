import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "../components/common/SEO";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { SOCIAL_LINKS, SITE_CONFIG } from "../lib/config";
import {
	Github,
	Twitter,
	Youtube,
	Globe,
	Mail,
	Laptop,
	BookOpen,
	Users,
	Code,
	Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	const expertise = [
		"WordPress",
		"Linux",
		"DevOps",
		"Static Sites",
		"CMS",
		"VPS Management",
		"AI Integration",
		"Web Development",
	];

	const offerings = [
		{
			icon: <BookOpen className="h-8 w-8" />,
			title: "Comprehensive Courses",
			description:
				"Structured learning paths to master web development, AI, and DevOps from beginner to advanced levels.",
		},
		{
			icon: <Code className="h-8 w-8" />,
			title: "Hands-On Workshops",
			description:
				"Live and recorded workshops covering practical skills like VPS configuration, blog setup, and AI integration.",
		},
		{
			icon: <Sparkles className="h-8 w-8" />,
			title: "Detailed Tutorials",
			description:
				"Step-by-step guides and tutorials on WordPress, Linux, static sites, and modern development tools.",
		},
		{
			icon: <Users className="h-8 w-8" />,
			title: "Community Support",
			description:
				"Join a community of learners and professionals sharing knowledge, experiences, and support.",
		},
	];

	return (
		<div className="w-full">
			<SEO
				title="About BitBuddies"
				description="Learn about BitBuddies and Dragos - your guide to mastering web development, DevOps, WordPress, Linux, and modern technology. Join our community-driven learning platform."
				keywords="about, dragos, bitbuddies, web development, devops, wordpress, linux, cms, vps, tech education"
				canonicalUrl="/about"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							About{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								BitBuddies
							</span>
						</h1>
						<p className="text-xl text-muted-foreground md:text-2xl">
							Community-driven platform helping you master web development,
							DevOps, and modern technology through hands-on courses, workshops,
							and tutorials.
						</p>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute left-0 top-0 -z-10 h-full w-full">
					<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
				</div>
			</section>

			{/* Mission Statement */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-5xl">
						<div className="rounded-2xl border border-border bg-card p-8 shadow-lg md:p-12">
							<div className="mb-6 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
								<Users className="h-8 w-8" />
							</div>
							<h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
								Our Mission
							</h2>
							<div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
								<p>
									BitBuddies is a community-driven website built to empower
									developers and tech enthusiasts with practical knowledge.
									Through comprehensive courses, hands-on workshops, and detailed
									tutorials, we help you navigate the online space, from VPS
									configurations and blog setups to working with AI and modern
									development tools.
								</p>
								<p className="text-foreground font-medium">
									Our goal is to make quality tech education accessible,
									practical, and community-focused—helping you build real skills
									for real-world applications.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* About Dragos */}
			<section className="bg-muted/30 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-5xl">
						<div className="mb-8 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<Laptop className="h-6 w-6" />
							</div>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Meet Dragos - Your Guide
							</h2>
						</div>

						<div className="space-y-6 text-lg leading-relaxed">
							<p>
								Hey there! I'm Dragos, a seasoned IT professional with over a
								decade of experience in the field. For the past four years, I've
								been deeply immersed in the fascinating world of DevOps,
								constantly honing my skills and staying up to date with the
								latest industry trends.
							</p>

							{/* Expertise Badges */}
							<div className="rounded-xl bg-card p-6 shadow-md">
								<h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-primary" />
									Areas of Expertise
								</h3>
								<div className="flex flex-wrap gap-2">
									{expertise.map((skill) => (
										<Badge
											key={skill}
											variant="secondary"
											className="px-3 py-1 text-sm"
										>
											{skill}
										</Badge>
									))}
								</div>
							</div>

							<p>
								One of my passions lies in writing about WordPress, and I have a
								dedicated platform called{" "}
								<a
									href="https://www.wpdoze.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium transition-colors"
								>
									WPDoze.com
								</a>{" "}
								where I share insights and expertise on this incredibly popular
								content management system. From practical tips to in-depth
								tutorials, I strive to provide valuable resources that empower
								individuals and businesses to make the most out of their
								WordPress websites.
							</p>

							<p>
								In addition to my love for WordPress, I am equally enthusiastic
								about Linux, static sites, CMS, VPS, and all things related to
								DevOps. These subjects have captivated my attention, prompting
								me to launch another platform called{" "}
								<a
									href={SOCIAL_LINKS.blog}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium transition-colors"
								>
									BitDoze.com
								</a>
								. On this website, I delve into the intricate workings of Linux,
								explore the realm of static sites, and shed light on the
								ever-evolving world of content management systems.
							</p>

							<p>
								Beyond my professional pursuits, I find solace in two enjoyable
								hobbies: traveling and indulging in movies. Exploring new
								destinations and immersing myself in diverse cultures
								rejuvenates my spirit and broadens my perspectives. It fuels my
								creativity and inspires me to think outside the box, which
								undoubtedly reflects in my work.
							</p>

							<p>
								Furthermore, I have an extensive network of more than ten
								affiliate sites that I actively promote. These platforms cover a
								range of topics and products, allowing me to connect with a
								diverse audience and share valuable recommendations.
								Collaborating with like-minded individuals and fostering
								partnerships is something I genuinely cherish, as it enables me
								to contribute to the growth and success of others while
								expanding my own horizons.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* What We Offer */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-5xl">
						<h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
							What BitBuddies Offers
						</h2>

						<div className="grid gap-6 md:grid-cols-2">
							{offerings.map((offering, index) => (
								<div
									key={index}
									className="group rounded-xl border border-border bg-card p-6 shadow-md transition-all hover:border-primary/50 hover:shadow-lg"
								>
									<div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										{offering.icon}
									</div>
									<h3 className="mb-3 text-xl font-semibold">
										{offering.title}
									</h3>
									<p className="text-muted-foreground">{offering.description}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Connect Section */}
			<section className="bg-gradient-to-b from-background to-primary/5 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl">
						<div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
							<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
								Connect With Us
							</h2>
							<p className="mb-8 text-lg text-muted-foreground">
								Follow along on social media, check out our blog, or get in
								touch directly. Let's build something amazing together!
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<Button variant="outline" size="lg" asChild>
									<a
										href={SOCIAL_LINKS.github}
										target="_blank"
										rel="noopener noreferrer"
										className="shadow-sm"
									>
										<Github className="h-4 w-4 mr-2" />
										GitHub
									</a>
								</Button>
								<Button variant="outline" size="lg" asChild>
									<a
										href={SOCIAL_LINKS.twitter}
										target="_blank"
										rel="noopener noreferrer"
										className="shadow-sm"
									>
										<Twitter className="h-4 w-4 mr-2" />
										Twitter
									</a>
								</Button>
								<Button variant="outline" size="lg" asChild>
									<a
										href={SOCIAL_LINKS.bluesky}
										target="_blank"
										rel="noopener noreferrer"
										className="shadow-sm"
									>
										<Globe className="h-4 w-4 mr-2" />
										Bluesky
									</a>
								</Button>
								<Button variant="outline" size="lg" asChild>
									<a
										href={SOCIAL_LINKS.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="shadow-sm"
									>
										<Youtube className="h-4 w-4 mr-2" />
										YouTube
									</a>
								</Button>
								<Button variant="outline" size="lg" asChild>
									<a
										href={SOCIAL_LINKS.blog}
										target="_blank"
										rel="noopener noreferrer"
										className="shadow-sm"
									>
										<BookOpen className="h-4 w-4 mr-2" />
										Blog
									</a>
								</Button>
								<Button size="lg" asChild className="shadow-md">
									<a href="/contact">
										<Mail className="h-4 w-4 mr-2" />
										Contact Us
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
