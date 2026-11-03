import { bean } from "../art.js";
import * as store from "../store.js";
import { cacaos, companyName, cover, demoNote, esc, fieldHelp, icon, money, setError, stagger, toast } from "../ui.js";

const open = {};

function rangeBar(p, cat, sug) {
  const max = Math.max(cat.max, p.price, sug) * 1.15;
  const x = (n) => `${(n / max) * 100}%`;
  const out = p.price < cat.min || p.price > cat.max;
  return `<div class="range${out ? " is-out" : ""}" role="img" aria-label="Precio ${p.price}, sugerido ${sug}, rango ${cat.min} a ${cat.max}">
    <span class="range__band" style="left:${x(cat.min)};width:calc(${x(cat.max)} - ${x(cat.min)})"></span>
    <span class="range__tick" style="left:${x(sug)}"></span>
    <span class="range__dot" style="left:${x(p.price)}"></span>
  </div>
  <p class="range__label">${out ? `${icon("info")}Fuera del rango de ${cat.label.toLowerCase()} (${cat.min}–${cat.max})` : `Dentro del rango de ${cat.label.toLowerCase()} (${cat.min}–${cat.max})`} · la raya es el sugerido</p>`;
}

function decisionForm(p, sug) {
  const mode = open[p.id];
  if (!mode)
    return `<div class="approval__actions">
      <button class="btn btn--grana btn--sm" type="button" data-approve="${p.id}">${icon("check")}Aprobar ${p.price}</button>
      <button class="btn btn--sm" type="button" data-open="${p.id}" data-mode="adjusted">Ajustar</button>
      <button class="btn btn--ghost btn--sm" type="button" data-open="${p.id}" data-mode="rejected">Rechazar</button>
    </div>`;
  return `<form class="decision" data-decide="${p.id}" data-mode="${mode}" novalidate>
    ${mode === "adjusted" ? `<div class="field"><label for="d-price-${p.id}">Precio ajustado</label><input id="d-price-${p.id}" name="price" class="input num" inputmode="numeric" value="${sug}">${fieldHelp(`d-price-${p.id}`, `Sugerido: ${sug}. Debe quedar dentro del rango.`)}</div>` : ""}
    <div class="field"><label for="d-reason-${p.id}">Motivo para la empresa</label><textarea id="d-reason-${p.id}" name="reason" class="input input--area" rows="2" placeholder="${mode === "adjusted" ? "Ej. Igualamos al precio de productos parecidos." : "Ej. No es un beneficio para el personal."}"></textarea>${fieldHelp(`d-reason-${p.id}`, "Lo ve quien lo publicó. Al menos 10 letras.")}</div>
    <div class="approval__actions">
      <button class="btn btn--sm ${mode === "adjusted" ? "btn--grana" : ""}" type="submit">${mode === "adjusted" ? "Ajustar y publicar" : "Rechazar"}</button>
      <button class="btn btn--ghost btn--sm" type="button" data-close="${p.id}">Cancelar</button>
    </div>
  </form>`;
}

function card(p, i) {
  const cat = store.categoryById(p.category);
  const sug = p.cost ? store.suggestedPrice(p.cost) : p.price;
  return `<article class="approval animate-tile-in" data-stall="${p.stall}" style="${stagger(i)}">
    <div class="approval__art">${cover(p)}</div>
    <div class="approval__body">
      <span class="muted small">${esc(companyName(p.company))}${p.fromCustodia ? " · de Custodia" : ""}</span>
      <h2 class="h4">${esc(p.name)}</h2>
      <dl class="approval__nums">
        <div><dt>Propone</dt><dd class="num">${bean()}${p.price}</dd></div>
        <div><dt>Costo</dt><dd class="num">${money(p.cost)}</dd></div>
        <div><dt>Sugerido</dt><dd class="num">${bean()}${sug}</dd></div>
      </dl>
      ${rangeBar(p, cat, sug)}
      ${decisionForm(p, sug)}
    </div>
  </article>`;
}

export default {
  title: "Precios por aprobar",
  render() {
    const queue = store.reviewQueue();
    const { cacaoValue } = store.config();
    return `<div class="wrap">
      <header class="page-head">
        <p class="kicker">RH corporativo</p>
        <h1 class="h1">Precios por aprobar</h1>
        <p class="lede">Cada empresa propone el precio de lo que ofrece. Tú cuidas que cueste lo mismo en todas: el sugerido es su costo entre ${money(cacaoValue)} por cacao.</p>
      </header>
      ${queue.length ? `<div class="approvals">${queue.map(card).join("")}</div>` : `<div class="empty"><p class="h3">Nada por revisar</p><p class="muted">Cuando una empresa publique o cambie un precio, aparece aquí y te avisamos en la campana.</p></div>`}
      ${demoNote("Productos, costos y rangos de ejemplo.")}
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-approve]");
      if (a) {
        const p = store.productById(a.dataset.approve);
        store.review(p.id, "approved", p.price, "");
        toast(`Aprobado: ${p.name} ya está en el mercado`);
        return rerender();
      }
      const o = e.target.closest("[data-open]");
      if (o) {
        open[o.dataset.open] = o.dataset.mode;
        rerender();
        return root.querySelector(`#d-${o.dataset.mode === "adjusted" ? "price" : "reason"}-${o.dataset.open}`)?.focus();
      }
      const c = e.target.closest("[data-close]");
      if (c) {
        delete open[c.dataset.close];
        rerender();
      }
    });
    root.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-decide]");
      if (!form) return;
      e.preventDefault();
      const id = form.dataset.decide;
      const mode = form.dataset.mode;
      const p = store.productById(id);
      const cat = store.categoryById(p.category);
      const reason = String(new FormData(form).get("reason") ?? "").trim();
      const price = Number(new FormData(form).get("price"));
      const okPrice = mode !== "adjusted" || setError(root, `d-price-${id}`, !Number.isInteger(price) || price < cat.min || price > cat.max ? `Pon un entero entre ${cat.min} y ${cat.max}.` : "");
      const okReason = setError(root, `d-reason-${id}`, reason.length < 10 ? "Escribe el motivo: la empresa lo necesita para corregir." : "");
      if (!okPrice || !okReason) return;
      store.review(id, mode, price, reason);
      delete open[id];
      toast(mode === "adjusted" ? `Ajustado a ${cacaos(price)} y publicado` : "Rechazado; la empresa ve tu motivo");
      rerender();
    });
  },
};
