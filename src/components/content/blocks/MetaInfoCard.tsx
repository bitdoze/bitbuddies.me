import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetaItem {
	icon: React.ReactNode;
	label: string;
	value: string | React.ReactNode;
	className?: string;
}

interface MetaInfoCardProps {
	title: string;
	items: MetaItem[];
	className?: string;
}

/**
 * MetaInfoCard - Reusable meta information display
 *
 * Features:
 * - Clean card with title and items
 * - Icon + label + value layout
 * - Consistent spacing and typography
 * - Text truncation for long values
 * - Flexible value rendering (string or React node)
 *
 * Usage:
 * <MetaInfoCard
 *   title="Workshop Details"
 *   items={[
 *     { icon: <Users />, label: "Instructor", value: workshop.instructorName },
 *     { icon: <Clock />, label: "Duration", value: `${workshop.duration} min` },
 *     { icon: <Calendar />, label: "Date", value: formatDate(workshop.startDate) },
 *   ]}
 * />
 */
export function MetaInfoCard({ title, items, className }: MetaInfoCardProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="space-y-4">
					{items.map((item, index) => (
						<div
							key={`${item.label}-${index}`}
							className={cn("flex items-start gap-3", item.className)}
						>
							<div className="flex-shrink-0 text-muted-foreground mt-0.5">
								{item.icon}
							</div>
							<div className="flex-1 min-w-0">
								<dt className="text-sm font-medium text-muted-foreground mb-0.5">
									{item.label}
								</dt>
								<dd className="text-sm font-semibold truncate">
									{typeof item.value === "string" ? (
										<span title={item.value}>{item.value}</span>
									) : (
										item.value
									)}
								</dd>
							</div>
						</div>
					))}
				</dl>
			</CardContent>
		</Card>
	);
}
