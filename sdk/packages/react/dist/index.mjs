import { jsx as R } from "react/jsx-runtime";
import { useState as k, useRef as P, useEffect as L } from "react";
const $ = "casperid_authorization:", A = "casperid_authorization_result:", O = "casperid_authorization_popup:", V = 1800 * 1e3;
function E(e) {
  let t = "";
  return e.forEach((r) => {
    t += String.fromCharCode(r);
  }), btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function z(e = 32) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), E(t);
}
async function q(e) {
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
  return E(new Uint8Array(t));
}
function U(e) {
  return `${$}${e}`;
}
function v(e) {
  return `${A}${e}`;
}
function y(e) {
  return `${O}${e}`;
}
function N(e) {
  sessionStorage.setItem(U(e.state), JSON.stringify(e));
}
function D(e) {
  const t = sessionStorage.getItem(U(e));
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function S(e) {
  const t = D(e);
  return sessionStorage.removeItem(U(e)), t;
}
function H(e) {
  localStorage.setItem(v(e.state), JSON.stringify(e));
}
function M(e) {
  const t = localStorage.getItem(v(e));
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function I(e) {
  localStorage.removeItem(v(e));
}
function x(e) {
  localStorage.setItem(y(e), "1");
}
function B(e) {
  return localStorage.getItem(y(e)) === "1";
}
function m(e) {
  localStorage.removeItem(y(e));
}
function J() {
  return new URLSearchParams(window.location.search).get("casperid_debug") === "true" || localStorage.getItem("casperid_debug") === "true";
}
const F = /* @__PURE__ */ J();
function d(...e) {
  F && console.log("[CasperID SDK DEBUG]", ...e);
}
function K() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}
async function X(e) {
  const t = new URL(e.accountUrl || "https://account.casperid.com"), r = e.state || z(), n = z(48), s = await q(n), c = new URL(e.redirectUri).toString();
  return t.pathname = "/authorize", t.search = new URLSearchParams({
    response_type: "code",
    client_id: e.clientId,
    redirect_uri: c,
    state: r,
    code_challenge: s,
    code_challenge_method: "S256"
  }).toString(), N({
    state: r,
    codeVerifier: n,
    redirectUri: c,
    accountOrigin: t.origin
  }), d("buildHostedAuthorizationUrl → url:", t.toString(), "state:", r), { url: t.toString(), state: r };
}
async function j(e) {
  const t = e.mode === "auto" || !e.mode ? K() ? "redirect" : "popup" : e.mode, r = await X(e);
  if (d("authorizeWithCasperID → mode:", t, "authUrl:", r.url), t === "redirect")
    return window.location.assign(r.url), new Promise(() => {
    });
  const n = new URL(r.url);
  n.searchParams.set("response_mode", "web_message"), n.searchParams.set("response_origin", window.location.origin), x(r.state);
  const s = window.open(n.toString(), "casperid_authorization", "popup=yes,width=520,height=720");
  if (!s) {
    if (d("popup was blocked!"), m(r.state), !e.mode || e.mode === "auto")
      return window.location.assign(r.url), new Promise(() => {
      });
    throw S(r.state), new Error("CasperID authorization popup was blocked.");
  }
  const c = s;
  return d("popup opened successfully. popup.closed:", c.closed, "origin:", window.location.origin), new Promise((u, l) => {
    let h = !1;
    const _ = e.timeoutMs ?? V, g = _ > 0 ? window.setTimeout(() => p(new Error("CasperID authorization timed out.")), _) : null;
    let w = 0;
    const C = window.setInterval(() => {
      w++;
      const o = M(r.state);
      if (o != null && o.error) {
        p(new Error(o.errorDescription || o.error));
        return;
      }
      if (o != null && o.code) {
        d(`tick #${w}: shared result found via localStorage`), p(void 0, o.code, o);
        return;
      }
      c.closed && d(`tick #${w}: popup.closed === true; ignored because opener isolation can sever the reference`);
      try {
        const i = new URL(c.location.href);
        if (d(`tick #${w}: popup URL readable → origin: ${i.origin}, pathname: ${i.pathname}`), i.origin !== window.location.origin)
          return;
        const a = i.searchParams.get("code"), f = i.searchParams.get("state");
        if (d(`tick #${w}: same origin! code=${a}, state=${f}, expected_state=${r.state}`), !a || f !== r.state)
          return;
        p(void 0, a, {
          authorizationStatus: i.searchParams.get("authorization_status") || void 0,
          verificationStatus: i.searchParams.get("verification_status") || void 0,
          grantedTier: i.searchParams.get("granted_tier") || void 0,
          requiredTier: i.searchParams.get("required_tier") || void 0
        });
      } catch {
      }
    }, 500), T = (o) => {
      if (!(o.key !== v(r.state) || !o.newValue))
        try {
          const i = JSON.parse(o.newValue);
          i.state === r.state && (i.error ? p(new Error(i.errorDescription || i.error)) : i.code && p(void 0, i.code, i));
        } catch {
        }
    }, b = (o) => {
      const i = D(r.state);
      if (!i || o.origin !== i.accountOrigin || o.source !== c) return;
      const a = o.data;
      a.type !== "casperid:authorization" || a.state !== r.state || (a.error ? p(new Error(a.error_description || a.error)) : a.code && p(void 0, a.code, a));
    };
    function p(o, i, a = {}) {
      if (h) {
        d("finish called but already settled — skipping");
        return;
      }
      d("finish called — error:", o == null ? void 0 : o.message, "code:", i), h = !0, g !== null && window.clearTimeout(g), window.clearInterval(C), window.removeEventListener("storage", T), window.removeEventListener("message", b);
      try {
        c.close();
      } catch {
        d("popup reference is inaccessible due to opener isolation");
      }
      if (o) {
        S(r.state), I(r.state), m(r.state), d("rejecting with:", o.message), l(o);
        return;
      }
      const f = S(r.state);
      if (!f || !i) {
        d("transaction missing or no code — rejecting"), I(r.state), m(r.state), l(new Error("CasperID authorization transaction is missing."));
        return;
      }
      I(r.state), m(r.state), d("resolving successfully"), u({
        code: i,
        state: f.state,
        codeVerifier: f.codeVerifier,
        redirectUri: f.redirectUri,
        authorizationStatus: a.authorizationStatus,
        verificationStatus: a.verificationStatus,
        grantedTier: a.grantedTier,
        requiredTier: a.requiredTier
      });
    }
    window.addEventListener("storage", T), window.addEventListener("message", b);
  });
}
function G(e = window.location.href) {
  const t = new URL(e), r = t.searchParams.get("code"), n = t.searchParams.get("state"), s = t.searchParams.get("error"), c = t.searchParams.get("error_description"), u = {
    authorizationStatus: t.searchParams.get("authorization_status") || void 0,
    verificationStatus: t.searchParams.get("verification_status") || void 0,
    grantedTier: t.searchParams.get("granted_tier") || void 0,
    requiredTier: t.searchParams.get("required_tier") || void 0
  };
  if (!r && !s || !n) return null;
  const l = S(n);
  if (!l) throw new Error("CasperID authorization state is invalid or expired.");
  if (window.opener || B(n))
    return d("popup callback detected; publishing result for opener"), H({ code: r || void 0, state: n, error: s || void 0, errorDescription: c || void 0, ...u }), m(n), window.close(), null;
  if (s) throw new Error(c || s);
  return {
    code: r,
    state: n,
    codeVerifier: l.codeVerifier,
    redirectUri: l.redirectUri,
    authorizationStatus: u.authorizationStatus,
    verificationStatus: u.verificationStatus,
    grantedTier: u.grantedTier,
    requiredTier: u.requiredTier
  };
}
function Q({
  onSuccess: e,
  onError: t,
  children: r = "Continue with CasperID",
  className: n,
  disabled: s,
  id: c,
  ...u
}) {
  const [l, h] = k(!1);
  return /* @__PURE__ */ R("button", { id: c, type: "button", className: n, disabled: s || l, onClick: async () => {
    h(!0);
    try {
      const g = await j(u);
      e == null || e(g);
    } catch (g) {
      t == null || t(g instanceof Error ? g : new Error("CasperID authorization failed."));
    } finally {
      h(!1);
    }
  }, children: l ? "Opening CasperID..." : r });
}
function Y(e, t) {
  const r = P(!1), n = P(e), s = P(t);
  n.current = e, s.current = t, L(() => {
    var c;
    if (!r.current) {
      r.current = !0;
      try {
        const u = G();
        u && n.current(u);
      } catch (u) {
        (c = s.current) == null || c.call(s, u instanceof Error ? u : new Error("CasperID authorization callback failed."));
      }
    }
  }, []);
}
export {
  Q as CasperIDButton,
  j as authorizeWithCasperID,
  X as buildHostedAuthorizationUrl,
  G as consumeHostedAuthorizationCallback,
  Y as useHostedAuthorizationCallback
};
//# sourceMappingURL=index.mjs.map
