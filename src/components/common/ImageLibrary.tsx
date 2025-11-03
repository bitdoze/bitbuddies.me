import { useQuery } from "convex/react";
import { Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ImageLibraryProps {
	value?: Id<"mediaAssets">;
	onChange: (assetId: Id<"mediaAssets"> | undefined) => void;
	disabled?: boolean;
	triggerButton?: React.ReactNode;
}

export function ImageLibrary({
	value,
	onChange,
	disabled = false,
	triggerButton,
}: ImageLibraryProps) {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState<
		Id<"mediaAssets"> | undefined
	>(value);
	const images = useQuery(
		api.mediaAssets.list,
		user?.id
			? {
					clerkId: user.id,
					assetType: "image",
					limit: 100,
			  }
			: "skip",
	);

	const handleSelect = (assetId: Id<"mediaAssets">) => {
		setSelectedAssetId(assetId);
	};

	const handleConfirm = () => {
		onChange(selectedAssetId);
		setOpen(false);
	};

	const handleCancel = () => {
		setSelectedAssetId(value);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{triggerButton || (
					<Button type="button" variant="outline" disabled={disabled}>
						<ImageIcon className="h-4 w-4 mr-2" />
						Choose from Library
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Image Library</DialogTitle>
					<DialogDescription>
						Select an image from your previously uploaded images
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="all" className="flex-1">
							All Images ({images?.length ?? 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="mt-4">
						<ScrollArea className="h-[400px] pr-4">
							{!images ? (
								<div className="flex items-center justify-center h-40">
									<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								</div>
							) : images.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-40 text-center">
									<ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
									<p className="text-sm text-muted-foreground">
										No images in library yet
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Upload an image to add it to your library
									</p>
								</div>
							) : (
								<div className="grid grid-cols-3 gap-4">
									{images.map((asset) => (
										<ImageCard
											key={asset._id}
											asset={asset}
											isSelected={selectedAssetId === asset._id}
											onSelect={() => handleSelect(asset._id)}
										/>
									))}
								</div>
							)}
						</ScrollArea>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedAssetId}>
						Select Image
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface ImageCardProps {
	asset: {
		_id: Id<"mediaAssets">;
		url?: string;
		mimeType: string;
		filesize: number;
		_creationTime: number;
	};
	isSelected: boolean;
	onSelect: () => void;
}

function ImageCard({ asset, isSelected, onSelect }: ImageCardProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div
			className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
				isSelected
					? "border-primary ring-2 ring-primary ring-offset-2"
					: "border-transparent hover:border-muted-foreground/25"
			}`}
			onClick={onSelect}
		>
			{/* 16:9 aspect ratio container */}
			<div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
				{asset.url ? (
					<img
						src={asset.url}
						alt="Library image"
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 bg-muted flex items-center justify-center">
						<ImageIcon className="h-8 w-8 text-muted-foreground" />
					</div>
				)}

				{/* Selection indicator */}
				{isSelected && (
					<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
						<div className="bg-primary rounded-full p-2">
							<Check className="h-6 w-6 text-primary-foreground" />
						</div>
					</div>
				)}

				{/* Hover overlay with info */}
				<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
					<p className="text-xs text-center mb-1">
						{formatFileSize(asset.filesize)}
					</p>
					<p className="text-xs text-center">
						{formatDate(asset._creationTime)}
					</p>
				</div>
			</div>
		</div>
	);
}
