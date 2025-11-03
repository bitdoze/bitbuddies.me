import type React from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthRequiredCardProps {
	title?: string;
	description?: string;
	features?: string[];
	buttonText?: string;
	onSignIn?: () => void;
	className?: string;
}

/**
 * AuthRequiredCard - CTA for non-authenticated users
 *
 * Features:
 * - Eye-catching design with lock icon
 * - List of benefits/features
 * - Prominent CTA button
 * - Customizable copy
 * - Integrates with Clerk SignInButton
 *
 * Usage:
 * <AuthRequiredCard
 *   title="Sign In to Access This Workshop"
 *   features={[
 *     "Access to workshop content",
 *     "Download materials",
 *     "Track your progress",
 *   ]}
 * />
 */
export function AuthRequiredCard({
	title = "Sign In to Access",
	description = "Create a free account to access all content and features.",
	features = [
		"Access to all content",
		"Download resources and materials",
		"Track your progress",
		"Join the community",
	],
	buttonText = "Sign In to Continue",
	onSignIn,
	className,
}: AuthRequiredCardProps) {
	return (
		<Card
			className={cn(
				"border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg",
				className,
			)}
		>
			<CardContent className="p-8 md:p-12 text-center">
				{/* Icon */}
				<div className="mb-6 inline-flex rounded-full bg-primary/10 p-4">
					<Lock className="h-12 w-12 text-primary" />
				</div>

				{/* Title */}
				<h2 className="mb-4 text-2xl md:text-3xl font-bold">{title}</h2>

				{/* Description */}
				<p className="mb-8 text-lg text-muted-foreground">{description}</p>

				{/* Features List */}
				{features.length > 0 && (
					<div className="space-y-4 mb-8">
						{features.map((feature, index) => (
							<div
								key={`${feature}-${index}`}
								className="flex items-center gap-3 text-left"
							>
								<CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
								<span className="text-foreground">{feature}</span>
							</div>
						))}
					</div>
				)}

				{/* CTA Button */}
				<SignInButton mode="modal">
					<Button size="lg" className="min-w-[200px]">
						{buttonText}
					</Button>
				</SignInButton>
			</CardContent>
		</Card>
	);
}
