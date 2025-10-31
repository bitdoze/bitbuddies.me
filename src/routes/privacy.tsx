import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "../components/common/SEO";
import { SITE_CONFIG } from "../lib/config";
import {
	Shield,
	Lock,
	Eye,
	Database,
	UserCheck,
	Globe,
	FileText,
	Mail,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	const sections = [
		{
			icon: <Shield className="h-6 w-6" />,
			title: "1. Introduction",
			content: (
				<>
					<p>
						Welcome to BitBuddies ("we," "our," or "us"). We are committed to
						protecting your privacy and handling your personal information
						responsibly. This Privacy Policy explains how we collect, use,
						disclose, and safeguard your information when you visit our website{" "}
						<a
							href={SITE_CONFIG.url}
							className="text-primary hover:underline font-medium transition-colors"
						>
							{SITE_CONFIG.url}
						</a>{" "}
						and use our services.
					</p>
					<p className="mt-4">
						By using BitBuddies, you agree to the collection and use of
						information in accordance with this policy. If you do not agree
						with our policies and practices, please do not use our services.
					</p>
				</>
			),
		},
		{
			icon: <Database className="h-6 w-6" />,
			title: "2. Information We Collect",
			content: (
				<>
					<h3 className="font-semibold text-lg mb-3">
						2.1 Personal Information
					</h3>
					<p className="mb-3">
						We collect personal information that you voluntarily provide when
						you register, enroll, or contact us:
					</p>
					<ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
						<li>Name, email address, username, and password</li>
						<li>Profile information and avatar</li>
						<li>Payment information (processed securely by third parties)</li>
						<li>Communication preferences</li>
					</ul>

					<h3 className="font-semibold text-lg mb-3 mt-6">
						2.2 Automatically Collected Information
					</h3>
					<p className="mb-3">
						When you visit our website, we automatically collect certain
						information:
					</p>
					<ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
						<li>Browser type, operating system, and device information</li>
						<li>IP address and general location data</li>
						<li>Pages visited and time spent on pages</li>
						<li>Referring website and search terms</li>
					</ul>

					<h3 className="font-semibold text-lg mb-3 mt-6">
						2.3 Cookies and Tracking
					</h3>
					<p>
						We use cookies for authentication via Clerk. For analytics, we use
						Plausible Analytics, which is privacy-friendly and doesn't use
						cookies or track users across websites.
					</p>
				</>
			),
		},
		{
			icon: <Eye className="h-6 w-6" />,
			title: "3. How We Use Your Information",
			content: (
				<>
					<p className="mb-3">
						We use the collected information for various purposes:
					</p>
					<ul className="space-y-2 text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Service Delivery:</strong>{" "}
								Provide, maintain, and improve our courses and platform
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">
									Account Management:
								</strong>{" "}
								Manage your account, enrollment, and access to content
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Communication:</strong> Send
								updates, newsletters, and important announcements
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Security:</strong> Protect
								against fraud, abuse, and unauthorized access
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Analytics:</strong>{" "}
								Understand user behavior and improve experience
							</span>
						</li>
					</ul>
				</>
			),
		},
		{
			icon: <Globe className="h-6 w-6" />,
			title: "4. Information Sharing",
			content: (
				<>
					<h3 className="font-semibold text-lg mb-3">4.1 Service Providers</h3>
					<p className="mb-3">
						We work with trusted third-party services to operate our platform:
					</p>
					<ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
						<li>
							<strong className="text-foreground">Clerk:</strong> Authentication
							and user management
						</li>
						<li>
							<strong className="text-foreground">Convex:</strong> Database and
							backend services
						</li>
						<li>
							<strong className="text-foreground">
								Plausible Analytics:
							</strong>{" "}
							Privacy-friendly analytics (GDPR compliant, no cookies)
						</li>
					</ul>

					<h3 className="font-semibold text-lg mb-3 mt-6">
						4.2 Legal Requirements
					</h3>
					<p>
						We may disclose your information if required by law or in response
						to valid requests by public authorities.
					</p>
				</>
			),
		},
		{
			icon: <Lock className="h-6 w-6" />,
			title: "5. Data Security",
			content: (
				<>
					<p className="mb-3">
						We implement appropriate security measures to protect your personal
						information:
					</p>
					<ul className="list-disc pl-6 space-y-1 text-muted-foreground">
						<li>Encryption of data in transit (HTTPS/TLS)</li>
						<li>Secure authentication via Clerk</li>
						<li>Regular security audits and updates</li>
						<li>Access controls and authentication requirements</li>
						<li>Secure data storage with Convex backend</li>
					</ul>
					<p className="mt-4 text-sm text-muted-foreground">
						While we strive to use commercially acceptable means to protect
						your data, no method of transmission over the Internet is 100%
						secure.
					</p>
				</>
			),
		},
		{
			icon: <UserCheck className="h-6 w-6" />,
			title: "6. Your Privacy Rights",
			content: (
				<>
					<p className="mb-3">
						You have the following rights regarding your personal data:
					</p>
					<ul className="space-y-2 text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Access:</strong> Request a
								copy of your personal information
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Correction:</strong> Update
								or correct inaccurate information
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Deletion:</strong> Request
								deletion of your personal data
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Opt-Out:</strong>{" "}
								Unsubscribe from marketing communications
							</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>
								<strong className="text-foreground">Data Portability:</strong>{" "}
								Receive your data in machine-readable format
							</span>
						</li>
					</ul>
					<p className="mt-4">
						To exercise these rights, contact us at{" "}
						<a
							href={`mailto:${SITE_CONFIG.email}`}
							className="text-primary hover:underline font-medium transition-colors"
						>
							{SITE_CONFIG.email}
						</a>
						.
					</p>
				</>
			),
		},
		{
			icon: <FileText className="h-6 w-6" />,
			title: "7. Additional Information",
			content: (
				<>
					<h3 className="font-semibold text-lg mb-3">Data Retention</h3>
					<p className="mb-4">
						We retain your personal information only as long as necessary to
						fulfill the purposes outlined in this policy. When you delete your
						account, we will delete or anonymize your data within 30 days.
					</p>

					<h3 className="font-semibold text-lg mb-3">Children's Privacy</h3>
					<p className="mb-4">
						Our services are not intended for children under 13. We do not
						knowingly collect information from children under 13.
					</p>

					<h3 className="font-semibold text-lg mb-3">
						International Data Transfers
					</h3>
					<p className="mb-4">
						Your information may be transferred to and processed in countries
						outside your jurisdiction. We ensure appropriate safeguards are in
						place.
					</p>

					<h3 className="font-semibold text-lg mb-3">
						Analytics and Cookies
					</h3>
					<p>
						We use Plausible Analytics, which is GDPR, CCPA, and PECR
						compliant. It doesn't use cookies, doesn't track users across
						websites, and doesn't collect personal information. No consent
						banner is required.
					</p>
				</>
			),
		},
	];

	return (
		<div className="w-full">
			<SEO
				title="Privacy Policy"
				description="Learn how BitBuddies collects, uses, and protects your personal information. We are committed to protecting your privacy and being transparent about our data practices."
				keywords="privacy policy, data protection, GDPR, user privacy, data security"
				canonicalUrl="/privacy"
				noIndex={false}
			/>

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
							<Shield className="h-12 w-12 text-primary" />
						</div>
						<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Privacy{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Policy
							</span>
						</h1>
						<p className="text-xl text-muted-foreground md:text-2xl mb-4">
							Your privacy matters to us
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

			{/* Contact CTA */}
			<section className="bg-gradient-to-b from-background to-primary/5 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-3xl">
						<div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg md:p-12">
							<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
								<Mail className="h-8 w-8 text-primary" />
							</div>
							<h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
								Questions About Privacy?
							</h2>
							<p className="mb-6 text-lg text-muted-foreground">
								If you have any questions about this Privacy Policy, please
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
