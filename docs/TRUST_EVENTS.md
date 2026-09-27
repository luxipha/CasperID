# CasperID Mobility Trust Events

This is the first portable-trust integration contract. It uses generic event
names so later service categories can reuse the same evidence model. It does
not accept routes, fares, product details, written reviews, or other order data.

## Enable an application

In the Business Platform, set the application category to `mobility`, select
the `consumer` and/or `provider` roles, then enable trust events. Sandbox events
are stored for integration testing but never affect a live score. An admin must
separately approve an application before new production events are eligible.
Previously submitted sandbox or unapproved events never become score-eligible
retroactively.

## Share Trust Capacity at sign-in

For a mobility app, separately enable **Request Trust Capacity at sign-in**.
This adds the explicit `read:trust_capacity` consent scope. It requires at
least one supported role and can only be shared from the user's master
CasperID identity, not a persona.

After consent, the signed Business JWT includes only the current, role-aware
result. CasperID never includes event history, evidence, raw review text,
ride references, routes, fares, or product data:

```json
{
  "trust_capacity": {
    "service_category": "mobility",
    "calculated_at": "2026-09-27T12:00:00.000Z",
    "provider": {
      "score": 0,
      "status": "identity_incomplete",
      "identity_readiness": 0,
      "policy_version": "mobility-v1"
    },
    "consumer": {
      "score": 100,
      "status": "active",
      "identity_readiness": 100,
      "policy_version": "mobility-v1"
    }
  }
}
```

`calculated_at` is the score timestamp. Treat the token as a login snapshot;
after a completed trip, rating, or upheld outcome, HeyGO should use the score
returned by `POST /api/trust/events` to refresh its local snapshot. If a score
cannot be calculated, the claim has `status: "unavailable"` and null role
results; HeyGO must not substitute a score.

## Submit an event

`POST /api/trust/events`

Headers:

```text
Content-Type: application/json
X-App-ID: app_...
X-Api-Secret: sk_...
```

Example completed interaction:

```json
{
  "user_id": "user_...",
  "actor_role": "provider",
  "event_type": "interaction.completed",
  "external_event_id": "your-unique-event-id",
  "interaction_reference": "your-internal-ride-id",
  "occurred_at": "2026-09-07T10:00:00.000Z"
}
```

CasperID hashes both external references before storage. Reusing an external
event ID returns `409` instead of counting the event twice.

## Mobility v1 event types

```text
interaction.completed
interaction.cancelled_by_consumer
interaction.cancelled_by_provider
interaction.no_show_by_consumer
interaction.no_show_by_provider
obligation.settled_on_time
obligation.settled_late
obligation.unpaid
safety_violation.upheld
rating.submitted
```

For `rating.submitted`, include a numeric `rating` from 1 to 5 and use the same
interaction reference as a previously verified completed interaction. Written
review text is rejected by design because it is not part of the schema.

```json
{
  "user_id": "user_...",
  "actor_role": "provider",
  "event_type": "rating.submitted",
  "external_event_id": "your-unique-rating-id",
  "interaction_reference": "your-internal-ride-id",
  "rating": 4,
  "occurred_at": "2026-09-07T10:05:00.000Z"
}
```

## User endpoints

Authenticated CasperID users can use:

```text
GET  /api/trust/me?role=consumer
GET  /api/trust/me?role=provider
GET  /api/trust/me/events?role=provider
GET  /api/trust/me/history?role=provider
POST /api/trust/events/:eventId/disputes
```

Submitting a dispute immediately removes the event from scoring while the
dispute is pending. An admin can uphold or reverse it.

## Scoring boundary

```text
Trust Capacity = 100 + (750 × Behaviour Trust)
Behaviour Trust = clamp(Confidence × Evidence − Penalty)
```

A fully verified Layer 3 identity activates the 100-point foundation. Ratings
are capped at 5% of evidence. A missing financial history remains `null` rather
than being interpreted as good or bad. The default mobility policy gates 800
until 24 months and 850 until 36 months.

Admin policy changes must be published under a new version. Published policy
payloads are immutable, and previous versions remain available for audit.
