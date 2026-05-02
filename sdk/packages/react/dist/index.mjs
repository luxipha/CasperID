import { jsx as e, jsxs as i, Fragment as re } from "react/jsx-runtime";
import _t, { forwardRef as Ze, createElement as je, useState as y, useEffect as ce, useCallback as J, useRef as se } from "react";
import { motion as P, AnimatePresence as Me } from "framer-motion";
const He = ({ children: r, className: a = "", theme: n = "" }) => (
  // Destructure theme and provide default
  /* @__PURE__ */ e(
    "div",
    {
      className: `glass-container relative w-full h-full rounded-[var(--casperid-radius,1.5rem)] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${a} ${n}`,
      children: r
    }
  )
);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yt = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Xe = (...r) => r.filter((a, n, l) => !!a && l.indexOf(a) === n).join(" ");
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var xt = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gt = Ze(
  ({
    color: r = "currentColor",
    size: a = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: l,
    className: N = "",
    children: p,
    iconNode: f,
    ...m
  }, s) => je(
    "svg",
    {
      ref: s,
      ...xt,
      width: a,
      height: a,
      stroke: r,
      strokeWidth: l ? Number(n) * 24 / Number(a) : n,
      className: Xe("lucide", N),
      ...m
    },
    [
      ...f.map(([c, d]) => je(c, d)),
      ...Array.isArray(p) ? p : [p]
    ]
  )
);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const j = (r, a) => {
  const n = Ze(
    ({ className: l, ...N }, p) => je(gt, {
      ref: p,
      iconNode: a,
      className: Xe(`lucide-${yt(r)}`, l),
      ...N
    })
  );
  return n.displayName = `${r}`, n;
};
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = j("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fe = j("BadgeCheck", [
  [
    "path",
    {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      key: "3c2336"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vt = j("Calendar", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wt = j("Camera", [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Le = j("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ve = j("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ce = j("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kt = j("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qe = j("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nt = j("Delete", [
  ["path", { d: "M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z", key: "1oy587" }],
  ["line", { x1: "18", x2: "12", y1: "9", y2: "15", key: "1olkx5" }],
  ["line", { x1: "12", x2: "18", y1: "9", y2: "15", key: "1n50pc" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ie = j("Fingerprint", [
  ["path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4", key: "1nerag" }],
  ["path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88", key: "o46ks0" }],
  ["path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02", key: "ptglia" }],
  ["path", { d: "M2 12a10 10 0 0 1 18-6", key: "ydlgp0" }],
  ["path", { d: "M2 16h.01", key: "1gqxmh" }],
  ["path", { d: "M21.8 16c.2-2 .131-5.354 0-6", key: "drycrb" }],
  ["path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2", key: "1tidbn" }],
  ["path", { d: "M8.65 22c.21-.66.45-1.32.57-2", key: "13wd9y" }],
  ["path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2", key: "1fr1j5" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const It = j("Flashlight", [
  [
    "path",
    {
      d: "M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z",
      key: "1orkel"
    }
  ],
  ["line", { x1: "6", x2: "18", y1: "6", y2: "6", key: "1z11jq" }],
  ["line", { x1: "12", x2: "12", y1: "12", y2: "12", key: "1f4yc1" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const et = j("Globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ct = j("Key", [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _e = j("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tt = j("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const St = j("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Et = j("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const At = j("Network", [
  ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }],
  ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }],
  ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }],
  ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }],
  ["path", { d: "M12 12V8", key: "2874zd" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dt = j("Puzzle", [
  [
    "path",
    {
      d: "M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z",
      key: "i0oyt7"
    }
  ]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Te = j("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rt = j("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Se = j("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const it = j("Shield", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qe = j("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pt = j("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tt = j("Sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zt = j("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vt = j("Wallet", [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jt = j("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), We = ({
  onClose: r,
  title: a = "CasperID",
  subtitle: n = "SECURE SDK",
  showClose: l = !0,
  theme: N,
  toggleTheme: p,
  logoUrl: f
}) => /* @__PURE__ */ i("header", { className: "flex items-center justify-between px-6 pt-8 pb-4 relative z-20", children: [
  /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ e("div", { className: "p-2 bg-brand rounded-xl flex items-center justify-center shadow-brand", children: f ? /* @__PURE__ */ e("img", { src: f, alt: a, className: "w-5 h-5 object-contain" }) : /* @__PURE__ */ e(it, { className: "text-white w-5 h-5" }) }),
    /* @__PURE__ */ i("div", { children: [
      /* @__PURE__ */ e("h2", { className: "text-lg font-bold tracking-tight text-main", children: a }),
      n && /* @__PURE__ */ e("p", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: n })
    ] })
  ] }),
  /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: p,
        className: "p-2 dark:hover:bg-slate-200 dark:bg-white/10 hover:bg-slate-200/50 rounded-xl transition-colors text-muted",
        "aria-label": "Toggle theme",
        children: N === "dark" ? /* @__PURE__ */ e(Tt, { className: "w-5 h-5" }) : /* @__PURE__ */ e(Et, { className: "w-5 h-5" })
      }
    ),
    l && /* @__PURE__ */ e(
      "button",
      {
        onClick: r,
        className: "p-2 dark:hover:bg-slate-200 dark:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted",
        "aria-label": "Close",
        children: /* @__PURE__ */ e(jt, { className: "w-5 h-5" })
      }
    )
  ] })
] }), Ye = ({ children: r }) => /* @__PURE__ */ e("footer", { className: "p-8 text-center relative z-20", children: r }), Ve = {
  EN: {
    welcome_back: "Welcome back",
    enter_email: "Enter your email to receive a verification code.",
    email_address: "Email Address",
    continue: "Continue",
    sending_code: "Sending Code...",
    verify_email: "Verify Email",
    enter_code: "Enter the 6-digit code sent to",
    verification_failed: "Verification Failed",
    verifying: "Verifying...",
    resend_code: "Resend Code",
    resend_in: "Resend in",
    secure_sdk: "SECURE SDK",
    permission_request: "PERMISSION REQUEST",
    review_data: "Review Data",
    mint_identity: "Mint Identity",
    face_scan: "Face Scan",
    document_scan: "Document Scan",
    verification_step: "VERIFICATION STEP",
    kyc_required: "KYC REQUIRED",
    security_upgrade_required: "Security Upgrade Required",
    security_upgrade_desc: "Your account requires a biometric security upgrade to perform this action.",
    biometric_secure: "BIOMETRIC SECURE",
    zero_knowledge: "ZERO KNOWLEDGE",
    start_upgrade: "Start Upgrade",
    do_this_later: "I'll do this later",
    sign_in_with_extension: "Sign in with Extension",
    sign_in_with_otp: "Sign in with OTP",
    extension_detected: "Extension Detected",
    secure_wallet: "Secure Wallet",
    fully_audited: "FULLY AUDITED",
    non_custodial: "NON-CUSTODIAL",
    verify_identity: "Verify Your Identity",
    choose_document: "Choose a document type to begin verification.",
    passport: "Passport",
    drivers_license: "Driver License",
    national_id: "ID Card",
    passport_desc: "All countries supported",
    drivers_license_desc: "Government issued card",
    national_id_desc: "National identity document",
    position_face: "Position your face in the frame",
    blink_slowly: "Blink slowly",
    turn_head_left: "Turn your head slowly to the left",
    turn_head_right: "Turn your head slowly to the right",
    processing: "Processing...",
    camera_permission_denied: "Camera permission denied",
    unable_access_camera: "Unable to access camera",
    live_camera: "LIVE CAMERA",
    initializing: "INITIALIZING",
    processing_verification: "Processing Verification...",
    processing_liveness: "Verifying Liveness...",
    processing_documents: "Processing Documents...",
    processing_subtitle: "Validating your documents and biometrics",
    minting_identity: "Minting your Identity...",
    minting_subtitle: "Securing your decentralized identity on the Casper Network",
    identity_minted: "Identity Minted!",
    minted_subtitle: "Your CasperID has been successfully created",
    verification_failed_subtitle: "There was an issue with your verification",
    try_again: "Try Again",
    credential_hash: "Credential Hash",
    identity_verified: "Identity Verified",
    identity_verified_subtitle: "Your liveness check passed. You are now verified.",
    identity_verified_desc: "Your CasperID has been successfully authenticated on the Casper blockchain. You're ready to go.",
    submitting_for_review: "Submitting for Review...",
    submitting_review_subtitle: "Your documents are being prepared for verification",
    verification_submitted: "Verification Submitted",
    verification_submitted_subtitle: "Your documents are under review. You'll be notified once verified.",
    share_data_consent: "Share Data Consent",
    authorize_dapps: "Authorize dApps to access your credentials",
    return_to_app: "Return to App",
    verify_data_desc: "Verify your extracted identity information. This data will be used to mint your CasperID.",
    ocr_confidence: "OCR Confidence",
    first_name: "First Name",
    last_name: "Last Name",
    document_number: "Document Number",
    date_of_birth: "Date of Birth",
    nationality: "Nationality",
    enter_first_name: "Enter first name",
    enter_last_name: "Enter last name",
    enter_nationality: "Enter nationality",
    scanned_successfully: "Scanned Successfully",
    secured_by_casper: "Secured by CasperID Protocol.",
    confirm_mint: "Confirm & Mint",
    submitting: "Submitting...",
    retake_photo: "Retake Photo",
    auth_subtitle: "Secure your Web3 identity with our premium authentication layer.",
    extension_connect_msg: "Click the CasperID extension icon in your browser to connect.",
    extension_not_detected: "CasperID extension not detected. Please install the extension or use OTP sign-in.",
    connecting: "Connecting...",
    two_factor_auth: "Two-Factor Auth",
    security_notice: "Your data is encrypted and never stored on central servers. Powered by Casper Network.",
    e2e_encrypted: "End-to-End Encrypted",
    error_email_required: "Please enter your email",
    error_invalid_email: "Please enter a valid email address",
    error_passkey_registered: "You have a passkey registered. Please use extension sign-in.",
    error_send_code_failed: "Failed to send verification code. Please try again.",
    error_connection_failed: "Unable to connect. Please check your internet connection.",
    verify_code: "Verification Code",
    code_expired: "Code expired",
    invalid_code: "Invalid code",
    error_pin_incomplete: "Please enter all 6 digits",
    verify: "Verify",
    invalid_code_attempts: "Invalid code. {attempts} attempts remaining.",
    awaiting_calibration: "Awaiting Calibration",
    transaction_status: "Transaction Status",
    complete_percent: "{percent}% Complete",
    validating_docs: "Validating documents...",
    broadcasting_tx: "Broadcasting to Casper Mainnet Node...",
    tx_confirmed: "Transaction confirmed on Casper Network",
    scan_instruction: "Scan {side} of your {docType}",
    review_capture: "Review your capture. Ensure all text is clearly visible.",
    align_document: "Align your document within the glowing frame. Ensure all four corners are visible.",
    next_back_side: "Next: Back Side",
    confirm: "Confirm",
    capture: "Capture",
    verify_data_carefully: "Please verify the extracted data carefully.",
    enter_doc_number: "Enter document number",
    date_format: "DD/MM/YYYY",
    error_required_fields: "Please fill in all required fields.",
    front: "front",
    back: "back",
    requesting_access: "Requesting Access",
    privacy_note: "Privacy Note",
    privacy_desc: "Only cryptographic proofs are shared. No private keys are ever exposed.",
    approve_verify: "Approve & Verify",
    deny: "Deny",
    perm_identity: "Verify Identity Status",
    perm_profile: "Read Public Profile",
    perm_kyc: "Share KYC Level",
    "verify:identity": "Verify Identity Status",
    "read:profile": "Read Public Profile",
    "read:kyc_level": "Share KYC Level",
    "read:email": "Access Email Address",
    "read:wallet": "View Wallet Address",
    full_name: "FULL NAME",
    id_number: "ID NUMBER",
    // Passkey Auth
    passkey_auth_subtitle: "Use your passkey to sign in securely.",
    signing_in_as: "Signing in as",
    use_passkey: "Use Your Passkey",
    authenticating: "Authenticating...",
    authentication_failed: "Authentication Failed",
    passkey_auth_hint: "Touch ID, Face ID, or security key",
    passkey_cancelled: "Authentication was cancelled. Try again when ready.",
    authenticate: "Authenticate",
    use_email_instead: "Use email code instead",
    biometric_secured: "Biometric Secured",
    webauthn_not_supported: "Your browser doesn't support passkeys. Please use email verification.",
    // Passkey Registration
    create_passkey: "Create Your Passkey",
    passkey_register_subtitle: "Set up biometric authentication for secure, passwordless sign-in.",
    passkey_benefits_title: "Why use a passkey?",
    passkey_benefit_1: "No passwords to remember",
    passkey_benefit_2: "Phishing-resistant security",
    passkey_benefit_3: "Works across your devices",
    register_passkey: "Create Passkey",
    creating_passkey: "Creating passkey...",
    passkey_created: "Passkey created successfully!",
    passkey_create_failed: "Failed to create passkey",
    // L1 Setup
    l1_setup_title: "Setting Up Your Identity",
    l1_setup_subtitle: "Creating your secure wallet and decentralized identity.",
    generating_wallet: "Generating secure wallet...",
    minting_did: "Minting your DID...",
    l1_complete: "Identity setup complete!",
    l1_failed: "Setup failed. Please try again.",
    facial_verification: "Facial Verification",
    secure_face_scan_desc: "Secure Face Scan • Encrypted",
    analyzing_liveness: "Analyzing Liveness",
    calibration_complete: "Calibration Complete"
  },
  ES: {
    welcome_back: "Bienvenido de nuevo",
    enter_email: "Ingrese su correo para recibir un código.",
    email_address: "Correo electrónico",
    continue: "Continuar",
    sending_code: "Enviando código...",
    verify_email: "Verificar correo",
    enter_code: "Ingrese el código de 6 dígitos enviado a",
    verification_failed: "Error de verificación",
    verifying: "Verificando...",
    resend_code: "Reenviar código",
    resend_in: "Reenviar en",
    secure_sdk: "SDK SEGURO",
    permission_request: "SOLICITUD DE PERMISO",
    review_data: "Revisar datos",
    mint_identity: "Mint Identidad",
    face_scan: "Escaneo facial",
    document_scan: "Escaneo de documentos",
    verification_step: "PASO DE VERIFICACIÓN",
    kyc_required: "KYC REQUERIDO",
    security_upgrade_required: "Actualización de Seguridad Requerida",
    security_upgrade_desc: "Su cuenta requiere una actualización de seguridad biométrica para esta acción.",
    biometric_secure: "BIOMÉTRICO SEGURO",
    zero_knowledge: "CONOCIMIENTO CERO",
    start_upgrade: "Iniciar actualización",
    do_this_later: "Lo haré más tarde",
    sign_in_with_extension: "Iniciar sesión con extensión",
    sign_in_with_otp: "Iniciar sesión con OTP",
    extension_detected: "Extensión detectada",
    secure_wallet: "Billetera segura",
    fully_audited: "TOTALMENTE AUDITADO",
    non_custodial: "SIN CUSTODIA",
    verify_identity: "Verifique su identidad",
    choose_document: "Elija un tipo de documento para comenzar.",
    passport: "Pasaporte",
    drivers_license: "Licencia de conducir",
    national_id: "DNI / Cédula",
    passport_desc: "Todos los países soportados",
    drivers_license_desc: "Tarjeta emitida por el gobierno",
    national_id_desc: "Documento nacional de identidad",
    position_face: "Coloque su cara en el marco",
    blink_slowly: "Parpadee lentamente",
    turn_head_left: "Gire la cabeza hacia la izquierda",
    turn_head_right: "Gire la cabeza hacia la derecha",
    processing: "Procesando...",
    camera_permission_denied: "Permiso de cámara denegado",
    unable_access_camera: "No se puede acceder a la cámara",
    live_camera: "CÁMARA EN VIVO",
    initializing: "INICIALIZANDO",
    processing_verification: "Procesando verificación...",
    processing_liveness: "Verificando vivacidad...",
    processing_documents: "Procesando documentos...",
    processing_subtitle: "Validando sus documentos y biometría",
    minting_identity: "Minting identidad...",
    minting_subtitle: "Asegurando su identidad descentralizada en Casper Network",
    identity_minted: "¡Identidad Minted!",
    minted_subtitle: "Su CasperID ha sido creado con éxito",
    verification_failed_subtitle: "Hubo un problema con su verificación",
    try_again: "Intentar de nuevo",
    credential_hash: "Hash de credencial",
    identity_verified: "Identidad verificada",
    identity_verified_subtitle: "Su verificación de vida fue exitosa. Ahora está verificado.",
    identity_verified_desc: "Su CasperID ha sido autenticado con éxito en la cadena de bloques Casper.",
    submitting_for_review: "Enviando para revisión...",
    submitting_review_subtitle: "Sus documentos están siendo preparados para verificación",
    verification_submitted: "Verificación Enviada",
    verification_submitted_subtitle: "Sus documentos están en revisión. Le notificaremos una vez verificado.",
    share_data_consent: "Consentimiento de datos",
    authorize_dapps: "Autorizar dApps para acceder a credenciales",
    return_to_app: "Volver a la aplicación",
    verify_data_desc: "Verifique su información de identidad. Estos datos se usarán para crear su CasperID.",
    ocr_confidence: "Confianza OCR",
    first_name: "Nombre",
    last_name: "Apellido",
    document_number: "Número de documento",
    date_of_birth: "Fecha de nacimiento",
    nationality: "Nacionalidad",
    enter_first_name: "Ingrese nombre",
    enter_last_name: "Ingrese apellido",
    enter_nationality: "Ingrese nacionalidad",
    scanned_successfully: "Escaneado con éxito",
    secured_by_casper: "Protegido por CasperID Protocol.",
    confirm_mint: "Confirmar y crear",
    submitting: "Enviando...",
    retake_photo: "Tomar otra foto",
    auth_subtitle: "Asegure su identidad Web3 con nuestra capa de autenticación premium.",
    extension_connect_msg: "Haga clic en el icono de la extensión CasperID en su navegador para conectarse.",
    extension_not_detected: "No se detectó la extensión CasperID. Instale la extensión o use el inicio de sesión OTP.",
    connecting: "Conectando...",
    two_factor_auth: "Autenticación de dos factores",
    security_notice: "Sus datos están encriptados y nunca se almacenan en servidores centrales. Desarrollado por Casper Network.",
    e2e_encrypted: "Cifrado de extremo a extremo",
    error_email_required: "Por favor ingrese su correo",
    error_invalid_email: "Por favor ingrese un correo válido",
    error_passkey_registered: "Tiene una clave de paso registrada. Utilice el inicio de sesión por extensión.",
    error_send_code_failed: "Error al enviar el código de verificación. Inténtelo de nuevo.",
    error_connection_failed: "No se puede conectar. Compruebe su conexión a internet.",
    verify_code: "Código de verificación",
    code_expired: "Código expirado",
    invalid_code: "Código inválido",
    error_pin_incomplete: "Por favor ingrese los 6 dígitos",
    verify: "Verificar",
    invalid_code_attempts: "Código inválido. {attempts} intentos restantes.",
    awaiting_calibration: "Esperando calibración",
    transaction_status: "Estado de la transacción",
    complete_percent: "{percent}% completado",
    validating_docs: "Validando documentos...",
    broadcasting_tx: "Transmitiendo al nodo principal de Casper...",
    tx_confirmed: "Transacción confirmada en Casper Network",
    scan_instruction: "Escanee el {side} de su {docType}",
    review_capture: "Revise su captura. Asegúrese de que todo el texto sea visible.",
    align_document: "Alinee su documento dentro del marco brillante. Asegúrese de que las cuatro esquinas sean visibles.",
    next_back_side: "Siguiente: Reverso",
    confirm: "Confirmar",
    capture: "Capturar",
    verify_data_carefully: "Verifique los datos extraídos cuidadosamente.",
    enter_doc_number: "Ingrese el número de documento",
    date_format: "DD/MM/AAAA",
    error_required_fields: "Por favor complete todos los campos obligatorios.",
    front: "frente",
    back: "reverso",
    requesting_access: "Solicitando acceso",
    privacy_note: "Nota de privacidad",
    privacy_desc: "Solo se comparten pruebas criptográficas. Nunca se exponen las claves privadas.",
    approve_verify: "Aprobar y Verificar",
    deny: "Denegar",
    perm_identity: "Verificar estado de identidad",
    perm_profile: "Leer perfil público",
    perm_kyc: "Compartir nivel de KYC",
    "verify:identity": "Verificar estado de identidad",
    "read:profile": "Leer perfil público",
    "read:kyc_level": "Compartir nivel de KYC",
    "read:email": "Acceso a correo electrónico",
    "read:wallet": "Ver dirección de billetera",
    full_name: "NOMBRE COMPLETO",
    id_number: "NÚMERO DE IDENTIFICACIÓN",
    // Passkey Auth
    passkey_auth_subtitle: "Use su clave de paso para iniciar sesión de forma segura.",
    signing_in_as: "Iniciando sesión como",
    use_passkey: "Use su clave de paso",
    authenticating: "Autenticando...",
    authentication_failed: "Autenticación fallida",
    passkey_auth_hint: "Touch ID, Face ID o llave de seguridad",
    passkey_cancelled: "Autenticación cancelada. Intente de nuevo cuando esté listo.",
    authenticate: "Autenticar",
    use_email_instead: "Usar código de correo",
    biometric_secured: "Biométrico seguro",
    webauthn_not_supported: "Su navegador no admite claves de paso. Use verificación por correo.",
    // Passkey Registration
    create_passkey: "Crear su clave de paso",
    passkey_register_subtitle: "Configure autenticación biométrica para inicio de sesión sin contraseña.",
    passkey_benefits_title: "¿Por qué usar clave de paso?",
    passkey_benefit_1: "Sin contraseñas que recordar",
    passkey_benefit_2: "Seguridad resistente al phishing",
    passkey_benefit_3: "Funciona en todos sus dispositivos",
    register_passkey: "Crear clave de paso",
    creating_passkey: "Creando clave de paso...",
    passkey_created: "¡Clave de paso creada!",
    passkey_create_failed: "Error al crear clave de paso",
    // L1 Setup
    l1_setup_title: "Configurando su identidad",
    l1_setup_subtitle: "Creando su billetera segura e identidad descentralizada.",
    generating_wallet: "Generando billetera segura...",
    minting_did: "Minting su DID...",
    l1_complete: "¡Configuración de identidad completa!",
    l1_failed: "Configuración fallida. Intente de nuevo.",
    facial_verification: "Verificación Facial",
    secure_face_scan_desc: "Escaneo Facial Seguro • Encriptado",
    analyzing_liveness: "Analizando Vivacidad",
    calibration_complete: "Calibración Completa"
  },
  FR: {
    welcome_back: "Bon retour",
    enter_email: "Entrez votre email pour un code.",
    email_address: "Adresse email",
    continue: "Continuer",
    sending_code: "Envoi du code...",
    verify_email: "Vérifier l'email",
    enter_code: "Entrez le code à 6 chiffres envoyé à",
    verification_failed: "Échec de vérification",
    verifying: "Vérification...",
    resend_code: "Renvoyer le code",
    resend_in: "Renvoyer dans",
    secure_sdk: "SDK SÉCURISÉ",
    permission_request: "DEMANDE DE PERMISSION",
    review_data: "Réviser les données",
    mint_identity: "Mint Identité",
    face_scan: "Scan du visage",
    document_scan: "Scan du document",
    verification_step: "ÉTAPE DE VÉRIFICATION",
    kyc_required: "KYC REQUIS",
    security_upgrade_required: "Mise à niveau de sécurité requise",
    security_upgrade_desc: "Votre compte nécessite une mise à niveau biométrique pour cette action.",
    biometric_secure: "BIOMÉTRIE SÉCURISÉE",
    zero_knowledge: "ZÉRO CONNAISSANCE",
    start_upgrade: "Démarrer la mise à jour",
    do_this_later: "Je ferai ça plus tard",
    sign_in_with_extension: "Connexion avec l'extension",
    sign_in_with_otp: "Connexion avec OTP",
    extension_detected: "Extension détectée",
    secure_wallet: "Portefeuille sécurisé",
    fully_audited: "ENTIÈREMENT AUDITÉ",
    non_custodial: "NON FONGIBLE",
    verify_identity: "Vérifiez votre identité",
    choose_document: "Choisissez un type de document.",
    passport: "Passeport",
    drivers_license: "Permis de conduire",
    national_id: "Carte d'identité",
    passport_desc: "Tous les pays supportés",
    drivers_license_desc: "Carte émise par le gouvernement",
    national_id_desc: "Document d'identité national",
    position_face: "Placez votre visage dans le cadre",
    blink_slowly: "Clignez des yeux lentement",
    turn_head_left: "Tournez la tête vers la gauche",
    turn_head_right: "Tournez la tête vers la droite",
    processing: "Traitement...",
    camera_permission_denied: "Permission caméra refusée",
    unable_access_camera: "Accès caméra impossible",
    live_camera: "CAMÉRA EN DIRECT",
    initializing: "INITIALISATION",
    processing_verification: "Traitement de la vérification...",
    processing_liveness: "Vérification de la vivacité...",
    processing_documents: "Traitement des documents...",
    processing_subtitle: "Validation de vos documents et biométrie",
    minting_identity: "Mint Identité en cours...",
    minting_subtitle: "Sécurisation de votre identité sur le réseau Casper",
    identity_minted: "Identité créée !",
    minted_subtitle: "Votre CasperID a été créé avec succès",
    verification_failed_subtitle: "Il y a eu un problème avec votre vérification",
    try_again: "Réessayer",
    credential_hash: "Hachage de créance",
    identity_verified: "Identité vérifiée",
    identity_verified_subtitle: "Votre vérification de vivacité a réussi. Vous êtes maintenant vérifié.",
    identity_verified_desc: "Votre CasperID a été authentifié avec succès sur la blockchain Casper.",
    submitting_for_review: "Soumission pour révision...",
    submitting_review_subtitle: "Vos documents sont en cours de préparation pour la vérification",
    verification_submitted: "Vérification Soumise",
    verification_submitted_subtitle: "Vos documents sont en cours de révision. Vous serez notifié une fois vérifié.",
    share_data_consent: "Partage de données",
    authorize_dapps: "Autoriser dApps à accéder aux identifiants",
    return_to_app: "Retour à l'application",
    verify_data_desc: "Vérifiez vos informations d'identité. Ces données seront utilisées pour créer votre CasperID.",
    ocr_confidence: "Confiance OCR",
    first_name: "Prénom",
    last_name: "Nom",
    document_number: "Numéro de document",
    date_of_birth: "Date de naissance",
    nationality: "Nationalité",
    enter_first_name: "Entrez le prénom",
    enter_last_name: "Entrez le nom",
    enter_nationality: "Entrez la nationalité",
    scanned_successfully: "Scanné avec succès",
    secured_by_casper: "Sécurisé par CasperID Protocol.",
    confirm_mint: "Confirmer et Créer",
    submitting: "Soumission...",
    retake_photo: "Reprendre la photo",
    auth_subtitle: "Sécurisez votre identité Web3 avec notre couche d'authentification premium.",
    extension_connect_msg: "Cliquez sur l'icône de l'extension CasperID dans votre navigateur pour vous connecter.",
    extension_not_detected: "Extension CasperID non détectée. Veuillez installer l'extension ou utiliser la connexion OTP.",
    connecting: "Connexion...",
    two_factor_auth: "Authentification à deux facteurs",
    security_notice: "Vos données sont cryptées et ne sont jamais stockées sur des serveurs centraux. Propulsé par Casper Network.",
    e2e_encrypted: "Chiffré de bout en bout",
    error_email_required: "Veuillez entrer votre email",
    error_invalid_email: "Veuillez entrer une adresse email valide",
    error_passkey_registered: "Vous avez une clé de sécurité enregistrée. Veuillez utiliser la connexion par extension.",
    error_send_code_failed: "Échec de l'envoi du code de vérification. Veuillez réessayer.",
    error_connection_failed: "Impossible de se connecter. Veuillez vérifier votre connexion internet.",
    verify_code: "Code de vérification",
    code_expired: "Code expiré",
    invalid_code: "Code invalide",
    error_pin_incomplete: "Veuillez entrer les 6 chiffres",
    verify: "Vérifier",
    invalid_code_attempts: "Code invalide. {attempts} tentatives restantes.",
    awaiting_calibration: "En attente de calibrage",
    transaction_status: "Statut de la transaction",
    complete_percent: "{percent}% terminé",
    validating_docs: "Validation des documents...",
    broadcasting_tx: "Diffusion sur le nœud Casper Mainnet...",
    tx_confirmed: "Transaction confirmée sur le réseau Casper",
    scan_instruction: "Scannez le {side} de votre {docType}",
    review_capture: "Réviser votre capture. Assurez-vous que tout le texte est visible.",
    align_document: "Alignez votre document dans le cadre. Assurez-vous que les quatre coins sont visibles.",
    next_back_side: "Suivant: Verso",
    confirm: "Confirmer",
    capture: "Capturer",
    verify_data_carefully: "Veuillez vérifier soigneusement les données extraites.",
    enter_doc_number: "Entrez le numéro du document",
    date_format: "JJ/MM/AAAA",
    error_required_fields: "Veuillez remplir tous les champs obligatoires.",
    front: "recto",
    back: "verso",
    requesting_access: "Demande d'accès",
    privacy_note: "Note de confidentialité",
    privacy_desc: "Seules des preuves cryptographiques sont partagées. Aucune clé privée n'est jamais exposée.",
    approve_verify: "Approuver et Vérifier",
    deny: "Refuser",
    perm_identity: "Vérifier le statut d'identité",
    perm_profile: "Lire le profil public",
    perm_kyc: "Partager le niveau KYC",
    "verify:identity": "Vérifier le statut d'identité",
    "read:profile": "Lire le profil public",
    "read:kyc_level": "Partager le niveau KYC",
    "read:email": "Accéder à l'adresse email",
    "read:wallet": "Voir l'adresse du portefeuille",
    full_name: "NOM COMPLET",
    id_number: "NUMÉRO DE DOCUMENT",
    // Passkey Auth
    passkey_auth_subtitle: "Utilisez votre clé d'accès pour vous connecter en toute sécurité.",
    signing_in_as: "Connexion en tant que",
    use_passkey: "Utilisez votre clé d'accès",
    authenticating: "Authentification...",
    authentication_failed: "Échec de l'authentification",
    passkey_auth_hint: "Touch ID, Face ID ou clé de sécurité",
    passkey_cancelled: "Authentification annulée. Réessayez quand vous êtes prêt.",
    authenticate: "Authentifier",
    use_email_instead: "Utiliser un code par email",
    biometric_secured: "Sécurisé biométrique",
    webauthn_not_supported: "Votre navigateur ne prend pas en charge les clés d'accès. Utilisez la vérification par email.",
    // Passkey Registration
    create_passkey: "Créer votre clé d'accès",
    passkey_register_subtitle: "Configurez l'authentification biométrique pour une connexion sans mot de passe.",
    passkey_benefits_title: "Pourquoi utiliser une clé d'accès?",
    passkey_benefit_1: "Pas de mot de passe à retenir",
    passkey_benefit_2: "Sécurité résistante au phishing",
    passkey_benefit_3: "Fonctionne sur tous vos appareils",
    register_passkey: "Créer la clé d'accès",
    creating_passkey: "Création de la clé d'accès...",
    passkey_created: "Clé d'accès créée!",
    passkey_create_failed: "Échec de la création de la clé d'accès",
    // L1 Setup
    l1_setup_title: "Configuration de votre identité",
    l1_setup_subtitle: "Création de votre portefeuille sécurisé et identité décentralisée.",
    generating_wallet: "Génération du portefeuille sécurisé...",
    minting_did: "Création de votre DID...",
    l1_complete: "Configuration d'identité terminée!",
    l1_failed: "Échec de la configuration. Réessayez.",
    facial_verification: "Vérification Faciale",
    secure_face_scan_desc: "Scan Facial Sécurisé • Crypté",
    analyzing_liveness: "Analyse de Vivacité",
    calibration_complete: "Calibration Terminée"
  },
  DE: {
    welcome_back: "Willkommen zurück",
    enter_email: "E-Mail für Bestätigungscode eingeben.",
    email_address: "E-Mail-Adresse",
    continue: "Weiter",
    sending_code: "Code wird gesendet...",
    verify_email: "E-Mail verifizieren",
    enter_code: "6-stelligen Code eingeben, gesendet an",
    verification_failed: "Verifizierung fehlgeschlagen",
    verifying: "Verifizierung...",
    resend_code: "Code erneut senden",
    resend_in: "Erneut in",
    secure_sdk: "SICHERES SDK",
    permission_request: "BERECHTIGUNGSANFRAGE",
    review_data: "Daten überprüfen",
    mint_identity: "Identität prägen",
    face_scan: "Gesichtsscan",
    document_scan: "Dokumentenscan",
    verification_step: "VERIFIZIERUNGSSCHRITT",
    kyc_required: "KYC ERFORDERLICH",
    security_upgrade_required: "Sicherheits-Upgrade erforderlich",
    security_upgrade_desc: "Ihr Konto erfordert ein biometrisches Upgrade für diese Aktion.",
    biometric_secure: "BIOMETRISCH SICHER",
    zero_knowledge: "ZERO-KNOWLEDGE",
    start_upgrade: "Upgrade starten",
    do_this_later: "Später erledigen",
    sign_in_with_extension: "Mit Erweiterung anmelden",
    sign_in_with_otp: "Mit OTP anmelden",
    extension_detected: "Erweiterung erkannt",
    secure_wallet: "Sichere Wallet",
    fully_audited: "VOLLSTÄNDIG GEPRÜFT",
    non_custodial: "NON-CUSTODIAL",
    verify_identity: "Identität verifizieren",
    choose_document: "Dokumenttyp auswählen.",
    passport: "Reisepass",
    drivers_license: "Führerschein",
    national_id: "Personalausweis",
    passport_desc: "Alle Länder unterstützt",
    drivers_license_desc: "Staatlicher Ausweis",
    national_id_desc: "Nationaler Identitätsnachweis",
    position_face: "Gesicht im Rahmen positionieren",
    blink_slowly: "Langsam blinzeln",
    turn_head_left: "Kopf langsam nach links drehen",
    turn_head_right: "Kopf langsam nach rechts drehen",
    processing: "Verarbeitung...",
    camera_permission_denied: "Kamerazugriff verweigert",
    unable_access_camera: "Kamerazugriff nicht möglich",
    live_camera: "LIVE-KAMERA",
    initializing: "INITIALISIERUNG",
    processing_verification: "Verifizierung wird verarbeitet...",
    processing_liveness: "Lebendigkeitsprüfung läuft...",
    processing_documents: "Dokumente werden verarbeitet...",
    processing_subtitle: "Dokumente und Biometrie werden validiert",
    minting_identity: "Identität wird geprägt...",
    minting_subtitle: "Ihre dezentrale Identität wird im Casper-Netzwerk gesichert",
    identity_minted: "Identität geprägt!",
    minted_subtitle: "Ihre CasperID wurde erfolgreich erstellt",
    verification_failed_subtitle: "Es gab ein Problem mit Ihrer Verifizierung",
    try_again: "Erneut versuchen",
    credential_hash: "Anmeldedaten-Hash",
    identity_verified: "Identität verifiziert",
    identity_verified_subtitle: "Ihre Lebendigkeitsprüfung war erfolgreich. Sie sind jetzt verifiziert.",
    identity_verified_desc: "Ihre CasperID wurde erfolgreich in der Casper-Blockchain authentifiziert.",
    submitting_for_review: "Zur Überprüfung einreichen...",
    submitting_review_subtitle: "Ihre Dokumente werden für die Verifizierung vorbereitet",
    verification_submitted: "Verifizierung eingereicht",
    verification_submitted_subtitle: "Ihre Dokumente werden überprüft. Sie werden benachrichtigt, sobald verifiziert.",
    share_data_consent: "Datenfreigabe",
    authorize_dapps: "dApps Zugriff auf Anmeldedaten erlauben",
    return_to_app: "Zurück zur App",
    verify_data_desc: "Überprüfen Sie Ihre Identitätsdaten. Diese werden zur Erstellung Ihrer CasperID verwendet.",
    ocr_confidence: "OCR-Vertrauen",
    first_name: "Vorname",
    last_name: "Nachname",
    document_number: "Ausweisnummer",
    date_of_birth: "Geburtsdatum",
    nationality: "Nationalität",
    enter_first_name: "Vorname eingeben",
    enter_last_name: "Nachname eingeben",
    enter_nationality: "Nationalität eingeben",
    scanned_successfully: "Erfolgreich gescannt",
    secured_by_casper: "Gesichert durch CasperID Protocol.",
    confirm_mint: "Bestätigen & Prägen",
    submitting: "Wird gesendet...",
    retake_photo: "Foto erneut aufnehmen",
    auth_subtitle: "Sichern Sie Ihre Web3-Identität mit unserer Premium-Authentifizierungsschicht.",
    extension_connect_msg: "Klicken Sie auf das CasperID-Erweiterungssymbol in Ihrem Browser, um eine Verbindung herzustellen.",
    extension_not_detected: "CasperID-Erweiterung nicht erkannt. Bitte installieren Sie die Erweiterung oder verwenden Sie die OTP-Anmeldung.",
    connecting: "Verbindung wird hergestellt...",
    two_factor_auth: "Zwei-Faktor-Authentifizierung",
    security_notice: "Ihre Daten sind verschlüsselt und werden niemals auf zentralen Servern gespeichert. Unterstützt von Casper Network.",
    e2e_encrypted: "Ende-zu-Ende verschlüsselt",
    error_email_required: "Bitte geben Sie Ihre E-Mail-Adresse ein",
    error_invalid_email: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    error_passkey_registered: "Sie haben einen Passkey registriert. Bitte verwenden Sie die Anmeldung über die Erweiterung.",
    error_send_code_failed: "Der Verifizierungscode konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    error_connection_failed: "Verbindung nicht möglich. Bitte überprüfen Sie Ihre Internetverbindung.",
    verify_code: "Verifizierungscode",
    code_expired: "Code abgelaufen",
    invalid_code: "Ungültiger Code",
    error_pin_incomplete: "Bitte alle 6 Ziffern eingeben",
    verify: "Verifizieren",
    invalid_code_attempts: "Ungültiger Code. {attempts} Versuche übrig.",
    error_verify_failed: "Verifizierung nicht möglich. Bitte erneut versuchen.",
    error_resend_failed: "Code konnte nicht gesendet werden. Bitte erneut versuchen.",
    sending: "Senden...",
    facial_verification: "Gesichtsverifizierung",
    secure_face_scan_desc: "Sicherer Gesichtsscan • Verschlüsselt",
    analyzing_liveness: "Lebendigkeitsprüfung",
    calibration_complete: "Kalibrierung abgeschlossen",
    awaiting_calibration: "Warten auf Kalibrierung",
    transaction_status: "Transaktionsstatus",
    complete_percent: "{percent}% abgeschlossen",
    validating_docs: "Dokumente werden validiert...",
    broadcasting_tx: "Übertragung an Casper Mainnet Node...",
    tx_confirmed: "Transaktion im Casper-Netzwerk bestätigt",
    scan_instruction: "Scannen Sie die {side} Ihres {docType}",
    review_capture: "Überprüfen Sie Ihre Aufnahme. Stellen Sie sicher, dass der Text lesbar ist.",
    align_document: "Richten Sie Ihr Dokument im Rahmen aus. Alle vier Ecken müssen sichtbar sein.",
    next_back_side: "Weiter: Rückseite",
    confirm: "Bestätigen",
    capture: "Aufnehmen",
    verify_data_carefully: "Bitte überprüfen Sie die extrahierten Daten sorgfältig.",
    enter_doc_number: "Ausweisnummer eingeben",
    date_format: "TT/MM/JJJJ",
    error_required_fields: "Bitte füllen Sie alle Pflichtfelder aus.",
    front: "Vorderseite",
    back: "Rückseite",
    requesting_access: "Zugriff anfordern",
    privacy_note: "Datenschutzhinweis",
    privacy_desc: "Es werden nur kryptografische Beweise geteilt. Private Schlüssel werden niemals offengelegt.",
    approve_verify: "Genehmigen & Verifizieren",
    deny: "Ablehnen",
    perm_identity: "Identitätsstatus überprüfen",
    perm_profile: "Öffentliches Profil lesen",
    perm_kyc: "KYC-Level teilen",
    "verify:identity": "Identitätsstatus überprüfen",
    "read:profile": "Öffentliches Profil lesen",
    "read:kyc_level": "KYC-Level teilen",
    "read:email": "E-Mail-Adresse zugreifen",
    "read:wallet": "Wallet-Adresse anzeigen",
    full_name: "VOLLSTÄNDIGER NAME",
    id_number: "AUSWEISNUMMER",
    // Passkey Auth
    passkey_auth_subtitle: "Verwenden Sie Ihren Passkey für sichere Anmeldung.",
    signing_in_as: "Anmeldung als",
    use_passkey: "Passkey verwenden",
    authenticating: "Authentifizierung...",
    authentication_failed: "Authentifizierung fehlgeschlagen",
    passkey_auth_hint: "Touch ID, Face ID oder Sicherheitsschlüssel",
    passkey_cancelled: "Authentifizierung abgebrochen. Versuchen Sie es erneut.",
    authenticate: "Authentifizieren",
    use_email_instead: "E-Mail-Code verwenden",
    biometric_secured: "Biometrisch gesichert",
    webauthn_not_supported: "Ihr Browser unterstützt keine Passkeys. Verwenden Sie E-Mail-Verifizierung.",
    // Passkey Registration
    create_passkey: "Passkey erstellen",
    passkey_register_subtitle: "Richten Sie biometrische Authentifizierung für passwortlose Anmeldung ein.",
    passkey_benefits_title: "Warum einen Passkey verwenden?",
    passkey_benefit_1: "Keine Passwörter merken",
    passkey_benefit_2: "Phishing-resistente Sicherheit",
    passkey_benefit_3: "Funktioniert auf allen Geräten",
    register_passkey: "Passkey erstellen",
    creating_passkey: "Passkey wird erstellt...",
    passkey_created: "Passkey erstellt!",
    passkey_create_failed: "Passkey-Erstellung fehlgeschlagen",
    // L1 Setup
    l1_setup_title: "Identität einrichten",
    l1_setup_subtitle: "Sichere Wallet und dezentrale Identität werden erstellt.",
    generating_wallet: "Sichere Wallet wird generiert...",
    minting_did: "DID wird geprägt...",
    l1_complete: "Identitätseinrichtung abgeschlossen!",
    l1_failed: "Einrichtung fehlgeschlagen. Erneut versuchen."
  }
}, t = (r, a = "EN") => {
  const n = a.toUpperCase();
  return (Ve[n] || Ve.EN)[r] || Ve.EN[r] || r;
}, Mt = ({
  onNext: r,
  onExtensionSuccess: a,
  onError: n,
  language: l = "EN",
  platform: N = "desktop"
}) => {
  const [p, f] = y(!1), [m, s] = y(null), [c, d] = y("");
  ce(() => {
    D();
  }, []), ce(() => {
    const o = (I) => {
      f(!1), I.detail && I.detail.wallet && (a == null || a(I.detail));
    };
    return window.addEventListener("casperid-login", o), () => {
      window.removeEventListener("casperid-login", o);
    };
  }, [a]);
  const D = J(() => {
    const o = document.getElementById("casperid-draggable-anchor");
    let I = null;
    try {
      I = localStorage.getItem("casperid_user");
    } catch {
    }
    return o || I ? (s(!0), !0) : (setTimeout(() => {
      const g = document.getElementById("casperid-draggable-anchor");
      s(!!g);
    }, 500), !1);
  }, []), h = (o) => typeof o == "object" && o !== null && "wallet" in o && typeof o.wallet == "string" && o.wallet.length > 0, A = async () => {
    f(!0), d("");
    try {
      const I = localStorage.getItem("casperid_user");
      if (I) {
        const g = JSON.parse(I);
        if (h(g)) {
          f(!1), a == null || a(g);
          return;
        }
      }
    } catch {
    }
    const o = document.getElementById("casperid-draggable-anchor");
    o ? (o.click(), setTimeout(() => {
      f(!1);
      try {
        localStorage.getItem("casperid_user") || d(t("extension_connect_msg", l));
      } catch {
        d(t("extension_connect_msg", l));
      }
    }, 3e3)) : (f(!1), d(t("extension_not_detected", l)), n == null || n("Extension not installed"));
  }, _ = () => {
    d(""), r("otp");
  };
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 px-8 flex flex-col justify-center gap-8",
      children: [
        /* @__PURE__ */ i("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ i("div", { className: "relative w-24 h-24 mx-auto mb-6", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-brand-20 blur-2xl rounded-full" }),
            /* @__PURE__ */ e("div", { className: "relative w-full h-full glass-container flex items-center justify-center rounded-2xl border border-brand-30", children: /* @__PURE__ */ e(Ie, { className: "w-10 h-10 text-brand" }) })
          ] }),
          /* @__PURE__ */ e("h1", { className: "text-2xl font-extrabold leading-tight tracking-tight text-main", children: t("welcome_back", l) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: t("auth_subtitle", l) })
        ] }),
        c && /* @__PURE__ */ i("div", { className: "flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl", children: [
          /* @__PURE__ */ e(ve, { className: "w-5 h-5 text-red-500 shrink-0 mt-0.5" }),
          /* @__PURE__ */ e("p", { className: "text-red-600 dark:text-red-400 text-sm font-medium", children: c })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-4", children: [
          N === "desktop" && /* @__PURE__ */ i(
            "button",
            {
              onClick: A,
              disabled: p,
              className: "w-full group relative overflow-hidden flex items-center gap-4 bg-brand hover:bg-brand-90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-brand",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-white/20 p-2 rounded-lg", children: p ? /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ e(Dt, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ i("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t(p ? "connecting" : "sign_in_with_extension", l) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-slate-600 dark:text-white/70", children: t(m === !0 ? "extension_detected" : "secure_wallet", l) })
                ] }),
                /* @__PURE__ */ e(Le, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          ),
          /* @__PURE__ */ i(
            "button",
            {
              onClick: _,
              disabled: p,
              className: "w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-brand-10 p-2 rounded-lg", children: /* @__PURE__ */ e(qe, { className: "w-5 h-5 text-brand" }) }),
                /* @__PURE__ */ i("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t("sign_in_with_otp", l) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: t("two_factor_auth", l) })
                ] }),
                /* @__PURE__ */ e(Le, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ i("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(Se, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("fully_audited", l) })
          ] }),
          /* @__PURE__ */ i("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(Te, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("non_custodial", l) })
          ] })
        ] })
      ]
    }
  );
}, Lt = ({
  onNext: r,
  onPasskeyUser: a,
  onError: n,
  apiBaseUrl: l = "https://apis.casperid.com",
  apiKey: N = "",
  previewMode: p = !1,
  language: f = "EN"
}) => {
  const [m, s] = y(""), [c, d] = y(!1), [D, h] = y(""), A = async () => {
    if (!m.trim()) {
      h(t("error_email_required", f));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      h(t("error_invalid_email", f));
      return;
    }
    if (d(!0), h(""), p) {
      setTimeout(() => {
        d(!1), r(m.trim().toLowerCase(), "mock-v-id-123456789");
      }, 1e3);
      return;
    }
    try {
      const I = await fetch(`${l}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...N ? { "X-App-Id": N } : {}
        },
        body: JSON.stringify({ email: m.trim().toLowerCase() })
      });
      if (!I.ok) {
        const k = await I.json().catch(() => ({}));
        throw new Error(k.error || `Request failed with status ${I.status}`);
      }
      const g = await I.json();
      if (g.success) {
        if (g.userExists && g.hasPasskey) {
          a ? a(m.trim().toLowerCase()) : h(t("error_passkey_registered", f)), d(!1);
          return;
        }
        g.verificationId ? r(m.trim().toLowerCase(), g.verificationId) : h(t("error_send_code_failed", f));
      } else
        h(g.error || t("error_send_code_failed", f)), n == null || n(g.error || t("error_send_code_failed", f));
    } catch {
      const g = t("error_connection_failed", f);
      h(g), n == null || n(g);
    } finally {
      d(!1);
    }
  }, _ = (o) => {
    o.key === "Enter" && !c && A();
  };
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ i("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("welcome_back", f) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("enter_email", f) })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-6", children: [
          /* @__PURE__ */ i("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1", children: t("email_address", f) }),
            /* @__PURE__ */ i("div", { className: "relative", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  className: `w-full dark:bg-black/20 bg-slate-100/50 border ${D ? "border-red-400 dark:border-red-500" : "dark:border-white/10 border-slate-200"} rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-30 transition-all font-medium`,
                  placeholder: "name@example.com",
                  type: "email",
                  value: m,
                  onChange: (o) => {
                    s(o.target.value), D && h("");
                  },
                  onKeyDown: _,
                  disabled: c,
                  autoComplete: "email",
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ e("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400", children: /* @__PURE__ */ e(St, { className: "w-5 h-5" }) })
            ] }),
            D && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium ml-1 mt-1", children: D })
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: A,
              disabled: c,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
              children: c ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("sending_code", f) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: t("continue", f) }),
                /* @__PURE__ */ e(Oe, { className: "w-5 h-5" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-auto pb-8", children: [
          /* @__PURE__ */ e("div", { className: "p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl mb-6", children: /* @__PURE__ */ i("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ e(Fe, { className: "text-[#6DE8EC] w-5 h-5 mt-0.5 shrink-0" }),
            /* @__PURE__ */ e("p", { className: "text-[11px] text-muted leading-normal font-medium", children: t("security_notice", f) })
          ] }) }),
          /* @__PURE__ */ i("div", { className: "flex items-center justify-center gap-2 opacity-50", children: [
            /* @__PURE__ */ e(tt, { className: "text-muted w-3 h-3" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("e2e_encrypted", f) })
          ] })
        ] })
      ]
    }
  );
};
function xe(r) {
  const a = new Uint8Array(r);
  let n = "";
  for (let l = 0; l < a.byteLength; l++)
    n += String.fromCharCode(a[l]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function Ne(r) {
  const a = "=".repeat((4 - r.length % 4) % 4), n = r.replace(/-/g, "+").replace(/_/g, "/") + a, l = atob(n), N = new Uint8Array(l.length);
  for (let p = 0; p < l.length; p++)
    N[p] = l.charCodeAt(p);
  return N.buffer;
}
function Ee() {
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential == "function");
}
async function at() {
  if (!Ee()) return !1;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return !1;
  }
}
function Ot() {
  const r = navigator.userAgent.toLowerCase();
  return /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(r) ? "mobile" : /ipad|android(?!.*mobile)|tablet/i.test(r) ? "tablet" : "desktop";
}
function Ft() {
  return {
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent,
    deviceType: Ot()
  };
}
function qt(r) {
  var a;
  return {
    ...r,
    challenge: Ne(r.challenge),
    user: {
      ...r.user,
      id: Ne(r.user.id)
    },
    excludeCredentials: (a = r.excludeCredentials) == null ? void 0 : a.map((n) => ({
      ...n,
      id: Ne(n.id)
    }))
  };
}
function Ut(r) {
  var a;
  return {
    ...r,
    challenge: Ne(r.challenge),
    allowCredentials: (a = r.allowCredentials) == null ? void 0 : a.map((n) => ({
      ...n,
      id: Ne(n.id)
    }))
  };
}
function $t(r) {
  const a = r.response;
  return {
    id: r.id,
    rawId: xe(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: xe(a.clientDataJSON),
      attestationObject: xe(a.attestationObject)
    },
    clientExtensionResults: r.getClientExtensionResults(),
    deviceInfo: Ft()
  };
}
function Bt(r) {
  const a = r.response;
  return {
    id: r.id,
    rawId: xe(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: xe(a.clientDataJSON),
      authenticatorData: xe(a.authenticatorData),
      signature: xe(a.signature),
      userHandle: a.userHandle ? xe(a.userHandle) : null
    },
    clientExtensionResults: r.getClientExtensionResults()
  };
}
async function Ht(r) {
  if (!Ee())
    throw new Error("WebAuthn is not supported in this browser");
  const a = qt(r), n = await navigator.credentials.create({
    publicKey: a
  });
  if (!n)
    throw new Error("Passkey creation was cancelled or failed");
  return $t(n);
}
async function Wt(r) {
  if (!Ee())
    throw new Error("WebAuthn is not supported in this browser");
  const a = Ut(r), n = await navigator.credentials.get({
    publicKey: a
  });
  if (!n)
    throw new Error("Passkey authentication was cancelled or failed");
  return Bt(n);
}
const Yt = ({
  email: r,
  onSuccess: a,
  onError: n,
  onFallbackToOTP: l,
  apiBaseUrl: N = "https://apis.casperid.com",
  apiKey: p = "",
  previewMode: f = !1,
  language: m = "EN"
}) => {
  const [s, c] = y(!1), [d, D] = y(""), [h, A] = y(!0), [_, o] = y(!1);
  ce(() => {
    (async () => {
      const k = Ee(), V = await at();
      A(k && V), (!k || !V) && D(t("webauthn_not_supported", m));
    })();
  }, [m]), ce(() => {
    if (h && !_ && !f) {
      o(!0);
      const g = setTimeout(() => {
        I();
      }, 500);
      return () => clearTimeout(g);
    }
  }, [h, _, f]);
  const I = async () => {
    if (!s) {
      if (c(!0), D(""), f) {
        setTimeout(() => {
          c(!1), a("mock-session-token", {
            user_id: "mock-user-id",
            email: r,
            tier: "layer_1"
          });
        }, 1500);
        return;
      }
      try {
        const g = await fetch(`${N}/api/passkey/auth/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...p ? { "X-App-Id": p } : {}
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!g.ok) {
          const Y = await g.json().catch(() => ({}));
          throw new Error(Y.error || "Failed to initialize authentication");
        }
        const k = await g.json();
        if (!k.success || !k.options)
          throw new Error(k.error || "Invalid authentication options");
        const V = await Wt(k.options), w = await fetch(`${N}/api/passkey/auth/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...p ? { "X-App-Id": p } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            email: r,
            challengeId: k.challengeId,
            credential: V
          })
        });
        if (!w.ok) {
          const Y = await w.json().catch(() => ({}));
          throw new Error(Y.error || "Authentication failed");
        }
        const T = await w.json();
        if (T.success && T.session_token)
          a(T.session_token, T.user, T.business_token);
        else
          throw new Error(T.error || "Authentication failed");
      } catch (g) {
        const k = g instanceof Error ? g.message : "Authentication failed";
        k.includes("cancelled") || k.includes("NotAllowedError") ? D(t("passkey_cancelled", m)) : (D(k), n == null || n(k));
      } finally {
        c(!1);
      }
    }
  };
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ i("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("welcome_back", m) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("passkey_auth_subtitle", m) })
        ] }),
        /* @__PURE__ */ i("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: t("signing_in_as", m) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ i("div", { className: "flex-1 flex flex-col items-center justify-center py-8", children: [
          /* @__PURE__ */ e(
            P.div,
            {
              animate: s ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              } : {},
              transition: {
                duration: 1.5,
                repeat: s ? 1 / 0 : 0,
                ease: "easeInOut"
              },
              className: `w-24 h-24 rounded-full flex items-center justify-center mb-6 ${s ? "bg-brand/20 border-2 border-brand" : d ? "bg-red-500/10 border-2 border-red-400" : "bg-brand/10 border-2 border-brand/30"}`,
              children: s ? /* @__PURE__ */ e(_e, { className: "w-10 h-10 text-brand animate-spin" }) : d ? /* @__PURE__ */ e(ve, { className: "w-10 h-10 text-red-400" }) : /* @__PURE__ */ e(Ie, { className: "w-10 h-10 text-brand" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center mb-2", children: t(s ? "authenticating" : d ? "authentication_failed" : "use_passkey", m) }),
          d && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mb-4 max-w-xs", children: d }),
          !s && /* @__PURE__ */ e("p", { className: "text-muted text-sm text-center max-w-xs", children: t("passkey_auth_hint", m) })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-3 pb-8", children: [
          !s && /* @__PURE__ */ e(
            "button",
            {
              onClick: I,
              disabled: !h,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Te, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("try_again", m) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Ie, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("authenticate", m) })
              ] })
            }
          ),
          l && /* @__PURE__ */ e(
            "button",
            {
              onClick: l,
              disabled: s,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
              children: t("use_email_instead", m)
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(Se, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("biometric_secured", m) })
        ] })
      ]
    }
  );
}, Gt = ({
  email: r,
  sessionToken: a,
  onSuccess: n,
  onError: l,
  onSkip: N,
  apiBaseUrl: p = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: m = !1,
  language: s = "EN"
}) => {
  const [c, d] = y(!1), [D, h] = y(""), [A, _] = y(!0), [o, I] = y(!1);
  ce(() => {
    (async () => {
      const w = Ee(), T = await at();
      _(w && T), (!w || !T) && h(t("webauthn_not_supported", s));
    })();
  }, [s]);
  const g = async () => {
    if (!c) {
      if (d(!0), h(""), m) {
        setTimeout(() => {
          d(!1), I(!0), setTimeout(() => {
            n({
              user_id: "mock-user-id",
              email: r,
              tier: "layer_0"
            });
          }, 1e3);
        }, 1500);
        return;
      }
      try {
        const V = await fetch(`${p}/api/passkey/register/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${a}`,
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!V.ok) {
          const B = await V.json().catch(() => ({}));
          throw new Error(B.error || "Failed to initialize registration");
        }
        const w = await V.json();
        if (!w.success || !w.options)
          throw new Error(w.error || "Invalid registration options");
        const T = await Ht(w.options), Y = await fetch(`${p}/api/passkey/register/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${a}`,
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            userId: w.userId,
            credential: T,
            deviceInfo: {
              userAgent: navigator.userAgent
            }
          })
        });
        if (!Y.ok) {
          const B = await Y.json().catch(() => ({}));
          throw new Error(B.error || "Registration failed");
        }
        const W = await Y.json();
        if (W.success)
          I(!0), setTimeout(() => {
            n(W.user, W.business_token);
          }, 1e3);
        else
          throw new Error(W.error || "Registration failed");
      } catch (V) {
        const w = V instanceof Error ? V.message : "Registration failed";
        w.includes("cancelled") || w.includes("NotAllowedError") ? h(t("passkey_cancelled", s)) : (h(w), l == null || l(w));
      } finally {
        d(!1);
      }
    }
  }, k = [
    { icon: Ct, text: t("passkey_benefit_1", s) },
    { icon: Se, text: t("passkey_benefit_2", s) },
    { icon: qe, text: t("passkey_benefit_3", s) }
  ];
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ i("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("create_passkey", s) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("passkey_register_subtitle", s) })
        ] }),
        /* @__PURE__ */ i("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: t("signing_in_as", s) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ i("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("p", { className: "text-sm font-semibold text-main mb-4", children: t("passkey_benefits_title", s) }),
          /* @__PURE__ */ e("div", { className: "space-y-3", children: k.map((V, w) => /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("div", { className: "w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center", children: /* @__PURE__ */ e(V.icon, { className: "w-5 h-5 text-brand" }) }),
            /* @__PURE__ */ e("span", { className: "text-sm text-muted", children: V.text })
          ] }, w)) })
        ] }),
        (c || o || D) && /* @__PURE__ */ i("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
          /* @__PURE__ */ e(
            P.div,
            {
              animate: c ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              } : {},
              transition: {
                duration: 1.5,
                repeat: c ? 1 / 0 : 0,
                ease: "easeInOut"
              },
              className: `w-20 h-20 rounded-full flex items-center justify-center mb-4 ${o ? "bg-green-500/20 border-2 border-green-400" : c ? "bg-brand/20 border-2 border-brand" : "bg-red-500/10 border-2 border-red-400"}`,
              children: o ? /* @__PURE__ */ e(Ce, { className: "w-10 h-10 text-green-400" }) : c ? /* @__PURE__ */ e(_e, { className: "w-10 h-10 text-brand animate-spin" }) : /* @__PURE__ */ e(ve, { className: "w-10 h-10 text-red-400" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center", children: t(o ? "passkey_created" : c ? "creating_passkey" : "passkey_create_failed", s) }),
          D && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mt-2 max-w-xs", children: D })
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-auto space-y-3 pb-8", children: [
          !o && /* @__PURE__ */ e(
            "button",
            {
              onClick: g,
              disabled: !A || c,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: c ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("creating_passkey", s) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Ie, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("register_passkey", s) })
              ] })
            }
          ),
          N && !c && !o && /* @__PURE__ */ e(
            "button",
            {
              onClick: N,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center transition-colors",
              children: t("do_this_later", s)
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(tt, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("e2e_encrypted", s) })
        ] })
      ]
    }
  );
}, Jt = ({
  email: r,
  verificationId: a,
  onNext: n,
  onError: l,
  apiBaseUrl: N = "https://apis.casperid.com",
  apiKey: p,
  previewMode: f = !1,
  language: m = "EN"
}) => {
  const [s, c] = y(["", "", "", "", "", ""]), [d, D] = y(!1), [h, A] = y(!1), [_, o] = y(""), [I, g] = y(0), [k, V] = y(a);
  ce(() => {
    if (I > 0) {
      const b = setTimeout(() => g(I - 1), 1e3);
      return () => clearTimeout(b);
    }
  }, [I]), ce(() => {
    s.every((b) => b !== "") && !d && Y();
  }, [s]);
  const w = J((b) => {
    o(""), c((C) => {
      const S = [...C], L = S.findIndex((O) => O === "");
      return L !== -1 && (S[L] = b), S;
    });
  }, []), T = J(() => {
    o(""), c((b) => {
      const C = [...b];
      for (let S = C.length - 1; S >= 0; S--)
        if (C[S] !== "") {
          C[S] = "";
          break;
        }
      return C;
    });
  }, []);
  ce(() => {
    const b = (C) => {
      d || (/^[0-9]$/.test(C.key) ? (C.preventDefault(), w(C.key)) : (C.key === "Backspace" || C.key === "Delete") && (C.preventDefault(), T()));
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [d, w, T]);
  const Y = async () => {
    const b = s.join("");
    if (b.length !== 6) {
      o(t("error_pin_incomplete", m));
      return;
    }
    if (D(!0), o(""), f) {
      setTimeout(() => {
        D(!1), n("mock-session-token", null);
      }, 1e3);
      return;
    }
    try {
      const C = await fetch(`${N}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": p || ""
        },
        body: JSON.stringify({
          verificationId: k,
          otp: b
        })
      });
      if (!C.ok) {
        const L = await C.json().catch(() => ({}));
        throw new Error(L.error || `Verification failed with status ${C.status}`);
      }
      const S = await C.json();
      S.success && S.sessionToken ? n(S.sessionToken, S.userAccount, S.business_token) : (o(S.error || t("invalid_code", m)), S.attemptsLeft !== void 0 && o(t("invalid_code_attempts", m).replace("{attempts}", S.attemptsLeft.toString())), c(["", "", "", "", "", ""]), l == null || l(S.error || t("verification_failed", m)));
    } catch {
      const S = t("error_verify_failed", m);
      o(S), c(["", "", "", "", "", ""]), l == null || l(S);
    } finally {
      D(!1);
    }
  }, W = async () => {
    if (!(I > 0 || h)) {
      if (A(!0), o(""), f) {
        setTimeout(() => {
          A(!1), g(60), c(["", "", "", "", "", ""]);
        }, 800);
        return;
      }
      try {
        const b = await fetch(`${N}/api/auth/resend-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ verificationId: k })
        });
        if (!b.ok) {
          const S = await b.json().catch(() => ({}));
          throw new Error(S.error || `Request failed with status ${b.status}`);
        }
        const C = await b.json();
        C.success ? (g(60), c(["", "", "", "", "", ""])) : o(C.error || t("error_resend_failed", m));
      } catch {
        o(t("error_resend_failed", m));
      } finally {
        A(!1);
      }
    }
  }, B = r.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ i("div", { className: "space-y-2 mb-8", children: [
          /* @__PURE__ */ e("h1", { className: "text-3xl font-bold tracking-tight text-main", children: t("verify_email", m) }),
          /* @__PURE__ */ i("p", { className: "text-muted text-sm font-medium", children: [
            t("enter_code", m),
            " ",
            /* @__PURE__ */ e("span", { className: "text-main font-semibold", children: B })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex justify-between gap-2 mb-6", children: s.map((b, C) => /* @__PURE__ */ i(
          "div",
          {
            className: `size-12 rounded-2xl dark:bg-black/20 bg-slate-100/50 flex items-center justify-center text-xl font-bold border transition-all ${b ? "text-brand dark:border-brand-30 border-brand-50" : "text-muted dark:border-white/10 border-slate-200"} ${_ ? "border-red-400 dark:border-red-500" : ""}`,
            children: [
              b,
              !b && s.findIndex((S) => S === "") === C && /* @__PURE__ */ e("div", { className: "w-0.5 h-6 bg-brand animate-pulse" })
            ]
          },
          C
        )) }),
        _ && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium text-center mb-4", children: _ }),
        /* @__PURE__ */ i("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => w(b.toString()),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-slate-100 dark:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: b
            },
            b
          )),
          /* @__PURE__ */ e("div", { className: "h-14" }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => w("0"),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-slate-100 dark:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: "0"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: T,
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-slate-100 dark:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main disabled:opacity-50",
              children: /* @__PURE__ */ e(Nt, { className: "w-6 h-6" })
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-auto pb-8 space-y-4", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Y,
              disabled: d || s.some((b) => b === ""),
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("verifying", m) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: t("verify", m) }),
                /* @__PURE__ */ e(Oe, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
              ] })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: W,
              disabled: I > 0 || h,
              className: "w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-2xl transition-all border dark:border-white/10 border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
              children: h ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-4 h-4 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("sending", m) })
              ] }) : I > 0 ? /* @__PURE__ */ i("span", { children: [
                t("resend_code", m),
                " (",
                I,
                "s)"
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Te, { className: "w-4 h-4" }),
                /* @__PURE__ */ e("span", { children: t("resend_code", m) })
              ] })
            }
          )
        ] })
      ]
    }
  );
}, Kt = ({ onNext: r, onSkip: a, language: n = "EN" }) => /* @__PURE__ */ i(
  P.div,
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    className: "flex-1 flex flex-col",
    children: [
      /* @__PURE__ */ i("div", { className: "p-6 pb-2", children: [
        /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ e("span", { className: "text-xs font-semibold uppercase tracking-widest text-brand/80", children: t("verification_step", n) }),
          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-muted", children: t("kyc_required", n) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-full bg-slate-200 dark:bg-brand/10 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
          "div",
          {
            className: "bg-brand h-full rounded-full",
            style: { width: "40%" }
          }
        ) })
      ] }),
      /* @__PURE__ */ i("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center gap-8", children: [
        /* @__PURE__ */ i("div", { className: "relative group", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" }),
          /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-full bg-gradient-to-tr from-brand-20 to-brand-5 flex items-center justify-center border border-brand-30 shadow-inner", children: /* @__PURE__ */ e(Fe, { className: "w-16 h-16 text-brand" }) }),
          /* @__PURE__ */ e("div", { className: "absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-brand flex items-center justify-center", children: /* @__PURE__ */ e(Te, { className: "w-4 h-4 text-brand" }) })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main leading-tight", children: t("security_upgrade_required", n) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed font-medium", children: t("security_upgrade_desc", n) })
        ] }),
        /* @__PURE__ */ i("div", { className: "flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-brand/10 rounded-xl text-[10px] font-bold text-brand uppercase tracking-tighter border border-brand-10", children: t("biometric_secure", n) }),
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-cyan-400/10 rounded-xl text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10", children: t("zero_knowledge", n) })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "p-8 space-y-4", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: r,
            className: "w-full bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-brand transition-all active:scale-[0.98]",
            children: t("start_upgrade", n)
          }
        ),
        a && /* @__PURE__ */ e(
          "button",
          {
            onClick: a,
            className: "w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors",
            children: t("do_this_later", n)
          }
        )
      ] })
    ]
  }
), ke = [
  "Position your face in the frame",
  "Blink 3 times naturally",
  "Open your mouth",
  "Hold still",
  "Processing verification..."
], Pe = (r, a) => Math.sqrt(Math.pow(r.x - a.x, 2) + Math.pow(r.y - a.y, 2)), Zt = ({
  requestId: r,
  onNext: a,
  onError: n,
  apiBaseUrl: l = "https://apis.casperid.com",
  apiKey: N = "",
  previewMode: p = !1,
  language: f = "EN"
}) => {
  const m = se(null), s = se(null), c = se(null), d = se([]), D = se(null), h = se(null), [A, _] = y(0), [o, I] = y(!1), [g, k] = y(""), [V, w] = y(!1), [T, Y] = y(!1), [W, B] = y(0), [b, C] = y(!1), [S, L] = y(0), O = se(0), F = se(0), G = se(!1), Q = se(0), de = se(!1), ue = (v) => {
    O.current = v, _(v);
  }, te = (v) => {
    F.current = v, B(v);
  }, ie = (v) => {
    G.current = v, C(v);
  }, q = (v) => {
    Q.current = v, L(v);
  }, pe = A === 0 ? 0 : A === 1 ? W / 3 * 100 : A === 2 ? S : A === 3 ? 100 : Math.min(100, Math.round(A / (ke.length - 1) * 100));
  ce(() => ((async () => {
    try {
      const { FaceMesh: M } = await import("./face_mesh-DYMPc5Ce.js").then((z) => z.f), { Camera: Z } = await import("./camera_utils-BQaOSBPu.js").then((z) => z.c), fe = new M({
        locateFile: (z) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${z}`
      });
      if (fe.setOptions({
        maxNumFaces: 1,
        refineLandmarks: !0,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3
      }), console.log("✅ MediaPipe FaceMesh loaded successfully"), fe.onResults(K), D.current = fe, m.current) {
        const z = new Z(m.current, {
          onFrame: async () => {
            D.current && m.current && await D.current.send({ image: m.current });
          },
          width: 640,
          height: 480
        });
        await z.start(), h.current = z, I(!0), console.log("📹 Camera started successfully");
      }
    } catch (M) {
      console.error("FaceMesh initialization error:", M), M.name === "NotAllowedError" ? (Y(!0), k("Camera permission denied. Please enable camera access.")) : k("Unable to initialize face detection. Please try again."), n == null || n("FaceMesh initialization failed");
    }
  })(), () => {
    h.current && h.current.stop(), c.current && c.current.getTracks().forEach((M) => M.stop());
  }), []);
  const K = (v) => {
    if (!s.current || V) return;
    const M = s.current, Z = M.getContext("2d");
    if (!(!Z || !v.image))
      if (Z.save(), Z.clearRect(0, 0, M.width, M.height), Z.translate(M.width, 0), Z.scale(-1, 1), Z.drawImage(v.image, 0, 0, M.width, M.height), Z.restore(), v.multiFaceLandmarks && v.multiFaceLandmarks.length > 0) {
        const fe = v.multiFaceLandmarks[0];
        me(fe);
      } else
        console.log("⚠️ No face detected in frame");
  }, me = (v) => {
    const M = O.current, Z = F.current, fe = G.current;
    if (M === 0) {
      const z = v[1], X = z.x > 0.35 && z.x < 0.65 && z.y > 0.35 && z.y < 0.65;
      Math.random() < 0.05 && console.log(`📍 Face position: x=${z.x.toFixed(2)}, y=${z.y.toFixed(2)} (centered: ${X})`), X && (console.log("✅ Face centered! Advancing to blink detection..."), setTimeout(() => ue(1), 500));
    } else if (M === 1) {
      const z = Pe(v[159], v[145]), X = Pe(v[33], v[133]), he = z / X;
      if (Math.random() < 0.1 && console.log(`👁️ Eye ratio: ${he.toFixed(3)} (threshold: 0.16, ${he < 0.16 ? "CLOSED" : "OPEN"})`), he < 0.16)
        fe || (console.log("👁️ Blink started (eye closed)"), ie(!0));
      else if (fe) {
        const H = Z + 1;
        console.log(`✅ Blink detected! Count: ${H}/3`), ie(!1), te(H), ee(), H >= 3 && (console.log("🎉 All 3 blinks completed! Moving to mouth opening step..."), setTimeout(() => {
          ue(2), q(0);
        }, 300));
      }
    } else if (M === 2) {
      const z = v[13], X = v[14], he = Pe(z, X), H = v[10], oe = v[152], ge = Pe(H, oe), ae = he / ge, ye = Math.min(ae / 0.15 * 100, 100);
      q(ye), d.current.length < 15 && ee(), ae > 0.12 && d.current.length >= 10 && !de.current && (de.current = !0, ee(), setTimeout(() => {
        ue(3), ne();
      }, 500));
    }
  }, ee = () => {
    !s.current || d.current.length >= 25 || s.current.toBlob((v) => {
      v && d.current.push(v);
    }, "image/jpeg", 0.8);
  }, ne = async () => {
    var v, M, Z, fe;
    if (w(!0), ue(4), p) {
      setTimeout(() => {
        w(!1), a(!0);
      }, 2e3);
      return;
    }
    try {
      const z = new FormData(), X = !!r, he = X ? `${l}/api/v2/verification/liveness` : `${l}/api/ai/verify-liveness-sequence`;
      if (X) {
        z.append("requestId", r);
        const ae = {
          totalFrames: d.current.length,
          stepSequence: ["blink", "open_mouth"],
          timestamp: Date.now()
        };
        z.append("metadata", JSON.stringify(ae)), d.current.slice(-10).forEach((Ae, De) => {
          z.append("imageFrames", Ae, `frame_${De}.jpg`);
        });
      } else
        d.current.forEach((ae, ye) => {
          z.append(`frame_${ye}`, ae, `frame_${ye}.jpg`);
        }), z.append("totalFrames", d.current.length.toString()), z.append("stepSequence", JSON.stringify(["blink", "open_mouth"]));
      const H = await fetch(he, {
        method: "POST",
        headers: {
          ...N ? { "X-App-Id": N } : {}
        },
        body: z,
        credentials: "include"
      });
      if (!H.ok) {
        const ae = await H.json().catch(() => ({}));
        throw new Error(ae.error || `Liveness check failed with status ${H.status}`);
      }
      const oe = await H.json();
      if (X ? oe.success && (((v = oe.liveness) == null ? void 0 : v.success) || ((M = oe.liveness) == null ? void 0 : M.status) === "completed" || ((Z = oe.liveness) == null ? void 0 : Z.status) === "approved") : oe.success && oe.passed)
        h.current && h.current.stop(), c.current && c.current.getTracks().forEach((ae) => ae.stop()), a(!0);
      else {
        const ae = oe.error || ((fe = oe.liveness) == null ? void 0 : fe.error) || "Liveness check failed. Please try again.";
        k(ae), ue(0), te(0), q(0), d.current = [], w(!1), de.current = !1;
      }
    } catch {
      k("Verification failed. Please try again."), ue(0), te(0), q(0), d.current = [], w(!1), n == null || n("Liveness submission failed");
    }
  }, U = () => {
    k(""), ue(0), te(0), q(0), d.current = [], w(!1), de.current = !1;
  };
  return T ? /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center bg-black",
      children: [
        /* @__PURE__ */ e("div", { className: "w-16 h-16 text-red-500 mb-6 text-5xl", children: "⚠️" }),
        /* @__PURE__ */ e("h2", { className: "text-xl font-bold text-white mb-3", children: "Camera Access Required" }),
        /* @__PURE__ */ e("p", { className: "text-gray-400 text-sm mb-6", children: "Please enable camera access in your browser settings to continue with face verification." }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "px-6 py-3 bg-[#8651e1] text-white rounded-2xl font-bold",
            children: "Try Again"
          }
        )
      ]
    }
  ) : /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative bg-black overflow-hidden",
      children: [
        /* @__PURE__ */ e(
          "video",
          {
            ref: m,
            className: "hidden",
            playsInline: !0,
            muted: !0
          }
        ),
        /* @__PURE__ */ e("div", { className: "absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#8651e1]/5 to-[#8651e1]/10 pointer-events-none" }),
        /* @__PURE__ */ e("div", { className: "relative z-20 flex-1 flex flex-col items-center justify-center pt-8", children: /* @__PURE__ */ i("div", { className: "relative w-72 h-96 flex items-center justify-center", children: [
          /* @__PURE__ */ i("div", { className: "absolute inset-0 rounded-[3rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-2xl", children: [
            /* @__PURE__ */ e(
              "canvas",
              {
                ref: s,
                width: 640,
                height: 480,
                className: "w-full h-full object-cover"
              }
            ),
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-[#8651e1]/10 mix-blend-overlay" }),
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent h-1/3 mt-auto" })
          ] }),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 z-30 pointer-events-none", children: [
            { t: "30%", l: "50%" },
            { t: "35%", l: "40%" },
            { t: "35%", l: "60%" },
            { t: "45%", l: "50%" },
            { t: "52%", l: "35%" },
            { t: "52%", l: "65%" },
            { t: "60%", l: "45%" },
            { t: "60%", l: "55%" },
            { t: "70%", l: "50%" }
          ].map((v, M) => /* @__PURE__ */ e(
            P.div,
            {
              initial: { scale: 0, opacity: 0 },
              animate: {
                scale: [0, 1.5, 1],
                opacity: pe > M * 11 ? 1 : 0
              },
              className: "absolute w-2 h-2 bg-[#6DE8EC] rounded-full shadow-[0_0_12px_#6DE8EC]",
              style: { top: v.t, left: v.l }
            },
            M
          )) }),
          /* @__PURE__ */ i("div", { className: "absolute -inset-6 z-40", children: [
            /* @__PURE__ */ e(
              P.div,
              {
                animate: { opacity: [0.3, 1, 0.3] },
                transition: { duration: 2, repeat: 1 / 0 },
                className: "absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#14b8a6] rounded-tl-[3.5rem]"
              }
            ),
            /* @__PURE__ */ e(
              P.div,
              {
                animate: { opacity: [0.3, 1, 0.3] },
                transition: { duration: 2, repeat: 1 / 0 },
                className: "absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#14b8a6] rounded-tr-[3.5rem]"
              }
            ),
            /* @__PURE__ */ e(
              P.div,
              {
                animate: { opacity: [0.3, 1, 0.3] },
                transition: { duration: 2, repeat: 1 / 0 },
                className: "absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#14b8a6] rounded-bl-[3.5rem]"
              }
            ),
            /* @__PURE__ */ e(
              P.div,
              {
                animate: { opacity: [0.3, 1, 0.3] },
                transition: { duration: 2, repeat: 1 / 0 },
                className: "absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#14b8a6] rounded-br-[3.5rem]"
              }
            )
          ] }),
          /* @__PURE__ */ e(
            P.div,
            {
              animate: { top: ["0%", "100%"] },
              transition: { duration: 3, repeat: 1 / 0, ease: "linear" },
              className: "absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent shadow-[0_0_15px_#6DE8EC] z-50 pointer-events-none",
              style: { borderRadius: "100%" }
            }
          )
        ] }) }),
        /* @__PURE__ */ i("div", { className: "relative z-50 px-8 pb-20 pt-4 flex flex-col items-center gap-6", children: [
          g ? /* @__PURE__ */ i(
            P.div,
            {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              className: "bg-red-900/30 border border-red-500/50 p-6 rounded-3xl w-full text-center",
              children: [
                /* @__PURE__ */ e("p", { className: "text-red-400 font-bold text-lg mb-4", children: g }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: U,
                    className: "px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors",
                    children: "Try Again"
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ e(Me, { mode: "wait", children: /* @__PURE__ */ e(
            P.div,
            {
              initial: { opacity: 0, y: 10, filter: "blur(5px)" },
              animate: { opacity: 1, y: 0, filter: "blur(0px)" },
              exit: { opacity: 0, y: -10, filter: "blur(5px)" },
              className: "text-white text-center font-bold text-xl leading-tight min-h-[3rem] flex items-center justify-center drop-shadow-lg flex-col gap-2",
              children: V && A === 4 ? /* @__PURE__ */ i("span", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ i("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ e("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ e("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                ke[A]
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: ke[A] }),
                A === 1 && /* @__PURE__ */ i("span", { className: "text-[#6DE8EC] text-2xl", children: [
                  "(",
                  W,
                  "/3)"
                ] })
              ] })
            },
            A === 1 ? `${ke[A]}-${W}` : ke[A]
          ) }),
          /* @__PURE__ */ e("div", { className: "w-full max-w-[240px] h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            P.div,
            {
              className: "h-full bg-gradient-to-r from-[#8651e1] to-[#6DE8EC]",
              animate: { width: `${pe}%` },
              transition: { duration: 0.3 }
            }
          ) }),
          !g && /* @__PURE__ */ i("div", { className: "flex items-center gap-2 text-gray-400 text-xs", children: [
            /* @__PURE__ */ e("div", { className: `w-2 h-2 rounded-full ${o ? "bg-[#6DE8EC] shadow-[0_0_8px_#6DE8EC]" : "bg-yellow-500 animate-pulse"}` }),
            /* @__PURE__ */ e("span", { className: "uppercase tracking-widest font-bold", children: o ? "LIVE CAMERA" : "INITIALIZING..." })
          ] })
        ] })
      ]
    }
  );
}, Xt = [
  { id: "passport", title: "Passport", desc: "All countries supported", Icon: et },
  { id: "drivers_license", title: "Driver License", desc: "Government issued card", Icon: Qe },
  { id: "national_id", title: "ID Card", desc: "National identity document", Icon: qe }
], Qt = ({ onNext: r, language: a = "EN" }) => /* @__PURE__ */ i(
  P.div,
  {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    className: "flex-1 px-6 pt-4 flex flex-col",
    children: [
      /* @__PURE__ */ e("h3", { className: "text-2xl font-bold mb-2 text-main", children: t("verify_identity", a) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-sm mb-8 leading-relaxed", children: t("choose_document", a) }),
      /* @__PURE__ */ i("div", { className: "space-y-4 overflow-y-auto pr-1 pb-6", children: [
        Xt.map(({ id: n, title: l, desc: N, Icon: p }) => /* @__PURE__ */ i(
          "button",
          {
            onClick: () => r(n),
            className: "w-full group cursor-pointer dark:bg-white/5 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:dark:bg-brand/15 hover:bg-brand/5 hover:dark:border-brand-40 hover:border-brand-30 transition-all transform hover:-translate-y-1",
            children: [
              /* @__PURE__ */ e("div", { className: "w-14 h-14 rounded-xl dark:bg-slate-800/50 bg-white flex items-center justify-center text-brand group-hover:bg-brand/20 transition-colors border dark:border-transparent border-slate-100", children: /* @__PURE__ */ e(p, { className: "w-8 h-8" }) }),
              /* @__PURE__ */ i("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ e("h4", { className: "font-bold text-base text-main", children: t(n, a) }),
                /* @__PURE__ */ e("p", { className: "text-xs text-muted font-medium", children: t(`${n}_desc`, a) })
              ] }),
              /* @__PURE__ */ e(Le, { className: "text-brand w-5 h-5" })
            ]
          },
          n
        )),
        /* @__PURE__ */ i("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-brand-30 border-brand-40", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent" }),
          /* @__PURE__ */ i("div", { className: "text-center z-10", children: [
            /* @__PURE__ */ e(Se, { className: "text-brand/40 w-10 h-10 mx-auto mb-1" }),
            /* @__PURE__ */ e("p", { className: "text-[10px] text-muted uppercase tracking-tighter font-bold", children: "Encrypted E2E" })
          ] })
        ] })
      ] })
    ]
  }
), ei = (r) => ({
  passport: t("passport", r),
  drivers_license: t("drivers_license", r),
  national_id: t("national_id", r)
}), ti = ({
  requestId: r,
  documentType: a,
  onNext: n,
  onError: l,
  apiBaseUrl: N = "https://apis.casperid.com",
  apiKey: p = "",
  previewMode: f = !1,
  language: m = "EN"
}) => {
  const s = se(null), c = se(null), d = se(null), [D, h] = y(!1), [A, _] = y(null), [o, I] = y(null), [g, k] = y(!1), [V, w] = y(""), [T, Y] = y("front"), [W, B] = y(null);
  ce(() => ((async () => {
    try {
      const O = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // Use back camera for documents
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      d.current = O, s.current && (s.current.srcObject = O, s.current.onloadedmetadata = () => {
        h(!0);
      });
    } catch {
      try {
        const F = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        d.current = F, s.current && (s.current.srcObject = F, s.current.onloadedmetadata = () => {
          h(!0);
        });
      } catch {
        w(t("unable_access_camera", m)), l == null || l("Camera access failed");
      }
    }
  })(), () => {
    d.current && d.current.getTracks().forEach((O) => O.stop()), o && URL.revokeObjectURL(o);
  }), [l]);
  const b = async () => {
    if (!s.current || !c.current) return;
    const L = c.current, O = s.current, F = L.getContext("2d");
    F && (L.width = O.videoWidth, L.height = O.videoHeight, F.drawImage(O, 0, 0), L.toBlob((G) => {
      G && (_(G), I(URL.createObjectURL(G)));
    }, "image/jpeg", 0.9));
  }, C = () => {
    o && URL.revokeObjectURL(o), _(null), I(null), w("");
  }, S = async () => {
    if (k(!0), f) {
      setTimeout(() => {
        k(!1), n({
          first_name: "JOHN",
          last_name: "DOE",
          date_of_birth: "01 JAN 1990",
          nationality: ""
        }, "mock-upload-id-789", {
          frontImageUrl: "mock-front-url",
          frontImageFileId: "mock-front-id",
          backImageUrl: "mock-back-url",
          backImageFileId: "mock-back-id"
        });
      }, 2e3);
      return;
    }
    if (!A) {
      k(!1);
      return;
    }
    if (T === "front" && a !== "passport") {
      B(A), _(null), I(null), Y("back"), k(!1);
      return;
    }
    k(!0), w("");
    try {
      const L = new FormData();
      L.append("document_type", a), W ? (L.append("front_image", W, "front.jpg"), L.append("back_image", A, "back.jpg")) : L.append("front_image", A, "document.jpg");
      const O = await fetch(`${N}/api/v2/verification/layer3/documents/upload`, {
        method: "POST",
        body: L,
        credentials: "include",
        headers: {
          "X-Request-Id": r,
          ...p ? { "X-App-Id": p } : {}
        }
      });
      if (!O.ok) {
        const G = await O.json().catch(() => ({}));
        throw new Error(G.error || `Document upload failed with status ${O.status}`);
      }
      const F = await O.json();
      F.success && F.extracted_data ? (d.current && d.current.getTracks().forEach((G) => G.stop()), n(F.extracted_data, F.upload_id || "", {
        frontImageUrl: F.front_image_url,
        frontImageFileId: F.front_image_file_id,
        backImageUrl: F.back_image_url,
        backImageFileId: F.back_image_file_id
      })) : (w(F.error || "Failed to process document. Please try again."), k(!1));
    } catch {
      w("Upload failed. Please try again."), k(!1), l == null || l("Document upload failed");
    }
  };
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative",
      children: [
        /* @__PURE__ */ e("canvas", { ref: c, className: "hidden" }),
        /* @__PURE__ */ i("div", { className: "absolute inset-0 z-0", children: [
          /* @__PURE__ */ e("div", { className: "w-full h-full bg-slate-800 flex items-center justify-center", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" }) }),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-[2px]" })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative z-10 p-6 flex flex-col items-center", children: /* @__PURE__ */ e("div", { className: "text-center px-4 py-2 dark:bg-black/40 bg-white/40 backdrop-blur-xl rounded-full border dark:border-white/10 border-black/5", children: /* @__PURE__ */ e("h3", { className: "text-main text-sm font-medium tracking-wide uppercase", children: t("scan_instruction", m).replace("{side}", t(T, m)).replace("{docType}", ei(m)[a]) }) }) }),
        /* @__PURE__ */ e("div", { className: "relative z-10 flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ i("div", { className: "w-full aspect-[1.58/1] relative", children: [
          o ? /* @__PURE__ */ e(
            "img",
            {
              src: o,
              alt: "Captured document",
              className: "absolute inset-0 w-full h-full object-cover rounded-2xl"
            }
          ) : /* @__PURE__ */ e(
            "video",
            {
              ref: s,
              autoPlay: !0,
              playsInline: !0,
              muted: !0,
              className: "absolute inset-0 w-full h-full object-cover rounded-2xl"
            }
          ),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 border border-[#6DE8EC] rounded-2xl shadow-[0_0_20px_rgba(109,232,236,0.3),inset_0_0_15px_rgba(109,232,236,0.2)]" }),
          /* @__PURE__ */ e("div", { className: "absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#6DE8EC] rounded-tl-2xl" }),
          /* @__PURE__ */ e("div", { className: "absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#6DE8EC] rounded-tr-2xl" }),
          /* @__PURE__ */ e("div", { className: "absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#6DE8EC] rounded-bl-2xl" }),
          /* @__PURE__ */ e("div", { className: "absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#6DE8EC] rounded-br-2xl" }),
          !o && D && /* @__PURE__ */ e(
            P.div,
            {
              animate: { top: ["0%", "100%", "0%"] },
              transition: { duration: 4, repeat: 1 / 0, ease: "linear" },
              className: "absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
            }
          ),
          !D && !o && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl", children: /* @__PURE__ */ e(_e, { className: "w-8 h-8 text-[#6DE8EC] animate-spin" }) })
        ] }) }),
        V && /* @__PURE__ */ i("div", { className: "relative z-10 mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3", children: [
          /* @__PURE__ */ e(ve, { className: "w-5 h-5 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-sm font-medium", children: V })
        ] }),
        /* @__PURE__ */ i("div", { className: "relative z-10 p-8 dark:bg-black/60 bg-white/60 backdrop-blur-2xl border-t dark:border-white/10 border-black/5 rounded-t-3xl", children: [
          /* @__PURE__ */ e("p", { className: "text-muted text-xs text-center mb-6 font-medium", children: t(o ? "review_capture" : "align_document", m) }),
          /* @__PURE__ */ e("div", { className: "flex items-center justify-between gap-4", children: o ? /* @__PURE__ */ i(re, { children: [
            /* @__PURE__ */ e(
              "button",
              {
                onClick: C,
                disabled: g,
                className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted disabled:opacity-50",
                children: /* @__PURE__ */ e(Rt, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: S,
                disabled: g,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-70",
                children: g ? /* @__PURE__ */ i(re, { children: [
                  /* @__PURE__ */ e(_e, { className: "w-6 h-6 animate-spin" }),
                  /* @__PURE__ */ e("span", { children: t("processing", m) })
                ] }) : /* @__PURE__ */ e("span", { children: t(T === "front" && a !== "passport" ? "next_back_side" : "confirm", m) })
              }
            ),
            /* @__PURE__ */ e("div", { className: "w-12 h-12" }),
            " "
          ] }) : /* @__PURE__ */ i(re, { children: [
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(It, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ i(
              "button",
              {
                onClick: b,
                disabled: !D,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-50",
                children: [
                  /* @__PURE__ */ e(wt, { className: "w-6 h-6" }),
                  /* @__PURE__ */ e("span", { children: t("capture", m) })
                ]
              }
            ),
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(kt, { className: "w-6 h-6" }) })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "w-32 h-1.5 bg-slate-600/30 rounded-full mx-auto mt-8" })
        ] })
      ]
    }
  );
}, ii = ({
  requestId: r,
  documentType: a,
  extractedData: n,
  uploadId: l,
  frontImageUrl: N,
  frontImageFileId: p,
  backImageUrl: f,
  backImageFileId: m,
  onNext: s,
  onRetake: c,
  onError: d,
  apiBaseUrl: D = "https://apis.casperid.com",
  apiKey: h = "",
  previewMode: A = !1,
  language: _ = "EN"
}) => {
  const [o, I] = y({
    firstName: n.first_name || "",
    lastName: n.last_name || "",
    documentNumber: n.document_number || "",
    dateOfBirth: n.date_of_birth || "",
    nationality: n.nationality || "",
    gender: n.gender || ""
  }), [g, k] = y(!1), [V, w] = y(""), T = (b, C) => {
    I((S) => ({ ...S, [b]: C }));
  }, Y = async () => {
    if (!o.firstName || !o.lastName || !o.documentNumber) {
      w(t("error_required_fields", _));
      return;
    }
    if (k(!0), w(""), A) {
      setTimeout(() => {
        k(!1), s({
          first_name: o.firstName,
          last_name: o.lastName,
          document_number: o.documentNumber,
          date_of_birth: o.dateOfBirth,
          nationality: o.nationality,
          gender: o.gender,
          document_type: a
        });
      }, 1500);
      return;
    }
    try {
      const b = await fetch(`${D}/api/v2/verification/layer3/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...h ? { "X-App-Id": h } : {}
        },
        credentials: "include",
        body: JSON.stringify({
          upload_id: l,
          front_image_url: N,
          front_image_file_id: p,
          back_image_url: f,
          back_image_file_id: m,
          liveness_verified: !1,
          // Will be updated after FaceScan
          document_data: {
            first_name: o.firstName,
            last_name: o.lastName,
            document_number: o.documentNumber,
            date_of_birth: o.dateOfBirth,
            nationality: o.nationality,
            gender: o.gender,
            document_type: a
          }
        })
      });
      if (!b.ok) {
        const S = await b.json().catch(() => ({}));
        throw new Error(S.error || `Data submission failed with status ${b.status}`);
      }
      const C = await b.json();
      C.success ? s({
        first_name: o.firstName,
        last_name: o.lastName,
        document_number: o.documentNumber,
        date_of_birth: o.dateOfBirth,
        nationality: o.nationality,
        gender: o.gender,
        document_type: a
      }) : (w(C.error || "Failed to submit data. Please try again."), k(!1));
    } catch {
      w("Failed to submit data. Please try again."), k(!1), d == null || d("Data submission failed");
    }
  }, W = n.confidence || 0, B = Math.round(W);
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 overflow-y-auto px-6 pb-6",
      children: [
        /* @__PURE__ */ e("div", { className: "flex gap-1 mb-6", children: [1, 2, 3, 0].map((b, C) => /* @__PURE__ */ e(
          "div",
          {
            className: `h-1 flex-1 rounded-xl ${b ? "bg-brand" : "bg-brand/20"}`
          },
          C
        )) }),
        /* @__PURE__ */ i("div", { className: "mb-6", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold text-main mb-2", children: t("review_data", _) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: t("verify_data_desc", _) })
        ] }),
        W > 0 && /* @__PURE__ */ i("div", { className: "mb-6 p-3 rounded-xl dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-semibold text-muted", children: t("ocr_confidence", _) }),
            /* @__PURE__ */ i("span", { className: `text-xs font-bold ${B >= 80 ? "text-green-500" : B >= 60 ? "text-yellow-500" : "text-red-500"}`, children: [
              B,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            "div",
            {
              className: `h-full rounded-full transition-all ${B >= 80 ? "bg-green-500" : B >= 60 ? "bg-yellow-500" : "bg-red-500"}`,
              style: { width: `${B}%` }
            }
          ) }),
          B < 80 && /* @__PURE__ */ e("p", { className: "text-[10px] text-yellow-500 mt-2", children: t("verify_data_carefully", _) })
        ] }),
        V && /* @__PURE__ */ i("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2", children: [
          /* @__PURE__ */ e(ve, { className: "w-4 h-4 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-xs font-medium", children: V })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-5", children: [
          /* @__PURE__ */ i("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ i("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("first_name", _) || "First Name" }),
              /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
                /* @__PURE__ */ e(zt, { className: "text-brand mr-3 w-5 h-5 shrink-0" }),
                /* @__PURE__ */ e("div", { className: "flex flex-col w-full", children: /* @__PURE__ */ e(
                  "input",
                  {
                    className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    type: "text",
                    value: o.firstName,
                    onChange: (b) => T("firstName", b.target.value),
                    placeholder: t("enter_first_name", _) || "First name"
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ i("div", { className: "space-y-3", children: [
              /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("last_name", _) || "Last Name" }),
              /* @__PURE__ */ e("div", { className: "flex items-center px-1 transition-all", children: /* @__PURE__ */ e("div", { className: "flex flex-col w-full", children: /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  type: "text",
                  value: o.lastName,
                  onChange: (b) => T("lastName", b.target.value),
                  placeholder: t("enter_last_name", _) || "Last name"
                }
              ) }) })
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("id_number", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(Qe, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  type: "text",
                  value: o.documentNumber,
                  onChange: (b) => T("documentNumber", b.target.value),
                  placeholder: t("enter_doc_number", _)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("date_of_birth", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(vt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  type: "text",
                  value: o.dateOfBirth,
                  onChange: (b) => T("dateOfBirth", b.target.value),
                  placeholder: t("date_format", _)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("nationality", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(et, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  type: "text",
                  value: o.nationality,
                  onChange: (b) => T("nationality", b.target.value),
                  placeholder: t("enter_nationality", _)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-brand-20 group", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-gradient-to-tr from-brand-20 to-cyan-500/10 blur-sm" }),
            /* @__PURE__ */ i("div", { className: "absolute inset-0 bg-brand/10 flex flex-col items-center justify-center p-4", children: [
              /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ e(Ce, { className: "text-brand w-5 h-5" }),
                /* @__PURE__ */ e("span", { className: "text-xs font-bold dark:text-slate-200 text-slate-700", children: t("scanned_successfully", _) })
              ] }),
              c && /* @__PURE__ */ e(
                "button",
                {
                  onClick: c,
                  className: "mt-2 text-[10px] text-brand underline font-medium",
                  type: "button",
                  children: t("retake_photo", _)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-8", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Y,
              disabled: g,
              className: "w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70",
              children: g ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("submitting", _) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: t("confirm_mint", _) }),
                /* @__PURE__ */ e(Pt, { className: "w-5 h-5" })
              ] })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-center text-[10px] mt-4 text-slate-500", children: t("secured_by_casper", _) })
        ] })
      ]
    }
  );
}, ai = (r, a) => r === "layer_1" ? {
  processing: {
    title: t("generating_wallet", a),
    subtitle: t("wallet_subtitle", a)
  },
  minting: {
    title: t("minting_did", a),
    subtitle: t("did_subtitle", a)
  },
  completed: {
    title: t("identity_created", a),
    subtitle: t("identity_created_subtitle", a)
  },
  failed: {
    title: t("setup_failed", a),
    subtitle: t("setup_failed_subtitle", a)
  }
} : r === "layer_2" ? {
  processing: {
    title: t("processing_liveness", a),
    subtitle: t("processing_subtitle", a)
  },
  minting: {
    title: t("minting_identity", a),
    subtitle: t("minting_subtitle", a)
  },
  completed: {
    title: t("identity_verified", a),
    subtitle: t("identity_verified_subtitle", a)
  },
  failed: {
    title: t("verification_failed", a),
    subtitle: t("verification_failed_subtitle", a)
  }
} : {
  processing: {
    title: t("processing_documents", a),
    subtitle: t("processing_subtitle", a)
  },
  minting: {
    title: t("submitting_for_review", a),
    subtitle: t("submitting_review_subtitle", a)
  },
  completed: {
    title: t("verification_submitted", a),
    subtitle: t("verification_submitted_subtitle", a)
  },
  failed: {
    title: t("verification_failed", a),
    subtitle: t("verification_failed_subtitle", a)
  }
}, ri = ({
  tier: r,
  sessionToken: a,
  requestId: n,
  onNext: l,
  onError: N,
  apiBaseUrl: p = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: m = !1,
  language: s = "EN"
}) => {
  const [c, d] = y("processing"), [D, h] = y(0), [A, _] = y(""), [o, I] = y(null), [g, k] = y(null), [V, w] = y(null), [T, Y] = y(null), W = se(!1), b = ai(r, s)[c];
  ce(() => {
    W.current || (W.current = !0, m ? C() : S());
  }, []);
  const C = async () => {
    d("processing"), h(20), await Q(1e3), h(50), await Q(1e3), d("minting"), h(70), await Q(1e3), h(100), d("completed"), r === "layer_1" ? (I("account-hash-abc123..."), Y("casper-user-1234"), k("did:casper:abc123...")) : w("mock-credential-hash-xyz"), await Q(1500), l({
      wallet: "account-hash-abc123...",
      didAddress: "did:casper:abc123...",
      credentialHash: "mock-credential-hash-xyz"
    });
  }, S = async () => {
    try {
      r === "layer_1" ? await L() : await G();
    } catch (ie) {
      const q = ie instanceof Error ? ie.message : "Setup failed";
      _(q), d("failed"), N == null || N(q);
    }
  }, L = async () => {
    var me;
    d("processing"), h(10);
    const ie = await fetch(`${p}/api/passkey/wallet/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${a}`,
        ...f ? { "X-App-Id": f } : {}
      },
      credentials: "include"
    });
    if (!ie.ok) {
      const ee = await ie.json().catch(() => ({}));
      throw new Error(ee.error || "Failed to generate wallet");
    }
    const q = await ie.json();
    if (!q.success || !((me = q.walletInfo) != null && me.walletAddress))
      throw new Error(q.error || "Wallet generation failed");
    I(q.walletInfo.walletAddress), q.walletInfo.humanId && Y(q.walletInfo.humanId), h(50), d("minting"), h(60);
    const pe = await fetch(`${p}/api/passkey/did/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${a}`,
        ...f ? { "X-App-Id": f } : {}
      },
      credentials: "include"
    });
    if (!pe.ok) {
      const ee = await pe.json().catch(() => ({}));
      throw new Error(ee.error || "Failed to mint DID");
    }
    const K = await pe.json();
    if (!K.success)
      throw new Error(K.error || "DID minting failed");
    k(K.did_address), w(K.transaction_hash), h(100), d("completed"), await Q(1500), l({
      wallet: q.walletInfo.walletAddress,
      didAddress: K.did_address,
      credentialHash: K.transaction_hash
    });
  }, O = async () => {
    var pe, K, me, ee;
    if (d("processing"), h(20), !n)
      throw new Error("No verification request ID provided");
    const ie = 10, q = 1500;
    for (let ne = 0; ne < ie; ne++)
      try {
        const U = await fetch(`${p}/api/v2/verification/${n}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include"
        });
        if (!U.ok)
          throw new Error("Failed to check verification status");
        const v = await U.json(), M = (pe = v.verification) == null ? void 0 : pe.status;
        if (h(Math.min(20 + ne * 8, 80)), M === "completed") {
          d("minting"), h(90), await Q(500), h(100), d("completed");
          const Z = (me = (K = v.verification) == null ? void 0 : K.results) == null ? void 0 : me.proofHash;
          await Q(1500), l({ credentialHash: Z || n });
          return;
        }
        if (M === "failed")
          throw new Error(((ee = v.verification) == null ? void 0 : ee.error) || "Verification failed");
        await Q(q);
      } catch (U) {
        if (ne === ie - 1)
          throw U;
        await Q(q);
      }
    d("minting"), h(90), await Q(500), h(100), d("completed"), await Q(1500), l({ credentialHash: n });
  }, F = async () => {
    d("processing"), h(30), await Q(800), h(60), d("minting"), h(80), await Q(800), h(100), d("completed"), await Q(2e3), l({ credentialHash: n });
  }, G = async () => {
    r === "layer_2" ? await O() : await F();
  }, Q = (ie) => new Promise((q) => setTimeout(q, ie)), de = () => {
    d("processing"), h(0), _(""), W.current = !1, m ? C() : S();
  }, ue = () => r === "layer_1" ? c === "minting" ? /* @__PURE__ */ e(Ie, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(Vt, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(it, { className: "text-brand w-4 h-4" }), te = () => {
    if (r === "layer_1") {
      if (c === "processing") return t("creating_wallet", s);
      if (c === "minting") return t("minting_did_chain", s);
      if (c === "completed") return t("identity_live", s);
    } else {
      if (c === "processing") return t("validating_docs", s);
      if (c === "minting") return t("submitting_verification", s);
      if (c === "completed") return t("verification_queued", s);
    }
    return "";
  };
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
      children: [
        /* @__PURE__ */ i("div", { className: "relative w-64 h-64 flex items-center justify-center mb-12", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full border-4 border-dashed border-brand-20 animate-[spin_10s_linear_infinite]" }),
          /* @__PURE__ */ e("div", { className: "absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" }),
          /* @__PURE__ */ i(
            P.div,
            {
              animate: c !== "failed" ? { rotateY: [0, 180, 360], y: [-10, 10, -10] } : {},
              transition: { duration: 6, repeat: 1 / 0, ease: "easeInOut" },
              className: `relative w-40 h-56 backdrop-blur-xl border rounded-2xl flex flex-col p-4 ${c === "completed" ? "bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]" : c === "failed" ? "bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]" : "bg-brand/10 border-brand-30 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]"}`,
              children: [
                /* @__PURE__ */ i("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded flex items-center justify-center ${c === "completed" ? "bg-green-500/30" : c === "failed" ? "bg-red-500/30" : "bg-brand/30"}`, children: c === "completed" ? /* @__PURE__ */ e(Ce, { className: "text-green-500 w-4 h-4" }) : c === "failed" ? /* @__PURE__ */ e(ve, { className: "text-red-500 w-4 h-4" }) : ue() }),
                  /* @__PURE__ */ e("div", { className: `w-6 h-1 rounded-full ${c === "completed" ? "bg-green-500/40" : c === "failed" ? "bg-red-500/40" : "bg-brand/40"}` })
                ] }),
                /* @__PURE__ */ i("div", { className: "space-y-3 mb-auto", children: [
                  /* @__PURE__ */ e("div", { className: `h-2 w-3/4 rounded-full ${c === "completed" ? "bg-green-500/20" : c === "failed" ? "bg-red-500/20" : "bg-brand/20"}` }),
                  /* @__PURE__ */ e("div", { className: `h-2 w-1/2 rounded-full ${c === "completed" ? "bg-green-500/20" : c === "failed" ? "bg-red-500/20" : "bg-brand/20"}` })
                ] }),
                /* @__PURE__ */ i("div", { className: "flex items-center gap-2 mt-4", children: [
                  /* @__PURE__ */ e("div", { className: `size-6 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 ${c === "completed" ? "bg-gradient-to-tr from-green-500 to-[#6DE8EC]" : c === "failed" ? "bg-gradient-to-tr from-red-500 to-orange-500" : "bg-gradient-to-tr from-brand to-[#6DE8EC]"}` }),
                  /* @__PURE__ */ i("div", { className: "flex flex-col items-start max-w-[80px]", children: [
                    T ? /* @__PURE__ */ e(
                      P.span,
                      {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        className: "text-[10px] font-bold text-slate-800 dark:text-white/90 truncate w-full text-left",
                        children: T
                      }
                    ) : /* @__PURE__ */ e("div", { className: "h-1.5 w-12 bg-white/20 rounded-full mb-1" }),
                    /* @__PURE__ */ e("div", { className: "h-1 w-8 bg-slate-200 dark:bg-white/10 rounded-full" })
                  ] })
                ] }),
                c !== "failed" && c !== "completed" && /* @__PURE__ */ e(
                  P.div,
                  {
                    animate: { top: ["0%", "100%", "0%"] },
                    transition: { duration: 2, repeat: 1 / 0 },
                    className: "absolute inset-0 bg-gradient-to-b from-transparent via-brand-10 to-transparent h-1/2 w-full"
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h2", { className: `text-2xl font-bold bg-clip-text ${c === "completed" ? "text-green-500" : c === "failed" ? "text-red-500" : "dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 bg-slate-900 dark:text-transparent text-slate-900"}`, children: b.title }),
          /* @__PURE__ */ e("p", { className: "dark:text-slate-400 text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto", children: b.subtitle })
        ] }),
        c === "failed" && /* @__PURE__ */ i("div", { className: "mt-6 space-y-3", children: [
          /* @__PURE__ */ e("p", { className: "text-red-500 text-sm", children: A }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: de,
              className: "px-6 py-3 bg-brand text-white rounded-2xl font-bold",
              children: t("try_again", s)
            }
          )
        ] }),
        r === "layer_1" && o && c === "completed" && /* @__PURE__ */ i("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: t("your_wallet", s) }),
          /* @__PURE__ */ i("p", { className: "text-xs font-mono text-main break-all", children: [
            o.slice(0, 20),
            "...",
            o.slice(-10)
          ] })
        ] }),
        r !== "layer_1" && V && c === "completed" && /* @__PURE__ */ i("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: t("verification_id", s) }),
          /* @__PURE__ */ i("p", { className: "text-xs font-mono text-main break-all", children: [
            V.slice(0, 20),
            "..."
          ] })
        ] }),
        c !== "failed" && /* @__PURE__ */ i("div", { className: "w-full mt-12 p-6 dark:bg-brand/5 bg-brand/5 border-t dark:border-white/5 border-black/5", children: [
          /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-medium text-brand uppercase tracking-widest", children: t(r === "layer_1" ? "setup_status" : "transaction_status", s) }),
            /* @__PURE__ */ e("span", { className: `text-xs font-bold ${c === "completed" ? "text-green-500" : "text-[#6DE8EC]"}`, children: t("complete_percent", s).replace("{percent}", D.toString()) })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-brand/10 bg-brand/10 rounded-full overflow-hidden mb-4", children: /* @__PURE__ */ e(
            P.div,
            {
              initial: { width: "0%" },
              animate: { width: `${D}%` },
              transition: { duration: 0.5 },
              className: `h-full rounded-full ${c === "completed" ? "bg-gradient-to-r from-green-500 to-[#6DE8EC]" : "bg-gradient-to-r from-brand to-[#6DE8EC]"} shadow-[0_0_10px_rgba(114,43,238,0.5)]`
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "flex items-center gap-3 px-3 py-2 dark:bg-brand/10 bg-brand/10 rounded-xl border dark:border-brand-10 border-brand-5", children: [
            /* @__PURE__ */ e(At, { className: `w-4 h-4 ${c === "completed" ? "text-green-500" : "text-brand"}` }),
            /* @__PURE__ */ e("p", { className: "text-[10px] dark:text-slate-300 text-slate-600 font-medium", children: te() })
          ] })
        ] })
      ]
    }
  );
}, ni = ({ onNext: r, language: a = "EN" }) => /* @__PURE__ */ i(
  P.div,
  {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
    children: [
      /* @__PURE__ */ i("div", { className: "relative mb-10 group", children: [
        /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-[#6fe8ec]/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all" }),
        /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-2xl bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100", children: /* @__PURE__ */ e(Ce, { className: "text-slate-900 w-16 h-16" }) })
      ] }),
      /* @__PURE__ */ e("h1", { className: "text-main text-3xl font-bold leading-tight mb-3", children: t("identity_verified", a) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed mb-12", children: t("identity_verified_desc", a) }),
      /* @__PURE__ */ i("div", { className: "w-full bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-8 flex items-center justify-between text-left", children: [
        /* @__PURE__ */ i("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ e("span", { className: "text-main font-bold text-sm", children: t("share_data_consent", a) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-xs leading-normal", children: t("authorize_dapps", a) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-11 h-6 bg-brand rounded-full relative p-1 cursor-pointer", children: /* @__PURE__ */ e("div", { className: "absolute right-1 top-1 size-4 bg-white rounded-full" }) })
      ] }),
      /* @__PURE__ */ i(
        "button",
        {
          onClick: r,
          className: "w-full bg-[#6fe8ec] hover:brightness-105 active:scale-[0.98] transition-all text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-[#6fe8ec]/20 flex items-center justify-center gap-2",
          children: [
            t("return_to_app", a),
            /* @__PURE__ */ e(Oe, { className: "w-5 h-5" })
          ]
        }
      )
    ]
  }
), si = [
  "verify:identity",
  "read:profile",
  "read:kyc_level"
], ci = ({
  appName: r = "This App",
  appLogo: a,
  requestedScopes: n,
  onApprove: l,
  onDeny: N,
  language: p = "EN"
}) => {
  const f = n || si;
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 px-8 pt-8 flex flex-col items-center",
      children: [
        /* @__PURE__ */ i("div", { className: "flex flex-col items-center gap-4 mb-10", children: [
          /* @__PURE__ */ i("div", { className: "relative", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full shadow-[0_0_20px_rgba(134,81,225,0.3)] animate-pulse" }),
            /* @__PURE__ */ e("div", { className: "relative w-24 h-24 rounded-full border-2 border-brand-40 p-1 dark:bg-black/50 bg-white", children: a ? /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full overflow-hidden", children: /* @__PURE__ */ e("img", { src: a, alt: r, className: "w-full h-full object-cover" }) }) : /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl", children: r.slice(0, 2).toUpperCase() }) })
          ] }),
          /* @__PURE__ */ i("div", { className: "text-center", children: [
            /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main", children: r }),
            /* @__PURE__ */ e("p", { className: "text-brand/70 text-sm font-medium mt-1 uppercase tracking-wider", children: t("requesting_access", p) })
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "w-full space-y-3", children: [
          /* @__PURE__ */ e("h3", { className: "text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1", children: t("permission_request", p) }),
          f.map((m) => /* @__PURE__ */ i(
            "div",
            {
              className: "flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 transition-all",
              children: [
                /* @__PURE__ */ e("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0", children: /* @__PURE__ */ e(Ce, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ e("p", { className: "text-sm font-medium text-main", children: t(m, p) })
              ]
            },
            m
          ))
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-8 flex gap-3 p-4 rounded-2xl dark:bg-brand/5 bg-brand/5", children: [
          /* @__PURE__ */ e(Se, { className: "text-brand w-5 h-5 shrink-0" }),
          /* @__PURE__ */ i("p", { className: "text-xs leading-relaxed text-muted", children: [
            /* @__PURE__ */ i("span", { className: "font-bold text-main", children: [
              t("privacy_note", p),
              ":"
            ] }),
            " ",
            t("privacy_desc", p)
          ] })
        ] }),
        /* @__PURE__ */ i("footer", { className: "mt-auto w-full pb-8 flex flex-col gap-3", children: [
          /* @__PURE__ */ i(
            "button",
            {
              onClick: l,
              className: "w-full py-4 rounded-2xl bg-brand hover:bg-brand-90 text-white font-bold text-base shadow-xl shadow-brand transition-all flex items-center justify-center gap-2",
              children: [
                t("approve_verify", p),
                /* @__PURE__ */ e(Fe, { className: "w-5 h-5" })
              ]
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: N,
              className: "w-full py-3 rounded-2xl bg-transparent dark:hover:bg-slate-100 dark:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all",
              children: t("deny", p)
            }
          )
        ] })
      ]
    }
  );
};
function Ge(r = "light") {
  return r === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : r;
}
const Je = ["AuthSelection", "Login", "PasskeyAuth", "PinVerification", "PasskeyRegister"], oi = "https://apis.casperid.com", Ke = {
  requestId: "",
  verificationTier: "layer_3"
}, pi = ({
  isOpen: r,
  apiKey: a,
  theme: n = {},
  requiredTier: l,
  onSuccess: N,
  onClose: p,
  onError: f,
  mode: m = "login",
  previewMode: s = !1,
  initialScreen: c,
  apiBaseUrl: d,
  termsUrl: D = "#",
  privacyUrl: h = "#",
  logoUrl: A,
  language: _ = "EN",
  layout: o,
  platform: I
}) => {
  var Be;
  const [g, k] = y({}), [V, w] = y(!s && !!a), {
    primaryColor: T,
    borderRadius: Y,
    fontFamily: W,
    mode: B = "light",
    layout: b,
    platform: C
  } = n || {}, S = typeof navigator < "u" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), L = T || g.primaryColor || "#8651e1", O = Y || g.borderRadius || "12", F = W || g.fontFamily || "Inter", G = o || b || g.layout || "auto", Q = I || C || g.platform || (S ? "mobile" : "desktop"), [de, ue] = y(Ge(B)), [te, ie] = y(
    c ?? (m === "verify" ? "SecurityUpgrade" : "AuthSelection")
  ), [q, pe] = y({ email: "", verificationId: "" }), [K, me] = y(null), [ee, ne] = y({
    email: "",
    userExists: !1,
    hasPasskey: !1,
    userAccount: null
  }), [U, v] = y(Ke), [M, Z] = y(""), [fe, z] = y(""), [X, he] = y(null), H = d || oi, oe = O.toString().endsWith("px") ? O.toString() : `${O}px`, ge = F.includes(" ") ? `"${F}", sans-serif` : `${F}, sans-serif`, ae = _t.useId().replace(/:/g, ""), ye = {
    "--casperid-primary": L,
    "--casperid-radius": oe,
    "--casperid-font": ge
  }, Ae = `${ae}-${L}-${oe}-${ge}`, De = `
        #casperid-modal-${ae},
        #casperid-modal-${ae} * {
            --casperid-primary: ${L} !important;
            --casperid-radius: ${oe} !important;
            --casperid-font: ${ge} !important;
        }
    `;
  ce(() => {
    if (B === "system") {
      const u = window.matchMedia("(prefers-color-scheme: dark)"), x = (E) => ue(E.matches ? "dark" : "light");
      return u.addEventListener("change", x), () => u.removeEventListener("change", x);
    } else
      ue(Ge(B));
  }, [B]), ce(() => {
    s && c && ie(c);
  }, [s, c]), ce(() => {
    r && !s && (ie(c ?? (m === "verify" ? "SecurityUpgrade" : "AuthSelection")), pe({ email: "", verificationId: "" }), me(null), ne({ email: "", userExists: !1, hasPasskey: !1, userAccount: null }), v(Ke), Z(""), z(""));
  }, [r, m, s, c]), ce(() => {
    if (!a || s) {
      w(!1);
      return;
    }
    (async () => {
      try {
        const x = await fetch(`${H}/api/business/app-metadata/${a}`);
        if (x.ok) {
          const E = await x.json();
          E.success && E.app && (he(E.app), E.app.theme && k({
            primaryColor: E.app.theme.primaryColor,
            borderRadius: E.app.theme.borderRadius,
            fontFamily: E.app.theme.fontFamily,
            layout: E.app.theme.layout,
            platform: E.app.theme.platform
          }));
        }
      } catch (x) {
        console.warn("[CasperID] Failed to fetch app metadata:", x);
      } finally {
        w(!1);
      }
    })();
  }, [a, H, s]);
  const Ue = () => ue((u) => u === "dark" ? "light" : "dark"), R = J((u) => ie(u), []), ze = J(async (u) => {
    try {
      const x = u === "layer_2" ? `${d}/api/v2/verification/layer2/start` : `${d}/api/v2/verification/layer3/start`, E = await fetch(x, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": a
        },
        credentials: "include",
        body: JSON.stringify({
          purpose: "sdk_verification",
          ...u === "layer_3" ? { verificationMethod: "document" } : {}
        })
      });
      if (!E.ok) {
        const le = await E.json().catch(() => ({}));
        throw new Error(le.error || `Request failed with status ${E.status}`);
      }
      const $ = await E.json();
      if ($.success && $.verification)
        return v((le) => ({
          ...le,
          requestId: $.verification.requestId,
          verificationTier: u
        })), $.verification.requestId;
      throw new Error($.error || "Failed to start verification");
    } catch (x) {
      return f == null || f(x instanceof Error ? x : new Error("Failed to start verification")), null;
    }
  }, [d, a, f]), rt = J((u, x, E) => {
    me(u), ne(($) => ({
      ...$,
      sessionToken: u,
      businessToken: E,
      userAccount: x || null
    })), x != null && x.wallet && (x != null && x.did_address) && ee.hasPasskey ? Re(x.tier) : R("PasskeyRegister");
  }, [R, ee.hasPasskey]), nt = J((u) => {
    ne((x) => ({ ...x, email: u, hasPasskey: !0, userExists: !0 })), R("PasskeyAuth");
  }, [R]), st = J((u, x, E) => {
    me(u), ne(($) => ({
      ...$,
      sessionToken: u,
      businessToken: E,
      userAccount: x ? {
        user_id: x.user_id,
        wallet: x.wallet,
        tier: x.tier,
        did_address: x.did_address
      } : null
    })), Re(x == null ? void 0 : x.tier);
  }, []), ct = J((u, x) => {
    ne((E) => ({
      ...E,
      hasPasskey: !0,
      businessToken: x,
      userAccount: u ? {
        user_id: u.user_id,
        tier: u.tier
      } : E.userAccount
    })), R("MintingIdentity");
  }, [R]), Re = J((u) => {
    const x = u || "layer_0";
    if (!l) {
      R("IdentityVerified");
      return;
    }
    const E = l === "L1" ? "layer_1" : l === "L2" ? "layer_2" : l === "L3" ? "layer_3" : "layer_1", $ = ["layer_0", "layer_1", "layer_2", "layer_3"], le = $.indexOf(x), we = $.indexOf(E);
    le >= we ? R("IdentityVerified") : we >= 2 ? R("SecurityUpgrade") : R("IdentityVerified");
  }, [l, R]), ot = J(async (u) => {
    var E;
    if (u != null && u.wallet && ne(($) => {
      var le;
      return {
        ...$,
        userAccount: {
          ...$.userAccount,
          user_id: ((le = $.userAccount) == null ? void 0 : le.user_id) || "",
          wallet: u.wallet,
          did_address: u.didAddress,
          tier: "layer_1"
        }
      };
    }), u != null && u.credentialHash && z(u.credentialHash), K && !s)
      try {
        const $ = await fetch(`${H}/api/casperid/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: K, apiKey: a })
        });
        if ($.ok) {
          const le = await $.json();
          le.success && le.token && (console.log("[CasperID SDK] Token refreshed after verification"), me(le.token), ne((we) => ({
            ...we,
            sessionToken: le.token,
            businessToken: le.business_token || we.businessToken
          })));
        }
      } catch ($) {
        console.warn("[CasperID SDK] Failed to refresh token after verification:", $);
      }
    let x = u != null && u.wallet ? "layer_1" : ((E = ee.userAccount) == null ? void 0 : E.tier) || "layer_1";
    U.livenessVerified && U.verificationTier === "layer_2" ? x = "layer_2" : U.documentType && U.verificationTier === "layer_3" && (x = "layer_3"), Re(x);
  }, [(Be = ee.userAccount) == null ? void 0 : Be.tier, Re, K, H, s, U]), lt = J((u) => {
    const x = (u == null ? void 0 : u.sessionToken) || (u == null ? void 0 : u.token), E = (u == null ? void 0 : u.business_token) || (u == null ? void 0 : u.businessToken);
    x && me(x), E && ne(($) => ({ ...$, businessToken: E })), R("SecurityUpgrade");
  }, [R]), dt = J(async () => {
    l === "L3" ? await ze("layer_3") && R("VerifyIdentityChoice") : await ze("layer_2") && R("FaceScan");
  }, [l, ze, R]), ut = J(async (u) => {
    v((x) => ({ ...x, livenessVerified: u })), R("MintingIdentity");
  }, [R]), mt = J((u) => {
    v((x) => ({ ...x, documentType: u })), R("DocumentScan");
  }, [R]), pt = J((u, x, E) => {
    v(($) => ({
      ...$,
      extractedData: u,
      frontImageUrl: E.frontImageUrl,
      frontImageFileId: E.frontImageFileId,
      backImageUrl: E.backImageUrl,
      backImageFileId: E.backImageFileId
    })), Z(x), R("ReviewData");
  }, [R]), ft = J((u) => {
    v((x) => ({ ...x, extractedData: u })), R("FaceScan");
  }, [R]);
  J(() => {
    v((u) => ({ ...u, extractedData: void 0 })), Z(""), R("DocumentScan");
  }, [R]);
  const ht = J(() => {
    if (!K) {
      f == null || f(new Error("No valid session token available"));
      return;
    }
    N == null || N(K, {
      businessToken: ee.businessToken
    }), p == null || p();
  }, [K, ee.businessToken, N, p, f]), be = J((u) => {
    f == null || f(new Error(u));
  }, [f]), bt = J((u, x) => {
    pe({ email: u, verificationId: x }), ne((E) => ({ ...E, email: u })), R("PinVerification");
  }, [R]);
  if (!r && !s) return null;
  if (V && !s)
    return /* @__PURE__ */ e(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        style: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" },
        children: /* @__PURE__ */ e("div", { className: "w-12 h-12 border-3 border-white/20 border-t-white/80 rounded-full animate-spin" })
      }
    );
  const $e = () => {
    switch (te) {
      case "AuthSelection":
        return /* @__PURE__ */ e(
          Mt,
          {
            onNext: (x) => R(x === "otp" ? "Login" : "SecurityUpgrade"),
            onExtensionSuccess: lt,
            onError: be,
            language: _,
            platform: Q
          }
        );
      case "Login":
        return /* @__PURE__ */ e(
          Lt,
          {
            onNext: bt,
            onPasskeyUser: nt,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PasskeyAuth":
        return /* @__PURE__ */ e(
          Yt,
          {
            email: ee.email,
            onSuccess: st,
            onError: be,
            onFallbackToOTP: () => R("Login"),
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PasskeyRegister":
        return /* @__PURE__ */ e(
          Gt,
          {
            email: ee.email || q.email,
            sessionToken: K || "",
            onSuccess: ct,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PinVerification":
        return /* @__PURE__ */ e(
          Jt,
          {
            email: q.email,
            verificationId: q.verificationId,
            onNext: rt,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "SecurityUpgrade":
        return /* @__PURE__ */ e(
          Kt,
          {
            onNext: dt,
            onSkip: () => R("IdentityVerified"),
            language: _
          }
        );
      case "FaceScan":
        return /* @__PURE__ */ e(
          Zt,
          {
            requestId: U.requestId,
            onNext: ut,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "VerifyIdentityChoice":
        return /* @__PURE__ */ e(
          Qt,
          {
            onNext: mt,
            language: _
          }
        );
      case "DocumentScan":
        return /* @__PURE__ */ e(
          ti,
          {
            requestId: U.requestId,
            documentType: U.documentType,
            onNext: pt,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "ReviewData":
        return /* @__PURE__ */ e(
          ii,
          {
            requestId: U.requestId,
            documentType: U.documentType,
            extractedData: U.extractedData,
            uploadId: M,
            frontImageUrl: U.frontImageUrl,
            frontImageFileId: U.frontImageFileId,
            backImageUrl: U.backImageUrl,
            backImageFileId: U.backImageFileId,
            onNext: ft,
            onRetake: () => R("DocumentScan"),
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "MintingIdentity":
        const u = U.requestId ? U.verificationTier : "layer_1";
        return /* @__PURE__ */ e(
          ri,
          {
            tier: u,
            sessionToken: K || "",
            requestId: U.requestId,
            onNext: ot,
            onError: be,
            apiBaseUrl: H,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "IdentityVerified":
        return /* @__PURE__ */ e(ni, { onNext: () => R("PermissionsRequest"), language: _ });
      case "PermissionsRequest":
        return /* @__PURE__ */ e(
          ci,
          {
            onApprove: ht,
            onDeny: () => p == null ? void 0 : p(),
            language: _,
            appName: X == null ? void 0 : X.name,
            appLogo: A || (X == null ? void 0 : X.logo_url),
            requestedScopes: X == null ? void 0 : X.requested_scopes
          }
        );
      default:
        return null;
    }
  };
  return s ? /* @__PURE__ */ i(re, { children: [
    /* @__PURE__ */ e("style", { children: De }, Ae),
    /* @__PURE__ */ e("div", { id: `casperid-modal-${ae}`, style: ye, className: `relative ${de}`, children: /* @__PURE__ */ i(He, { className: "backdrop-blur-3xl", theme: de, children: [
      te !== "FaceScan" && /* @__PURE__ */ e(
        We,
        {
          onClose: p,
          showClose: te !== "AuthSelection",
          subtitle: te === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
          theme: de,
          toggleTheme: Ue
        }
      ),
      /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Me, { mode: "wait", children: /* @__PURE__ */ e(P.div, { className: "flex-1 flex flex-col", children: $e() }, te) }) }),
      Je.includes(te) && /* @__PURE__ */ e(Ye, { children: /* @__PURE__ */ i("p", { className: "text-[11px] text-slate-500 font-medium", children: [
        "By connecting, you agree to our",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: D, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
        " ",
        "&",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: h, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
      ] }) })
    ] }) })
  ] }) : /* @__PURE__ */ i(re, { children: [
    /* @__PURE__ */ e("style", { children: De }, Ae),
    /* @__PURE__ */ i(
      "div",
      {
        className: `fixed inset-0 z-[9999] flex items-center justify-center ${G === "fullscreen" ? "p-0" : "p-4"}`,
        style: { backgroundColor: G === "fullscreen" ? "transparent" : "rgba(0,0,0,0.6)", backdropFilter: G === "fullscreen" ? "none" : "blur(6px)" },
        onClick: (u) => u.target === u.currentTarget && (p == null ? void 0 : p()),
        children: [
          G !== "fullscreen" && /* @__PURE__ */ i("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: "absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]",
                style: { backgroundColor: `${L}1a` }
              }
            ),
            /* @__PURE__ */ e("div", { className: "absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" })
          ] }),
          /* @__PURE__ */ e(
            P.div,
            {
              id: `casperid-modal-${ae}`,
              initial: G === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: G === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              style: ye,
              className: `relative selection:bg-brand/30 ${de} ${G === "fullscreen" ? "w-full h-full" : Q === "mobile" ? "w-full max-w-md h-[90vh] max-h-[800px]" : "w-full max-w-xl h-[85vh] max-h-[900px]"}`,
              children: /* @__PURE__ */ i(He, { className: `backdrop-blur-3xl ${G === "fullscreen" ? "w-full h-full rounded-none" : ""}`, theme: de, children: [
                te !== "FaceScan" && /* @__PURE__ */ e(
                  We,
                  {
                    onClose: p,
                    showClose: te !== "AuthSelection",
                    subtitle: te === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
                    theme: de,
                    toggleTheme: Ue
                  }
                ),
                /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Me, { mode: "wait", children: /* @__PURE__ */ e(P.div, { className: "flex-1 flex flex-col", children: $e() }, te) }) }),
                Je.includes(te) && /* @__PURE__ */ e(Ye, { children: /* @__PURE__ */ i("p", { className: "text-[11px] text-slate-500 font-medium", children: [
                  "By connecting, you agree to our",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: D, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
                  " ",
                  "&",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: h, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
                ] }) })
              ] })
            }
          )
        ]
      }
    )
  ] });
};
async function fi(r, a = {}, n = 3e4) {
  const l = new AbortController(), N = setTimeout(() => l.abort(), n);
  try {
    return await fetch(r, {
      ...a,
      signal: l.signal
    });
  } finally {
    clearTimeout(N);
  }
}
class li extends Error {
  constructor(a, n) {
    super(a), this.name = "ApiError", this.status = n;
  }
}
async function hi(r) {
  if (!r.ok) {
    const a = await r.json().catch(() => ({}));
    throw new li(
      a.error || a.message || `Request failed with status ${r.status}`,
      r.status
    );
  }
  return r.json();
}
export {
  li as ApiError,
  Mt as AuthSelectionScreen,
  pi as CasperIDModal,
  ti as DocumentScanScreen,
  Zt as FaceScanScreen,
  Ye as Footer,
  He as GlassContainer,
  We as Header,
  ni as IdentityVerifiedScreen,
  Lt as LoginScreen,
  ri as MintingIdentityScreen,
  ci as PermissionsRequestScreen,
  Jt as PinVerificationScreen,
  ii as ReviewDataScreen,
  Kt as SecurityUpgradeScreen,
  Qt as VerifyIdentityChoiceScreen,
  pi as default,
  fi as fetchWithTimeout,
  hi as handleApiResponse
};
//# sourceMappingURL=index.mjs.map
