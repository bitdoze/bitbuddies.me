import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Github,
	Globe,
	Mail,
	MapPin,
	MessageSquare,
	Send,
	Twitter,
	Youtube,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { SEO } from "../components/common/SEO";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../hooks/useAuth";
import { SITE_CONFIG, SOCIAL_LINKS } from "../lib/config";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
});

function ContactPage() {
	const { user, convexUser } = useAuth();
	const createMessage = useMutation(api.contactMessages.create);

	const [formData, setFormData] = useState({
		name: user?.fullName || "",
		email: user?.primaryEmailAddress?.emailAddress || "",
		subject: "",
		message: "",
	});

	const [status, setStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("submitting");
		setErrorMessage("");

		try {
			await createMessage({
				name: formData.name,
				email: formData.email,
				subject: formData.subject,
				message: formData.message,
				userId: convexUser?._id,
			});

			setStatus("success");
			// Reset form
			setFormData({
				name: user?.fullName || "",
				email: user?.primaryEmailAddress?.emailAddress || "",
				subject: "",
				message: "",
			});

			// Reset success message after 5 seconds
			setTimeout(() => setStatus("idle"), 5000);
		} catch (error) {
			setStatus("error");
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Failed to send message. Please try again.",
			);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return (
		<div className="w-full">
			<SEO
				title="Contact Us"
				description="Get in touch with BitBuddies. Have questions about courses, workshops, or partnerships? We're here to help and would love to hear from you."
				keywords="contact, support, help, questions, partnerships, get in touch"
				canonicalUrl="/contact"
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
							<MessageSquare className="h-12 w-12 text-primary" />
						</div>
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Get in{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Touch
							</span>
						</h1>
						<p className="text-xl text-muted-foreground md:text-2xl">
							Have questions about our courses or workshops? Want to collaborate
							or partner with us? We'd love to hear from you!
						</p>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute left-0 top-0 -z-10 h-full w-full">
					<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
				</div>
			</section>

			{/* Main Content */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
						{/* Contact Form - Takes 2 columns */}
						<div className="lg:col-span-2">
							<div className="rounded-2xl border border-border bg-card p-8 shadow-lg md:p-10">
								<h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
									Send Us a Message
								</h2>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid gap-6 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="name">Name *</Label>
											<Input
												id="name"
												name="name"
												type="text"
												placeholder="Your name"
												value={formData.name}
												onChange={handleChange}
												required
												disabled={status === "submitting"}
												className="shadow-sm"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email *</Label>
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="your.email@example.com"
												value={formData.email}
												onChange={handleChange}
												required
												disabled={status === "submitting"}
												className="shadow-sm"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Subject *</Label>
										<Input
											id="subject"
											name="subject"
											type="text"
											placeholder="What is this about?"
											value={formData.subject}
											onChange={handleChange}
											required
											disabled={status === "submitting"}
											className="shadow-sm"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message *</Label>
										<Textarea
											id="message"
											name="message"
											placeholder="Tell us more..."
											value={formData.message}
											onChange={handleChange}
											required
											disabled={status === "submitting"}
											rows={6}
											className="resize-none shadow-sm"
										/>
									</div>

									{status === "success" && (
										<div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4 text-green-700 dark:text-green-300 shadow-sm">
											<CheckCircle2 className="h-5 w-5 flex-shrink-0" />
											<p className="text-sm font-medium">
												Message sent successfully! We'll get back to you soon.
											</p>
										</div>
									)}

									{status === "error" && (
										<div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300 shadow-sm">
											<AlertCircle className="h-5 w-5 flex-shrink-0" />
											<p className="text-sm font-medium">{errorMessage}</p>
										</div>
									)}

									<Button
										type="submit"
										size="lg"
										className="w-full shadow-md"
										disabled={status === "submitting"}
									>
										{status === "submitting" ? (
											<>
												<span className="animate-spin mr-2">⏳</span>
												Sending...
											</>
										) : (
											<>
												<Send className="h-4 w-4 mr-2" />
												Send Message
											</>
										)}
									</Button>
								</form>
							</div>
						</div>

						{/* Sidebar Info - Takes 1 column */}
						<div className="space-y-6">
							{/* Contact Info */}
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
									<Mail className="h-5 w-5 text-primary" />
									Email Us
								</h3>
								<a
									href={`mailto:${SITE_CONFIG.email}`}
									className="text-primary hover:underline transition-colors flex items-center gap-2 text-lg font-medium"
								>
									{SITE_CONFIG.email}
								</a>
								<p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
									<Clock className="h-4 w-4" />
									We typically respond within 24-48 hours
								</p>
							</div>

							{/* Social Media */}
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-4 text-xl font-semibold">Follow Us</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									Connect with us on social media for updates, tips, and
									community discussions.
								</p>
								<div className="space-y-3">
									<a
										href={SOCIAL_LINKS.github}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
									>
										<div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
											<Github className="h-5 w-5" />
										</div>
										<span>GitHub</span>
									</a>
									<a
										href={SOCIAL_LINKS.twitter}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
									>
										<div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
											<Twitter className="h-5 w-5" />
										</div>
										<span>Twitter</span>
									</a>
									<a
										href={SOCIAL_LINKS.bluesky}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
									>
										<div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
											<Globe className="h-5 w-5" />
										</div>
										<span>Bluesky</span>
									</a>
									<a
										href={SOCIAL_LINKS.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
									>
										<div className="rounded-lg bg-muted p-2 group-hover:bg-primary/10 transition-colors">
											<Youtube className="h-5 w-5" />
										</div>
										<span>YouTube</span>
									</a>
								</div>
							</div>

							{/* Blog */}
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-3 text-xl font-semibold">Our Blog</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									Check out our blog for in-depth articles, tutorials, and tech
									insights.
								</p>
								<Button
									variant="outline"
									size="sm"
									asChild
									className="w-full shadow-sm"
								>
									<a
										href={SOCIAL_LINKS.blog}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Globe className="h-4 w-4 mr-2" />
										Visit BitDoze.com
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="bg-muted/30 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl">
						<h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
							Quick Help
						</h2>
						<div className="grid gap-6 md:grid-cols-3">
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-3 text-lg font-semibold">
									How do I enroll in a course?
								</h3>
								<p className="text-sm text-muted-foreground">
									Create an account, browse our courses, and click "Enroll" on
									any course page to get started.
								</p>
							</div>
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-3 text-lg font-semibold">
									What's included in a subscription?
								</h3>
								<p className="text-sm text-muted-foreground">
									Access to all courses, workshops, downloadable resources, and
									community features.
								</p>
							</div>
							<div className="rounded-xl border border-border bg-card p-6 shadow-md">
								<h3 className="mb-3 text-lg font-semibold">
									Can I get a refund?
								</h3>
								<p className="text-sm text-muted-foreground">
									Yes! We offer a 14-day money-back guarantee. See our{" "}
									<a href="/terms" className="text-primary hover:underline">
										Terms of Service
									</a>{" "}
									for details.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
