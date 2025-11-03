import type React from "react";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkshopEnrollmentProps {
	isEnrolled?: boolean;
	canEnroll?: boolean;
	enrollmentMessage?: string;
	onEnroll?: () => void;
	onUnenroll?: () => void;
	maxParticipants?: number;
	currentParticipants?: number;
	isLoading?: boolean;
	className?: string;
}

/**
 * WorkshopEnrollment - Enrollment status and action card
 *
 * Features:
 * - Shows enrollment status (enrolled/not enrolled)
 * - Enrollment/unenrollment buttons
 * - Participant count and availability
 * - Custom enrollment messages
 * - Loading states
 *
 * Usage:
 * <WorkshopEnrollment
 *   isEnrolled={userEnrollment?.status === "confirmed"}
 *   canEnroll={!isFull}
 *   onEnroll={handleEnroll}
 *   maxParticipants={50}
 *   currentParticipants={32}
 * />
 */
export function WorkshopEnrollment({
	isEnrolled = false,
	canEnroll = true,
	enrollmentMessage,
	onEnroll,
	onUnenroll,
	maxParticipants,
	currentParticipants = 0,
	isLoading = false,
	className,
}: WorkshopEnrollmentProps) {
	const isFull =
		maxParticipants !== undefined && currentParticipants >= maxParticipants;
	const spotsLeft = maxParticipants
		? maxParticipants - currentParticipants
		: null;

	return (
		<Card className={cn("border-2", className)}>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					{isEnrolled ? (
						<>
							<CheckCircle2 className="h-5 w-5 text-green-500" />
							<span>Enrolled</span>
						</>
					) : (
						<>
							<Users className="h-5 w-5 text-muted-foreground" />
							<span>Enrollment</span>
						</>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Enrollment Status */}
				{isEnrolled ? (
					<div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
						<p className="text-sm font-medium text-green-700 dark:text-green-400">
							You are enrolled in this workshop
						</p>
					</div>
				) : isFull ? (
					<div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
						<p className="text-sm font-medium text-destructive flex items-center gap-2">
							<XCircle className="h-4 w-4" />
							Workshop is full
						</p>
					</div>
				) : (
					<div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
						<p className="text-sm font-medium text-primary">
							{enrollmentMessage || "Enroll now to secure your spot"}
						</p>
					</div>
				)}

				{/* Participant Count */}
				{maxParticipants && (
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-muted-foreground">
								Participants
							</span>
							<span className="text-sm font-semibold">
								{currentParticipants} / {maxParticipants}
							</span>
						</div>
						<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									"h-full transition-all duration-300",
									isFull ? "bg-destructive" : "bg-primary",
								)}
								style={{
									width: `${Math.min(
										(currentParticipants / maxParticipants) * 100,
										100,
									)}%`,
								}}
							/>
						</div>
						{spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
							<p className="text-xs text-muted-foreground mt-2">
								Only {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left!
							</p>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="pt-2">
					{isEnrolled ? (
						onUnenroll && (
							<Button
								variant="outline"
								className="w-full"
								onClick={onUnenroll}
								disabled={isLoading}
							>
								{isLoading ? "Processing..." : "Unenroll from Workshop"}
							</Button>
						)
					) : (
						onEnroll && (
							<Button
								variant="default"
								className="w-full"
								onClick={onEnroll}
								disabled={!canEnroll || isFull || isLoading}
							>
								{isLoading
									? "Processing..."
									: isFull
										? "Workshop Full"
										: "Enroll in Workshop"}
							</Button>
						)
					)}
				</div>

				{/* Additional Info */}
				{isEnrolled && (
					<div className="pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground">
							You'll receive email notifications about this workshop.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
