export type ToolInputFieldOption = {
	value: string;
	label: string;
	selected?: boolean;
};

export type ToolInputField =
	| {
		readonly type: "textarea";
		readonly label: string;
		readonly placeholder?: string;
		readonly required?: boolean;
		readonly rows?: number;
	}
	| {
		readonly type: "select";
		readonly label: string;
		readonly required?: boolean;
		readonly options: ReadonlyArray<ToolInputFieldOption>;
	}
	| {
		readonly type: "input";
		readonly label: string;
		readonly placeholder?: string;
		readonly required?: boolean;
	};

export interface ToolConfig {
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly slug: string;
	readonly category: string;
	readonly systemPrompt: string;
	readonly userPromptTemplate: string;
	readonly inputFields: Record<string, ToolInputField>;
	readonly tips?: ReadonlyArray<string>;
	readonly benefits?: ReadonlyArray<string>;
}

const TONE_OPTIONS: ReadonlyArray<ToolInputFieldOption> = [
	{
		value: "No specific tone",
		label: "No specific tone",
		selected: true,
	},
	{ value: "Funny", label: "Funny" },
	{ value: "Serious", label: "Serious" },
	{ value: "Controversial", label: "Controversial" },
	{ value: "Inspirational", label: "Inspirational" },
	{ value: "Educational", label: "Educational" },
	{ value: "Professional", label: "Professional" },
];

export const TOOL_REGISTRY: ReadonlyArray<ToolConfig> = [
	{
		name: "AI Title Generator",
		description:
			"Create engaging titles for YouTube videos, articles, or TikTok posts in various styles.",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
	    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
	  </svg>`,
		slug: "title-generator",
		category: "Content Creation",
		systemPrompt: `You are a versatile content title generator specializing in catchy, platform-specific titles. Follow these key principles and guidelines:

Key Principles:
1. High energy and motivation
2. Direct and no-nonsense approach
3. Practical advice and actionable insights
4. Empowerment and positivity
5. Repetition for emphasis

Detailed Guidelines:
1. Use Powerful, Motivational Language
   - Start sentences with strong verbs
   - Employ imperative statements
   - Use intensifiers like "absolutely," "definitely," "100%"
2. Keep It Real and Direct
   - Cut through the fluff - get straight to the point
   - Use colloquial language and slang
   - Don't shy away from occasional profanity (if appropriate for the platform)
3. Focus on Practicality
   - Provide specific, actionable steps
   - Use real-world examples and case studies
   - Break down complex ideas into simple, doable tasks
4. Create a Sense of Urgency
   - Use phrases like "right now," "immediately," "don't wait"
   - Emphasize the cost of inaction
   - Highlight time-sensitive opportunities
5. Incorporate Personal Anecdotes (when relevant)
   - Share stories from entrepreneurial journeys
   - Use failures as teaching moments
   - Connect personal experiences to broader principles
6. Embrace Repetition
   - Repeat key phrases for emphasis
   - Use variations of the same idea to drive the point home
   - Create memorable catchphrases
7. Engage Directly with the Audience
   - Use "you" and "your" frequently
   - Ask rhetorical questions
   - Challenge the reader to take action
8. Use Contrast for Impact
   - Juxtapose old thinking with new perspectives
   - Highlight the difference between action and inaction
   - Compare short-term discomfort with long-term gains
9. Leverage Visual Structure (when applicable)
   - Use ALL CAPS for emphasis
   - Break long ideas into short, punchy phrases

IMPORTANT: Return ONLY valid JSON objects, one per line (JSONL format). Each line must be a complete JSON object with a "title" field.

Format: {"title": "title here"}

Example output:
{"title": "10 Ways to MASTER Your Craft Right Now"}
{"title": "Why You're FAILING at This (And How to Fix It)"}
{"title": "The SECRET Nobody Tells You About Success"}

Do NOT include:
- Array brackets [ ]
- Commas between objects
- Any text before or after the JSON objects
- Numbering or labels
- The word "sure" or any preamble

Return exactly 10 titles, each on its own line as a valid JSON object.`,
		userPromptTemplate: `Create 10 engaging {platform} titles for content about: {topic}. Tone: {tone}. Make them catchy and platform-appropriate. If tone is "No specific tone", default to your high-energy style. Don't include 'sure' or numbering. Apply the principles and guidelines provided in the system prompt.

Return your results as JSON objects, one per line, each with a "title" field. No array brackets, no numbering, no additional text.`,
		inputFields: {
			topic: {
				type: "textarea",
				label: "What's your content about?",
				placeholder:
					"Describe your content topic in detail for better results...",
				required: true,
				rows: 3,
			},
			platform: {
				type: "select",
				label: "Platform",
				options: [
					{ value: "YouTube", label: "YouTube", selected: true },
					{ value: "Article", label: "Article" },
					{ value: "TikTok", label: "TikTok" },
				],
			},
			tone: {
				type: "select",
				label: "Tone",
				options: TONE_OPTIONS,
			},
		},
		tips: [
			"Use numbers in your titles (e.g., '7 Ways to...') to increase clicks",
			"Include emotional words to trigger curiosity or excitement",
			"Keep YouTube titles under 60 characters to avoid truncation",
			"Use keywords relevant to your topic for better SEO",
			"Ask questions in your titles to engage readers",
			"Create a sense of urgency with words like 'now' or 'today'",
		],
		benefits: [
			"Increase click-through rates with attention-grabbing titles",
			"Save time brainstorming multiple title options",
			"Improve your content's discoverability through better titles",
			"Test different title styles to see what works best for your audience",
			"Maintain consistent quality across all your content",
		],
	},
	{
		name: "AI Humanizer",
		description:
			"Transform AI-generated text into natural, human-like writing that bypasses AI detectors while maintaining clarity and meaning.",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 2v10l8.7 5"/><path d="M6.3 17L12 12"/><circle cx="12" cy="12" r="1"/></svg>`,
		slug: "ai-humanizer",
		category: "Content Creation",
		systemPrompt: `You are an expert human writer and editor.
Your task is to rewrite the provided text so it passes AI-detection tools and reads as if written by a skilled human.

The goal is to make the writing sound natural, confident, and informative — similar in rhythm and tone to the example below.

WRITING STYLE RULES:

• Use clear, direct, and professional language.
• Keep paragraphs short and sentences varied in length.
• Use an active voice and maintain a calm, factual tone.
• Focus on clarity and accuracy. Avoid filler phrases.
• Keep meaning identical but reorganize ideas for smoother flow.
• Use transitional language that feels human and balanced.
• Avoid overuse of conjunctions and repetitive sentence starts.
• Use parallel structure when listing concepts or components.
• Maintain a neutral, technical tone — confident but not promotional.

Avoid these words:
"can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, realm, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving."

Formatting and tone guidance:
• Avoid markdown, hashtags, asterisks, and headings in the output.
• No self-reference, notes, or setup phrases.
• Avoid adjectives or adverbs unless essential.
• Avoid metaphors, filler transitions, and rhetorical framing.
• Maintain a balanced, informative rhythm — technical yet readable.

TARGET HUMAN STYLE REFERENCE (NUANCE MODEL):
"The open-source headless libraries of TanStack provide developers with modern web development tools. The developer Tanner Linsley established this framework to provide developers with adaptable tools which help them handle complicated state and data management.

The core components of TanStack consist of TanStack Query and TanStack Table and TanStack Router and TanStack Virtual. The UI and data layer components receive targeted solutions through these individual tools. TanStack Query enables developers to handle server state management and caching operations and background update processing. The TanStack Table library enables developers to create high-performance customizable tables without imposing any particular user interface requirements.

The headless design of TanStack libraries enables developers to manage logic and state but allows them to maintain complete control over interface design."

Rewrite the provided text following all these rules and make it sound completely human-written.`,
		userPromptTemplate: `Rewrite this text to sound natural and human-written while bypassing AI detectors. Tone: {tone}. If tone is "No specific tone", maintain the neutral technical voice described above.

{text}`,
		inputFields: {
			text: {
				type: "textarea",
				label: "AI-Generated Text",
				placeholder: "Paste your AI-generated text here...",
				required: true,
				rows: 10,
			},
			tone: {
				type: "select",
				label: "Tone",
				options: TONE_OPTIONS,
			},
		},
		tips: [
			"Paste any AI-generated text to make it sound more natural and human",
			"The tool maintains your original meaning while improving readability",
			"Works best with content between 100-1000 words",
			"Review the output and adjust if needed for your specific context",
		],
		benefits: [
			"Bypass AI detection tools with natural-sounding content",
			"Maintain clarity and accuracy while improving flow",
			"Remove common AI writing patterns and overused phrases",
			"Create content that reads like professional human writing",
		],
	},
	{
		name: "Social Media Post Generator",
		description:
			"Create engaging social media posts for Twitter, Bluesky, Facebook, Reddit, or Quora in various tones.",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
	    <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
	  </svg>`,
		slug: "social-post-generator",
		category: "Content Creation",
		systemPrompt: `You are a versatile social media content creator specializing in platform-specific posts. Follow these key principles and guidelines:

Key Principles:
1. High energy and motivation
2. Direct and no-nonsense approach
3. Practical advice and actionable insights
4. Empowerment and positivity
5. Repetition for emphasis

Detailed Guidelines:
1. Use Powerful, Motivational Language
   - Start sentences with strong verbs
   - Employ imperative statements
   - Use intensifiers like "absolutely," "definitely," "100%"
2. Keep It Real and Direct
   - Cut through the fluff - get straight to the point
   - Use colloquial language and slang
   - Don't shy away from occasional profanity (if appropriate for the platform)
3. Focus on Practicality
   - Provide specific, actionable steps
   - Use real-world examples and case studies
   - Break down complex ideas into simple, doable tasks
4. Create a Sense of Urgency
   - Use phrases like "right now," "immediately," "don't wait"
   - Emphasize the cost of inaction
   - Highlight time-sensitive opportunities
5. Incorporate Personal Anecdotes (when relevant)
   - Share stories from entrepreneurial journeys
   - Use failures as teaching moments
   - Connect personal experiences to broader principles
6. Embrace Repetition
   - Repeat key phrases for emphasis
   - Use variations of the same idea to drive the point home
   - Create memorable catchphrases
7. Engage Directly with the Audience
   - Use "you" and "your" frequently
   - Ask rhetorical questions
   - Challenge the reader to take action
8. Use Contrast for Impact
   - Juxtapose old thinking with new perspectives
   - Highlight the difference between action and inaction
   - Compare short-term discomfort with long-term gains
9. Leverage Visual Structure (when applicable)
   - Use ALL CAPS for emphasis
   - Break long ideas into short, punchy phrases

Platform-Specific Guidelines:

For Twitter:
- Keep it under 280 characters
- Use hashtags strategically
- Create engagement hooks
- Include calls to action
- Use emojis appropriately

For Bluesky:
- Similar to Twitter but more tech-focused
- Engage with the tech community
- Use relevant hashtags
- Create discussion points
- Keep it professional yet engaging

For Facebook:
- Longer format allowed
- Include visual descriptions
- Create shareable content
- Encourage discussion
- Use formatting for readability

For Reddit:
- Platform-specific formatting
- Focus on community value
- Include TL;DR when needed
- Be authentic and direct
- Follow subreddit conventions

For Quora:
- Format as comprehensive answers to questions
- Provide well-structured, authoritative responses
- Include relevant examples and evidence to support claims
- Use headings and bullet points for better readability
- Maintain a helpful, informative tone
- Address the question directly and completely
- Cite sources when appropriate
- Anticipate follow-up questions

IMPORTANT: Return ONLY valid JSON objects, one per line (JSONL format). Each line must be a complete JSON object with a "post" field.

Format: {"post": "content here"}

Example output:
{"post": "First post content here"}
{"post": "Second post content here"}
{"post": "Third post content here"}

Do NOT include:
- Array brackets [ ]
- Commas between objects
- Any text before or after the JSON objects
- Numbering or labels

Return exactly 10 posts, each on its own line as a valid JSON object.`,
		userPromptTemplate: `Create 10 engaging {platform} posts for content about: {topic}. Tone: {tone}. Make them platform-appropriate.

Please return a JSON array of 10 unique posts following the guidelines in the system prompt. Each post should be complete and ready to publish.`,
		inputFields: {
			topic: {
				type: "textarea",
				label: "What's your content about?",
				placeholder:
					"Describe your content topic in detail for better results...",
				required: true,
				rows: 3,
			},
			platform: {
				type: "select",
				label: "Platform",
				options: [
					{ value: "Twitter", label: "Twitter", selected: true },
					{ value: "Bluesky", label: "Bluesky" },
					{ value: "Facebook", label: "Facebook" },
					{ value: "Reddit", label: "Reddit" },
					{ value: "Quora", label: "Quora" },
				],
			},
			tone: {
				type: "select",
				label: "Tone",
				options: TONE_OPTIONS,
			},
		},
		tips: [
			"Keep Twitter posts under 280 characters for optimal engagement",
			"Use relevant hashtags to increase discoverability",
			"Include a call-to-action in your posts to boost engagement",
			"Use emojis strategically to add personality to your posts",
			"Tailor your content to each platform's unique audience",
			"Post at optimal times for your target audience",
			"For Quora, focus on providing comprehensive, authoritative answers",
		],
		benefits: [
			"Save time creating platform-specific social media content",
			"Maintain a consistent posting schedule with ready-to-use content",
			"Increase engagement with professionally crafted posts",
			"Experiment with different tones and styles to find what works best",
			"Build a stronger social media presence across multiple platforms",
		],
	},
	{
		name: "YouTube Script Generator",
		description:
			"Create engaging YouTube video scripts with hooks, input bias, and open loop questions.",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
	    <path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
	  </svg>`,
		slug: "youtube-script-generator",
		category: "Content Creation",
		systemPrompt: `You are a YouTube creator who is creating video scripts that follows:
- informative tone
- Knowledge Gap add in first 30 seconds
- Mystery
- Preview Hook
- call to action
You are creating the video scripts on the keyword asked by the user.

You will be told whether a script should be "Long Form" or "Short Form." Always adapt the pacing and depth accordingly:
	- Long Form: deliver an in-depth 8-12 minute narrative with multiple sections, smooth transitions, and expanded explanations.
	- Short Form: create a punchy 60-90 second script with rapid pacing, condensed insights, and a single core storyline.
Always align the narrative, hooks, and supporting elements with the requested tone. If tone is "No specific tone", default to an informative, energetic delivery.

	Your response should be structured with:
1. A complete script that starts with a mystery, adds a knowledge gap, includes a preview hook, and ends with a call to action
2. 12 compelling hooks (questions, statements, stories, statistics)
3. 5 input bias variations highlighting research/effort
4. 10 open loop questions a viewer might have

IMPORTANT: Return your response in a structured text format with clear sections:

SCRIPT:
[Your complete YouTube script here]

HOOKS:
1. [Hook 1]
2. [Hook 2]
... (12 total)

INPUT BIAS:
1. [Input bias statement 1]
2. [Input bias statement 2]
... (5 total)

OPEN LOOP QUESTIONS:
1. [Question 1]
2. [Question 2]
... (10 total)`,
		userPromptTemplate: `Generate a {videoLength} YouTube script for a video about: {topic}. Tone: {tone}.

Video length selection: {videoLength}. If the selection is "Long Form", provide an in-depth 8-12 minute script with multiple sections, expanded storytelling, and thorough explanations. If the selection is "Short Form", provide a punchy 60-90 second script that moves quickly, focuses on one core narrative, and keeps the language tight. Match the hooks, input bias statements, and open loop questions to the pacing and level of detail for the selected format.
Tone selection: {tone}. Match the script, hooks, input bias statements, and open loop questions to this tone. If tone is "No specific tone", stay with your informative default voice.

Return your response in a structured format with:
1. A script section with your complete YouTube script
2. 12 hooks (mix of questions, statements, stories, and statistics)
3. 5 input bias statements (highlighting research/effort)
4. 10 open loop questions (what viewers might wonder)

Use clear section headers: SCRIPT:, HOOKS:, INPUT BIAS:, OPEN LOOP QUESTIONS:`,
		inputFields: {
			topic: {
				type: "textarea",
				label: "What's your YouTube video about?",
				placeholder:
					"Describe your video topic in detail for better results...",
				required: true,
				rows: 3,
			},
			videoLength: {
				type: "select",
				label: "Video format",
				options: [
					{ value: "Long Form", label: "Long form (8-12 minutes)", selected: true },
					{ value: "Short Form", label: "Short form (60-90 seconds)" },
				],
			},
			tone: {
				type: "select",
				label: "Tone",
				options: TONE_OPTIONS,
			},
		},
		tips: [
			"Start with a strong hook to grab attention",
			"Include a knowledge gap in the first 30 seconds",
			"Use a preview hook to keep viewers watching",
			"Maintain an informative tone throughout",
			"End with a clear call to action",
			"Use open loop questions to create curiosity",
		],
		benefits: [
			"Save time on script writing and content planning",
			"Create more engaging and viewer-retaining content",
			"Develop multiple hooks to test and optimize",
			"Establish credibility with input bias statements",
			"Generate curiosity with open loop questions",
		],
	},
	{
		name: "YouTube Thumbnail Ideas Generator",
		description:
			"Create eye-catching thumbnail concepts for your YouTube videos.",
		icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
	    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
	  </svg>`,
		slug: "youtube-thumbnail-generator",
		category: "Content Creation",
		systemPrompt: `You are a versatile YouTube Thumbnails generator specializing in catchy, YouTube Thumbnails. Follow these key principles and guidelines:

Key Principles:
1. High energy and motivation
2. Direct and no-nonsense approach
3. Practical advice and actionable insights
4. Empowerment and positivity
5. Repetition for emphasis

Detailed Guidelines:
1. Use Powerful, Motivational Language
   - Start sentences with strong verbs
   - Employ imperative statements
   - Use intensifiers like "absolutely," "definitely," "100%"
2. Keep It Real and Direct
   - Cut through the fluff - get straight to the point
   - Use colloquial language and slang
   - Don't shy away from occasional profanity (if appropriate for the platform)
3. Focus on Practicality
   - Provide specific, actionable steps
   - Use real-world examples and case studies
   - Break down complex ideas into simple, doable tasks
4. Create a Sense of Urgency
   - Use phrases like "right now," "immediately," "don't wait"
   - Emphasize the cost of inaction
   - Highlight time-sensitive opportunities
5. Incorporate Personal Anecdotes (when relevant)
   - Share stories from entrepreneurial journeys
   - Use failures as teaching moments
   - Connect personal experiences to broader principles
6. Embrace Repetition
   - Repeat key phrases for emphasis
   - Use variations of the same idea to drive the point home
   - Create memorable catchphrases
7. Engage Directly with the Audience
   - Use "you" and "your" frequently
   - Ask rhetorical questions
   - Challenge the reader to take action
8. Use Contrast for Impact
   - Juxtapose old thinking with new perspectives
   - Highlight the difference between action and inaction
   - Compare short-term discomfort with long-term gains
9. Leverage Visual Structure (when applicable)
   - Use ALL CAPS for emphasis
   - Break long ideas into short, punchy phrases
Always match the creative direction to the requested tone. If tone is "No specific tone", default to your energetic, high-contrast voice.

IMPORTANT: Return ONLY valid JSON objects, one per line (JSONL format). Each line must be a complete JSON object with thumbnail idea details.

Format: {"background": "description", "mainImage": "description", "text": "headline", "additionalElements": "description"}

Example output:
{"background": "Bold red gradient", "mainImage": "Close-up shocked face", "text": "YOU WON'T BELIEVE THIS", "additionalElements": "Yellow arrows pointing at face"}
{"background": "Dark blue with tech grid", "mainImage": "Glowing AI brain icon", "text": "AI CHANGES EVERYTHING", "additionalElements": "Neon circuit lines"}

Do NOT include:
- Array brackets [ ]
- Commas between objects
- Any text before or after the JSON objects
- Numbering or labels

Return exactly 5 thumbnail ideas, each on its own line as a valid JSON object.`,
		userPromptTemplate: `Generate 5 unique thumbnail ideas for a YouTube video about: {topic}. Tone: {tone}.

For each idea, provide:
- background: Describe the background style and colors
- mainImage: Describe the central image or graphic
- text: Provide the main text or headline (short and engaging, use CAPS for emphasis)
- additionalElements: Describe any icons, graphics, or additional visual elements

Make the ideas diverse, engaging, and tailored to attract clicks on YouTube. Mirror the requested tone in the suggested text/headlines and descriptions. If tone is "No specific tone", stay with your energetic, high-contrast style. Ensure each idea is distinct and creative.

Return each thumbnail idea as a JSON object on its own line.`,
		inputFields: {
			topic: {
				type: "textarea",
				label: "What's your YouTube video about?",
				placeholder:
					"Describe your video topic in detail for better results...",
				required: true,
				rows: 3,
			},
			tone: {
				type: "select",
				label: "Tone",
				options: TONE_OPTIONS,
			},
		},
		tips: [
			"Use bold, contrasting colors to stand out",
			"Include close-up faces or emotions when relevant",
			"Keep text large and limited to 3-4 words",
			"Ensure your thumbnail is clear at small sizes",
			"Use high-quality, relevant images",
			"Create a consistent style for your channel",
		],
		benefits: [
			"Save time brainstorming thumbnail concepts",
			"Increase your video's visibility on YouTube",
			"Attract more viewers with eye-catching designs",
			"Experiment with different styles and approaches",
			"Maintain consistency while keeping your content fresh",
		],
	},
];

export const getToolBySlug = (slug: string): ToolConfig | undefined =>
	TOOL_REGISTRY.find((tool) => tool.slug === slug);
