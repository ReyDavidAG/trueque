import { bean } from "../art.js";
import * as store from "../store.js";
import { cacaos, esc, icon, shortDate, stagger } from "../ui.js";

export default {
  title: "Mi jícara",
  render() {
    const bal = store.balance();
    const soon = store.expiringSoon(60).reduce((s, l) => s + l.left, 0);
    const moves = store.movements();
    const earned = moves.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0);
    const spent = -moves.filter((m) => m.amount < 0).reduce((s, m) => s + m.amount, 0);
    return `<div class="wrap narrow">
      <header class="page-head">
        <h1 class="h1">Mi jícara</h1>
        <p class="lede">Todo lo que has ganado y cambiado, cacao por cacao.</p>
      </header>
      <section class="wallet">
        <div class="wallet__coins" aria-hidden="true">${bean("wallet__coin is-back")}${bean("wallet__coin")}</div>
        <p class="wallet__n"><span class="num" data-count="${bal}">${bal}</span><span>${bal === 1 ? "cacao" : "cacaos"}</span></p>
        <dl class="wallet__stats">
          <div><dt>Ganados</dt><dd class="num">${earned}</dd></div>
          <div><dt>Cambiados</dt><dd class="num">${spent}</dd></div>
          <div class="${soon ? "is-soon" : ""}"><dt>Vencen pronto</dt><dd class="num">${soon}</dd></div>
        </dl>
      </section>
      <section class="section">
        <div class="section__head"><h2 class="h3">Movimientos</h2></div>
        <ol class="moves" role="list">
          ${moves.map((m, i) => `<li class="move animate-row-in${m.amount < 0 ? " is-spend" : ""}" style="${stagger(i)}">
            <span class="move__icon" aria-hidden="true">${m.amount < 0 ? icon("ticket") : icon("spark")}</span>
            <span class="move__text">${esc(m.label)}<small>${shortDate(m.date)}</small></span>
            <span class="move__n num">${m.amount > 0 ? "+" : "−"}${Math.abs(m.amount)}</span>
          </li>`).join("")}
        </ol>
      </section>
      <div class="btn-row"><a class="btn btn--ghost" href="#/earn">Cómo gano más</a><a class="btn btn--grana" href="#/">Ir al mercado</a></div>
    </div>`;
  },
};
