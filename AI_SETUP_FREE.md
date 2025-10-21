# AI Integration Setup Guide - FREE OPTIONS

This guide covers setting up AI capabilities for AquaDex using **completely free** or very low-cost options.

## Recommended: Google Gemini Free Tier (Best Value)

### ✅ Pros:
- **FREE quota**: 15 requests/minute, 1,500 requests/day, **1 million requests/month**
- Excellent vision capabilities for analyzing test strip images
- Fast response times
- Very low cost after free tier ($0.075 per 1M input tokens)
- High quality responses

### Setup:

1. **Get Your Free API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your key

2. **Add to `.env.local`**:
   ```bash
   GEMINI_API_KEY=your-api-key-here
   USE_FREE_AI_TIER=true
   ```

3. **Usage Estimate**:
   - **Typical use**: ~100-200 requests/day per active user
   - **Free tier covers**: ~50-100 active users completely FREE
   - **Cost if exceeded**: ~$0.01 per 1,000 extra requests

### What You Get FREE:
- ✅ Test strip image analysis
- ✅ Water quality recommendations
- ✅ Treatment suggestions
- ✅ Product recommendations
- ✅ Fish compatibility checks
- ✅ Equipment advice

---

## Alternative: Groq (Fastest Free Option)

### ✅ Pros:
- **FREE** with very generous limits
- 30 requests/minute
- Extremely fast responses (2-3x faster than others)
- Great for text-only tasks

### ⚠️ Cons:
- No vision capabilities (can't analyze images directly)
- Models change availability

### Setup:

1. **Get Your Free API Key**:
   - Go to [Groq Console](https://console.groq.com)
   - Sign up (free)
   - Create an API key

2. **Add to `.env.local`**:
   ```bash
   GROQ_API_KEY=your-groq-api-key-here
   ```

---

## Cost Comparison

### Monthly Costs (for 1,000 users):

| Provider | Free Tier | After Free Tier | Best For |
|----------|-----------|-----------------|----------|
| **Gemini** | 1M requests | $0.38/1K extra | Images + Text ⭐ |
| **Groq** | Unlimited* | FREE | Text only, Speed |
| **OpenAI GPT-4** | $5 credit | $30/1M tokens | Complex tasks only |
| **Local (Ollama)** | FREE | FREE | Privacy, No limits |

*Subject to fair use policy

---

## Implementation Strategy

### Phase 1: Start with Gemini Free Tier
```typescript
// Automatically configured in src/lib/ai-config.ts
import { analyzeTestStripImage, getWaterTreatmentRecommendations } from '@/lib/ai-config';

// Analyze test strip (uses vision)
const results = await analyzeTestStripImage(imageUrl, 'freshwater');

// Get recommendations (text only)
const advice = await getWaterTreatmentRecommendations({
  ph: 7.2,
  ammonia: 0.5,
  aquariumType: 'freshwater'
});
```

### Phase 2: Monitor Usage
```typescript
import { estimateCost } from '@/lib/ai-config';

// Check if you're within free tier
const { free, estimatedCost } = estimateCost({
  imageAnalyses: 100,
  textRecommendations: 500,
  month: true
});

console.log(`Still free: ${free}, Estimated cost: $${estimatedCost}`);
```

### Phase 3: Scale Up (if needed)
- Add Groq as fallback for text tasks
- Keep Gemini for image analysis only
- Consider caching common responses

---

## Cost Optimization Tips

### 1. **Cache Common Responses**
```typescript
// Cache water parameter advice for common ranges
const cacheKey = `advice-${ph}-${ammonia}-${nitrite}`;
// Check cache before calling AI
```

### 2. **Batch Requests**
```typescript
// Instead of analyzing each parameter separately,
// send all parameters in one request
```

### 3. **Use Appropriate Models**
```typescript
// Text-only tasks: Use Gemini Flash (cheaper)
// Vision tasks: Use Gemini Flash with vision
// Never use: GPT-4 for simple tasks
```

### 4. **Rate Limiting** (Already Implemented)
```typescript
// Automatic rate limiting in ai-config.ts
// Prevents exceeding free tier limits
```

---

## Real-World Cost Examples

### Scenario 1: Hobby Aquarist (Light Use)
- 5 test strip analyses/month
- 20 water quality checks/month
- **Cost**: **$0.00** (well within free tier)

### Scenario 2: Active User
- 30 test strip analyses/month
- 100 water quality checks/month
- **Cost**: **$0.00** (still free!)

### Scenario 3: Power User
- 100 test strip analyses/month
- 500 water quality checks/month  
- **Cost**: **$0.00** (just under free limit)

### Scenario 4: Small Business (LFS)
- 1000 test strip analyses/month
- 3000 water quality checks/month
- **Cost**: ~**$1.50/month** (very affordable)

---

## Setup Verification

Test your AI setup:

```bash
# 1. Install dependencies (already done)
npm install

# 2. Add your API key to .env.local
GEMINI_API_KEY=your-key-here

# 3. Test the connection
npm run dev

# 4. Try analyzing a test strip at /analyze
```

---

## FAQ

**Q: Will I accidentally spend money?**
A: No! The free tier is very generous, and we have rate limiting built in. You'd need thousands of requests to exceed it.

**Q: What happens if I hit the limit?**
A: Requests will automatically wait/retry. You'll never be charged without explicitly setting up billing.

**Q: Can I use multiple providers?**
A: Yes! Set up both Gemini and Groq for redundancy.

**Q: Is the free tier forever?**
A: Gemini's free tier is currently permanent. Groq is also free with fair use.

**Q: What about privacy?**
A: API requests are processed by Google/Groq. For complete privacy, use local Ollama (see Advanced Setup).

---

## Advanced: Local AI (100% Free, Private)

For complete privacy and zero costs:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download a model
ollama pull llama3.1

# Run locally
# No API keys needed, 100% private
```

---

## Monitoring Dashboard

Track your AI usage:

```typescript
// Built-in cost tracking
import { estimateCost } from '@/lib/ai-config';

// Get monthly estimate
const cost = estimateCost({
  imageAnalyses: userStats.imageCount,
  textRecommendations: userStats.textCount,
  month: true
});

// Display to admin dashboard
```

---

## Support

- **Gemini Issues**: [Google AI Studio](https://aistudio.google.com)
- **Groq Issues**: [Groq Console](https://console.groq.com)
- **AquaDex Issues**: Check project documentation

---

**Bottom Line**: Start with Gemini's free tier. It covers thousands of requests per month at **zero cost**. Perfect for personal use and small businesses!