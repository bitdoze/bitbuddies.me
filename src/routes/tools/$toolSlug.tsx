import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
	ChevronLeft,
	Clipboard,
	ClipboardCheck,
	Loader2,
	Sparkles,
	Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { runTool } from "@/lib/server/run-tool.server";
import { getToolBySlug, type ToolConfig, type ToolInputField } from "@/lib/ai-tools";

type ParsedOutput =
	| { type: "empty" }
	| { type: "text"; content: string }
	| { type: "json-object"; data: Record<string, unknown> }
	| { type: "json-array"; items: unknown[] }
	| { type: "jsonl"; items: Array<Record<string, unknown>> };

const buildDefaultValue = (field: ToolInputField) => {
	if (field.type === "select") {
		const selected = field.options.find((option) => option.selected) ?? field.options[0];
		return selected?.value ?? "";
	}
	return "";
};

const deriveInitialInputs = (tool: ToolConfig) =>
	Object.fromEntries(
		Object.entries(tool.inputFields).map(([key, field]) => [key, buildDefaultValue(field)]),
	);

const tryParseJsonLines = (raw: string) => {
	const unwrapped = unwrapCodeFence(raw);
	const lines = unwrapped
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	if (lines.length === 0) {
		return null;
	}
	const items: Array<Record<string, unknown>> = [];
	for (const line of lines) {
		try {
			const parsed = JSON.parse(line);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				items.push(parsed as Record<string, unknown>);
			} else {
				return null;
			}
		} catch {
			return null;
		}
	}
	return items;
};

const tryParseJson = (raw: string) => {
	try {
		return JSON.parse(unwrapCodeFence(raw));
	} catch {
		return null;
	}
};

const deriveOutputView = (raw: string): ParsedOutput => {
	const trimmed = raw.trim();
	if (!trimmed) {
		return { type: "empty" };
	}

	const normalized = unwrapCodeFence(trimmed);

	const jsonLineItems = tryParseJsonLines(normalized);
	if (jsonLineItems) {
		return { type: "jsonl", items: jsonLineItems };
	}

	const parsed = tryParseJson(normalized);
	if (parsed && typeof parsed === "object") {
		if (Array.isArray(parsed)) {
			return { type: "json-array", items: parsed };
		}
		return { type: "json-object", data: parsed as Record<string, unknown> };
	}

	return { type: "text", content: normalized };
};

const formatValue = (value: unknown) => {
	if (value === null || value === undefined) {
		return "";
	}
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return value.toString();
	}
	if (Array.isArray(value)) {
		if (value.every((item) => typeof item === "string")) {
			return value.join(", ");
		}
		return JSON.stringify(value, null, 2);
	}
	return JSON.stringify(value, null, 2);
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const unwrapCodeFence = (value: string) => {
	const trimmed = value.trim();
	const match = trimmed.match(/^```[a-zA-Z0-9-]*\s*\n([\s\S]*?)\n?```$/);
	if (match) {
		return match[1].trim();
	}
	return trimmed;
};

const renderTitleIdeas = (
	items: Array<Record<string, unknown>>,
	onCopy: (text: string, id: string) => void,
	copiedCardId: string | null,
) => (
	<div className="grid gap-3 md:grid-cols-2">
		{items.map((item, index) => {
			const title = formatValue(item.title);
			const cardId = `title-${index}`;
			return (
				<Card key={cardId} className="border-border/60 bg-background/70 shadow-sm">
					<CardHeader className="flex items-start justify-between gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
							{index + 1}
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => onCopy(title, cardId)}
							className="h-8 w-8 rounded-full"
						>
							{copiedCardId === cardId ? (
								<ClipboardCheck className="h-4 w-4 text-primary" />
							) : (
								<Clipboard className="h-4 w-4" />
							)}
						</Button>
					</CardHeader>
					<CardContent>
						<p className="text-base font-medium text-foreground">{title}</p>
					</CardContent>
				</Card>
			);
		})}
	</div>
);

const renderPostIdeas = (
	items: Array<Record<string, unknown>>,
	onCopy: (text: string, id: string) => void,
	copiedCardId: string | null,
) => (
	<div className="space-y-3">
		{items.map((item, index) => {
			const post = formatValue(item.post);
			const cardId = `post-${index}`;
			return (
				<Card key={cardId} className="border-border/60 bg-background/70 shadow-sm">
					<CardHeader className="flex items-center justify-between gap-2">
						<CardTitle className="text-sm font-semibold text-muted-foreground">
							Post {index + 1}
						</CardTitle>
						<Button
							variant="outline"
							size="icon"
							onClick={() => onCopy(post, cardId)}
							className="h-8 w-8 rounded-full"
						>
							{copiedCardId === cardId ? (
								<ClipboardCheck className="h-4 w-4 text-primary" />
							) : (
								<Clipboard className="h-4 w-4" />
							)}
						</Button>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{post}</p>
					</CardContent>
				</Card>
			);
		})}
	</div>
);

const renderThumbnailIdeas = (
	items: Array<Record<string, unknown>>,
	onCopy: (text: string, id: string) => void,
	copiedCardId: string | null,
) => (
	<div className="grid gap-4 md:grid-cols-2">
		{items.map((item, index) => {
			const headline = formatValue(item.text);
			const background = formatValue(item.background);
			const mainImage = formatValue(item.mainImage);
			const elements = formatValue(item.additionalElements);
			const cardId = `thumbnail-${index}`;
			const copyPayload = `Headline: ${headline}\nBackground: ${background}\nMain Image: ${mainImage}\nAdditional Elements: ${elements}`;
			return (
				<Card key={cardId} className="border-border/60 bg-background/70 shadow-lg">
					<CardHeader className="flex items-start justify-between gap-3">
						<div className="space-y-2">
							<Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
								Idea {index + 1}
							</Badge>
							<CardTitle className="text-lg font-semibold">{headline}</CardTitle>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => onCopy(copyPayload, cardId)}
							className="h-8 w-8 rounded-full"
						>
							{copiedCardId === cardId ? (
								<ClipboardCheck className="h-4 w-4 text-primary" />
							) : (
								<Clipboard className="h-4 w-4" />
							)}
						</Button>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
								Background
							</p>
							<p>{background}</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
								Main Image
							</p>
							<p>{mainImage}</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
								Additional Elements
							</p>
							<p>{elements}</p>
						</div>
					</CardContent>
				</Card>
			);
		})}
	</div>
);

const renderStringList = (items: string[]) => (
	<div className="space-y-2">
		{items.map((item, index) => (
			<Card key={`${item}-${index}`} className="border-border/60 bg-background/70">
				<CardContent>
					<p className="text-sm text-muted-foreground">{item}</p>
				</CardContent>
			</Card>
		))}
	</div>
);

export const Route = createFileRoute("/tools/$toolSlug")({
	loader: ({ params }) => {
		const tool = getToolBySlug(params.toolSlug);
		if (!tool) {
			throw new Response("Not Found", { status: 404 });
		}
		return { tool };
	},
	component: ToolPage,
});

function ToolPage() {
	const { tool } = Route.useLoaderData();
	const showFormattedTab = !["youtube-script-generator", "ai-humanizer"].includes(tool.slug);
	const defaultTab = showFormattedTab ? "formatted" : "raw";
	const [inputs, setInputs] = useState<Record<string, string>>(() => deriveInitialInputs(tool));
	const [output, setOutput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState(defaultTab);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setInputs(deriveInitialInputs(tool));
		setOutput("");
		setError(null);
		setActiveTab(defaultTab);
		setCopied(false);
		setCopiedCardId(null);
	}, [tool, defaultTab]);

	const outputView = useMemo(() => deriveOutputView(output), [output]);

	const handleInputChange = (key: string, value: string) => {
		setInputs((prev) => ({ ...prev, [key]: value }));
		setError(null);
	};

	const stopStreaming = () => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (copyError) {
			console.error("Copy failed", copyError);
		}
	};

	const handleCardCopy = async (text: string, cardId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedCardId(cardId);
			setTimeout(() => {
				setCopiedCardId((prev) => (prev === cardId ? null : prev));
			}, 2000);
		} catch (cardCopyError) {
			console.error("Copy failed", cardCopyError);
		}
	};

	const handleSubmit = async () => {
		const missingField = Object.entries(tool.inputFields).find(
			([key, field]) => field.required && !inputs[key]?.trim(),
		);
		if (missingField) {
			setError(`${missingField[1].label} is required`);
			return;
		}

		stopStreaming();
		const controller = new AbortController();
		abortControllerRef.current = controller;
		setOutput("");
		setError(null);
		setIsStreaming(true);
		setActiveTab(defaultTab);
		setCopied(false);
		setCopiedCardId(null);

		try {
			const response = await runTool({
				data: { slug: tool.slug, inputs },
				signal: controller.signal,
				headers: {
					Accept: "text/plain",
				},
			});

			if (!response.ok || !response.body) {
				const message = await response.text();
				throw new Error(message || "Failed to generate content.");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { value, done } = await reader.read();
				if (value) {
					setOutput((prev) => prev + decoder.decode(value, { stream: !done }));
				}
				if (done) {
					break;
				}
			}
		} catch (submitError) {
			if (controller.signal.aborted) {
				setError("Generation cancelled.");
			} else {
				setError(
					submitError instanceof Error ? submitError.message : "Failed to generate content.",
				);
			}
		} finally {
			setIsStreaming(false);
			abortControllerRef.current = null;
		}
	};

	const renderField = (key: string, field: ToolInputField) => {
		const id = `${tool.slug}-${key}`;
		const value = inputs[key] ?? "";
		const containerClassName =
			field.type === "textarea"
				? "grid gap-2 md:col-span-2 xl:col-span-3"
				: "grid gap-2";

		if (field.type === "textarea") {
			return (
				<div key={key} className={containerClassName}>
					<Label htmlFor={id}>{field.label}</Label>
					<Textarea
						id={id}
						rows={field.rows ?? 4}
						placeholder={field.placeholder}
						value={value}
						onChange={(event) => handleInputChange(key, event.target.value)}
						className="min-h-[120px]"
					/>
				</div>
			);
		}

		if (field.type === "select") {
			return (
				<div key={key} className={containerClassName}>
					<Label htmlFor={id}>{field.label}</Label>
					<Select value={value} onValueChange={(selected) => handleInputChange(key, selected)}>
						<SelectTrigger id={id}>
							<SelectValue placeholder={field.label} />
						</SelectTrigger>
						<SelectContent>
							{field.options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);
		}

		return (
			<div key={key} className={containerClassName}>
				<Label htmlFor={id}>{field.label}</Label>
				<Input
					id={id}
					placeholder={field.placeholder}
					value={value}
					onChange={(event) => handleInputChange(key, event.target.value)}
				/>
			</div>
		);
	};

	const renderTextOutput = (content: string) => {
		const normalized = content.trim();
		if (!normalized) {
			return null;
		}
		const segments = normalized
			.replace(/\r\n/g, "\n")
			.split(/\n{2,}/)
			.map((segment) => segment.trim())
			.filter(Boolean);

		return (
			<ScrollArea className="h-72 rounded-lg border border-border/70 bg-background/60 p-4">
				<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
					{segments.map((segment, index) => (
						<div
							key={`segment-${index}`}
							className="rounded-lg bg-background/80 p-3 shadow-sm whitespace-pre-wrap"
						>
							{segment}
						</div>
					))}
					{segments.length === 0 ? (
						<p className="whitespace-pre-wrap">{normalized}</p>
					) : null}
				</div>
			</ScrollArea>
		);
	};

const renderJsonObject = (data: Record<string, unknown>) => (
	<div className="grid gap-4 md:grid-cols-2">
		{Object.entries(data).map(([key, value]) => (
			<Card key={key} className="border-border/60 bg-background/70">
				<CardHeader>
					<CardTitle className="text-base font-semibold capitalize">
						{key.replace(/_/g, " ")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isObjectRecord(value) ? (
						<div className="space-y-2 text-sm text-muted-foreground">
							{Object.entries(value).map(([nestedKey, nestedValue]) => (
								<div key={nestedKey}>
									<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
										{nestedKey.replace(/_/g, " ")}
									</p>
									<p>{formatValue(nestedValue)}</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">{formatValue(value)}</p>
					)}
				</CardContent>
			</Card>
		))}
	</div>
);

const renderGenericObjectList = (items: Array<Record<string, unknown>>) => (
	<div className="grid gap-4 md:grid-cols-2">
		{items.map((item, index) => (
			<Card key={`result-${index}`} className="border-border/60 bg-background/70">
				<CardHeader>
					<CardTitle className="text-base font-semibold">Result {index + 1}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{Object.entries(item).map(([key, value]) => (
						<div key={key} className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
								{key.replace(/_/g, " ")}
							</p>
							<p className="text-sm text-muted-foreground">{formatValue(value)}</p>
						</div>
					))}
				</CardContent>
			</Card>
		))}
	</div>
);

const renderJsonArray = (
	items: unknown[],
	onCopy: (text: string, id: string) => void,
	copiedCardId: string | null,
) => {
	if (!items.length) {
		return null;
	}

	if (items.every((item) => typeof item === "string")) {
		return renderStringList(items as string[]);
	}

	if (items.every(isObjectRecord)) {
		const objectItems = items as Array<Record<string, unknown>>;

		if (objectItems.every((item) => typeof item.title === "string")) {
			return renderTitleIdeas(objectItems, onCopy, copiedCardId);
		}

		if (objectItems.every((item) => typeof item.post === "string")) {
			return renderPostIdeas(objectItems, onCopy, copiedCardId);
		}

		if (
			objectItems.every(
				(item) =>
					typeof item.background === "string" &&
					typeof item.mainImage === "string" &&
					typeof item.text === "string" &&
					typeof item.additionalElements === "string",
			)
		) {
			return renderThumbnailIdeas(objectItems, onCopy, copiedCardId);
		}

		return renderGenericObjectList(objectItems);
	}

	return (
		<pre className="rounded-lg bg-background/60 p-4 text-sm">{JSON.stringify(items, null, 2)}</pre>
	);
};

	return (
		<div className="w-full">
			<SEO
				title={`${tool.name} | AI Tool`}
				description={tool.description}
				canonicalUrl={`/tools/${tool.slug}`}
			/>
			<section className="border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
				<div className="container mx-auto px-4">
					<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div className="space-y-4">
							<Button asChild variant="ghost" size="sm" className="w-fit gap-2 rounded-full border border-border/60 bg-background/80">
								<Link to="/tools" className="flex items-center">
									<ChevronLeft className="h-4 w-4" />
									Back to tools
								</Link>
							</Button>
							<div className="flex items-center gap-3">
								<span
									className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
									dangerouslySetInnerHTML={{ __html: tool.icon }}
								/>
								<div>
									<h1 className="text-3xl font-bold md:text-4xl">{tool.name}</h1>
									<p className="text-base text-muted-foreground md:text-lg">{tool.description}</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
								<Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
									{tool.category}
								</Badge>
								<div className="flex items-center gap-2">
									<Wand2 className="h-4 w-4 text-primary" />
									<span>Streaming gateway integration</span>
								</div>
							</div>
						</div>
						<div className="max-w-sm rounded-2xl border border-border/60 bg-background/70 p-6 shadow-sm">
							<h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Quick tips
							</h2>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{tool.tips?.slice(0, 3).map((tip) => (
									<li key={tip}>• {tip}</li>
								)) ?? (
									<li>Use clear context for best results.</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-8">
					<Card className="border-border/70 bg-card/90 shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">Configuration</CardTitle>
							<CardDescription>Adjust the prompt inputs, then stream the generated output instantly.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
								{Object.entries(tool.inputFields).map(([key, field]) => renderField(key, field))}
							</div>
							{error ? <p className="text-sm text-destructive">{error}</p> : null}
						</CardContent>
						<CardFooter className="flex flex-wrap items-center gap-3 border-t border-border/60 bg-background/60 px-6 py-4">
							<Button size="lg" onClick={handleSubmit} disabled={isStreaming} className="gap-2 shadow-md">
								{isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
								{isStreaming ? "Streaming..." : "Generate"}
							</Button>
							<Button variant="outline" onClick={stopStreaming} disabled={!isStreaming}>
								Stop
							</Button>
							<Button variant="ghost" onClick={() => setInputs(deriveInitialInputs(tool))} disabled={isStreaming}>
								Reset
							</Button>
						</CardFooter>
					</Card>

					<Card className="border-border/70 bg-card/90 shadow-lg">
						<CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div>
								<CardTitle className="text-2xl">Output</CardTitle>
								<CardDescription>
									Formatted stream results with quick copy access.
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopy}
								disabled={!output}
								className="gap-2"
							>
								{copied ? (
									<ClipboardCheck className="h-4 w-4 text-primary" />
								) : (
									<Clipboard className="h-4 w-4" />
								)}
								{copied ? "Copied" : "Copy"}
							</Button>
						</CardHeader>
						<CardContent>
						{outputView.type === "empty" ? (
							<div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/50 p-8 text-center text-sm text-muted-foreground">
								The generated content will appear here. Configure your inputs and click Generate to begin streaming.
							</div>
						) : showFormattedTab ? (
							<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
								<TabsList className="w-full justify-start">
									<TabsTrigger value="formatted">Formatted</TabsTrigger>
									<TabsTrigger value="raw">Raw</TabsTrigger>
								</TabsList>
								<TabsContent value="formatted" className="space-y-4">
									{outputView.type === "json-object" && renderJsonObject(outputView.data)}
									{outputView.type === "json-array" && renderJsonArray(outputView.items, handleCardCopy, copiedCardId)}
									{outputView.type === "jsonl" && renderJsonArray(outputView.items, handleCardCopy, copiedCardId)}
									{outputView.type === "text" && renderTextOutput(outputView.content)}
								</TabsContent>
								<TabsContent value="raw">
									<ScrollArea className="h-72 rounded-lg border border-border/70 bg-background/60 p-4">
										<pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output}</pre>
									</ScrollArea>
								</TabsContent>
							</Tabs>
						) : (
							<ScrollArea className="h-72 rounded-lg border border-border/70 bg-background/60 p-4">
								<pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output || outputView.content}</pre>
							</ScrollArea>
						)}
						</CardContent>
					</Card>
				</div>

				<aside className="space-y-6">
					<Card className="border-border/70 bg-card/80">
						<CardHeader>
							<CardTitle className="text-lg">Detailed tips</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm text-muted-foreground">
								{tool.tips?.map((tip) => (
									<li key={tip}>• {tip}</li>
								)) ?? <li>Use concise prompts for best results.</li>}
							</ul>
						</CardContent>
					</Card>
					<Card className="border-border/70 bg-card/80">
						<CardHeader>
							<CardTitle className="text-lg">Key benefits</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3 text-sm text-muted-foreground">
								{tool.benefits?.map((benefit) => (
									<li key={benefit}>• {benefit}</li>
								)) ?? <li>Save time by letting the model draft first versions.</li>}
							</ul>
						</CardContent>
					</Card>
				</aside>
			</section>
		</div>
	);
}
