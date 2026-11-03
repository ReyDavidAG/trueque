import { art } from "../art.js";
import { dashboardSeed as d } from "../data.js";
import * as store from "../store.js";
import { companyName, esc, icon, money, stagger } from "../ui.js";

const fmt = (n) => n.toLocaleString("es-MX");
const sum = (xs) => xs.reduce((s, x) => s + x, 0);

function kpis() {
  const earned = sum(d.earned);
  const spent = sum(d.spent);
  const items = [
    ["spark", "Cacaos dados", fmt(earned), `${money(store.pesos(earned))} en especie`],
    ["ticket", "Cacaos cambiados", fmt(spent), `${Math.round((spent / earned) * 100)}% de lo dado`],
    ["coins", "Sin cambiar", fmt(d.outstanding), `La empresa debe ${money(store.pesos(d.outstanding))}`],
    ["clock", "Vencen este mes", fmt(d.expiringThisMonth), "Se avisó a cada persona"],
    ["users", "Personas activas", `${Math.round((d.people.active / d.people.total) * 100)}%`, `${fmt(d.people.active)} de ${fmt(d.people.total)} ganaron algo`],
  ];
  return `<dl class="kpis">${items.map(([ic, k, v, note], i) => `<div class="kpi animate-tile-in" style="${stagger(i)}"><dt>${icon(ic)}${k}</dt><dd class="num">${v}</dd><dd class="kpi__note">${note}</dd></div>`).join("")}</dl>`;
}

function chart() {
  const max = Math.max(...d.earned, ...d.spent);
  const W = 760;
  const H = 230;
  const pad = 28;
  const step = (W - pad * 2) / d.months.length;
  const bw = step * 0.3;
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const bars = d.months.map((m, i) => {
    const x = pad + i * step + step * 0.18;
    return `<g><rect class="bar bar--earned" x="${x}" y="${y(d.earned[i])}" width="${bw}" height="${H - pad - y(d.earned[i])}" rx="4"><title>${m}: ${fmt(d.earned[i])} dados</title></rect>
      <rect class="bar bar--spent" x="${x + bw + 4}" y="${y(d.spent[i])}" width="${bw}" height="${H - pad - y(d.spent[i])}" rx="4"><title>${m}: ${fmt(d.spent[i])} cambiados</title></rect>
      <text class="chart__x" x="${x + bw + 2}" y="${H - 8}" text-anchor="middle">${m}</text></g>`;
  }).join("");
  return `<section class="dash-card dash-card--wide">
    <header><h2 class="h4">Cacaos por mes</h2><ul class="legend" role="list"><li><i class="is-earned"></i>Dados</li><li><i class="is-spent"></i>Cambiados</li></ul></header>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cacaos dados y cambiados de junio a noviembre">
      <path class="chart__base" d="M${pad} ${H - pad}H${W - pad}"/>${bars}
    </svg>
    <table class="sr-only"><caption>Cacaos por mes</caption><tr><th>Mes</th><th>Dados</th><th>Cambiados</th></tr>${d.months.map((m, i) => `<tr><td>${m}</td><td>${d.earned[i]}</td><td>${d.spent[i]}</td></tr>`).join("")}</table>
    <p class="muted small">Noviembre va a la mitad del mes.</p>
  </section>`;
}

function budgets() {
  return `<section class="dash-card">
    <header><h2 class="h4">Presupuesto por empresa</h2></header>
    <ul class="bars" role="list">${store.budgets().map((b) => {
      const used = b.committed + b.redeemed;
      const pct = Math.round((used / b.assigned) * 100);
      return `<li><span class="bars__label">${esc(companyName(b.company))}<small>${money(used)} de ${money(b.assigned)}</small></span><span class="bars__track"><span class="bars__fill${pct > 80 ? " is-hot" : ""}" style="width:${Math.min(pct, 100)}%"></span></span><b class="num">${pct}%</b></li>`;
    }).join("")}</ul>
  </section>`;
}

function top() {
  return `<section class="dash-card">
    <header><h2 class="h4">Lo más cambiado</h2></header>
    <ol class="top" role="list">${d.top.map((t, i) => {
      const p = store.productById(t.id);
      return `<li data-stall="${p.stall}"><span class="top__n num">${i + 1}</span><span class="top__art">${art(p.art, "")}</span><span class="top__name">${esc(p.name)}<small>${esc(companyName(p.company))}</small></span><b class="num">${fmt(t.trades)}</b></li>`;
    }).join("")}</ol>
  </section>`;
}

function areas() {
  return `<section class="dash-card">
    <header><h2 class="h4">Quién participa, por área</h2></header>
    <ul class="bars" role="list">${d.areas.map((a) => `<li><span class="bars__label">${esc(a.name)}</span><span class="bars__track"><span class="bars__fill is-alt" style="width:${a.share * 100 * 2.4}%"></span></span><b class="num">${Math.round(a.share * 100)}%</b></li>`).join("")}</ul>
  </section>`;
}

function sources() {
  return `<section class="dash-card">
    <header><h2 class="h4">De dónde salen los cacaos</h2></header>
    <ul class="bars" role="list">${d.sources.map((x) => `<li><span class="bars__label">${esc(x.name)}</span><span class="bars__track"><span class="bars__fill is-warm" style="width:${x.share * 100}%"></span></span><b class="num">${Math.round(x.share * 100)}%</b></li>`).join("")}</ul>
    <p class="muted small">Cada fuente nueva (por ejemplo, ahorro validado) es una regla más en Ajustes.</p>
  </section>`;
}

export default {
  title: "Tablero",
  render() {
    return `<div class="wrap">
      <header class="page-head page-head--row">
        <div><p class="kicker">RH y dirección · 2026</p><h1 class="h1">Cómo va El Trueque</h1><p class="lede">Lo que se ha dado, lo que se ha cambiado y lo que se debe, en cacaos y en pesos (1 cacao = ${money(store.config().cacaoValue)}).</p></div>
        <span class="tag-example">${icon("info")}Datos de ejemplo</span>
      </header>
      ${kpis()}
      <div class="dash">${chart()}${budgets()}${top()}${areas()}${sources()}</div>
    </div>`;
  },
};
