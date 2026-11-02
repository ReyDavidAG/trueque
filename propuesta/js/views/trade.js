import { art, bean, qr } from "../art.js";
import * as store from "../store.js";
import { cacaos, companyName, esc, icon, placeName, shortDate } from "../ui.js";

function review(p) {
  const bal = store.balance();
  return `<div class="wrap narrow">
    <a class="back-link" href="#/products/${p.id}">${icon("arrowLeft")}${esc(p.name)}</a>
    <section class="confirm" data-stall="${p.stall}">
      <div class="confirm__art">${art(p.art, "")}</div>
      <h1 class="h2">¿Hacemos el trueque?</h1>
      <div class="confirm__math">
        <div><span>Tienes</span><b class="num">${bal}</b></div>
        <div class="is-minus"><span>Cuesta</span><b class="num">− ${p.price}</b></div>
        <div class="is-total"><span>Te quedan</span><b class="num">${bal - p.price}</b></div>
      </div>
      <p class="muted small">Al confirmar se descuentan los cacaos y se emite tu cupón. Vale ${p.couponDays} días. Se canjea en: ${esc(placeName(p.place))}.</p>
      <div class="confirm__actions">
        <a class="btn btn--ghost" href="#/products/${p.id}">Ahora no</a>
        <button class="btn btn--grana btn--lg" type="button" data-confirm>${bean("btn__bean")}Confirmar trueque</button>
      </div>
    </section>
  </div>`;
}

function receipt(p, o) {
  const rows = [
    ["Producto", esc(p.name)],
    ["Lo ofrece", esc(companyName(p.company))],
    ["Fecha", shortDate(o.date)],
    ["Tenías", cacaos(o.before)],
    ["Trueque", `− ${cacaos(o.price)}`],
  ];
  return `<div class="wrap narrow">
    <div class="done-head animate-page-in">
      <span class="done-head__mark">${icon("check")}</span>
      <h1 class="h2">¡Trato hecho!</h1>
      <p class="lede">Tu cupón ya está listo. Te quedan ${cacaos(o.after)}.</p>
    </div>
    <section class="receipt" aria-label="Recibo">
      <header class="receipt__head"><span class="receipt__brand">El Trueque</span><span class="num">${o.folio}</span></header>
      <dl class="receipt__rows">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="receipt__total"><span>Te quedan</span><b class="num">${cacaos(o.after)}</b></div>
      <details class="receipt__lots">
        <summary>Qué cacaos se usaron</summary>
        <ul role="list">${o.used.map((u) => `<li><span class="num">${u.n}</span> ${esc(u.source)} <span class="muted">· vencían ${shortDate(u.expires)}</span></li>`).join("")}</ul>
      </details>
    </section>
    <section class="coupon" data-stall="${p.stall}" aria-label="Cupón">
      <div class="coupon__main">
        <p class="kicker">Cupón</p>
        <h2 class="coupon__name">${esc(p.name)}</h2>
        <dl class="coupon__facts">
          <div><dt>Se canjea en</dt><dd>${esc(placeName(p.place))}</dd></div>
          <div><dt>Vale hasta</dt><dd>${shortDate(o.validUntil)}</dd></div>
          <div><dt>Canjes</dt><dd>${p.swaps}</dd></div>
        </dl>
      </div>
      <div class="coupon__stub">
        ${qr(o.code)}
        <span class="coupon__code num">${o.code}</span>
      </div>
    </section>
    <p class="hint">${icon("phone")}<span>También lo verás en la app de RH, en <b>Cupones</b>, con el mismo código.</span></p>
    <div class="btn-row"><a class="btn btn--ghost" href="#/">Volver al mercado</a></div>
    <p class="demo-note">${icon("info")}Cupón y código de ejemplo: en la demo no se emite nada real.</p>
  </div>`;
}

export default {
  title: "Hacer trueque",
  render([id], query) {
    const p = store.productById(id);
    if (!p) return null;
    if (query.done) {
      const o = store.orderByFolio(query.done);
      return o ? receipt(p, o) : null;
    }
    if (store.balance() < p.price || store.stockLeft(p) === 0) {
      return `<div class="wrap narrow"><div class="empty"><p class="h3">Este trueque ya no se puede hacer</p><p>Puede que se haya agotado o que ya no te alcance.</p><a class="btn" href="#/products/${p.id}">Ver el producto</a></div></div>`;
    }
    return review(p);
  },
  bind(root, [id], query, go) {
    root.querySelector("[data-confirm]")?.addEventListener("click", (e) => {
      e.currentTarget.disabled = true;
      e.currentTarget.dataset.state = "loading";
      setTimeout(() => {
        const o = store.trade(id);
        if (o) go(`/trade/${id}?done=${o.folio}`);
      }, 450);
    });
  },
};

