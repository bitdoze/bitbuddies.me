import { createGatewayProvider } from "@ai-sdk/gateway";
import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { AI_CONFIG, AI_SECRET_CONFIG, getAiModelId } from "@/lib/config";
import { getToolBySlug } from "@/lib/ai-tools";

type ToolRequestPayload = {
	slug: string;
	inputs: Record<string, string>;
};

const rawResponse = (body: BodyInit, init?: ResponseInit) => {
	const headers = new Headers(init?.headers);
	headers.set("x-tss-raw-response", "true");
	return new Response(body, { ...init, headers });
};

const errorResponse = (status: number, message: string) =>
	rawResponse(JSON.stringify({ error: message }), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});

const compileTemplate = (template: string, values: Record<string, string>) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

export const runTool = createServerFn({ method: "POST" }).handler(async ({
	data,
}) => {
	const payload = data as ToolRequestPayload | undefined;
	if (!payload?.slug) {
		return errorResponse(400, "Missing tool identifier.");
	}

	const tool = getToolBySlug(payload.slug);
	if (!tool) {
		return errorResponse(404, "Tool not found.");
	}

	const apiKey = AI_SECRET_CONFIG.apiKey;
	if (!apiKey) {
		return errorResponse(500, "AI gateway API key is not configured.");
	}

	const modelId = getAiModelId();
	if (!modelId) {
		return errorResponse(500, "AI model configuration is missing.");
	}

	const provider = createGatewayProvider({
		apiKey,
		baseURL: AI_CONFIG.gatewayUrl || undefined,
	});

	try {
		const result = streamText({
			model: provider(modelId),
			system: tool.systemPrompt,
			prompt: compileTemplate(tool.userPromptTemplate, payload.inputs ?? {}),
			maxRetries: 1,
			onError: ({ error }) => {
				console.error("AI tool execution failed", error);
			},
		});

		const response = result.toTextStreamResponse({
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});

		response.headers.set("x-tss-raw-response", "true");
		return response;
	} catch (error) {
		console.error("AI tool execution error", error);
		return errorResponse(500, "Failed to generate content.");
	}
});
