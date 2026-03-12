import { jsx as e, jsxs as t, Fragment as U } from "react/jsx-runtime";
import et, { forwardRef as Re, createElement as oe, useState as w, useEffect as $, useCallback as O, useRef as G } from "react";
import { motion as M, AnimatePresence as ue } from "framer-motion";
const Ce = ({ children: r, className: s = "", theme: n = "" }) => (
  // Destructure theme and provide default
  /* @__PURE__ */ e(
    "div",
    {
      className: `glass-container relative w-full h-full rounded-[var(--casperid-radius,1.5rem)] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${s} ${n}`,
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
const tt = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Te = (...r) => r.filter((s, n, o) => !!s && o.indexOf(s) === n).join(" ");
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var at = {
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
const it = Re(
  ({
    color: r = "currentColor",
    size: s = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: o,
    className: k = "",
    children: c,
    iconNode: i,
    ...l
  }, h) => oe(
    "svg",
    {
      ref: h,
      ...at,
      width: s,
      height: s,
      stroke: r,
      strokeWidth: o ? Number(n) * 24 / Number(s) : n,
      className: Te("lucide", k),
      ...l
    },
    [
      ...i.map(([d, m]) => oe(d, m)),
      ...Array.isArray(c) ? c : [c]
    ]
  )
);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const j = (r, s) => {
  const n = Re(
    ({ className: o, ...k }, c) => oe(it, {
      ref: c,
      iconNode: s,
      className: Te(`lucide-${tt(r)}`, o),
      ...k
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
const pe = j("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const he = j("BadgeCheck", [
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
const rt = j("Calendar", [
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
const nt = j("Camera", [
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
const me = j("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Z = j("CircleAlert", [
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
const J = j("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const st = j("CircleHelp", [
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
const ze = j("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ct = j("Delete", [
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
const X = j("Fingerprint", [
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
const dt = j("Flashlight", [
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
const je = j("Globe", [
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
const lt = j("Key", [
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
const F = j("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fe = j("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ot = j("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ut = j("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mt = j("Network", [
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
const pt = j("Puzzle", [
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
const ae = j("RefreshCw", [
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
const ht = j("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ie = j("ShieldCheck", [
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
const Me = j("Shield", [
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
const be = j("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ft = j("Sparkles", [
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
const bt = j("Sun", [
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
const _t = j("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ie = j("Wallet", [
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
const xt = j("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), Se = ({
  onClose: r,
  title: s = "CasperID",
  subtitle: n = "SECURE SDK",
  showClose: o = !0,
  theme: k,
  toggleTheme: c,
  logoUrl: i
}) => /* @__PURE__ */ t("header", { className: "flex items-center justify-between px-6 pt-8 pb-4 relative z-20", children: [
  /* @__PURE__ */ t("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ e("div", { className: "p-2 bg-brand rounded-xl flex items-center justify-center shadow-brand", children: i ? /* @__PURE__ */ e("img", { src: i, alt: s, className: "w-5 h-5 object-contain" }) : /* @__PURE__ */ e(Me, { className: "text-white w-5 h-5" }) }),
    /* @__PURE__ */ t("div", { children: [
      /* @__PURE__ */ e("h2", { className: "text-lg font-bold tracking-tight text-main", children: s }),
      n && /* @__PURE__ */ e("p", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: n })
    ] })
  ] }),
  /* @__PURE__ */ t("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: c,
        className: "p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-xl transition-colors text-muted",
        "aria-label": "Toggle theme",
        children: k === "dark" ? /* @__PURE__ */ e(bt, { className: "w-5 h-5" }) : /* @__PURE__ */ e(ut, { className: "w-5 h-5" })
      }
    ),
    o && /* @__PURE__ */ e(
      "button",
      {
        onClick: r,
        className: "p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted",
        "aria-label": "Close",
        children: /* @__PURE__ */ e(xt, { className: "w-5 h-5" })
      }
    )
  ] })
] }), Ee = ({ children: r }) => /* @__PURE__ */ e("footer", { className: "p-8 text-center relative z-20", children: r }), le = {
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
    processing_subtitle: "Validating your documents and biometrics",
    minting_identity: "Minting your Identity...",
    minting_subtitle: "Securing your decentralized identity on the Casper Network",
    identity_minted: "Identity Minted!",
    minted_subtitle: "Your CasperID has been successfully created",
    verification_failed_subtitle: "There was an issue with your verification",
    try_again: "Try Again",
    credential_hash: "Credential Hash",
    identity_verified: "Identity Verified",
    identity_verified_desc: "Your CasperID has been successfully authenticated on the Casper blockchain. You're ready to go.",
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
    l1_failed: "Setup failed. Please try again."
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
    processing_subtitle: "Validando sus documentos y biometría",
    minting_identity: "Minting identidad...",
    minting_subtitle: "Asegurando su identidad descentralizada en Casper Network",
    identity_minted: "¡Identidad Minted!",
    minted_subtitle: "Su CasperID ha sido creado con éxito",
    verification_failed_subtitle: "Hubo un problema con su verificación",
    try_again: "Intentar de nuevo",
    credential_hash: "Hash de credencial",
    identity_verified: "Identidad verificada",
    identity_verified_desc: "Su CasperID ha sido autenticado con éxito en la cadena de bloques Casper.",
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
    l1_failed: "Configuración fallida. Intente de nuevo."
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
    processing_subtitle: "Validation de vos documents et biométrie",
    minting_identity: "Mint Identité en cours...",
    minting_subtitle: "Sécurisation de votre identité sur le réseau Casper",
    identity_minted: "Identité créée !",
    minted_subtitle: "Votre CasperID a été créé avec succès",
    verification_failed_subtitle: "Il y a eu un problème avec votre vérification",
    try_again: "Réessayer",
    credential_hash: "Hachage de créance",
    identity_verified: "Identité vérifiée",
    identity_verified_desc: "Votre CasperID a été authentifié avec succès sur la blockchain Casper.",
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
    l1_failed: "Échec de la configuration. Réessayez."
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
    processing_subtitle: "Dokumente und Biometrie werden validiert",
    minting_identity: "Identität wird geprägt...",
    minting_subtitle: "Ihre dezentrale Identität wird im Casper-Netzwerk gesichert",
    identity_minted: "Identität geprägt!",
    minted_subtitle: "Ihre CasperID wurde erfolgreich erstellt",
    verification_failed_subtitle: "Es gab ein Problem mit Ihrer Verifizierung",
    try_again: "Erneut versuchen",
    credential_hash: "Anmeldedaten-Hash",
    identity_verified: "Identität verifiziert",
    identity_verified_desc: "Ihre CasperID wurde erfolgreich in der Casper-Blockchain authentifiziert.",
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
}, a = (r, s = "EN") => {
  const n = s.toUpperCase();
  return (le[n] || le.EN)[r] || le.EN[r] || r;
}, yt = ({
  onNext: r,
  onExtensionSuccess: s,
  onError: n,
  language: o = "EN"
}) => {
  const [k, c] = w(!1), [i, l] = w(null), [h, d] = w("");
  $(() => {
    m();
  }, []), $(() => {
    const u = (x) => {
      c(!1), x.detail && x.detail.wallet && (s == null || s(x.detail));
    };
    return window.addEventListener("casperid-login", u), () => {
      window.removeEventListener("casperid-login", u);
    };
  }, [s]);
  const m = O(() => {
    const u = document.getElementById("casperid-draggable-anchor");
    let x = null;
    try {
      x = localStorage.getItem("casperid_user");
    } catch {
    }
    return u || x ? (l(!0), !0) : (setTimeout(() => {
      const p = document.getElementById("casperid-draggable-anchor");
      l(!!p);
    }, 500), !1);
  }, []), E = (u) => typeof u == "object" && u !== null && "wallet" in u && typeof u.wallet == "string" && u.wallet.length > 0, T = async () => {
    c(!0), d("");
    try {
      const x = localStorage.getItem("casperid_user");
      if (x) {
        const p = JSON.parse(x);
        if (E(p)) {
          c(!1), s == null || s(p);
          return;
        }
      }
    } catch {
    }
    const u = document.getElementById("casperid-draggable-anchor");
    u ? (u.click(), setTimeout(() => {
      c(!1);
      try {
        localStorage.getItem("casperid_user") || d(a("extension_connect_msg", o));
      } catch {
        d(a("extension_connect_msg", o));
      }
    }, 3e3)) : (c(!1), d(a("extension_not_detected", o)), n == null || n("Extension not installed"));
  }, z = () => {
    d(""), r("otp");
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 px-8 flex flex-col justify-center gap-8",
      children: [
        /* @__PURE__ */ t("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ t("div", { className: "relative w-24 h-24 mx-auto mb-6", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-brand-20 blur-2xl rounded-full" }),
            /* @__PURE__ */ e("div", { className: "relative w-full h-full glass-container flex items-center justify-center rounded-2xl border border-brand-30", children: /* @__PURE__ */ e(X, { className: "w-10 h-10 text-brand" }) })
          ] }),
          /* @__PURE__ */ e("h1", { className: "text-2xl font-extrabold leading-tight tracking-tight text-main", children: a("welcome_back", o) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: a("auth_subtitle", o) })
        ] }),
        h && /* @__PURE__ */ t("div", { className: "flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl", children: [
          /* @__PURE__ */ e(Z, { className: "w-5 h-5 text-red-500 shrink-0 mt-0.5" }),
          /* @__PURE__ */ e("p", { className: "text-red-600 dark:text-red-400 text-sm font-medium", children: h })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-4", children: [
          /* @__PURE__ */ t(
            "button",
            {
              onClick: T,
              disabled: k,
              className: "w-full group relative overflow-hidden flex items-center gap-4 bg-brand hover:bg-brand-90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-brand",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-white/20 p-2 rounded-lg", children: k ? /* @__PURE__ */ e(F, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ e(pt, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ t("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: a(k ? "connecting" : "sign_in_with_extension", o) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-white/70", children: a(i === !0 ? "extension_detected" : "secure_wallet", o) })
                ] }),
                /* @__PURE__ */ e(me, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          ),
          /* @__PURE__ */ t(
            "button",
            {
              onClick: z,
              disabled: k,
              className: "w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-brand-10 p-2 rounded-lg", children: /* @__PURE__ */ e(be, { className: "w-5 h-5 text-brand" }) }),
                /* @__PURE__ */ t("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: a("sign_in_with_otp", o) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: a("two_factor_auth", o) })
                ] }),
                /* @__PURE__ */ e(me, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ t("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(ie, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: a("fully_audited", o) })
          ] }),
          /* @__PURE__ */ t("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(ae, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: a("non_custodial", o) })
          ] })
        ] })
      ]
    }
  );
}, gt = ({
  onNext: r,
  onPasskeyUser: s,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  previewMode: k = !1,
  language: c = "EN"
}) => {
  const [i, l] = w(""), [h, d] = w(!1), [m, E] = w(""), T = async () => {
    if (!i.trim()) {
      E(a("error_email_required", c));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i)) {
      E(a("error_invalid_email", c));
      return;
    }
    if (d(!0), E(""), k) {
      setTimeout(() => {
        d(!1), r(i.trim().toLowerCase(), "mock-v-id-123456789");
      }, 1e3);
      return;
    }
    try {
      const x = await fetch(`${o}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: i.trim().toLowerCase() })
      });
      if (!x.ok) {
        const S = await x.json().catch(() => ({}));
        throw new Error(S.error || `Request failed with status ${x.status}`);
      }
      const p = await x.json();
      if (p.success) {
        if (p.userExists && p.hasPasskey) {
          s ? s(i.trim().toLowerCase()) : E(a("error_passkey_registered", c)), d(!1);
          return;
        }
        p.verificationId ? r(i.trim().toLowerCase(), p.verificationId) : E(a("error_send_code_failed", c));
      } else
        E(p.error || a("error_send_code_failed", c)), n == null || n(p.error || a("error_send_code_failed", c));
    } catch {
      const p = a("error_connection_failed", c);
      E(p), n == null || n(p);
    } finally {
      d(!1);
    }
  }, z = (u) => {
    u.key === "Enter" && !h && T();
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ t("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: a("welcome_back", c) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: a("enter_email", c) })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-6", children: [
          /* @__PURE__ */ t("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1", children: a("email_address", c) }),
            /* @__PURE__ */ t("div", { className: "relative", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  className: `w-full dark:bg-black/20 bg-slate-100/50 border ${m ? "border-red-400 dark:border-red-500" : "dark:border-white/10 border-slate-200"} rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-30 transition-all font-medium`,
                  placeholder: "name@example.com",
                  type: "email",
                  value: i,
                  onChange: (u) => {
                    l(u.target.value), m && E("");
                  },
                  onKeyDown: z,
                  disabled: h,
                  autoComplete: "email",
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ e("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400", children: /* @__PURE__ */ e(ot, { className: "w-5 h-5" }) })
            ] }),
            m && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium ml-1 mt-1", children: m })
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: T,
              disabled: h,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
              children: h ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(F, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: a("sending_code", c) })
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e("span", { children: a("continue", c) }),
                /* @__PURE__ */ e(pe, { className: "w-5 h-5" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "mt-auto pb-8", children: [
          /* @__PURE__ */ e("div", { className: "p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl mb-6", children: /* @__PURE__ */ t("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ e(he, { className: "text-[#6DE8EC] w-5 h-5 mt-0.5 shrink-0" }),
            /* @__PURE__ */ e("p", { className: "text-[11px] text-muted leading-normal font-medium", children: a("security_notice", c) })
          ] }) }),
          /* @__PURE__ */ t("div", { className: "flex items-center justify-center gap-2 opacity-50", children: [
            /* @__PURE__ */ e(fe, { className: "text-muted w-3 h-3" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: a("e2e_encrypted", c) })
          ] })
        ] })
      ]
    }
  );
};
function Y(r) {
  const s = new Uint8Array(r);
  let n = "";
  for (let o = 0; o < s.byteLength; o++)
    n += String.fromCharCode(s[o]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function te(r) {
  const s = "=".repeat((4 - r.length % 4) % 4), n = r.replace(/-/g, "+").replace(/_/g, "/") + s, o = atob(n), k = new Uint8Array(o.length);
  for (let c = 0; c < o.length; c++)
    k[c] = o.charCodeAt(c);
  return k.buffer;
}
function re() {
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential == "function");
}
async function Ve() {
  if (!re()) return !1;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return !1;
  }
}
function vt() {
  const r = navigator.userAgent.toLowerCase();
  return /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(r) ? "mobile" : /ipad|android(?!.*mobile)|tablet/i.test(r) ? "tablet" : "desktop";
}
function wt() {
  return {
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent,
    deviceType: vt()
  };
}
function kt(r) {
  var s;
  return {
    ...r,
    challenge: te(r.challenge),
    user: {
      ...r.user,
      id: te(r.user.id)
    },
    excludeCredentials: (s = r.excludeCredentials) == null ? void 0 : s.map((n) => ({
      ...n,
      id: te(n.id)
    }))
  };
}
function Nt(r) {
  var s;
  return {
    ...r,
    challenge: te(r.challenge),
    allowCredentials: (s = r.allowCredentials) == null ? void 0 : s.map((n) => ({
      ...n,
      id: te(n.id)
    }))
  };
}
function Ct(r) {
  const s = r.response;
  return {
    id: r.id,
    rawId: Y(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: Y(s.clientDataJSON),
      attestationObject: Y(s.attestationObject)
    },
    clientExtensionResults: r.getClientExtensionResults(),
    deviceInfo: wt()
  };
}
function It(r) {
  const s = r.response;
  return {
    id: r.id,
    rawId: Y(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: Y(s.clientDataJSON),
      authenticatorData: Y(s.authenticatorData),
      signature: Y(s.signature),
      userHandle: s.userHandle ? Y(s.userHandle) : null
    },
    clientExtensionResults: r.getClientExtensionResults()
  };
}
async function St(r) {
  if (!re())
    throw new Error("WebAuthn is not supported in this browser");
  const s = kt(r), n = await navigator.credentials.create({
    publicKey: s
  });
  if (!n)
    throw new Error("Passkey creation was cancelled or failed");
  return Ct(n);
}
async function Et(r) {
  if (!re())
    throw new Error("WebAuthn is not supported in this browser");
  const s = Nt(r), n = await navigator.credentials.get({
    publicKey: s
  });
  if (!n)
    throw new Error("Passkey authentication was cancelled or failed");
  return It(n);
}
const At = ({
  email: r,
  onSuccess: s,
  onError: n,
  onFallbackToOTP: o,
  apiBaseUrl: k = "https://apis.casperid.com",
  previewMode: c = !1,
  language: i = "EN"
}) => {
  const [l, h] = w(!1), [d, m] = w(""), [E, T] = w(!0), [z, u] = w(!1);
  $(() => {
    (async () => {
      const S = re(), D = await Ve();
      T(S && D), (!S || !D) && m(a("webauthn_not_supported", i));
    })();
  }, [i]), $(() => {
    if (E && !z && !c) {
      u(!0);
      const p = setTimeout(() => {
        x();
      }, 500);
      return () => clearTimeout(p);
    }
  }, [E, z, c]);
  const x = async () => {
    if (!l) {
      if (h(!0), m(""), c) {
        setTimeout(() => {
          h(!1), s("mock-session-token", {
            user_id: "mock-user-id",
            email: r,
            tier: "layer_1"
          });
        }, 1500);
        return;
      }
      try {
        const p = await fetch(`${k}/api/passkey/auth/begin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!p.ok) {
          const g = await p.json().catch(() => ({}));
          throw new Error(g.error || "Failed to initialize authentication");
        }
        const S = await p.json();
        if (!S.success || !S.options)
          throw new Error(S.error || "Invalid authentication options");
        const D = await Et(S.options), y = await fetch(`${k}/api/passkey/auth/finish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: r,
            credential: D
          })
        });
        if (!y.ok) {
          const g = await y.json().catch(() => ({}));
          throw new Error(g.error || "Authentication failed");
        }
        const N = await y.json();
        if (N.success && N.session_token)
          s(N.session_token, N.user);
        else
          throw new Error(N.error || "Authentication failed");
      } catch (p) {
        const S = p instanceof Error ? p.message : "Authentication failed";
        S.includes("cancelled") || S.includes("NotAllowedError") ? m(a("passkey_cancelled", i)) : (m(S), n == null || n(S));
      } finally {
        h(!1);
      }
    }
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ t("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: a("welcome_back", i) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: a("passkey_auth_subtitle", i) })
        ] }),
        /* @__PURE__ */ t("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: a("signing_in_as", i) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ t("div", { className: "flex-1 flex flex-col items-center justify-center py-8", children: [
          /* @__PURE__ */ e(
            M.div,
            {
              animate: l ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              } : {},
              transition: {
                duration: 1.5,
                repeat: l ? 1 / 0 : 0,
                ease: "easeInOut"
              },
              className: `w-24 h-24 rounded-full flex items-center justify-center mb-6 ${l ? "bg-brand/20 border-2 border-brand" : d ? "bg-red-500/10 border-2 border-red-400" : "bg-brand/10 border-2 border-brand/30"}`,
              children: l ? /* @__PURE__ */ e(F, { className: "w-10 h-10 text-brand animate-spin" }) : d ? /* @__PURE__ */ e(Z, { className: "w-10 h-10 text-red-400" }) : /* @__PURE__ */ e(X, { className: "w-10 h-10 text-brand" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center mb-2", children: a(l ? "authenticating" : d ? "authentication_failed" : "use_passkey", i) }),
          d && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mb-4 max-w-xs", children: d }),
          !l && /* @__PURE__ */ e("p", { className: "text-muted text-sm text-center max-w-xs", children: a("passkey_auth_hint", i) })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-3 pb-8", children: [
          !l && /* @__PURE__ */ e(
            "button",
            {
              onClick: x,
              disabled: !E,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(ae, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: a("try_again", i) })
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(X, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: a("authenticate", i) })
              ] })
            }
          ),
          o && /* @__PURE__ */ e(
            "button",
            {
              onClick: o,
              disabled: l,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
              children: a("use_email_instead", i)
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(ie, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: a("biometric_secured", i) })
        ] })
      ]
    }
  );
}, Dt = ({
  email: r,
  sessionToken: s,
  onSuccess: n,
  onError: o,
  onSkip: k,
  apiBaseUrl: c = "https://apis.casperid.com",
  previewMode: i = !1,
  language: l = "EN"
}) => {
  const [h, d] = w(!1), [m, E] = w(""), [T, z] = w(!0), [u, x] = w(!1);
  $(() => {
    (async () => {
      const y = re(), N = await Ve();
      z(y && N), (!y || !N) && E(a("webauthn_not_supported", l));
    })();
  }, [l]);
  const p = async () => {
    if (!h) {
      if (d(!0), E(""), i) {
        setTimeout(() => {
          d(!1), x(!0), setTimeout(() => {
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
        const D = await fetch(`${c}/api/passkey/register/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${s}`
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!D.ok) {
          const A = await D.json().catch(() => ({}));
          throw new Error(A.error || "Failed to initialize registration");
        }
        const y = await D.json();
        if (!y.success || !y.options)
          throw new Error(y.error || "Invalid registration options");
        const N = await St(y.options), g = await fetch(`${c}/api/passkey/register/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${s}`
          },
          credentials: "include",
          body: JSON.stringify({
            email: r,
            credential: N
          })
        });
        if (!g.ok) {
          const A = await g.json().catch(() => ({}));
          throw new Error(A.error || "Registration failed");
        }
        const C = await g.json();
        if (C.success)
          x(!0), setTimeout(() => {
            n(C.user);
          }, 1e3);
        else
          throw new Error(C.error || "Registration failed");
      } catch (D) {
        const y = D instanceof Error ? D.message : "Registration failed";
        y.includes("cancelled") || y.includes("NotAllowedError") ? E(a("passkey_cancelled", l)) : (E(y), o == null || o(y));
      } finally {
        d(!1);
      }
    }
  }, S = [
    { icon: lt, text: a("passkey_benefit_1", l) },
    { icon: ie, text: a("passkey_benefit_2", l) },
    { icon: be, text: a("passkey_benefit_3", l) }
  ];
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ t("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: a("create_passkey", l) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: a("passkey_register_subtitle", l) })
        ] }),
        /* @__PURE__ */ t("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: a("signing_in_as", l) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ t("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("p", { className: "text-sm font-semibold text-main mb-4", children: a("passkey_benefits_title", l) }),
          /* @__PURE__ */ e("div", { className: "space-y-3", children: S.map((D, y) => /* @__PURE__ */ t("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("div", { className: "w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center", children: /* @__PURE__ */ e(D.icon, { className: "w-5 h-5 text-brand" }) }),
            /* @__PURE__ */ e("span", { className: "text-sm text-muted", children: D.text })
          ] }, y)) })
        ] }),
        (h || u || m) && /* @__PURE__ */ t("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
          /* @__PURE__ */ e(
            M.div,
            {
              animate: h ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1]
              } : {},
              transition: {
                duration: 1.5,
                repeat: h ? 1 / 0 : 0,
                ease: "easeInOut"
              },
              className: `w-20 h-20 rounded-full flex items-center justify-center mb-4 ${u ? "bg-green-500/20 border-2 border-green-400" : h ? "bg-brand/20 border-2 border-brand" : "bg-red-500/10 border-2 border-red-400"}`,
              children: u ? /* @__PURE__ */ e(J, { className: "w-10 h-10 text-green-400" }) : h ? /* @__PURE__ */ e(F, { className: "w-10 h-10 text-brand animate-spin" }) : /* @__PURE__ */ e(Z, { className: "w-10 h-10 text-red-400" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center", children: a(u ? "passkey_created" : h ? "creating_passkey" : "passkey_create_failed", l) }),
          m && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mt-2 max-w-xs", children: m })
        ] }),
        /* @__PURE__ */ t("div", { className: "mt-auto space-y-3 pb-8", children: [
          !u && /* @__PURE__ */ e(
            "button",
            {
              onClick: p,
              disabled: !T || h,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: h ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(F, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: a("creating_passkey", l) })
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(X, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: a("register_passkey", l) })
              ] })
            }
          ),
          k && !h && !u && /* @__PURE__ */ e(
            "button",
            {
              onClick: k,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center transition-colors",
              children: a("do_this_later", l)
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(fe, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: a("e2e_encrypted", l) })
        ] })
      ]
    }
  );
}, Pt = ({
  sessionToken: r,
  onSuccess: s,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  previewMode: k = !1,
  language: c = "EN"
}) => {
  const [i, l] = w("wallet"), [h, d] = w(0), [m, E] = w(""), [T, z] = w(null), [u, x] = w(null);
  $(() => {
    p();
  }, []);
  const p = async () => {
    if (E(""), l("wallet"), d(0), k) {
      await S();
      return;
    }
    try {
      d(10);
      const b = await y();
      z(b), d(50), l("did"), d(60);
      const f = await N();
      x(f), d(100), l("complete"), setTimeout(() => {
        s(b, f);
      }, 1500);
    } catch (b) {
      const f = b instanceof Error ? b.message : "Setup failed";
      E(f), l("error"), n == null || n(f);
    }
  }, S = async () => {
    d(10), await D(800), d(30), await D(500), d(50), z("0x1234...5678"), l("did"), d(60), await D(800), d(80), await D(500), d(100), x("did:casper:abc123"), l("complete"), setTimeout(() => {
      s("0x1234...5678", "did:casper:abc123");
    }, 1500);
  }, D = (b) => new Promise((f) => setTimeout(f, b)), y = async () => {
    const b = await fetch(`${o}/api/passkey/wallet/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${r}`
      },
      credentials: "include"
    });
    if (!b.ok) {
      const P = await b.json().catch(() => ({}));
      throw new Error(P.error || "Failed to generate wallet");
    }
    const f = await b.json();
    if (!f.success || !f.wallet)
      throw new Error(f.error || "Wallet generation failed");
    return f.wallet;
  }, N = async () => {
    const b = await fetch(`${o}/api/passkey/did/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${r}`
      },
      credentials: "include"
    });
    if (!b.ok) {
      const P = await b.json().catch(() => ({}));
      throw new Error(P.error || "Failed to mint DID");
    }
    const f = await b.json();
    if (!f.success || !f.did_address)
      throw new Error(f.error || "DID minting failed");
    return f.did_address;
  }, g = (b) => {
    switch (b) {
      case "wallet":
        return /* @__PURE__ */ e(Ie, { className: "w-8 h-8" });
      case "did":
        return /* @__PURE__ */ e(X, { className: "w-8 h-8" });
      case "complete":
        return /* @__PURE__ */ e(J, { className: "w-8 h-8" });
      case "error":
        return /* @__PURE__ */ e(Z, { className: "w-8 h-8" });
    }
  }, C = () => {
    switch (i) {
      case "wallet":
        return a("generating_wallet", c);
      case "did":
        return a("minting_did", c);
      case "complete":
        return a("l1_complete", c);
      case "error":
        return a("l1_failed", c);
    }
  }, A = () => {
    switch (i) {
      case "complete":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-brand";
    }
  }, v = () => {
    switch (i) {
      case "complete":
        return "bg-green-500/20 border-green-400";
      case "error":
        return "bg-red-500/10 border-red-400";
      default:
        return "bg-brand/20 border-brand";
    }
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col",
      children: [
        /* @__PURE__ */ t("div", { className: "p-6 pb-2", children: [
          /* @__PURE__ */ t("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-semibold uppercase tracking-widest text-brand/80", children: a("verification_step", c) }),
            /* @__PURE__ */ t("span", { className: "text-xs font-bold text-muted", children: [
              "L1 ",
              a("secure_sdk", c)
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full bg-brand/10 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            M.div,
            {
              className: "bg-brand h-full rounded-full",
              initial: { width: "0%" },
              animate: { width: `${h}%` },
              transition: { duration: 0.5, ease: "easeOut" }
            }
          ) })
        ] }),
        /* @__PURE__ */ t("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center gap-8", children: [
          /* @__PURE__ */ e(
            M.div,
            {
              animate: i !== "complete" && i !== "error" ? {
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1]
              } : {},
              transition: {
                duration: 2,
                repeat: i !== "complete" && i !== "error" ? 1 / 0 : 0,
                ease: "easeInOut"
              },
              className: `w-24 h-24 rounded-full border-2 flex items-center justify-center ${v()}`,
              children: /* @__PURE__ */ e("span", { className: A(), children: i !== "complete" && i !== "error" ? /* @__PURE__ */ e(F, { className: "w-10 h-10 animate-spin" }) : g(i) })
            }
          ),
          /* @__PURE__ */ t("div", { className: "space-y-4", children: [
            /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main leading-tight", children: a("l1_setup_title", c) }),
            /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed font-medium", children: C() })
          ] }),
          /* @__PURE__ */ t("div", { className: "w-full max-w-xs space-y-3", children: [
            /* @__PURE__ */ t("div", { className: `flex items-center gap-3 p-3 rounded-xl ${i === "wallet" ? "bg-brand/10" : h >= 50 ? "bg-green-500/10" : "bg-slate-100/50 dark:bg-white/5"}`, children: [
              /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${h >= 50 ? "bg-green-500/20" : i === "wallet" ? "bg-brand/20" : "bg-slate-200 dark:bg-white/10"}`, children: h >= 50 ? /* @__PURE__ */ e(J, { className: "w-4 h-4 text-green-400" }) : i === "wallet" ? /* @__PURE__ */ e(F, { className: "w-4 h-4 text-brand animate-spin" }) : /* @__PURE__ */ e(Ie, { className: "w-4 h-4 text-muted" }) }),
              /* @__PURE__ */ t("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ e("p", { className: `text-sm font-medium ${h >= 50 ? "text-green-400" : "text-main"}`, children: a("generating_wallet", c) }),
                T && /* @__PURE__ */ e("p", { className: "text-xs text-muted truncate", children: T })
              ] })
            ] }),
            /* @__PURE__ */ t("div", { className: `flex items-center gap-3 p-3 rounded-xl ${i === "did" ? "bg-brand/10" : h >= 100 ? "bg-green-500/10" : "bg-slate-100/50 dark:bg-white/5"}`, children: [
              /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded-full flex items-center justify-center ${h >= 100 ? "bg-green-500/20" : i === "did" ? "bg-brand/20" : "bg-slate-200 dark:bg-white/10"}`, children: h >= 100 ? /* @__PURE__ */ e(J, { className: "w-4 h-4 text-green-400" }) : i === "did" ? /* @__PURE__ */ e(F, { className: "w-4 h-4 text-brand animate-spin" }) : /* @__PURE__ */ e(X, { className: "w-4 h-4 text-muted" }) }),
              /* @__PURE__ */ t("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ e("p", { className: `text-sm font-medium ${h >= 100 ? "text-green-400" : "text-main"}`, children: a("minting_did", c) }),
                u && /* @__PURE__ */ e("p", { className: "text-xs text-muted truncate", children: u })
              ] })
            ] })
          ] }),
          i === "error" && /* @__PURE__ */ t("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("p", { className: "text-red-500 text-sm", children: m }),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: p,
                className: "flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl transition-colors",
                children: [
                  /* @__PURE__ */ e(ae, { className: "w-4 h-4" }),
                  a("try_again", c)
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "p-8", children: /* @__PURE__ */ e("p", { className: "text-center text-xs text-muted", children: a("l1_setup_subtitle", c) }) })
      ]
    }
  );
}, Rt = ({
  email: r,
  verificationId: s,
  onNext: n,
  onError: o,
  apiBaseUrl: k = "https://apis.casperid.com",
  previewMode: c = !1,
  language: i = "EN"
}) => {
  const [l, h] = w(["", "", "", "", "", ""]), [d, m] = w(!1), [E, T] = w(!1), [z, u] = w(""), [x, p] = w(0), [S, D] = w(s);
  $(() => {
    if (x > 0) {
      const v = setTimeout(() => p(x - 1), 1e3);
      return () => clearTimeout(v);
    }
  }, [x]), $(() => {
    l.every((v) => v !== "") && !d && g();
  }, [l]);
  const y = O((v) => {
    u(""), h((b) => {
      const f = [...b], P = f.findIndex((V) => V === "");
      return P !== -1 && (f[P] = v), f;
    });
  }, []), N = O(() => {
    u(""), h((v) => {
      const b = [...v];
      for (let f = b.length - 1; f >= 0; f--)
        if (b[f] !== "") {
          b[f] = "";
          break;
        }
      return b;
    });
  }, []), g = async () => {
    const v = l.join("");
    if (v.length !== 6) {
      u(a("error_pin_incomplete", i));
      return;
    }
    if (m(!0), u(""), c) {
      setTimeout(() => {
        m(!1), n("mock-session-token", null);
      }, 1e3);
      return;
    }
    try {
      const b = await fetch(`${k}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          verificationId: S,
          otp: v
        })
      });
      if (!b.ok) {
        const P = await b.json().catch(() => ({}));
        throw new Error(P.error || `Verification failed with status ${b.status}`);
      }
      const f = await b.json();
      f.success && f.sessionToken ? n(f.sessionToken, f.userAccount) : (u(f.error || a("invalid_code", i)), f.attemptsLeft !== void 0 && u(a("invalid_code_attempts", i).replace("{attempts}", f.attemptsLeft.toString())), h(["", "", "", "", "", ""]), o == null || o(f.error || a("verification_failed", i)));
    } catch {
      const f = a("error_verify_failed", i);
      u(f), h(["", "", "", "", "", ""]), o == null || o(f);
    } finally {
      m(!1);
    }
  }, C = async () => {
    if (!(x > 0 || E)) {
      if (T(!0), u(""), c) {
        setTimeout(() => {
          T(!1), p(60), h(["", "", "", "", "", ""]);
        }, 800);
        return;
      }
      try {
        const v = await fetch(`${k}/api/auth/resend-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ verificationId: S })
        });
        if (!v.ok) {
          const f = await v.json().catch(() => ({}));
          throw new Error(f.error || `Request failed with status ${v.status}`);
        }
        const b = await v.json();
        b.success ? (p(60), h(["", "", "", "", "", ""])) : u(b.error || a("error_resend_failed", i));
      } catch {
        u(a("error_resend_failed", i));
      } finally {
        T(!1);
      }
    }
  }, A = r.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ t("div", { className: "space-y-2 mb-8", children: [
          /* @__PURE__ */ e("h1", { className: "text-3xl font-bold tracking-tight text-main", children: a("verify_email", i) }),
          /* @__PURE__ */ t("p", { className: "text-muted text-sm font-medium", children: [
            a("enter_code", i),
            " ",
            /* @__PURE__ */ e("span", { className: "text-main font-semibold", children: A })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex justify-between gap-2 mb-6", children: l.map((v, b) => /* @__PURE__ */ t(
          "div",
          {
            className: `size-12 rounded-2xl dark:bg-black/20 bg-slate-100/50 flex items-center justify-center text-xl font-bold border transition-all ${v ? "text-brand dark:border-brand-30 border-brand-50" : "text-muted dark:border-white/10 border-slate-200"} ${z ? "border-red-400 dark:border-red-500" : ""}`,
            children: [
              v,
              !v && l.findIndex((f) => f === "") === b && /* @__PURE__ */ e("div", { className: "w-0.5 h-6 bg-brand animate-pulse" })
            ]
          },
          b
        )) }),
        z && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium text-center mb-4", children: z }),
        /* @__PURE__ */ t("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => y(v.toString()),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: v
            },
            v
          )),
          /* @__PURE__ */ e("div", { className: "h-14" }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => y("0"),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: "0"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: N,
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main disabled:opacity-50",
              children: /* @__PURE__ */ e(ct, { className: "w-6 h-6" })
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "mt-auto pb-8 space-y-4", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: g,
              disabled: d || l.some((v) => v === ""),
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(F, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: a("verifying", i) })
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e("span", { children: a("verify", i) }),
                /* @__PURE__ */ e(pe, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
              ] })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: C,
              disabled: x > 0 || E,
              className: "w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-2xl transition-all border dark:border-white/10 border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
              children: E ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(F, { className: "w-4 h-4 animate-spin" }),
                /* @__PURE__ */ e("span", { children: a("sending", i) })
              ] }) : x > 0 ? /* @__PURE__ */ t("span", { children: [
                a("resend_code", i),
                " (",
                x,
                "s)"
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e(ae, { className: "w-4 h-4" }),
                /* @__PURE__ */ e("span", { children: a("resend_code", i) })
              ] })
            }
          )
        ] })
      ]
    }
  );
}, Tt = ({ onNext: r, onSkip: s, language: n = "EN" }) => /* @__PURE__ */ t(
  M.div,
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    className: "flex-1 flex flex-col",
    children: [
      /* @__PURE__ */ t("div", { className: "p-6 pb-2", children: [
        /* @__PURE__ */ t("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ e("span", { className: "text-xs font-semibold uppercase tracking-widest text-brand/80", children: a("verification_step", n) }),
          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-muted", children: a("kyc_required", n) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-full bg-brand/10 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
          "div",
          {
            className: "bg-brand h-full rounded-full",
            style: { width: "40%" }
          }
        ) })
      ] }),
      /* @__PURE__ */ t("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center gap-8", children: [
        /* @__PURE__ */ t("div", { className: "relative group", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" }),
          /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-full bg-gradient-to-tr from-brand-20 to-brand-5 flex items-center justify-center border border-brand-30 shadow-inner", children: /* @__PURE__ */ e(he, { className: "w-16 h-16 text-brand" }) }),
          /* @__PURE__ */ e("div", { className: "absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-brand flex items-center justify-center", children: /* @__PURE__ */ e(ae, { className: "w-4 h-4 text-brand" }) })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main leading-tight", children: a("security_upgrade_required", n) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed font-medium", children: a("security_upgrade_desc", n) })
        ] }),
        /* @__PURE__ */ t("div", { className: "flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-brand/10 rounded-xl text-[10px] font-bold text-brand uppercase tracking-tighter border border-brand-10", children: a("biometric_secure", n) }),
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-cyan-400/10 rounded-xl text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10", children: a("zero_knowledge", n) })
        ] })
      ] }),
      /* @__PURE__ */ t("div", { className: "p-8 space-y-4", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: r,
            className: "w-full bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-brand transition-all active:scale-[0.98]",
            children: a("start_upgrade", n)
          }
        ),
        s && /* @__PURE__ */ e(
          "button",
          {
            onClick: s,
            className: "w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors",
            children: a("do_this_later", n)
          }
        )
      ] })
    ]
  }
), Q = [
  "position_face",
  "blink_slowly",
  "turn_head_left",
  "turn_head_right",
  "processing"
], zt = ({
  requestId: r,
  onNext: s,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  previewMode: k = !1,
  language: c = "EN"
}) => {
  const i = G(null), l = G(null), h = G(null), d = G([]), [m, E] = w(0), [T, z] = w(!1), [u, x] = w(""), [p, S] = w(!1), [D, y] = w(!1);
  $(() => ((async () => {
    try {
      const A = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      h.current = A, i.current && (i.current.srcObject = A, i.current.onloadedmetadata = () => {
        z(!0);
      });
    } catch (A) {
      A.name === "NotAllowedError" ? (y(!0), x(a("camera_permission_denied", c))) : x(a("unable_access_camera", c)), n == null || n("Camera access failed");
    }
  })(), () => {
    h.current && h.current.getTracks().forEach((A) => A.stop());
  }), [n]), O(() => {
    if (!i.current || !l.current) return null;
    const C = l.current, A = i.current, v = C.getContext("2d");
    return v ? (C.width = A.videoWidth, C.height = A.videoHeight, v.drawImage(A, 0, 0), new Promise((b) => {
      C.toBlob((f) => b(f), "image/jpeg", 0.8);
    })) : null;
  }, []), $(() => {
    if (!T || p) return;
    const A = setTimeout(async () => {
      const v = await new Promise((b) => {
        if (!i.current || !l.current) {
          b(null);
          return;
        }
        const f = l.current, P = i.current, V = f.getContext("2d");
        if (!V) {
          b(null);
          return;
        }
        f.width = P.videoWidth, f.height = P.videoHeight, V.drawImage(P, 0, 0), f.toBlob((L) => b(L), "image/jpeg", 0.8);
      });
      v && d.current.push(v), m < Q.length - 1 ? E((b) => b + 1) : N();
    }, 2500);
    return () => clearTimeout(A);
  }, [m, T, p]);
  const N = async () => {
    var C;
    if (S(!0), E(4), k) {
      setTimeout(() => {
        S(!1), s(!0);
      }, 2e3);
      return;
    }
    try {
      const A = new FormData();
      A.append("requestId", r), d.current.forEach((f, P) => {
        A.append("imageFrames", f, `frame_${P}.jpg`);
      }), A.append("metadata", JSON.stringify({
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        frameCount: d.current.length,
        instructions: Q.slice(0, -1)
      }));
      const v = await fetch(`${o}/api/v2/verification/liveness`, {
        method: "POST",
        body: A,
        credentials: "include"
      });
      if (!v.ok) {
        const f = await v.json().catch(() => ({}));
        throw new Error(f.error || `Liveness check failed with status ${v.status}`);
      }
      const b = await v.json();
      b.success && ((C = b.liveness) != null && C.passed) ? (h.current && h.current.getTracks().forEach((f) => f.stop()), s(!0)) : (x(b.error || "Liveness check failed. Please try again."), E(0), d.current = [], S(!1));
    } catch {
      x("Verification failed. Please try again."), E(0), d.current = [], S(!1), n == null || n("Liveness submission failed");
    }
  }, g = () => {
    x(""), E(0), d.current = [], S(!1);
  };
  return D ? /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
      children: [
        /* @__PURE__ */ e(Z, { className: "w-16 h-16 text-red-500 mb-6" }),
        /* @__PURE__ */ e("h2", { className: "text-xl font-bold text-main mb-3", children: "Camera Access Required" }),
        /* @__PURE__ */ e("p", { className: "text-muted text-sm mb-6", children: "Please enable camera access in your browser settings to continue with face verification." }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "px-6 py-3 bg-brand text-white rounded-2xl font-bold",
            children: "Try Again"
          }
        )
      ]
    }
  ) : /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative dark:bg-[#050a0a] bg-slate-50 overflow-hidden",
      children: [
        /* @__PURE__ */ e("canvas", { ref: l, className: "hidden" }),
        /* @__PURE__ */ e("div", { className: "absolute inset-0 z-0", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6fe8ec]/30 via-transparent to-transparent" }) }),
        /* @__PURE__ */ e("div", { className: "relative z-40 pt-12 pb-4 flex items-center justify-center", children: /* @__PURE__ */ t("div", { className: "flex items-center gap-2 px-4 py-1.5 dark:bg-black/40 bg-white/40 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5", children: [
          /* @__PURE__ */ e("div", { className: `w-2 h-2 rounded-full ${T ? "bg-[#6fe8ec] shadow-[0_0_8px_#6fe8ec]" : "bg-yellow-500 animate-pulse"}` }),
          /* @__PURE__ */ e("span", { className: "text-[10px] text-muted uppercase tracking-[0.2em] font-bold", children: a(T ? "live_camera" : "initializing", c) })
        ] }) }),
        /* @__PURE__ */ t("div", { className: "relative z-20 flex-1 flex items-center justify-center", children: [
          /* @__PURE__ */ e(
            "div",
            {
              className: "absolute inset-0 z-10 dark:bg-[#050a0a]/80 bg-white/80 backdrop-blur-[2px]",
              style: {
                mask: "radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)",
                WebkitMask: "radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)"
              }
            }
          ),
          /* @__PURE__ */ t("div", { className: "relative z-30 flex items-center justify-center", children: [
            /* @__PURE__ */ t("div", { className: "w-[200px] h-[290px] flex-shrink-0 rounded-full border-[3px] border-[#6fe8ec] shadow-[0_0_40px_rgba(111,232,236,0.4),inset_0_0_20px_rgba(111,232,236,0.2)] relative overflow-hidden", children: [
              /* @__PURE__ */ e(
                "video",
                {
                  ref: i,
                  autoPlay: !0,
                  playsInline: !0,
                  muted: !0,
                  className: "absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                }
              ),
              /* @__PURE__ */ e(
                M.div,
                {
                  animate: { opacity: [0.4, 1, 0.4] },
                  transition: { duration: 2, repeat: 1 / 0 },
                  className: "absolute inset-0 rounded-full border-[1px] border-white/30"
                }
              ),
              /* @__PURE__ */ e(
                M.div,
                {
                  animate: { top: ["-10%", "110%"] },
                  transition: { duration: 3, repeat: 1 / 0, ease: "easeInOut" },
                  className: "absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6fe8ec] to-transparent shadow-[0_0_20px_#6fe8ec] z-10"
                }
              )
            ] }),
            /* @__PURE__ */ t("div", { className: "absolute w-[280px] h-[380px] pointer-events-none flex items-center justify-center", children: [
              /* @__PURE__ */ e("div", { className: "absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#6fe8ec]/30 rounded-tl-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#6fe8ec]/30 rounded-tr-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#6fe8ec]/30 rounded-bl-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#6fe8ec]/30 rounded-br-2xl" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ t("footer", { className: "relative z-40 p-8 flex flex-col items-center gap-6", children: [
          u ? /* @__PURE__ */ t("div", { className: "dark:bg-red-900/30 bg-red-50 backdrop-blur-2xl border border-red-500/30 w-full p-6 rounded-[2.5rem] text-center", children: [
            /* @__PURE__ */ e("p", { className: "text-red-500 font-bold text-lg mb-4", children: u }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: g,
                className: "px-6 py-2 bg-red-500 text-white rounded-xl font-bold",
                children: "Try Again"
              }
            )
          ] }) : /* @__PURE__ */ t("div", { className: "dark:bg-[#0a1515]/95 bg-white/90 backdrop-blur-2xl border dark:border-white/10 border-black/5 w-full p-6 rounded-2xl text-center shadow-2xl", children: [
            /* @__PURE__ */ e(ue, { mode: "wait", children: /* @__PURE__ */ e(
              M.p,
              {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -10 },
                className: "text-[#6fe8ec] font-bold text-2xl tracking-tight mb-2",
                children: p ? /* @__PURE__ */ t("span", { className: "flex items-center justify-center gap-3", children: [
                  /* @__PURE__ */ e(F, { className: "w-6 h-6 animate-spin" }),
                  "Verifying..."
                ] }) : a(Q[m], c)
              },
              m
            ) }),
            /* @__PURE__ */ t("div", { className: "flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest", children: [
              /* @__PURE__ */ e(fe, { className: "w-3 h-3" }),
              a("secure_face_scan_desc", c)
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "flex gap-2 w-full max-w-[140px]", children: [0, 1, 2].map((C) => /* @__PURE__ */ e(
            "div",
            {
              className: `h-1.5 flex-1 rounded-full transition-all duration-700 ${C <= Math.floor(m / (Q.length - 1) * 2) ? "bg-[#6fe8ec] shadow-[0_0_15px_#6fe8ec]" : "dark:bg-slate-800 bg-slate-200"}`
            },
            C
          )) }),
          /* @__PURE__ */ t("div", { className: "px-6 py-2.5 dark:bg-black/60 bg-white/60 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5 flex items-center gap-3", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `w-2 h-2 rounded-full ${p ? "bg-yellow-400 animate-pulse" : m === Q.length - 1 ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-[#6fe8ec] animate-pulse"}`
              }
            ),
            /* @__PURE__ */ e("span", { className: "text-[10px] dark:text-slate-400 text-slate-600 uppercase tracking-[0.25em] font-black", children: p ? a("analyzing_liveness", c) : m === Q.length - 1 ? a("calibration_complete", c) : a("awaiting_calibration", c) })
          ] })
        ] })
      ]
    }
  );
}, jt = [
  { id: "passport", title: "Passport", desc: "All countries supported", Icon: je },
  { id: "drivers_license", title: "Driver License", desc: "Government issued card", Icon: ze },
  { id: "national_id", title: "ID Card", desc: "National identity document", Icon: be }
], Mt = ({ onNext: r, language: s = "EN" }) => /* @__PURE__ */ t(
  M.div,
  {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    className: "flex-1 px-6 pt-4 flex flex-col",
    children: [
      /* @__PURE__ */ e("h3", { className: "text-2xl font-bold mb-2 text-main", children: a("verify_identity", s) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-sm mb-8 leading-relaxed", children: a("choose_document", s) }),
      /* @__PURE__ */ t("div", { className: "space-y-4 overflow-y-auto pr-1 pb-6", children: [
        jt.map(({ id: n, title: o, desc: k, Icon: c }) => /* @__PURE__ */ t(
          "button",
          {
            onClick: () => r(n),
            className: "w-full group cursor-pointer dark:bg-white/5 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:dark:bg-brand/15 hover:bg-brand/5 hover:dark:border-brand-40 hover:border-brand-30 transition-all transform hover:-translate-y-1",
            children: [
              /* @__PURE__ */ e("div", { className: "w-14 h-14 rounded-xl dark:bg-slate-800/50 bg-white flex items-center justify-center text-brand group-hover:bg-brand/20 transition-colors border dark:border-transparent border-slate-100", children: /* @__PURE__ */ e(c, { className: "w-8 h-8" }) }),
              /* @__PURE__ */ t("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ e("h4", { className: "font-bold text-base text-main", children: a(n, s) }),
                /* @__PURE__ */ e("p", { className: "text-xs text-muted font-medium", children: a(`${n}_desc`, s) })
              ] }),
              /* @__PURE__ */ e(me, { className: "text-brand w-5 h-5" })
            ]
          },
          n
        )),
        /* @__PURE__ */ t("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-brand-30 border-brand-40", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent" }),
          /* @__PURE__ */ t("div", { className: "text-center z-10", children: [
            /* @__PURE__ */ e(ie, { className: "text-brand/40 w-10 h-10 mx-auto mb-1" }),
            /* @__PURE__ */ e("p", { className: "text-[10px] text-muted uppercase tracking-tighter font-bold", children: "Encrypted E2E" })
          ] })
        ] })
      ] })
    ]
  }
), Vt = (r) => ({
  passport: a("passport", r),
  drivers_license: a("drivers_license", r),
  national_id: a("national_id", r)
}), Ot = ({
  requestId: r,
  documentType: s,
  onNext: n,
  onError: o,
  apiBaseUrl: k = "https://apis.casperid.com",
  previewMode: c = !1,
  language: i = "EN"
}) => {
  const l = G(null), h = G(null), d = G(null), [m, E] = w(!1), [T, z] = w(null), [u, x] = w(null), [p, S] = w(!1), [D, y] = w(""), [N, g] = w("front"), [C, A] = w(null);
  $(() => ((async () => {
    try {
      const V = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // Use back camera for documents
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      d.current = V, l.current && (l.current.srcObject = V, l.current.onloadedmetadata = () => {
        E(!0);
      });
    } catch {
      try {
        const L = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        d.current = L, l.current && (l.current.srcObject = L, l.current.onloadedmetadata = () => {
          E(!0);
        });
      } catch {
        y(a("unable_access_camera", i)), o == null || o("Camera access failed");
      }
    }
  })(), () => {
    d.current && d.current.getTracks().forEach((V) => V.stop()), u && URL.revokeObjectURL(u);
  }), [o]);
  const v = async () => {
    if (!l.current || !h.current) return;
    const P = h.current, V = l.current, L = P.getContext("2d");
    L && (P.width = V.videoWidth, P.height = V.videoHeight, L.drawImage(V, 0, 0), P.toBlob((B) => {
      B && (z(B), x(URL.createObjectURL(B)));
    }, "image/jpeg", 0.9));
  }, b = () => {
    u && URL.revokeObjectURL(u), z(null), x(null), y("");
  }, f = async () => {
    if (S(!0), c) {
      setTimeout(() => {
        S(!1), n({
          first_name: "JOHN",
          last_name: "DOE",
          date_of_birth: "01 JAN 1990",
          nationality: "Nigerian"
        }, "mock-upload-id-789");
      }, 2e3);
      return;
    }
    if (!T) {
      S(!1);
      return;
    }
    if (N === "front" && s !== "passport") {
      A(T), z(null), x(null), g("back"), S(!1);
      return;
    }
    S(!0), y("");
    try {
      const P = new FormData();
      P.append("document_type", s), C ? (P.append("front_image", C, "front.jpg"), P.append("back_image", T, "back.jpg")) : P.append("front_image", T, "document.jpg");
      const V = await fetch(`${k}/api/v2/verification/layer3/documents/upload`, {
        method: "POST",
        body: P,
        credentials: "include",
        headers: {
          "X-Request-Id": r
        }
      });
      if (!V.ok) {
        const B = await V.json().catch(() => ({}));
        throw new Error(B.error || `Document upload failed with status ${V.status}`);
      }
      const L = await V.json();
      L.success && L.extracted_data ? (d.current && d.current.getTracks().forEach((B) => B.stop()), n(L.extracted_data, L.upload_id || "")) : (y(L.error || "Failed to process document. Please try again."), S(!1));
    } catch {
      y("Upload failed. Please try again."), S(!1), o == null || o("Document upload failed");
    }
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative",
      children: [
        /* @__PURE__ */ e("canvas", { ref: h, className: "hidden" }),
        /* @__PURE__ */ t("div", { className: "absolute inset-0 z-0", children: [
          /* @__PURE__ */ e("div", { className: "w-full h-full bg-slate-800 flex items-center justify-center", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" }) }),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-[2px]" })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative z-10 p-6 flex flex-col items-center", children: /* @__PURE__ */ e("div", { className: "text-center px-4 py-2 dark:bg-black/40 bg-white/40 backdrop-blur-xl rounded-full border dark:border-white/10 border-black/5", children: /* @__PURE__ */ e("h3", { className: "text-main text-sm font-medium tracking-wide uppercase", children: a("scan_instruction", i).replace("{side}", a(N, i)).replace("{docType}", Vt(i)[s]) }) }) }),
        /* @__PURE__ */ e("div", { className: "relative z-10 flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ t("div", { className: "w-full aspect-[1.58/1] relative", children: [
          u ? /* @__PURE__ */ e(
            "img",
            {
              src: u,
              alt: "Captured document",
              className: "absolute inset-0 w-full h-full object-cover rounded-2xl"
            }
          ) : /* @__PURE__ */ e(
            "video",
            {
              ref: l,
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
          !u && m && /* @__PURE__ */ e(
            M.div,
            {
              animate: { top: ["0%", "100%", "0%"] },
              transition: { duration: 4, repeat: 1 / 0, ease: "linear" },
              className: "absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
            }
          ),
          !m && !u && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl", children: /* @__PURE__ */ e(F, { className: "w-8 h-8 text-[#6DE8EC] animate-spin" }) })
        ] }) }),
        D && /* @__PURE__ */ t("div", { className: "relative z-10 mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3", children: [
          /* @__PURE__ */ e(Z, { className: "w-5 h-5 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-sm font-medium", children: D })
        ] }),
        /* @__PURE__ */ t("div", { className: "relative z-10 p-8 dark:bg-black/60 bg-white/60 backdrop-blur-2xl border-t dark:border-white/10 border-black/5 rounded-t-3xl", children: [
          /* @__PURE__ */ e("p", { className: "text-muted text-xs text-center mb-6 font-medium", children: a(u ? "review_capture" : "align_document", i) }),
          /* @__PURE__ */ e("div", { className: "flex items-center justify-between gap-4", children: u ? /* @__PURE__ */ t(U, { children: [
            /* @__PURE__ */ e(
              "button",
              {
                onClick: b,
                disabled: p,
                className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted disabled:opacity-50",
                children: /* @__PURE__ */ e(ht, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: f,
                disabled: p,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-70",
                children: p ? /* @__PURE__ */ t(U, { children: [
                  /* @__PURE__ */ e(F, { className: "w-6 h-6 animate-spin" }),
                  /* @__PURE__ */ e("span", { children: a("processing", i) })
                ] }) : /* @__PURE__ */ e("span", { children: a(N === "front" && s !== "passport" ? "next_back_side" : "confirm", i) })
              }
            ),
            /* @__PURE__ */ e("div", { className: "w-12 h-12" }),
            " "
          ] }) : /* @__PURE__ */ t(U, { children: [
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(dt, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: v,
                disabled: !m,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-50",
                children: [
                  /* @__PURE__ */ e(nt, { className: "w-6 h-6" }),
                  /* @__PURE__ */ e("span", { children: a("capture", i) })
                ]
              }
            ),
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(st, { className: "w-6 h-6" }) })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "w-32 h-1.5 bg-slate-600/30 rounded-full mx-auto mt-8" })
        ] })
      ]
    }
  );
}, Lt = ({
  requestId: r,
  documentType: s,
  extractedData: n,
  uploadId: o,
  onNext: k,
  onRetake: c,
  onError: i,
  apiBaseUrl: l = "https://apis.casperid.com",
  previewMode: h = !1,
  language: d = "EN"
}) => {
  const [m, E] = w({
    firstName: n.first_name || "",
    lastName: n.last_name || "",
    documentNumber: n.document_number || "",
    dateOfBirth: n.date_of_birth || "",
    nationality: n.nationality || "",
    gender: n.gender || ""
  }), [T, z] = w(!1), [u, x] = w(""), p = (N, g) => {
    E((C) => ({ ...C, [N]: g }));
  }, S = async () => {
    if (!m.firstName || !m.lastName || !m.documentNumber) {
      x(a("error_required_fields", d));
      return;
    }
    if (z(!0), x(""), h) {
      setTimeout(() => {
        z(!1), k({
          first_name: m.firstName,
          last_name: m.lastName,
          document_number: m.documentNumber,
          date_of_birth: m.dateOfBirth,
          nationality: m.nationality,
          gender: m.gender,
          document_type: s
        });
      }, 1500);
      return;
    }
    try {
      const N = await fetch(`${l}/api/v2/verification/layer3/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          upload_id: o,
          liveness_verified: !0,
          document_data: {
            first_name: m.firstName,
            last_name: m.lastName,
            document_number: m.documentNumber,
            date_of_birth: m.dateOfBirth,
            nationality: m.nationality,
            gender: m.gender,
            document_type: s
          }
        })
      });
      if (!N.ok) {
        const C = await N.json().catch(() => ({}));
        throw new Error(C.error || `Data submission failed with status ${N.status}`);
      }
      const g = await N.json();
      g.success ? k({
        first_name: m.firstName,
        last_name: m.lastName,
        document_number: m.documentNumber,
        date_of_birth: m.dateOfBirth,
        nationality: m.nationality,
        gender: m.gender,
        document_type: s
      }) : (x(g.error || "Failed to submit data. Please try again."), z(!1));
    } catch {
      x("Failed to submit data. Please try again."), z(!1), i == null || i("Data submission failed");
    }
  }, D = n.confidence || 0, y = Math.round(D * 100);
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 overflow-y-auto px-6 pb-6",
      children: [
        /* @__PURE__ */ e("div", { className: "flex gap-1 mb-6", children: [1, 2, 3, 0].map((N, g) => /* @__PURE__ */ e(
          "div",
          {
            className: `h-1 flex-1 rounded-xl ${N ? "bg-brand" : "bg-brand/20"}`
          },
          g
        )) }),
        /* @__PURE__ */ t("div", { className: "mb-6", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold text-main mb-2", children: a("review_data", d) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: a("verify_data_desc", d) })
        ] }),
        D > 0 && /* @__PURE__ */ t("div", { className: "mb-6 p-3 rounded-xl dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ t("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-semibold text-muted", children: a("ocr_confidence", d) }),
            /* @__PURE__ */ t("span", { className: `text-xs font-bold ${y >= 80 ? "text-green-500" : y >= 60 ? "text-yellow-500" : "text-red-500"}`, children: [
              y,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            "div",
            {
              className: `h-full rounded-full transition-all ${y >= 80 ? "bg-green-500" : y >= 60 ? "bg-yellow-500" : "bg-red-500"}`,
              style: { width: `${y}%` }
            }
          ) }),
          y < 80 && /* @__PURE__ */ e("p", { className: "text-[10px] text-yellow-500 mt-2", children: a("verify_data_carefully", d) })
        ] }),
        u && /* @__PURE__ */ t("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2", children: [
          /* @__PURE__ */ e(Z, { className: "w-4 h-4 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-xs font-medium", children: u })
        ] }),
        /* @__PURE__ */ t("div", { className: "space-y-5", children: [
          /* @__PURE__ */ t("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: a("full_name", d) }),
            /* @__PURE__ */ t("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(_t, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e("div", { className: "flex flex-col w-full", children: /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: `${m.firstName} ${m.lastName}`,
                  onChange: (N) => {
                    const g = N.target.value.split(" ");
                    p("firstName", g[0] || ""), p("lastName", g.slice(1).join(" ") || "");
                  },
                  placeholder: a("enter_first_name", d)
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ t("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: a("id_number", d) }),
            /* @__PURE__ */ t("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(ze, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: m.documentNumber,
                  onChange: (N) => p("documentNumber", N.target.value),
                  placeholder: a("enter_doc_number", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ t("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: a("date_of_birth", d) }),
            /* @__PURE__ */ t("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(rt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: m.dateOfBirth,
                  onChange: (N) => p("dateOfBirth", N.target.value),
                  placeholder: a("date_format", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ t("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: a("nationality", d) }),
            /* @__PURE__ */ t("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(je, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: m.nationality,
                  onChange: (N) => p("nationality", N.target.value),
                  placeholder: a("enter_nationality", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ t("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-brand-20 group", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-gradient-to-tr from-brand-20 to-cyan-500/10 blur-sm" }),
            /* @__PURE__ */ t("div", { className: "absolute inset-0 bg-brand/10 flex flex-col items-center justify-center p-4", children: [
              /* @__PURE__ */ t("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ e(J, { className: "text-brand w-5 h-5" }),
                /* @__PURE__ */ e("span", { className: "text-xs font-bold dark:text-slate-200 text-slate-700", children: a("scanned_successfully", d) })
              ] }),
              c && /* @__PURE__ */ e(
                "button",
                {
                  onClick: c,
                  className: "mt-2 text-[10px] text-brand underline font-medium",
                  type: "button",
                  children: a("retake_photo", d)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ t("div", { className: "mt-8", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: S,
              disabled: T,
              className: "w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70",
              children: T ? /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
                /* @__PURE__ */ e("span", { children: a("submitting", d) })
              ] }) : /* @__PURE__ */ t(U, { children: [
                /* @__PURE__ */ e("span", { children: a("confirm_mint", d) }),
                /* @__PURE__ */ e(ft, { className: "w-5 h-5" })
              ] })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-center text-[10px] mt-4 text-slate-500", children: a("secured_by_casper", d) })
        ] })
      ]
    }
  );
}, qt = (r) => ({
  processing: {
    title: a("processing_verification", r),
    subtitle: a("processing_subtitle", r)
  },
  minting: {
    title: a("minting_identity", r),
    subtitle: a("minting_subtitle", r)
  },
  completed: {
    title: a("identity_minted", r),
    subtitle: a("minted_subtitle", r)
  },
  failed: {
    title: a("verification_failed", r),
    subtitle: a("verification_failed_subtitle", r)
  }
}), Ut = ({
  requestId: r,
  onNext: s,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  previewMode: k = !1,
  language: c = "EN"
}) => {
  const [i, l] = w("processing"), d = qt(c)[i], [m, E] = w(0), [T, z] = w(""), [u, x] = w(null), p = G(null), S = G(0);
  $(() => {
    const y = async () => {
      var N;
      if (k) {
        l("processing"), await new Promise((g) => setTimeout(g, 2e3)), l("minting"), await new Promise((g) => setTimeout(g, 2e3)), l("completed"), await new Promise((g) => setTimeout(g, 1e3)), s("mock-proof-hash-abc-123");
        return;
      }
      try {
        const g = await fetch(`${o}/api/v2/verification/${r}/status`, {
          method: "GET",
          credentials: "include"
        });
        if (!g.ok)
          throw new Error(`Status check failed with status ${g.status}`);
        const C = await g.json();
        if (C.success && C.verification) {
          const A = C.verification.status, v = C.verification.progress;
          let b = 0;
          switch (v && (v.livenessCompleted && (b += 50), v.documentCompleted && (b += 50)), E(b || m), A) {
            case "pending":
            case "in_progress":
              b > 70 || v != null && v.documentCompleted ? l("minting") : l("processing");
              break;
            case "completed":
              l("completed"), E(100), (N = C.verification.results) != null && N.proofHash && x(C.verification.results.proofHash), p.current && clearInterval(p.current), setTimeout(() => {
                var f, P;
                s((P = (f = C.verification) == null ? void 0 : f.results) == null ? void 0 : P.proofHash);
              }, 2e3);
              break;
            case "failed":
            case "cancelled":
              l("failed"), z(C.verification.error || C.error || "Verification failed. Please try again."), p.current && clearInterval(p.current), n == null || n("Verification failed");
              break;
          }
        } else
          S.current++, S.current > 60 && (l("failed"), z("Verification timed out. Please try again."), p.current && clearInterval(p.current), n == null || n("Verification timeout"));
      } catch {
        S.current++, S.current > 60 && (l("failed"), z("Connection lost. Please check your network and try again."), p.current && clearInterval(p.current), n == null || n("Connection error"));
      }
    };
    return y(), p.current = setInterval(y, 2e3), () => {
      p.current && clearInterval(p.current);
    };
  }, [r, o, s, n, m]), $(() => {
    if (i === "processing" || i === "minting") {
      const y = setInterval(() => {
        E((N) => {
          const g = i === "minting" ? 2 : 1, C = i === "minting" ? 95 : 70;
          return Math.min(N + g, C);
        });
      }, 500);
      return () => clearInterval(y);
    }
  }, [i]);
  const D = () => {
    l("processing"), E(0), z(""), S.current = 0, p.current && clearInterval(p.current), p.current = setInterval(async () => {
      var y, N;
      try {
        const g = await fetch(`${o}/api/v2/verification/${r}/status`, {
          method: "GET",
          credentials: "include"
        });
        if (!g.ok)
          throw new Error(`Status check failed with status ${g.status}`);
        const C = await g.json();
        C.success && ((y = C.verification) == null ? void 0 : y.status) === "completed" && (l("completed"), E(100), (N = C.verification.results) != null && N.proofHash && x(C.verification.results.proofHash), p.current && clearInterval(p.current), setTimeout(() => {
          var A, v;
          s((v = (A = C.verification) == null ? void 0 : A.results) == null ? void 0 : v.proofHash);
        }, 2e3));
      } catch {
      }
    }, 2e3);
  };
  return /* @__PURE__ */ t(
    M.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
      children: [
        /* @__PURE__ */ t("div", { className: "relative w-64 h-64 flex items-center justify-center mb-12", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full border-4 border-dashed border-brand-20 animate-[spin_10s_linear_infinite]" }),
          /* @__PURE__ */ e("div", { className: "absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" }),
          /* @__PURE__ */ t(
            M.div,
            {
              animate: i !== "failed" ? { rotateY: [0, 180, 360], y: [-10, 10, -10] } : {},
              transition: { duration: 6, repeat: 1 / 0, ease: "easeInOut" },
              className: `relative w-40 h-56 backdrop-blur-xl border rounded-2xl flex flex-col p-4 ${i === "completed" ? "bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]" : i === "failed" ? "bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]" : "bg-brand/10 border-brand-30 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]"}`,
              children: [
                /* @__PURE__ */ t("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded flex items-center justify-center ${i === "completed" ? "bg-green-500/30" : i === "failed" ? "bg-red-500/30" : "bg-brand/30"}`, children: i === "completed" ? /* @__PURE__ */ e(J, { className: "text-green-500 w-4 h-4" }) : i === "failed" ? /* @__PURE__ */ e(Z, { className: "text-red-500 w-4 h-4" }) : /* @__PURE__ */ e(Me, { className: "text-brand w-4 h-4" }) }),
                  /* @__PURE__ */ e("div", { className: `w-6 h-1 rounded-full ${i === "completed" ? "bg-green-500/40" : i === "failed" ? "bg-red-500/40" : "bg-brand/40"}` })
                ] }),
                /* @__PURE__ */ t("div", { className: "space-y-3 mb-auto", children: [
                  /* @__PURE__ */ e("div", { className: `h-2 w-3/4 rounded-full ${i === "completed" ? "bg-green-500/20" : i === "failed" ? "bg-red-500/20" : "bg-brand/20"}` }),
                  /* @__PURE__ */ e("div", { className: `h-2 w-1/2 rounded-full ${i === "completed" ? "bg-green-500/20" : i === "failed" ? "bg-red-500/20" : "bg-brand/20"}` })
                ] }),
                /* @__PURE__ */ t("div", { className: "flex items-center gap-2 mt-4", children: [
                  /* @__PURE__ */ e("div", { className: `size-6 rounded-full overflow-hidden border border-white/10 ${i === "completed" ? "bg-gradient-to-tr from-green-500 to-[#6DE8EC]" : i === "failed" ? "bg-gradient-to-tr from-red-500 to-orange-500" : "bg-gradient-to-tr from-brand to-[#6DE8EC]"}` }),
                  /* @__PURE__ */ t("div", { className: "flex flex-col items-start", children: [
                    /* @__PURE__ */ e("div", { className: "h-1.5 w-12 bg-white/20 rounded-full mb-1" }),
                    /* @__PURE__ */ e("div", { className: "h-1 w-8 bg-white/10 rounded-full" })
                  ] })
                ] }),
                i !== "failed" && i !== "completed" && /* @__PURE__ */ e(
                  M.div,
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
        /* @__PURE__ */ t("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h2", { className: `text-2xl font-bold bg-clip-text ${i === "completed" ? "text-green-500" : i === "failed" ? "text-red-500" : "dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 bg-slate-900 dark:text-transparent text-slate-900"}`, children: d.title }),
          /* @__PURE__ */ e("p", { className: "dark:text-slate-400 text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto", children: d.subtitle })
        ] }),
        i === "failed" && /* @__PURE__ */ e(
          "button",
          {
            onClick: D,
            className: "mt-6 px-6 py-3 bg-brand text-white rounded-2xl font-bold",
            children: a("try_again", c)
          }
        ),
        u && i === "completed" && /* @__PURE__ */ t("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: a("credential_hash", c) }),
          /* @__PURE__ */ t("p", { className: "text-xs font-mono text-main break-all", children: [
            u.slice(0, 20),
            "...",
            u.slice(-20)
          ] })
        ] }),
        i !== "failed" && /* @__PURE__ */ t("div", { className: "w-full mt-12 p-6 dark:bg-brand/5 bg-brand/5 border-t dark:border-white/5 border-black/5", children: [
          /* @__PURE__ */ t("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-medium text-brand uppercase tracking-widest", children: a("transaction_status", c) }),
            /* @__PURE__ */ e("span", { className: `text-xs font-bold ${i === "completed" ? "text-green-500" : "text-[#6DE8EC]"}`, children: a("complete_percent", c).replace("{percent}", m.toString()) })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-brand/10 bg-brand/10 rounded-full overflow-hidden mb-4", children: /* @__PURE__ */ e(
            M.div,
            {
              initial: { width: "0%" },
              animate: { width: `${m}%` },
              transition: { duration: 0.5 },
              className: `h-full rounded-full ${i === "completed" ? "bg-gradient-to-r from-green-500 to-[#6DE8EC]" : "bg-gradient-to-r from-brand to-[#6DE8EC]"} shadow-[0_0_10px_rgba(114,43,238,0.5)]`
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "flex items-center gap-3 px-3 py-2 dark:bg-brand/10 bg-brand/10 rounded-xl border dark:border-brand-10 border-brand-5", children: [
            /* @__PURE__ */ e(mt, { className: `w-4 h-4 ${i === "completed" ? "text-green-500" : "text-brand"}` }),
            /* @__PURE__ */ t("p", { className: "text-[10px] dark:text-slate-300 text-slate-600 font-medium", children: [
              i === "processing" && a("validating_docs", c),
              i === "minting" && a("broadcasting_tx", c),
              i === "completed" && a("tx_confirmed", c)
            ] })
          ] })
        ] })
      ]
    }
  );
}, $t = ({ onNext: r, language: s = "EN" }) => /* @__PURE__ */ t(
  M.div,
  {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
    children: [
      /* @__PURE__ */ t("div", { className: "relative mb-10 group", children: [
        /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-[#6fe8ec]/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all" }),
        /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-2xl bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100", children: /* @__PURE__ */ e(J, { className: "text-slate-900 w-16 h-16" }) })
      ] }),
      /* @__PURE__ */ e("h1", { className: "text-main text-3xl font-bold leading-tight mb-3", children: a("identity_verified", s) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed mb-12", children: a("identity_verified_desc", s) }),
      /* @__PURE__ */ t("div", { className: "w-full dark:bg-white/5 bg-black/5 rounded-2xl p-5 mb-8 flex items-center justify-between text-left", children: [
        /* @__PURE__ */ t("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ e("span", { className: "text-main font-bold text-sm", children: a("share_data_consent", s) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-xs leading-normal", children: a("authorize_dapps", s) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-11 h-6 bg-brand rounded-full relative p-1 cursor-pointer", children: /* @__PURE__ */ e("div", { className: "absolute right-1 top-1 size-4 bg-white rounded-full" }) })
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          onClick: r,
          className: "w-full bg-[#6fe8ec] hover:brightness-105 active:scale-[0.98] transition-all text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-[#6fe8ec]/20 flex items-center justify-center gap-2",
          children: [
            a("return_to_app", s),
            /* @__PURE__ */ e(pe, { className: "w-5 h-5" })
          ]
        }
      )
    ]
  }
), Bt = [
  "perm_identity",
  "perm_profile",
  "perm_kyc"
], Ft = ({
  appName: r = "This App",
  appLogoFallback: s,
  onApprove: n,
  onDeny: o,
  language: k = "EN"
}) => /* @__PURE__ */ t(
  M.div,
  {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    className: "flex-1 px-8 pt-8 flex flex-col items-center",
    children: [
      /* @__PURE__ */ t("div", { className: "flex flex-col items-center gap-4 mb-10", children: [
        /* @__PURE__ */ t("div", { className: "relative", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full shadow-[0_0_20px_rgba(134,81,225,0.3)] animate-pulse" }),
          /* @__PURE__ */ e("div", { className: "relative w-24 h-24 rounded-full border-2 border-brand-40 p-1 dark:bg-black/50 bg-white", children: s ? /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full overflow-hidden", children: /* @__PURE__ */ e("img", { src: s, alt: r, className: "w-full h-full object-cover" }) }) : /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl", children: r.slice(0, 2).toUpperCase() }) })
        ] }),
        /* @__PURE__ */ t("div", { className: "text-center", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main", children: r }),
          /* @__PURE__ */ e("p", { className: "text-brand/70 text-sm font-medium mt-1 uppercase tracking-wider", children: a("requesting_access", k) })
        ] })
      ] }),
      /* @__PURE__ */ t("div", { className: "w-full space-y-3", children: [
        /* @__PURE__ */ e("h3", { className: "text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1", children: a("permission_request", k) }),
        Bt.map((c) => /* @__PURE__ */ t(
          "div",
          {
            className: "flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 transition-all",
            children: [
              /* @__PURE__ */ e("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0", children: /* @__PURE__ */ e(J, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ e("p", { className: "text-sm font-medium text-main", children: a(c, k) })
            ]
          },
          c
        ))
      ] }),
      /* @__PURE__ */ t("div", { className: "mt-8 flex gap-3 p-4 rounded-2xl dark:bg-brand/5 bg-brand/5", children: [
        /* @__PURE__ */ e(ie, { className: "text-brand w-5 h-5 shrink-0" }),
        /* @__PURE__ */ t("p", { className: "text-xs leading-relaxed text-muted", children: [
          /* @__PURE__ */ t("span", { className: "font-bold text-main", children: [
            a("privacy_note", k),
            ":"
          ] }),
          " ",
          a("privacy_desc", k)
        ] })
      ] }),
      /* @__PURE__ */ t("footer", { className: "mt-auto w-full pb-8 flex flex-col gap-3", children: [
        /* @__PURE__ */ t(
          "button",
          {
            onClick: n,
            className: "w-full py-4 rounded-2xl bg-brand hover:bg-brand-90 text-white font-bold text-base shadow-xl shadow-brand transition-all flex items-center justify-center gap-2",
            children: [
              a("approve_verify", k),
              /* @__PURE__ */ e(he, { className: "w-5 h-5" })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: o,
            className: "w-full py-3 rounded-2xl bg-transparent dark:hover:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all",
            children: a("deny", k)
          }
        )
      ] })
    ]
  }
);
function Ae(r = "light") {
  return r === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : r;
}
const De = ["AuthSelection", "Login", "PasskeyAuth", "PinVerification", "PasskeyRegister"], Kt = "https://apis.casperid.com", Pe = {
  requestId: "",
  verificationTier: "layer_3"
}, Zt = ({
  isOpen: r,
  apiKey: s,
  theme: n = {},
  requiredTier: o,
  onSuccess: k,
  onClose: c,
  onError: i,
  mode: l = "login",
  previewMode: h = !1,
  initialScreen: d,
  apiBaseUrl: m,
  termsUrl: E = "#",
  privacyUrl: T = "#",
  logoUrl: z,
  language: u = "EN"
}) => {
  const {
    primaryColor: x = "#8651e1",
    borderRadius: p = "12",
    fontFamily: S = "Inter",
    mode: D = "light"
  } = n, [y, N] = w(Ae(D)), [g, C] = w(
    d ?? (l === "verify" ? "SecurityUpgrade" : "AuthSelection")
  ), [A, v] = w({ email: "", verificationId: "" }), [b, f] = w(null), [P, V] = w({
    email: "",
    userExists: !1,
    hasPasskey: !1,
    userAccount: null
  }), [L, B] = w(Pe), [Oe, ce] = w(""), [Wt, _e] = w(""), W = m || Kt, xe = p.toString().endsWith("px") ? p.toString() : `${p}px`, ye = S.includes(" ") ? `"${S}", sans-serif` : `${S}, sans-serif`, ne = et.useId().replace(/:/g, ""), ge = {
    "--casperid-primary": x,
    "--casperid-radius": xe,
    "--casperid-font": ye
  }, ve = `
        #casperid-modal-${ne},
        #casperid-modal-${ne} * {
            --casperid-primary: ${x};
            --casperid-radius: ${xe};
            --casperid-font: ${ye};
        }
    `;
  $(() => {
    if (D === "system") {
      const _ = window.matchMedia("(prefers-color-scheme: dark)"), I = (q) => N(q.matches ? "dark" : "light");
      return _.addEventListener("change", I), () => _.removeEventListener("change", I);
    } else
      N(Ae(D));
  }, [D]), $(() => {
    h && d && C(d);
  }, [h, d]), $(() => {
    r && !h && (C(d ?? (l === "verify" ? "SecurityUpgrade" : "AuthSelection")), v({ email: "", verificationId: "" }), f(null), V({ email: "", userExists: !1, hasPasskey: !1, userAccount: null }), B(Pe), ce(""), _e(""));
  }, [r, l, h, d]);
  const we = () => N((_) => _ === "dark" ? "light" : "dark"), R = O((_) => C(_), []), se = O(async (_) => {
    try {
      const I = _ === "layer_2" ? `${m}/api/v2/verification/layer2/start` : `${m}/api/v2/verification/layer3/start`, q = await fetch(I, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": s
        },
        credentials: "include",
        body: JSON.stringify({
          purpose: "sdk_verification",
          ..._ === "layer_3" ? { verificationMethod: "document" } : {}
        })
      });
      if (!q.ok) {
        const ee = await q.json().catch(() => ({}));
        throw new Error(ee.error || `Request failed with status ${q.status}`);
      }
      const K = await q.json();
      if (K.success && K.verification)
        return B((ee) => ({
          ...ee,
          requestId: K.verification.requestId,
          verificationTier: _
        })), K.verification.requestId;
      throw new Error(K.error || "Failed to start verification");
    } catch (I) {
      return i == null || i(I instanceof Error ? I : new Error("Failed to start verification")), null;
    }
  }, [m, s, i]), Le = O((_, I) => {
    f(_), V((q) => ({
      ...q,
      sessionToken: _,
      userAccount: I || null
    })), I != null && I.wallet && (I != null && I.did_address) && P.hasPasskey ? de(I.tier) : R("PasskeyRegister");
  }, [R, P.hasPasskey]), qe = O((_) => {
    V((I) => ({ ...I, email: _, hasPasskey: !0, userExists: !0 })), R("PasskeyAuth");
  }, [R]), Ue = O((_, I) => {
    f(_), V((q) => ({
      ...q,
      sessionToken: _,
      userAccount: I ? {
        user_id: I.user_id,
        wallet: I.wallet,
        tier: I.tier,
        did_address: I.did_address
      } : null
    })), de(I == null ? void 0 : I.tier);
  }, []), $e = O((_) => {
    V((I) => ({
      ...I,
      hasPasskey: !0,
      userAccount: _ ? {
        user_id: _.user_id,
        tier: _.tier
      } : I.userAccount
    })), R("L1Setup");
  }, [R]), Be = O((_, I) => {
    V((q) => {
      var K;
      return {
        ...q,
        userAccount: {
          ...q.userAccount,
          user_id: ((K = q.userAccount) == null ? void 0 : K.user_id) || "",
          wallet: _,
          did_address: I,
          tier: "layer_1"
        }
      };
    }), de("layer_1");
  }, []), de = O((_) => {
    const I = _ || "layer_0";
    if (!o) {
      R("IdentityVerified");
      return;
    }
    const q = o === "L1" ? "layer_1" : o === "L2" ? "layer_2" : o === "L3" ? "layer_3" : "layer_1", K = ["layer_0", "layer_1", "layer_2", "layer_3"], ee = K.indexOf(I), Ne = K.indexOf(q);
    ee >= Ne ? R("IdentityVerified") : Ne >= 2 ? R("SecurityUpgrade") : R("IdentityVerified");
  }, [o, R]), Fe = O((_) => {
    const I = (_ == null ? void 0 : _.sessionToken) || (_ == null ? void 0 : _.token);
    I && f(I), R("SecurityUpgrade");
  }, [R]), Ke = O(async () => {
    await se("layer_2") && R("FaceScan");
  }, [se, R]), He = O(async (_) => {
    B((I) => ({ ...I, livenessVerified: _ })), o === "L3" ? await se("layer_3") && R("VerifyIdentityChoice") : R("MintingIdentity");
  }, [o, se, R]), We = O((_) => {
    B((I) => ({ ...I, documentType: _ })), R("DocumentScan");
  }, [R]), Ge = O((_, I) => {
    B((q) => ({ ...q, extractedData: _ })), ce(I), R("ReviewData");
  }, [R]), Ye = O((_) => {
    B((I) => ({ ...I, extractedData: _ })), R("MintingIdentity");
  }, [R]), Je = O(() => {
    B((_) => ({ ..._, extractedData: void 0 })), ce(""), R("DocumentScan");
  }, [R]), Ze = O((_) => {
    _ && _e(_), R("IdentityVerified");
  }, [R]), Qe = O(() => {
    if (!b) {
      i == null || i(new Error("No valid session token available"));
      return;
    }
    k == null || k(b), c == null || c();
  }, [b, k, c, i]), H = O((_) => {
    i == null || i(new Error(_));
  }, [i]), Xe = O((_, I) => {
    v({ email: _, verificationId: I }), V((q) => ({ ...q, email: _ })), R("PinVerification");
  }, [R]);
  if (!r && !h) return null;
  const ke = () => {
    switch (g) {
      case "AuthSelection":
        return /* @__PURE__ */ e(
          yt,
          {
            onNext: (_) => R(_ === "otp" ? "Login" : "SecurityUpgrade"),
            onExtensionSuccess: Fe,
            onError: H,
            language: u
          }
        );
      case "Login":
        return /* @__PURE__ */ e(
          gt,
          {
            onNext: Xe,
            onPasskeyUser: qe,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "PasskeyAuth":
        return /* @__PURE__ */ e(
          At,
          {
            email: P.email,
            onSuccess: Ue,
            onError: H,
            onFallbackToOTP: () => R("Login"),
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "PasskeyRegister":
        return /* @__PURE__ */ e(
          Dt,
          {
            email: P.email || A.email,
            sessionToken: b || "",
            onSuccess: $e,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "L1Setup":
        return /* @__PURE__ */ e(
          Pt,
          {
            sessionToken: b || "",
            onSuccess: Be,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "PinVerification":
        return /* @__PURE__ */ e(
          Rt,
          {
            email: A.email,
            verificationId: A.verificationId,
            onNext: Le,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "SecurityUpgrade":
        return /* @__PURE__ */ e(
          Tt,
          {
            onNext: Ke,
            onSkip: () => R("IdentityVerified"),
            language: u
          }
        );
      case "FaceScan":
        return /* @__PURE__ */ e(
          zt,
          {
            requestId: L.requestId,
            onNext: He,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "VerifyIdentityChoice":
        return /* @__PURE__ */ e(
          Mt,
          {
            onNext: We,
            language: u
          }
        );
      case "DocumentScan":
        return /* @__PURE__ */ e(
          Ot,
          {
            requestId: L.requestId,
            documentType: L.documentType || "passport",
            onNext: Ge,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "ReviewData":
        return /* @__PURE__ */ e(
          Lt,
          {
            requestId: L.requestId,
            documentType: L.documentType || "passport",
            extractedData: L.extractedData || {},
            uploadId: Oe,
            onNext: Ye,
            onRetake: Je,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "MintingIdentity":
        return /* @__PURE__ */ e(
          Ut,
          {
            requestId: L.requestId,
            onNext: Ze,
            onError: H,
            apiBaseUrl: W,
            previewMode: h,
            language: u
          }
        );
      case "IdentityVerified":
        return /* @__PURE__ */ e($t, { onNext: () => R("PermissionsRequest"), language: u });
      case "PermissionsRequest":
        return /* @__PURE__ */ e(Ft, { onApprove: Qe, onDeny: () => c == null ? void 0 : c(), language: u });
      default:
        return null;
    }
  };
  return h ? /* @__PURE__ */ t(U, { children: [
    /* @__PURE__ */ e("style", { children: ve }),
    /* @__PURE__ */ e("div", { id: `casperid-modal-${ne}`, style: ge, className: `relative ${y}`, children: /* @__PURE__ */ t(Ce, { className: "backdrop-blur-3xl", theme: y, children: [
      /* @__PURE__ */ e(
        Se,
        {
          onClose: c,
          showClose: g !== "AuthSelection",
          subtitle: g === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
          theme: y,
          toggleTheme: we
        }
      ),
      /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(ue, { mode: "wait", children: /* @__PURE__ */ e(M.div, { className: "flex-1 flex flex-col", children: ke() }, g) }) }),
      De.includes(g) && /* @__PURE__ */ e(Ee, { children: /* @__PURE__ */ t("p", { className: "text-[11px] text-slate-500 font-medium", children: [
        "By connecting, you agree to our",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: E, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
        " ",
        "&",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: T, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
      ] }) })
    ] }) })
  ] }) : /* @__PURE__ */ t(U, { children: [
    /* @__PURE__ */ e("style", { children: ve }),
    /* @__PURE__ */ t(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        style: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" },
        onClick: (_) => _.target === _.currentTarget && (c == null ? void 0 : c()),
        children: [
          /* @__PURE__ */ t("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: "absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]",
                style: { backgroundColor: `${x}1a` }
              }
            ),
            /* @__PURE__ */ e("div", { className: "absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" })
          ] }),
          /* @__PURE__ */ e(
            M.div,
            {
              id: `casperid-modal-${ne}`,
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              style: ge,
              className: `relative selection:bg-brand/30 ${y}`,
              children: /* @__PURE__ */ t(Ce, { className: "backdrop-blur-3xl", theme: y, children: [
                /* @__PURE__ */ e(
                  Se,
                  {
                    onClose: c,
                    showClose: g !== "AuthSelection",
                    subtitle: g === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
                    theme: y,
                    toggleTheme: we
                  }
                ),
                /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(ue, { mode: "wait", children: /* @__PURE__ */ e(M.div, { className: "flex-1 flex flex-col", children: ke() }, g) }) }),
                De.includes(g) && /* @__PURE__ */ e(Ee, { children: /* @__PURE__ */ t("p", { className: "text-[11px] text-slate-500 font-medium", children: [
                  "By connecting, you agree to our",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: E, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
                  " ",
                  "&",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: T, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
                ] }) })
              ] })
            }
          )
        ]
      }
    )
  ] });
};
async function Qt(r, s = {}, n = 3e4) {
  const o = new AbortController(), k = setTimeout(() => o.abort(), n);
  try {
    return await fetch(r, {
      ...s,
      signal: o.signal
    });
  } finally {
    clearTimeout(k);
  }
}
class Ht extends Error {
  constructor(s, n) {
    super(s), this.name = "ApiError", this.status = n;
  }
}
async function Xt(r) {
  if (!r.ok) {
    const s = await r.json().catch(() => ({}));
    throw new Ht(
      s.error || s.message || `Request failed with status ${r.status}`,
      r.status
    );
  }
  return r.json();
}
export {
  Ht as ApiError,
  yt as AuthSelectionScreen,
  Zt as CasperIDModal,
  Ot as DocumentScanScreen,
  zt as FaceScanScreen,
  Ee as Footer,
  Ce as GlassContainer,
  Se as Header,
  $t as IdentityVerifiedScreen,
  gt as LoginScreen,
  Ut as MintingIdentityScreen,
  Ft as PermissionsRequestScreen,
  Rt as PinVerificationScreen,
  Lt as ReviewDataScreen,
  Tt as SecurityUpgradeScreen,
  Mt as VerifyIdentityChoiceScreen,
  Zt as default,
  Qt as fetchWithTimeout,
  Xt as handleApiResponse
};
//# sourceMappingURL=index.mjs.map
