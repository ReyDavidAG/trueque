import { art, qr } from "../art.js";
import * as store from "../store.js";
import { esc, icon, placeName, shortDate, stagger } from "../ui.js";

const STATUS = { valid: ["Vigente", "is-live"], used: ["Usado", "is-used"], expired: ["Venció", "is-rejected"] };

function card(c, i) {
  const p = store.productById(c.productId);
  const [label, cls] = STATUS[c.status];
  const note = c.status === "used" ? `Canjeado el ${shortDate(c.usedOn)}` : c.status === "expired" ? `Venció el ${shortDate(c.validUntil)}` : `Vale hasta ${shortDate(c.validUntil)}`;
  return `<li class="ticket animate-tile-in${c.status !== "valid" ? " is-off" : ""}" data-stall="${p.stall}" style="${stagger(i)}">
    <div class="ticket__art">${art(p.art, "")}</div>
    <div class="ticket__body">
      <span class="pill ${cls}">${label}</span>
      <h2 class="h4">${esc(p.name)}</h2>
      <p class="muted small">${note} · ${esc(placeName(p.place))}</p>
      ${c.status === "valid" ? `<details class="ticket__qr"><summary>${icon("ticket")}Mostrar código</summary>${qr(c.code)}<span class="num">${c.code}</span></details>` : ""}
    </div>
    <span class="ticket__folio num">${c.folio}</span>
  </li>`;
}

export default {
  title: "Mis cupones",
  render() {
    const list = store.coupons();
    const valid = list.filter((c) => c.status === "valid");
    const past = list.filter((c) => c.status !== "valid");
    return `<div class="wrap narrow">
      <header class="page-head">
        <h1 class="h1">Mis cupones</h1>
        <p class="lede">Los mismos que ves en la app de RH. Enséñalos donde se canjean.</p>
      </header>
      ${valid.length
        ? `<ul class="tickets" role="list">${valid.map(card).join("")}</ul>`
        : `<div class="empty"><div class="empty__art">${art("ticket", "")}</div><p class="h3">Todavía no tienes cupones vigentes</p><p class="muted">Cuando hagas un trueque, aquí aparece tu cupón con su código.</p><a class="btn btn--grana" href="#/">Ver el mercado</a></div>`}
      <section class="section">
        <div class="section__head"><h2 class="h3">Usados y vencidos</h2></div>
        <ul class="tickets" role="list">${past.map(card).join("")}</ul>
      </section>
      <p class="demo-note">${icon("info")}Cupones de ejemplo.</p>
    </div>`;
  },
};
