// Lightweight client hook for CasperID login events
// Usage: include this script on pages that should accept CasperID login
// <script src="/casperid-client.js" defer></script>

(function () {
  if (typeof window === "undefined") return;

  const SESSION_ENDPOINT = "/api/session/casperid";

  async function establishSession(detail) {
    try {
      await fetch(SESSION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: detail.wallet,
          cnsName: detail.cnsName,
          verified: detail.verified,
          tier: detail.tier,
          requestedData: detail.requestedData || [],
        }),
      });
      window.dispatchEvent(
        new CustomEvent("casperid-session-established", {
          detail: { wallet: detail.wallet, verified: detail.verified, tier: detail.tier },
        })
      );
    } catch (err) {
      console.error("[CasperID] Failed to establish session", err);
    }
  }

  window.addEventListener("casperid-login", (e) => {
    const detail = e.detail || {};
    if (!detail.wallet) {
      console.warn("[CasperID] Login event missing wallet");
      return;
    }
    establishSession(detail);
  });
})();
