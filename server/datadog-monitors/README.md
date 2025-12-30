# Datadog Monitor JSON Import Instructions

## Files Created

All 7 monitors are now available as valid JSON files:

1. `monitor-1-low-confidence.json` - AI confidence below 70%
2. `monitor-2-cost-anomaly.json` - Gemini API cost spikes
3. `monitor-3-success-rate.json` - Verification success rate degradation
4. `monitor-4-high-latency.json` - P95 latency > 5 seconds
5. `monitor-5-fraud-pattern.json` - Fraud detection patterns
6. `monitor-6-error-rate.json` - API error rate spikes
7. `monitor-7-pii-leak.json` - PII data in logs (critical security)

---

## How to Import

### Method 1: Datadog API (All at once)

```bash
cd server/datadog-monitors

# Import all monitors
for file in monitor-*.json; do
  echo "Creating monitor from $file..."
  curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
    -H "Content-Type: application/json" \
    -H "DD-API-KEY: ${DD_API_KEY}" \
    -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
    -d @$file
  echo ""
done
```

### Method 2: Datadog UI (One by one)

1. Go to https://app.datadoghq.com/monitors/create
2. Click **Import Monitor JSON**
3. Copy contents of `monitor-1-low-confidence.json`
4. Paste and click **Import**
5. Review and click **Create**
6. Repeat for monitors 2-7

### Method 3: Using curl (Individual)

```bash
# Example for Monitor 1
curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: your-api-key" \
  -H "DD-APPLICATION-KEY: your-app-key" \
  -d @monitor-1-low-confidence.json
```

---

## Before Importing

### 1. Get Application Key

You need both API key and Application key:

1. Go to https://app.datadoghq.com/organization-settings/application-keys
2. Click **New Key**
3. Name it: `casperid-monitors`
4. Copy the key
5. Export it:
   ```bash
   export DD_APP_KEY="your-app-key-here"
   export DD_API_KEY="your-api-key-here"
   ```

### 2. Update Notification Handles

In each JSON file, replace placeholder handles with real ones:

- `@slack-casperid-alerts` → Your actual Slack channel
- `@slack-casperid-critical` → Your critical alerts channel
- `@pagerduty` → Your PagerDuty integration
- `@ai-engineer-oncall` → Your team handle
- `@devops-oncall` → Your devops team
- `@security-team` → Your security team

**Quick find/replace:**
```bash
# In each file, replace with your actual handles
sed -i '' 's/@slack-casperid-alerts/@slack-my-channel/g' monitor-*.json
```

---

## After Import

### Verify Monitors Created

```bash
# List all monitors
curl -X GET "https://api.datadoghq.com/api/v1/monitor" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
  | jq '.[] | select(.name | contains("CasperID")) | {id, name, type}'
```

### View in UI

1. Go to https://app.datadoghq.com/monitors/manage
2. Filter by tag: `casperid-api`
3. You should see all 7 monitors

---

## Testing Monitors

### Test Monitor 1 (Low Confidence)

Trigger with manual metric:
```bash
curl -X POST "https://api.datadoghq.com/api/v1/series" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: ${DD_API_KEY}" \
  -d '{
    "series": [{
      "metric": "casperid.gemini.confidence",
      "points": [['$(date +%s)', 0.65]],
      "type": "gauge",
      "tags": ["endpoint:verify-kyc", "env:development"]
    }]
  }'
```

Wait 5 minutes, monitor should trigger!

### Test Monitor 6 (Error Rate)

Generate errors:
```bash
# Hit a non-existent endpoint to generate errors
for i in {1..20}; do
  curl -s http://localhost:3001/api/nonexistent > /dev/null
done
```

---

## Monitor Priority Mapping

| Priority | Severity | Response Time |
|----------|----------|---------------|
| 1 | P0/P1 - Critical | Immediate (PagerDuty) |
| 2 | P2 - High | < 1 hour |
| 3 | P3 - Medium | < 4 hours |
| 4 | P4 - Low | Best effort |

---

## Troubleshooting

### "Invalid JSON" Error

Validate JSON before importing:
```bash
cat monitor-1-low-confidence.json | jq .
```

If error, the file has syntax issues.

### Monitor Not Triggering

1. Check metric exists: Go to Metrics Explorer
2. Search for `casperid.gemini.confidence`
3. If not found, generate traffic to your API
4. Wait 2-5 minutes for metrics to appear

### No Notifications Received

1. Check notification handles are correct
2. Verify Slack integration configured
3. Test notification: Click **Test Notifications** in monitor UI

---

## Quick Start Script

Save this as `import-monitors.sh`:

```bash
#!/bin/bash
set -e

if [ -z "$DD_API_KEY" ] || [ -z "$DD_APP_KEY" ]; then
    echo "Error: DD_API_KEY and DD_APP_KEY must be set"
    echo "Export them first:"
    echo "  export DD_API_KEY='your-key'"
    echo "  export DD_APP_KEY='your-app-key'"
    exit 1
fi

cd "$(dirname "$0")"

echo "Importing CasperID monitors to Datadog..."

for file in monitor-*.json; do
    echo "📊 Creating monitor from $file..."
    
    response=$(curl -s -X POST "https://api.datadoghq.com/api/v1/monitor" \
      -H "Content-Type: application/json" \
      -H "DD-API-KEY: ${DD_API_KEY}" \
      -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" \
      -d @$file)
    
    monitor_id=$(echo $response | jq -r '.id // empty')
    
    if [ -n "$monitor_id" ]; then
        echo "   ✅ Created monitor ID: $monitor_id"
    else
        echo "   ❌ Failed: $(echo $response | jq -r '.errors // .error')"
    fi
    echo ""
done

echo "✅ Import complete! View monitors at:"
echo "   https://app.datadoghq.com/monitors/manage?q=tag:casperid-api"
```

Make executable and run:
```bash
chmod +x import-monitors.sh
./import-monitors.sh
```
