import { jsx as O } from "react/jsx-runtime";
import { useState as V, useRef as y, useEffect as N } from "react";
const q = "casperid_authorization:", x = "casperid_authorization_result:", M = "casperid_authorization_popup:", A = 1800 * 1e3, H = A;
function R(e) {
  let t = "";
  return e.forEach((r) => {
    t += String.fromCharCode(r);
  }), btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function D(e = 32) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), R(t);
}
async function B(e) {
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
  return R(new Uint8Array(t));
}
function P(e) {
  return `${q}${e}`;
}
function T(e) {
  return `${x}${e}`;
}
function U(e) {
  return `${M}${e}`;
}
function E(e, t) {
  try {
    return e.getItem(t);
  } catch {
    return null;
  }
}
function C(e, t, r) {
  try {
    e.setItem(t, r);
  } catch {
  }
}
function v(e, t) {
  try {
    e.removeItem(t);
  } catch {
  }
}
function k(e) {
  if (!e) return null;
  try {
    const t = JSON.parse(e);
    return t.expiresAt && t.expiresAt <= Date.now() ? null : t;
  } catch {
    return null;
  }
}
function J(e) {
  const t = {
    ...e,
    expiresAt: Date.now() + H
  }, r = JSON.stringify(t), i = P(e.state);
  C(sessionStorage, i, r), C(localStorage, i, r);
}
function L(e) {
  const t = P(e), r = k(E(sessionStorage, t));
  if (r) return r;
  v(sessionStorage, t);
  const i = k(E(localStorage, t));
  return i || (v(localStorage, t), null);
}
function F(e) {
  const t = P(e);
  v(sessionStorage, t), v(localStorage, t);
}
function S(e) {
  const t = L(e);
  return F(e), t;
}
function K(e) {
  localStorage.setItem(T(e.state), JSON.stringify(e));
}
function X(e) {
  const t = localStorage.getItem(T(e));
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function I(e) {
  localStorage.removeItem(T(e));
}
function j(e) {
  localStorage.setItem(U(e), "1");
}
function G(e) {
  return localStorage.getItem(U(e)) === "1";
}
function m(e) {
  localStorage.removeItem(U(e));
}
function W() {
  return new URLSearchParams(window.location.search).get("casperid_debug") === "true" || localStorage.getItem("casperid_debug") === "true";
}
const Z = /* @__PURE__ */ W();
function l(...e) {
  Z && console.log("[CasperID SDK DEBUG]", ...e);
}
function Q() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}
async function Y(e) {
  const t = new URL(e.accountUrl || "https://account.casperid.com"), r = e.state || D(), i = D(48), s = await B(i), c = new URL(e.redirectUri).toString();
  return t.pathname = "/authorize", t.search = new URLSearchParams({
    response_type: "code",
    client_id: e.clientId,
    redirect_uri: c,
    state: r,
    code_challenge: s,
    code_challenge_method: "S256"
  }).toString(), J({
    state: r,
    codeVerifier: i,
    redirectUri: c,
    accountOrigin: t.origin
  }), l("buildHostedAuthorizationUrl → url:", t.toString(), "state:", r), { url: t.toString(), state: r };
}
async function ee(e) {
  const t = e.mode === "auto" || !e.mode ? Q() ? "redirect" : "popup" : e.mode, r = await Y(e);
  if (l("authorizeWithCasperID → mode:", t, "authUrl:", r.url), t === "redirect")
    return window.location.assign(r.url), new Promise(() => {
    });
  const i = new URL(r.url);
  i.searchParams.set("response_mode", "web_message"), i.searchParams.set("response_origin", window.location.origin), j(r.state);
  const s = window.open(i.toString(), "casperid_authorization", "popup=yes,width=520,height=720");
  if (!s) {
    if (l("popup was blocked!"), m(r.state), !e.mode || e.mode === "auto")
      return window.location.assign(r.url), new Promise(() => {
      });
    throw S(r.state), new Error("CasperID authorization popup was blocked.");
  }
  const c = s;
  return l("popup opened successfully. popup.closed:", c.closed, "origin:", window.location.origin), new Promise((u, d) => {
    let h = !1;
    const _ = e.timeoutMs ?? A, g = _ > 0 ? window.setTimeout(() => p(new Error("CasperID authorization timed out.")), _) : null;
    let w = 0;
    const $ = window.setInterval(() => {
      w++;
      const o = X(r.state);
      if (o != null && o.error) {
        p(new Error(o.errorDescription || o.error));
        return;
      }
      if (o != null && o.code) {
        l(`tick #${w}: shared result found via localStorage`), p(void 0, o.code, o);
        return;
      }
      c.closed && l(`tick #${w}: popup.closed === true; ignored because opener isolation can sever the reference`);
      try {
        const n = new URL(c.location.href);
        if (l(`tick #${w}: popup URL readable → origin: ${n.origin}, pathname: ${n.pathname}`), n.origin !== window.location.origin)
          return;
        const a = n.searchParams.get("code"), f = n.searchParams.get("state");
        if (l(`tick #${w}: same origin! code=${a}, state=${f}, expected_state=${r.state}`), !a || f !== r.state)
          return;
        p(void 0, a, {
          authorizationStatus: n.searchParams.get("authorization_status") || void 0,
          verificationStatus: n.searchParams.get("verification_status") || void 0,
          grantedTier: n.searchParams.get("granted_tier") || void 0,
          requiredTier: n.searchParams.get("required_tier") || void 0
        });
      } catch {
      }
    }, 500), z = (o) => {
      if (!(o.key !== T(r.state) || !o.newValue))
        try {
          const n = JSON.parse(o.newValue);
          n.state === r.state && (n.error ? p(new Error(n.errorDescription || n.error)) : n.code && p(void 0, n.code, n));
        } catch {
        }
    }, b = (o) => {
      const n = L(r.state);
      if (!n || o.origin !== n.accountOrigin || o.source !== c) return;
      const a = o.data;
      a.type !== "casperid:authorization" || a.state !== r.state || (a.error ? p(new Error(a.error_description || a.error)) : a.code && p(void 0, a.code, a));
    };
    function p(o, n, a = {}) {
      if (h) {
        l("finish called but already settled — skipping");
        return;
      }
      l("finish called — error:", o == null ? void 0 : o.message, "code:", n), h = !0, g !== null && window.clearTimeout(g), window.clearInterval($), window.removeEventListener("storage", z), window.removeEventListener("message", b);
      try {
        c.close();
      } catch {
        l("popup reference is inaccessible due to opener isolation");
      }
      if (o) {
        S(r.state), I(r.state), m(r.state), l("rejecting with:", o.message), d(o);
        return;
      }
      const f = S(r.state);
      if (!f || !n) {
        l("transaction missing or no code — rejecting"), I(r.state), m(r.state), d(new Error("CasperID authorization transaction is missing."));
        return;
      }
      I(r.state), m(r.state), l("resolving successfully"), u({
        code: n,
        state: f.state,
        codeVerifier: f.codeVerifier,
        redirectUri: f.redirectUri,
        authorizationStatus: a.authorizationStatus,
        verificationStatus: a.verificationStatus,
        grantedTier: a.grantedTier,
        requiredTier: a.requiredTier
      });
    }
    window.addEventListener("storage", z), window.addEventListener("message", b);
  });
}
function te(e = window.location.href) {
  const t = new URL(e), r = t.searchParams.get("code"), i = t.searchParams.get("state"), s = t.searchParams.get("error"), c = t.searchParams.get("error_description"), u = {
    authorizationStatus: t.searchParams.get("authorization_status") || void 0,
    verificationStatus: t.searchParams.get("verification_status") || void 0,
    grantedTier: t.searchParams.get("granted_tier") || void 0,
    requiredTier: t.searchParams.get("required_tier") || void 0
  };
  if (!r && !s || !i) return null;
  const d = S(i);
  if (!d) throw new Error("CasperID authorization state is invalid or expired.");
  if (window.opener || G(i))
    return l("popup callback detected; publishing result for opener"), K({ code: r || void 0, state: i, error: s || void 0, errorDescription: c || void 0, ...u }), m(i), window.close(), null;
  if (s) throw new Error(c || s);
  return {
    code: r,
    state: i,
    codeVerifier: d.codeVerifier,
    redirectUri: d.redirectUri,
    authorizationStatus: u.authorizationStatus,
    verificationStatus: u.verificationStatus,
    grantedTier: u.grantedTier,
    requiredTier: u.requiredTier
  };
}
function ie({
  onSuccess: e,
  onError: t,
  children: r = "Continue with CasperID",
  className: i,
  disabled: s,
  id: c,
  ...u
}) {
  const [d, h] = V(!1);
  return /* @__PURE__ */ O("button", { id: c, type: "button", className: i, disabled: s || d, onClick: async () => {
    h(!0);
    try {
      const g = await ee(u);
      e == null || e(g);
    } catch (g) {
      t == null || t(g instanceof Error ? g : new Error("CasperID authorization failed."));
    } finally {
      h(!1);
    }
  }, children: d ? "Opening CasperID..." : r });
}
function ne(e, t) {
  const r = y(!1), i = y(e), s = y(t);
  i.current = e, s.current = t, N(() => {
    var c;
    if (!r.current) {
      r.current = !0;
      try {
        const u = te();
        u && i.current(u);
      } catch (u) {
        (c = s.current) == null || c.call(s, u instanceof Error ? u : new Error("CasperID authorization callback failed."));
      }
    }
  }, []);
}
export {
  ie as CasperIDButton,
  ee as authorizeWithCasperID,
  Y as buildHostedAuthorizationUrl,
  te as consumeHostedAuthorizationCallback,
  ne as useHostedAuthorizationCallback
};
//# sourceMappingURL=index.mjs.map
