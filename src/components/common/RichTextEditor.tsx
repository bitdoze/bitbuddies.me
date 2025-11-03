"use client";

import { useEffect, useState } from "react";
import type { Editor, JSONContent } from "@/components/kibo-ui/editor";
import {
	EditorBubbleMenu,
	EditorCharacterCount,
	EditorClearFormatting,
	EditorFloatingMenu,
	EditorFormatBold,
	EditorFormatCode,
	EditorFormatItalic,
	EditorFormatStrike,
	EditorFormatSubscript,
	EditorFormatSuperscript,
	EditorFormatUnderline,
	EditorLinkSelector,
	EditorNodeBulletList,
	EditorNodeCode,
	EditorNodeHeading1,
	EditorNodeHeading2,
	EditorNodeHeading3,
	EditorNodeOrderedList,
	EditorNodeQuote,
	EditorNodeTable,
	EditorNodeTaskList,
	EditorNodeText,
	EditorProvider,
	EditorSelector,
	EditorTableColumnAfter,
	EditorTableColumnBefore,
	EditorTableColumnDelete,
	EditorTableColumnMenu,
	EditorTableDelete,
	EditorTableFix,
	EditorTableGlobalMenu,
	EditorTableHeaderColumnToggle,
	EditorTableHeaderRowToggle,
	EditorTableMenu,
	EditorTableMergeCells,
	EditorTableRowAfter,
	EditorTableRowBefore,
	EditorTableRowDelete,
	EditorTableRowMenu,
	EditorTableSplitCell,
} from "@/components/kibo-ui/editor";

interface RichTextEditorProps {
	content: JSONContent;
	onChange: (content: JSONContent) => void;
	placeholder?: string;
	className?: string;
}

export function RichTextEditor({
	content,
	onChange,
	placeholder = "Start typing...",
	className = "",
}: RichTextEditorProps) {
	const [isClient, setIsClient] = useState(false);
	const [editorContent, setEditorContent] = useState<JSONContent>(content);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		setEditorContent(content);
	}, [content]);

	const handleUpdate = ({ editor }: { editor: Editor }) => {
		try {
			const json = editor.getJSON();
			onChange(json);
		} catch (error) {
			console.error("Editor update error:", error);
		}
	};

	if (!isClient) {
		return (
			<div className={`h-full w-full overflow-y-auto rounded-lg border bg-muted p-4 ${className}`}>
				<p className="text-sm text-muted-foreground">Loading editor...</p>
			</div>
		);
	}

	return (
		<EditorProvider
			className={`h-full w-full overflow-y-auto rounded-lg border bg-background p-4 ${className}`}
			content={editorContent}
			onUpdate={handleUpdate}
			placeholder={placeholder}
		>
			<EditorFloatingMenu>
				<EditorNodeHeading1 hideName />
				<EditorNodeBulletList hideName />
				<EditorNodeQuote hideName />
				<EditorNodeCode hideName />
				<EditorNodeTable hideName />
			</EditorFloatingMenu>
			<EditorBubbleMenu>
				<EditorSelector title="Text">
					<EditorNodeText />
					<EditorNodeHeading1 />
					<EditorNodeHeading2 />
					<EditorNodeHeading3 />
					<EditorNodeBulletList />
					<EditorNodeOrderedList />
					<EditorNodeTaskList />
					<EditorNodeQuote />
					<EditorNodeCode />
				</EditorSelector>
				<EditorSelector title="Format">
					<EditorFormatBold />
					<EditorFormatItalic />
					<EditorFormatUnderline />
					<EditorFormatStrike />
					<EditorFormatCode />
					<EditorFormatSuperscript />
					<EditorFormatSubscript />
				</EditorSelector>
				<EditorLinkSelector />
				<EditorClearFormatting />
			</EditorBubbleMenu>
			<EditorTableMenu>
				<EditorTableColumnMenu>
					<EditorTableColumnBefore />
					<EditorTableColumnAfter />
					<EditorTableColumnDelete />
				</EditorTableColumnMenu>
				<EditorTableRowMenu>
					<EditorTableRowBefore />
					<EditorTableRowAfter />
					<EditorTableRowDelete />
				</EditorTableRowMenu>
				<EditorTableGlobalMenu>
					<EditorTableHeaderColumnToggle />
					<EditorTableHeaderRowToggle />
					<EditorTableDelete />
					<EditorTableMergeCells />
					<EditorTableSplitCell />
					<EditorTableFix />
				</EditorTableGlobalMenu>
			</EditorTableMenu>
			<div className="mt-2 text-right text-sm text-muted-foreground">
				<EditorCharacterCount.Words>Words: </EditorCharacterCount.Words>
			</div>
		</EditorProvider>
	);
}

// Helper function to create empty content
export function createEmptyContent(): JSONContent {
	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
			},
		],
	};
}

// Helper function to convert JSONContent to HTML string
export function jsonToHtml(content: JSONContent): string {
	return JSON.stringify(content);
}

// Helper function to parse HTML string to JSONContent
export function htmlToJson(html: string): JSONContent {
	try {
		return JSON.parse(html);
	} catch {
		return createEmptyContent();
	}
}
