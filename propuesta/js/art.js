import { ART, ART_GROUPS, SYSTEM_ART } from "./art_catalog.js";

const wrap = (body, label) =>
  `<svg class="art" viewBox="0 0 240 180" role="img" aria-label="${label}" focusable="false">
    <ellipse class="a-halo" cx="120" cy="96" rx="92" ry="70"/>
    <g class="a-shift">${body}</g>
    <g>${body}</g>
  </svg>`;

const byId = new Map(ART.map((a) => [a.id, a]));

export const artCatalog = () => ART;
export const artGroups = () => ART_GROUPS.map((g) => ({ ...g, items: ART.filter((a) => a.group === g.id) }));
export const artLabel = (id) => byId.get(id)?.label ?? "";
export const art = (id, label = "") => wrap(byId.get(id)?.draw ?? SYSTEM_ART[id] ?? byId.get("ticket").draw, label);

export const marketScene = () => `<svg class="scene" viewBox="0 0 480 300" role="img" aria-label="Tres puestos de mercado con sus precios en cacaos" focusable="false">
  <ellipse class="a-shadow" cx="240" cy="284" rx="230" ry="12"/>
  ${[["grana", 20], ["anil", 170], ["achiote", 320]].map(([c, x], i) => `
  <g class="scene__stall" data-stall="${c}" style="--i:${i}">
    <path class="a-cacao ln" d="M${x + 12} 120v160M${x + 128} 120v160"/>
    <path class="scene__awning ln" d="M${x} 70h140v42c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12c0 8-6 12-14 12s-14-4-14-12z"/>
    <path class="a-estraza" d="M${x + 28} 72h28v40h-28zM${x + 84} 72h28v40h-28z" opacity=".85"/>
    <rect class="a-estraza ln" x="${x + 6}" y="200" width="128" height="80" rx="4"/>
    <path class="ln" d="M${x + 6} 220h128"/>
    <g transform="rotate(${i === 1 ? 5 : -5} ${x + 70} 150)">
      <path class="ln" d="M${x + 50} 140l20-18 20 18"/>
      <rect class="scene__sign ln" x="${x + 34}" y="138" width="72" height="40" rx="6"/>
      <text class="sign-text sign-text--light" x="${x + 70}" y="166" text-anchor="middle">${[25, 60, 180][i]}</text>
    </g>
  </g>`).join("")}
  <g class="a-maiz ln"><circle cx="96" cy="236" r="12"/><circle cx="118" cy="244" r="12"/><circle cx="252" cy="240" r="12"/><circle cx="398" cy="238" r="12"/><circle cx="420" cy="246" r="12"/></g>
</svg>`;


const POD = `<path class="pod__body" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__rib" d="M207 92c-24 52-30 108-30 166s6 116 30 166c-24-14-65-80-65-166s41-148 65-166zM305 92c24 52 30 108 30 166s-6 116-30 166c24-14 65-80 65-166s-41-148-65-166zM256 70c-14 56-18 120-18 188s4 132 18 188c14-56 18-120 18-188s-4-132-18-188z"/><path class="pod__line" d="M256 62c78 30 114 116 114 196 0 84-38 152-98 186l-16 30-16-30c-60-34-98-102-98-186 0-80 36-166 114-196z"/><path class="pod__stem" d="M256 62c2-20 10-34 24-42"/>`;

export const bean = (cls = "") =>
  `<svg class="coin ${cls}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><circle class="coin__rim" cx="256" cy="256" r="246"/><circle class="coin__face" cx="256" cy="256" r="224"/><circle class="coin__ring" cx="256" cy="256" r="200"/><g transform="translate(256 262) rotate(-32) scale(.84) translate(-256 -256)">${POD}</g></svg>`;

export const mark = (cls = "") =>
  `<svg class="mark ${cls}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path class="mark__string" d="M146 190L256 66l110 124"/><circle class="mark__nail" cx="256" cy="60" r="26"/><g transform="rotate(-6 256 330)"><rect class="mark__board" x="44" y="186" width="424" height="290" rx="46"/><g transform="translate(256 331) rotate(-58) scale(.58) translate(-256 -256)">${POD}</g></g></svg>`;

export const wordmark = () =>
  `<span class="wordmark" role="img" aria-label="El Trueque">${mark()}<span aria-hidden="true"><small>El</small>Trueque</span></span>`;

export function qr(code) {
  let h = 2166136261;
  for (const ch of code) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const n = 21;
  const cells = [];
  const finder = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue;
      h = Math.imul(h ^ (x * 31 + y), 16777619);
      if ((h >>> 7) & 1) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  const eye = (x, y) => `<path d="M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z" fill-rule="evenodd"/><path d="M${x + 2} ${y + 2}h3v3h-3z"/>`;
  return `<svg class="qr" viewBox="-1 -1 23 23" role="img" aria-label="Código QR de ejemplo"><rect x="-1" y="-1" width="23" height="23" class="qr__bg"/>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}<path d="${cells.join("")}"/></svg>`;
}
