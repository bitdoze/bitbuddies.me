import React from "react";

interface TiptapNode {
	type: string;
	attrs?: Record<string, any>;
	content?: TiptapNode[];
	text?: string;
	marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface TiptapDocument {
	type: "doc";
	content: TiptapNode[];
}

interface TiptapRendererProps {
	content: string | TiptapDocument;
	className?: string;
}

/**
 * TiptapRenderer - Renders Tiptap/ProseMirror JSON content
 *
 * Supports:
 * - Headings (h1-h6)
 * - Paragraphs
 * - Bold, italic, code, strike, underline
 * - Bullet and ordered lists
 * - Code blocks with language support
 * - Blockquotes
 * - Horizontal rules
 * - Links
 * - Hard breaks
 */
export function TiptapRenderer({
	content,
	className = "",
}: TiptapRendererProps) {
	let doc: TiptapDocument;

	try {
		// Parse content if it's a string
		if (typeof content === "string") {
			doc = JSON.parse(content);
		} else {
			doc = content;
		}

		// Validate it's a Tiptap document
		if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
			return (
				<div className={`text-muted-foreground ${className}`}>
					<p>Content format not supported.</p>
				</div>
			);
		}
	} catch (error) {
		console.error("Failed to parse Tiptap content:", error);
		return (
			<div className={`text-muted-foreground ${className}`}>
				<p>Failed to load content.</p>
			</div>
		);
	}

	return (
		<div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
			{doc.content.map((node, index) => (
				<TiptapNode key={index} node={node} />
			))}
		</div>
	);
}

function TiptapNode({ node }: { node: TiptapNode }) {
	switch (node.type) {
		case "heading": {
			const level = node.attrs?.level || 2;
			const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
			return React.createElement(Tag, {}, renderContent(node.content));
		}

		case "paragraph":
			return <p>{renderContent(node.content)}</p>;

		case "bulletList":
			return <ul>{node.content?.map((item, i) => <TiptapNode key={i} node={item} />)}</ul>;

		case "orderedList":
			return (
				<ol start={node.attrs?.start || 1}>
					{node.content?.map((item, i) => (
						<TiptapNode key={i} node={item} />
					))}
				</ol>
			);

		case "listItem":
			return <li>{renderContent(node.content)}</li>;

		case "codeBlock": {
			const language = node.attrs?.language || "";
			return (
				<pre>
					<code className={language ? `language-${language}` : ""}>
						{getTextContent(node.content)}
					</code>
				</pre>
			);
		}

		case "blockquote":
			return <blockquote>{renderContent(node.content)}</blockquote>;

		case "hardBreak":
			return <br />;

		case "horizontalRule":
			return <hr />;

		case "image":
			return (
				<img
					src={node.attrs?.src}
					alt={node.attrs?.alt || ""}
					title={node.attrs?.title}
				/>
			);

		case "text":
			return renderText(node);

		default:
			// Unknown node type - render children if available
			if (node.content) {
				return <>{renderContent(node.content)}</>;
			}
			return null;
	}
}

function renderText(node: TiptapNode): React.ReactNode {
	if (!node.text) return null;

	let text: React.ReactNode = node.text;

	if (node.marks && node.marks.length > 0) {
		for (const mark of node.marks) {
			switch (mark.type) {
				case "bold":
					text = <strong>{text}</strong>;
					break;
				case "italic":
					text = <em>{text}</em>;
					break;
				case "code":
					text = <code>{text}</code>;
					break;
				case "strike":
					text = <s>{text}</s>;
					break;
				case "underline":
					text = <u>{text}</u>;
					break;
				case "link":
					text = (
						<a
							href={mark.attrs?.href}
							target={mark.attrs?.target}
							rel={mark.attrs?.target === "_blank" ? "noopener noreferrer" : undefined}
						>
							{text}
						</a>
					);
					break;
				case "highlight":
					text = <mark>{text}</mark>;
					break;
				default:
					// Unknown mark - keep text as is
					break;
			}
		}
	}

	return text;
}

function renderContent(content?: TiptapNode[]): React.ReactNode {
	if (!content || content.length === 0) return null;

	return content.map((node, index) => {
		if (node.type === "text") {
			return <span key={index}>{renderText(node)}</span>;
		}
		return <TiptapNode key={index} node={node} />;
	});
}

function getTextContent(content?: TiptapNode[]): string {
	if (!content) return "";

	return content
		.map((node) => {
			if (node.type === "text") {
				return node.text || "";
			}
			if (node.content) {
				return getTextContent(node.content);
			}
			return "";
		})
		.join("");
}
