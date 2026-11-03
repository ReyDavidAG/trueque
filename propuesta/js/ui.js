import { art, bean } from "./art.js";
import { companies } from "./data.js";
import * as store from "./store.js";

const paths = {
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3M9 20v-5h6v5"/>',
  spark: '<path d="M12 2C12.7 8 16 11.3 22 12C16 12.7 12.7 16 12 22C11.3 16 8 12.7 2 12C8 11.3 11.3 8 12 2Z"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.6 4.5L21 15M21 20v-5h-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10"/>',
  wifiOff: '<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.2-2.5M12 20h.01M15.5 10.6A10 10 0 0 1 19 12.9M2 9a15 15 0 0 1 4.4-2.7M10.6 5.1A15 15 0 0 1 22 9"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0zM8 21h8"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.5a6 6 0 1 1-6 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.4.6 4 2.8 4 6"/>',
};

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] ?? ""}</svg>`;

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

export const plural = (n, one, many) => `${n.toLocaleString("es-MX")} ${n === 1 ? one : many}`;
export const cacaos = (n) => plural(n, "cacao", "cacaos");
export const money = (n) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: n % 1 ? 2 : 0 });

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const shortDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const companyName = (id) => companies.find((c) => c.id === id)?.name ?? "";
export const placeName = (id) => store.locationById(id)?.name ?? "";

export const stagger = (i) => `--i:${Math.min(i, 12)}`;

export function priceSign(price, cls = "") {
  return `<span class="sign ${cls}"><span class="sign__string" aria-hidden="true"></span><span class="sign__board">${bean("sign__bean")}<span class="sign__n num">${price}</span><span class="sign__unit">${price === 1 ? "cacao" : "cacaos"}</span></span></span>`;
}

export function reach(p, bal = store.balance()) {
  const left = store.stockLeft(p);
  if (left === 0) return `<span class="reach is-out">Agotado</span>`;
  if (bal >= p.price) return `<span class="reach is-ok">${icon("check")}Te alcanza</span>`;
  return `<span class="reach is-short">Te faltan ${cacaos(p.price - bal)}</span>`;
}

export function cover(p, label = "", cls = "", pics = store.images(p.id)) {
  const [first] = pics;
  return first
    ? `<img class="cover ${cls}" src="${first}" alt="${esc(label)}" loading="lazy" decoding="async">`
    : art(p.art, label);
}

export function stall(p, i = 0, pics = store.images(p.id)) {
  const left = store.stockLeft(p);
  const photo = pics.length > 0;
  return `<article class="stall animate-tile-in${photo ? " has-photo" : ""}" data-stall="${p.stall}" style="${stagger(i)}">
    <div class="stall__awning" aria-hidden="true"></div>
    <a class="stall__link" href="#/products/${p.id}">
      <div class="stall__art">${cover(p, "", "stall__photo", pics)}</div>
      ${priceSign(p.price, "stall__sign")}
      <div class="stall__body">
        ${p.fromCustodia ? `<span class="badge badge--custodia">${icon("laptop")}De Custodia</span>` : ""}
        <h3 class="stall__name">${esc(p.name)}</h3>
        <p class="stall__blurb">${esc(p.blurb)}</p>
        <p class="stall__by">${icon("building")}${esc(companyName(p.company))}</p>
        <div class="stall__foot">
          ${reach(p)}
          <span class="stall__meta">${left == null ? "Sin límite" : left === 0 ? "" : `Quedan ${left}`}</span>
        </div>
      </div>
    </a>
  </article>`;
}

export function toast(message, tone = "") {
  const host = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = `toast${tone ? ` is-${tone}` : ""}`;
  el.textContent = message;
  host.append(el);
  setTimeout(() => el.classList.add("is-leaving"), 2600);
  setTimeout(() => el.remove(), 3000);
}

export const demoNote = (text) => `<p class="demo-note">${icon("info")}${text}</p>`;

export function fieldHelp(id, text, error = "") {
  return `<p class="field__help${error ? " is-error" : ""}" id="${id}-help" data-help-for="${id}" data-default="${esc(text)}">${esc(error || text)}</p>`;
}

export function setError(root, id, message) {
  const help = root.querySelector(`[data-help-for="${id}"]`);
  const input = root.querySelector(`#${id}`);
  if (help) {
    help.textContent = message || help.dataset.default;
    help.classList.toggle("is-error", !!message);
  }
  if (input) {
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) {
      input.classList.remove("animate-nudge");
      void input.offsetWidth;
      input.classList.add("animate-nudge");
    }
  }
  return !message;
}
