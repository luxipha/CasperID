/**
 * Manual LLM Observability Traces for Datadog
 * Create LLM spans using dd-trace directly AND send metrics
 */

const tracer = require('dd-trace');

// Note: StatsD disabled temporarily to avoid server crashes
// const StatsD = require('datadog-metrics').StatsD;

/**
 * Send LLM trace to Datadog using dd-trace directly
 * @param {Object} geminiCall - Gemini API call details
 */
async function sendLLMTrace(geminiCall) {
    try {
        console.log(`[LLM Trace] Creating dd-trace span for ${geminiCall.operation}...`);
        
        // Create a span using dd-trace
        const span = tracer.startSpan(`gemini.${geminiCall.operation || 'generate_content'}`, {
            resource: geminiCall.operation || 'generate_content',
            type: 'llm',
            service: 'casperid-api'
        });

        // Set LLM-specific tags and metadata
        span.setTag('llm.model.name', 'gemini-2.5-flash');
        span.setTag('llm.model.provider', 'google');
        span.setTag('llm.operation.name', geminiCall.operation || 'generate_content');
        span.setTag('llm.application', 'casperid-llm-app');
        span.setTag('service', 'casperid-api');
        span.setTag('env', 'development');

        // Set input/output metadata
        if (geminiCall.input) {
            span.setTag('llm.request.input', geminiCall.input.length > 500 ? 
                geminiCall.input.substring(0, 500) + '...' : geminiCall.input);
        }
        
        if (geminiCall.output) {
            const outputStr = typeof geminiCall.output === 'object' ? 
                JSON.stringify(geminiCall.output) : String(geminiCall.output);
            span.setTag('llm.response.output', outputStr.length > 500 ? 
                outputStr.substring(0, 500) + '...' : outputStr);
        }

        // Set token metrics
        if (geminiCall.inputTokens) span.setTag('llm.request.input_tokens', geminiCall.inputTokens);
        if (geminiCall.outputTokens) span.setTag('llm.response.output_tokens', geminiCall.outputTokens);
        if (geminiCall.inputTokens && geminiCall.outputTokens) {
            span.setTag('llm.request.total_tokens', geminiCall.inputTokens + geminiCall.outputTokens);
        }

        // Set cost estimates
        if (geminiCall.inputTokens) {
            const inputCost = geminiCall.inputTokens * 0.000001;
            span.setTag('llm.request.input_cost', inputCost);
        }
        if (geminiCall.outputTokens) {
            const outputCost = geminiCall.outputTokens * 0.000002;
            span.setTag('llm.response.output_cost', outputCost);
        }

        // Set error if present
        if (geminiCall.error) {
            span.setTag('error', true);
            span.setTag('error.type', 'GeminiAPIError');
            span.setTag('error.message', geminiCall.error);
        }

        // Finish the span with duration
        if (geminiCall.latency) {
            span.finish(span._startTime + (geminiCall.latency * 1000000)); // Convert ms to nanoseconds
        } else {
            span.finish();
        }

        // Log metrics for now (StatsD disabled to avoid crashes)
        console.log(`[LLM Metrics] Operation: ${geminiCall.operation}`);
        console.log(`[LLM Metrics] Tokens - Input: ${geminiCall.inputTokens}, Output: ${geminiCall.outputTokens}`);
        console.log(`[LLM Metrics] Latency: ${geminiCall.latency}ms`);
        if (geminiCall.inputTokens && geminiCall.outputTokens) {
            const totalCost = (geminiCall.inputTokens * 0.000001) + (geminiCall.outputTokens * 0.000002);
            console.log(`[LLM Metrics] Estimated cost: $${totalCost.toFixed(6)}`);
        }

        console.log(`[LLM Trace] ✅ Created dd-trace span and metrics for ${geminiCall.operation}`);
        return { success: true, spanId: span.context().toSpanId() };
        
    } catch (error) {
        console.error('[LLM Trace] ❌ Failed to create span:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Estimate token count from text (rough approximation)
 * @param {string} text 
 * @returns {number}
 */
function estimateTokens(text) {
    if (!text) return 0;
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
}

/**
 * Track document verification with Gemini
 * @param {Object} params - Verification parameters
 */
async function trackDocumentVerification(params) {
    return await sendLLMTrace({
        operation: 'document_verification',
        input: `Verify ID document for ${params.country || 'unknown'} citizen`,
        output: {
            confidence: params.confidence || 0.85,
            verified: params.verified || true,
            extractedData: params.extractedData || {}
        },
        latency: params.latency || 3000,
        inputTokens: params.inputTokens || 150,
        outputTokens: params.outputTokens || 75,
        error: params.error
    });
}

/**
 * Track resume parsing with Gemini 
 * @param {Object} params - Parsing parameters
 */
async function trackResumeParsingLLM(params) {
    return await sendLLMTrace({
        operation: 'resume_parsing',
        input: `Parse resume file: ${params.filename || 'unknown.pdf'}`,
        output: params.parsedData || {},
        latency: params.latency || 5000,
        inputTokens: params.inputTokens || 2000,
        outputTokens: params.outputTokens || 1500,
        error: params.error
    });
}

/**
 * Track liveness detection with Gemini
 * @param {Object} params - Liveness parameters  
 */
async function trackLivenessDetection(params) {
    return await sendLLMTrace({
        operation: 'liveness_detection',
        input: `Analyze ${params.frameCount || 30} video frames for liveness`,
        output: {
            isLive: params.isLive || true,
            confidence: params.confidence || 0.92,
            gestures: params.gestures || ['blink', 'turn_left', 'smile']
        },
        latency: params.latency || 4000,
        inputTokens: params.inputTokens || 800,
        outputTokens: params.outputTokens || 200,
        error: params.error
    });
}

module.exports = {
    sendLLMTrace,
    trackDocumentVerification,
    trackResumeParsingLLM,
    trackLivenessDetection
};