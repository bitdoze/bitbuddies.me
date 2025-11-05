import type { Doc } from "../../../convex/_generated/dataModel";

type VideoPlayerProps = {
	videoUrl?: string;
	videoId?: string;
	videoProvider?: "youtube" | "bunny";
	title: string;
	className?: string;
};

/**
 * Utility function to convert Bunny video URL to proper embed format
 */
function getBunnyEmbedUrl(url: string): string {
	// Check if it's already an embed URL
	if (url.includes("/embed/")) {
		return url;
	}

	// Extract library ID and video ID from play URL
	// Format: https://iframe.mediadelivery.net/play/149616/8adcaaab-aebd-4e31-b39d-10703d98c61f
	const playMatch = url.match(/\/play\/(\d+)\/([a-f0-9-]+)/);
	if (playMatch) {
		const [, libraryId, videoId] = playMatch;
		return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
	}

	// If it's already in some embed format or unknown format, return as-is
	return url;
}

/**
 * Utility function to get YouTube embed URL
 */
function getYouTubeEmbedUrl(url: string): string {
	// If it's already an embed URL, return it
	if (url.includes("/embed/")) {
		return url;
	}

	// Extract video ID and convert to embed format
	const youtubeMatch = url.match(
		/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
	);
	if (youtubeMatch) {
		return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
	}

	// Try to match just the video ID
	const videoIdMatch = url.match(/^([a-zA-Z0-9_-]{11})$/);
	if (videoIdMatch) {
		return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
	}

	return url;
}

/**
 * Get proper video embed URL based on provider
 */
function getVideoEmbedUrl(props: VideoPlayerProps): string | null {
	// Priority 1: Use videoUrl if provided
	if (props.videoUrl) {
		if (props.videoProvider === "bunny") {
			return getBunnyEmbedUrl(props.videoUrl);
		}
		if (props.videoProvider === "youtube") {
			return getYouTubeEmbedUrl(props.videoUrl);
		}
		// If no provider specified, try to detect
		if (props.videoUrl.includes("mediadelivery.net")) {
			return getBunnyEmbedUrl(props.videoUrl);
		}
		if (
			props.videoUrl.includes("youtube.com") ||
			props.videoUrl.includes("youtu.be")
		) {
			return getYouTubeEmbedUrl(props.videoUrl);
		}
		// Return as-is if we can't detect
		return props.videoUrl;
	}

	// Priority 2: Use videoId if provided
	if (props.videoId) {
		if (props.videoProvider === "bunny") {
			return props.videoId; // Bunny IDs are full URLs
		}
		// Default to YouTube for plain IDs
		return `https://www.youtube.com/embed/${props.videoId}`;
	}

	return null;
}

/**
 * Reusable Video Player Component
 *
 * Supports YouTube and Bunny Stream with automatic URL conversion
 *
 * @example
 * <VideoPlayer
 *   videoUrl="https://iframe.mediadelivery.net/play/149616/abc..."
 *   videoProvider="bunny"
 *   title="My Lesson"
 * />
 */
export function VideoPlayer({
	videoUrl,
	videoId,
	videoProvider,
	title,
	className = "",
}: VideoPlayerProps) {
	const embedUrl = getVideoEmbedUrl({
		videoUrl,
		videoId,
		videoProvider,
		title,
	});

	if (!embedUrl) {
		return null;
	}

	return (
		<div
			className={`relative w-full rounded-lg overflow-hidden shadow-lg ${className}`}
		>
			<div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
				<iframe
					src={embedUrl}
					title={title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					loading="lazy"
					className="absolute inset-0 w-full h-full border-0"
				/>
			</div>
		</div>
	);
}

/**
 * Type-safe wrapper for lesson videos
 */
type LessonDoc = Doc<"lessons">;
type WorkshopDoc = Doc<"workshops">;

export function LessonVideoPlayer({ lesson }: { lesson: LessonDoc }) {
	if (!lesson.videoUrl && !lesson.videoId) {
		return null;
	}

	return (
		<VideoPlayer
			videoUrl={lesson.videoUrl}
			videoId={lesson.videoId}
			videoProvider={lesson.videoProvider}
			title={lesson.title}
		/>
	);
}

export function WorkshopVideoPlayer({ workshop, className }: { workshop: WorkshopDoc; className?: string }) {
	if (!workshop.videoUrl && !workshop.videoId) {
		return null;
	}

	return (
		<VideoPlayer
			videoUrl={workshop.videoUrl}
			videoId={workshop.videoId}
			videoProvider={workshop.videoProvider}
			title={workshop.title}
			className={className}
		/>
	);
}
