import { jsx as V } from "react/jsx-runtime";
import { useState as F, useRef as T, useEffect as N } from "react";
const q = "casperid_authorization:", M = "casperid_authorization_result:", H = "casperid_authorization_popup:", D = 1800 * 1e3, J = D;
function R(e) {
  if (!e) return;
  const t = e.split(",").map((r) => r.trim()).filter(Boolean);
  return t.length ? t : void 0;
}
function L(e) {
  const t = e.searchParams.get("selected_context_type");
  if (t !== "master" && t !== "persona") return;
  const r = e.searchParams.get("selected_context_did") || void 0, o = e.searchParams.get("selected_context_alias") || void 0, s = e.searchParams.get("selected_context_name") || void 0, c = e.searchParams.get("selected_context_category") || void 0;
  return { type: t, did: r, alias: o, context: c, name: s };
}
function O(e) {
  let t = "";
  return e.forEach((r) => {
    t += String.fromCharCode(r);
  }), btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function x(e = 32) {
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), O(t);
}
async function B(e) {
  const t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
  return O(new Uint8Array(t));
}
function I(e) {
  return `${q}${e}`;
}
function _(e) {
  return `${M}${e}`;
}
function z(e) {
  return `${H}${e}`;
}
function E(e, t) {
  try {
    return e.getItem(t);
  } catch {
    return null;
  }
}
function b(e, t, r) {
  try {
    e.setItem(t, r);
  } catch {
  }
}
function S(e, t) {
  try {
    e.removeItem(t);
  } catch {
  }
}
function A(e) {
  if (!e) return null;
  try {
    const t = JSON.parse(e);
    return t.expiresAt && t.expiresAt <= Date.now() ? null : t;
  } catch {
    return null;
  }
}
function K(e) {
  const t = {
    ...e,
    expiresAt: Date.now() + J
  }, r = JSON.stringify(t), o = I(e.state);
  b(sessionStorage, o, r), b(localStorage, o, r);
}
function k(e) {
  const t = I(e), r = A(E(sessionStorage, t));
  if (r) return r;
  S(sessionStorage, t);
  const o = A(E(localStorage, t));
  return o || (S(localStorage, t), null);
}
function X(e) {
  const t = I(e);
  S(sessionStorage, t), S(localStorage, t);
}
function w(e) {
  const t = k(e);
  return X(e), t;
}
function W(e) {
  localStorage.setItem(_(e.state), JSON.stringify(e));
}
function j(e) {
  const t = localStorage.getItem(_(e));
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function y(e) {
  localStorage.removeItem(_(e));
}
function Z(e) {
  localStorage.setItem(z(e), "1");
}
function G(e) {
  return localStorage.getItem(z(e)) === "1";
}
function m(e) {
  localStorage.removeItem(z(e));
}
function h(...e) {
}
function Q() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}
async function Y(e) {
  const t = new URL(e.accountUrl || "https://account.casperid.com"), r = e.state || x(), o = x(48), s = await B(o), c = new URL(e.redirectUri).toString();
  return t.pathname = "/authorize", t.search = new URLSearchParams({
    response_type: "code",
    client_id: e.clientId,
    redirect_uri: c,
    state: r,
    code_challenge: s,
    code_challenge_method: "S256"
  }).toString(), K({
    state: r,
    codeVerifier: o,
    redirectUri: c,
    accountOrigin: t.origin
  }), h("buildHostedAuthorizationUrl → url:", t.toString(), "state:", r), { url: t.toString(), state: r };
}
async function ee(e) {
  const t = e.mode === "auto" || !e.mode ? Q() ? "redirect" : "popup" : e.mode, r = await Y(e);
  if (h("authorizeWithCasperID → mode:", t, "authUrl:", r.url), t === "redirect")
    return window.location.assign(r.url), new Promise(() => {
    });
  const o = new URL(r.url);
  o.searchParams.set("response_mode", "web_message"), o.searchParams.set("response_origin", window.location.origin), Z(r.state);
  const s = window.open(o.toString(), "casperid_authorization", "popup=yes,width=520,height=720");
  if (!s) {
    if (m(r.state), !e.mode || e.mode === "auto")
      return window.location.assign(r.url), new Promise(() => {
      });
    throw w(r.state), new Error("CasperID authorization popup was blocked.");
  }
  const c = s;
  return h("popup opened successfully. popup.closed:", c.closed, "origin:", window.location.origin), new Promise((u, d) => {
    let p = !1;
    const v = e.timeoutMs ?? D, f = v > 0 ? window.setTimeout(() => l(new Error("CasperID authorization timed out.")), v) : null;
    let P = 0;
    const $ = window.setInterval(() => {
      P++;
      const a = j(r.state);
      if (a != null && a.error) {
        l(new Error(a.errorDescription || a.error));
        return;
      }
      if (a != null && a.code) {
        l(void 0, a.code, a);
        return;
      }
      c.closed;
      try {
        const n = new URL(c.location.href);
        if (h(`tick #${P}: popup URL readable → origin: ${n.origin}, pathname: ${n.pathname}`), n.origin !== window.location.origin)
          return;
        const i = n.searchParams.get("code"), g = n.searchParams.get("state");
        if (h(`tick #${P}: same origin! code=${i}, state=${g}, expected_state=${r.state}`), !i || g !== r.state)
          return;
        l(void 0, i, {
          authorizationStatus: n.searchParams.get("authorization_status") || void 0,
          verificationStatus: n.searchParams.get("verification_status") || void 0,
          grantedTier: n.searchParams.get("granted_tier") || void 0,
          requiredTier: n.searchParams.get("required_tier") || void 0,
          sharedFields: R(n.searchParams.get("shared_fields")),
          selectedContext: L(n)
        });
      } catch {
      }
    }, 500), U = (a) => {
      if (!(a.key !== _(r.state) || !a.newValue))
        try {
          const n = JSON.parse(a.newValue);
          n.state === r.state && (n.error ? l(new Error(n.errorDescription || n.error)) : n.code && l(void 0, n.code, n));
        } catch {
        }
    }, C = (a) => {
      const n = k(r.state);
      if (!n || a.origin !== n.accountOrigin || a.source !== c) return;
      const i = a.data;
      i.type !== "casperid:authorization" || i.state !== r.state || (i.error ? l(new Error(i.error_description || i.error)) : i.code && l(void 0, i.code, i));
    };
    function l(a, n, i = {}) {
      if (p)
        return;
      h("finish called — error:", a == null ? void 0 : a.message, "code:", n), p = !0, f !== null && window.clearTimeout(f), window.clearInterval($), window.removeEventListener("storage", U), window.removeEventListener("message", C);
      try {
        c.close();
      } catch {
      }
      if (a) {
        w(r.state), y(r.state), m(r.state), h("rejecting with:", a.message), d(a);
        return;
      }
      const g = w(r.state);
      if (!g || !n) {
        y(r.state), m(r.state), d(new Error("CasperID authorization transaction is missing."));
        return;
      }
      y(r.state), m(r.state), u({
        code: n,
        state: g.state,
        codeVerifier: g.codeVerifier,
        redirectUri: g.redirectUri,
        authorizationStatus: i.authorizationStatus,
        verificationStatus: i.verificationStatus,
        grantedTier: i.grantedTier,
        requiredTier: i.requiredTier,
        sharedFields: i.sharedFields,
        selectedContext: i.selectedContext
      });
    }
    window.addEventListener("storage", U), window.addEventListener("message", C);
  });
}
function te(e = window.location.href) {
  const t = new URL(e), r = t.searchParams.get("code"), o = t.searchParams.get("state"), s = t.searchParams.get("error"), c = t.searchParams.get("error_description"), u = {
    authorizationStatus: t.searchParams.get("authorization_status") || void 0,
    verificationStatus: t.searchParams.get("verification_status") || void 0,
    grantedTier: t.searchParams.get("granted_tier") || void 0,
    requiredTier: t.searchParams.get("required_tier") || void 0,
    sharedFields: R(t.searchParams.get("shared_fields")),
    selectedContext: L(t)
  };
  if (!r && !s || !o) return null;
  const d = w(o);
  if (!d) throw new Error("CasperID authorization state is invalid or expired.");
  if (window.opener || G(o))
    return W({ code: r || void 0, state: o, error: s || void 0, errorDescription: c || void 0, ...u }), m(o), window.close(), null;
  if (s) throw new Error(c || s);
  return {
    code: r,
    state: o,
    codeVerifier: d.codeVerifier,
    redirectUri: d.redirectUri,
    authorizationStatus: u.authorizationStatus,
    verificationStatus: u.verificationStatus,
    grantedTier: u.grantedTier,
    requiredTier: u.requiredTier,
    sharedFields: u.sharedFields,
    selectedContext: u.selectedContext
  };
}
function ne({
  onSuccess: e,
  onError: t,
  children: r = "Continue with CasperID",
  className: o,
  disabled: s,
  id: c,
  ...u
}) {
  const [d, p] = F(!1);
  return /* @__PURE__ */ V("button", { id: c, type: "button", className: o, disabled: s || d, onClick: async () => {
    p(!0);
    try {
      const f = await ee(u);
      e == null || e(f);
    } catch (f) {
      t == null || t(f instanceof Error ? f : new Error("CasperID authorization failed."));
    } finally {
      p(!1);
    }
  }, children: d ? "Opening CasperID..." : r });
}
function ae(e, t) {
  const r = T(!1), o = T(e), s = T(t);
  o.current = e, s.current = t, N(() => {
    var c;
    if (!r.current) {
      r.current = !0;
      try {
        const u = te();
        u && o.current(u);
      } catch (u) {
        (c = s.current) == null || c.call(s, u instanceof Error ? u : new Error("CasperID authorization callback failed."));
      }
    }
  }, []);
}
export {
  ne as CasperIDButton,
  ee as authorizeWithCasperID,
  Y as buildHostedAuthorizationUrl,
  te as consumeHostedAuthorizationCallback,
  ae as useHostedAuthorizationCallback
};
//# sourceMappingURL=index.mjs.map
