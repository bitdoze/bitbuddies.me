import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RichTextEditor, createEmptyContent } from "../components/common/RichTextEditor";
import type { JSONContent } from "@/components/kibo-ui/editor";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const Route = createFileRoute("/debug/editor")({
	component: EditorDebugPage,
});

function EditorDebugPage() {
	const [content, setContent] = useState<JSONContent>(createEmptyContent());
	const [showJson, setShowJson] = useState(false);

	const handleClear = () => {
		setContent(createEmptyContent());
	};

	const handleLoadSample = () => {
		setContent({
			type: "doc",
			content: [
				{
					type: "heading",
					attrs: { level: 1 },
					content: [{ type: "text", text: "Sample Content" }],
				},
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "This is a " },
						{ type: "text", marks: [{ type: "bold" }], text: "bold" },
						{ type: "text", text: " paragraph with " },
						{ type: "text", marks: [{ type: "italic" }], text: "italic" },
						{ type: "text", text: " text." },
					],
				},
				{
					type: "bulletList",
					content: [
						{
							type: "listItem",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "First item" }],
								},
							],
						},
						{
							type: "listItem",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Second item" }],
								},
							],
						},
					],
				},
			],
		});
	};

	return (
		<div className="w-full">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Rich Text Editor Debug</h1>
					<p className="text-muted-foreground">
						Test the rich text editor functionality
					</p>
				</div>

				<div className="mb-4 flex gap-2">
					<Button onClick={handleClear} variant="outline">
						Clear Content
					</Button>
					<Button onClick={handleLoadSample} variant="outline">
						Load Sample
					</Button>
					<Button
						onClick={() => setShowJson(!showJson)}
						variant="outline"
					>
						{showJson ? "Hide JSON" : "Show JSON"}
					</Button>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Editor */}
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Editor</h2>
						<div className="min-h-[500px]">
							<RichTextEditor
								content={content}
								onChange={(newContent) => {
									console.log("Content changed:", newContent);
									setContent(newContent);
								}}
								placeholder="Start typing to test the editor..."
								className="min-h-[500px]"
							/>
						</div>
					</Card>

					{/* JSON Output */}
					{showJson && (
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">JSON Output</h2>
							<pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
								{JSON.stringify(content, null, 2)}
							</pre>
						</Card>
					)}
				</div>

				{/* Instructions */}
				<Card className="p-6 mt-6">
					<h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
					<div className="space-y-2 text-sm">
						<p><strong>Basic Formatting:</strong></p>
						<ul className="list-disc list-inside ml-4 space-y-1">
							<li>Select text and use bubble menu for bold, italic, etc.</li>
							<li>Use keyboard shortcuts (Ctrl/Cmd + B for bold, etc.)</li>
						</ul>

						<p className="mt-4"><strong>Structure:</strong></p>
						<ul className="list-disc list-inside ml-4 space-y-1">
							<li>Type "/" on empty line to see floating menu</li>
							<li>Insert headings, lists, quotes, tables</li>
							<li>Try task lists with checkboxes</li>
						</ul>

						<p className="mt-4"><strong>Advanced:</strong></p>
						<ul className="list-disc list-inside ml-4 space-y-1">
							<li>Create tables and manipulate rows/columns</li>
							<li>Add code blocks for syntax highlighting</li>
							<li>Use blockquotes for callouts</li>
						</ul>

						<p className="mt-4"><strong>Debugging:</strong></p>
						<ul className="list-disc list-inside ml-4 space-y-1">
							<li>Check browser console for errors</li>
							<li>Toggle JSON view to see content structure</li>
							<li>Test clear and reload functionality</li>
						</ul>
					</div>
				</Card>

				{/* System Info */}
				<Card className="p-6 mt-6">
					<h2 className="text-xl font-semibold mb-4">System Info</h2>
					<div className="grid gap-2 text-sm">
						<div>
							<strong>User Agent:</strong> {navigator.userAgent}
						</div>
						<div>
							<strong>Platform:</strong> {navigator.platform}
						</div>
						<div>
							<strong>Language:</strong> {navigator.language}
						</div>
						<div>
							<strong>Content Length:</strong>{" "}
							{JSON.stringify(content).length} characters
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
