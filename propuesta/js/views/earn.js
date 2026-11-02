import { bean } from "../art.js";
import { rules } from "../data.js";
import * as store from "../store.js";
import { cacaos, esc, icon, shortDate, stagger } from "../ui.js";

function board() {
  return `<section class="board" aria-labelledby="board-title">
    <h2 class="board__title" id="board-title">Lo que paga Chispa</h2>
    <ul class="board__list" role="list">
      ${rules.map((r, i) => `<li class="board__row animate-row-in" style="${stagger(i)}">
        <span class="board__what">${esc(r.label)}<small>${esc(r.note)}</small></span>
        <span class="board__pay">${r.cacaos ? `<b class="num">${r.cacaos}</b>${bean("board__bean")}` : `<b class="num">0</b>`}${r.cap ? `<small>${esc(r.cap)}</small>` : ""}</span>
      </li>`).join("")}
    </ul>
    <p class="board__foot">Valores de ejemplo, por calibrar con RH.</p>
  </section>`;
}

function timeline() {
  const lots = store.lots();
  return `<section class="section">
    <h2 class="h3">Tus cacaos y cuándo vencen</h2>
    <p class="muted">Cada cacao vale 12 meses desde que lo ganas. Al hacer un trueque se usan primero los más viejos.</p>
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
  ["Cada empresa paga lo suyo", "Tu empresa cubre lo que canjeas; nadie paga premios de otra."],
  ["Precios parejos", "RH revisa que un mismo producto cueste igual en todas las empresas."],
];

export default {
  title: "Cómo gano cacaos",
  render() {
    return `<div class="wrap">
      <header class="page-head">
        <h1 class="h1">Cómo gano cacaos</h1>
        <p class="lede">En Mesoamérica el cacao fue moneda. Aquí también: lo ganas cuando ayudas a resolver un problema de la operación.</p>
      </header>
      <div class="earn-split">
        ${board()}
        <aside class="math-card">
          <h2 class="h4">Para darte una idea</h2>
          <p>Una chispa al mes que pasa a revisión da unos <b>${cacaos(15)}</b>.</p>
          <ul class="math-card__list" role="list">
            <li><span>Comida en el comedor</span><span class="num">≈ 2 meses</span></li>
            <li><span>Consulta con nutrióloga</span><span class="num">≈ 4 meses</span></li>
            <li><span>Examen de la vista</span><span class="num">≈ 1 año</span></li>
          </ul>
          <p class="muted small">Una chispa que llega a la feria adelanta todo eso de golpe.</p>
          <a class="btn btn--grana btn--block" href="#/">Ver el mercado</a>
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
