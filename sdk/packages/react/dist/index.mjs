import { jsx as e, jsxs as a, Fragment as B } from "react/jsx-runtime";
import ht, { forwardRef as Ge, createElement as Se, useState as y, useEffect as W, useCallback as $, useRef as se } from "react";
import { motion as L, AnimatePresence as Ee } from "framer-motion";
const Ue = ({ children: r, className: i = "", theme: n = "" }) => (
  // Destructure theme and provide default
  /* @__PURE__ */ e(
    "div",
    {
      className: `glass-container relative w-full h-full rounded-[var(--casperid-radius,1.5rem)] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${i} ${n}`,
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
const ft = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Ye = (...r) => r.filter((i, n, l) => !!i && l.indexOf(i) === n).join(" ");
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var bt = {
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
const _t = Ge(
  ({
    color: r = "currentColor",
    size: i = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: l,
    className: g = "",
    children: f,
    iconNode: m,
    ...o
  }, s) => Se(
    "svg",
    {
      ref: s,
      ...bt,
      width: i,
      height: i,
      stroke: r,
      strokeWidth: l ? Number(n) * 24 / Number(i) : n,
      className: Ye("lucide", g),
      ...o
    },
    [
      ...m.map(([c, d]) => Se(c, d)),
      ...Array.isArray(f) ? f : [f]
    ]
  )
);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const z = (r, i) => {
  const n = Ge(
    ({ className: l, ...g }, f) => Se(_t, {
      ref: f,
      iconNode: i,
      className: Ye(`lucide-${ft(r)}`, l),
      ...g
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
const De = z("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Re = z("BadgeCheck", [
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
const yt = z("Calendar", [
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
const xt = z("Camera", [
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
const Ae = z("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const le = z("CircleAlert", [
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
const _e = z("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gt = z("CircleHelp", [
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
const Je = z("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vt = z("Delete", [
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
const be = z("Fingerprint", [
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
const wt = z("Flashlight", [
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
const Ke = z("Globe", [
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
const kt = z("Key", [
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
const Z = z("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pe = z("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nt = z("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ct = z("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const It = z("Network", [
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
const St = z("Puzzle", [
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
const we = z("RefreshCw", [
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
const Et = z("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ye = z("ShieldCheck", [
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
const Ze = z("Shield", [
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
const Te = z("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const At = z("Sparkles", [
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
const Dt = z("Sun", [
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
const Rt = z("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pt = z("Wallet", [
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
const Tt = z("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), $e = ({
  onClose: r,
  title: i = "CasperID",
  subtitle: n = "SECURE SDK",
  showClose: l = !0,
  theme: g,
  toggleTheme: f,
  logoUrl: m
}) => /* @__PURE__ */ a("header", { className: "flex items-center justify-between px-6 pt-8 pb-4 relative z-20", children: [
  /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ e("div", { className: "p-2 bg-brand rounded-xl flex items-center justify-center shadow-brand", children: m ? /* @__PURE__ */ e("img", { src: m, alt: i, className: "w-5 h-5 object-contain" }) : /* @__PURE__ */ e(Ze, { className: "text-white w-5 h-5" }) }),
    /* @__PURE__ */ a("div", { children: [
      /* @__PURE__ */ e("h2", { className: "text-lg font-bold tracking-tight text-main", children: i }),
      n && /* @__PURE__ */ e("p", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: n })
    ] })
  ] }),
  /* @__PURE__ */ a("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: f,
        className: "p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-xl transition-colors text-muted",
        "aria-label": "Toggle theme",
        children: g === "dark" ? /* @__PURE__ */ e(Dt, { className: "w-5 h-5" }) : /* @__PURE__ */ e(Ct, { className: "w-5 h-5" })
      }
    ),
    l && /* @__PURE__ */ e(
      "button",
      {
        onClick: r,
        className: "p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted",
        "aria-label": "Close",
        children: /* @__PURE__ */ e(Tt, { className: "w-5 h-5" })
      }
    )
  ] })
] }), Fe = ({ children: r }) => /* @__PURE__ */ e("footer", { className: "p-8 text-center relative z-20", children: r }), Ie = {
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
}, t = (r, i = "EN") => {
  const n = i.toUpperCase();
  return (Ie[n] || Ie.EN)[r] || Ie.EN[r] || r;
}, zt = ({
  onNext: r,
  onExtensionSuccess: i,
  onError: n,
  language: l = "EN",
  platform: g = "desktop"
}) => {
  const [f, m] = y(!1), [o, s] = y(null), [c, d] = y("");
  W(() => {
    p();
  }, []), W(() => {
    const h = (v) => {
      m(!1), v.detail && v.detail.wallet && (i == null || i(v.detail));
    };
    return window.addEventListener("casperid-login", h), () => {
      window.removeEventListener("casperid-login", h);
    };
  }, [i]);
  const p = $(() => {
    const h = document.getElementById("casperid-draggable-anchor");
    let v = null;
    try {
      v = localStorage.getItem("casperid_user");
    } catch {
    }
    return h || v ? (s(!0), !0) : (setTimeout(() => {
      const _ = document.getElementById("casperid-draggable-anchor");
      s(!!_);
    }, 500), !1);
  }, []), x = (h) => typeof h == "object" && h !== null && "wallet" in h && typeof h.wallet == "string" && h.wallet.length > 0, j = async () => {
    m(!0), d("");
    try {
      const v = localStorage.getItem("casperid_user");
      if (v) {
        const _ = JSON.parse(v);
        if (x(_)) {
          m(!1), i == null || i(_);
          return;
        }
      }
    } catch {
    }
    const h = document.getElementById("casperid-draggable-anchor");
    h ? (h.click(), setTimeout(() => {
      m(!1);
      try {
        localStorage.getItem("casperid_user") || d(t("extension_connect_msg", l));
      } catch {
        d(t("extension_connect_msg", l));
      }
    }, 3e3)) : (m(!1), d(t("extension_not_detected", l)), n == null || n("Extension not installed"));
  }, E = () => {
    d(""), r("otp");
  };
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 px-8 flex flex-col justify-center gap-8",
      children: [
        /* @__PURE__ */ a("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ a("div", { className: "relative w-24 h-24 mx-auto mb-6", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-brand-20 blur-2xl rounded-full" }),
            /* @__PURE__ */ e("div", { className: "relative w-full h-full glass-container flex items-center justify-center rounded-2xl border border-brand-30", children: /* @__PURE__ */ e(be, { className: "w-10 h-10 text-brand" }) })
          ] }),
          /* @__PURE__ */ e("h1", { className: "text-2xl font-extrabold leading-tight tracking-tight text-main", children: t("welcome_back", l) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: t("auth_subtitle", l) })
        ] }),
        c && /* @__PURE__ */ a("div", { className: "flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl", children: [
          /* @__PURE__ */ e(le, { className: "w-5 h-5 text-red-500 shrink-0 mt-0.5" }),
          /* @__PURE__ */ e("p", { className: "text-red-600 dark:text-red-400 text-sm font-medium", children: c })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          g === "desktop" && /* @__PURE__ */ a(
            "button",
            {
              onClick: j,
              disabled: f,
              className: "w-full group relative overflow-hidden flex items-center gap-4 bg-brand hover:bg-brand-90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-brand",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-white/20 p-2 rounded-lg", children: f ? /* @__PURE__ */ e(Z, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ e(St, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ a("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t(f ? "connecting" : "sign_in_with_extension", l) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-white/70", children: t(o === !0 ? "extension_detected" : "secure_wallet", l) })
                ] }),
                /* @__PURE__ */ e(Ae, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          ),
          /* @__PURE__ */ a(
            "button",
            {
              onClick: E,
              disabled: f,
              className: "w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-brand-10 p-2 rounded-lg", children: /* @__PURE__ */ e(Te, { className: "w-5 h-5 text-brand" }) }),
                /* @__PURE__ */ a("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t("sign_in_with_otp", l) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: t("two_factor_auth", l) })
                ] }),
                /* @__PURE__ */ e(Ae, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ a("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(ye, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("fully_audited", l) })
          ] }),
          /* @__PURE__ */ a("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(we, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("non_custodial", l) })
          ] })
        ] })
      ]
    }
  );
}, jt = ({
  onNext: r,
  onPasskeyUser: i,
  onError: n,
  apiBaseUrl: l = "https://apis.casperid.com",
  apiKey: g = "",
  previewMode: f = !1,
  language: m = "EN"
}) => {
  const [o, s] = y(""), [c, d] = y(!1), [p, x] = y(""), j = async () => {
    if (!o.trim()) {
      x(t("error_email_required", m));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o)) {
      x(t("error_invalid_email", m));
      return;
    }
    if (d(!0), x(""), f) {
      setTimeout(() => {
        d(!1), r(o.trim().toLowerCase(), "mock-v-id-123456789");
      }, 1e3);
      return;
    }
    try {
      const v = await fetch(`${l}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...g ? { "X-App-Id": g } : {}
        },
        body: JSON.stringify({ email: o.trim().toLowerCase() })
      });
      if (!v.ok) {
        const S = await v.json().catch(() => ({}));
        throw new Error(S.error || `Request failed with status ${v.status}`);
      }
      const _ = await v.json();
      if (_.success) {
        if (_.userExists && _.hasPasskey) {
          i ? i(o.trim().toLowerCase()) : x(t("error_passkey_registered", m)), d(!1);
          return;
        }
        _.verificationId ? r(o.trim().toLowerCase(), _.verificationId) : x(t("error_send_code_failed", m));
      } else
        x(_.error || t("error_send_code_failed", m)), n == null || n(_.error || t("error_send_code_failed", m));
    } catch {
      const _ = t("error_connection_failed", m);
      x(_), n == null || n(_);
    } finally {
      d(!1);
    }
  }, E = (h) => {
    h.key === "Enter" && !c && j();
  };
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ a("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("welcome_back", m) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("enter_email", m) })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-6", children: [
          /* @__PURE__ */ a("div", { className: "space-y-2", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1", children: t("email_address", m) }),
            /* @__PURE__ */ a("div", { className: "relative", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  className: `w-full dark:bg-black/20 bg-slate-100/50 border ${p ? "border-red-400 dark:border-red-500" : "dark:border-white/10 border-slate-200"} rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-30 transition-all font-medium`,
                  placeholder: "name@example.com",
                  type: "email",
                  value: o,
                  onChange: (h) => {
                    s(h.target.value), p && x("");
                  },
                  onKeyDown: E,
                  disabled: c,
                  autoComplete: "email",
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ e("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400", children: /* @__PURE__ */ e(Nt, { className: "w-5 h-5" }) })
            ] }),
            p && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium ml-1 mt-1", children: p })
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: j,
              disabled: c,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
              children: c ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(Z, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("sending_code", m) })
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e("span", { children: t("continue", m) }),
                /* @__PURE__ */ e(De, { className: "w-5 h-5" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "mt-auto pb-8", children: [
          /* @__PURE__ */ e("div", { className: "p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl mb-6", children: /* @__PURE__ */ a("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ e(Re, { className: "text-[#6DE8EC] w-5 h-5 mt-0.5 shrink-0" }),
            /* @__PURE__ */ e("p", { className: "text-[11px] text-muted leading-normal font-medium", children: t("security_notice", m) })
          ] }) }),
          /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 opacity-50", children: [
            /* @__PURE__ */ e(Pe, { className: "text-muted w-3 h-3" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("e2e_encrypted", m) })
          ] })
        ] })
      ]
    }
  );
};
function ne(r) {
  const i = new Uint8Array(r);
  let n = "";
  for (let l = 0; l < i.byteLength; l++)
    n += String.fromCharCode(i[l]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function fe(r) {
  const i = "=".repeat((4 - r.length % 4) % 4), n = r.replace(/-/g, "+").replace(/_/g, "/") + i, l = atob(n), g = new Uint8Array(l.length);
  for (let f = 0; f < l.length; f++)
    g[f] = l.charCodeAt(f);
  return g.buffer;
}
function xe() {
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential == "function");
}
async function Xe() {
  if (!xe()) return !1;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return !1;
  }
}
function Mt() {
  const r = navigator.userAgent.toLowerCase();
  return /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(r) ? "mobile" : /ipad|android(?!.*mobile)|tablet/i.test(r) ? "tablet" : "desktop";
}
function Ot() {
  return {
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent,
    deviceType: Mt()
  };
}
function Vt(r) {
  var i;
  return {
    ...r,
    challenge: fe(r.challenge),
    user: {
      ...r.user,
      id: fe(r.user.id)
    },
    excludeCredentials: (i = r.excludeCredentials) == null ? void 0 : i.map((n) => ({
      ...n,
      id: fe(n.id)
    }))
  };
}
function Lt(r) {
  var i;
  return {
    ...r,
    challenge: fe(r.challenge),
    allowCredentials: (i = r.allowCredentials) == null ? void 0 : i.map((n) => ({
      ...n,
      id: fe(n.id)
    }))
  };
}
function qt(r) {
  const i = r.response;
  return {
    id: r.id,
    rawId: ne(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: ne(i.clientDataJSON),
      attestationObject: ne(i.attestationObject)
    },
    clientExtensionResults: r.getClientExtensionResults(),
    deviceInfo: Ot()
  };
}
function Ut(r) {
  const i = r.response;
  return {
    id: r.id,
    rawId: ne(r.rawId),
    type: r.type,
    response: {
      clientDataJSON: ne(i.clientDataJSON),
      authenticatorData: ne(i.authenticatorData),
      signature: ne(i.signature),
      userHandle: i.userHandle ? ne(i.userHandle) : null
    },
    clientExtensionResults: r.getClientExtensionResults()
  };
}
async function $t(r) {
  if (!xe())
    throw new Error("WebAuthn is not supported in this browser");
  const i = Vt(r), n = await navigator.credentials.create({
    publicKey: i
  });
  if (!n)
    throw new Error("Passkey creation was cancelled or failed");
  return qt(n);
}
async function Ft(r) {
  if (!xe())
    throw new Error("WebAuthn is not supported in this browser");
  const i = Lt(r), n = await navigator.credentials.get({
    publicKey: i
  });
  if (!n)
    throw new Error("Passkey authentication was cancelled or failed");
  return Ut(n);
}
const Bt = ({
  email: r,
  onSuccess: i,
  onError: n,
  onFallbackToOTP: l,
  apiBaseUrl: g = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: m = !1,
  language: o = "EN"
}) => {
  const [s, c] = y(!1), [d, p] = y(""), [x, j] = y(!0), [E, h] = y(!1);
  W(() => {
    (async () => {
      const S = xe(), M = await Xe();
      j(S && M), (!S || !M) && p(t("webauthn_not_supported", o));
    })();
  }, [o]), W(() => {
    if (x && !E && !m) {
      h(!0);
      const _ = setTimeout(() => {
        v();
      }, 500);
      return () => clearTimeout(_);
    }
  }, [x, E, m]);
  const v = async () => {
    if (!s) {
      if (c(!0), p(""), m) {
        setTimeout(() => {
          c(!1), i("mock-session-token", {
            user_id: "mock-user-id",
            email: r,
            tier: "layer_1"
          });
        }, 1500);
        return;
      }
      try {
        const _ = await fetch(`${g}/api/passkey/auth/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!_.ok) {
          const O = await _.json().catch(() => ({}));
          throw new Error(O.error || "Failed to initialize authentication");
        }
        const S = await _.json();
        if (!S.success || !S.options)
          throw new Error(S.error || "Invalid authentication options");
        const M = await Ft(S.options), N = await fetch(`${g}/api/passkey/auth/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            email: r,
            challengeId: S.challengeId,
            credential: M
          })
        });
        if (!N.ok) {
          const O = await N.json().catch(() => ({}));
          throw new Error(O.error || "Authentication failed");
        }
        const C = await N.json();
        if (C.success && C.session_token)
          i(C.session_token, C.user, C.business_token);
        else
          throw new Error(C.error || "Authentication failed");
      } catch (_) {
        const S = _ instanceof Error ? _.message : "Authentication failed";
        S.includes("cancelled") || S.includes("NotAllowedError") ? p(t("passkey_cancelled", o)) : (p(S), n == null || n(S));
      } finally {
        c(!1);
      }
    }
  };
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ a("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("welcome_back", o) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("passkey_auth_subtitle", o) })
        ] }),
        /* @__PURE__ */ a("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: t("signing_in_as", o) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex-1 flex flex-col items-center justify-center py-8", children: [
          /* @__PURE__ */ e(
            L.div,
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
              children: s ? /* @__PURE__ */ e(Z, { className: "w-10 h-10 text-brand animate-spin" }) : d ? /* @__PURE__ */ e(le, { className: "w-10 h-10 text-red-400" }) : /* @__PURE__ */ e(be, { className: "w-10 h-10 text-brand" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center mb-2", children: t(s ? "authenticating" : d ? "authentication_failed" : "use_passkey", o) }),
          d && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mb-4 max-w-xs", children: d }),
          !s && /* @__PURE__ */ e("p", { className: "text-muted text-sm text-center max-w-xs", children: t("passkey_auth_hint", o) })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-3 pb-8", children: [
          !s && /* @__PURE__ */ e(
            "button",
            {
              onClick: v,
              disabled: !x,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(we, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("try_again", o) })
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(be, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("authenticate", o) })
              ] })
            }
          ),
          l && /* @__PURE__ */ e(
            "button",
            {
              onClick: l,
              disabled: s,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
              children: t("use_email_instead", o)
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(ye, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("biometric_secured", o) })
        ] })
      ]
    }
  );
}, Ht = ({
  email: r,
  sessionToken: i,
  onSuccess: n,
  onError: l,
  onSkip: g,
  apiBaseUrl: f = "https://apis.casperid.com",
  apiKey: m = "",
  previewMode: o = !1,
  language: s = "EN"
}) => {
  const [c, d] = y(!1), [p, x] = y(""), [j, E] = y(!0), [h, v] = y(!1);
  W(() => {
    (async () => {
      const N = xe(), C = await Xe();
      E(N && C), (!N || !C) && x(t("webauthn_not_supported", s));
    })();
  }, [s]);
  const _ = async () => {
    if (!c) {
      if (d(!0), x(""), o) {
        setTimeout(() => {
          d(!1), v(!0), setTimeout(() => {
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
        const M = await fetch(`${f}/api/passkey/register/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${i}`,
            ...m ? { "X-App-Id": m } : {}
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!M.ok) {
          const P = await M.json().catch(() => ({}));
          throw new Error(P.error || "Failed to initialize registration");
        }
        const N = await M.json();
        if (!N.success || !N.options)
          throw new Error(N.error || "Invalid registration options");
        const C = await $t(N.options), O = await fetch(`${f}/api/passkey/register/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${i}`,
            ...m ? { "X-App-Id": m } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            userId: N.userId,
            credential: C,
            deviceInfo: {
              userAgent: navigator.userAgent
            }
          })
        });
        if (!O.ok) {
          const P = await O.json().catch(() => ({}));
          throw new Error(P.error || "Registration failed");
        }
        const R = await O.json();
        if (R.success)
          v(!0), setTimeout(() => {
            n(R.user, R.business_token);
          }, 1e3);
        else
          throw new Error(R.error || "Registration failed");
      } catch (M) {
        const N = M instanceof Error ? M.message : "Registration failed";
        N.includes("cancelled") || N.includes("NotAllowedError") ? x(t("passkey_cancelled", s)) : (x(N), l == null || l(N));
      } finally {
        d(!1);
      }
    }
  }, S = [
    { icon: kt, text: t("passkey_benefit_1", s) },
    { icon: ye, text: t("passkey_benefit_2", s) },
    { icon: Te, text: t("passkey_benefit_3", s) }
  ];
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ a("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("create_passkey", s) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("passkey_register_subtitle", s) })
        ] }),
        /* @__PURE__ */ a("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: t("signing_in_as", s) }),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold", children: r })
        ] }),
        /* @__PURE__ */ a("div", { className: "mb-8", children: [
          /* @__PURE__ */ e("p", { className: "text-sm font-semibold text-main mb-4", children: t("passkey_benefits_title", s) }),
          /* @__PURE__ */ e("div", { className: "space-y-3", children: S.map((M, N) => /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("div", { className: "w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center", children: /* @__PURE__ */ e(M.icon, { className: "w-5 h-5 text-brand" }) }),
            /* @__PURE__ */ e("span", { className: "text-sm text-muted", children: M.text })
          ] }, N)) })
        ] }),
        (c || h || p) && /* @__PURE__ */ a("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
          /* @__PURE__ */ e(
            L.div,
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
              className: `w-20 h-20 rounded-full flex items-center justify-center mb-4 ${h ? "bg-green-500/20 border-2 border-green-400" : c ? "bg-brand/20 border-2 border-brand" : "bg-red-500/10 border-2 border-red-400"}`,
              children: h ? /* @__PURE__ */ e(_e, { className: "w-10 h-10 text-green-400" }) : c ? /* @__PURE__ */ e(Z, { className: "w-10 h-10 text-brand animate-spin" }) : /* @__PURE__ */ e(le, { className: "w-10 h-10 text-red-400" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center", children: t(h ? "passkey_created" : c ? "creating_passkey" : "passkey_create_failed", s) }),
          p && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mt-2 max-w-xs", children: p })
        ] }),
        /* @__PURE__ */ a("div", { className: "mt-auto space-y-3 pb-8", children: [
          !h && /* @__PURE__ */ e(
            "button",
            {
              onClick: _,
              disabled: !j || c,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: c ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(Z, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("creating_passkey", s) })
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(be, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("register_passkey", s) })
              ] })
            }
          ),
          g && !c && !h && /* @__PURE__ */ e(
            "button",
            {
              onClick: g,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center transition-colors",
              children: t("do_this_later", s)
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(Pe, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("e2e_encrypted", s) })
        ] })
      ]
    }
  );
}, Wt = ({
  email: r,
  verificationId: i,
  onNext: n,
  onError: l,
  apiBaseUrl: g = "https://apis.casperid.com",
  apiKey: f,
  previewMode: m = !1,
  language: o = "EN"
}) => {
  const [s, c] = y(["", "", "", "", "", ""]), [d, p] = y(!1), [x, j] = y(!1), [E, h] = y(""), [v, _] = y(0), [S, M] = y(i);
  W(() => {
    if (v > 0) {
      const k = setTimeout(() => _(v - 1), 1e3);
      return () => clearTimeout(k);
    }
  }, [v]), W(() => {
    s.every((k) => k !== "") && !d && O();
  }, [s]);
  const N = $((k) => {
    h(""), c((I) => {
      const w = [...I], V = w.findIndex((q) => q === "");
      return V !== -1 && (w[V] = k), w;
    });
  }, []), C = $(() => {
    h(""), c((k) => {
      const I = [...k];
      for (let w = I.length - 1; w >= 0; w--)
        if (I[w] !== "") {
          I[w] = "";
          break;
        }
      return I;
    });
  }, []);
  W(() => {
    const k = (I) => {
      d || (/^[0-9]$/.test(I.key) ? (I.preventDefault(), N(I.key)) : (I.key === "Backspace" || I.key === "Delete") && (I.preventDefault(), C()));
    };
    return window.addEventListener("keydown", k), () => window.removeEventListener("keydown", k);
  }, [d, N, C]);
  const O = async () => {
    const k = s.join("");
    if (k.length !== 6) {
      h(t("error_pin_incomplete", o));
      return;
    }
    if (p(!0), h(""), m) {
      setTimeout(() => {
        p(!1), n("mock-session-token", null);
      }, 1e3);
      return;
    }
    try {
      const I = await fetch(`${g}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": f || ""
        },
        body: JSON.stringify({
          verificationId: S,
          otp: k
        })
      });
      if (!I.ok) {
        const V = await I.json().catch(() => ({}));
        throw new Error(V.error || `Verification failed with status ${I.status}`);
      }
      const w = await I.json();
      w.success && w.sessionToken ? n(w.sessionToken, w.userAccount, w.business_token) : (h(w.error || t("invalid_code", o)), w.attemptsLeft !== void 0 && h(t("invalid_code_attempts", o).replace("{attempts}", w.attemptsLeft.toString())), c(["", "", "", "", "", ""]), l == null || l(w.error || t("verification_failed", o)));
    } catch {
      const w = t("error_verify_failed", o);
      h(w), c(["", "", "", "", "", ""]), l == null || l(w);
    } finally {
      p(!1);
    }
  }, R = async () => {
    if (!(v > 0 || x)) {
      if (j(!0), h(""), m) {
        setTimeout(() => {
          j(!1), _(60), c(["", "", "", "", "", ""]);
        }, 800);
        return;
      }
      try {
        const k = await fetch(`${g}/api/auth/resend-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ verificationId: S })
        });
        if (!k.ok) {
          const w = await k.json().catch(() => ({}));
          throw new Error(w.error || `Request failed with status ${k.status}`);
        }
        const I = await k.json();
        I.success ? (_(60), c(["", "", "", "", "", ""])) : h(I.error || t("error_resend_failed", o));
      } catch {
        h(t("error_resend_failed", o));
      } finally {
        j(!1);
      }
    }
  }, P = r.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ a("div", { className: "space-y-2 mb-8", children: [
          /* @__PURE__ */ e("h1", { className: "text-3xl font-bold tracking-tight text-main", children: t("verify_email", o) }),
          /* @__PURE__ */ a("p", { className: "text-muted text-sm font-medium", children: [
            t("enter_code", o),
            " ",
            /* @__PURE__ */ e("span", { className: "text-main font-semibold", children: P })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex justify-between gap-2 mb-6", children: s.map((k, I) => /* @__PURE__ */ a(
          "div",
          {
            className: `size-12 rounded-2xl dark:bg-black/20 bg-slate-100/50 flex items-center justify-center text-xl font-bold border transition-all ${k ? "text-brand dark:border-brand-30 border-brand-50" : "text-muted dark:border-white/10 border-slate-200"} ${E ? "border-red-400 dark:border-red-500" : ""}`,
            children: [
              k,
              !k && s.findIndex((w) => w === "") === I && /* @__PURE__ */ e("div", { className: "w-0.5 h-6 bg-brand animate-pulse" })
            ]
          },
          I
        )) }),
        E && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium text-center mb-4", children: E }),
        /* @__PURE__ */ a("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => N(k.toString()),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: k
            },
            k
          )),
          /* @__PURE__ */ e("div", { className: "h-14" }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => N("0"),
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50",
              children: "0"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: C,
              disabled: d,
              className: "h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main disabled:opacity-50",
              children: /* @__PURE__ */ e(vt, { className: "w-6 h-6" })
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "mt-auto pb-8 space-y-4", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: O,
              disabled: d || s.some((k) => k === ""),
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(Z, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("verifying", o) })
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e("span", { children: t("verify", o) }),
                /* @__PURE__ */ e(De, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
              ] })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: R,
              disabled: v > 0 || x,
              className: "w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-2xl transition-all border dark:border-white/10 border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
              children: x ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(Z, { className: "w-4 h-4 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("sending", o) })
              ] }) : v > 0 ? /* @__PURE__ */ a("span", { children: [
                t("resend_code", o),
                " (",
                v,
                "s)"
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e(we, { className: "w-4 h-4" }),
                /* @__PURE__ */ e("span", { children: t("resend_code", o) })
              ] })
            }
          )
        ] })
      ]
    }
  );
}, Gt = ({ onNext: r, onSkip: i, language: n = "EN" }) => /* @__PURE__ */ a(
  L.div,
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    className: "flex-1 flex flex-col",
    children: [
      /* @__PURE__ */ a("div", { className: "p-6 pb-2", children: [
        /* @__PURE__ */ a("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ e("span", { className: "text-xs font-semibold uppercase tracking-widest text-brand/80", children: t("verification_step", n) }),
          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-muted", children: t("kyc_required", n) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-full bg-brand/10 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
          "div",
          {
            className: "bg-brand h-full rounded-full",
            style: { width: "40%" }
          }
        ) })
      ] }),
      /* @__PURE__ */ a("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center gap-8", children: [
        /* @__PURE__ */ a("div", { className: "relative group", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" }),
          /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-full bg-gradient-to-tr from-brand-20 to-brand-5 flex items-center justify-center border border-brand-30 shadow-inner", children: /* @__PURE__ */ e(Re, { className: "w-16 h-16 text-brand" }) }),
          /* @__PURE__ */ e("div", { className: "absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-brand flex items-center justify-center", children: /* @__PURE__ */ e(we, { className: "w-4 h-4 text-brand" }) })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main leading-tight", children: t("security_upgrade_required", n) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed font-medium", children: t("security_upgrade_desc", n) })
        ] }),
        /* @__PURE__ */ a("div", { className: "flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-brand/10 rounded-xl text-[10px] font-bold text-brand uppercase tracking-tighter border border-brand-10", children: t("biometric_secure", n) }),
          /* @__PURE__ */ e("span", { className: "px-3 py-1 bg-cyan-400/10 rounded-xl text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10", children: t("zero_knowledge", n) })
        ] })
      ] }),
      /* @__PURE__ */ a("div", { className: "p-8 space-y-4", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: r,
            className: "w-full bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-brand transition-all active:scale-[0.98]",
            children: t("start_upgrade", n)
          }
        ),
        i && /* @__PURE__ */ e(
          "button",
          {
            onClick: i,
            className: "w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors",
            children: t("do_this_later", n)
          }
        )
      ] })
    ]
  }
), ue = [
  "position_face",
  "blink_slowly",
  "turn_head_left",
  "turn_head_right",
  "processing"
], Yt = ({
  requestId: r,
  onNext: i,
  onError: n,
  apiBaseUrl: l = "https://apis.casperid.com",
  apiKey: g = "",
  previewMode: f = !1,
  language: m = "EN"
}) => {
  const o = se(null), s = se(null), c = se(null), d = se([]), [p, x] = y(0), [j, E] = y(!1), [h, v] = y(""), [_, S] = y(!1), [M, N] = y(!1);
  W(() => ((async () => {
    try {
      const P = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      c.current = P, o.current && (o.current.srcObject = P, o.current.onloadedmetadata = () => {
        E(!0);
      });
    } catch (P) {
      P.name === "NotAllowedError" ? (N(!0), v(t("camera_permission_denied", m))) : v(t("unable_access_camera", m)), n == null || n("Camera access failed");
    }
  })(), () => {
    c.current && c.current.getTracks().forEach((P) => P.stop());
  }), [n]), $(() => {
    if (!o.current || !s.current) return null;
    const R = s.current, P = o.current, k = R.getContext("2d");
    return k ? (R.width = P.videoWidth, R.height = P.videoHeight, k.drawImage(P, 0, 0), new Promise((I) => {
      R.toBlob((w) => I(w), "image/jpeg", 0.8);
    })) : null;
  }, []), W(() => {
    if (!j || _) return;
    const P = setTimeout(async () => {
      const k = await new Promise((I) => {
        if (!o.current || !s.current) {
          I(null);
          return;
        }
        const w = s.current, V = o.current, q = w.getContext("2d");
        if (!q) {
          I(null);
          return;
        }
        w.width = V.videoWidth, w.height = V.videoHeight, q.drawImage(V, 0, 0), w.toBlob((T) => I(T), "image/jpeg", 0.8);
      });
      k && d.current.push(k), p < ue.length - 1 ? x((I) => I + 1) : C();
    }, 2500);
    return () => clearTimeout(P);
  }, [p, j, _]);
  const C = async () => {
    var R;
    if (S(!0), x(4), f) {
      setTimeout(() => {
        S(!1), i(!0);
      }, 2e3);
      return;
    }
    try {
      const P = new FormData();
      P.append("requestId", r), d.current.forEach((w, V) => {
        P.append("imageFrames", w, `frame_${V}.jpg`);
      }), P.append("metadata", JSON.stringify({
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        frameCount: d.current.length,
        instructions: ue.slice(0, -1)
      }));
      const k = await fetch(`${l}/api/v2/verification/liveness`, {
        method: "POST",
        headers: {
          ...g ? { "X-App-Id": g } : {}
        },
        body: P,
        credentials: "include"
      });
      if (!k.ok) {
        const w = await k.json().catch(() => ({}));
        throw new Error(w.error || `Liveness check failed with status ${k.status}`);
      }
      const I = await k.json();
      I.success && ((R = I.liveness) != null && R.passed) ? (c.current && c.current.getTracks().forEach((w) => w.stop()), i(!0)) : (v(I.error || "Liveness check failed. Please try again."), x(0), d.current = [], S(!1));
    } catch {
      v("Verification failed. Please try again."), x(0), d.current = [], S(!1), n == null || n("Liveness submission failed");
    }
  }, O = () => {
    v(""), x(0), d.current = [], S(!1);
  };
  return M ? /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
      children: [
        /* @__PURE__ */ e(le, { className: "w-16 h-16 text-red-500 mb-6" }),
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
  ) : /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative dark:bg-[#050a0a] bg-slate-50 overflow-hidden",
      children: [
        /* @__PURE__ */ e("canvas", { ref: s, className: "hidden" }),
        /* @__PURE__ */ e("div", { className: "absolute inset-0 z-0", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6fe8ec]/30 via-transparent to-transparent" }) }),
        /* @__PURE__ */ e("div", { className: "relative z-40 pt-12 pb-4 flex items-center justify-center", children: /* @__PURE__ */ a("div", { className: "flex items-center gap-2 px-4 py-1.5 dark:bg-black/40 bg-white/40 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5", children: [
          /* @__PURE__ */ e("div", { className: `w-2 h-2 rounded-full ${j ? "bg-[#6fe8ec] shadow-[0_0_8px_#6fe8ec]" : "bg-yellow-500 animate-pulse"}` }),
          /* @__PURE__ */ e("span", { className: "text-[10px] text-muted uppercase tracking-[0.2em] font-bold", children: t(j ? "live_camera" : "initializing", m) })
        ] }) }),
        /* @__PURE__ */ a("div", { className: "relative z-20 flex-1 flex items-center justify-center", children: [
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
          /* @__PURE__ */ a("div", { className: "relative z-30 flex items-center justify-center", children: [
            /* @__PURE__ */ a("div", { className: "w-[200px] h-[290px] flex-shrink-0 rounded-full border-[3px] border-[#6fe8ec] shadow-[0_0_40px_rgba(111,232,236,0.4),inset_0_0_20px_rgba(111,232,236,0.2)] relative overflow-hidden", children: [
              /* @__PURE__ */ e(
                "video",
                {
                  ref: o,
                  autoPlay: !0,
                  playsInline: !0,
                  muted: !0,
                  className: "absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                }
              ),
              /* @__PURE__ */ e(
                L.div,
                {
                  animate: { opacity: [0.4, 1, 0.4] },
                  transition: { duration: 2, repeat: 1 / 0 },
                  className: "absolute inset-0 rounded-full border-[1px] border-white/30"
                }
              ),
              /* @__PURE__ */ e(
                L.div,
                {
                  animate: { top: ["-10%", "110%"] },
                  transition: { duration: 3, repeat: 1 / 0, ease: "easeInOut" },
                  className: "absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6fe8ec] to-transparent shadow-[0_0_20px_#6fe8ec] z-10"
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "absolute w-[280px] h-[380px] pointer-events-none flex items-center justify-center", children: [
              /* @__PURE__ */ e("div", { className: "absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#6fe8ec]/30 rounded-tl-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#6fe8ec]/30 rounded-tr-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#6fe8ec]/30 rounded-bl-2xl" }),
              /* @__PURE__ */ e("div", { className: "absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#6fe8ec]/30 rounded-br-2xl" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ a("footer", { className: "relative z-40 p-8 flex flex-col items-center gap-6", children: [
          h ? /* @__PURE__ */ a("div", { className: "dark:bg-red-900/30 bg-red-50 backdrop-blur-2xl border border-red-500/30 w-full p-6 rounded-[2.5rem] text-center", children: [
            /* @__PURE__ */ e("p", { className: "text-red-500 font-bold text-lg mb-4", children: h }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: O,
                className: "px-6 py-2 bg-red-500 text-white rounded-xl font-bold",
                children: "Try Again"
              }
            )
          ] }) : /* @__PURE__ */ a("div", { className: "dark:bg-[#0a1515]/95 bg-white/90 backdrop-blur-2xl border dark:border-white/10 border-black/5 w-full p-6 rounded-2xl text-center shadow-2xl", children: [
            /* @__PURE__ */ e(Ee, { mode: "wait", children: /* @__PURE__ */ e(
              L.p,
              {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -10 },
                className: "text-[#6fe8ec] font-bold text-2xl tracking-tight mb-2",
                children: _ ? /* @__PURE__ */ a("span", { className: "flex items-center justify-center gap-3", children: [
                  /* @__PURE__ */ e(Z, { className: "w-6 h-6 animate-spin" }),
                  "Verifying..."
                ] }) : t(ue[p], m)
              },
              p
            ) }),
            /* @__PURE__ */ a("div", { className: "flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest", children: [
              /* @__PURE__ */ e(Pe, { className: "w-3 h-3" }),
              t("secure_face_scan_desc", m)
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "flex gap-2 w-full max-w-[140px]", children: [0, 1, 2].map((R) => /* @__PURE__ */ e(
            "div",
            {
              className: `h-1.5 flex-1 rounded-full transition-all duration-700 ${R <= Math.floor(p / (ue.length - 1) * 2) ? "bg-[#6fe8ec] shadow-[0_0_15px_#6fe8ec]" : "dark:bg-slate-800 bg-slate-200"}`
            },
            R
          )) }),
          /* @__PURE__ */ a("div", { className: "px-6 py-2.5 dark:bg-black/60 bg-white/60 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5 flex items-center gap-3", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `w-2 h-2 rounded-full ${_ ? "bg-yellow-400 animate-pulse" : p === ue.length - 1 ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-[#6fe8ec] animate-pulse"}`
              }
            ),
            /* @__PURE__ */ e("span", { className: "text-[10px] dark:text-slate-400 text-slate-600 uppercase tracking-[0.25em] font-black", children: _ ? t("analyzing_liveness", m) : p === ue.length - 1 ? t("calibration_complete", m) : t("awaiting_calibration", m) })
          ] })
        ] })
      ]
    }
  );
}, Jt = [
  { id: "passport", title: "Passport", desc: "All countries supported", Icon: Ke },
  { id: "drivers_license", title: "Driver License", desc: "Government issued card", Icon: Je },
  { id: "national_id", title: "ID Card", desc: "National identity document", Icon: Te }
], Kt = ({ onNext: r, language: i = "EN" }) => /* @__PURE__ */ a(
  L.div,
  {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    className: "flex-1 px-6 pt-4 flex flex-col",
    children: [
      /* @__PURE__ */ e("h3", { className: "text-2xl font-bold mb-2 text-main", children: t("verify_identity", i) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-sm mb-8 leading-relaxed", children: t("choose_document", i) }),
      /* @__PURE__ */ a("div", { className: "space-y-4 overflow-y-auto pr-1 pb-6", children: [
        Jt.map(({ id: n, title: l, desc: g, Icon: f }) => /* @__PURE__ */ a(
          "button",
          {
            onClick: () => r(n),
            className: "w-full group cursor-pointer dark:bg-white/5 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:dark:bg-brand/15 hover:bg-brand/5 hover:dark:border-brand-40 hover:border-brand-30 transition-all transform hover:-translate-y-1",
            children: [
              /* @__PURE__ */ e("div", { className: "w-14 h-14 rounded-xl dark:bg-slate-800/50 bg-white flex items-center justify-center text-brand group-hover:bg-brand/20 transition-colors border dark:border-transparent border-slate-100", children: /* @__PURE__ */ e(f, { className: "w-8 h-8" }) }),
              /* @__PURE__ */ a("div", { className: "flex-1 text-left", children: [
                /* @__PURE__ */ e("h4", { className: "font-bold text-base text-main", children: t(n, i) }),
                /* @__PURE__ */ e("p", { className: "text-xs text-muted font-medium", children: t(`${n}_desc`, i) })
              ] }),
              /* @__PURE__ */ e(Ae, { className: "text-brand w-5 h-5" })
            ]
          },
          n
        )),
        /* @__PURE__ */ a("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-brand-30 border-brand-40", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent" }),
          /* @__PURE__ */ a("div", { className: "text-center z-10", children: [
            /* @__PURE__ */ e(ye, { className: "text-brand/40 w-10 h-10 mx-auto mb-1" }),
            /* @__PURE__ */ e("p", { className: "text-[10px] text-muted uppercase tracking-tighter font-bold", children: "Encrypted E2E" })
          ] })
        ] })
      ] })
    ]
  }
), Zt = (r) => ({
  passport: t("passport", r),
  drivers_license: t("drivers_license", r),
  national_id: t("national_id", r)
}), Xt = ({
  requestId: r,
  documentType: i,
  onNext: n,
  onError: l,
  apiBaseUrl: g = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: m = !1,
  language: o = "EN"
}) => {
  const s = se(null), c = se(null), d = se(null), [p, x] = y(!1), [j, E] = y(null), [h, v] = y(null), [_, S] = y(!1), [M, N] = y(""), [C, O] = y("front"), [R, P] = y(null);
  W(() => ((async () => {
    try {
      const q = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // Use back camera for documents
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      d.current = q, s.current && (s.current.srcObject = q, s.current.onloadedmetadata = () => {
        x(!0);
      });
    } catch {
      try {
        const T = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        d.current = T, s.current && (s.current.srcObject = T, s.current.onloadedmetadata = () => {
          x(!0);
        });
      } catch {
        N(t("unable_access_camera", o)), l == null || l("Camera access failed");
      }
    }
  })(), () => {
    d.current && d.current.getTracks().forEach((q) => q.stop()), h && URL.revokeObjectURL(h);
  }), [l]);
  const k = async () => {
    if (!s.current || !c.current) return;
    const V = c.current, q = s.current, T = V.getContext("2d");
    T && (V.width = q.videoWidth, V.height = q.videoHeight, T.drawImage(q, 0, 0), V.toBlob((J) => {
      J && (E(J), v(URL.createObjectURL(J)));
    }, "image/jpeg", 0.9));
  }, I = () => {
    h && URL.revokeObjectURL(h), E(null), v(null), N("");
  }, w = async () => {
    if (S(!0), m) {
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
    if (!j) {
      S(!1);
      return;
    }
    if (C === "front" && i !== "passport") {
      P(j), E(null), v(null), O("back"), S(!1);
      return;
    }
    S(!0), N("");
    try {
      const V = new FormData();
      V.append("document_type", i), R ? (V.append("front_image", R, "front.jpg"), V.append("back_image", j, "back.jpg")) : V.append("front_image", j, "document.jpg");
      const q = await fetch(`${g}/api/v2/verification/layer3/documents/upload`, {
        method: "POST",
        body: V,
        credentials: "include",
        headers: {
          "X-Request-Id": r,
          ...f ? { "X-App-Id": f } : {}
        }
      });
      if (!q.ok) {
        const J = await q.json().catch(() => ({}));
        throw new Error(J.error || `Document upload failed with status ${q.status}`);
      }
      const T = await q.json();
      T.success && T.extracted_data ? (d.current && d.current.getTracks().forEach((J) => J.stop()), n(T.extracted_data, T.upload_id || "")) : (N(T.error || "Failed to process document. Please try again."), S(!1));
    } catch {
      N("Upload failed. Please try again."), S(!1), l == null || l("Document upload failed");
    }
  };
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col relative",
      children: [
        /* @__PURE__ */ e("canvas", { ref: c, className: "hidden" }),
        /* @__PURE__ */ a("div", { className: "absolute inset-0 z-0", children: [
          /* @__PURE__ */ e("div", { className: "w-full h-full bg-slate-800 flex items-center justify-center", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" }) }),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-[2px]" })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative z-10 p-6 flex flex-col items-center", children: /* @__PURE__ */ e("div", { className: "text-center px-4 py-2 dark:bg-black/40 bg-white/40 backdrop-blur-xl rounded-full border dark:border-white/10 border-black/5", children: /* @__PURE__ */ e("h3", { className: "text-main text-sm font-medium tracking-wide uppercase", children: t("scan_instruction", o).replace("{side}", t(C, o)).replace("{docType}", Zt(o)[i]) }) }) }),
        /* @__PURE__ */ e("div", { className: "relative z-10 flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ a("div", { className: "w-full aspect-[1.58/1] relative", children: [
          h ? /* @__PURE__ */ e(
            "img",
            {
              src: h,
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
          !h && p && /* @__PURE__ */ e(
            L.div,
            {
              animate: { top: ["0%", "100%", "0%"] },
              transition: { duration: 4, repeat: 1 / 0, ease: "linear" },
              className: "absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
            }
          ),
          !p && !h && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl", children: /* @__PURE__ */ e(Z, { className: "w-8 h-8 text-[#6DE8EC] animate-spin" }) })
        ] }) }),
        M && /* @__PURE__ */ a("div", { className: "relative z-10 mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3", children: [
          /* @__PURE__ */ e(le, { className: "w-5 h-5 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-sm font-medium", children: M })
        ] }),
        /* @__PURE__ */ a("div", { className: "relative z-10 p-8 dark:bg-black/60 bg-white/60 backdrop-blur-2xl border-t dark:border-white/10 border-black/5 rounded-t-3xl", children: [
          /* @__PURE__ */ e("p", { className: "text-muted text-xs text-center mb-6 font-medium", children: t(h ? "review_capture" : "align_document", o) }),
          /* @__PURE__ */ e("div", { className: "flex items-center justify-between gap-4", children: h ? /* @__PURE__ */ a(B, { children: [
            /* @__PURE__ */ e(
              "button",
              {
                onClick: I,
                disabled: _,
                className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted disabled:opacity-50",
                children: /* @__PURE__ */ e(Et, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: w,
                disabled: _,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-70",
                children: _ ? /* @__PURE__ */ a(B, { children: [
                  /* @__PURE__ */ e(Z, { className: "w-6 h-6 animate-spin" }),
                  /* @__PURE__ */ e("span", { children: t("processing", o) })
                ] }) : /* @__PURE__ */ e("span", { children: t(C === "front" && i !== "passport" ? "next_back_side" : "confirm", o) })
              }
            ),
            /* @__PURE__ */ e("div", { className: "w-12 h-12" }),
            " "
          ] }) : /* @__PURE__ */ a(B, { children: [
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(wt, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ a(
              "button",
              {
                onClick: k,
                disabled: !p,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-50",
                children: [
                  /* @__PURE__ */ e(xt, { className: "w-6 h-6" }),
                  /* @__PURE__ */ e("span", { children: t("capture", o) })
                ]
              }
            ),
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(gt, { className: "w-6 h-6" }) })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "w-32 h-1.5 bg-slate-600/30 rounded-full mx-auto mt-8" })
        ] })
      ]
    }
  );
}, Qt = ({
  requestId: r,
  documentType: i,
  extractedData: n,
  uploadId: l,
  onNext: g,
  onRetake: f,
  onError: m,
  apiBaseUrl: o = "https://apis.casperid.com",
  apiKey: s = "",
  previewMode: c = !1,
  language: d = "EN"
}) => {
  const [p, x] = y({
    firstName: n.first_name || "",
    lastName: n.last_name || "",
    documentNumber: n.document_number || "",
    dateOfBirth: n.date_of_birth || "",
    nationality: n.nationality || "",
    gender: n.gender || ""
  }), [j, E] = y(!1), [h, v] = y(""), _ = (C, O) => {
    x((R) => ({ ...R, [C]: O }));
  }, S = async () => {
    if (!p.firstName || !p.lastName || !p.documentNumber) {
      v(t("error_required_fields", d));
      return;
    }
    if (E(!0), v(""), c) {
      setTimeout(() => {
        E(!1), g({
          first_name: p.firstName,
          last_name: p.lastName,
          document_number: p.documentNumber,
          date_of_birth: p.dateOfBirth,
          nationality: p.nationality,
          gender: p.gender,
          document_type: i
        });
      }, 1500);
      return;
    }
    try {
      const C = await fetch(`${o}/api/v2/verification/layer3/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...s ? { "X-App-Id": s } : {}
        },
        credentials: "include",
        body: JSON.stringify({
          upload_id: l,
          liveness_verified: !0,
          document_data: {
            first_name: p.firstName,
            last_name: p.lastName,
            document_number: p.documentNumber,
            date_of_birth: p.dateOfBirth,
            nationality: p.nationality,
            gender: p.gender,
            document_type: i
          }
        })
      });
      if (!C.ok) {
        const R = await C.json().catch(() => ({}));
        throw new Error(R.error || `Data submission failed with status ${C.status}`);
      }
      const O = await C.json();
      O.success ? g({
        first_name: p.firstName,
        last_name: p.lastName,
        document_number: p.documentNumber,
        date_of_birth: p.dateOfBirth,
        nationality: p.nationality,
        gender: p.gender,
        document_type: i
      }) : (v(O.error || "Failed to submit data. Please try again."), E(!1));
    } catch {
      v("Failed to submit data. Please try again."), E(!1), m == null || m("Data submission failed");
    }
  }, M = n.confidence || 0, N = Math.round(M * 100);
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      className: "flex-1 overflow-y-auto px-6 pb-6",
      children: [
        /* @__PURE__ */ e("div", { className: "flex gap-1 mb-6", children: [1, 2, 3, 0].map((C, O) => /* @__PURE__ */ e(
          "div",
          {
            className: `h-1 flex-1 rounded-xl ${C ? "bg-brand" : "bg-brand/20"}`
          },
          O
        )) }),
        /* @__PURE__ */ a("div", { className: "mb-6", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold text-main mb-2", children: t("review_data", d) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: t("verify_data_desc", d) })
        ] }),
        M > 0 && /* @__PURE__ */ a("div", { className: "mb-6 p-3 rounded-xl dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ a("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-semibold text-muted", children: t("ocr_confidence", d) }),
            /* @__PURE__ */ a("span", { className: `text-xs font-bold ${N >= 80 ? "text-green-500" : N >= 60 ? "text-yellow-500" : "text-red-500"}`, children: [
              N,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            "div",
            {
              className: `h-full rounded-full transition-all ${N >= 80 ? "bg-green-500" : N >= 60 ? "bg-yellow-500" : "bg-red-500"}`,
              style: { width: `${N}%` }
            }
          ) }),
          N < 80 && /* @__PURE__ */ e("p", { className: "text-[10px] text-yellow-500 mt-2", children: t("verify_data_carefully", d) })
        ] }),
        h && /* @__PURE__ */ a("div", { className: "mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2", children: [
          /* @__PURE__ */ e(le, { className: "w-4 h-4 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-xs font-medium", children: h })
        ] }),
        /* @__PURE__ */ a("div", { className: "space-y-5", children: [
          /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("full_name", d) }),
            /* @__PURE__ */ a("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(Rt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e("div", { className: "flex flex-col w-full", children: /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: `${p.firstName} ${p.lastName}`,
                  onChange: (C) => {
                    const O = C.target.value.split(" ");
                    _("firstName", O[0] || ""), _("lastName", O.slice(1).join(" ") || "");
                  },
                  placeholder: t("enter_first_name", d)
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("id_number", d) }),
            /* @__PURE__ */ a("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(Je, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: p.documentNumber,
                  onChange: (C) => _("documentNumber", C.target.value),
                  placeholder: t("enter_doc_number", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("date_of_birth", d) }),
            /* @__PURE__ */ a("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(yt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: p.dateOfBirth,
                  onChange: (C) => _("dateOfBirth", C.target.value),
                  placeholder: t("date_format", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("nationality", d) }),
            /* @__PURE__ */ a("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(Ke, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300",
                  type: "text",
                  value: p.nationality,
                  onChange: (C) => _("nationality", C.target.value),
                  placeholder: t("enter_nationality", d)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ a("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-brand-20 group", children: [
            /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-gradient-to-tr from-brand-20 to-cyan-500/10 blur-sm" }),
            /* @__PURE__ */ a("div", { className: "absolute inset-0 bg-brand/10 flex flex-col items-center justify-center p-4", children: [
              /* @__PURE__ */ a("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ e(_e, { className: "text-brand w-5 h-5" }),
                /* @__PURE__ */ e("span", { className: "text-xs font-bold dark:text-slate-200 text-slate-700", children: t("scanned_successfully", d) })
              ] }),
              f && /* @__PURE__ */ e(
                "button",
                {
                  onClick: f,
                  className: "mt-2 text-[10px] text-brand underline font-medium",
                  type: "button",
                  children: t("retake_photo", d)
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ a("div", { className: "mt-8", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: S,
              disabled: j,
              className: "w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70",
              children: j ? /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("submitting", d) })
              ] }) : /* @__PURE__ */ a(B, { children: [
                /* @__PURE__ */ e("span", { children: t("confirm_mint", d) }),
                /* @__PURE__ */ e(At, { className: "w-5 h-5" })
              ] })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-center text-[10px] mt-4 text-slate-500", children: t("secured_by_casper", d) })
        ] })
      ]
    }
  );
}, ea = (r, i) => r === "layer_1" ? {
  processing: {
    title: t("generating_wallet", i),
    subtitle: t("wallet_subtitle", i)
  },
  minting: {
    title: t("minting_did", i),
    subtitle: t("did_subtitle", i)
  },
  completed: {
    title: t("identity_created", i),
    subtitle: t("identity_created_subtitle", i)
  },
  failed: {
    title: t("setup_failed", i),
    subtitle: t("setup_failed_subtitle", i)
  }
} : {
  processing: {
    title: t(r === "layer_2" ? "processing_liveness" : "processing_documents", i),
    subtitle: t("processing_subtitle", i)
  },
  minting: {
    title: t("minting_identity", i),
    subtitle: t("minting_subtitle", i)
  },
  completed: {
    title: t("verification_submitted", i),
    subtitle: t("verification_submitted_subtitle", i)
  },
  failed: {
    title: t("verification_failed", i),
    subtitle: t("verification_failed_subtitle", i)
  }
}, ta = ({
  tier: r,
  sessionToken: i,
  requestId: n,
  onNext: l,
  onError: g,
  apiBaseUrl: f = "https://apis.casperid.com",
  apiKey: m = "",
  previewMode: o = !1,
  language: s = "EN"
}) => {
  const [c, d] = y("processing"), [p, x] = y(0), [j, E] = y(""), [h, v] = y(null), [_, S] = y(null), [M, N] = y(null), [C, O] = y(null), R = se(!1), k = ea(r, s)[c];
  W(() => {
    R.current || (R.current = !0, o ? I() : w());
  }, []);
  const I = async () => {
    d("processing"), x(20), await T(1e3), x(50), await T(1e3), d("minting"), x(70), await T(1e3), x(100), d("completed"), r === "layer_1" ? (v("account-hash-abc123..."), O("casper-user-1234"), S("did:casper:abc123...")) : N("mock-credential-hash-xyz"), await T(1500), l({
      wallet: "account-hash-abc123...",
      didAddress: "did:casper:abc123...",
      credentialHash: "mock-credential-hash-xyz"
    });
  }, w = async () => {
    try {
      r === "layer_1" ? await V() : await q();
    } catch (F) {
      const H = F instanceof Error ? F.message : "Setup failed";
      E(H), d("failed"), g == null || g(H);
    }
  }, V = async () => {
    var K;
    d("processing"), x(10);
    const F = await fetch(`${f}/api/passkey/wallet/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${i}`,
        ...m ? { "X-App-Id": m } : {}
      },
      credentials: "include"
    });
    if (!F.ok) {
      const Q = await F.json().catch(() => ({}));
      throw new Error(Q.error || "Failed to generate wallet");
    }
    const H = await F.json();
    if (!H.success || !((K = H.walletInfo) != null && K.walletAddress))
      throw new Error(H.error || "Wallet generation failed");
    v(H.walletInfo.walletAddress), H.walletInfo.humanId && O(H.walletInfo.humanId), x(50), d("minting"), x(60);
    const ce = await fetch(`${f}/api/passkey/did/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${i}`,
        ...m ? { "X-App-Id": m } : {}
      },
      credentials: "include"
    });
    if (!ce.ok) {
      const Q = await ce.json().catch(() => ({}));
      throw new Error(Q.error || "Failed to mint DID");
    }
    const X = await ce.json();
    if (!X.success)
      throw new Error(X.error || "DID minting failed");
    S(X.did_address), N(X.transaction_hash), x(100), d("completed"), await T(1500), l({
      wallet: H.walletInfo.walletAddress,
      didAddress: X.did_address,
      credentialHash: X.transaction_hash
    });
  }, q = async () => {
    d("processing"), x(30), await T(500), x(60), d("minting"), x(80), await T(500), x(100), d("completed"), await T(1500), l({ credentialHash: n });
  }, T = (F) => new Promise((H) => setTimeout(H, F)), J = () => {
    d("processing"), x(0), E(""), R.current = !1, o ? I() : w();
  }, ie = () => r === "layer_1" ? c === "minting" ? /* @__PURE__ */ e(be, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(Pt, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(Ze, { className: "text-brand w-4 h-4" }), me = () => {
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
  return /* @__PURE__ */ a(
    L.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
      children: [
        /* @__PURE__ */ a("div", { className: "relative w-64 h-64 flex items-center justify-center mb-12", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full border-4 border-dashed border-brand-20 animate-[spin_10s_linear_infinite]" }),
          /* @__PURE__ */ e("div", { className: "absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" }),
          /* @__PURE__ */ a(
            L.div,
            {
              animate: c !== "failed" ? { rotateY: [0, 180, 360], y: [-10, 10, -10] } : {},
              transition: { duration: 6, repeat: 1 / 0, ease: "easeInOut" },
              className: `relative w-40 h-56 backdrop-blur-xl border rounded-2xl flex flex-col p-4 ${c === "completed" ? "bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]" : c === "failed" ? "bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]" : "bg-brand/10 border-brand-30 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]"}`,
              children: [
                /* @__PURE__ */ a("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded flex items-center justify-center ${c === "completed" ? "bg-green-500/30" : c === "failed" ? "bg-red-500/30" : "bg-brand/30"}`, children: c === "completed" ? /* @__PURE__ */ e(_e, { className: "text-green-500 w-4 h-4" }) : c === "failed" ? /* @__PURE__ */ e(le, { className: "text-red-500 w-4 h-4" }) : ie() }),
                  /* @__PURE__ */ e("div", { className: `w-6 h-1 rounded-full ${c === "completed" ? "bg-green-500/40" : c === "failed" ? "bg-red-500/40" : "bg-brand/40"}` })
                ] }),
                /* @__PURE__ */ a("div", { className: "space-y-3 mb-auto", children: [
                  /* @__PURE__ */ e("div", { className: `h-2 w-3/4 rounded-full ${c === "completed" ? "bg-green-500/20" : c === "failed" ? "bg-red-500/20" : "bg-brand/20"}` }),
                  /* @__PURE__ */ e("div", { className: `h-2 w-1/2 rounded-full ${c === "completed" ? "bg-green-500/20" : c === "failed" ? "bg-red-500/20" : "bg-brand/20"}` })
                ] }),
                /* @__PURE__ */ a("div", { className: "flex items-center gap-2 mt-4", children: [
                  /* @__PURE__ */ e("div", { className: `size-6 rounded-full overflow-hidden border border-white/10 ${c === "completed" ? "bg-gradient-to-tr from-green-500 to-[#6DE8EC]" : c === "failed" ? "bg-gradient-to-tr from-red-500 to-orange-500" : "bg-gradient-to-tr from-brand to-[#6DE8EC]"}` }),
                  /* @__PURE__ */ a("div", { className: "flex flex-col items-start max-w-[80px]", children: [
                    C ? /* @__PURE__ */ e(
                      L.span,
                      {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        className: "text-[10px] font-bold text-white/90 truncate w-full text-left",
                        children: C
                      }
                    ) : /* @__PURE__ */ e("div", { className: "h-1.5 w-12 bg-white/20 rounded-full mb-1" }),
                    /* @__PURE__ */ e("div", { className: "h-1 w-8 bg-white/10 rounded-full" })
                  ] })
                ] }),
                c !== "failed" && c !== "completed" && /* @__PURE__ */ e(
                  L.div,
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
        /* @__PURE__ */ a("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e("h2", { className: `text-2xl font-bold bg-clip-text ${c === "completed" ? "text-green-500" : c === "failed" ? "text-red-500" : "dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 bg-slate-900 dark:text-transparent text-slate-900"}`, children: k.title }),
          /* @__PURE__ */ e("p", { className: "dark:text-slate-400 text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto", children: k.subtitle })
        ] }),
        c === "failed" && /* @__PURE__ */ a("div", { className: "mt-6 space-y-3", children: [
          /* @__PURE__ */ e("p", { className: "text-red-500 text-sm", children: j }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: J,
              className: "px-6 py-3 bg-brand text-white rounded-2xl font-bold",
              children: t("try_again", s)
            }
          )
        ] }),
        r === "layer_1" && h && c === "completed" && /* @__PURE__ */ a("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: t("your_wallet", s) }),
          /* @__PURE__ */ a("p", { className: "text-xs font-mono text-main break-all", children: [
            h.slice(0, 20),
            "...",
            h.slice(-10)
          ] })
        ] }),
        r !== "layer_1" && M && c === "completed" && /* @__PURE__ */ a("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: t("verification_id", s) }),
          /* @__PURE__ */ a("p", { className: "text-xs font-mono text-main break-all", children: [
            M.slice(0, 20),
            "..."
          ] })
        ] }),
        c !== "failed" && /* @__PURE__ */ a("div", { className: "w-full mt-12 p-6 dark:bg-brand/5 bg-brand/5 border-t dark:border-white/5 border-black/5", children: [
          /* @__PURE__ */ a("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-medium text-brand uppercase tracking-widest", children: t(r === "layer_1" ? "setup_status" : "transaction_status", s) }),
            /* @__PURE__ */ e("span", { className: `text-xs font-bold ${c === "completed" ? "text-green-500" : "text-[#6DE8EC]"}`, children: t("complete_percent", s).replace("{percent}", p.toString()) })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-brand/10 bg-brand/10 rounded-full overflow-hidden mb-4", children: /* @__PURE__ */ e(
            L.div,
            {
              initial: { width: "0%" },
              animate: { width: `${p}%` },
              transition: { duration: 0.5 },
              className: `h-full rounded-full ${c === "completed" ? "bg-gradient-to-r from-green-500 to-[#6DE8EC]" : "bg-gradient-to-r from-brand to-[#6DE8EC]"} shadow-[0_0_10px_rgba(114,43,238,0.5)]`
            }
          ) }),
          /* @__PURE__ */ a("div", { className: "flex items-center gap-3 px-3 py-2 dark:bg-brand/10 bg-brand/10 rounded-xl border dark:border-brand-10 border-brand-5", children: [
            /* @__PURE__ */ e(It, { className: `w-4 h-4 ${c === "completed" ? "text-green-500" : "text-brand"}` }),
            /* @__PURE__ */ e("p", { className: "text-[10px] dark:text-slate-300 text-slate-600 font-medium", children: me() })
          ] })
        ] })
      ]
    }
  );
}, aa = ({ onNext: r, language: i = "EN" }) => /* @__PURE__ */ a(
  L.div,
  {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
    children: [
      /* @__PURE__ */ a("div", { className: "relative mb-10 group", children: [
        /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-[#6fe8ec]/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all" }),
        /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-2xl bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100", children: /* @__PURE__ */ e(_e, { className: "text-slate-900 w-16 h-16" }) })
      ] }),
      /* @__PURE__ */ e("h1", { className: "text-main text-3xl font-bold leading-tight mb-3", children: t("identity_verified", i) }),
      /* @__PURE__ */ e("p", { className: "text-muted text-base leading-relaxed mb-12", children: t("identity_verified_desc", i) }),
      /* @__PURE__ */ a("div", { className: "w-full dark:bg-white/5 bg-black/5 rounded-2xl p-5 mb-8 flex items-center justify-between text-left", children: [
        /* @__PURE__ */ a("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ e("span", { className: "text-main font-bold text-sm", children: t("share_data_consent", i) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-xs leading-normal", children: t("authorize_dapps", i) })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-11 h-6 bg-brand rounded-full relative p-1 cursor-pointer", children: /* @__PURE__ */ e("div", { className: "absolute right-1 top-1 size-4 bg-white rounded-full" }) })
      ] }),
      /* @__PURE__ */ a(
        "button",
        {
          onClick: r,
          className: "w-full bg-[#6fe8ec] hover:brightness-105 active:scale-[0.98] transition-all text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-[#6fe8ec]/20 flex items-center justify-center gap-2",
          children: [
            t("return_to_app", i),
            /* @__PURE__ */ e(De, { className: "w-5 h-5" })
          ]
        }
      )
    ]
  }
), ia = [
  "perm_identity",
  "perm_profile",
  "perm_kyc"
], ra = ({
  appName: r = "This App",
  appLogo: i,
  onApprove: n,
  onDeny: l,
  language: g = "EN"
}) => /* @__PURE__ */ a(
  L.div,
  {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    className: "flex-1 px-8 pt-8 flex flex-col items-center",
    children: [
      /* @__PURE__ */ a("div", { className: "flex flex-col items-center gap-4 mb-10", children: [
        /* @__PURE__ */ a("div", { className: "relative", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 rounded-full shadow-[0_0_20px_rgba(134,81,225,0.3)] animate-pulse" }),
          /* @__PURE__ */ e("div", { className: "relative w-24 h-24 rounded-full border-2 border-brand-40 p-1 dark:bg-black/50 bg-white", children: i ? /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full overflow-hidden", children: /* @__PURE__ */ e("img", { src: i, alt: r, className: "w-full h-full object-cover" }) }) : /* @__PURE__ */ e("div", { className: "w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl", children: r.slice(0, 2).toUpperCase() }) })
        ] }),
        /* @__PURE__ */ a("div", { className: "text-center", children: [
          /* @__PURE__ */ e("h1", { className: "text-2xl font-bold tracking-tight text-main", children: r }),
          /* @__PURE__ */ e("p", { className: "text-brand/70 text-sm font-medium mt-1 uppercase tracking-wider", children: t("requesting_access", g) })
        ] })
      ] }),
      /* @__PURE__ */ a("div", { className: "w-full space-y-3", children: [
        /* @__PURE__ */ e("h3", { className: "text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1", children: t("permission_request", g) }),
        ia.map((f) => /* @__PURE__ */ a(
          "div",
          {
            className: "flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 transition-all",
            children: [
              /* @__PURE__ */ e("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0", children: /* @__PURE__ */ e(_e, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ e("p", { className: "text-sm font-medium text-main", children: t(f, g) })
            ]
          },
          f
        ))
      ] }),
      /* @__PURE__ */ a("div", { className: "mt-8 flex gap-3 p-4 rounded-2xl dark:bg-brand/5 bg-brand/5", children: [
        /* @__PURE__ */ e(ye, { className: "text-brand w-5 h-5 shrink-0" }),
        /* @__PURE__ */ a("p", { className: "text-xs leading-relaxed text-muted", children: [
          /* @__PURE__ */ a("span", { className: "font-bold text-main", children: [
            t("privacy_note", g),
            ":"
          ] }),
          " ",
          t("privacy_desc", g)
        ] })
      ] }),
      /* @__PURE__ */ a("footer", { className: "mt-auto w-full pb-8 flex flex-col gap-3", children: [
        /* @__PURE__ */ a(
          "button",
          {
            onClick: n,
            className: "w-full py-4 rounded-2xl bg-brand hover:bg-brand-90 text-white font-bold text-base shadow-xl shadow-brand transition-all flex items-center justify-center gap-2",
            children: [
              t("approve_verify", g),
              /* @__PURE__ */ e(Re, { className: "w-5 h-5" })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: l,
            className: "w-full py-3 rounded-2xl bg-transparent dark:hover:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all",
            children: t("deny", g)
          }
        )
      ] })
    ]
  }
);
function Be(r = "light") {
  return r === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : r;
}
const He = ["AuthSelection", "Login", "PasskeyAuth", "PinVerification", "PasskeyRegister"], na = "https://apis.casperid.com", We = {
  requestId: "",
  verificationTier: "layer_3"
}, ua = ({
  isOpen: r,
  apiKey: i,
  theme: n = {},
  requiredTier: l,
  onSuccess: g,
  onClose: f,
  onError: m,
  mode: o = "login",
  previewMode: s = !1,
  initialScreen: c,
  apiBaseUrl: d,
  termsUrl: p = "#",
  privacyUrl: x = "#",
  logoUrl: j,
  language: E = "EN",
  layout: h,
  platform: v
}) => {
  var qe;
  const [_, S] = y({}), [M, N] = y(!s && !!i), {
    primaryColor: C,
    borderRadius: O,
    fontFamily: R,
    mode: P = "light",
    layout: k,
    platform: I
  } = n, w = C || _.primaryColor || "#8651e1", V = O || _.borderRadius || "12", q = R || _.fontFamily || "Inter", T = h || k || _.layout || "auto", J = v || I || "desktop", [ie, me] = y(Be(P)), [F, H] = y(
    c ?? (o === "verify" ? "SecurityUpgrade" : "AuthSelection")
  ), [ce, X] = y({ email: "", verificationId: "" }), [K, Q] = y(null), [re, ee] = y({
    email: "",
    userExists: !1,
    hasPasskey: !1,
    userAccount: null
  }), [te, de] = y(We), [Qe, ke] = y(""), [ca, ze] = y(""), [oe, et] = y(null), Y = d || na, Ne = V.toString().endsWith("px") ? V.toString() : `${V}px`, Ce = q.includes(" ") ? `"${q}", sans-serif` : `${q}, sans-serif`, pe = ht.useId().replace(/:/g, ""), je = {
    "--casperid-primary": w,
    "--casperid-radius": Ne,
    "--casperid-font": Ce
  }, Me = `${pe}-${w}-${Ne}-${Ce}`, Oe = `
        #casperid-modal-${pe},
        #casperid-modal-${pe} * {
            --casperid-primary: ${w} !important;
            --casperid-radius: ${Ne} !important;
            --casperid-font: ${Ce} !important;
        }
    `;
  W(() => {
    if (P === "system") {
      const u = window.matchMedia("(prefers-color-scheme: dark)"), b = (A) => me(A.matches ? "dark" : "light");
      return u.addEventListener("change", b), () => u.removeEventListener("change", b);
    } else
      me(Be(P));
  }, [P]), W(() => {
    s && c && H(c);
  }, [s, c]), W(() => {
    r && !s && (H(c ?? (o === "verify" ? "SecurityUpgrade" : "AuthSelection")), X({ email: "", verificationId: "" }), Q(null), ee({ email: "", userExists: !1, hasPasskey: !1, userAccount: null }), de(We), ke(""), ze(""));
  }, [r, o, s, c]), W(() => {
    if (!i || s) {
      N(!1);
      return;
    }
    (async () => {
      try {
        const b = await fetch(`${Y}/api/business/app-metadata/${i}`);
        if (b.ok) {
          const A = await b.json();
          A.success && A.app && (et(A.app), A.app.theme && S({
            primaryColor: A.app.theme.primaryColor,
            borderRadius: A.app.theme.borderRadius,
            fontFamily: A.app.theme.fontFamily,
            layout: A.app.theme.layout,
            platform: A.app.theme.platform
          }));
        }
      } catch (b) {
        console.warn("[CasperID] Failed to fetch app metadata:", b);
      } finally {
        N(!1);
      }
    })();
  }, [i, Y, s]);
  const Ve = () => me((u) => u === "dark" ? "light" : "dark"), D = $((u) => H(u), []), ge = $(async (u) => {
    try {
      const b = u === "layer_2" ? `${d}/api/v2/verification/layer2/start` : `${d}/api/v2/verification/layer3/start`, A = await fetch(b, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": i
        },
        credentials: "include",
        body: JSON.stringify({
          purpose: "sdk_verification",
          ...u === "layer_3" ? { verificationMethod: "document" } : {}
        })
      });
      if (!A.ok) {
        const G = await A.json().catch(() => ({}));
        throw new Error(G.error || `Request failed with status ${A.status}`);
      }
      const U = await A.json();
      if (U.success && U.verification)
        return de((G) => ({
          ...G,
          requestId: U.verification.requestId,
          verificationTier: u
        })), U.verification.requestId;
      throw new Error(U.error || "Failed to start verification");
    } catch (b) {
      return m == null || m(b instanceof Error ? b : new Error("Failed to start verification")), null;
    }
  }, [d, i, m]), tt = $((u, b, A) => {
    Q(u), ee((U) => ({
      ...U,
      sessionToken: u,
      businessToken: A,
      userAccount: b || null
    })), b != null && b.wallet && (b != null && b.did_address) && re.hasPasskey ? ve(b.tier) : D("PasskeyRegister");
  }, [D, re.hasPasskey]), at = $((u) => {
    ee((b) => ({ ...b, email: u, hasPasskey: !0, userExists: !0 })), D("PasskeyAuth");
  }, [D]), it = $((u, b, A) => {
    Q(u), ee((U) => ({
      ...U,
      sessionToken: u,
      businessToken: A,
      userAccount: b ? {
        user_id: b.user_id,
        wallet: b.wallet,
        tier: b.tier,
        did_address: b.did_address
      } : null
    })), ve(b == null ? void 0 : b.tier);
  }, []), rt = $((u, b) => {
    ee((A) => ({
      ...A,
      hasPasskey: !0,
      businessToken: b,
      userAccount: u ? {
        user_id: u.user_id,
        tier: u.tier
      } : A.userAccount
    })), D("MintingIdentity");
  }, [D]), ve = $((u) => {
    const b = u || "layer_0";
    if (!l) {
      D("IdentityVerified");
      return;
    }
    const A = l === "L1" ? "layer_1" : l === "L2" ? "layer_2" : l === "L3" ? "layer_3" : "layer_1", U = ["layer_0", "layer_1", "layer_2", "layer_3"], G = U.indexOf(b), he = U.indexOf(A);
    G >= he ? D("IdentityVerified") : he >= 2 ? D("SecurityUpgrade") : D("IdentityVerified");
  }, [l, D]), nt = $(async (u) => {
    var A;
    if (u != null && u.wallet && ee((U) => {
      var G;
      return {
        ...U,
        userAccount: {
          ...U.userAccount,
          user_id: ((G = U.userAccount) == null ? void 0 : G.user_id) || "",
          wallet: u.wallet,
          did_address: u.didAddress,
          tier: "layer_1"
        }
      };
    }), u != null && u.credentialHash && ze(u.credentialHash), K && !s)
      try {
        const U = await fetch(`${Y}/api/casperid/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: K, apiKey: i })
        });
        if (U.ok) {
          const G = await U.json();
          G.success && G.token && (console.log("[CasperID SDK] Token refreshed after verification"), Q(G.token), ee((he) => ({
            ...he,
            sessionToken: G.token,
            businessToken: G.business_token || he.businessToken
          })));
        }
      } catch (U) {
        console.warn("[CasperID SDK] Failed to refresh token after verification:", U);
      }
    const b = u != null && u.wallet ? "layer_1" : ((A = re.userAccount) == null ? void 0 : A.tier) || "layer_1";
    ve(b);
  }, [(qe = re.userAccount) == null ? void 0 : qe.tier, ve, K, Y, s]), st = $((u) => {
    const b = (u == null ? void 0 : u.sessionToken) || (u == null ? void 0 : u.token), A = (u == null ? void 0 : u.business_token) || (u == null ? void 0 : u.businessToken);
    b && Q(b), A && ee((U) => ({ ...U, businessToken: A })), D("SecurityUpgrade");
  }, [D]), ct = $(async () => {
    await ge("layer_2") && D("FaceScan");
  }, [ge, D]), dt = $(async (u) => {
    de((b) => ({ ...b, livenessVerified: u })), l === "L3" ? await ge("layer_3") && D("VerifyIdentityChoice") : D("MintingIdentity");
  }, [l, ge, D]), lt = $((u) => {
    de((b) => ({ ...b, documentType: u })), D("DocumentScan");
  }, [D]), ot = $((u, b) => {
    de((A) => ({ ...A, extractedData: u })), ke(b), D("ReviewData");
  }, [D]), ut = $((u) => {
    de((b) => ({ ...b, extractedData: u })), D("MintingIdentity");
  }, [D]);
  $(() => {
    de((u) => ({ ...u, extractedData: void 0 })), ke(""), D("DocumentScan");
  }, [D]);
  const mt = $(() => {
    if (!K) {
      m == null || m(new Error("No valid session token available"));
      return;
    }
    g == null || g(K, {
      businessToken: re.businessToken
    }), f == null || f();
  }, [K, re.businessToken, g, f, m]), ae = $((u) => {
    m == null || m(new Error(u));
  }, [m]), pt = $((u, b) => {
    X({ email: u, verificationId: b }), ee((A) => ({ ...A, email: u })), D("PinVerification");
  }, [D]);
  if (!r && !s) return null;
  if (M && !s)
    return /* @__PURE__ */ e(
      "div",
      {
        className: "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        style: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" },
        children: /* @__PURE__ */ e("div", { className: "w-12 h-12 border-3 border-white/20 border-t-white/80 rounded-full animate-spin" })
      }
    );
  const Le = () => {
    switch (F) {
      case "AuthSelection":
        return /* @__PURE__ */ e(
          zt,
          {
            onNext: (b) => D(b === "otp" ? "Login" : "SecurityUpgrade"),
            onExtensionSuccess: st,
            onError: ae,
            language: E,
            platform: J
          }
        );
      case "Login":
        return /* @__PURE__ */ e(
          jt,
          {
            onNext: pt,
            onPasskeyUser: at,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "PasskeyAuth":
        return /* @__PURE__ */ e(
          Bt,
          {
            email: re.email,
            onSuccess: it,
            onError: ae,
            onFallbackToOTP: () => D("Login"),
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "PasskeyRegister":
        return /* @__PURE__ */ e(
          Ht,
          {
            email: re.email || ce.email,
            sessionToken: K || "",
            onSuccess: rt,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "PinVerification":
        return /* @__PURE__ */ e(
          Wt,
          {
            email: ce.email,
            verificationId: ce.verificationId,
            onNext: tt,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "SecurityUpgrade":
        return /* @__PURE__ */ e(
          Gt,
          {
            onNext: ct,
            onSkip: () => D("IdentityVerified"),
            language: E
          }
        );
      case "FaceScan":
        return /* @__PURE__ */ e(
          Yt,
          {
            requestId: te.requestId,
            onNext: dt,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "VerifyIdentityChoice":
        return /* @__PURE__ */ e(
          Kt,
          {
            onNext: lt,
            language: E
          }
        );
      case "DocumentScan":
        return /* @__PURE__ */ e(
          Xt,
          {
            requestId: te.requestId,
            documentType: te.documentType,
            onNext: ot,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "ReviewData":
        return /* @__PURE__ */ e(
          Qt,
          {
            requestId: te.requestId,
            documentType: te.documentType,
            extractedData: te.extractedData,
            uploadId: Qe,
            onNext: ut,
            onRetake: () => D("DocumentScan"),
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "MintingIdentity":
        const u = te.requestId ? te.verificationTier : "layer_1";
        return /* @__PURE__ */ e(
          ta,
          {
            tier: u,
            sessionToken: K || "",
            requestId: te.requestId,
            onNext: nt,
            onError: ae,
            apiBaseUrl: Y,
            apiKey: i,
            previewMode: s,
            language: E
          }
        );
      case "IdentityVerified":
        return /* @__PURE__ */ e(aa, { onNext: () => D("PermissionsRequest"), language: E });
      case "PermissionsRequest":
        return /* @__PURE__ */ e(
          ra,
          {
            onApprove: mt,
            onDeny: () => f == null ? void 0 : f(),
            language: E,
            appName: oe == null ? void 0 : oe.name,
            appLogo: j || (oe == null ? void 0 : oe.logo_url)
          }
        );
      default:
        return null;
    }
  };
  return s ? /* @__PURE__ */ a(B, { children: [
    /* @__PURE__ */ e("style", { children: Oe }, Me),
    /* @__PURE__ */ e("div", { id: `casperid-modal-${pe}`, style: je, className: `relative ${ie}`, children: /* @__PURE__ */ a(Ue, { className: "backdrop-blur-3xl", theme: ie, children: [
      /* @__PURE__ */ e(
        $e,
        {
          onClose: f,
          showClose: F !== "AuthSelection",
          subtitle: F === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
          theme: ie,
          toggleTheme: Ve
        }
      ),
      /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Ee, { mode: "wait", children: /* @__PURE__ */ e(L.div, { className: "flex-1 flex flex-col", children: Le() }, F) }) }),
      He.includes(F) && /* @__PURE__ */ e(Fe, { children: /* @__PURE__ */ a("p", { className: "text-[11px] text-slate-500 font-medium", children: [
        "By connecting, you agree to our",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: p, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
        " ",
        "&",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: x, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
      ] }) })
    ] }) })
  ] }) : /* @__PURE__ */ a(B, { children: [
    /* @__PURE__ */ e("style", { children: Oe }, Me),
    /* @__PURE__ */ a(
      "div",
      {
        className: `fixed inset-0 z-[9999] flex items-center justify-center ${T === "fullscreen" ? "p-0" : "p-4"}`,
        style: { backgroundColor: T === "fullscreen" ? "transparent" : "rgba(0,0,0,0.6)", backdropFilter: T === "fullscreen" ? "none" : "blur(6px)" },
        onClick: (u) => u.target === u.currentTarget && (f == null ? void 0 : f()),
        children: [
          T !== "fullscreen" && /* @__PURE__ */ a("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: "absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]",
                style: { backgroundColor: `${w}1a` }
              }
            ),
            /* @__PURE__ */ e("div", { className: "absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" })
          ] }),
          /* @__PURE__ */ e(
            L.div,
            {
              id: `casperid-modal-${pe}`,
              initial: T === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: T === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              style: je,
              className: `relative selection:bg-brand/30 ${ie} ${T === "fullscreen" ? "w-full h-full" : ""}`,
              children: /* @__PURE__ */ a(Ue, { className: `backdrop-blur-3xl ${T === "fullscreen" ? "w-full h-full rounded-none" : ""}`, theme: ie, children: [
                /* @__PURE__ */ e(
                  $e,
                  {
                    onClose: f,
                    showClose: F !== "AuthSelection",
                    subtitle: F === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
                    theme: ie,
                    toggleTheme: Ve
                  }
                ),
                /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Ee, { mode: "wait", children: /* @__PURE__ */ e(L.div, { className: "flex-1 flex flex-col", children: Le() }, F) }) }),
                He.includes(F) && /* @__PURE__ */ e(Fe, { children: /* @__PURE__ */ a("p", { className: "text-[11px] text-slate-500 font-medium", children: [
                  "By connecting, you agree to our",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: p, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
                  " ",
                  "&",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: x, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
                ] }) })
              ] })
            }
          )
        ]
      }
    )
  ] });
};
async function ma(r, i = {}, n = 3e4) {
  const l = new AbortController(), g = setTimeout(() => l.abort(), n);
  try {
    return await fetch(r, {
      ...i,
      signal: l.signal
    });
  } finally {
    clearTimeout(g);
  }
}
class sa extends Error {
  constructor(i, n) {
    super(i), this.name = "ApiError", this.status = n;
  }
}
async function pa(r) {
  if (!r.ok) {
    const i = await r.json().catch(() => ({}));
    throw new sa(
      i.error || i.message || `Request failed with status ${r.status}`,
      r.status
    );
  }
  return r.json();
}
export {
  sa as ApiError,
  zt as AuthSelectionScreen,
  ua as CasperIDModal,
  Xt as DocumentScanScreen,
  Yt as FaceScanScreen,
  Fe as Footer,
  Ue as GlassContainer,
  $e as Header,
  aa as IdentityVerifiedScreen,
  jt as LoginScreen,
  ta as MintingIdentityScreen,
  ra as PermissionsRequestScreen,
  Wt as PinVerificationScreen,
  Qt as ReviewDataScreen,
  Gt as SecurityUpgradeScreen,
  Kt as VerifyIdentityChoiceScreen,
  ua as default,
  ma as fetchWithTimeout,
  pa as handleApiResponse
};
//# sourceMappingURL=index.mjs.map
