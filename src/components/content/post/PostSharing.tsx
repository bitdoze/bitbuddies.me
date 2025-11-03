import type React from "react";
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PostSharingProps {
	title: string;
	url: string;
	description?: string;
	variant?: "default" | "compact" | "inline";
	showTitle?: boolean;
	className?: string;
}

/**
 * PostSharing - Social media sharing buttons
 *
 * Features:
 * - Share to Facebook, Twitter, LinkedIn
 * - Copy link to clipboard
 * - Multiple display variants
 * - Toast notification on copy
 * - Responsive layout
 *
 * Usage:
 * <PostSharing
 *   title={post.title}
 *   url={`https://bitbuddies.me/posts/${post.slug}`}
 *   description={post.shortDescription}
 *   variant="default"
 * />
 */
export function PostSharing({
	title,
	url,
	description,
	variant = "default",
	showTitle = true,
	className,
}: PostSharingProps) {
	const [copied, setCopied] = useState(false);

	const encodedUrl = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);
	const encodedDescription = description
		? encodeURIComponent(description)
		: "";

	const shareLinks = {
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy link:", err);
		}
	};

	const handleShare = (platform: keyof typeof shareLinks) => {
		window.open(shareLinks[platform], "_blank", "noopener,noreferrer,width=600,height=600");
	};

	// Inline variant - horizontal button group
	if (variant === "inline") {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				{showTitle && (
					<span className="text-sm font-medium text-muted-foreground mr-2">
						Share:
					</span>
				)}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleShare("twitter")}
					className="h-8 w-8 p-0"
				>
					<Twitter className="h-4 w-4" />
					<span className="sr-only">Share on Twitter</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleShare("facebook")}
					className="h-8 w-8 p-0"
				>
					<Facebook className="h-4 w-4" />
					<span className="sr-only">Share on Facebook</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleShare("linkedin")}
					className="h-8 w-8 p-0"
				>
					<Linkedin className="h-4 w-4" />
					<span className="sr-only">Share on LinkedIn</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCopyLink}
					className="h-8 w-8 p-0"
				>
					<LinkIcon className="h-4 w-4" />
					<span className="sr-only">Copy link</span>
				</Button>
			</div>
		);
	}

	// Compact variant - smaller buttons in grid
	if (variant === "compact") {
		return (
			<div className={cn("space-y-3", className)}>
				{showTitle && (
					<p className="text-sm font-medium text-muted-foreground">Share this post</p>
				)}
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleShare("twitter")}
						className="justify-start"
					>
						<Twitter className="h-4 w-4 mr-2" />
						Twitter
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleShare("facebook")}
						className="justify-start"
					>
						<Facebook className="h-4 w-4 mr-2" />
						Facebook
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleShare("linkedin")}
						className="justify-start"
					>
						<Linkedin className="h-4 w-4 mr-2" />
						LinkedIn
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleCopyLink}
						className="justify-start"
					>
						<LinkIcon className="h-4 w-4 mr-2" />
						{copied ? "Copied!" : "Copy Link"}
					</Button>
				</div>
			</div>
		);
	}

	// Default variant - card with full buttons
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<Share2 className="h-5 w-5" />
					Share This Post
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button
					variant="outline"
					className="w-full justify-start"
					onClick={() => handleShare("twitter")}
				>
					<Twitter className="h-4 w-4 mr-2" />
					Share on Twitter
				</Button>
				<Button
					variant="outline"
					className="w-full justify-start"
					onClick={() => handleShare("facebook")}
				>
					<Facebook className="h-4 w-4 mr-2" />
					Share on Facebook
				</Button>
				<Button
					variant="outline"
					className="w-full justify-start"
					onClick={() => handleShare("linkedin")}
				>
					<Linkedin className="h-4 w-4 mr-2" />
					Share on LinkedIn
				</Button>
				<div className="pt-3 border-t border-border">
					<Button
						variant="secondary"
						className="w-full justify-start"
						onClick={handleCopyLink}
					>
						<LinkIcon className="h-4 w-4 mr-2" />
						{copied ? "Link Copied!" : "Copy Link"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
