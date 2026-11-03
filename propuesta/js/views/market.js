import { art, bean } from "../art.js";
import { filters } from "../data.js";
import * as store from "../store.js";
import { cacaos, icon, money, shortDate, stall } from "../ui.js";

let filter = { category: "all", affordable: false };
let loaded = false;

function list() {
  const bal = store.balance();
  return store
    .liveProducts()
    .filter((p) => filter.category === "all" || p.category === filter.category)
    .filter((p) => !filter.affordable || (bal >= p.price && store.stockLeft(p) !== 0))
    .sort((a, b) => a.price - b.price);
}

function grid() {
  const items = list();
  if (!items.length)
    return `<div class="empty"><p class="h3">Nada por aquí con esos filtros</p><p>Quita "sólo lo que me alcanza" para ver todo el mercado.</p></div>`;
  return `<div class="stalls">${items.map((p, i) => stall(p, i)).join("")}</div>`;
}

const skeleton = () =>
  `<div class="stalls" aria-busy="true" aria-label="Cargando el mercado">${Array.from({ length: 4 }, (_, i) => `<div class="stall stall--ghost" style="--i:${i}"><div class="ghost ghost--awning"></div><div class="ghost ghost--art"></div><div class="ghost ghost--line"></div><div class="ghost ghost--line is-short"></div></div>`).join("")}</div>`;

const failed = () =>
  `<div class="empty empty--error" role="alert">
    <div class="empty__art">${art("closed", "")}</div>
    <p class="h3">No pudimos abrir el mercado</p>
    <p class="muted">Parece que no hay conexión. Tus cacaos están a salvo: no se movió nada.</p>
    <button class="btn btn--grana" type="button" data-retry>${icon("refresh")}Reintentar</button>
  </div>`;

function purse() {
  const bal = store.balance();
  const soon = store.expiringSoon(60);
  const soonN = soon.reduce((s, l) => s + l.left, 0);
  return `<section class="purse" aria-labelledby="purse-title">
    <div class="purse__coins" aria-hidden="true">${bean("purse__coin is-back")}${bean("purse__coin")}</div>
    <div class="purse__text">
      <p class="kicker" id="purse-title">Tus cacaos</p>
      <p class="purse__n"><span class="num" data-count="${bal}">${bal}</span> <span>${bal === 1 ? "cacao" : "cacaos"}</span></p>
      ${soonN ? `<p class="purse__warn">${icon("clock")}${cacaos(soonN)} vencen el ${shortDate(soon[0].expires)}. Úsalos primero: se gastan los más viejos.</p>` : `<p class="purse__ok">Ninguno vence en los próximos dos meses.</p>`}
    </div>
    <a class="btn btn--ghost btn--sm purse__more" href="#/earn">Cómo gano más</a>
  </section>`;
}

function explainer() {
  const { cacaoValue, lotMonths } = store.config();
  const facts = [
    ["spark", "Lo ganas", "Cuando tu chispa avanza, publicas un reto o recibes una insignia."],
    ["store", "Lo cambias", "Por servicios y artículos que ofrecen las empresas del grupo."],
    ["clock", `Dura ${lotMonths} meses`, "Desde que lo ganas. Al cambiar, se usan primero los más viejos."],
  ];
  return `<details class="explainer" open>
    <summary class="explainer__head">
      ${bean("explainer__coin")}
      <span><b class="explainer__title">¿Qué es un cacao?</b><span class="explainer__value">1 cacao vale <b class="num">${money(cacaoValue)}</b> en productos</span></span>
      ${icon("chevronDown", "explainer__chev")}
    </summary>
    <ul class="explainer__facts" role="list">
      ${facts.map(([ic, t, d], i) => `<li class="animate-tile-in" style="--i:${i}">${icon(ic)}<span><b>${t}</b>${d}</span></li>`).join("")}
    </ul>
  </details>`;
}

export default {
  title: "El mercado",
  render() {
    const chips = filters
      .map((c) => `<label class="chip-radio"><input type="radio" name="cat" value="${c.id}"${filter.category === c.id ? " checked" : ""}><span>${c.label}</span></label>`)
      .join("");
    return `<div class="wrap">
      <header class="market-head">
        <h1 class="display">Cambia tus cacaos por algo que sí uses.</h1>
        <p class="lede">Los ganas proponiendo en Chispa. Aquí los cambias por servicios y artículos de las empresas del grupo.</p>
      </header>
      ${purse()}
      ${explainer()}
      <div class="market-tools" role="group" aria-label="Filtrar el mercado">
        <div class="chip-row" role="radiogroup" aria-label="Tipo">${chips}</div>
        <label class="switch"><input type="checkbox" name="affordable"${filter.affordable ? " checked" : ""}><span class="switch__track" aria-hidden="true"></span><span>Sólo lo que me alcanza</span></label>
      </div>
      <div data-grid>${loaded ? grid() : skeleton()}</div>
      <p class="demo-note">${icon("info")}Productos, precios y existencias de ejemplo.</p>
    </div>`;
  },
  bind(root) {
    const slot = root.querySelector("[data-grid]");
    const load = () => {
      slot.innerHTML = skeleton();
      setTimeout(() => {
        if (store.offline()) {
          slot.innerHTML = failed();
          slot.querySelector("[data-retry]").addEventListener("click", load);
          return;
        }
        loaded = true;
        slot.innerHTML = grid();
      }, 750);
    };
    if (!loaded || store.offline()) load();
    root.querySelector(".market-tools").addEventListener("change", (e) => {
      if (e.target.name === "cat") filter.category = e.target.value;
      if (e.target.name === "affordable") filter.affordable = e.target.checked;
      root.querySelector("[data-grid]").innerHTML = grid();
    });
  },
};
