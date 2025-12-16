# Datadog Configuration for CasperID

## Required Environment Variables

Add these to `server/.env`:

```env
# Datadog Configuration
DD_API_KEY=your-datadog-api-key-here
DD_SITE=datadoghq.com
DD_SERVICE=casperid-api
DD_ENV=development
DD_VERSION=1.0.0

# Optional: Enhanced monitoring
DD_LOGS_INJECTION=true
DD_TRACE_ANALYTICS_ENABLED=true
DD_RUNTIME_METRICS_ENABLED=true
DD_PROFILING_ENABLED=true
```

## Getting Your Datadog API Key

1. Go to https://app.datadoghq.com/signup (or datadoghq.eu for EU)
2. Create a free trial account
3. Navigate to: **Organization Settings → API Keys**
4. Click **New Key** or copy existing key
5. Add to your `.env` file

## Verification

Once you start the server with the DD_API_KEY configured:

1. Server will automatically send traces to Datadog
2. Wait 1-2 minutes for data to appear
3. Check https://app.datadoghq.com/apm/traces
4. You should see `casperid-api` service

## What's Automatically Instrumented

With `dd-trace` initialized, these are automatically tracked:

### HTTP Requests
- All Express routes (`/api/*`)
- Request latency (P50, P95, P99)
- Status codes
- Error rates

### Database
- MongoDB queries
- Query latency
- Connection pool metrics

### Runtime
- CPU usage
- Memory usage
- Garbage collection
- Event loop lag

## Next Steps

1. Get Datadog API key
2. Add to `.env`
3. Restart server: `npm run dev`
4. Verify traces in Datadog UI
5. Move to Day 2: Custom instrumentation for AI endpoints

## Useful Datadog Links

- APM Traces: https://app.datadoghq.com/apm/traces
- Service Map: https://app.datadoghq.com/apm/map
- Metrics Explorer: https://app.datadoghq.com/metric/explorer
- Dashboards: https://app.datadoghq.com/dashboard/lists
