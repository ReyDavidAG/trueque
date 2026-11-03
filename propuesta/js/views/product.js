import { art, bean } from "../art.js";
import * as store from "../store.js";
import { cacaos, companyName, esc, icon, money, placeName, priceSign, reach, shortDate } from "../ui.js";

function custodia(p) {
  const c = p.fromCustodia;
  if (!c) return "";
  return `<section class="provenance">
    <h2 class="h4">${icon("laptop")}Viene de Custodia</h2>
    <ul class="checks" role="list">
      <li class="is-ok">${icon("check")}IT la revisó y borró los datos</li>
      <li class="is-ok">${icon("check")}Contabilidad la dio de baja</li>
      <li>${icon("box")}Folio <span class="num">${c.folio}</span> · equipo de ${c.year}</li>
    </ul>
  </section>`;
}

function payment(p) {
  const steps = store.plan(p.price);
  if (!steps) return "";
  return `<section class="pay">
    <h2 class="h4">Así se pagaría</h2>
    <p class="muted small">Se usan primero los cacaos que vencen antes.</p>
    <ol class="pay__list" role="list">
      ${steps.map(({ lot, n }) => `<li><span class="pay__n num">${bean()}${n}</span><span class="pay__src">${esc(lot.source)}</span><span class="pay__exp">vence ${shortDate(lot.expires)}</span></li>`).join("")}
    </ol>
  </section>`;
}

function gallery(p) {
  const pics = store.images(p.id);
  if (!pics.length) return `<div class="product__art">${art(p.art, p.name)}</div>`;
  return `<div class="gallery" data-gallery>
    <div class="gallery__main"><img src="${pics[0]}" alt="${esc(p.name)}, foto 1" data-gallery-main></div>
    ${pics.length > 1 ? `<div class="gallery__thumbs" role="group" aria-label="Fotos">${pics.map((src, i) => `<button class="gallery__thumb" type="button" data-thumb="${i}" aria-label="Ver foto ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}><img src="${src}" alt=""></button>`).join("")}</div>` : ""}
  </div>`;
}

function includes(p) {
  if (!p.includes?.length) return "";
  return `<section class="includes"><h2 class="h4">Qué incluye</h2><ul role="list">${p.includes.map((x) => `<li>${icon("check")}${esc(x)}</li>`).join("")}</ul></section>`;
}

function where(p) {
  const loc = store.locationById(p.place);
  if (!loc) return "";
  return `<section class="where">${icon("pin")}<span><b>${esc(loc.name)}</b>${esc(loc.address)}<small>${esc(loc.reference)}</small></span></section>`;
}

export default {
  title: (params) => store.productById(params[0])?.name ?? "Producto",
  render([id]) {
    const p = store.productById(id);
    if (!p) return null;
    const bal = store.balance();
    const left = store.stockLeft(p);
    const can = bal >= p.price && left !== 0;
    const facts = [
      ["Lo ofrece", companyName(p.company)],
      ["El cupón vale", `${p.couponDays} días`],
      ["Usos del cupón", p.swaps === 1 ? "Uno" : `${p.swaps}`],
      ["Existencias", left == null ? "Sin límite" : left === 0 ? "Agotado" : `Quedan ${left}`],
    ];
    return `<div class="wrap">
      <a class="back-link" href="#/">${icon("arrowLeft")}El mercado</a>
      <div class="product" data-stall="${p.stall}">
        <div class="product__stage">
          <div class="stall__awning" aria-hidden="true"></div>
          ${gallery(p)}
          ${priceSign(p.price, "product__sign")}
        </div>
        <div class="product__info">
          <h1 class="h1">${esc(p.name)}</h1>
          <p class="lede">${esc(p.detail)}</p>
          <p class="worth">${icon("coins")}Equivale a <b>${money(store.pesos(p.price))}</b> en especie</p>
          <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          ${includes(p)}
          ${where(p)}
          ${custodia(p)}
          <div class="product__cta">
            ${reach(p, bal)}
            ${can
              ? `<a class="btn btn--grana btn--lg btn--block" href="#/trade/${p.id}">Hacer el trueque</a>
                 <p class="muted small">Te quedarían ${cacaos(bal - p.price)}. Puedes revisar antes de confirmar.</p>`
              : `<button class="btn btn--lg btn--block" type="button" disabled>${left === 0 ? "Agotado" : "Todavía no te alcanza"}</button>
                 <a class="link" href="#/earn">Ve cómo ganar cacaos en Chispa</a>`}
          </div>
          ${can ? payment(p) : ""}
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelector("[data-gallery]")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-thumb]");
      if (!b) return;
      const pics = store.images(location.hash.split("/").pop());
      const main = root.querySelector("[data-gallery-main]");
      main.src = pics[Number(b.dataset.thumb)];
      main.alt = main.alt.replace(/foto \d/, `foto ${Number(b.dataset.thumb) + 1}`);
      root.querySelectorAll("[data-thumb]").forEach((t) => t.toggleAttribute("aria-current", t === b));
    });
  },
};
