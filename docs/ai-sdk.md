
# Overview


The AI SDK standardizes integrating artificial intelligence (AI) models across [supported providers](/docs/foundations/providers-and-models). This enables developers to focus on building great AI applications, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

<PreviewSwitchProviders />

To effectively leverage the AI SDK, it helps to familiarize yourself with the following concepts:

## Generative Artificial Intelligence

**Generative artificial intelligence** refers to models that predict and generate various types of outputs (such as text, images, or audio) based on what’s statistically likely, pulling from patterns they’ve learned from their training data. For example:

- Given a photo, a generative model can generate a caption.
- Given an audio file, a generative model can generate a transcription.
- Given a text description, a generative model can generate an image.

## Large Language Models

A **large language model (LLM)** is a subset of generative models focused primarily on **text**. An LLM takes a sequence of words as input and aims to predict the most likely sequence to follow. It assigns probabilities to potential next sequences and then selects one. The model continues to generate sequences until it meets a specified stopping criterion.

LLMs learn by training on massive collections of written text, which means they will be better suited to some use cases than others. For example, a model trained on GitHub data would understand the probabilities of sequences in source code particularly well.

However, it's crucial to understand LLMs' limitations. When asked about less known or absent information, like the birthday of a personal relative, LLMs might "hallucinate" or make up information. It's essential to consider how well-represented the information you need is in the model.

## Embedding Models

An **embedding model** is used to convert complex data (like words or images) into a dense vector (a list of numbers) representation, known as an embedding. Unlike generative models, embedding models do not generate new text or data. Instead, they provide representations of semantic and syntactic relationships between entities that can be used as input for other models or other natural language processing tasks.

In the next section, you will learn about the difference between models providers and models, and which ones are available in the AI SDK.


# AI Gateway

Copy page

Ask AI about this page

Last updated October 24, 2025

AI Gateway is available on [all plans](/docs/plans) and your use is subject to [AI Product Terms](/legal/ai-product-terms).

The [AI Gateway](https://vercel.com/ai-gateway) provides a unified API to access [hundreds of models](https://vercel.com/ai-gateway/models) through a single endpoint. It gives you the ability to set budgets, monitor usage, load-balance requests, and manage fallbacks.

The design allows it to work seamlessly with [AI SDK 5](/docs/ai-gateway/getting-started), [OpenAI SDK](/docs/ai-gateway/openai-compat), or your [preferred framework](/docs/ai-gateway/framework-integrations).

## [Key features](#key-features)

*   Unified API: helps you switch between providers and models with minimal code changes
*   High reliability: automatically retries requests to other providers if one fails
*   Embeddings support: generate vector embeddings for search, retrieval, and other tasks
*   Spend monitoring: monitor your spending across different providers
*   No markup on tokens: tokens cost the same as they would from the provider directly, with 0% markup, including with [Bring Your Own Key (BYOK)](/docs/ai-gateway/byok).

AI SDKPythonOpenAI HTTP

index.ts

```
import { generateText } from 'ai';

const { text } = generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'What is the capital of France?',
});
```

index.py

```
import os
from openai import OpenAI

client = OpenAI(
  api_key=os.getenv('AI_GATEWAY_API_KEY'),
  base_url='https://ai-gateway.vercel.sh/v1'
)

response = client.chat.completions.create(
  model='xai/grok-4',
  messages=[
    {
      'role': 'user',
      'content': 'Why is the sky blue?'
    }
  ]
)
```

index.sh

```
curl -X POST "https://ai-gateway.vercel.sh/v1/chat/completions" \
-H "Authorization: Bearer $AI_GATEWAY_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "openai/gpt-5",
  "messages": [
    {
      "role": "user",
      "content": "Why is the sky blue?"
    }
  ],
  "stream": false
}'
```

# Getting Started

Copy page

Ask AI about this page

Last updated October 24, 2025

This quickstart will walk you through making an AI model request with Vercel's [AI Gateway](https://vercel.com/ai-gateway). While this guide uses the [AI SDK](https://ai-sdk.dev), you can also integrate with the [OpenAI SDK](/docs/ai-gateway/openai-compat) or other [community frameworks](/docs/ai-gateway/framework-integrations).

1.  ### [Set up your application](#set-up-your-application)

    Start by creating a new directory using the `mkdir` command. Change into your new directory and then run the `pnpm init` command, which will create a `package.json`.

    terminal

    ```
    mkdir demo
    cd demo
    pnpm init
    ```

2.  ### [Install dependencies](#install-dependencies)

    Install the AI SDK package, `ai`, along with other necessary dependencies.

    pnpmyarnnpmbun

    ```
    pnpm i ai dotenv @types/node tsx typescript
    ```

    `dotenv` is used to access environment variables (your AI Gateway API key) within your application. The `tsx` package is a TypeScript runner that allows you to run your TypeScript code. The `typescript` package is the TypeScript compiler. The `@types/node` package is the TypeScript definitions for the Node.js API.

3.  ### [Set up your API key](#set-up-your-api-key)

    To create an API key, go to the [AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai&title=Go+to+AI+Gateway) tab of the dashboard:

    1.  Select API keys on the left side bar
    2.  Then select Create key and proceed with Create key from the dialog

    Once you have the API key, create a `.env.local` file and save your API key:

    .env.local

    ```
    AI_GATEWAY_API_KEY=your_ai_gateway_api_key
    ```

    Instead of using an API key, you can use [OIDC tokens](/docs/ai-gateway/authentication#oidc-token-authentication) to authenticate your requests.

    The AI Gateway provider will default to using the `AI_GATEWAY_API_KEY` environment variable.

4.  ### [Create and run your script](#create-and-run-your-script)

    Create an `index.ts` file in the root of your project and add the following code:

    index.ts

    ```
    import { streamText } from 'ai';
    import 'dotenv/config';

    async function main() {
      const result = streamText({
        model: 'openai/gpt-5',
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
      }

      console.log();
      console.log('Token usage:', await result.usage);
      console.log('Finish reason:', await result.finishReason);
    }

    main().catch(console.error);
    ```

    Now, run your script:

    terminal

    ```
    pnpm tsx index.ts
    ```

    You should see the AI model's response to your prompt.

5.  ### [Next steps](#next-steps)

    Continue with the [AI SDK documentation](https://ai-sdk.dev/getting-started) to learn advanced configuration, set up [provider and model routing with fallbacks](/docs/ai-gateway/provider-options), and explore more integration examples.


## [Using OpenAI SDK](#using-openai-sdk)

The AI Gateway provides OpenAI-compatible API endpoints that allow you to use existing OpenAI client libraries and tools with the AI Gateway.

The OpenAI-compatible API includes:

*   Model Management: List and retrieve the available models
*   Chat Completions: Create chat completions that support streaming, images, and file attachments
*   Tool Calls: Call functions with automatic or explicit tool selection
*   Existing Tool Integration: Use your existing OpenAI client libraries and tools without needing modifications

Learn more about using the OpenAI SDK with the AI Gateway in the [OpenAI-Compatible API page](/docs/ai-gateway/openai-compat).

## [Using other community frameworks](#using-other-community-frameworks)

The AI Gateway is designed to work with any framework that supports the OpenAI API or AI SDK 5.


# Generating and Streaming Text

Large language models (LLMs) can generate text in response to a prompt, which can contain instructions and information to process.
For example, you can ask a model to come up with a recipe, draft an email, or summarize a document.

The AI SDK Core provides two functions to generate text and stream it from LLMs:

- [`generateText`](#generatetext): Generates text for a given prompt and model.
- [`streamText`](#streamtext): Streams text from a given prompt and model.

Advanced LLM features such as [tool calling](./tools-and-tool-calling) and [structured data generation](./generating-structured-data) are built on top of text generation.

## `generateText`

You can generate text using the [`generateText`](/docs/reference/ai-sdk-core/generate-text) function. This function is ideal for non-interactive use cases where you need to write text (e.g. drafting email or summarizing web pages) and for agents that use tools.

```tsx
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'openai/gpt-4.1',
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

You can use more [advanced prompts](./prompts) to generate text with more complex instructions and content:

```tsx
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'openai/gpt-4.1',
  system:
    'You are a professional writer. ' +
    'You write simple, clear, and concise content.',
  prompt: `Summarize the following article in 3-5 sentences: ${article}`,
});
```

The result object of `generateText` contains several promises that resolve when all required data is available:

- `result.content`: The content that was generated in the last step.
- `result.text`: The generated text.
- `result.reasoning`: The full reasoning that the model has generated in the last step.
- `result.reasoningText`: The reasoning text of the model (only available for some models).
- `result.files`: The files that were generated in the last step.
- `result.sources`: Sources that have been used as references in the last step (only available for some models).
- `result.toolCalls`: The tool calls that were made in the last step.
- `result.toolResults`: The results of the tool calls from the last step.
- `result.finishReason`: The reason the model finished generating text.
- `result.usage`: The usage of the model during the final step of text generation.
- `result.totalUsage`: The total usage across all steps (for multi-step generations).
- `result.warnings`: Warnings from the model provider (e.g. unsupported settings).
- `result.request`: Additional request information.
- `result.response`: Additional response information, including response messages and body.
- `result.providerMetadata`: Additional provider-specific metadata.
- `result.steps`: Details for all steps, useful for getting information about intermediate steps.
- `result.experimental_output`: The generated structured output using the `experimental_output` specification.

### Accessing response headers & body

Sometimes you need access to the full response from the model provider,
e.g. to access some provider-specific headers or body content.

You can access the raw response headers and body using the `response` property:

```ts
import { generateText } from 'ai';

const result = await generateText({
  // ...
});

console.log(JSON.stringify(result.response.headers, null, 2));
console.log(JSON.stringify(result.response.body, null, 2));
```

## `streamText`

Depending on your model and prompt, it can take a large language model (LLM) up to a minute to finish generating its response. This delay can be unacceptable for interactive use cases such as chatbots or real-time applications, where users expect immediate responses.

AI SDK Core provides the [`streamText`](/docs/reference/ai-sdk-core/stream-text) function which simplifies streaming text from LLMs:

```ts
import { streamText } from 'ai';

const result = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Invent a new holiday and describe its traditions.',
});

// example: use textStream as an async iterable
for await (const textPart of result.textStream) {
  console.log(textPart);
}
```

<Note>
  `result.textStream` is both a `ReadableStream` and an `AsyncIterable`.
</Note>

<Note type="warning">
  `streamText` immediately starts streaming and suppresses errors to prevent
  server crashes. Use the `onError` callback to log errors.
</Note>

You can use `streamText` on its own or in combination with [AI SDK
UI](/examples/next-pages/basics/streaming-text-generation) and [AI SDK
RSC](/examples/next-app/basics/streaming-text-generation).
The result object contains several helper functions to make the integration into [AI SDK UI](/docs/ai-sdk-ui) easier:

- `result.toUIMessageStreamResponse()`: Creates a UI Message stream HTTP response (with tool calls etc.) that can be used in a Next.js App Router API route.
- `result.pipeUIMessageStreamToResponse()`: Writes UI Message stream delta output to a Node.js response-like object.
- `result.toTextStreamResponse()`: Creates a simple text stream HTTP response.
- `result.pipeTextStreamToResponse()`: Writes text delta output to a Node.js response-like object.

<Note>
  `streamText` is using backpressure and only generates tokens as they are
  requested. You need to consume the stream in order for it to finish.
</Note>

It also provides several promises that resolve when the stream is finished:

- `result.content`: The content that was generated in the last step.
- `result.text`: The generated text.
- `result.reasoning`: The full reasoning that the model has generated.
- `result.reasoningText`: The reasoning text of the model (only available for some models).
- `result.files`: Files that have been generated by the model in the last step.
- `result.sources`: Sources that have been used as references in the last step (only available for some models).
- `result.toolCalls`: The tool calls that have been executed in the last step.
- `result.toolResults`: The tool results that have been generated in the last step.
- `result.finishReason`: The reason the model finished generating text.
- `result.usage`: The usage of the model during the final step of text generation.
- `result.totalUsage`: The total usage across all steps (for multi-step generations).
- `result.warnings`: Warnings from the model provider (e.g. unsupported settings).
- `result.steps`: Details for all steps, useful for getting information about intermediate steps.
- `result.request`: Additional request information from the last step.
- `result.response`: Additional response information from the last step.
- `result.providerMetadata`: Additional provider-specific metadata from the last step.

### `onError` callback

`streamText` immediately starts streaming to enable sending data without waiting for the model.
Errors become part of the stream and are not thrown to prevent e.g. servers from crashing.

To log errors, you can provide an `onError` callback that is triggered when an error occurs.

```tsx highlight="6-8"
import { streamText } from 'ai';

const result = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Invent a new holiday and describe its traditions.',
  onError({ error }) {
    console.error(error); // your error logging logic here
  },
});
```

### `onChunk` callback

When using `streamText`, you can provide an `onChunk` callback that is triggered for each chunk of the stream.

It receives the following chunk types:

- `text`
- `reasoning`
- `source`
- `tool-call`
- `tool-input-start`
- `tool-input-delta`
- `tool-result`
- `raw`

```tsx highlight="6-11"
import { streamText } from 'ai';

const result = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Invent a new holiday and describe its traditions.',
  onChunk({ chunk }) {
    // implement your own logic here, e.g.:
    if (chunk.type === 'text') {
      console.log(chunk.text);
    }
  },
});
```

### `onFinish` callback

When using `streamText`, you can provide an `onFinish` callback that is triggered when the stream is finished (
[API Reference](/docs/reference/ai-sdk-core/stream-text#on-finish)
).
It contains the text, usage information, finish reason, messages, steps, total usage, and more:

```tsx highlight="6-8"
import { streamText } from 'ai';

const result = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Invent a new holiday and describe its traditions.',
  onFinish({ text, finishReason, usage, response, steps, totalUsage }) {
    // your own logic, e.g. for saving the chat history or recording usage

    const messages = response.messages; // messages that were generated
  },
});
```

### `fullStream` property

You can read a stream with all events using the `fullStream` property.
This can be useful if you want to implement your own UI or handle the stream in a different way.
Here is an example of how to use the `fullStream` property:

```tsx
import { streamText } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: 'openai/gpt-4.1',
  tools: {
    cityAttractions: {
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => ({
        attractions: ['attraction1', 'attraction2', 'attraction3'],
      }),
    },
  },
  prompt: 'What are some San Francisco tourist attractions?',
});

for await (const part of result.fullStream) {
  switch (part.type) {
    case 'start': {
      // handle start of stream
      break;
    }
    case 'start-step': {
      // handle start of step
      break;
    }
    case 'text-start': {
      // handle text start
      break;
    }
    case 'text-delta': {
      // handle text delta here
      break;
    }
    case 'text-end': {
      // handle text end
      break;
    }
    case 'reasoning-start': {
      // handle reasoning start
      break;
    }
    case 'reasoning-delta': {
      // handle reasoning delta here
      break;
    }
    case 'reasoning-end': {
      // handle reasoning end
      break;
    }
    case 'source': {
      // handle source here
      break;
    }
    case 'file': {
      // handle file here
      break;
    }
    case 'tool-call': {
      switch (part.toolName) {
        case 'cityAttractions': {
          // handle tool call here
          break;
        }
      }
      break;
    }
    case 'tool-input-start': {
      // handle tool input start
      break;
    }
    case 'tool-input-delta': {
      // handle tool input delta
      break;
    }
    case 'tool-input-end': {
      // handle tool input end
      break;
    }
    case 'tool-result': {
      switch (part.toolName) {
        case 'cityAttractions': {
          // handle tool result here
          break;
        }
      }
      break;
    }
    case 'tool-error': {
      // handle tool error
      break;
    }
    case 'finish-step': {
      // handle finish step
      break;
    }
    case 'finish': {
      // handle finish here
      break;
    }
    case 'error': {
      // handle error here
      break;
    }
    case 'raw': {
      // handle raw value
      break;
    }
  }
}
```

### Stream transformation

You can use the `experimental_transform` option to transform the stream.
This is useful for e.g. filtering, changing, or smoothing the text stream.

The transformations are applied before the callbacks are invoked and the promises are resolved.
If you e.g. have a transformation that changes all text to uppercase, the `onFinish` callback will receive the transformed text.

#### Smoothing streams

The AI SDK Core provides a [`smoothStream` function](/docs/reference/ai-sdk-core/smooth-stream) that
can be used to smooth out text streaming.

```tsx highlight="6"
import { smoothStream, streamText } from 'ai';

const result = streamText({
  model,
  prompt,
  experimental_transform: smoothStream(),
});
```

#### Custom transformations

You can also implement your own custom transformations.
The transformation function receives the tools that are available to the model,
and returns a function that is used to transform the stream.
Tools can either be generic or limited to the tools that you are using.

Here is an example of how to implement a custom transformation that converts
all text to uppercase:

```ts
const upperCaseTransform =
  <TOOLS extends ToolSet>() =>
  (options: { tools: TOOLS; stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        controller.enqueue(
          // for text chunks, convert the text to uppercase:
          chunk.type === 'text'
            ? { ...chunk, text: chunk.text.toUpperCase() }
            : chunk,
        );
      },
    });
```

You can also stop the stream using the `stopStream` function.
This is e.g. useful if you want to stop the stream when model guardrails are violated, e.g. by generating inappropriate content.

When you invoke `stopStream`, it is important to simulate the `step-finish` and `finish` events to guarantee that a well-formed stream is returned
and all callbacks are invoked.

```ts
const stopWordTransform =
  <TOOLS extends ToolSet>() =>
  ({ stopStream }: { stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      // note: this is a simplified transformation for testing;
      // in a real-world version more there would need to be
      // stream buffering and scanning to correctly emit prior text
      // and to detect all STOP occurrences.
      transform(chunk, controller) {
        if (chunk.type !== 'text') {
          controller.enqueue(chunk);
          return;
        }

        if (chunk.text.includes('STOP')) {
          // stop the stream
          stopStream();

          // simulate the finish-step event
          controller.enqueue({
            type: 'finish-step',
            finishReason: 'stop',
            logprobs: undefined,
            usage: {
              completionTokens: NaN,
              promptTokens: NaN,
              totalTokens: NaN,
            },
            request: {},
            response: {
              id: 'response-id',
              modelId: 'mock-model-id',
              timestamp: new Date(0),
            },
            warnings: [],
            isContinued: false,
          });

          // simulate the finish event
          controller.enqueue({
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: {
              completionTokens: NaN,
              promptTokens: NaN,
              totalTokens: NaN,
            },
            response: {
              id: 'response-id',
              modelId: 'mock-model-id',
              timestamp: new Date(0),
            },
          });

          return;
        }

        controller.enqueue(chunk);
      },
    });
```

#### Multiple transformations

You can also provide multiple transformations. They are applied in the order they are provided.

```tsx highlight="4"
const result = streamText({
  model,
  prompt,
  experimental_transform: [firstTransform, secondTransform],
});
```

## Sources

Some providers such as [Perplexity](/providers/ai-sdk-providers/perplexity#sources) and
[Google Generative AI](/providers/ai-sdk-providers/google-generative-ai#sources) include sources in the response.

Currently sources are limited to web pages that ground the response.
You can access them using the `sources` property of the result.

Each `url` source contains the following properties:

- `id`: The ID of the source.
- `url`: The URL of the source.
- `title`: The optional title of the source.
- `providerMetadata`: Provider metadata for the source.

When you use `generateText`, you can access the sources using the `sources` property:

```ts
const result = await generateText({
  model: google('gemini-2.5-flash'),
  tools: {
    google_search: google.tools.googleSearch({}),
  },
  prompt: 'List the top 5 San Francisco news from the past week.',
});

for (const source of result.sources) {
  if (source.sourceType === 'url') {
    console.log('ID:', source.id);
    console.log('Title:', source.title);
    console.log('URL:', source.url);
    console.log('Provider metadata:', source.providerMetadata);
    console.log();
  }
}
```

When you use `streamText`, you can access the sources using the `fullStream` property:

```tsx
const result = streamText({
  model: google('gemini-2.5-flash'),
  tools: {
    google_search: google.tools.googleSearch({}),
  },
  prompt: 'List the top 5 San Francisco news from the past week.',
});

for await (const part of result.fullStream) {
  if (part.type === 'source' && part.sourceType === 'url') {
    console.log('ID:', part.id);
    console.log('Title:', part.title);
    console.log('URL:', part.url);
    console.log('Provider metadata:', part.providerMetadata);
    console.log();
  }
}
```

The sources are also available in the `result.sources` promise.

## Examples

You can see `generateText` and `streamText` in action using various frameworks in the following examples:

### `generateText`

<ExampleLinks
  examples={[
    {
      title: 'Learn to generate text in Node.js',
      link: '/examples/node/generating-text/generate-text',
    },
    {
      title:
        'Learn to generate text in Next.js with Route Handlers (AI SDK UI)',
      link: '/examples/next-pages/basics/generating-text',
    },
    {
      title:
        'Learn to generate text in Next.js with Server Actions (AI SDK RSC)',
      link: '/examples/next-app/basics/generating-text',
    },
  ]}
/>

### `streamText`

<ExampleLinks
  examples={[
    {
      title: 'Learn to stream text in Node.js',
      link: '/examples/node/generating-text/stream-text',
    },
    {
      title: 'Learn to stream text in Next.js with Route Handlers (AI SDK UI)',
      link: '/examples/next-pages/basics/streaming-text-generation',
    },
    {
      title: 'Learn to stream text in Next.js with Server Actions (AI SDK RSC)',
      link: '/examples/next-app/basics/streaming-text-generation',
    },
  ]}
/>



# Generating Structured Data

While text generation can be useful, your use case will likely call for generating structured data.
For example, you might want to extract information from text, classify data, or generate synthetic data.

Many language models are capable of generating structured data, often defined as using "JSON modes" or "tools".
However, you need to manually provide schemas and then validate the generated data as LLMs can produce incorrect or incomplete structured data.

The AI SDK standardises structured object generation across model providers
with the [`generateObject`](/docs/reference/ai-sdk-core/generate-object)
and [`streamObject`](/docs/reference/ai-sdk-core/stream-object) functions.
You can use both functions with different output strategies, e.g. `array`, `object`, `enum`, or `no-schema`,
and with different generation modes, e.g. `auto`, `tool`, or `json`.
You can use [Zod schemas](/docs/reference/ai-sdk-core/zod-schema), [Valibot](/docs/reference/ai-sdk-core/valibot-schema), or [JSON schemas](/docs/reference/ai-sdk-core/json-schema) to specify the shape of the data that you want,
and the AI model will generate data that conforms to that structure.

<Note>
  You can pass Zod objects directly to the AI SDK functions or use the
  `zodSchema` helper function.
</Note>

## Generate Object

The `generateObject` generates structured data from a prompt.
The schema is also used to validate the generated data, ensuring type safety and correctness.

```ts
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

<Note>
  See `generateObject` in action with [these examples](#more-examples)
</Note>

### Accessing response headers & body

Sometimes you need access to the full response from the model provider,
e.g. to access some provider-specific headers or body content.

You can access the raw response headers and body using the `response` property:

```ts
import { generateObject } from 'ai';

const result = await generateObject({
  // ...
});

console.log(JSON.stringify(result.response.headers, null, 2));
console.log(JSON.stringify(result.response.body, null, 2));
```

## Stream Object

Given the added complexity of returning structured data, model response time can be unacceptable for your interactive use case.
With the [`streamObject`](/docs/reference/ai-sdk-core/stream-object) function, you can stream the model's response as it is generated.

```ts
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  // ...
});

// use partialObjectStream as an async iterable
for await (const partialObject of partialObjectStream) {
  console.log(partialObject);
}
```

You can use `streamObject` to stream generated UIs in combination with React Server Components (see [Generative UI](../ai-sdk-rsc))) or the [`useObject`](/docs/reference/ai-sdk-ui/use-object) hook.

<Note>See `streamObject` in action with [these examples](#more-examples)</Note>

### `onError` callback

`streamObject` immediately starts streaming.
Errors become part of the stream and are not thrown to prevent e.g. servers from crashing.

To log errors, you can provide an `onError` callback that is triggered when an error occurs.

```tsx highlight="5-7"
import { streamObject } from 'ai';

const result = streamObject({
  // ...
  onError({ error }) {
    console.error(error); // your error logging logic here
  },
});
```

## Output Strategy

You can use both functions with different output strategies, e.g. `array`, `object`, `enum`, or `no-schema`.

### Object

The default output strategy is `object`, which returns the generated data as an object.
You don't need to specify the output strategy if you want to use the default.

### Array

If you want to generate an array of objects, you can set the output strategy to `array`.
When you use the `array` output strategy, the schema specifies the shape of an array element.
With `streamObject`, you can also stream the generated array elements using `elementStream`.

```ts highlight="7,18"
import { streamObject } from 'ai';
import { z } from 'zod';

const { elementStream } = streamObject({
  model: 'openai/gpt-4.1',
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z
      .string()
      .describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});

for await (const hero of elementStream) {
  console.log(hero);
}
```

### Enum

If you want to generate a specific enum value, e.g. for classification tasks,
you can set the output strategy to `enum`
and provide a list of possible values in the `enum` parameter.

<Note>Enum output is only available with `generateObject`.</Note>

```ts highlight="5-6"
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  output: 'enum',
  enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
  prompt:
    'Classify the genre of this movie plot: ' +
    '"A group of astronauts travel through a wormhole in search of a ' +
    'new habitable planet for humanity."',
});
```

### No Schema

In some cases, you might not want to use a schema,
for example when the data is a dynamic user request.
You can use the `output` setting to set the output format to `no-schema` in those cases
and omit the schema parameter.

```ts highlight="6"
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});
```

## Schema Name and Description

You can optionally specify a name and description for the schema. These are used by some providers for additional LLM guidance, e.g. via tool or schema name.

```ts highlight="6-7"
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: 'openai/gpt-4.1',
  schemaName: 'Recipe',
  schemaDescription: 'A recipe for a dish.',
  schema: z.object({
    name: z.string(),
    ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
    steps: z.array(z.string()),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

## Accessing Reasoning

You can access the reasoning used by the language model to generate the object via the `reasoning` property on the result. This property contains a string with the model's thought process, if available.

```ts
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const result = await generateObject({
  model: 'openai/gpt-5',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
  providerOptions: {
    openai: {
      strictJsonSchema: true,
      reasoningSummary: 'detailed',
    } satisfies OpenAIResponsesProviderOptions,
  },
});

console.log(result.reasoning);
```

## Error Handling

When `generateObject` cannot generate a valid object, it throws a [`AI_NoObjectGeneratedError`](/docs/reference/ai-sdk-errors/ai-no-object-generated-error).

This error occurs when the AI provider fails to generate a parsable object that conforms to the schema.
It can arise due to the following reasons:

- The model failed to generate a response.
- The model generated a response that could not be parsed.
- The model generated a response that could not be validated against the schema.

The error preserves the following information to help you log the issue:

- `text`: The text that was generated by the model. This can be the raw text or the tool call text, depending on the object generation mode.
- `response`: Metadata about the language model response, including response id, timestamp, and model.
- `usage`: Request token usage.
- `cause`: The cause of the error (e.g. a JSON parsing error). You can use this for more detailed error handling.

```ts
import { generateObject, NoObjectGeneratedError } from 'ai';

try {
  await generateObject({ model, schema, prompt });
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    console.log('NoObjectGeneratedError');
    console.log('Cause:', error.cause);
    console.log('Text:', error.text);
    console.log('Response:', error.response);
    console.log('Usage:', error.usage);
  }
}
```

## Repairing Invalid or Malformed JSON

<Note type="warning">
  The `repairText` function is experimental and may change in the future.
</Note>

Sometimes the model will generate invalid or malformed JSON.
You can use the `repairText` function to attempt to repair the JSON.

It receives the error, either a `JSONParseError` or a `TypeValidationError`,
and the text that was generated by the model.
You can then attempt to repair the text and return the repaired text.

```ts highlight="7-10"
import { generateObject } from 'ai';

const { object } = await generateObject({
  model,
  schema,
  prompt,
  experimental_repairText: async ({ text, error }) => {
    // example: add a closing brace to the text
    return text + '}';
  },
});
```

## Structured outputs with `generateText` and `streamText`

You can generate structured data with `generateText` and `streamText` by using the `experimental_output` setting.

<Note>
  Some models, e.g. those by OpenAI, support structured outputs and tool calling
  at the same time. This is only possible with `generateText` and `streamText`.
</Note>

<Note type="warning">
  Structured output generation with `generateText` and `streamText` is
  experimental and may change in the future.
</Note>

### `generateText`

```ts highlight="2,4-18"
// experimental_output is a structured object that matches the schema:
const { experimental_output } = await generateText({
  // ...
  experimental_output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number().nullable().describe('Age of the person.'),
      contact: z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      occupation: z.object({
        type: z.literal('employed'),
        company: z.string(),
        position: z.string(),
      }),
    }),
  }),
  prompt: 'Generate an example person for testing.',
});
```

### `streamText`

```ts highlight="2,4-18"
// experimental_partialOutputStream contains generated partial objects:
const { experimental_partialOutputStream } = await streamText({
  // ...
  experimental_output: Output.object({
    schema: z.object({
      name: z.string(),
      age: z.number().nullable().describe('Age of the person.'),
      contact: z.object({
        type: z.literal('email'),
        value: z.string(),
      }),
      occupation: z.object({
        type: z.literal('employed'),
        company: z.string(),
        position: z.string(),
      }),
    }),
  }),
  prompt: 'Generate an example person for testing.',
});
```

## More Examples

You can see `generateObject` and `streamObject` in action using various frameworks in the following examples:

### `generateObject`

<ExampleLinks
  examples={[
    {
      title: 'Learn to generate objects in Node.js',
      link: '/examples/node/generating-structured-data/generate-object',
    },
    {
      title:
        'Learn to generate objects in Next.js with Route Handlers (AI SDK UI)',
      link: '/examples/next-pages/basics/generating-object',
    },
    {
      title:
        'Learn to generate objects in Next.js with Server Actions (AI SDK RSC)',
      link: '/examples/next-app/basics/generating-object',
    },
  ]}
/>

### `streamObject`

<ExampleLinks
  examples={[
    {
      title: 'Learn to stream objects in Node.js',
      link: '/examples/node/streaming-structured-data/stream-object',
    },
    {
      title:
        'Learn to stream objects in Next.js with Route Handlers (AI SDK UI)',
      link: '/examples/next-pages/basics/streaming-object-generation',
    },
    {
      title:
        'Learn to stream objects in Next.js with Server Actions (AI SDK RSC)',
      link: '/examples/next-app/basics/streaming-object-generation',
    },
  ]}
/>
