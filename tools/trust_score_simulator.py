#!/usr/bin/env python3
"""Interactive local simulator for the proposed Casper Trust Capacity formula.

Run:
    python3 tools/trust_score_simulator.py

Then open http://127.0.0.1:8787 in a browser.  This is a modelling aid only:
it is not a production credit-decision engine and does not use user data.
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import asdict, dataclass, replace
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

IDENTITY_FOUNDATION = 100
MAX_SCORE = 850


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


@dataclass(frozen=True)
class SimulationInput:
    reputation: float = 0.75
    cancellations: float = 0.85
    settlement: float = 0.80
    stability: float = 0.70
    reputation_weight: float = 0.15
    cancellation_weight: float = 0.10
    settlement_weight: float = 0.55
    stability_weight: float = 0.20
    verified_interactions: int = 18
    source_diversity: int = 3
    history_months: int = 8
    penalty: float = 0.0
    maturity_constant: float = 30.0
    monthly_verified_interactions: float = 6.0
    minimum_months_to_800: float = 24.0


def number(value: Any, fallback: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def input_from_payload(payload: dict[str, Any]) -> SimulationInput:
    defaults = SimulationInput()
    values = {
        key: number(payload.get(key), getattr(defaults, key))
        for key in asdict(defaults)
        if key not in {"verified_interactions", "source_diversity", "history_months"}
    }
    values["verified_interactions"] = max(0, round(number(payload.get("verified_interactions"), defaults.verified_interactions)))
    values["source_diversity"] = max(0, round(number(payload.get("source_diversity"), defaults.source_diversity)))
    values["history_months"] = max(0, round(number(payload.get("history_months"), defaults.history_months)))
    return SimulationInput(**values)


def calculate(data: SimulationInput) -> dict[str, Any]:
    """Return an explainable score and intermediate components.

    Quality-adjusted history rewards independent sources and time, while the
    confidence curve prevents sparse positive activity from reaching the cap.
    """
    metrics = {
        "reputation": clamp(data.reputation),
        "cancellations": clamp(data.cancellations),
        "settlement": clamp(data.settlement),
        "stability": clamp(data.stability),
    }
    raw_weights = {
        "reputation": max(0.0, data.reputation_weight),
        "cancellations": max(0.0, data.cancellation_weight),
        "settlement": max(0.0, data.settlement_weight),
        "stability": max(0.0, data.stability_weight),
    }
    weight_total = sum(raw_weights.values())
    weights = {key: value / weight_total for key, value in raw_weights.items()} if weight_total else {
        key: 0.25 for key in raw_weights
    }
    evidence = sum(metrics[key] * weights[key] for key in metrics)

    # One source is useful but cannot carry the same weight as independent use.
    diversity_factor = min(1.0, data.source_diversity / 4.0)
    time_factor = min(1.0, data.history_months / 12.0)
    # A high count inside one app over a few days is not equivalent to broad,
    # sustained history. Cap raw volume, then make diversity and time genuine
    # gates on the portion that contributes to maturity.
    usable_volume = min(data.verified_interactions, 250)
    quality_adjusted_history = usable_volume * (0.20 + 0.80 * diversity_factor) * (0.25 + 0.75 * time_factor)
    maturity_constant = max(1.0, data.maturity_constant)
    confidence = 1.0 - math.exp(-quality_adjusted_history / maturity_constant)

    penalty = clamp(data.penalty, 0.0, 0.60)
    behaviour = clamp(confidence * evidence - penalty)

    # Identity readiness is an explicit 100-point foundation, not disguised
    # as a partial credit baseline. The remaining points require behaviour.
    unconstrained_score = IDENTITY_FOUNDATION + 750 * behaviour
    minimum_months = max(1.0, data.minimum_months_to_800)
    if data.history_months < minimum_months:
        duration_cap = IDENTITY_FOUNDATION + 700 * math.sqrt(data.history_months / minimum_months)
    else:
        # After the 800 gate, the final 50 points still need another year of
        # sustained history to avoid an instant jump from 800 to 850.
        duration_cap = min(MAX_SCORE, 800 + 50 * ((data.history_months - minimum_months) / 12.0))
    score = round(min(unconstrained_score, duration_cap))

    if confidence < 0.35:
        confidence_label = "Early evidence"
    elif confidence < 0.70:
        confidence_label = "Developing evidence"
    else:
        confidence_label = "Established evidence"

    reasons = []
    if data.verified_interactions < 30:
        reasons.append("More independently verified completed interactions are needed before the score can approach the ceiling.")
    if data.source_diversity < 3:
        reasons.append("Evidence is concentrated in too few services; one app should not establish broad trust.")
    if data.history_months < 6:
        reasons.append("The history is still short. Time helps distinguish consistency from a brief positive streak.")
    if data.history_months < minimum_months and unconstrained_score >= duration_cap:
        reasons.append(f"The score is time-gated at {round(duration_cap)}. Under this policy, 800 cannot be reached before {round(minimum_months)} months of sustained history.")
    if penalty > 0:
        reasons.append("The penalty is applied only for upheld, attributable adverse events; it should be removable through a dispute process if wrong.")
    if score >= MAX_SCORE:
        reasons.append("The score is capped at 850. Further positive evidence increases confidence and partner-specific eligibility, not the numeric cap.")
    if not reasons:
        reasons.append("This result has broad, sustained positive evidence. A partner must still apply its own exposure and eligibility rules.")

    return {
        "score": score,
        "behaviour": round(behaviour, 4),
        "evidence": round(evidence, 4),
        "confidence": round(confidence, 4),
        "confidence_label": confidence_label,
        "quality_adjusted_history": round(quality_adjusted_history, 2),
        "duration_cap": round(duration_cap),
        "weights": {key: round(value, 4) for key, value in weights.items()},
        "weight_total": round(weight_total, 4),
        "reasons": reasons,
    }


def simulate(data: SimulationInput) -> dict[str, Any]:
    result = calculate(data)
    target = 800
    projected = None
    target_reason = ""
    maximum_possible = IDENTITY_FOUNDATION + 750 * clamp(result["evidence"] - clamp(data.penalty, 0.0, 0.60))
    if maximum_possible < target:
        target_reason = "With these metric values and penalty, 800 is not reachable. Improve the underlying evidence; waiting alone will not solve it."
    else:
        for added_months in range(0, 121):
            future = replace(
                data,
                history_months=data.history_months + added_months,
                verified_interactions=round(data.verified_interactions + data.monthly_verified_interactions * added_months),
            )
            if calculate(future)["score"] >= target:
                projected = added_months
                break
        if projected is None:
            target_reason = "800 is not reachable within the next 10 years under these assumptions."
        elif projected == 0:
            target_reason = "The current evidence already reaches 800."
        else:
            target_reason = f"At the current quality and {data.monthly_verified_interactions:g} verified interactions per month, 800 is projected in about {projected} more months."
    result["months_to_800"] = projected
    result["target_reason"] = target_reason
    result["maximum_possible"] = round(maximum_possible)
    return result


PAGE = r'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Casper Trust Capacity Simulator</title>
<style>
:root{--ink:#172033;--muted:#63708a;--line:#dbe3ef;--paper:#f5f8fc;--card:#fff;--accent:#635bff;--good:#07875f;--warn:#d36a10}*{box-sizing:border-box}body{margin:0;background:var(--paper);font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:var(--ink)}main{max-width:1200px;margin:auto;padding:42px 24px 60px}h1{font-size:clamp(28px,5vw,46px);margin:0 0 10px;letter-spacing:-1.6px}.lead{margin:0;color:var(--muted);font-size:17px;max-width:760px}.notice{border-left:4px solid var(--accent);background:#eeefff;padding:13px 15px;margin:26px 0;border-radius:7px;color:#363276}.grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(330px,.75fr);gap:22px}.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 8px 24px #31436b0b}h2{font-size:18px;margin:0 0 18px}h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:25px 0 12px}.field{display:grid;grid-template-columns:190px 1fr 58px;gap:12px;align-items:center;margin:13px 0}.field label{font-size:14px}.field output{font-variant-numeric:tabular-nums;text-align:right;color:var(--muted)}input[type=range]{width:100%;accent-color:var(--accent)}.presets{display:flex;gap:8px;flex-wrap:wrap}.presets button,button{border:1px solid #cfd7e7;border-radius:8px;background:#fff;color:var(--ink);padding:8px 11px;cursor:pointer;font:inherit;font-size:13px}.presets button:hover{border-color:var(--accent);color:var(--accent)}.score{font-size:72px;font-weight:750;letter-spacing:-4px;line-height:1;margin:12px 0 2px}.score small{font-size:19px;letter-spacing:0;color:var(--muted)}.band{font-weight:650;color:var(--good);margin:9px 0 25px}.meter{height:12px;background:#e8edf5;border-radius:999px;overflow:hidden}.meter>i{display:block;height:100%;background:linear-gradient(90deg,#635bff,#1bbf91);border-radius:inherit;transition:width .2s}.stat{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:12px 0;font-size:14px}.stat b{font-variant-numeric:tabular-nums}.formula{background:#121a2a;color:#dce6ff;border-radius:10px;padding:15px;font:13px ui-monospace,SFMono-Regular,monospace;line-height:1.65;overflow:auto}.reasons{padding-left:19px;color:var(--muted);font-size:14px;line-height:1.55}.foot{color:var(--muted);font-size:12px;margin-top:18px;line-height:1.5}@media(max-width:820px){main{padding:27px 16px}.grid{grid-template-columns:1fr}.field{grid-template-columns:145px 1fr 51px}.score{font-size:62px}}
</style></head><body><main>
<h1>Trust Capacity Simulator</h1><p class="lead">Explore why a person should need credible, sustained evidence—not simply many apps—to approach 850.</p>
<p class="notice">Identity readiness is a fixed 100-point foundation. Experimental model only: it does not make credit decisions and must not be connected to live user data or partner limits.</p>
<div class="grid"><section class="card"><h2>Evidence quality and weights</h2><div class="presets"><button data-preset="new">New verified user</button><button data-preset="good">Strong history</button><button data-preset="farm">App-farming attempt</button><button data-preset="adverse">Confirmed adverse event</button></div><div id="fields"></div></section>
<aside class="card"><h2>Simulated result</h2><div class="score" id="score">— <small>/ 850</small></div><div class="band" id="band">Calculating…</div><div class="meter"><i id="scoreMeter"></i></div><div class="stat"><span>Identity readiness</span><b>100 / 100</b></div><div class="stat"><span>Weighted evidence</span><b id="evidence">—</b></div><div class="stat"><span>Evidence confidence</span><b id="confidence">—</b></div><div class="stat"><span>Quality-adjusted history</span><b id="history">—</b></div><div class="stat"><span>800 projection</span><b id="projection">—</b></div><div class="stat"><span>Weight total</span><b id="weightTotal">—</b></div><h3>Formula</h3><div class="formula">Behaviour = clamp(Confidence × Evidence − Penalty)<br>Score = 100 + (750 × Behaviour)<br>Time gate: no score of 800 before the policy duration<br>Score = min(calculated score, time gate)</div><h3>What limits this result</h3><ul class="reasons" id="reasons"></ul><p class="foot">Weights are automatically normalized for this experiment. In a real financial model they must be learned and validated against actual repayment outcomes, with appeal and human-review safeguards.</p></aside></div></main>
<script>
const specs=[
['reputation','Service reputation',0,1,.01],['cancellations','Attributable completion rate',0,1,.01],['settlement','Settlement / repayment reliability',0,1,.01],['stability','Verified activity stability',0,1,.01],
['reputation_weight','Reputation weight',0,1,.01],['cancellation_weight','Completion weight',0,1,.01],['settlement_weight','Settlement weight',0,1,.01],['stability_weight','Stability weight',0,1,.01],
['verified_interactions','Verified completed interactions',0,300,1],['source_diversity','Independent services',0,8,1],['history_months','History length (months)',0,60,1],['monthly_verified_interactions','Future verified interactions / month',0,30,1],['minimum_months_to_800','Minimum months before 800',6,60,1],['penalty','Upheld adverse-event penalty',0,.6,.01],['maturity_constant','Evidence needed for maturity (k)',5,80,1]
];
let state={reputation:.75,cancellations:.85,settlement:.8,stability:.7,reputation_weight:.15,cancellation_weight:.1,settlement_weight:.55,stability_weight:.2,verified_interactions:18,source_diversity:3,history_months:8,monthly_verified_interactions:6,minimum_months_to_800:24,penalty:0,maturity_constant:30};
const fields=document.querySelector('#fields');let section='';
specs.forEach((s,i)=>{const group=i===0?'Metrics (each normalized 0–1)':i===4?'Weights (automatically normalized)':i===8?'History and time-to-800 policy':'';if(group)section+=`<h3>${group}</h3>`;section+=`<div class="field"><label for="${s[0]}">${s[1]}</label><input id="${s[0]}" type="range" min="${s[2]}" max="${s[3]}" step="${s[4]}" value="${state[s[0]]}"><output id="${s[0]}Value"></output></div>`});fields.innerHTML=section;
function show(v){return Number.isInteger(+v)?v:(+v).toFixed(2)}
async function update(){specs.forEach(s=>{document.querySelector('#'+s[0]+'Value').textContent=show(state[s[0]])});const res=await fetch('/api/simulate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)});const d=await res.json();document.querySelector('#score').innerHTML=`${d.score} <small>/ 850</small>`;document.querySelector('#band').textContent=d.confidence_label;document.querySelector('#scoreMeter').style.width=((d.score-100)/750*100)+'%';document.querySelector('#evidence').textContent=d.evidence.toFixed(2)+' / 1.00';document.querySelector('#confidence').textContent=(d.confidence*100).toFixed(0)+'%';document.querySelector('#history').textContent=d.quality_adjusted_history;document.querySelector('#projection').textContent=d.months_to_800===null?'Not reachable':d.months_to_800===0?'Already 800':`~${d.months_to_800} months`;document.querySelector('#weightTotal').textContent=d.weight_total.toFixed(2)+' → 1.00';document.querySelector('#reasons').innerHTML=[...d.reasons,d.target_reason].map(x=>`<li>${x}</li>`).join('')}
specs.forEach(s=>document.querySelector('#'+s[0]).addEventListener('input',e=>{state[s[0]]=+e.target.value;update()}));
const presets={new:{verified_interactions:0,source_diversity:0,history_months:0,reputation:.5,cancellations:.5,settlement:.5,stability:.5,penalty:0},good:{verified_interactions:72,source_diversity:5,history_months:18,reputation:.9,cancellations:.95,settlement:.96,stability:.88,penalty:0},farm:{verified_interactions:100,source_diversity:1,history_months:1,reputation:1,cancellations:1,settlement:1,stability:.7,penalty:0},adverse:{verified_interactions:60,source_diversity:4,history_months:16,reputation:.88,cancellations:.9,settlement:.78,stability:.8,penalty:.18}};
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state={...state,...presets[b.dataset.preset]};specs.forEach(s=>document.querySelector('#'+s[0]).value=state[s[0]]);update()});update();
</script></body></html>'''


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")

    def send_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path not in {"/", "/index.html"}:
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        body = PAGE.encode()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/simulate":
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size > 20_000:
                raise ValueError("Request is too large")
            payload = json.loads(self.rfile.read(size) or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("Expected a JSON object")
            self.send_json(simulate(input_from_payload(payload)))
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)


def self_test() -> None:
    empty = simulate(SimulationInput(verified_interactions=0, source_diversity=0, history_months=0))
    established = simulate(SimulationInput(verified_interactions=100, source_diversity=5, history_months=18, reputation=.95, cancellations=.96, settlement=.97, stability=.92))
    farmed = simulate(SimulationInput(verified_interactions=100, source_diversity=1, history_months=1, reputation=1, cancellations=1, settlement=1, stability=.7))
    assert IDENTITY_FOUNDATION <= empty["score"] <= MAX_SCORE
    assert established["score"] > farmed["score"], "diverse long-term evidence should outperform app farming"
    assert established["score"] <= MAX_SCORE
    print("Self-test passed")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the local Trust Capacity simulator")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Trust Capacity simulator running at http://127.0.0.1:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
