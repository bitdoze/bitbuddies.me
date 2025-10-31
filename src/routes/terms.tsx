import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "../components/common/SEO";
import { SITE_CONFIG } from "../lib/config";
import {
	FileText,
	Scale,
	CreditCard,
	Shield,
	AlertTriangle,
	Users,
	Gavel,
	Mail,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
});

function TermsPage() {
	const sections = [
		{
			icon: <FileText className="h-6 w-6" />,
			title: "1. Agreement to Terms",
			content: (
				<>
					<p>
						Welcome to BitBuddies. By accessing or using our website at{" "}
						<a
							href={SITE_CONFIG.url}
							className="text-primary hover:underline font-medium transition-colors"
						>
							{SITE_CONFIG.url}
						</a>{" "}
						("Service"), you agree to be bound by these Terms of Service
						("Terms"). If you disagree with any part of these terms, you may
						not access the Service.
					</p>
					<p className="mt-4">
						These Terms apply to all visitors, users, and others who access or
						use the Service. By using the Service, you represent that you are
						at least 13 years of age.
					</p>
				</>
			),
		},
		{
			icon: <Scale className="h-6 w-6" />,
			title: "2. Description of Service",
			content: (
				<>
					<p className="mb-3">
						BitBuddies is an online learning platform that provides:
					</p>
					<ul className="space-y-2 text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								Educational courses and workshops on web development, DevOps,
								WordPress, Linux, and related technologies
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Video tutorials and written content</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Downloadable resources and materials</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Community features and discussions</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Blog posts and articles</span>
						</li>
					</ul>
					<p className="mt-4">
						We reserve the right to modify, suspend, or discontinue any part
						of the Service at any time without notice.
					</p>
				</>
			),
		},
		{
			icon: <Users className="h-6 w-6" />,
			title: "3. User Accounts",
			content: (
				<>
					<div className="space-y-6">
						<div>
							<h3 className="font-semibold text-lg mb-2">
								3.1 Account Creation
							</h3>
							<p className="text-muted-foreground">
								To access certain features of the Service, you must create an
								account. You agree to provide accurate, current, and complete
								information during registration and to update such information
								to keep it accurate, current, and complete.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">
								3.2 Account Security
							</h3>
							<p className="text-muted-foreground">
								You are responsible for safeguarding your account credentials
								and for any activities or actions under your account. You must
								notify us immediately of any unauthorized use of your account or
								any other breach of security.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">
								3.3 Account Termination
							</h3>
							<p className="text-muted-foreground">
								We reserve the right to suspend or terminate your account at any
								time for any reason, including if you violate these Terms. You
								may also delete your account at any time through your account
								settings.
							</p>
						</div>
					</div>
				</>
			),
		},
		{
			icon: <CreditCard className="h-6 w-6" />,
			title: "4. Subscriptions and Payments",
			content: (
				<>
					<div className="space-y-6">
						<div>
							<h3 className="font-semibold text-lg mb-2">
								4.1 Subscription Plans
							</h3>
							<p className="text-muted-foreground">
								Some content and features require a paid subscription. By
								purchasing a subscription, you agree to pay the fees associated
								with your chosen plan.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">4.2 Billing</h3>
							<p className="text-muted-foreground mb-3">
								Subscriptions are billed on a recurring basis (monthly or
								annually) depending on your chosen plan. By subscribing, you
								authorize us to charge your payment method for:
							</p>
							<ul className="list-disc pl-6 space-y-1 text-muted-foreground">
								<li>
									Subscription fees at the beginning of each billing period
								</li>
								<li>Any applicable taxes</li>
								<li>Additional fees for premium features you choose</li>
							</ul>
						</div>

						<div className="rounded-lg bg-accent/50 p-4 border border-primary/20">
							<h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
								<Shield className="h-5 w-5 text-primary" />
								4.3 Refund Policy - 14-Day Money-Back Guarantee
							</h3>
							<p className="text-muted-foreground">
								We offer a 14-day money-back guarantee for new subscriptions. If
								you are not satisfied with your purchase, contact us within 14
								days of your initial purchase for a full refund. This guarantee
								does not apply to subscription renewals.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">4.4 Cancellation</h3>
							<p className="text-muted-foreground">
								You may cancel your subscription at any time through your
								account settings. Cancellation will take effect at the end of
								your current billing period. No refunds will be provided for
								partial periods.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">4.5 Price Changes</h3>
							<p className="text-muted-foreground">
								We reserve the right to change our pricing at any time. Price
								changes will not affect existing subscriptions until renewal. We
								will notify you at least 30 days before any price change takes
								effect.
							</p>
						</div>
					</div>
				</>
			),
		},
		{
			icon: <FileText className="h-6 w-6" />,
			title: "5. Content and Intellectual Property",
			content: (
				<>
					<div className="space-y-6">
						<div>
							<h3 className="font-semibold text-lg mb-2">5.1 Our Content</h3>
							<p className="text-muted-foreground">
								All content provided through the Service, including but not
								limited to courses, videos, text, graphics, logos, images, and
								software, is the property of BitBuddies or its content suppliers
								and is protected by copyright, trademark, and other intellectual
								property laws.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">5.2 License to Use</h3>
							<p className="text-muted-foreground mb-3">
								Subject to your compliance with these Terms, we grant you a
								limited, non-exclusive, non-transferable license to:
							</p>
							<ul className="list-disc pl-6 space-y-1 text-muted-foreground">
								<li>Access and view content for personal, non-commercial use</li>
								<li>Download materials explicitly marked as downloadable</li>
								<li>
									Use code examples and snippets from courses in your own
									projects
								</li>
							</ul>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">5.3 Restrictions</h3>
							<p className="text-muted-foreground mb-3">You may NOT:</p>
							<ul className="space-y-2 text-muted-foreground">
								<li className="flex items-start gap-2">
									<span className="text-destructive mt-1">✕</span>
									<span>
										Reproduce, distribute, or publicly display our content
										without permission
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-destructive mt-1">✕</span>
									<span>Share your account credentials or access with others</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-destructive mt-1">✕</span>
									<span>Download or copy content for distribution or sale</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-destructive mt-1">✕</span>
									<span>
										Remove any copyright or proprietary notices from content
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-destructive mt-1">✕</span>
									<span>
										Use automated systems to scrape or download content
									</span>
								</li>
							</ul>
						</div>
					</div>
				</>
			),
		},
		{
			icon: <AlertTriangle className="h-6 w-6" />,
			title: "6. Acceptable Use Policy",
			content: (
				<>
					<p className="mb-3">You agree NOT to use the Service to:</p>
					<ul className="space-y-2 text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Violate any laws, regulations, or third-party rights</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Harass, abuse, or harm other users</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Post spam, advertisements, or unsolicited messages</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Distribute viruses, malware, or harmful code</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Impersonate others or misrepresent your affiliation</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Interfere with the proper functioning of the Service</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>
								Attempt to gain unauthorized access to accounts or systems
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-destructive mt-1">•</span>
							<span>Engage in any fraudulent or deceptive practices</span>
						</li>
					</ul>
				</>
			),
		},
		{
			icon: <Shield className="h-6 w-6" />,
			title: "7. Disclaimers and Limitations",
			content: (
				<>
					<div className="space-y-6">
						<div className="rounded-lg bg-muted/50 p-4 border border-border">
							<h3 className="font-semibold text-lg mb-2">7.1 "As Is" Service</h3>
							<p className="text-sm text-muted-foreground uppercase font-medium">
								THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
								WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
								NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
								FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">7.2 No Guarantee</h3>
							<p className="text-muted-foreground">
								We do not guarantee that the Service will be uninterrupted,
								secure, or error-free. We do not guarantee specific results from
								using our courses or content.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">
								7.3 Limitation of Liability
							</h3>
							<p className="text-muted-foreground">
								TO THE MAXIMUM EXTENT PERMITTED BY LAW, BITBUDDIES SHALL NOT BE
								LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
								PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
								INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
								GOODWILL, OR OTHER INTANGIBLE LOSSES.
							</p>
						</div>
					</div>
				</>
			),
		},
		{
			icon: <Gavel className="h-6 w-6" />,
			title: "8. Additional Terms",
			content: (
				<>
					<div className="space-y-6">
						<div>
							<h3 className="font-semibold text-lg mb-2">8.1 Indemnification</h3>
							<p className="text-muted-foreground">
								You agree to indemnify, defend, and hold harmless BitBuddies,
								its officers, directors, employees, and agents from any claims,
								liabilities, damages, losses, and expenses arising out of your
								use of the Service or violation of these Terms.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">
								8.2 Third-Party Services
							</h3>
							<p className="text-muted-foreground">
								The Service may contain links to third-party websites or
								services. We have no control over, and assume no responsibility
								for, the content, privacy policies, or practices of any
								third-party websites or services.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">8.3 Governing Law</h3>
							<p className="text-muted-foreground">
								These Terms shall be governed and construed in accordance with
								applicable laws. Any disputes arising from these Terms or your
								use of the Service shall be resolved through binding arbitration.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">
								8.4 Changes to Terms
							</h3>
							<p className="text-muted-foreground">
								We reserve the right to modify or replace these Terms at any
								time. If a revision is material, we will provide at least 30
								days' notice prior to any new terms taking effect. Your continued
								use of the Service after any changes indicates your acceptance of
								the new Terms.
							</p>
						</div>

						<div>
							<h3 className="font-semibold text-lg mb-2">8.5 Severability</h3>
							<p className="text-muted-foreground">
								If any provision of these Terms is held to be unenforceable or
								invalid, such provision will be changed and interpreted to
								accomplish the objectives of such provision to the greatest
								extent possible, and the remaining provisions will continue in
								full force and effect.
							</p>
						</div>
					</div>
				</>
			),
		},
	];

	return (
		<div className="w-full">
			<SEO
				title="Terms of Service"
				description="Read BitBuddies terms of service and user agreement. Learn about your rights and responsibilities when using our learning platform."
				keywords="terms of service, user agreement, terms and conditions, legal"
				canonicalUrl="/terms"
				noIndex={false}
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
							<Gavel className="h-12 w-12 text-primary" />
						</div>
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Terms of{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Service
							</span>
						</h1>
						<p className="text-xl text-muted-foreground md:text-2xl mb-4">
							Please read these terms carefully before using our service
						</p>
						<p className="text-sm text-muted-foreground">
							Last updated: {new Date().toLocaleDateString()}
						</p>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute left-0 top-0 -z-10 h-full w-full">
					<div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
				</div>
			</section>

			{/* Content Sections */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl space-y-16">
						{sections.map((section, index) => (
							<div key={index} className="scroll-mt-24">
								<div className="mb-6 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2 text-primary">
										{section.icon}
									</div>
									<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
										{section.title}
									</h2>
								</div>
								<div className="text-lg leading-relaxed space-y-4">
									{section.content}
								</div>
								{index < sections.length - 1 && (
									<div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Acknowledgment */}
			<section className="bg-muted/30 py-12 md:py-16">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl">
						<div className="rounded-2xl border border-border bg-card p-6 shadow-md md:p-8">
							<div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
								<FileText className="h-6 w-6 text-primary" />
							</div>
							<h3 className="mb-3 text-xl font-bold">Acknowledgment</h3>
							<p className="text-muted-foreground">
								By using BitBuddies, you acknowledge that you have read these
								Terms of Service and agree to be bound by them. If you do not
								agree to these Terms, please do not use our Service.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Contact CTA */}
			<section className="bg-gradient-to-b from-background to-primary/5 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl">
						<div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
							<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
								<Mail className="h-8 w-8 text-primary" />
							</div>
							<h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
								Questions About These Terms?
							</h2>
							<p className="mb-6 text-lg text-muted-foreground">
								If you have any questions about these Terms of Service, please
								contact us.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<a
									href={`mailto:${SITE_CONFIG.email}`}
									className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium shadow-md hover:bg-primary/90 transition-colors"
								>
									<Mail className="h-4 w-4 mr-2" />
									{SITE_CONFIG.email}
								</a>
								<a
									href="/contact"
									className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-medium shadow-sm hover:bg-accent transition-colors"
								>
									Contact Form
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
