# Datadog "Waiting for Agent" - Solution

## The Issue

You're seeing: `"waiting to connect to agent"` because `dd-trace` expects a local Datadog agent running on your machine.

## Two Solutions:

### Option 1: Skip APM Traces (Use Metrics Only) ⭐ RECOMMENDED FOR HACKATHON

**Pros:** Works immediately, no agent needed  
**Cons:** No automatic trace visualization (but custom metrics still work!)

**What to do:**
1. Comment out the `dd-trace` initialization temporarily
2. Use only `datadog-metrics` for custom metrics
3. This is actually BETTER for the hackathon because you'll focus on **custom AI metrics** rather than generic traces

**Update `server/src/index.js`:**
```javascript
// Comment out for now - works without agent
// const tracer = require('dd-trace').init({...});

require('dotenv').config();
```

**Result:** Your custom Gemini metrics will still flow to Datadog!

---

### Option 2: Install Datadog Agent (Full Features)

**Pros:** Full APM traces, service maps, everything  
**Cons:** Requires installing agent software

**Steps:**
```bash
# Mac
DD_API_KEY=your-key-here DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_mac_os.sh)"

# Start agent
launchctl start com.datadoghq.agent
```

---

## Recommendation for Hackathon:

**Use Option 1** - Focus on custom metrics!

Why? The judges will be MORE impressed by:
- ✅ Custom Gemini latency metrics
- ✅ AI confidence score tracking
- ✅ Fraud detection metrics
- ✅ Cost optimization dashboards

Than by:
- Generic HTTP request traces
- Database query traces
- Basic infrastructure metrics

---

## Quick Test (Metrics Only):

1. Comment out `dd-trace` init
2. Add this to any route (e.g., `/health`):

```javascript
const { metrics } = require('./utils/datadog-metrics');

app.get('/health', (req, res) => {
    metrics.increment('test.counter', 1);
    res.json({ status: 'ok' });
});
```

3. Hit the endpoint a few times
4. Check Datadog Metrics Explorer in 2 minutes
5. Search for `casperid.test.counter`

If you see it, metrics are working! 🎉

---

## What I Recommend:

**For the hackathon demo:**
- Skip the agent installation
- Focus on **custom metrics** for Gemini API
- Build awesome dashboards with AI-specific data
- Mention in demo: "We focused on domain-specific observability over generic infrastructure"

This is actually a **stronger story** - shows thoughtful engineering!

Want me to proceed with instrumenting the AI endpoints with custom metrics (no agent needed)?
