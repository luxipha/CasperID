# Testing All Datadog Metrics - Quick Guide

## Quick Test (2 minutes)

Run the automated test script:

```bash
cd server
node test-metrics.js
```

This will emit ALL metrics to Datadog:
- ✅ Basic Gemini metrics
- ✅ Verification outcomes
- ✅ Fraud detection
- ✅ Cost per verification
- ✅ Model version tracking
-✅ Geographic performance
- ✅ Adversarial attack detection

---

## Verify in Datadog (3-5 minutes)

### Step 1: Check Metrics Explorer
1. Go to: https://app.datadoghq.com/metric/explorer
2. Search for: `casperid`
3. You should see all these metrics:

**Basic Metrics (Days 1-4):**
```
casperid.gemini.latency
casperid.gemini.confidence
casperid.gemini.calls.total
casperid.verification.result
casperid.fraud.attempts
```

**Day 5 Advanced Metrics:**
```
casperid.business.cost_per_attempt
casperid.business.verification_efficiency
casperid.ml.model.confidence
casperid.ml.model.latency
casperid.ml.model.calls
casperid.geo.verifications
casperid.geo.confidence
casperid.geo.latency
casperid.security.adversarial.attempts
casperid.security.critical_threats
```

### Step 2: Check APM Traces
1. Go to: https://app.datadoghq.com/apm/traces
2. Filter by: `service:casperid-api`
3. You should see traces from the test script

### Step 3: Check Dashboard
1. Go to your "CasperID LLM Health" dashboard
2. Verify widgets are showing data
3. May need to adjust time range if just ran tests

### Step 4: Check Monitors
1. Go to: https://app.datadoghq.com/monitors/manage
2. Filter by: `tag:casperid-api`
3. All 7 monitors should be visible

---

## Full Integration Test (with Real Verification)

To test with actual AI verification:

### 1. Start Frontend
```bash
cd /Users/abisoye/Projects/casperId
npm run dev
```

### 2. Go to Dashboard
Open: http://localhost:3000/me

### 3. Complete Verification
- Upload ID document
- Upload selfie
- Complete liveness check

### 4. Check Logs
Watch server logs for:
```
[Datadog] KYC verification: success, confidence: 0.87, latency: 1234ms, cost: $0.0021
[Business] Verification cost: $0.0021 (success)
[ML] Model gemini-1.5-pro: confidence=0.87, latency=1234ms
[Geo] NG: success, confidence=0.87
```

### 5. Verify in Datadog (wait 2-3 minutes)
All metrics from the real verification should appear.

---

## Troubleshooting

### "No metrics appearing"
**Wait:** Metrics can take 2-5 minutes to appear  
**Check:** Is Datadog agent running? `sudo datadog-agent status`  
**Verify:** Server logs show metric emissions

### "Only some metrics appearing"
**Cause:** Need to provide optional parameters  
**Fix:** Add `country` and `wallet` to requests:
```bash
curl -X POST http://localhost:3001/api/ai/verify-kyc \
  -F "country=NG" \
  -F "wallet=0x123..." \
  -F "idDocument=@id.jpg" \
  -F "selfie=@selfie.jpg"
```

### "Adversarial metrics not showing"
**Cause:** Need to trigger detection patterns  
**Fix:** Run test script which includes adversarial test cases

---

## Expected Console Output

When running `node test-metrics.js`, you should see:

```
🧪 Testing CasperID Datadog Metrics

Test 1: Basic Gemini API Metrics
=====================================
✓ Basic metrics tracked

Test 2: Verification Outcome Metrics
=====================================
✓ Verification outcomes tracked

Test 3: Fraud Detection Metrics
=====================================
[FRAUD] Detected multiple_requests_same_device from wallet 0x1234567890...
[FRAUD] Detected synthetic_document from wallet 0xabcdef1234...
[FRAUD] Detected deepfake_detected from wallet 0x987654321...
✓ Fraud attempts tracked

Test 4: Cost Per Verification (Business Metrics)
=====================================
[Business] Verification cost: $0.0021 (success)
[Business] Verification cost: $0.0018 (success)
[Business] Verification cost: $0.0023 (failed)
✓ Cost metrics tracked

Test 5: Model Version Performance
=====================================
[ML] Model gemini-1.5-pro: confidence=0.87, latency=1234ms
[ML] Model gemini-1.5-pro: confidence=0.92, latency=1100ms
[ML] Model gemini-1.0-pro: confidence=0.78, latency=1450ms
✓ Model version metrics tracked

Test 6: Geographic Performance
=====================================
[Geo] NG: success, confidence=0.89
[Geo] KE: success, confidence=0.92
[Geo] US: success, confidence=0.85
[Geo] GB: failed, confidence=0.65
✓ Geographic metrics tracked

Test 7: Adversarial Attack Detection
=====================================
[SECURITY] Adversarial attack detected: synthetic_data_suspected (medium)
Synthetic data test: ✓ Detected
  Patterns: 1, Risk Score: 3
[SECURITY] Adversarial attack detected: brute_force_pattern (high)
Brute force test: ✓ Detected
  Patterns: 1, Risk Score: 7
[SECURITY] Adversarial attack detected: automated_submission (medium)
Fast submission test: ✓ Detected
  Patterns: 1, Risk Score: 3
Normal request test: ✓ Correctly identified as normal
  Patterns: 0, Risk Score: 0

Test 8: Security Events
=====================================
[SECURITY] Adversarial attack detected: prompt_injection (high)
[SECURITY] Adversarial attack detected: model_manipulation (critical)
✓ Security events tracked

📤 Flushing metrics to Datadog...

✅ All tests complete!
```

---

## Validation Checklist

After running tests, verify:

- [ ] `casperid.*` metrics visible in Metrics Explorer
- [ ] Dashboard widgets showing data
- [ ] APM traces for casperid-api service
- [ ] All 7 monitors created
- [ ] No critical alerts (unless testing)
- [ ] Geographic data showing country codes
- [ ] Business metrics calculating costs
- [ ] Security metrics tracking adversarial patterns

---

## Next Steps for Hackathon

1. ✅ Run `node test-metrics.js`
2. ✅ Verify all metrics in Datadog
3. ✅ Take screenshots of:
   - Metrics Explorer showing casperid.* metrics
   - Dashboard with all widgets populated
   - APM traces
   - Monitor summary
4. ✅ Add Day 5 widgets to dashboard
5. ✅ Prepare demo scenario

**You're ready for the hackathon! 🎉**
