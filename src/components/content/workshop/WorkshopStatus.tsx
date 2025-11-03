import type React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkshopStatusProps {
	startDate?: number;
	endDate?: number;
	isLive?: boolean;
	location?: string;
	maxParticipants?: number;
	currentParticipants?: number;
	className?: string;
}

/**
 * WorkshopStatus - Display workshop timing and status
 *
 * Features:
 * - Shows upcoming/live/past status with colored badges
 * - Displays start/end dates
 * - Shows location (online/in-person)
 * - Participant count if available
 * - Visual status indicators
 *
 * Usage:
 * <WorkshopStatus
 *   startDate={workshop.startDate}
 *   endDate={workshop.endDate}
 *   isLive={workshop.isLive}
 *   location="Online (Zoom)"
 *   maxParticipants={50}
 *   currentParticipants={32}
 * />
 */
export function WorkshopStatus({
	startDate,
	endDate,
	isLive = false,
	location,
	maxParticipants,
	currentParticipants,
	className,
}: WorkshopStatusProps) {
	// Determine workshop status
	const now = Date.now();
	const isUpcoming = startDate && startDate > now;
	const isOngoing =
		startDate && endDate && startDate <= now && endDate >= now;
	const isPast = endDate && endDate < now;

	// Format dates
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="text-lg flex items-center justify-between">
					<span>Workshop Status</span>
					{isOngoing && (
						<Badge variant="destructive" className="animate-pulse">
							Live Now
						</Badge>
					)}
					{isUpcoming && <Badge variant="default">Upcoming</Badge>}
					{isPast && <Badge variant="secondary">Completed</Badge>}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Start Date */}
				{startDate && (
					<div className="flex items-start gap-3">
						<Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-sm font-medium text-muted-foreground mb-0.5">
								{isOngoing ? "Started" : isUpcoming ? "Starts" : "Started"}
							</dt>
							<dd className="text-sm font-semibold">
								{formatDate(startDate)}
								<span className="text-muted-foreground ml-2">
									{formatTime(startDate)}
								</span>
							</dd>
						</div>
					</div>
				)}

				{/* End Date */}
				{endDate && (
					<div className="flex items-start gap-3">
						<Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-sm font-medium text-muted-foreground mb-0.5">
								{isPast ? "Ended" : "Ends"}
							</dt>
							<dd className="text-sm font-semibold">
								{formatDate(endDate)}
								<span className="text-muted-foreground ml-2">
									{formatTime(endDate)}
								</span>
							</dd>
						</div>
					</div>
				)}

				{/* Location */}
				{location && (
					<div className="flex items-start gap-3">
						<MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-sm font-medium text-muted-foreground mb-0.5">
								Location
							</dt>
							<dd className="text-sm font-semibold">{location}</dd>
						</div>
					</div>
				)}

				{/* Participant Count */}
				{maxParticipants && (
					<div className="pt-4 border-t border-border">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-muted-foreground">
								Participants
							</span>
							<span className="text-sm font-semibold">
								{currentParticipants || 0} / {maxParticipants}
							</span>
						</div>
						{/* Progress bar */}
						<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									"h-full transition-all duration-300",
									currentParticipants &&
										currentParticipants >= maxParticipants
										? "bg-destructive"
										: "bg-primary",
								)}
								style={{
									width: `${Math.min(
										((currentParticipants || 0) / maxParticipants) * 100,
										100,
									)}%`,
								}}
							/>
						</div>
						{currentParticipants &&
							currentParticipants >= maxParticipants && (
								<p className="text-xs text-destructive mt-2">
									Workshop is full
								</p>
							)}
					</div>
				)}

				{/* Status Message */}
				{isOngoing && isLive && (
					<div className="pt-4 border-t border-border">
						<div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
							<p className="text-sm font-medium text-primary flex items-center gap-2">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
									<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
								</span>
								This workshop is currently in progress
							</p>
						</div>
					</div>
				)}

				{isUpcoming && (
					<div className="pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground">
							Make sure to join on time to not miss the beginning of the
							workshop.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
