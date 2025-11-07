# AI Tools Troubleshooting Guide

## 🚨 Common Errors & Solutions

### 1. "Service Overloaded" Error

**Error Message:**
```
The AI service is experiencing high demand. Please try again in a few moments.
```

**Cause:**
- The AI provider (OpenAI, Anthropic, etc.) is experiencing high traffic
- Too many concurrent requests to the API
- Regional capacity limitations

**Solutions:**

#### Automatic Retry (Built-in)
The system automatically retries with exponential backoff:
- Attempt 1: Waits 2 seconds
- Attempt 2: Waits 4 seconds
- Attempt 3: Waits 8 seconds

#### Manual Solutions
1. **Wait and retry**: Wait 30-60 seconds before manually retrying
2. **Try off-peak hours**: Use the tool during less busy times (early morning, late evening in your timezone)
3. **Reduce input size**: Shorter prompts require less processing power
4. **Switch models** (see Configuration section below)

---

### 2. Rate Limit Errors

**Error Message:**
```
You've made too many requests. Please wait a moment before trying again.
```

**Cause:**
- Exceeded API rate limits (requests per minute/hour)
- Free tier limitations
- Multiple users sharing same API key

**Solutions:**
1. **Wait**: Rate limits reset after the time window (usually 1 minute or 1 hour)
2. **Upgrade API plan**: Consider upgrading to a higher tier with the AI provider
3. **Implement caching**: Save and reuse common outputs
4. **Batch requests**: Combine multiple operations when possible

---

### 3. Invalid API Configuration

**Error Message:**
```
There's an issue with the AI service configuration. Please contact support.
```

**Cause:**
- Missing or invalid `AI_GATEWAY_API_KEY` environment variable
- Incorrect API key format
- API key revoked or expired

**Solutions:**
1. **Check `.env.local` file**:
   ```bash
   AI_GATEWAY_API_KEY=your_actual_api_key_here
   VITE_AI_PROVIDER=openai
   VITE_AI_MODEL=gpt-4o-mini
   ```

2. **Verify API key validity**:
   - Go to your AI provider dashboard
   - Check if the key is active and not expired
   - Regenerate if necessary

3. **Restart development server**:
   ```bash
   # Stop the server (Ctrl+C)
   bun run dev
   ```

---

### 4. "Input Too Long" Error

**Error Message:**
```
Your input is too long. Please shorten it and try again.
```

**Cause:**
- Input exceeds model's context window
- gpt-4o-mini: ~128k tokens (~96k words)
- gpt-3.5-turbo: ~16k tokens (~12k words)

**Solutions:**
1. **Shorten your input**: Be more concise
2. **Split into multiple requests**: Break large content into chunks
3. **Use a larger model**: Switch to a model with larger context window
4. **Summarize first**: Create a summary, then expand on specific parts

---

### 5. Network/Connection Errors

**Error Message:**
```
Failed to generate content. Please try again.
```

**Cause:**
- Network connectivity issues
- Server timeout
- CORS issues
- Firewall blocking requests

**Solutions:**
1. **Check internet connection**
2. **Verify server is running**:
   ```bash
   # Should show both processes running
   bun run dev       # Port 3000
   bun convex dev    # Convex backend
   ```
3. **Check browser console** for detailed error messages
4. **Try different network**: Switch from WiFi to mobile hotspot
5. **Disable VPN/Proxy**: May interfere with API calls

---

## ⚙️ Configuration

### Switching AI Models

Edit `.env.local`:

```bash
# OpenAI Models
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o-mini          # Fast, cheap
VITE_AI_MODEL=gpt-4o               # More capable
VITE_AI_MODEL=gpt-3.5-turbo        # Faster, cheaper

# Anthropic Models
VITE_AI_PROVIDER=anthropic
VITE_AI_MODEL=claude-3-5-sonnet-20241022
VITE_AI_MODEL=claude-3-5-haiku-20241022

# Restart server after changes
```

### Model Selection Guide

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| gpt-4o-mini | ⚡⚡⚡ | ⭐⭐⭐ | 💰 | Quick tasks, titles, short content |
| gpt-4o | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex content, detailed scripts |
| claude-3-5-sonnet | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Long-form content, analysis |
| claude-3-5-haiku | ⚡⚡⚡ | ⭐⭐⭐ | 💰 | Fast, simple tasks |

---

## 🔍 Debugging

### Enable Debug Mode

1. **Check browser console** (F12 → Console tab):
   - Look for error messages
   - Network requests status
   - JavaScript errors

2. **Server logs**:
   ```bash
   # Terminal running `bun run dev`
   # Look for "AI tool execution failed" messages
   ```

3. **Network tab** (F12 → Network):
   - Filter by "Fetch/XHR"
   - Look for `/api/` requests
   - Check status codes and response

### Common Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: API key issue
- `429 Too Many Requests`: Rate limited
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Overloaded

---

## 🛠️ Advanced Solutions

### 1. Implement Request Queuing

For high-traffic scenarios, add a queue system:

```typescript
// src/lib/request-queue.ts
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const fn = this.queue.shift()!;
    await fn();
    this.processing = false;

    this.process();
  }
}

export const toolQueue = new RequestQueue();
```

### 2. Add Caching Layer

Cache common requests to reduce API calls:

```typescript
// src/lib/tool-cache.ts
const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key: string): string | null {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCache(key: string, data: string) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

### 3. Monitor API Usage

Track API usage to prevent overages:

```typescript
// convex/toolUsage.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const trackUsage = mutation({
  args: {
    toolSlug: v.string(),
    tokensUsed: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("apiUsage", {
      toolSlug: args.toolSlug,
      tokensUsed: args.tokensUsed,
      timestamp: Date.now(),
    });
  },
});

export const getDailyUsage = query({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const usage = await ctx.db
      .query("apiUsage")
      .filter((q) => q.gte(q.field("timestamp"), oneDayAgo))
      .collect();

    return usage.reduce((sum, u) => sum + u.tokensUsed, 0);
  },
});
```

---

## 📊 Performance Optimization

### 1. Reduce Token Usage

- **Be specific**: Clear, concise prompts use fewer tokens
- **Remove fluff**: Avoid unnecessary context
- **Use examples**: Show format instead of describing it
- **Set max_tokens**: Limit response length when appropriate

### 2. Optimize System Prompts

```typescript
// ❌ Too verbose
systemPrompt: `You are a helpful assistant that generates titles.
Please be creative and engaging. Make sure the titles are catchy
and appropriate for the platform. Always follow best practices...`

// ✅ Concise
systemPrompt: `Generate 10 catchy, platform-appropriate titles.
Format: {"title": "..."} per line.`
```

### 3. Batch Similar Requests

Instead of multiple API calls, batch when possible:

```typescript
// ❌ Multiple calls
await generateTitle(topic1);
await generateTitle(topic2);
await generateTitle(topic3);

// ✅ Single batched call
await generateTitles([topic1, topic2, topic3]);
```

---

## 🔒 Security Best Practices

### 1. Protect API Keys

```bash
# ✅ GOOD - Server-side only
AI_GATEWAY_API_KEY=sk-xxxxx

# ❌ BAD - Never do this
VITE_API_KEY=sk-xxxxx  # Exposed to client!
```

### 2. Rate Limiting

Implement per-user rate limiting:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

### 3. Input Validation

Sanitize all user inputs:

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).slice(0, 10000); // Max length
}
```

---

## 📞 Getting Help

### 1. Check Existing Issues
- Search GitHub issues for similar problems
- Check AI provider status page

### 2. Gather Debug Information

When reporting issues, include:
- Error message (full text)
- Browser console logs
- Network request details (status, response)
- Environment (browser, OS, Node version)
- Steps to reproduce

### 3. Provider Status Pages

- OpenAI: https://status.openai.com/
- Anthropic: https://status.anthropic.com/
- Vercel: https://www.vercel-status.com/

### 4. Community Support

- Discord: [Your Discord Link]
- GitHub Issues: [Your GitHub Link]
- Email: support@bitbuddies.me

---

## 📝 Changelog

### v1.0.0 - 2024-12-28
- Initial release
- Added automatic retry with exponential backoff
- Improved error messages
- Added overload handling

---

**Last Updated**: 2024-12-28
**Version**: 1.0.0
