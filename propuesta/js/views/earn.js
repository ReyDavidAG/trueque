import { bean } from "../art.js";
import { CHISPA_URL } from "../data.js";
import * as store from "../store.js";
import { cacaos, esc, icon, money, shortDate, stagger } from "../ui.js";

function board() {
  return `<section class="board" aria-labelledby="board-title">
    <h2 class="board__title" id="board-title">Lo que paga cada cosa</h2>
    <ul class="board__list" role="list">
      ${store.rules().filter((r) => r.active).map((r, i) => `<li class="board__row animate-row-in" style="${stagger(i)}">
        <span class="board__what">${esc(r.label)}<small>${esc(r.source)} · ${esc(r.note)}</small></span>
        <span class="board__pay">${r.cacaos == null ? `<b class="num">10–100</b>${bean("board__bean")}` : r.cacaos ? `<b class="num">${r.cacaos}</b>${bean("board__bean")}` : `<b class="num">0</b>`}${r.cap ? `<small>hasta ${r.cap} al mes</small>` : r.cacaos ? `<small>≈ ${money(store.pesos(r.cacaos))}</small>` : ""}</span>
      </li>`).join("")}
    </ul>
    <p class="board__foot">1 cacao = ${money(store.config().cacaoValue)} en productos. Valores de ejemplo, por calibrar con RH.</p>
  </section>`;
}

function timeline() {
  const lots = store.lots();
  return `<section class="section">
    <h2 class="h3">Tus cacaos y cuándo vencen</h2>
    <p class="muted">Cada cacao vale ${store.config().lotMonths} meses desde que lo ganas. Al hacer un trueque se usan primero los más viejos.</p>
    <ol class="lots" role="list">
      ${lots.map((l, i) => `<li class="lot animate-row-in" style="${stagger(i)}">
        <span class="lot__beans" aria-hidden="true">${bean()}</span>
        <span class="lot__n num">${l.left}</span>
        <span class="lot__src">${esc(l.source)}<small>Ganado el ${shortDate(l.earned)}</small></span>
        <span class="lot__exp${store.daysBetween(store.TODAY, l.expires) <= 60 ? " is-soon" : ""}">${icon("clock")}${shortDate(l.expires)}</span>
      </li>`).join("")}
    </ol>
  </section>`;
}

const fair = [
  ["Lo grande lo decide una persona", "Los cacaos fuertes llegan cuando el comité selecciona o se implementa una chispa, no por mandar muchas."],
  ["Topes al mes", "Mandar diez chispas iguales no paga diez veces."],
  ["Paga quien ofrece", "Cada empresa cubre, con su presupuesto, lo que su puesto entrega. Nadie paga premios de otra."],
  ["Precios parejos", "RH revisa que un mismo producto cueste igual en todas las empresas."],
];

export default {
  title: "Cómo gano cacaos",
  render() {
    return `<div class="wrap">
      <header class="page-head">
        <h1 class="h1">Cómo gano cacaos</h1>
        <p class="lede">En Mesoamérica el cacao fue moneda. Aquí también: lo ganas cuando ayudas a resolver un problema de la operación.</p>
        <a class="chispa-link" href="${CHISPA_URL}" target="_blank" rel="noopener">${icon("spark")}<span><b>Ve los retos abiertos en Chispa</b>Cada idea que mandas es tu primer cacao.</span>${icon("arrowRight")}</a>
      </header>
      <div class="earn-split">
        ${board()}
        <aside class="math-card">
          <h2 class="h4">Para darte una idea</h2>
          <p>Una chispa al mes que pasa a revisión da unos <b>${cacaos(15)}</b> (≈ ${money(store.pesos(15))}).</p>
          <ul class="math-card__list" role="list">
            <li><span>Comida en el comedor</span><span class="num">≈ 1 mes</span></li>
            <li><span>Consulta con nutrióloga</span><span class="num">≈ 4 meses</span></li>
            <li><span>Examen de la vista</span><span class="num">≈ 1 año</span></li>
          </ul>
          <p class="muted small">Una chispa que llega a la feria adelanta todo eso de golpe.</p>
          <a class="btn btn--grana btn--block" href="${CHISPA_URL}" target="_blank" rel="noopener">${icon("spark")}Proponer una chispa${icon("arrowRight")}</a>
          <a class="btn btn--ghost btn--block" href="#/">Ver el mercado</a>
        </aside>
      </div>
      ${timeline()}
      <section class="section">
        <h2 class="h3">Para que sea parejo</h2>
        <ul class="fair" role="list">${fair.map(([t, d], i) => `<li class="animate-tile-in" style="${stagger(i)}"><b>${t}</b><span>${d}</span></li>`).join("")}</ul>
      </section>
    </div>`;
  },
};
