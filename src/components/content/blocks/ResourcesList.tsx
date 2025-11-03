import type React from "react";
import { Download, FileText, File, Image, Video, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/SectionHeader";
import { cn } from "@/lib/utils";

export interface Resource {
	id: string;
	name: string;
	type: string;
	size: string;
	url: string;
}

interface ResourcesListProps {
	resources: Resource[];
	title?: string;
	description?: string;
	eyebrow?: string;
	className?: string;
}

/**
 * ResourcesList - Display downloadable resources
 *
 * Features:
 * - SectionHeader integration
 * - List with download buttons
 * - File type and size display
 * - Hover states and transitions
 * - Icon based on file type
 *
 * Usage:
 * <ResourcesList
 *   resources={attachments}
 *   title="Workshop Materials"
 *   eyebrow="Downloads"
 * />
 */
export function ResourcesList({
	resources,
	title = "Resources",
	description,
	eyebrow,
	className,
}: ResourcesListProps) {
	if (!resources || resources.length === 0) {
		return null;
	}

	return (
		<section className={className}>
			<SectionHeader
				title={title}
				description={description}
				eyebrow={eyebrow}
			/>

			<div className="space-y-3 mt-8">
				{resources.map((resource) => (
					<Card
						key={resource.id}
						className="transition-all hover:shadow-md hover:border-primary/30"
					>
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								{/* File Icon */}
								<div className="flex-shrink-0 rounded-lg bg-primary/10 p-3 text-primary">
									{getFileIcon(resource.type)}
								</div>

								{/* File Info */}
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm md:text-base truncate">
										{resource.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{resource.type.toUpperCase()} • {resource.size}
									</p>
								</div>

								{/* Download Button */}
								<Button
									size="sm"
									variant="outline"
									asChild
									className="flex-shrink-0"
								>
									<a
										href={resource.url}
										download
										target="_blank"
										rel="noopener noreferrer"
									>
										<Download className="h-4 w-4 mr-2" />
										Download
									</a>
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
}

/**
 * Get appropriate icon based on file type
 */
function getFileIcon(type: string): React.ReactNode {
	const iconClass = "h-5 w-5";
	const lowerType = type.toLowerCase();

	if (lowerType.includes("pdf") || lowerType.includes("doc")) {
		return <FileText className={iconClass} />;
	}
	if (
		lowerType.includes("image") ||
		lowerType.includes("png") ||
		lowerType.includes("jpg") ||
		lowerType.includes("jpeg")
	) {
		return <Image className={iconClass} />;
	}
	if (lowerType.includes("video") || lowerType.includes("mp4")) {
		return <Video className={iconClass} />;
	}
	if (lowerType.includes("audio") || lowerType.includes("mp3")) {
		return <Music className={iconClass} />;
	}

	return <File className={iconClass} />;
}
