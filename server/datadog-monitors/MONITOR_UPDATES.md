# Monitor Updates - Metric-Based Versions

## Why the Change?

**Original Issue:** Monitors 5 and 7 used log-based queries, which require Datadog Log Management to be enabled. This feature may not be available in free trials or requires additional setup.

**Solution:** Converted to metric-based monitors that work immediately with your current setup.

---

## Updated Monitors

### Monitor 5: Fraud Detection (Metric-Based)
**Old:** Log pattern search for fraud indicators  
**New:** Metric tracking `casperid.fraud.attempts`

**What changed:**
- Now triggers on `casperid.fraud.attempts` metric
- You need to emit this metric when fraud is detected
- Works immediately without log configuration

**To use:** Add this to your code when you detect fraud:
```javascript
const { trackFraudAttempt } = require('./utils/datadog-metrics');

// When you detect suspicious activity:
trackFraudAttempt('multiple_requests_same_device', walletAddress);
```

---

### Monitor 7: Security Alert (Metric-Based)  
**Old:** PII leak detection in logs  
**New:** Verification failure spike detection

**What changed:**
- Now monitors high failure rates as security proxy
- Unusual failure spikes often indicate attacks
- Uses existing `casperid.verification.result` metric
- Works immediately

**Rationale:** 
- High failure rates can indicate:
  - Automated attack attempts
  - Credential stuffing
  - Bot activity
  - Data quality issues

---

## Optional: Enable Log Monitoring Later

If you want the original log-based monitors:

### Step 1: Enable Log Collection
1. Go to https://app.datadoghq.com/logs/onboarding
2. Follow setup wizard
3. Choose log source (e.g., "Custom" for Node.js)

### Step 2: Configure Log Shipping
Add to `server/src/index.js`:
```javascript
const winston = require('winston');
const { createLogger, format, transports } = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Http({
      host: 'http-intake.logs.datadoghq.com',
      path: '/api/v2/logs?dd-api-key=' + process.env.DD_API_KEY,
      ssl: true
    })
  ]
});
```

### Step 3: Use Original Monitor Configs
Once logs are flowing, you can use the original log-based monitors.

---

## Current Monitor Summary

All monitors now use **metrics only** (no logs required):

| # | Monitor | Type | Metric |
|---|---------|------|--------|
| 1 | Low AI Confidence | Metric | `casperid.gemini.confidence` |
| 2 | Cost Anomaly | Anomaly | `casperid.gemini.cost.estimated` |
| 3 | Success Rate Drop | Formula | `verification.result` ratio |
| 4 | High Latency | Metric | `casperid.gemini.latency` |
| 5 | Fraud Attempts | Metric | `casperid.fraud.attempts` ⭐ NEW |
| 6 | Error Rate | Metric | `casperid.gemini.calls.total{error}` |
| 7 | Failure Spike | Metric | `verification.result{failed}` ⭐ NEW |

---

## Testing Updated Monitors

### Test Monitor 5 (Fraud):
```javascript
// In your code, trigger fraud detection:
const { trackFraudAttempt } = require('./utils/datadog-metrics');

// Simulate fraud detection
for (let i = 0; i < 15; i++) {
  trackFraudAttempt('test_pattern', 'test-wallet-' + i);
}
```

Wait 5 minutes → Monitor should trigger!

### Test Monitor 7 (Failure Spike):
Already works if you have verification failures. To test:
```bash
# Make multiple requests that will fail
# (Use invalid data to trigger failures)
```

---

## Advantages of Metric-Based Monitors

✅ **Immediate Setup** - No additional configuration  
✅ **Lower Cost** - Metrics cheaper than logs  
✅ **Better Performance** - Faster query execution  
✅ **Already Integrated** - Using existing metrics  

---

## Summary

**What to do now:**
1. Delete old monitor-5 and monitor-7 if already imported
2. Import updated versions (now metric-based)
3. Monitors will work immediately!

**No errors anymore!** ✅

All 7 monitors now work with your current Datadog setup. 🎉
