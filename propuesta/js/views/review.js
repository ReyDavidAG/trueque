import { bean } from "../art.js";
import * as store from "../store.js";
import { cacaos, companyName, cover, demoNote, esc, fieldHelp, icon, money, setError, stagger, toast } from "../ui.js";

const values = {};
const rejecting = {};

const scaleMax = (p, cat, sug) => Math.ceil((Math.max(cat.max, p.price, sug) * 1.15) / 10) * 10;
const pct = (n, max) => `${(n / max) * 100}%`;

function context(p) {
  const cat = store.categoryById(p.category);
  const sug = p.cost ? store.suggestedPrice(p.cost) : p.price;
  const value = values[p.id] ?? p.price;
  return { cat, sug, value, max: scaleMax(p, cat, sug), out: value < cat.min || value > cat.max, changed: value !== p.price };
}

function labelFor(p, c) {
  if (c.out) return `${icon("info")}Fuera del rango de ${c.cat.label.toLowerCase()} (${c.cat.min}–${c.cat.max}): muévelo a la franja verde.`;
  if (c.changed) return `Ajustas de ${p.price} a <b class="num">${c.value}</b> · equivale a ${money(store.pesos(c.value))} · la raya es el sugerido (${c.sug})`;
  return `Dentro del rango (${c.cat.min}–${c.cat.max}). Arrastra el punto para ajustar · la raya es el sugerido (${c.sug})`;
}

function approveLabel(p, c) {
  if (c.out) return "Fuera de rango";
  return c.changed ? `${icon("check")}Ajustar a ${c.value} y publicar` : `${icon("check")}Aprobar ${p.price}`;
}

function card(p, i) {
  const c = context(p);
  const needReason = c.changed || rejecting[p.id];
  return `<article class="approval animate-tile-in" data-stall="${p.stall}" data-card="${p.id}" style="${stagger(i)}">
    <div class="approval__art">${cover(p)}</div>
    <div class="approval__body">
      <span class="muted small">${esc(companyName(p.company))}${p.fromCustodia ? " · de Custodia" : ""}</span>
      <h2 class="h4">${esc(p.name)}</h2>
      <dl class="approval__nums">
        <div><dt>Propone</dt><dd class="num">${bean()}${p.price}</dd></div>
        <div><dt>Costo</dt><dd class="num">${money(p.cost)}</dd></div>
        <div><dt>Sugerido</dt><dd class="num">${bean()}${c.sug}</dd></div>
      </dl>
      <div class="range range--live${c.out ? " is-out" : ""}" data-range>
        <span class="range__band" style="left:${pct(c.cat.min, c.max)};width:calc(${pct(c.cat.max, c.max)} - ${pct(c.cat.min, c.max)})"></span>
        <span class="range__tick" style="left:${pct(c.sug, c.max)}"></span>
        <span class="range__ghost" style="left:${pct(p.price, c.max)}" title="Propuesto"></span>
        <input class="range__input" type="range" min="1" max="${c.max}" step="1" value="${c.value}" data-slide="${p.id}" aria-label="Precio a aprobar de ${esc(p.name)}" aria-valuetext="${c.value} cacaos">
      </div>
      <p class="range__label" data-label>${labelFor(p, c)}</p>
      <div class="approval__actions">
        <button class="btn btn--grana btn--sm" type="button" data-approve="${p.id}"${c.out ? " disabled" : ""}>${approveLabel(p, c)}</button>
        <button class="btn btn--sm btn--ghost" type="button" data-snap="${p.id}" data-to="${c.sug}"${c.value === c.sug ? " hidden" : ""}>Usar sugerido (${c.sug})</button>
        <button class="btn btn--sm btn--ghost" type="button" data-reset="${p.id}"${c.changed ? "" : " hidden"}>Dejar ${p.price}</button>
        <button class="btn btn--ghost btn--sm" type="button" data-reject="${p.id}">Rechazar</button>
      </div>
      <div class="decision" data-reason${needReason ? "" : " hidden"}>
        <div class="field"><label for="d-reason-${p.id}">${rejecting[p.id] ? "Por qué lo rechazas" : "Por qué ajustas el precio"}</label><textarea id="d-reason-${p.id}" class="input input--area" rows="2" placeholder="${rejecting[p.id] ? "Ej. No es un beneficio para el personal." : "Ej. Igualamos al precio de productos parecidos."}"></textarea>${fieldHelp(`d-reason-${p.id}`, "Lo ve quien lo publicó. Al menos 10 letras.")}</div>
        ${rejecting[p.id] ? `<div class="approval__actions"><button class="btn btn--sm" type="button" data-confirm-reject="${p.id}">Rechazar producto</button><button class="btn btn--ghost btn--sm" type="button" data-cancel-reject="${p.id}">Cancelar</button></div>` : ""}
      </div>
    </div>
  </article>`;
}

function refresh(root, p) {
  const box = root.querySelector(`[data-card="${p.id}"]`);
  const c = context(p);
  box.querySelector("[data-range]").classList.toggle("is-out", c.out);
  box.querySelector("[data-slide]").setAttribute("aria-valuetext", `${c.value} cacaos`);
  box.querySelector("[data-label]").innerHTML = labelFor(p, c);
  const approve = box.querySelector("[data-approve]");
  approve.innerHTML = approveLabel(p, c);
  approve.disabled = c.out;
  box.querySelector("[data-snap]").hidden = c.value === c.sug;
  box.querySelector("[data-reset]").hidden = !c.changed;
  const reason = box.querySelector("[data-reason]");
  const show = c.changed || rejecting[p.id];
  if (show && reason.hidden) {
    reason.hidden = false;
    reason.classList.remove("animate-panel-in");
    void reason.offsetWidth;
    reason.classList.add("animate-panel-in");
  }
  if (!show) reason.hidden = true;
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
        <p class="lede">Cada empresa propone el precio de lo que ofrece. Tú cuidas que cueste lo mismo en todas: el sugerido es su costo entre ${money(cacaoValue)} por cacao. Ajusta en la barra y aprueba en el mismo paso.</p>
      </header>
      ${queue.length ? `<div class="approvals">${queue.map(card).join("")}</div>` : `<div class="empty"><p class="h3">Nada por revisar</p><p class="muted">Cuando una empresa publique o cambie un precio, aparece aquí y te avisamos en la campana.</p></div>`}
      ${demoNote("Productos, costos y rangos de ejemplo.")}
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    root.addEventListener("input", (e) => {
      const slide = e.target.closest("[data-slide]");
      if (!slide) return;
      values[slide.dataset.slide] = Number(slide.value);
      refresh(root, store.productById(slide.dataset.slide));
    });
    root.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const id = b.dataset.approve ?? b.dataset.snap ?? b.dataset.reset ?? b.dataset.reject ?? b.dataset.confirmReject ?? b.dataset.cancelReject;
      if (!id) return;
      const p = store.productById(id);
      if (b.dataset.snap || b.dataset.reset) {
        values[id] = b.dataset.snap ? Number(b.dataset.to) : p.price;
        root.querySelector(`[data-slide="${id}"]`).value = values[id];
        return refresh(root, p);
      }
      if (b.dataset.reject || b.dataset.cancelReject) {
        rejecting[id] = !!b.dataset.reject;
        rerender();
        if (rejecting[id]) root.querySelector(`#d-reason-${id}`)?.focus();
        return;
      }
      const reason = String(root.querySelector(`#d-reason-${id}`)?.value ?? "").trim();
      const c = context(p);
      if ((c.changed || b.dataset.confirmReject) && !setError(root, `d-reason-${id}`, reason.length < 10 ? "Escribe el motivo: la empresa lo necesita para corregir." : "")) {
        return root.querySelector(`#d-reason-${id}`).focus();
      }
      if (b.dataset.confirmReject) {
        store.review(id, "rejected", p.price, reason);
        toast("Rechazado; la empresa ve tu motivo");
      } else if (c.changed) {
        store.review(id, "adjusted", c.value, reason);
        toast(`Ajustado a ${cacaos(c.value)} y publicado`);
      } else {
        store.review(id, "approved", p.price, "");
        toast(`Aprobado: ${p.name} ya está en el mercado`);
      }
      delete values[id];
      delete rejecting[id];
      rerender();
    });
  },
};
