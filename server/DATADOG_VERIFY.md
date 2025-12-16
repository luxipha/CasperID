# ✅ Datadog Agent Connected! Next Steps

## What Just Happened

You successfully installed the Datadog agent! It's now collecting:
- Process metrics from your Mac
- System metrics (CPU, memory, disk)
- And will collect traces from your CasperID API

## Verify CasperID Traces

I've sent a few test requests to your API. Now check if traces are showing up:

### Step 1: Open Datadog APM
Go to: **https://app.datadoghq.com/apm/traces**

### Step 2: Look for `casperid-api` Service
- In the Service list, you should see: `casperid-api`
- Click on it

### Step 3: View Traces
You should see traces for:
- `GET /health`
- `GET /api/identity-status`

If you see them, **Datadog is fully working!** 🎉

---

## What If No Traces Yet?

**Wait 1-2 minutes** - There's a slight delay before traces appear.

Then generate more traffic:
```bash
# Hit your API a few times
for i in {1..10}; do 
  curl -s http://localhost:3001/health > /dev/null
  echo "Request $i sent"
done
```

Check Datadog again after 30 seconds.

---

## Once You See Traces...

We'll move to **Day 2: AI Endpoint Instrumentation**

This means adding custom metrics for:
- Gemini API latency
- AI confidence scores
- Verification success rates
- Token usage & cost

Ready to proceed once you confirm traces are visible! 🚀
