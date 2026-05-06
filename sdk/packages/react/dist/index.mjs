import { jsx as e, jsxs as i, Fragment as re } from "react/jsx-runtime";
import yt, { forwardRef as Xe, createElement as je, useState as y, useEffect as oe, useCallback as K, useRef as ce } from "react";
import { motion as P, AnimatePresence as Le } from "framer-motion";
const We = ({ children: r, className: a = "", theme: n = "" }) => (
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
const xt = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Qe = (...r) => r.filter((a, n, o) => !!a && o.indexOf(a) === n).join(" ");
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var gt = {
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
const vt = Xe(
  ({
    color: r = "currentColor",
    size: a = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: o,
    className: I = "",
    children: p,
    iconNode: f,
    ...l
  }, s) => je(
    "svg",
    {
      ref: s,
      ...gt,
      width: a,
      height: a,
      stroke: r,
      strokeWidth: o ? Number(n) * 24 / Number(a) : n,
      className: Qe("lucide", I),
      ...l
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
  const n = Xe(
    ({ className: o, ...I }, p) => je(vt, {
      ref: p,
      iconNode: a,
      className: Qe(`lucide-${xt(r)}`, o),
      ...I
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
const wt = j("Calendar", [
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
const kt = j("Camera", [
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
const Me = j("ChevronRight", [
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
const Ie = j("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nt = j("CircleHelp", [
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
const et = j("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const It = j("Delete", [
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
const Ne = j("Fingerprint", [
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
const Ct = j("Flashlight", [
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
const tt = j("Globe", [
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
const St = j("Key", [
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
const it = j("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Et = j("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const At = j("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dt = j("Network", [
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
const Rt = j("Puzzle", [
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
const Pt = j("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ce = j("ShieldCheck", [
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
const at = j("Shield", [
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
const Tt = j("Sparkles", [
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
const zt = j("Sun", [
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
const Vt = j("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);
/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jt = j("Wallet", [
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
const Lt = j("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), Ye = ({
  onClose: r,
  title: a = "CasperID",
  subtitle: n = "SECURE SDK",
  showClose: o = !0,
  theme: I,
  toggleTheme: p,
  logoUrl: f
}) => /* @__PURE__ */ i("header", { className: "flex items-center justify-between px-6 pt-8 pb-4 relative z-20", children: [
  /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ e("div", { className: "p-2 bg-brand rounded-xl flex items-center justify-center shadow-brand", children: f ? /* @__PURE__ */ e("img", { src: f, alt: a, className: "w-5 h-5 object-contain" }) : /* @__PURE__ */ e(at, { className: "text-white w-5 h-5" }) }),
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
        children: I === "dark" ? /* @__PURE__ */ e(zt, { className: "w-5 h-5" }) : /* @__PURE__ */ e(At, { className: "w-5 h-5" })
      }
    ),
    o && /* @__PURE__ */ e(
      "button",
      {
        onClick: r,
        className: "p-2 dark:hover:bg-slate-200 dark:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted",
        "aria-label": "Close",
        children: /* @__PURE__ */ e(Lt, { className: "w-5 h-5" })
      }
    )
  ] })
] }), Ge = ({ children: r }) => /* @__PURE__ */ e("footer", { className: "p-8 text-center relative z-20", children: r }), Ve = {
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
  language: o = "EN",
  platform: I = "desktop",
  logoUrl: p
}) => {
  const [f, l] = y(!1), [s, c] = y(null), [d, E] = y("");
  oe(() => {
    h();
  }, []), oe(() => {
    const N = (x) => {
      l(!1), x.detail && x.detail.wallet && (a == null || a(x.detail));
    };
    return window.addEventListener("casperid-login", N), () => {
      window.removeEventListener("casperid-login", N);
    };
  }, [a]);
  const h = K(() => {
    const N = document.getElementById("casperid-draggable-anchor");
    let x = null;
    try {
      x = localStorage.getItem("casperid_user");
    } catch {
    }
    return N || x ? (c(!0), !0) : (setTimeout(() => {
      const v = document.getElementById("casperid-draggable-anchor");
      c(!!v);
    }, 500), !1);
  }, []), D = (N) => typeof N == "object" && N !== null && "wallet" in N && typeof N.wallet == "string" && N.wallet.length > 0, _ = async () => {
    l(!0), E("");
    try {
      const x = localStorage.getItem("casperid_user");
      if (x) {
        const v = JSON.parse(x);
        if (D(v)) {
          l(!1), a == null || a(v);
          return;
        }
      }
    } catch {
    }
    const N = document.getElementById("casperid-draggable-anchor");
    N ? (N.click(), setTimeout(() => {
      l(!1);
      try {
        localStorage.getItem("casperid_user") || E(t("extension_connect_msg", o));
      } catch {
        E(t("extension_connect_msg", o));
      }
    }, 3e3)) : (l(!1), E(t("extension_not_detected", o)), n == null || n("Extension not installed"));
  }, u = () => {
    E(""), r("otp");
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
            /* @__PURE__ */ e("div", { className: "relative w-full h-full glass-container flex items-center justify-center rounded-2xl border border-brand-30 overflow-hidden", children: p ? /* @__PURE__ */ e("img", { src: p, alt: "App Logo", className: "w-full h-full object-cover" }) : /* @__PURE__ */ e(Ne, { className: "w-10 h-10 text-brand" }) })
          ] }),
          /* @__PURE__ */ e("h1", { className: "text-2xl font-extrabold leading-tight tracking-tight text-main", children: t("welcome_back", o) }),
          /* @__PURE__ */ e("p", { className: "text-muted text-sm leading-relaxed", children: t("auth_subtitle", o) })
        ] }),
        d && /* @__PURE__ */ i("div", { className: "flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl", children: [
          /* @__PURE__ */ e(ve, { className: "w-5 h-5 text-red-500 shrink-0 mt-0.5" }),
          /* @__PURE__ */ e("p", { className: "text-red-600 dark:text-red-400 text-sm font-medium", children: d })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-4", children: [
          I === "desktop" && /* @__PURE__ */ i(
            "button",
            {
              onClick: _,
              disabled: f,
              className: "w-full group relative overflow-hidden flex items-center gap-4 bg-brand hover:bg-brand-90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-brand",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-white/20 p-2 rounded-lg", children: f ? /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ e(Rt, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ i("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t(f ? "connecting" : "sign_in_with_extension", o) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-slate-600 dark:text-white/70", children: t(s === !0 ? "extension_detected" : "secure_wallet", o) })
                ] }),
                /* @__PURE__ */ e(Me, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          ),
          /* @__PURE__ */ i(
            "button",
            {
              onClick: u,
              disabled: f,
              className: "w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50",
              children: [
                /* @__PURE__ */ e("div", { className: "bg-brand-10 p-2 rounded-lg", children: /* @__PURE__ */ e(qe, { className: "w-5 h-5 text-brand" }) }),
                /* @__PURE__ */ i("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ e("span", { className: "text-base", children: t("sign_in_with_otp", o) }),
                  /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-widest text-brand font-bold", children: t("two_factor_auth", o) })
                ] }),
                /* @__PURE__ */ e(Me, { className: "ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ i("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(Ce, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("fully_audited", o) })
          ] }),
          /* @__PURE__ */ i("div", { className: "glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50", children: [
            /* @__PURE__ */ e(Te, { className: "w-5 h-5 text-brand" }),
            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-muted", children: t("non_custodial", o) })
          ] })
        ] })
      ]
    }
  );
}, Ot = ({
  onNext: r,
  onPasskeyUser: a,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  apiKey: I = "",
  previewMode: p = !1,
  language: f = "EN"
}) => {
  const [l, s] = y(""), [c, d] = y(!1), [E, h] = y(""), D = async () => {
    if (!l.trim()) {
      h(t("error_email_required", f));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l)) {
      h(t("error_invalid_email", f));
      return;
    }
    if (d(!0), h(""), p) {
      setTimeout(() => {
        d(!1), r(l.trim().toLowerCase(), "mock-v-id-123456789");
      }, 1e3);
      return;
    }
    try {
      const N = await fetch(`${o}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...I ? { "X-App-Id": I } : {}
        },
        body: JSON.stringify({ email: l.trim().toLowerCase() })
      });
      if (!N.ok) {
        const v = await N.json().catch(() => ({}));
        throw new Error(v.error || `Request failed with status ${N.status}`);
      }
      const x = await N.json();
      if (x.success) {
        if (x.userExists && x.hasPasskey) {
          a ? a(l.trim().toLowerCase()) : h(t("error_passkey_registered", f)), d(!1);
          return;
        }
        x.verificationId ? r(l.trim().toLowerCase(), x.verificationId) : h(t("error_send_code_failed", f));
      } else
        h(x.error || t("error_send_code_failed", f)), n == null || n(x.error || t("error_send_code_failed", f));
    } catch {
      const x = t("error_connection_failed", f);
      h(x), n == null || n(x);
    } finally {
      d(!1);
    }
  }, _ = (u) => {
    u.key === "Enter" && !c && D();
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
                  className: `w-full dark:bg-black/20 bg-slate-100/50 border ${E ? "border-red-400 dark:border-red-500" : "dark:border-white/10 border-slate-200"} rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-30 transition-all font-medium`,
                  placeholder: "name@example.com",
                  type: "email",
                  value: l,
                  onChange: (u) => {
                    s(u.target.value), E && h("");
                  },
                  onKeyDown: _,
                  disabled: c,
                  autoComplete: "email",
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ e("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400", children: /* @__PURE__ */ e(Et, { className: "w-5 h-5" }) })
            ] }),
            E && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium ml-1 mt-1", children: E })
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: D,
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
            /* @__PURE__ */ e(it, { className: "text-muted w-3 h-3" }),
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
  for (let o = 0; o < a.byteLength; o++)
    n += String.fromCharCode(a[o]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function ke(r) {
  const a = "=".repeat((4 - r.length % 4) % 4), n = r.replace(/-/g, "+").replace(/_/g, "/") + a, o = atob(n), I = new Uint8Array(o.length);
  for (let p = 0; p < o.length; p++)
    I[p] = o.charCodeAt(p);
  return I.buffer;
}
function Se() {
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential == "function");
}
async function rt() {
  if (!Se()) return !1;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return !1;
  }
}
function Ft() {
  const r = navigator.userAgent.toLowerCase();
  return /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(r) ? "mobile" : /ipad|android(?!.*mobile)|tablet/i.test(r) ? "tablet" : "desktop";
}
function qt() {
  return {
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent,
    deviceType: Ft()
  };
}
function Ut(r) {
  var a;
  return {
    ...r,
    challenge: ke(r.challenge),
    user: {
      ...r.user,
      id: ke(r.user.id)
    },
    excludeCredentials: (a = r.excludeCredentials) == null ? void 0 : a.map((n) => ({
      ...n,
      id: ke(n.id)
    }))
  };
}
function $t(r) {
  var a;
  return {
    ...r,
    challenge: ke(r.challenge),
    allowCredentials: (a = r.allowCredentials) == null ? void 0 : a.map((n) => ({
      ...n,
      id: ke(n.id)
    }))
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
      attestationObject: xe(a.attestationObject)
    },
    clientExtensionResults: r.getClientExtensionResults(),
    deviceInfo: qt()
  };
}
function Ht(r) {
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
async function Wt(r) {
  if (!Se())
    throw new Error("WebAuthn is not supported in this browser");
  const a = Ut(r), n = await navigator.credentials.create({
    publicKey: a
  });
  if (!n)
    throw new Error("Passkey creation was cancelled or failed");
  return Bt(n);
}
async function Yt(r) {
  if (!Se())
    throw new Error("WebAuthn is not supported in this browser");
  const a = $t(r), n = await navigator.credentials.get({
    publicKey: a
  });
  if (!n)
    throw new Error("Passkey authentication was cancelled or failed");
  return Ht(n);
}
const Gt = ({
  email: r,
  onSuccess: a,
  onError: n,
  onFallbackToOTP: o,
  apiBaseUrl: I = "https://apis.casperid.com",
  apiKey: p = "",
  previewMode: f = !1,
  language: l = "EN"
}) => {
  const [s, c] = y(!1), [d, E] = y(""), [h, D] = y(!0), [_, u] = y(!1);
  oe(() => {
    (async () => {
      const v = Se(), V = await rt();
      D(v && V), (!v || !V) && E(t("webauthn_not_supported", l));
    })();
  }, [l]), oe(() => {
    if (h && !_ && !f) {
      u(!0);
      const x = setTimeout(() => {
        N();
      }, 500);
      return () => clearTimeout(x);
    }
  }, [h, _, f]);
  const N = async () => {
    if (!s) {
      if (c(!0), E(""), f) {
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
        const x = await fetch(`${I}/api/passkey/auth/begin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...p ? { "X-App-Id": p } : {}
          },
          credentials: "include",
          body: JSON.stringify({ email: r })
        });
        if (!x.ok) {
          const G = await x.json().catch(() => ({}));
          throw new Error(G.error || "Failed to initialize authentication");
        }
        const v = await x.json();
        if (!v.success || !v.options)
          throw new Error(v.error || "Invalid authentication options");
        const V = await Yt(v.options), k = await fetch(`${I}/api/passkey/auth/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...p ? { "X-App-Id": p } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            email: r,
            challengeId: v.challengeId,
            credential: V
          })
        });
        if (!k.ok) {
          const G = await k.json().catch(() => ({}));
          throw new Error(G.error || "Authentication failed");
        }
        const T = await k.json();
        if (T.success && T.session_token)
          a(T.session_token, T.user, T.business_token);
        else
          throw new Error(T.error || "Authentication failed");
      } catch (x) {
        const v = x instanceof Error ? x.message : "Authentication failed";
        v.includes("cancelled") || v.includes("NotAllowedError") ? E(t("passkey_cancelled", l)) : (E(v), n == null || n(v));
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
          /* @__PURE__ */ e("h2", { className: "text-3xl font-extrabold text-main tracking-tight leading-tight", children: t("welcome_back", l) }),
          /* @__PURE__ */ e("p", { className: "text-muted mt-3 text-sm leading-relaxed", children: t("passkey_auth_subtitle", l) })
        ] }),
        /* @__PURE__ */ i("div", { className: "mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl", children: [
          /* @__PURE__ */ e("p", { className: "text-xs text-muted mb-1", children: t("signing_in_as", l) }),
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
              children: s ? /* @__PURE__ */ e(_e, { className: "w-10 h-10 text-brand animate-spin" }) : d ? /* @__PURE__ */ e(ve, { className: "w-10 h-10 text-red-400" }) : /* @__PURE__ */ e(Ne, { className: "w-10 h-10 text-brand" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center mb-2", children: t(s ? "authenticating" : d ? "authentication_failed" : "use_passkey", l) }),
          d && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mb-4 max-w-xs", children: d }),
          !s && /* @__PURE__ */ e("p", { className: "text-muted text-sm text-center max-w-xs", children: t("passkey_auth_hint", l) })
        ] }),
        /* @__PURE__ */ i("div", { className: "space-y-3 pb-8", children: [
          !s && /* @__PURE__ */ e(
            "button",
            {
              onClick: N,
              disabled: !h,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Te, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("try_again", l) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Ne, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("authenticate", l) })
              ] })
            }
          ),
          o && /* @__PURE__ */ e(
            "button",
            {
              onClick: o,
              disabled: s,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50",
              children: t("use_email_instead", l)
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(Ce, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("biometric_secured", l) })
        ] })
      ]
    }
  );
}, Jt = ({
  email: r,
  sessionToken: a,
  onSuccess: n,
  onError: o,
  onSkip: I,
  apiBaseUrl: p = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: l = !1,
  language: s = "EN"
}) => {
  const [c, d] = y(!1), [E, h] = y(""), [D, _] = y(!0), [u, N] = y(!1);
  oe(() => {
    (async () => {
      const k = Se(), T = await rt();
      _(k && T), (!k || !T) && h(t("webauthn_not_supported", s));
    })();
  }, [s]);
  const x = async () => {
    if (!c) {
      if (d(!0), h(""), l) {
        setTimeout(() => {
          d(!1), N(!0), setTimeout(() => {
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
          const H = await V.json().catch(() => ({}));
          throw new Error(H.error || "Failed to initialize registration");
        }
        const k = await V.json();
        if (!k.success || !k.options)
          throw new Error(k.error || "Invalid registration options");
        const T = await Wt(k.options), G = await fetch(`${p}/api/passkey/register/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${a}`,
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include",
          body: JSON.stringify({
            userId: k.userId,
            credential: T,
            deviceInfo: {
              userAgent: navigator.userAgent
            }
          })
        });
        if (!G.ok) {
          const H = await G.json().catch(() => ({}));
          throw new Error(H.error || "Registration failed");
        }
        const Y = await G.json();
        if (Y.success)
          N(!0), setTimeout(() => {
            n(Y.user, Y.business_token);
          }, 1e3);
        else
          throw new Error(Y.error || "Registration failed");
      } catch (V) {
        const k = V instanceof Error ? V.message : "Registration failed";
        k.includes("cancelled") || k.includes("NotAllowedError") ? h(t("passkey_cancelled", s)) : (h(k), o == null || o(k));
      } finally {
        d(!1);
      }
    }
  }, v = [
    { icon: St, text: t("passkey_benefit_1", s) },
    { icon: Ce, text: t("passkey_benefit_2", s) },
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
          /* @__PURE__ */ e("div", { className: "space-y-3", children: v.map((V, k) => /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("div", { className: "w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center", children: /* @__PURE__ */ e(V.icon, { className: "w-5 h-5 text-brand" }) }),
            /* @__PURE__ */ e("span", { className: "text-sm text-muted", children: V.text })
          ] }, k)) })
        ] }),
        (c || u || E) && /* @__PURE__ */ i("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
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
              className: `w-20 h-20 rounded-full flex items-center justify-center mb-4 ${u ? "bg-green-500/20 border-2 border-green-400" : c ? "bg-brand/20 border-2 border-brand" : "bg-red-500/10 border-2 border-red-400"}`,
              children: u ? /* @__PURE__ */ e(Ie, { className: "w-10 h-10 text-green-400" }) : c ? /* @__PURE__ */ e(_e, { className: "w-10 h-10 text-brand animate-spin" }) : /* @__PURE__ */ e(ve, { className: "w-10 h-10 text-red-400" })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-main font-semibold text-center", children: t(u ? "passkey_created" : c ? "creating_passkey" : "passkey_create_failed", s) }),
          E && /* @__PURE__ */ e("p", { className: "text-red-500 text-sm text-center mt-2 max-w-xs", children: E })
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-auto space-y-3 pb-8", children: [
          !u && /* @__PURE__ */ e(
            "button",
            {
              onClick: x,
              disabled: !D || c,
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              children: c ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("creating_passkey", s) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Ne, { className: "w-5 h-5" }),
                /* @__PURE__ */ e("span", { children: t("register_passkey", s) })
              ] })
            }
          ),
          I && !c && !u && /* @__PURE__ */ e(
            "button",
            {
              onClick: I,
              className: "w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center transition-colors",
              children: t("do_this_later", s)
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "flex items-center justify-center gap-2 pb-4 opacity-50", children: [
          /* @__PURE__ */ e(it, { className: "text-muted w-3 h-3" }),
          /* @__PURE__ */ e("span", { className: "text-[10px] uppercase tracking-[0.2em] font-bold text-muted", children: t("e2e_encrypted", s) })
        ] })
      ]
    }
  );
}, Kt = ({
  email: r,
  verificationId: a,
  onNext: n,
  onError: o,
  apiBaseUrl: I = "https://apis.casperid.com",
  apiKey: p,
  previewMode: f = !1,
  language: l = "EN"
}) => {
  const [s, c] = y(["", "", "", "", "", ""]), [d, E] = y(!1), [h, D] = y(!1), [_, u] = y(""), [N, x] = y(0), [v, V] = y(a);
  oe(() => {
    if (N > 0) {
      const b = setTimeout(() => x(N - 1), 1e3);
      return () => clearTimeout(b);
    }
  }, [N]), oe(() => {
    s.every((b) => b !== "") && !d && G();
  }, [s]);
  const k = K((b) => {
    u(""), c((C) => {
      const A = [...C], M = A.findIndex((F) => F === "");
      return M !== -1 && (A[M] = b), A;
    });
  }, []), T = K(() => {
    u(""), c((b) => {
      const C = [...b];
      for (let A = C.length - 1; A >= 0; A--)
        if (C[A] !== "") {
          C[A] = "";
          break;
        }
      return C;
    });
  }, []);
  oe(() => {
    const b = (C) => {
      d || (/^[0-9]$/.test(C.key) ? (C.preventDefault(), k(C.key)) : (C.key === "Backspace" || C.key === "Delete") && (C.preventDefault(), T()));
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [d, k, T]);
  const G = async () => {
    const b = s.join("");
    if (b.length !== 6) {
      u(t("error_pin_incomplete", l));
      return;
    }
    if (E(!0), u(""), f) {
      setTimeout(() => {
        E(!1), n("mock-session-token", null);
      }, 1e3);
      return;
    }
    try {
      const C = await fetch(`${I}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": p || ""
        },
        body: JSON.stringify({
          verificationId: v,
          otp: b
        })
      });
      if (!C.ok) {
        const M = await C.json().catch(() => ({}));
        throw new Error(M.error || `Verification failed with status ${C.status}`);
      }
      const A = await C.json();
      A.success && A.sessionToken ? n(A.sessionToken, A.userAccount, A.business_token) : (u(A.error || t("invalid_code", l)), A.attemptsLeft !== void 0 && u(t("invalid_code_attempts", l).replace("{attempts}", A.attemptsLeft.toString())), c(["", "", "", "", "", ""]), o == null || o(A.error || t("verification_failed", l)));
    } catch {
      const A = t("error_verify_failed", l);
      u(A), c(["", "", "", "", "", ""]), o == null || o(A);
    } finally {
      E(!1);
    }
  }, Y = async () => {
    if (!(N > 0 || h)) {
      if (D(!0), u(""), f) {
        setTimeout(() => {
          D(!1), x(60), c(["", "", "", "", "", ""]);
        }, 800);
        return;
      }
      try {
        const b = await fetch(`${I}/api/auth/resend-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ verificationId: v })
        });
        if (!b.ok) {
          const A = await b.json().catch(() => ({}));
          throw new Error(A.error || `Request failed with status ${b.status}`);
        }
        const C = await b.json();
        C.success ? (x(60), c(["", "", "", "", "", ""])) : u(C.error || t("error_resend_failed", l));
      } catch {
        u(t("error_resend_failed", l));
      } finally {
        D(!1);
      }
    }
  }, H = r.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return /* @__PURE__ */ i(
    P.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      className: "flex-1 flex flex-col px-8 pt-12",
      children: [
        /* @__PURE__ */ i("div", { className: "space-y-2 mb-8", children: [
          /* @__PURE__ */ e("h1", { className: "text-3xl font-bold tracking-tight text-main", children: t("verify_email", l) }),
          /* @__PURE__ */ i("p", { className: "text-muted text-sm font-medium", children: [
            t("enter_code", l),
            " ",
            /* @__PURE__ */ e("span", { className: "text-main font-semibold", children: H })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "flex justify-between gap-2 mb-6", children: s.map((b, C) => /* @__PURE__ */ i(
          "div",
          {
            className: `size-12 rounded-2xl dark:bg-black/20 bg-slate-100/50 flex items-center justify-center text-xl font-bold border transition-all ${b ? "text-brand dark:border-brand-30 border-brand-50" : "text-muted dark:border-white/10 border-slate-200"} ${_ ? "border-red-400 dark:border-red-500" : ""}`,
            children: [
              b,
              !b && s.findIndex((A) => A === "") === C && /* @__PURE__ */ e("div", { className: "w-0.5 h-6 bg-brand animate-pulse" })
            ]
          },
          C
        )) }),
        _ && /* @__PURE__ */ e("p", { className: "text-red-500 text-xs font-medium text-center mb-4", children: _ }),
        /* @__PURE__ */ i("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => k(b.toString()),
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
              onClick: () => k("0"),
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
              children: /* @__PURE__ */ e(It, { className: "w-6 h-6" })
            }
          )
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-auto pb-8 space-y-4", children: [
          /* @__PURE__ */ e(
            "button",
            {
              onClick: G,
              disabled: d || s.some((b) => b === ""),
              className: "w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed",
              children: d ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-5 h-5 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("verifying", l) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: t("verify", l) }),
                /* @__PURE__ */ e(Oe, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
              ] })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Y,
              disabled: N > 0 || h,
              className: "w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-2xl transition-all border dark:border-white/10 border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
              children: h ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(_e, { className: "w-4 h-4 animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("sending", l) })
              ] }) : N > 0 ? /* @__PURE__ */ i("span", { children: [
                t("resend_code", l),
                " (",
                N,
                "s)"
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e(Te, { className: "w-4 h-4" }),
                /* @__PURE__ */ e("span", { children: t("resend_code", l) })
              ] })
            }
          )
        ] })
      ]
    }
  );
}, Zt = ({ onNext: r, onSkip: a, language: n = "EN" }) => /* @__PURE__ */ i(
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
        /* @__PURE__ */ e("div", { className: "w-full bg-brand-10 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
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
          /* @__PURE__ */ e("div", { className: "absolute bottom-1 right-1 w-8 h-8 rounded-full glass-container border-2 border-brand flex items-center justify-center", children: /* @__PURE__ */ e(Te, { className: "w-4 h-4 text-brand" }) })
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
            className: "w-full text-muted text-sm font-bold hover:text-main transition-colors",
            children: t("do_this_later", n)
          }
        )
      ] })
    ]
  }
), we = [
  "Position your face in the frame",
  "Blink 3 times naturally",
  "Open your mouth",
  "Hold still",
  "Processing verification..."
], Pe = (r, a) => Math.sqrt(Math.pow(r.x - a.x, 2) + Math.pow(r.y - a.y, 2)), Xt = ({
  requestId: r,
  onNext: a,
  onError: n,
  apiBaseUrl: o = "https://apis.casperid.com",
  apiKey: I = "",
  previewMode: p = !1,
  language: f = "EN"
}) => {
  const l = ce(null), s = ce(null), c = ce(null), d = ce([]), E = ce(null), h = ce(null), [D, _] = y(0), [u, N] = y(!1), [x, v] = y(""), [V, k] = y(!1), [T, G] = y(!1), [Y, H] = y(0), [b, C] = y(!1), [A, M] = y(0), F = ce(0), q = ce(0), J = ce(!1), Q = ce(0), de = ce(!1), ue = (w) => {
    F.current = w, _(w);
  }, te = (w) => {
    q.current = w, H(w);
  }, ie = (w) => {
    J.current = w, C(w);
  }, U = (w) => {
    Q.current = w, M(w);
  }, fe = D === 0 ? 0 : D === 1 ? Y / 3 * 100 : D === 2 ? A : D === 3 ? 100 : Math.min(100, Math.round(D / (we.length - 1) * 100));
  oe(() => ((async () => {
    try {
      const { FaceMesh: L } = await import("./face_mesh-DYMPc5Ce.js").then((z) => z.f), { Camera: X } = await import("./camera_utils-BQaOSBPu.js").then((z) => z.c), pe = new L({
        locateFile: (z) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${z}`
      });
      if (pe.setOptions({
        maxNumFaces: 1,
        refineLandmarks: !0,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3
      }), console.log("✅ MediaPipe FaceMesh loaded successfully"), pe.onResults(Z), E.current = pe, l.current) {
        const z = new X(l.current, {
          onFrame: async () => {
            E.current && l.current && await E.current.send({ image: l.current });
          },
          width: 640,
          height: 480
        });
        await z.start(), h.current = z, N(!0), console.log("📹 Camera started successfully");
      }
    } catch (L) {
      console.error("FaceMesh initialization error:", L), L.name === "NotAllowedError" ? (G(!0), v("Camera permission denied. Please enable camera access.")) : v("Unable to initialize face detection. Please try again."), n == null || n("FaceMesh initialization failed");
    }
  })(), () => {
    h.current && h.current.stop(), c.current && c.current.getTracks().forEach((L) => L.stop());
  }), []);
  const Z = (w) => {
    if (!s.current || V) return;
    const L = s.current, X = L.getContext("2d");
    if (!(!X || !w.image))
      if (X.save(), X.clearRect(0, 0, L.width, L.height), X.translate(L.width, 0), X.scale(-1, 1), X.drawImage(w.image, 0, 0, L.width, L.height), X.restore(), w.multiFaceLandmarks && w.multiFaceLandmarks.length > 0) {
        const pe = w.multiFaceLandmarks[0];
        me(pe);
      } else
        console.log("⚠️ No face detected in frame");
  }, me = (w) => {
    const L = F.current, X = q.current, pe = J.current;
    if (L === 0) {
      const z = w[1], O = z.x > 0.35 && z.x < 0.65 && z.y > 0.35 && z.y < 0.65;
      Math.random() < 0.05 && console.log(`📍 Face position: x=${z.x.toFixed(2)}, y=${z.y.toFixed(2)} (centered: ${O})`), O && (console.log("✅ Face centered! Advancing to blink detection..."), setTimeout(() => ue(1), 500));
    } else if (L === 1) {
      const z = Pe(w[159], w[145]), O = Pe(w[33], w[133]), he = z / O;
      if (Math.random() < 0.1 && console.log(`👁️ Eye ratio: ${he.toFixed(3)} (threshold: 0.16, ${he < 0.16 ? "CLOSED" : "OPEN"})`), he < 0.16)
        pe || (console.log("👁️ Blink started (eye closed)"), ie(!0));
      else if (pe) {
        const W = X + 1;
        console.log(`✅ Blink detected! Count: ${W}/3`), ie(!1), te(W), ee(), W >= 3 && (console.log("🎉 All 3 blinks completed! Moving to mouth opening step..."), setTimeout(() => {
          ue(2), U(0);
        }, 300));
      }
    } else if (L === 2) {
      const z = w[13], O = w[14], he = Pe(z, O), W = w[10], le = w[152], ge = Pe(W, le), ae = he / ge, ye = Math.min(ae / 0.15 * 100, 100);
      U(ye), d.current.length < 15 && ee(), ae > 0.12 && d.current.length >= 10 && !de.current && (de.current = !0, ee(), setTimeout(() => {
        ue(3), ne();
      }, 500));
    }
  }, ee = () => {
    !s.current || d.current.length >= 25 || s.current.toBlob((w) => {
      w && d.current.push(w);
    }, "image/jpeg", 0.8);
  }, ne = async () => {
    var w, L, X, pe;
    if (k(!0), ue(4), p) {
      setTimeout(() => {
        k(!1), a(!0);
      }, 2e3);
      return;
    }
    try {
      const z = new FormData(), O = !!r, he = O ? `${o}/api/v2/verification/liveness` : `${o}/api/ai/verify-liveness-sequence`;
      if (O) {
        z.append("requestId", r);
        const ae = {
          totalFrames: d.current.length,
          stepSequence: ["blink", "open_mouth"],
          timestamp: Date.now()
        };
        z.append("metadata", JSON.stringify(ae)), d.current.slice(-10).forEach((Ee, Ae) => {
          z.append("imageFrames", Ee, `frame_${Ae}.jpg`);
        });
      } else
        d.current.forEach((ae, ye) => {
          z.append(`frame_${ye}`, ae, `frame_${ye}.jpg`);
        }), z.append("totalFrames", d.current.length.toString()), z.append("stepSequence", JSON.stringify(["blink", "open_mouth"]));
      const W = await fetch(he, {
        method: "POST",
        headers: {
          ...I ? { "X-App-Id": I } : {}
        },
        body: z,
        credentials: "include"
      });
      if (!W.ok) {
        const ae = await W.json().catch(() => ({}));
        throw new Error(ae.error || `Liveness check failed with status ${W.status}`);
      }
      const le = await W.json();
      if (O ? le.success && (((w = le.liveness) == null ? void 0 : w.success) || ((L = le.liveness) == null ? void 0 : L.status) === "completed" || ((X = le.liveness) == null ? void 0 : X.status) === "approved") : le.success && le.passed)
        h.current && h.current.stop(), c.current && c.current.getTracks().forEach((ae) => ae.stop()), a(!0);
      else {
        const ae = le.error || ((pe = le.liveness) == null ? void 0 : pe.error) || "Liveness check failed. Please try again.";
        v(ae), ue(0), te(0), U(0), d.current = [], k(!1), de.current = !1;
      }
    } catch {
      v("Verification failed. Please try again."), ue(0), te(0), U(0), d.current = [], k(!1), n == null || n("Liveness submission failed");
    }
  }, $ = () => {
    v(""), ue(0), te(0), U(0), d.current = [], k(!1), de.current = !1;
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
            ref: l,
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
          ].map((w, L) => /* @__PURE__ */ e(
            P.div,
            {
              initial: { scale: 0, opacity: 0 },
              animate: {
                scale: [0, 1.5, 1],
                opacity: fe > L * 11 ? 1 : 0
              },
              className: "absolute w-2 h-2 bg-[#6DE8EC] rounded-full shadow-[0_0_12px_#6DE8EC]",
              style: { top: w.t, left: w.l }
            },
            L
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
          x ? /* @__PURE__ */ i(
            P.div,
            {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              className: "bg-red-900/30 border border-red-500/50 p-6 rounded-3xl w-full text-center",
              children: [
                /* @__PURE__ */ e("p", { className: "text-red-400 font-bold text-lg mb-4", children: x }),
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: $,
                    className: "px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors",
                    children: "Try Again"
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ e(Le, { mode: "wait", children: /* @__PURE__ */ e(
            P.div,
            {
              initial: { opacity: 0, y: 10, filter: "blur(5px)" },
              animate: { opacity: 1, y: 0, filter: "blur(0px)" },
              exit: { opacity: 0, y: -10, filter: "blur(5px)" },
              className: "text-white text-center font-bold text-xl leading-tight min-h-[3rem] flex items-center justify-center drop-shadow-lg flex-col gap-2",
              children: V && D === 4 ? /* @__PURE__ */ i("span", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ i("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ e("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ e("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                we[D]
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: we[D] }),
                D === 1 && /* @__PURE__ */ i("span", { className: "text-[#6DE8EC] text-2xl", children: [
                  "(",
                  Y,
                  "/3)"
                ] })
              ] })
            },
            D === 1 ? `${we[D]}-${Y}` : we[D]
          ) }),
          /* @__PURE__ */ e("div", { className: "w-full max-w-[240px] h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            P.div,
            {
              className: "h-full bg-gradient-to-r from-[#8651e1] to-[#6DE8EC]",
              animate: { width: `${fe}%` },
              transition: { duration: 0.3 }
            }
          ) }),
          !x && /* @__PURE__ */ i("div", { className: "flex items-center gap-2 text-gray-400 text-xs", children: [
            /* @__PURE__ */ e("div", { className: `w-2 h-2 rounded-full ${u ? "bg-[#6DE8EC] shadow-[0_0_8px_#6DE8EC]" : "bg-yellow-500 animate-pulse"}` }),
            /* @__PURE__ */ e("span", { className: "uppercase tracking-widest font-bold", children: u ? "LIVE CAMERA" : "INITIALIZING..." })
          ] })
        ] })
      ]
    }
  );
}, Qt = [
  { id: "passport", title: "Passport", desc: "All countries supported", Icon: tt },
  { id: "drivers_license", title: "Driver License", desc: "Government issued card", Icon: et },
  { id: "national_id", title: "ID Card", desc: "National identity document", Icon: qe }
], ei = ({ onNext: r, language: a = "EN" }) => /* @__PURE__ */ i(
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
        Qt.map(({ id: n, title: o, desc: I, Icon: p }) => /* @__PURE__ */ i(
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
              /* @__PURE__ */ e(Me, { className: "text-brand w-5 h-5" })
            ]
          },
          n
        )),
        /* @__PURE__ */ i("div", { className: "mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-brand-30 border-brand-40", children: [
          /* @__PURE__ */ e("div", { className: "absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand via-transparent to-transparent" }),
          /* @__PURE__ */ i("div", { className: "text-center z-10", children: [
            /* @__PURE__ */ e(Ce, { className: "text-brand/40 w-10 h-10 mx-auto mb-1" }),
            /* @__PURE__ */ e("p", { className: "text-[10px] text-muted uppercase tracking-tighter font-bold", children: "Encrypted E2E" })
          ] })
        ] })
      ] })
    ]
  }
), ti = (r) => ({
  passport: t("passport", r),
  drivers_license: t("drivers_license", r),
  national_id: t("national_id", r)
}), ii = ({
  requestId: r,
  documentType: a,
  onNext: n,
  onError: o,
  apiBaseUrl: I = "https://apis.casperid.com",
  apiKey: p = "",
  previewMode: f = !1,
  language: l = "EN"
}) => {
  const s = ce(null), c = ce(null), d = ce(null), [E, h] = y(!1), [D, _] = y(null), [u, N] = y(null), [x, v] = y(!1), [V, k] = y(""), [T, G] = y("front"), [Y, H] = y(null);
  oe(() => ((async () => {
    try {
      const F = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // Use back camera for documents
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      d.current = F, s.current && (s.current.srcObject = F, s.current.onloadedmetadata = () => {
        h(!0);
      });
    } catch {
      try {
        const q = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        d.current = q, s.current && (s.current.srcObject = q, s.current.onloadedmetadata = () => {
          h(!0);
        });
      } catch {
        k(t("unable_access_camera", l)), o == null || o("Camera access failed");
      }
    }
  })(), () => {
    d.current && d.current.getTracks().forEach((F) => F.stop()), u && URL.revokeObjectURL(u);
  }), [o]);
  const b = async () => {
    if (!s.current || !c.current) return;
    const M = c.current, F = s.current, q = M.getContext("2d");
    q && (M.width = F.videoWidth, M.height = F.videoHeight, q.drawImage(F, 0, 0), M.toBlob((J) => {
      J && (_(J), N(URL.createObjectURL(J)));
    }, "image/jpeg", 0.9));
  }, C = () => {
    u && URL.revokeObjectURL(u), _(null), N(null), k("");
  }, A = async () => {
    if (v(!0), f) {
      setTimeout(() => {
        v(!1), n({
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
    if (!D) {
      v(!1);
      return;
    }
    if (T === "front" && a !== "passport") {
      H(D), _(null), N(null), G("back"), v(!1);
      return;
    }
    v(!0), k("");
    try {
      const M = new FormData();
      M.append("document_type", a), Y ? (M.append("front_image", Y, "front.jpg"), M.append("back_image", D, "back.jpg")) : M.append("front_image", D, "document.jpg");
      const F = await fetch(`${I}/api/v2/verification/layer3/documents/upload`, {
        method: "POST",
        body: M,
        credentials: "include",
        headers: {
          "X-Request-Id": r,
          ...p ? { "X-App-Id": p } : {}
        }
      });
      if (!F.ok) {
        const J = await F.json().catch(() => ({}));
        throw new Error(J.error || `Document upload failed with status ${F.status}`);
      }
      const q = await F.json();
      q.success && q.extracted_data ? (d.current && d.current.getTracks().forEach((J) => J.stop()), n(q.extracted_data, q.upload_id || "", {
        frontImageUrl: q.front_image_url,
        frontImageFileId: q.front_image_file_id,
        backImageUrl: q.back_image_url,
        backImageFileId: q.back_image_file_id
      })) : (k(q.error || "Failed to process document. Please try again."), v(!1));
    } catch {
      k("Upload failed. Please try again."), v(!1), o == null || o("Document upload failed");
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
          /* @__PURE__ */ e("div", { className: "w-full h-full bg-main opacity-10 flex items-center justify-center", children: /* @__PURE__ */ e("div", { className: "w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" }) }),
          /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-[2px]" })
        ] }),
        /* @__PURE__ */ e("div", { className: "relative z-10 p-6 flex flex-col items-center", children: /* @__PURE__ */ e("div", { className: "text-center px-4 py-2 bg-brand-10 backdrop-blur-xl rounded-full border border-brand-10", children: /* @__PURE__ */ e("h3", { className: "text-main text-sm font-medium tracking-wide uppercase", children: t("scan_instruction", l).replace("{side}", t(T, l)).replace("{docType}", ti(l)[a]) }) }) }),
        /* @__PURE__ */ e("div", { className: "relative z-10 flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ i("div", { className: "w-full aspect-[1.58/1] relative", children: [
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
          !u && E && /* @__PURE__ */ e(
            P.div,
            {
              animate: { top: ["0%", "100%", "0%"] },
              transition: { duration: 4, repeat: 1 / 0, ease: "linear" },
              className: "absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
            }
          ),
          !E && !u && /* @__PURE__ */ e("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl", children: /* @__PURE__ */ e(_e, { className: "w-8 h-8 text-[#6DE8EC] animate-spin" }) })
        ] }) }),
        V && /* @__PURE__ */ i("div", { className: "relative z-10 mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3", children: [
          /* @__PURE__ */ e(ve, { className: "w-5 h-5 text-red-500 shrink-0" }),
          /* @__PURE__ */ e("p", { className: "text-red-400 text-sm font-medium", children: V })
        ] }),
        /* @__PURE__ */ i("div", { className: "relative z-10 p-8 glass-container backdrop-blur-2xl border-t border-brand-10 rounded-t-3xl", children: [
          /* @__PURE__ */ e("p", { className: "text-muted text-xs text-center mb-6 font-medium", children: t(u ? "review_capture" : "align_document", l) }),
          /* @__PURE__ */ e("div", { className: "flex items-center justify-between gap-4", children: u ? /* @__PURE__ */ i(re, { children: [
            /* @__PURE__ */ e(
              "button",
              {
                onClick: C,
                disabled: x,
                className: "w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted disabled:opacity-50",
                children: /* @__PURE__ */ e(Pt, { className: "w-6 h-6" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: A,
                disabled: x,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-70",
                children: x ? /* @__PURE__ */ i(re, { children: [
                  /* @__PURE__ */ e(_e, { className: "w-6 h-6 animate-spin" }),
                  /* @__PURE__ */ e("span", { children: t("processing", l) })
                ] }) : /* @__PURE__ */ e("span", { children: t(T === "front" && a !== "passport" ? "next_back_side" : "confirm", l) })
              }
            ),
            /* @__PURE__ */ e("div", { className: "w-12 h-12" }),
            " "
          ] }) : /* @__PURE__ */ i(re, { children: [
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(Ct, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ i(
              "button",
              {
                onClick: b,
                disabled: !E,
                className: "flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-50",
                children: [
                  /* @__PURE__ */ e(kt, { className: "w-6 h-6" }),
                  /* @__PURE__ */ e("span", { children: t("capture", l) })
                ]
              }
            ),
            /* @__PURE__ */ e("button", { className: "w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted", children: /* @__PURE__ */ e(Nt, { className: "w-6 h-6" }) })
          ] }) }),
          /* @__PURE__ */ e("div", { className: "w-32 h-1.5 bg-brand-10 rounded-full mx-auto mt-8" })
        ] })
      ]
    }
  );
}, ai = ({
  requestId: r,
  documentType: a,
  extractedData: n,
  uploadId: o,
  frontImageUrl: I,
  frontImageFileId: p,
  backImageUrl: f,
  backImageFileId: l,
  onNext: s,
  onRetake: c,
  onError: d,
  apiBaseUrl: E = "https://apis.casperid.com",
  apiKey: h = "",
  previewMode: D = !1,
  language: _ = "EN"
}) => {
  const [u, N] = y({
    firstName: n.first_name || "",
    lastName: n.last_name || "",
    documentNumber: n.document_number || "",
    dateOfBirth: n.date_of_birth || "",
    nationality: n.nationality || "",
    gender: n.gender || ""
  }), [x, v] = y(!1), [V, k] = y(""), T = (b, C) => {
    N((A) => ({ ...A, [b]: C }));
  }, G = async () => {
    if (!u.firstName || !u.lastName || !u.documentNumber) {
      k(t("error_required_fields", _));
      return;
    }
    if (v(!0), k(""), D) {
      setTimeout(() => {
        v(!1), s({
          first_name: u.firstName,
          last_name: u.lastName,
          document_number: u.documentNumber,
          date_of_birth: u.dateOfBirth,
          nationality: u.nationality,
          gender: u.gender,
          document_type: a
        });
      }, 1500);
      return;
    }
    try {
      const b = await fetch(`${E}/api/v2/verification/layer3/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...h ? { "X-App-Id": h } : {}
        },
        credentials: "include",
        body: JSON.stringify({
          upload_id: o,
          front_image_url: I,
          front_image_file_id: p,
          back_image_url: f,
          back_image_file_id: l,
          liveness_verified: !1,
          // Will be updated after FaceScan
          document_data: {
            first_name: u.firstName,
            last_name: u.lastName,
            document_number: u.documentNumber,
            date_of_birth: u.dateOfBirth,
            nationality: u.nationality,
            gender: u.gender,
            document_type: a
          }
        })
      });
      if (!b.ok) {
        const A = await b.json().catch(() => ({}));
        throw new Error(A.error || `Data submission failed with status ${b.status}`);
      }
      const C = await b.json();
      C.success ? s({
        first_name: u.firstName,
        last_name: u.lastName,
        document_number: u.documentNumber,
        date_of_birth: u.dateOfBirth,
        nationality: u.nationality,
        gender: u.gender,
        document_type: a
      }) : (k(C.error || "Failed to submit data. Please try again."), v(!1));
    } catch {
      k("Failed to submit data. Please try again."), v(!1), d == null || d("Data submission failed");
    }
  }, Y = n.confidence || 0, H = Math.round(Y);
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
        Y > 0 && /* @__PURE__ */ i("div", { className: "mb-6 p-3 rounded-xl bg-brand-5 border border-brand-10", children: [
          /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ e("span", { className: "text-xs font-semibold text-muted", children: t("ocr_confidence", _) }),
            /* @__PURE__ */ i("span", { className: `text-xs font-bold ${H >= 80 ? "text-green-500" : H >= 60 ? "text-yellow-500" : "text-red-500"}`, children: [
              H,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 bg-brand-10 rounded-full overflow-hidden", children: /* @__PURE__ */ e(
            "div",
            {
              className: `h-full rounded-full transition-all ${H >= 80 ? "bg-green-500" : H >= 60 ? "bg-yellow-500" : "bg-red-500"}`,
              style: { width: `${H}%` }
            }
          ) }),
          H < 80 && /* @__PURE__ */ e("p", { className: "text-[10px] text-yellow-500 mt-2", children: t("verify_data_carefully", _) })
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
                /* @__PURE__ */ e(Vt, { className: "text-brand mr-3 w-5 h-5 shrink-0" }),
                /* @__PURE__ */ e("div", { className: "flex flex-col w-full", children: /* @__PURE__ */ e(
                  "input",
                  {
                    className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-muted",
                    type: "text",
                    value: u.firstName,
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
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-muted",
                  type: "text",
                  value: u.lastName,
                  onChange: (b) => T("lastName", b.target.value),
                  placeholder: t("enter_last_name", _) || "Last name"
                }
              ) }) })
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("id_number", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(et, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-muted",
                  type: "text",
                  value: u.documentNumber,
                  onChange: (b) => T("documentNumber", b.target.value),
                  placeholder: t("enter_doc_number", _)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("date_of_birth", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(wt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-muted",
                  type: "text",
                  value: u.dateOfBirth,
                  onChange: (b) => T("dateOfBirth", b.target.value),
                  placeholder: t("date_format", _)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e("label", { className: "text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1", children: t("nationality", _) }),
            /* @__PURE__ */ i("div", { className: "flex items-center px-1 transition-all", children: [
              /* @__PURE__ */ e(tt, { className: "text-brand mr-4 w-6 h-6 shrink-0" }),
              /* @__PURE__ */ e(
                "input",
                {
                  className: "bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-muted",
                  type: "text",
                  value: u.nationality,
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
                /* @__PURE__ */ e(Ie, { className: "text-brand w-5 h-5" }),
                /* @__PURE__ */ e("span", { className: "text-xs font-bold text-main", children: t("scanned_successfully", _) })
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
              onClick: G,
              disabled: x,
              className: "w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70",
              children: x ? /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
                /* @__PURE__ */ e("span", { children: t("submitting", _) })
              ] }) : /* @__PURE__ */ i(re, { children: [
                /* @__PURE__ */ e("span", { children: t("confirm_mint", _) }),
                /* @__PURE__ */ e(Tt, { className: "w-5 h-5" })
              ] })
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-center text-[10px] mt-4 text-muted", children: t("secured_by_casper", _) })
        ] })
      ]
    }
  );
}, ri = (r, a) => r === "layer_1" ? {
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
}, ni = ({
  tier: r,
  sessionToken: a,
  requestId: n,
  onNext: o,
  onError: I,
  apiBaseUrl: p = "https://apis.casperid.com",
  apiKey: f = "",
  previewMode: l = !1,
  language: s = "EN"
}) => {
  const [c, d] = y("processing"), [E, h] = y(0), [D, _] = y(""), [u, N] = y(null), [x, v] = y(null), [V, k] = y(null), [T, G] = y(null), Y = ce(!1), b = ri(r, s)[c];
  oe(() => {
    Y.current || (Y.current = !0, l ? C() : A());
  }, []);
  const C = async () => {
    d("processing"), h(20), await Q(1e3), h(50), await Q(1e3), d("minting"), h(70), await Q(1e3), h(100), d("completed"), r === "layer_1" ? (N("account-hash-abc123..."), G("casper-user-1234"), v("did:casper:abc123...")) : k("mock-credential-hash-xyz"), await Q(1500), o({
      wallet: "account-hash-abc123...",
      didAddress: "did:casper:abc123...",
      credentialHash: "mock-credential-hash-xyz"
    });
  }, A = async () => {
    try {
      r === "layer_1" ? await M() : await J();
    } catch (ie) {
      const U = ie instanceof Error ? ie.message : "Setup failed";
      _(U), d("failed"), I == null || I(U);
    }
  }, M = async () => {
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
    const U = await ie.json();
    if (!U.success || !((me = U.walletInfo) != null && me.walletAddress))
      throw new Error(U.error || "Wallet generation failed");
    N(U.walletInfo.walletAddress), U.walletInfo.humanId && G(U.walletInfo.humanId), h(50), d("minting"), h(60);
    const fe = await fetch(`${p}/api/passkey/did/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${a}`,
        ...f ? { "X-App-Id": f } : {}
      },
      credentials: "include"
    });
    if (!fe.ok) {
      const ee = await fe.json().catch(() => ({}));
      throw new Error(ee.error || "Failed to mint DID");
    }
    const Z = await fe.json();
    if (!Z.success)
      throw new Error(Z.error || "DID minting failed");
    v(Z.did_address), k(Z.transaction_hash), h(100), d("completed"), await Q(1500), o({
      wallet: U.walletInfo.walletAddress,
      didAddress: Z.did_address,
      credentialHash: Z.transaction_hash
    });
  }, F = async () => {
    var fe, Z, me, ee;
    if (d("processing"), h(20), !n)
      throw new Error("No verification request ID provided");
    const ie = 10, U = 1500;
    for (let ne = 0; ne < ie; ne++)
      try {
        const $ = await fetch(`${p}/api/v2/verification/${n}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...f ? { "X-App-Id": f } : {}
          },
          credentials: "include"
        });
        if (!$.ok)
          throw new Error("Failed to check verification status");
        const w = await $.json(), L = (fe = w.verification) == null ? void 0 : fe.status;
        if (h(Math.min(20 + ne * 8, 80)), L === "completed") {
          d("minting"), h(90), await Q(500), h(100), d("completed");
          const X = (me = (Z = w.verification) == null ? void 0 : Z.results) == null ? void 0 : me.proofHash;
          await Q(1500), o({ credentialHash: X || n });
          return;
        }
        if (L === "failed")
          throw new Error(((ee = w.verification) == null ? void 0 : ee.error) || "Verification failed");
        await Q(U);
      } catch ($) {
        if (ne === ie - 1)
          throw $;
        await Q(U);
      }
    d("minting"), h(90), await Q(500), h(100), d("completed"), await Q(1500), o({ credentialHash: n });
  }, q = async () => {
    d("processing"), h(30), await Q(800), h(60), d("minting"), h(80), await Q(800), h(100), d("completed"), await Q(2e3), o({ credentialHash: n });
  }, J = async () => {
    r === "layer_2" ? await F() : await q();
  }, Q = (ie) => new Promise((U) => setTimeout(U, ie)), de = () => {
    d("processing"), h(0), _(""), Y.current = !1, l ? C() : A();
  }, ue = () => r === "layer_1" ? c === "minting" ? /* @__PURE__ */ e(Ne, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(jt, { className: "text-brand w-4 h-4" }) : /* @__PURE__ */ e(at, { className: "text-brand w-4 h-4" }), te = () => {
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
                  /* @__PURE__ */ e("div", { className: `w-8 h-8 rounded flex items-center justify-center ${c === "completed" ? "bg-green-500/30" : c === "failed" ? "bg-red-500/30" : "bg-brand/30"}`, children: c === "completed" ? /* @__PURE__ */ e(Ie, { className: "text-green-500 w-4 h-4" }) : c === "failed" ? /* @__PURE__ */ e(ve, { className: "text-red-500 w-4 h-4" }) : ue() }),
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
          /* @__PURE__ */ e("p", { className: "text-red-500 text-sm", children: D }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: de,
              className: "px-6 py-3 bg-brand text-white rounded-2xl font-bold",
              children: t("try_again", s)
            }
          )
        ] }),
        r === "layer_1" && u && c === "completed" && /* @__PURE__ */ i("div", { className: "mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5", children: [
          /* @__PURE__ */ e("p", { className: "text-[10px] text-muted mb-1", children: t("your_wallet", s) }),
          /* @__PURE__ */ i("p", { className: "text-xs font-mono text-main break-all", children: [
            u.slice(0, 20),
            "...",
            u.slice(-10)
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
            /* @__PURE__ */ e("span", { className: `text-xs font-bold ${c === "completed" ? "text-green-500" : "text-[#6DE8EC]"}`, children: t("complete_percent", s).replace("{percent}", E.toString()) })
          ] }),
          /* @__PURE__ */ e("div", { className: "w-full h-1.5 dark:bg-brand/10 bg-brand/10 rounded-full overflow-hidden mb-4", children: /* @__PURE__ */ e(
            P.div,
            {
              initial: { width: "0%" },
              animate: { width: `${E}%` },
              transition: { duration: 0.5 },
              className: `h-full rounded-full ${c === "completed" ? "bg-gradient-to-r from-green-500 to-[#6DE8EC]" : "bg-gradient-to-r from-brand to-[#6DE8EC]"} shadow-[0_0_10px_rgba(114,43,238,0.5)]`
            }
          ) }),
          /* @__PURE__ */ i("div", { className: "flex items-center gap-3 px-3 py-2 dark:bg-brand/10 bg-brand/10 rounded-xl border dark:border-brand-10 border-brand-5", children: [
            /* @__PURE__ */ e(Dt, { className: `w-4 h-4 ${c === "completed" ? "text-green-500" : "text-brand"}` }),
            /* @__PURE__ */ e("p", { className: "text-[10px] dark:text-slate-300 text-slate-600 font-medium", children: te() })
          ] })
        ] })
      ]
    }
  );
}, si = ({ onNext: r, language: a = "EN" }) => /* @__PURE__ */ i(
  P.div,
  {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    className: "flex-1 flex flex-col items-center justify-center px-8 text-center",
    children: [
      /* @__PURE__ */ i("div", { className: "relative mb-10 group", children: [
        /* @__PURE__ */ e("div", { className: "absolute inset-0 bg-[#6fe8ec]/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all" }),
        /* @__PURE__ */ e("div", { className: "relative w-32 h-32 rounded-2xl bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100", children: /* @__PURE__ */ e(Ie, { className: "text-slate-900 w-16 h-16" }) })
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
), ci = [
  "verify:identity",
  "read:profile",
  "read:kyc_level"
], oi = ({
  appName: r = "This App",
  appLogo: a,
  requestedScopes: n,
  onApprove: o,
  onDeny: I,
  language: p = "EN"
}) => {
  const f = n || ci;
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
          f.map((l) => /* @__PURE__ */ i(
            "div",
            {
              className: "flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 transition-all",
              children: [
                /* @__PURE__ */ e("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0", children: /* @__PURE__ */ e(Ie, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ e("p", { className: "text-sm font-medium text-main", children: t(l, p) })
              ]
            },
            l
          ))
        ] }),
        /* @__PURE__ */ i("div", { className: "mt-8 flex gap-3 p-4 rounded-2xl dark:bg-brand/5 bg-brand/5", children: [
          /* @__PURE__ */ e(Ce, { className: "text-brand w-5 h-5 shrink-0" }),
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
              onClick: o,
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
              onClick: I,
              className: "w-full py-3 rounded-2xl bg-transparent dark:hover:bg-slate-100 dark:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all",
              children: t("deny", p)
            }
          )
        ] })
      ]
    }
  );
};
function Je(r = "light") {
  return r === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : r;
}
const Ke = ["AuthSelection", "Login", "PasskeyAuth", "PinVerification", "PasskeyRegister"], li = "https://apis.casperid.com", Ze = {
  requestId: "",
  verificationTier: "layer_3"
}, pi = ({
  isOpen: r,
  apiKey: a,
  theme: n = {},
  requiredTier: o,
  onSuccess: I,
  onClose: p,
  onError: f,
  mode: l = "login",
  previewMode: s = !1,
  initialScreen: c,
  apiBaseUrl: d,
  termsUrl: E = "#",
  privacyUrl: h = "#",
  logoUrl: D,
  language: _ = "EN",
  layout: u,
  platform: N
}) => {
  var Be;
  const [x, v] = y({}), [V, k] = y(!s && !!a), {
    primaryColor: T,
    borderRadius: G,
    fontFamily: Y,
    mode: H = "light",
    layout: b,
    platform: C
  } = n || {}, A = typeof navigator < "u" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), M = T || x.primaryColor || "#8651e1", F = G || x.borderRadius || "12", q = Y || x.fontFamily || "Inter", J = u || b || x.layout || "auto", Q = N || C || x.platform || (A ? "mobile" : "desktop"), [de, ue] = y(Je(H)), [te, ie] = y(
    c ?? (l === "verify" ? "SecurityUpgrade" : "AuthSelection")
  ), [U, fe] = y({ email: "", verificationId: "" }), [Z, me] = y(null), [ee, ne] = y({
    email: "",
    userExists: !1,
    hasPasskey: !1,
    userAccount: null
  }), [$, w] = y(Ze), [L, X] = y(""), [pe, z] = y(""), [O, he] = y(null), W = d || li, le = F.toString().endsWith("px") ? F.toString() : `${F}px`, ge = q.includes(" ") ? `"${q}", sans-serif` : `${q}, sans-serif`, ae = yt.useId().replace(/:/g, ""), ye = {
    "--casperid-primary": M,
    "--casperid-radius": le,
    "--casperid-font": ge
  }, Ee = `${ae}-${M}-${le}-${ge}`, Ae = `
        #casperid-modal-${ae},
        #casperid-modal-${ae} * {
            --casperid-primary: ${M} !important;
            --casperid-radius: ${le} !important;
            --casperid-font: ${ge} !important;
        }
    `;
  oe(() => {
    if (H === "system") {
      const m = window.matchMedia("(prefers-color-scheme: dark)"), g = (S) => ue(S.matches ? "dark" : "light");
      return m.addEventListener("change", g), () => m.removeEventListener("change", g);
    } else
      ue(Je(H));
  }, [H]), oe(() => {
    s && c && ie(c);
  }, [s, c]), oe(() => {
    r && !s && (ie(c ?? (l === "verify" ? "SecurityUpgrade" : "AuthSelection")), fe({ email: "", verificationId: "" }), me(null), ne({ email: "", userExists: !1, hasPasskey: !1, userAccount: null }), w(Ze), X(""), z(""));
  }, [r, l, s, c]), oe(() => {
    if (!a || s) {
      k(!1);
      return;
    }
    (async () => {
      try {
        const g = await fetch(`${W}/api/business/app-metadata/${a}`);
        if (g.ok) {
          const S = await g.json();
          S.success && S.app && (he(S.app), S.app.theme && v({
            primaryColor: S.app.theme.primaryColor,
            borderRadius: S.app.theme.borderRadius,
            fontFamily: S.app.theme.fontFamily,
            layout: S.app.theme.layout,
            platform: S.app.theme.platform
          }));
        }
      } catch (g) {
        console.warn("[CasperID] Failed to fetch app metadata:", g);
      } finally {
        k(!1);
      }
    })();
  }, [a, W, s]);
  const Ue = () => ue((m) => m === "dark" ? "light" : "dark"), R = K((m) => ie(m), []), ze = K(async (m) => {
    try {
      const g = m === "layer_2" ? `${d}/api/v2/verification/layer2/start` : `${d}/api/v2/verification/layer3/start`, S = await fetch(g, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": a
        },
        credentials: "include",
        body: JSON.stringify({
          purpose: "sdk_verification",
          ...m === "layer_3" ? { verificationMethod: "document" } : {}
        })
      });
      if (!S.ok) {
        const se = await S.json().catch(() => ({}));
        throw new Error(se.error || `Request failed with status ${S.status}`);
      }
      const B = await S.json();
      if (B.success && B.verification)
        return w((se) => ({
          ...se,
          requestId: B.verification.requestId,
          verificationTier: m
        })), B.verification.requestId;
      throw new Error(B.error || "Failed to start verification");
    } catch (g) {
      return f == null || f(g instanceof Error ? g : new Error("Failed to start verification")), null;
    }
  }, [d, a, f]), nt = K((m, g, S) => {
    me(m), ne((B) => ({
      ...B,
      sessionToken: m,
      businessToken: S,
      userAccount: g || null
    })), g != null && g.wallet && (g != null && g.did_address) && ee.hasPasskey ? De(g.tier) : R("PasskeyRegister");
  }, [R, ee.hasPasskey]), st = K((m) => {
    ne((g) => ({ ...g, email: m, hasPasskey: !0, userExists: !0 })), R("PasskeyAuth");
  }, [R]), ct = K((m, g, S) => {
    me(m), ne((B) => ({
      ...B,
      sessionToken: m,
      businessToken: S,
      userAccount: g ? {
        user_id: g.user_id,
        wallet: g.wallet,
        tier: g.tier,
        did_address: g.did_address
      } : null
    })), De(g == null ? void 0 : g.tier);
  }, []), ot = K((m, g) => {
    ne((S) => ({
      ...S,
      hasPasskey: !0,
      businessToken: g,
      userAccount: m ? {
        user_id: m.user_id,
        tier: m.tier
      } : S.userAccount
    })), R("MintingIdentity");
  }, [R]), De = K((m) => {
    const g = m || "layer_0", S = o || (O == null ? void 0 : O.required_tier);
    if (!S) {
      R("IdentityVerified");
      return;
    }
    const B = S === "L1" ? "layer_1" : S === "L2" ? "layer_2" : S === "L3" ? "layer_3" : "layer_1", se = ["layer_0", "layer_1", "layer_2", "layer_3"], Re = se.indexOf(g), He = se.indexOf(B);
    Re >= He ? R("IdentityVerified") : He >= 2 ? R("SecurityUpgrade") : R("IdentityVerified");
  }, [o, R]), lt = K(async (m) => {
    var S;
    if (m != null && m.wallet && ne((B) => {
      var se;
      return {
        ...B,
        userAccount: {
          ...B.userAccount,
          user_id: ((se = B.userAccount) == null ? void 0 : se.user_id) || "",
          wallet: m.wallet,
          did_address: m.didAddress,
          tier: "layer_1"
        }
      };
    }), m != null && m.credentialHash && z(m.credentialHash), Z && !s)
      try {
        const B = await fetch(`${W}/api/casperid/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: Z, apiKey: a })
        });
        if (B.ok) {
          const se = await B.json();
          se.success && se.token && (console.log("[CasperID SDK] Token refreshed after verification"), me(se.token), ne((Re) => ({
            ...Re,
            sessionToken: se.token,
            businessToken: se.business_token || Re.businessToken
          })));
        }
      } catch (B) {
        console.warn("[CasperID SDK] Failed to refresh token after verification:", B);
      }
    let g = m != null && m.wallet ? "layer_1" : ((S = ee.userAccount) == null ? void 0 : S.tier) || "layer_1";
    $.livenessVerified && $.verificationTier === "layer_2" ? g = "layer_2" : $.documentType && $.verificationTier === "layer_3" && (g = "layer_3"), De(g);
  }, [(Be = ee.userAccount) == null ? void 0 : Be.tier, De, Z, W, s, $]), dt = K((m) => {
    const g = (m == null ? void 0 : m.sessionToken) || (m == null ? void 0 : m.token), S = (m == null ? void 0 : m.business_token) || (m == null ? void 0 : m.businessToken);
    g && me(g), S && ne((B) => ({ ...B, businessToken: S })), R("SecurityUpgrade");
  }, [R]), ut = K(async () => {
    o === "L3" ? await ze("layer_3") && R("VerifyIdentityChoice") : await ze("layer_2") && R("FaceScan");
  }, [o, ze, R]), mt = K(async (m) => {
    w((g) => ({ ...g, livenessVerified: m })), R("MintingIdentity");
  }, [R]), ft = K((m) => {
    w((g) => ({ ...g, documentType: m })), R("DocumentScan");
  }, [R]), pt = K((m, g, S) => {
    w((B) => ({
      ...B,
      extractedData: m,
      frontImageUrl: S.frontImageUrl,
      frontImageFileId: S.frontImageFileId,
      backImageUrl: S.backImageUrl,
      backImageFileId: S.backImageFileId
    })), X(g), R("ReviewData");
  }, [R]), ht = K((m) => {
    w((g) => ({ ...g, extractedData: m })), R("FaceScan");
  }, [R]);
  K(() => {
    w((m) => ({ ...m, extractedData: void 0 })), X(""), R("DocumentScan");
  }, [R]);
  const bt = K(() => {
    if (!Z) {
      f == null || f(new Error("No valid session token available"));
      return;
    }
    I == null || I(Z, {
      businessToken: ee.businessToken
    }), p == null || p();
  }, [Z, ee.businessToken, I, p, f]), be = K((m) => {
    f == null || f(new Error(m));
  }, [f]), _t = K((m, g) => {
    fe({ email: m, verificationId: g }), ne((S) => ({ ...S, email: m })), R("PinVerification");
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
            onNext: (g) => R(g === "otp" ? "Login" : "SecurityUpgrade"),
            onExtensionSuccess: dt,
            onError: be,
            language: _,
            platform: Q,
            logoUrl: D || (O == null ? void 0 : O.logo_url)
          }
        );
      case "Login":
        return /* @__PURE__ */ e(
          Ot,
          {
            onNext: _t,
            onPasskeyUser: st,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PasskeyAuth":
        return /* @__PURE__ */ e(
          Gt,
          {
            email: ee.email,
            onSuccess: ct,
            onError: be,
            onFallbackToOTP: () => R("Login"),
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PasskeyRegister":
        return /* @__PURE__ */ e(
          Jt,
          {
            email: ee.email || U.email,
            sessionToken: Z || "",
            onSuccess: ot,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "PinVerification":
        return /* @__PURE__ */ e(
          Kt,
          {
            email: U.email,
            verificationId: U.verificationId,
            onNext: nt,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "SecurityUpgrade":
        return /* @__PURE__ */ e(
          Zt,
          {
            onNext: ut,
            onSkip: () => R("IdentityVerified"),
            language: _
          }
        );
      case "FaceScan":
        return /* @__PURE__ */ e(
          Xt,
          {
            requestId: $.requestId,
            onNext: mt,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "VerifyIdentityChoice":
        return /* @__PURE__ */ e(
          ei,
          {
            onNext: ft,
            language: _
          }
        );
      case "DocumentScan":
        return /* @__PURE__ */ e(
          ii,
          {
            requestId: $.requestId,
            documentType: $.documentType,
            onNext: pt,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "ReviewData":
        return /* @__PURE__ */ e(
          ai,
          {
            requestId: $.requestId,
            documentType: $.documentType,
            extractedData: $.extractedData,
            uploadId: L,
            frontImageUrl: $.frontImageUrl,
            frontImageFileId: $.frontImageFileId,
            backImageUrl: $.backImageUrl,
            backImageFileId: $.backImageFileId,
            onNext: ht,
            onRetake: () => R("DocumentScan"),
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "MintingIdentity":
        const m = $.requestId ? $.verificationTier : "layer_1";
        return /* @__PURE__ */ e(
          ni,
          {
            tier: m,
            sessionToken: Z || "",
            requestId: $.requestId,
            onNext: lt,
            onError: be,
            apiBaseUrl: W,
            apiKey: a,
            previewMode: s,
            language: _
          }
        );
      case "IdentityVerified":
        return /* @__PURE__ */ e(si, { onNext: () => R("PermissionsRequest"), language: _ });
      case "PermissionsRequest":
        return /* @__PURE__ */ e(
          oi,
          {
            onApprove: bt,
            onDeny: () => p == null ? void 0 : p(),
            language: _,
            appName: O == null ? void 0 : O.name,
            appLogo: D || (O == null ? void 0 : O.logo_url),
            requestedScopes: O == null ? void 0 : O.requested_scopes
          }
        );
      default:
        return null;
    }
  };
  return s ? /* @__PURE__ */ i(re, { children: [
    /* @__PURE__ */ e("style", { children: Ae }, Ee),
    /* @__PURE__ */ e("div", { id: `casperid-modal-${ae}`, style: ye, className: `relative ${de}`, children: /* @__PURE__ */ i(We, { className: "backdrop-blur-3xl", theme: de, children: [
      te !== "FaceScan" && /* @__PURE__ */ e(
        Ye,
        {
          onClose: p,
          showClose: te !== "AuthSelection",
          subtitle: te === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
          theme: de,
          toggleTheme: Ue
        }
      ),
      /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Le, { mode: "wait", children: /* @__PURE__ */ e(P.div, { className: "flex-1 flex flex-col", children: $e() }, te) }) }),
      Ke.includes(te) && /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ i("p", { className: "text-[11px] text-slate-500 font-medium", children: [
        "By connecting, you agree to our",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: E, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
        " ",
        "&",
        " ",
        /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: h, target: "_blank", rel: "noopener noreferrer", children: "Privacy Policy" })
      ] }) })
    ] }) })
  ] }) : /* @__PURE__ */ i(re, { children: [
    /* @__PURE__ */ e("style", { children: Ae }, Ee),
    /* @__PURE__ */ i(
      "div",
      {
        className: `fixed inset-0 z-[9999] flex items-center justify-center ${J === "fullscreen" ? "p-0" : "p-4"}`,
        style: { backgroundColor: J === "fullscreen" ? "transparent" : "rgba(0,0,0,0.6)", backdropFilter: J === "fullscreen" ? "none" : "blur(6px)" },
        onClick: (m) => m.target === m.currentTarget && (p == null ? void 0 : p()),
        children: [
          J !== "fullscreen" && /* @__PURE__ */ i("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: "absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]",
                style: { backgroundColor: `${M}1a` }
              }
            ),
            /* @__PURE__ */ e("div", { className: "absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" })
          ] }),
          /* @__PURE__ */ e(
            P.div,
            {
              id: `casperid-modal-${ae}`,
              initial: J === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: J === "fullscreen" ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              style: ye,
              className: `relative selection:bg-brand/30 ${de} ${J === "fullscreen" ? "w-full h-full" : Q === "mobile" ? "w-full max-w-md h-[90vh] max-h-[800px]" : "w-full max-w-xl h-[85vh] max-h-[900px]"}`,
              children: /* @__PURE__ */ i(We, { className: `backdrop-blur-3xl ${J === "fullscreen" ? "w-full h-full rounded-none" : ""}`, theme: de, children: [
                te !== "FaceScan" && /* @__PURE__ */ e(
                  Ye,
                  {
                    onClose: p,
                    showClose: te !== "AuthSelection",
                    subtitle: te === "PermissionsRequest" ? "PERMISSION REQUEST" : "SECURE SDK",
                    theme: de,
                    toggleTheme: Ue
                  }
                ),
                /* @__PURE__ */ e("div", { className: "flex-1 flex flex-col relative overflow-hidden", children: /* @__PURE__ */ e(Le, { mode: "wait", children: /* @__PURE__ */ e(P.div, { className: "flex-1 flex flex-col", children: $e() }, te) }) }),
                Ke.includes(te) && /* @__PURE__ */ e(Ge, { children: /* @__PURE__ */ i("p", { className: "text-[11px] text-slate-500 font-medium", children: [
                  "By connecting, you agree to our",
                  " ",
                  /* @__PURE__ */ e("a", { className: "text-brand hover:underline ml-1", href: E, target: "_blank", rel: "noopener noreferrer", children: "Terms of Service" }),
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
async function hi(r, a = {}, n = 3e4) {
  const o = new AbortController(), I = setTimeout(() => o.abort(), n);
  try {
    return await fetch(r, {
      ...a,
      signal: o.signal
    });
  } finally {
    clearTimeout(I);
  }
}
class di extends Error {
  constructor(a, n) {
    super(a), this.name = "ApiError", this.status = n;
  }
}
async function bi(r) {
  if (!r.ok) {
    const a = await r.json().catch(() => ({}));
    throw new di(
      a.error || a.message || `Request failed with status ${r.status}`,
      r.status
    );
  }
  return r.json();
}
export {
  di as ApiError,
  Mt as AuthSelectionScreen,
  pi as CasperIDModal,
  ii as DocumentScanScreen,
  Xt as FaceScanScreen,
  Ge as Footer,
  We as GlassContainer,
  Ye as Header,
  si as IdentityVerifiedScreen,
  Ot as LoginScreen,
  ni as MintingIdentityScreen,
  oi as PermissionsRequestScreen,
  Kt as PinVerificationScreen,
  ai as ReviewDataScreen,
  Zt as SecurityUpgradeScreen,
  ei as VerifyIdentityChoiceScreen,
  pi as default,
  hi as fetchWithTimeout,
  bi as handleApiResponse
};
//# sourceMappingURL=index.mjs.map
