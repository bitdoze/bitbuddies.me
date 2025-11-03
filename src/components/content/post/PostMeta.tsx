import type React from "react";
import { Calendar, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetaItemType {
	icon: React.ReactNode;
	label: string;
	value: string;
}

interface PostMetaProps {
	author?: string;
	publishedDate?: number;
	updatedDate?: number;
	readTime?: number;
	variant?: "default" | "compact" | "header";
	className?: string;
}

/**
 * PostMeta - Display post metadata (author, date, read time)
 *
 * Features:
 * - Author name with icon
 * - Published/updated dates
 * - Read time estimate
 * - Multiple display variants
 * - Responsive layout
 *
 * Usage:
 * <PostMeta
 *   author="John Doe"
 *   publishedDate={post.publishedDate}
 *   readTime={5}
 *   variant="header"
 * />
 */
export function PostMeta({
	author,
	publishedDate,
	updatedDate,
	readTime,
	variant = "default",
	className,
}: PostMetaProps) {
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatReadTime = (minutes: number) => {
		return `${minutes} min read`;
	};

	const metaItems: MetaItemType[] = [];

	if (author) {
		metaItems.push({
			icon: <User className="h-4 w-4" />,
			label: "Author",
			value: author,
		});
	}

	if (publishedDate) {
		metaItems.push({
			icon: <Calendar className="h-4 w-4" />,
			label: "Published",
			value: formatDate(publishedDate),
		});
	}

	if (readTime) {
		metaItems.push({
			icon: <Clock className="h-4 w-4" />,
			label: "Read time",
			value: formatReadTime(readTime),
		});
	}

	if (metaItems.length === 0) {
		return null;
	}

	// Compact variant - inline with icons
	if (variant === "compact") {
		return (
			<div
				className={cn(
					"flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
					className,
				)}
			>
				{metaItems.map((item, index) => (
					<div key={index} className="flex items-center gap-1.5">
						{item.icon}
						<span>{item.value}</span>
					</div>
				))}
			</div>
		);
	}

	// Header variant - larger text, centered
	if (variant === "header") {
		return (
			<div
				className={cn(
					"flex flex-wrap items-center justify-center gap-4 md:gap-6 text-muted-foreground",
					className,
				)}
			>
				{author && (
					<div className="flex items-center gap-2">
						<User className="h-4 w-4" />
						<span className="text-sm md:text-base font-medium">{author}</span>
					</div>
				)}
				{publishedDate && (
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span className="text-sm md:text-base">
							{formatDate(publishedDate)}
						</span>
					</div>
				)}
				{readTime && (
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<span className="text-sm md:text-base">
							{formatReadTime(readTime)}
						</span>
					</div>
				)}
			</div>
		);
	}

	// Default variant - card-like display
	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-card p-4",
				className,
			)}
		>
			<dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{author && (
					<div className="flex items-start gap-2">
						<User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-xs text-muted-foreground mb-0.5">Author</dt>
							<dd className="text-sm font-semibold truncate">{author}</dd>
						</div>
					</div>
				)}
				{publishedDate && (
					<div className="flex items-start gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-xs text-muted-foreground mb-0.5">
								Published
							</dt>
							<dd className="text-sm font-semibold">
								{formatDate(publishedDate)}
							</dd>
						</div>
					</div>
				)}
				{readTime && (
					<div className="flex items-start gap-2">
						<Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
						<div className="flex-1 min-w-0">
							<dt className="text-xs text-muted-foreground mb-0.5">
								Read Time
							</dt>
							<dd className="text-sm font-semibold">
								{formatReadTime(readTime)}
							</dd>
						</div>
					</div>
				)}
			</dl>

			{/* Show updated date if different from published */}
			{updatedDate && updatedDate !== publishedDate && (
				<div className="mt-3 pt-3 border-t border-border">
					<p className="text-xs text-muted-foreground">
						Last updated: {formatDate(updatedDate)}
					</p>
				</div>
			)}
		</div>
	);
}
