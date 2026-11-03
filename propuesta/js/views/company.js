import { art, bean } from "../art.js";
import { custodiaQueue } from "../data.js";
import * as store from "../store.js";
import { cacaos, companyName, cover, esc, icon, money, stagger, toast } from "../ui.js";

const STATUS = {
  live: ["Publicado", "is-live"],
  pending: ["Esperando a RH", "is-pending"],
  paused: ["Pausado", "is-paused"],
  rejected: ["Rechazado", "is-rejected"],
  retired: ["Retirado", "is-used"],
};

let confirming = null;

function budgetCard(company) {
  const b = store.budgetOf(company);
  const free = Math.max(0, b.assigned - b.committed - b.redeemed);
  const pct = (n) => `${Math.min(100, (n / b.assigned) * 100).toFixed(1)}%`;
  return `<section class="budget">
    <div class="budget__head">
      <h2 class="h4">Presupuesto ${b.period}</h2>
      <span class="tag-example">Ejemplo</span>
    </div>
    <p class="budget__total"><b class="num">${money(free)}</b> libres de ${money(b.assigned)}</p>
    <div class="budget__bar" role="img" aria-label="Canjeado ${money(b.redeemed)}, en cupones vigentes ${money(b.committed)}, libre ${money(free)} de ${money(b.assigned)}">
      <span class="is-redeemed" style="width:${pct(b.redeemed)}"></span>
      <span class="is-committed" style="width:${pct(b.committed)}"></span>
    </div>
    <dl class="budget__legend">
      <div><dt><i class="is-redeemed"></i>Canjeado</dt><dd class="num">${money(b.redeemed)}</dd></div>
      <div><dt><i class="is-committed"></i>En cupones vigentes</dt><dd class="num">${money(b.committed)}</dd></div>
      <div><dt><i></i>Libre</dt><dd class="num">${money(free)}</dd></div>
    </dl>
    <p class="budget__note">${icon("info")}Cada canje de tus productos se descuenta con su costo real en pesos.</p>
  </section>`;
}

function actions(p) {
  if (confirming === p.id)
    return `<span class="row__confirm" role="group" aria-label="Confirmar retiro">¿Retirarlo del mercado?
      <button class="btn btn--sm btn--grana" type="button" data-act="retire" data-id="${p.id}">Sí, retirar</button>
      <button class="btn btn--sm btn--ghost" type="button" data-act="cancel">No</button></span>`;
  const btn = (act, ic, label) => `<button class="btn btn--sm btn--ghost" type="button" data-act="${act}" data-id="${p.id}">${icon(ic)}<span>${label}</span></button>`;
  const out = [`<a class="btn btn--sm btn--ghost" href="#/panel/edit/${p.id}">${icon("edit")}<span>Editar</span></a>`];
  if (p.status === "live") out.push(btn("pause", "pause", "Pausar"));
  if (p.status === "paused") out.push(btn("resume", "play", "Reanudar"));
  if (p.status !== "retired") out.push(btn("ask-retire", "trash", "Retirar"));
  return out.join("");
}

function myProducts(company) {
  const list = store.productsOf(company);
  if (!list.length) return `<div class="empty"><p class="h3">Todavía no ofreces nada</p><p class="muted">Publica tu primer producto: RH revisa el precio y en cuanto lo apruebe aparece en el mercado.</p><a class="btn btn--grana" href="#/panel/new">${icon("plus")}Publicar producto</a></div>`;
  return `<ul class="prows" role="list">
    ${list.map((p, i) => {
      const [label, cls] = STATUS[p.status];
      const review = store.reviewOf(p.id);
      return `<li class="prow animate-row-in" data-stall="${p.stall}" style="${stagger(i)}">
        <span class="prow__art">${cover(p)}</span>
        <span class="prow__main">
          <b>${esc(p.name)}</b>
          <span class="prow__meta"><span class="num">${bean()}${p.price}</span> · costo ${money(p.cost)} · ${p.stock == null ? "sin límite" : `${store.stockLeft(p)} en existencia`}</span>
          ${review?.reason ? `<span class="prow__reason">${icon("info")}RH: ${esc(review.reason)}</span>` : ""}
        </span>
        <span class="pill ${cls}">${label}</span>
        <span class="prow__actions">${actions(p)}</span>
      </li>`;
    }).join("")}
  </ul>`;
}

function fromCustodia() {
  return `<section class="section">
    <div class="section__head"><h2 class="h3">Llegan de Custodia</h2><p class="muted">Equipo dado de baja que todavía sirve. A tu empresa le cuesta $0.</p></div>
    <div class="custodia-list">
      ${custodiaQueue.map((c, i) => {
        const ready = c.it && c.accounting;
        const done = store.custodiaState(c.folio);
        return `<article class="custodia-card animate-tile-in" style="${stagger(i)}">
          <div class="custodia-card__art" data-stall="cacao">${art(c.art, "")}</div>
          <header><span class="num folio">${c.folio}</span><h3 class="h4">${esc(c.name)}</h3><span class="muted small">Equipo de ${c.year}</span></header>
          <ul class="checks" role="list">
            <li class="${c.it ? "is-ok" : ""}">${icon(c.it ? "check" : "clock")}IT: revisado y datos borrados</li>
            <li class="${c.accounting ? "is-ok" : ""}">${icon(c.accounting ? "check" : "clock")}Contabilidad: ${c.accounting ? "baja del activo hecha" : "falta la baja del activo"}</li>
          </ul>
          ${done
            ? `<p class="pill is-pending">Esperando a RH</p>`
            : `<button class="btn ${ready ? "btn--grana" : ""} btn--block" type="button" data-act="custodia" data-id="${c.folio}"${ready ? "" : " disabled"}>${ready ? `Postular por ${cacaos(c.suggested)}` : "Falta contabilidad"}</button>`}
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

export default {
  title: "Mi puesto",
  render() {
    const company = store.session().company;
    return `<div class="wrap">
      <header class="page-head page-head--row">
        <div><p class="kicker">${esc(companyName(company))}</p><h1 class="h1">Tu puesto en El Trueque</h1><p class="lede">Lo que ofreces a tu gente y cuánto del presupuesto se ha usado.</p></div>
        <div class="page-head__actions">
          <a class="btn btn--ghost" href="#/redeem">${icon("scan")}Canjear cupón</a>
          <a class="btn btn--grana" href="#/panel/new">${icon("plus")}Publicar producto</a>
        </div>
      </header>
      ${budgetCard(company)}
      <section class="section">
        <div class="section__head"><h2 class="h3">Tus productos</h2><p class="muted">Si cambias el precio o el costo, vuelve a pasar por RH.</p></div>
        ${myProducts(company)}
      </section>
      ${fromCustodia()}
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const { act, id } = b.dataset;
      if (act === "ask-retire") confirming = id;
      if (act === "cancel") confirming = null;
      if (act === "pause") {
        store.setProductStatus(id, "paused");
        toast("Pausado: ya no se ve en el mercado");
      }
      if (act === "resume") {
        store.setProductStatus(id, "live");
        toast("De vuelta en el mercado");
      }
      if (act === "retire") {
        confirming = null;
        store.setProductStatus(id, "retired");
        toast("Retirado. Los cupones ya emitidos siguen valiendo");
      }
      if (act === "custodia") {
        store.postCustodia(id);
        toast("Mandado a RH para revisar el precio");
      }
      rerender();
    });
  },
};
