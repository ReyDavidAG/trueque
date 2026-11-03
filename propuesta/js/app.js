import { art, bean, wordmark } from "./art.js";
import { APP_VERSION, roleNames } from "./data.js";
import * as store from "./store.js";
import { companyName, esc, icon, shortDate, toast } from "./ui.js";
import company from "./views/company.js";
import dashboard from "./views/dashboard.js";
import productForm from "./views/product_form.js";
import redeem from "./views/redeem.js";
import review from "./views/review.js";
import settings from "./views/settings.js";
import coupons from "./views/coupons.js";
import earn from "./views/earn.js";
import market from "./views/market.js";
import product from "./views/product.js";
import signIn, { initials } from "./views/sign_in.js";
import trade from "./views/trade.js";
import wallet from "./views/wallet.js";

const routes = [
  { pattern: /^\/sign-in$/, view: signIn, public: true },
  { pattern: /^\/$/, view: market, nav: "market" },
  { pattern: /^\/wallet$/, view: wallet, nav: "wallet" },
  { pattern: /^\/coupons$/, view: coupons, nav: "coupons" },
  { pattern: /^\/products\/([\w-]+)$/, view: product, nav: "market" },
  { pattern: /^\/trade\/([\w-]+)$/, view: trade, nav: "market" },
  { pattern: /^\/earn$/, view: earn, nav: "earn" },
  { pattern: /^\/panel$/, view: { title: "Panel", render: (...a) => (store.role() === "hr" ? review : company).render(...a), bind: (...a) => (store.role() === "hr" ? review : company).bind?.(...a) }, nav: "panel", roles: ["company", "hr"] },
  { pattern: /^\/panel\/new$/, view: productForm, nav: "panel", roles: ["company"] },
  { pattern: /^\/panel\/edit\/([\w-]+)$/, view: productForm, nav: "panel", roles: ["company"] },
  { pattern: /^\/redeem$/, view: redeem, nav: "redeem", roles: ["company"] },
  { pattern: /^\/dashboard$/, view: dashboard, nav: "dashboard", roles: ["hr"] },
  { pattern: /^\/settings$/, view: settings, nav: "settings", roles: ["hr"] },
];

const app = document.getElementById("app");

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export const go = (path) => (location.hash = `#${path}`);

const NAV = {
  market: { href: "#/", label: "El mercado", icon: "store" },
  coupons: { href: "#/coupons", label: "Mis cupones", icon: "ticket" },
  earn: { href: "#/earn", label: "Cómo gano", icon: "spark" },
  panel: { href: "#/panel", label: "Mi puesto", icon: "building" },
  redeem: { href: "#/redeem", label: "Canjear", icon: "scan" },
  review: { href: "#/panel", label: "Aprobar", icon: "scale", id: "panel" },
  dashboard: { href: "#/dashboard", label: "Tablero", icon: "chart" },
  settings: { href: "#/settings", label: "Ajustes", icon: "settings" },
};
const NAV_BY_ROLE = {
  member: ["market", "coupons", "earn"],
  company: ["market", "panel", "redeem", "coupons"],
  hr: ["market", "review", "dashboard", "settings"],
};
const items = (role) => NAV_BY_ROLE[role].map((k) => ({ id: NAV[k].id ?? k, ...NAV[k] }));

const NOTE_ICON = { earn: "spark", expire: "clock", coupon: "ticket", review: "scale", rejected: "info", budget: "coins", custodia: "laptop" };

function notesPanel(role) {
  const list = store.notifications(role);
  return `<div class="menu notes" id="notes" hidden>
    <div class="notes__head"><b>Avisos</b>${list.some((n) => !n.read) ? `<button class="link-btn" type="button" data-action="read-all">Marcar como leídos</button>` : ""}</div>
    <ul class="notes__list" role="list">${list.map((n) => `<li class="note${n.read ? "" : " is-new"}"><a href="${n.href}" data-action="note">${icon(NOTE_ICON[n.kind] ?? "info")}<span>${esc(n.text)}<small>${shortDate(n.date)}</small></span></a></li>`).join("")}</ul>
  </div>`;
}

function menu(role) {
  const who = store.session();
  return `<div class="menu" id="menu" hidden>
    <div class="menu__head"><span class="who__avatar is-sm" aria-hidden="true">${esc(initials(who.name))}</span><span><strong>${esc(who.name)}</strong><small>No. <span class="num">${esc(who.number)}</span> · ${esc(companyName(who.company))}</small></span></div>
    <a class="menu-item" href="#/wallet">${icon("store")}Mi jícara</a>
    <fieldset class="menu__roles"><legend>Ver la demo como</legend>
      ${Object.entries(roleNames).map(([id, n]) => `<label class="role-option"><input type="radio" name="demo-role" value="${id}"${id === role ? " checked" : ""}><span>${n}</span></label>`).join("")}
    </fieldset>
    <label class="menu-item menu-item--toggle"><span>${icon("wifiOff")}Simular sin conexión</span><input type="checkbox" name="demo-offline"${store.offline() ? " checked" : ""}></label>
    <button class="menu-item" type="button" data-action="reset">${icon("refresh")}Reiniciar datos de ejemplo</button>
    <button class="menu-item" type="button" data-action="sign-out">${icon("logout")}Salir</button>
    <p class="menu__version">El Trueque <span class="num">v${APP_VERSION}</span> · propuesta</p>
  </div>`;
}

function bell(role) {
  const unread = store.notifications(role).filter((n) => !n.read).length;
  return `<button class="bell" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="notes" data-action="notes" aria-label="Avisos${unread ? `, ${unread} sin leer` : ""}">${icon("bell")}${unread ? `<span class="bell__n num" aria-hidden="true">${unread}</span>` : ""}</button>
    ${notesPanel(role)}`;
}

function shell(route, content) {
  const role = store.role();
  const nav = items(role);
  const bal = store.balance();
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="topbar__brand" href="#/" aria-label="El Trueque, el mercado">${wordmark()}</a>
      <span class="version-tag num" title="Versión de la propuesta">v${APP_VERSION}</span>
      <nav class="topnav" aria-label="Principal">${nav.map((i) => `<a class="topnav__link" href="${i.href}"${i.id === route.nav ? ' aria-current="page"' : ""}>${i.label}</a>`).join("")}</nav>
      <div class="topbar__actions">
        ${bell(role)}
        <a class="purse-chip" href="#/wallet" aria-label="Tienes ${bal} cacaos">${bean("purse-chip__bean")}<b class="num">${bal}</b><span class="purse-chip__unit">cacaos</span></a>
        <button class="role-chip" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="menu" data-action="menu">${icon("eye", "role-chip__icon")}<span class="role-chip__label"><span class="sr-only">Ver la demo como </span>${roleNames[role]}</span>${icon("chevronDown")}</button>
        ${menu(role)}
      </div>
    </div>
  </header>
  <div class="demo-ribbon" role="note">${icon("info")}<span>Demo con datos de ejemplo · viendo como <strong>${roleNames[role]}</strong></span></div>
  <main id="main" class="page" tabindex="-1"><div class="animate-page-in">${content}</div></main>
  <nav class="tabbar" aria-label="Principal">${nav.map((i) => `<a class="tabbar__item" href="${i.href}"${i.id === route.nav ? ' aria-current="page"' : ""}>${icon(i.icon)}<span>${i.label}</span></a>`).join("")}</nav>`;
}

const notFound = () => `<div class="wrap narrow"><div class="empty empty--error">
  <div class="empty__art">${art("closed", "")}</div>
  <p class="kicker">Error 404</p>
  <h1 class="h2">Este puesto no existe</h1>
  <p class="muted">Puede que la liga esté incompleta o que el producto ya no se ofrezca.</p>
  <a class="btn btn--grana" href="#/">Volver al mercado</a>
</div></div>`;

function countUp(root) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      el.textContent = Math.round(to * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function render() {
  const { path, query } = parseHash();
  const match = routes.map((r) => ({ r, m: path.match(r.pattern) })).find((x) => x.m);
  const who = store.session();
  if (!who && !match?.r.public) return go("/sign-in");
  if (who && match?.r.public) return go("/");
  if (match?.r.public) {
    app.innerHTML = match.r.view.render([], query);
    document.title = `${match.r.view.title} · El Trueque`;
    match.r.view.bind?.(app, [], query, go, render);
    return;
  }
  if (!match) {
    app.innerHTML = shell({ nav: "" }, notFound());
    document.title = `No encontrado · El Trueque`;
    return;
  }
  const { r, m } = match;
  if (r.roles && !r.roles.includes(store.role())) return go("/");
  const params = m.slice(1);
  const html = r.view.render(params, query);
  app.innerHTML = shell(r, html ?? notFound());
  document.title = `${typeof r.view.title === "function" ? r.view.title(params) : r.view.title} · El Trueque`;
  if (html) r.view.bind?.(app.querySelector("#main"), params, query, go, render);
  window.scrollTo(0, 0);
  countUp(app);
  document.getElementById("main")?.focus({ preventScroll: true });
}

function closeMenu() {
  for (const [id, action] of [["menu", "menu"], ["notes", "notes"]]) {
    const m = document.getElementById(id);
    if (m && !m.hidden) {
      m.hidden = true;
      document.querySelector(`[data-action="${action}"]`)?.setAttribute("aria-expanded", "false");
    }
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]")?.dataset.action;
  if (a === "notes") {
    const n = document.getElementById("notes");
    const opening = n.hidden;
    closeMenu();
    n.hidden = !opening;
    e.target.closest("button").setAttribute("aria-expanded", String(opening));
    return;
  }
  if (a === "read-all") {
    store.markAllRead(store.role());
    render();
    document.getElementById("notes").hidden = false;
    return;
  }
  if (a === "note") {
    store.markAllRead(store.role());
    closeMenu();
    return;
  }
  if (a === "menu") {
    document.getElementById("notes").hidden = true;
    const m = document.getElementById("menu");
    m.hidden = !m.hidden;
    e.target.closest("button").setAttribute("aria-expanded", String(!m.hidden));
    if (!m.hidden) m.querySelector("input:checked")?.focus();
    return;
  }
  if (a === "sign-out") {
    store.signOut();
    toast("Saliste de El Trueque");
    return go("/sign-in");
  }
  if (a === "reset") {
    store.reset();
    closeMenu();
    render();
    return toast("Datos de ejemplo reiniciados");
  }
  if (!e.target.closest(".menu, .notes")) closeMenu();
});

document.addEventListener("change", (e) => {
  if (e.target.name === "demo-offline") {
    store.setOffline(e.target.checked);
    toast(e.target.checked ? "Simulando sin conexión: recarga el mercado" : "Conexión de vuelta");
    if (parseHash().path === "/") render();
    return;
  }
  if (e.target.name === "demo-role") {
    store.setRole(e.target.value);
    toast(`Ahora ves la demo como ${roleNames[e.target.value]}`);
    render();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

window.addEventListener("hashchange", render);
setTimeout(() => {
  document.getElementById("boot")?.remove();
  render();
}, 700);
