#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$PROJECT_DIR/server"
FRONTEND_DIR="$PROJECT_DIR/frontend"
RUN_FULL=false

if [[ "${1:-}" == "--full" ]]; then
    RUN_FULL=true
elif [[ -n "${1:-}" ]]; then
    echo "Usage: ./tools/test_trust_system.sh [--full]" >&2
    exit 2
fi

for command_name in node npm python3; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Missing required command: $command_name" >&2
        exit 1
    fi
done

echo "[1/4] Checking trust API and scoring syntax"
node --check "$SERVER_DIR/src/constants/trust.js"
node --check "$SERVER_DIR/src/services/trust-score.js"
node --check "$SERVER_DIR/src/routes/trust.js"
node --check "$SERVER_DIR/src/routes/business.js"

echo "[2/4] Running focused scoring tests"
(
    cd "$SERVER_DIR"
    npm test -- --runInBand src/services/trust-score.test.js
)

echo "[3/4] Validating trust database records"
(
    cd "$SERVER_DIR"
    node <<'NODE'
const {
    BusinessApp,
    TrustEvent,
    TrustScoreSnapshot,
    TrustDispute,
    TrustPolicy
} = require('./src/database/models');

const records = [
    new BusinessApp({
        app_id: 'app_smoke_test',
        owner_user_id: 'user_owner',
        name: 'Trust smoke test',
        api_secret_hash: 'not-a-real-secret',
        service_category: 'mobility',
        supported_roles: ['consumer', 'provider'],
        trust_events_enabled: true,
        trust_event_types: ['interaction.completed']
    }),
    new TrustEvent({
        event_id: 'te_smoke_test',
        app_id: 'app_smoke_test',
        user_id: 'user_test',
        service_category: 'mobility',
        source_environment: 'sandbox',
        score_eligible: false,
        actor_role: 'provider',
        event_type: 'interaction.completed',
        source_event_id: 'hashed-event-reference',
        interaction_reference_hash: 'hashed-interaction-reference',
        policy_version: 'mobility-v1',
        occurred_at: new Date()
    }),
    new TrustScoreSnapshot({
        user_id: 'user_test',
        service_category: 'mobility',
        role: 'provider',
        score: 100,
        identity_readiness: 100,
        evidence_confidence: 0,
        evidence_count: 0,
        history_months: 0,
        duration_cap: 100,
        policy_version: 'mobility-v1'
    }),
    new TrustDispute({
        dispute_id: 'td_smoke_test',
        event_id: 'te_smoke_test',
        user_id: 'user_test',
        reason: 'incorrect_outcome'
    }),
    new TrustPolicy({
        service_category: 'mobility',
        version: 'mobility-v1',
        policy: { version: 'mobility-v1' },
        active: true
    })
];

for (const record of records) {
    const validationError = record.validateSync();
    if (validationError) throw validationError;
}

console.log('All trust schemas accepted safe test records.');
NODE
)

echo "[4/4] Running browser-simulator self-test"
python3 "$SCRIPT_DIR/trust_score_simulator.py" --self-test

if [[ "$RUN_FULL" == true ]]; then
    echo "[full] Building the frontend"
    (
        cd "$FRONTEND_DIR"
        npm run build
    )
fi

echo
echo "Trust system checks passed."
echo "For the visual simulator: python3 tools/trust_score_simulator.py"
echo "Then open http://127.0.0.1:8787"
