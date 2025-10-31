import { useMutation } from "convex/react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ImageLibrary } from "./ImageLibrary";

interface ImageUploadProps {
	value?: Id<"mediaAssets">;
	imageUrl?: string | null;
	onChange: (assetId: Id<"mediaAssets"> | undefined) => void;
	label?: string;
	disabled?: boolean;
}

export function ImageUpload({
	value,
	imageUrl,
	onChange,
	label = "Image",
	disabled = false,
}: ImageUploadProps) {
	const { user } = useAuth();
	const generateUploadUrl = useMutation(api.mediaAssets.generateUploadUrl);
	const createAsset = useMutation(api.mediaAssets.create);
	const removeAsset = useMutation(api.mediaAssets.remove);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			alert("Image size must be less than 10MB");
			return;
		}

		setSelectedFile(file);

		// Create preview URL
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		if (!user) {
			alert("You must be signed in to upload images");
			return;
		}

		setIsUploading(true);
		try {
			// Step 1: Get upload URL
			const uploadUrl = await generateUploadUrl();

			// Step 2: Upload file to Convex storage
			const result = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": selectedFile.type },
				body: selectedFile,
			});

			if (!result.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await result.json();

			// Step 3: Create media asset record
			const assetId = await createAsset({
				clerkId: user.id,
				storageId,
				mimeType: selectedFile.type,
				filesize: selectedFile.size,
				assetType: "image",
			});

			// Update parent component
			onChange(assetId);

			// Clear selection
			setSelectedFile(null);
			setPreviewUrl(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Upload failed:", error);
			alert("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemove = async () => {
		if (!value) return;

		if (!user) {
			alert("You must be signed in to remove images");
			return;
		}

		if (!confirm("Are you sure you want to remove this image?")) return;

		try {
			await removeAsset({ clerkId: user.id, assetId: value });
			onChange(undefined);
			setSelectedFile(null);
			setPreviewUrl(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Failed to remove image:", error);
			alert("Failed to remove image. Please try again.");
		}
	};

	const handleCancel = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleBrowse = () => {
		fileInputRef.current?.click();
	};

	const currentImageUrl = previewUrl || imageUrl;

	return (
		<div className="space-y-3">
			<Label>{label}</Label>

			{/* Preview with 16:9 aspect ratio */}
			{currentImageUrl ? (
				<div className="relative w-full max-w-2xl">
					<div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
						<img
							src={currentImageUrl}
							alt="Preview"
							className="absolute inset-0 w-full h-full object-cover rounded-lg border"
						/>
					</div>
					{value && !disabled && (
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute top-2 right-2"
							onClick={handleRemove}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			) : (
				/* Empty state with 16:9 placeholder */
				<div className="w-full max-w-2xl">
					<div
						className="relative w-full bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
						style={{ paddingBottom: "56.25%" }}
					>
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
							<ImageIcon className="h-12 w-12 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								No image selected (16:9 recommended)
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				disabled={disabled || isUploading}
				className="hidden"
			/>

			{/* Actions */}
			<div className="flex gap-2 flex-wrap">
				{!currentImageUrl && (
					<>
						<Button
							type="button"
							variant="outline"
							onClick={handleBrowse}
							disabled={disabled}
						>
							<Upload className="h-4 w-4 mr-2" />
							Upload New
						</Button>
						<ImageLibrary
							value={value}
							onChange={onChange}
							disabled={disabled}
						/>
					</>
				)}

				{selectedFile && previewUrl && (
					<>
						<Button
							type="button"
							onClick={handleUpload}
							disabled={isUploading || disabled}
						>
							<Upload className="h-4 w-4 mr-2" />
							{isUploading ? "Uploading..." : "Upload Image"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isUploading || disabled}
						>
							Cancel
						</Button>
					</>
				)}

				{currentImageUrl && value && (
					<>
						<Button
							type="button"
							variant="outline"
							onClick={handleBrowse}
							disabled={disabled}
						>
							<Upload className="h-4 w-4 mr-2" />
							Upload New
						</Button>
						<ImageLibrary
							value={value}
							onChange={onChange}
							disabled={disabled}
						/>
					</>
				)}
			</div>

			{/* Helper text */}
			{!currentImageUrl && (
				<p className="text-sm text-muted-foreground">
					Select an image file (max 10MB). Recommended: 1200×675 pixels (16:9
					ratio)
				</p>
			)}
			{selectedFile && !previewUrl && (
				<p className="text-sm text-muted-foreground">
					Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}{" "}
					KB)
				</p>
			)}
		</div>
	);
}
