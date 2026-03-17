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

const errorResponse = (status: number, message: string, userMessage?: string) =>
	rawResponse(
		JSON.stringify({
			error: message,
			userMessage: userMessage || message,
		}),
		{
			status,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		},
	);

const compileTemplate = (template: string, values: Record<string, string>) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

function handleAIError(error: any): Response {
	console.error("AI tool execution error:", error);

	const errorType = error?.type || error?.name || "unknown";
	const errorMessage = error?.message || String(error);
	const errorString = errorMessage?.toLowerCase() || "";

	if (
		errorType === "overloaded_error" ||
		errorString.includes("overload") ||
		errorString.includes("no available model") ||
		errorString.includes("no endpoints available")
	) {
		return errorResponse(
			503,
			"AI service is currently overloaded",
			"🔄 The AI service is experiencing high demand. Please wait a moment and try again.",
		);
	}

	if (
		errorType === "rate_limit_error" ||
		errorType === "RateLimitError" ||
		errorString.includes("rate limit") ||
		errorString.includes("too many requests")
	) {
		return errorResponse(
			429,
			"Rate limit exceeded",
			"⏱️ Too many requests. Please wait a moment before trying again.",
		);
	}

	if (
		errorType === "invalid_api_key" ||
		errorType === "AuthenticationError" ||
		errorString.includes("api key") ||
		errorString.includes("authentication") ||
		errorString.includes("unauthorized")
	) {
		return errorResponse(
			401,
			"Invalid API configuration",
			"🔑 API configuration issue. Please contact support.",
		);
	}

	if (
		errorString.includes("context length") ||
		errorString.includes("too long") ||
		errorString.includes("maximum context") ||
		errorString.includes("token limit")
	) {
		return errorResponse(
			400,
			"Input too long",
			"📝 Your input is too long. Please shorten it and try again.",
		);
	}

	if (
		errorType === "TimeoutError" ||
		errorString.includes("timeout") ||
		errorString.includes("timed out")
	) {
		return errorResponse(
			504,
			"Request timeout",
			"⏰ Request took too long. Please try with shorter input.",
		);
	}

	return errorResponse(
		500,
		errorMessage || "Failed to generate content",
		"❌ An error occurred. Please try again or contact support if this persists.",
	);
}

export const runTool = createServerFn({
	method: "POST",
}).handler(async (ctx) => {
	const payload = ctx.data as unknown as ToolRequestPayload;

	if (!payload?.slug) {
		return errorResponse(400, "Missing tool identifier.");
	}

	const tool = getToolBySlug(payload.slug);
	if (!tool) {
		return errorResponse(404, "Tool not found.");
	}

	const apiKey = AI_SECRET_CONFIG.apiKey;
	if (!apiKey) {
		return errorResponse(
			500,
			"AI gateway API key is not configured.",
			"⚙️ Configuration error. Please contact support.",
		);
	}

	const modelId = getAiModelId();
	if (!modelId) {
		return errorResponse(
			500,
			"AI model configuration is missing.",
			"⚙️ Model configuration error. Please contact support.",
		);
	}

	const provider = createGatewayProvider({
		apiKey,
		baseURL: AI_CONFIG.gatewayUrl || undefined,
	});

	let streamError: any = null;

	try {
		const result = streamText({
			model: provider(modelId),
			system: tool.systemPrompt,
			prompt: compileTemplate(tool.userPromptTemplate, payload.inputs ?? {}),
			maxRetries: 0,
			onError: ({ error }) => {
				console.error("AI streaming error captured:", error);
				streamError = error;
			},
		});

		const fullStream = result.fullStream;
		const reader = fullStream.getReader();
		const firstChunk = await reader.read();

		if (!firstChunk.done && firstChunk.value?.type === "error") {
			console.error("Immediate stream error detected:", firstChunk.value.error);
			return handleAIError(firstChunk.value.error);
		}

		if (streamError) {
			return handleAIError(streamError);
		}

		const stream = new ReadableStream({
			async start(controller) {
				try {
					if (!firstChunk.done && firstChunk.value?.type === "text-delta") {
						controller.enqueue(new TextEncoder().encode(firstChunk.value.text));
					}

					while (true) {
						const { done, value } = await reader.read();

						if (done) break;

						if (value?.type === "error") {
							console.error("Stream error during iteration:", value.error);
							controller.close();
							return;
						}

						if (value?.type === "text-delta") {
							controller.enqueue(new TextEncoder().encode(value.text));
						}
					}

					controller.close();
				} catch (error) {
					console.error("Stream processing error:", error);
					controller.error(error);
				}
			},
		});

		return rawResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		return handleAIError(error);
	}
});
