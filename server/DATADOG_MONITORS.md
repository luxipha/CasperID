# CasperID Detection Rules & Monitoring - Day 4

## Overview

Create 7 intelligent detection rules that automatically monitor your AI system and create actionable incidents when issues occur.

---

## Monitor 1: Low AI Confidence Alert

**Purpose:** Catch when AI verification confidence drops, indicating potential model drift or poor input quality.

**Monitor Configuration:**

```yaml
Name: "[CasperID] Low AI Confidence Detected"
Type: Metric Monitor
Metric: avg:casperid.gemini.confidence{*}
Condition: avg(last_5m) < 0.7
Message: |
  ⚠️ AI Verification Confidence Below Threshold
  
  **Current Confidence:** {{value}}
  **Threshold:** 70%
  **Endpoint:** {{endpoint.name}}
  
  **Possible Causes:**
  - Poor quality document uploads
  - Model performance degradation  
  - Adversarial attacks
  - API version mismatch
  
  **Action Required:**
  1. Check recent verification requests
  2. Review document quality scores
  3. Validate AI model version
  4. Consider retraining if persistent
  
  Dashboard: https://app.datadoghq.com/dashboard/casperid-llm-health
  
  @ai-engineer-oncall @slack-alerts

Priority: High
Tags: ai, gemini, confidence, casperid-api
Notify: Slack #casperid-alerts
```

**Thresholds:**
- **Warning:** < 75%
- **Critical:** < 70%
- **Recovery:** > 80%

---

## Monitor 2: Cost Anomaly Detection

**Purpose:** Detect unusual spikes in Gemini API usage that could indicate DoS attack or runaway loops.

**Monitor Configuration:**

```yaml
Name: "[CasperID] Gemini API Cost Spike"
Type: Anomaly Detection
Metric: sum:casperid.gemini.cost.estimated{*}
Condition: anomaly(avg(last_15m), 'agile') > 3
Message: |
  💰 COST ALERT: Gemini API Usage Anomaly
  
  **Current Cost Rate:** ${{value}}/hour
  **Normal Rate:** ${{comparison}}/hour
  **Spike:** {{percentage}}%
  
  **Potential Causes:**
  - DoS attack (automated verification requests)
  - Infinite retry loop
  - Traffic spike from viral content
  - Bot activity
  
  **Immediate Actions:**
  1. Enable rate limiting immediately
  2. Check for suspicious IP addresses
  3. Review request patterns in logs
  4. Consider temporarily disabling public endpoints
  
  **Cost Projection:** At this rate, daily cost will be ${{daily_projection}}
  
  @finance-team @devops-oncall @slack-critical
  
Priority: Critical
Tags: cost, gemini, anomaly, security
Notify: PagerDuty, Slack #casperid-critical
```

**Thresholds:**
- **Warning:** 5x normal rate
- **Critical:** 10x normal rate

---

## Monitor 3: Verification Success Rate Degradation

**Purpose:** Alert when verification success rate drops significantly, indicating systemic issues.

**Monitor Configuration:**

```yaml
Name: "[CasperID] KYC Success Rate Degradation"
Type: Metric Monitor (Formula)
Formula: |
  (sum:casperid.verification.result{outcome:success}.as_count() / 
   sum:casperid.verification.result{*}.as_count()) * 100
Condition: avg(last_1h) < 50
Message: |
  📉 CRITICAL: Verification Success Rate Below 50%
  
  **Current Success Rate:** {{value}}%
  **Normal Rate:** 75-85%
  **Duration:** {{duration}}
  
  **Potential Root Causes:**
  - Gemini API degradation
  - Model performance regression
  - Poor document quality (batch issue)
  - Backend API changes breaking integration
  - Database connection issues
  
  **Troubleshooting Steps:**
  1. Check Gemini API status page
  2. Review recent code deployments
  3. Analyze top rejection reasons (see dashboard)
  4. Test with known-good sample documents
  5. Check API error logs
  
  **Top Rejection Reasons (last hour):**
  {{top_reasons}}
  
  **Incident:** Auto-created incident #{{incident_id}}
  
  @ai-engineer-oncall @product-manager
  
Priority: Critical
Tags: verification, success-rate, gemini
Notify: Slack #casperid-critical, PagerDuty
Auto-Create Incident: Yes
```

**Thresholds:**
- **Warning:** < 60%
- **Critical:** < 50%
- **Recovery:** > 70% for 15 minutes

---

## Monitor 4: High Gemini API Latency

**Purpose:** Catch performance degradation that impacts user experience.

**Monitor Configuration:**

```yaml
Name: "[CasperID] High Gemini API Latency"
Type: Metric Monitor
Metric: p95:casperid.gemini.latency{*}
Condition: p95(last_10m) > 5000
Message: |
  ⏱️ PERFORMANCE: Gemini API Latency Spike
  
  **P95 Latency:** {{value}}ms
  **Normal P95:** 1500-2500ms
  **Affected Endpoint:** {{endpoint.name}}
  
  **Impact:**
  - Slow user experience
  - Increased timeout risk
  - Higher infrastructure costs
  
  **Quick Checks:**
  1. Verify Gemini API status
  2. Check network connectivity
  3. Review recent traffic patterns
  4. Monitor concurrent request count
  
  **Performance Metrics:**
  - P50: {{p50}}ms
  - P95: {{p95}}ms  
  - P99: {{p99}}ms
  
  Runbook: https://docs.casperid.com/runbooks/high-latency
  
  @sre-team @slack-alerts
  
Priority: Medium
Tags: performance, latency, gemini
Notify: Slack #casperid-performance
```

**Thresholds:**
- **Warning:** P95 > 3000ms
- **Critical:** P95 > 5000ms

---

## Monitor 5: Fraud Pattern Detection

**Purpose:** Alert on suspicious verification patterns indicating coordinated fraud attempts.

**Monitor Configuration:**

```yaml
Name: "[CasperID] Suspicious Fraud Pattern Detected"
Type: Log Pattern Monitor
Query: |
  service:casperid-api 
  (source:fraud_detector OR @fraud.detected:true)
  @fraud.type:*
Condition: count > 10 in last 5 minutes
Message: |
  🚨 SECURITY: Fraud Pattern Detected
  
  **Fraud Attempts:** {{value}} in last 5 minutes
  **Pattern Type:** {{fraud_type}}
  **Source IPs:** {{unique_ips}}
  
  **Common Fraud Indicators:**
  - Multiple verification attempts from same device
  - Doctored/synthetic ID documents
  - Deepfake liveness photos
  - Stolen identity credentials
  
  **Immediate Actions:**
  1. Block identified IP addresses
  2. Flag affected wallet addresses
  3. Review verification session videos
  4. Report to fraud investigation team
  5. Update ML fraud detection models
  
  **Affected Wallets:** {{wallet_list}}
  
  Case: Auto-created fraud investigation case #{{case_id}}
  
  @security-team @fraud-ops @slack-security
  
Priority: Critical
Tags: security, fraud, casperid-api
Notify: Slack #security-alerts, Email security@casperid.com
Auto-Create: Security Case
```

**Thresholds:**
- **Warning:** 5 attempts in 5 min
- **Critical:** 10 attempts in 5 min

---

## Monitor 6: Error Rate Spike

**Purpose:** Catch unexpected errors before they cascade into major incidents.

**Monitor Configuration:**

```yaml
Name: "[CasperID] API Error Rate Spike"
Type: Metric Monitor
Metric: sum:casperid.gemini.calls.total{result:error}.as_rate()
Condition: avg(last_5m) > 0.1
Message: |
  ❌ Error Rate Above Threshold
  
  **Error Rate:** {{value}} errors/second
  **Normal Rate:** < 0.01/sec
  **Affected Service:** casperid-api
  
  **Common Error Types:**
  - Gemini API quota exceeded
  - Invalid image format
  - Missing required parameters
  - Database connection timeout
  - Network issues
  
  **Debugging:**
  1. Check error logs: [Link to logs]
  2. Review error distribution by type
  3. Verify API credentials valid
  4. Check third-party service status
  
  **Recent Errors:**
  {{error_samples}}
  
  @devops-oncall
  
Priority: High
Tags: errors, reliability, casperid-api
Notify: Slack #casperid-alerts
```

**Thresholds:**
- **Warning:** > 5% error rate
- **Critical:** > 10% error rate

---

## Monitor 7: PII Data Leak Detection

**Purpose:** Security monitor to catch accidental PII logging.

**Monitor Configuration:**

```yaml
Name: "[CasperID] SECURITY - PII in Logs Detected"
Type: Log Monitor
Query: |
  service:casperid-api 
  (SSN OR "social security" OR "credit card" OR CVV OR 
   @email:*@* OR @phone:* OR @address:*)
  -source:structured_data
Condition: count > 0 in last 5 minutes
Message: |
  🔴 CRITICAL SECURITY: Potential PII Leak in Logs
  
  **Detected PII Types:** {{pii_types}}
  **Log Count:** {{value}}
  **Service:** casperid-api
  
  **IMMEDIATE ACTION REQUIRED:**
  1. Stop all log collectors immediately
  2. Rotate affected API keys
  3. Purge logs containing PII
  4. Audit logging configuration
  5. Notify security team and DPO
  6. Prepare incident report for compliance
  
  This is a GDPR/compliance violation!
  
  **Compliance Requirements:**
  - Report to DPO within 1 hour
  - User notification may be required
  - Regulatory reporting if confirmed
  
  Incident: Auto-created P0 incident #{{incident_id}}
  
  @security-lead @dpo @cto @slack-critical
  
Priority: P0 - Critical
Tags: security, pii, gdpr, compliance
Notify: PagerDuty (immediate), Slack #security-critical
Auto-Create: P0 Incident
```

**Threshold:** ANY occurrence = Critical

---

## How to Create These Monitors

### Step 1: Navigate to Monitors
1. Go to https://app.datadoghq.com/monitors/manage
2. Click **New Monitor**

### Step 2: Choose Monitor Type
- Select type (Metric, Log, Anomaly, etc.)

### Step 3: Configure Detection Method
- Enter metric query
- Set evaluation conditions
- Configure thresholds

### Step 4: Add Notification Message
- Copy message template from above
- Customize with your team's handles
- Add runbook links

### Step 5: Configure Notifications
- Add Slack channel (e.g., `@slack-casperid-alerts`)
- Add PagerDuty for critical alerts
- Add email addresses

### Step 6: Save and Test
- Save monitor
- Click **Test Notifications**
- Verify alerts received

---

## Incident Management Integration

### Auto-Create Incidents for Critical Monitors:

**Monitors that should create incidents:**
1. Monitor 3: Success Rate Degradation → Auto-incident
2. Monitor 5: Fraud Pattern Detection → Security case
3. Monitor 7: PII Leak Detection → P0 incident

**Incident Configuration:**
- **Title Template:** `[{{monitor_name}}] {{status}} - {{value}}`
- **Severity:** Based on monitor priority
- **Assignee:** Oncall engineer from monitor tags
- **Context:** Include recent logs, metrics snapshot, related traces

---

## Testing Your Monitors

### Test Monitor 1 (Low Confidence):
```bash
# Manually set low confidence metric
# (In production, this would come from real AI responses)
curl -X POST "https://api.datadoghq.com/api/v1/series?api_key=$DD_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "series": [{
    "metric": "casperid.gemini.confidence",
    "points": [['"$(date +%s)"', 0.65]],
    "type": "gauge",
    "tags": ["endpoint:verify-kyc"]
  }]
}'
```

### Test Monitor 2 (Cost Spike):
```bash
# Simulate high cost
for i in {1..100}; do
  curl -s http://localhost:3001/api/ai/verify-kyc # Trigger actual AI calls
done
```

---

## Monitor Summary Dashboard

Create a summary widget showing all monitor statuses:

**Widget Configuration:**
```json
{
  "type": "monitor_summary",
  "query": "tag:casperid-api",
  "sort": "status,asc",
  "display_format": "counts_and_list"
}
```

This shows at-a-glance: ✅ 5 OK, ⚠️ 1 Warning, 🚨 1 Critical

---

## Notification Channels Setup

### Slack Integration:
1. Go to https://app.datadoghq.com/account/settings#integrations/slack
2. Add workspace
3. Create channels: `#casperid-alerts`, `#casperid-critical`
4. Use `@slack-casperid-alerts` in monitor messages

### PagerDuty (Optional):
1. Integrate PagerDuty in Datadog settings
2. Create escalation policy
3. Use `@pagerduty` in critical monitors

---

## Success Criteria

✅ All 7 monitors created and enabled  
✅ Test notifications received in Slack  
✅ At least 1 monitor triggered (via test)  
✅ Incident auto-created from critical monitor  
✅ Monitor summary dashboard showing all statuses  

---

## Next: Day 5 (Optional Advanced Features)

Once monitors are working:
- Add anomaly detection for all metrics
- Create composite monitors (multiple conditions)
- Set up SLO tracking (99.9% uptime goal)
- Build runbooks for each alert type

**Ready to create these monitors?** Start with Monitor 1 (Low Confidence) and work through the list! 🚀
