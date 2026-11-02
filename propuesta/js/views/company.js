import { art, bean } from "../art.js";
import { budget, companyQueue, custodiaQueue, hrQueue, places } from "../data.js";
import * as store from "../store.js";
import { cacaos, companyName, esc, icon, stagger, toast } from "../ui.js";

const pct = (n) => `${Math.round((n / budget.assigned) * 100)}%`;

function budgetCard() {
  const free = budget.assigned - budget.committed - budget.redeemed;
  return `<section class="budget">
    <div class="budget__head">
      <h2 class="h4">Presupuesto ${budget.period} · ${esc(companyName(budget.company))}</h2>
      <span class="tag-example">Ejemplo</span>
    </div>
    <div class="budget__bar" role="img" aria-label="Canjeado ${budget.redeemed}, en cupones vigentes ${budget.committed}, libre ${free} de ${budget.assigned} cacaos">
      <span class="is-redeemed" style="width:${pct(budget.redeemed)}"></span>
      <span class="is-committed" style="width:${pct(budget.committed)}"></span>
    </div>
    <dl class="budget__legend">
      <div><dt><i class="is-redeemed"></i>Canjeado</dt><dd class="num">${budget.redeemed.toLocaleString("es-MX")}</dd></div>
      <div><dt><i class="is-committed"></i>En cupones vigentes</dt><dd class="num">${budget.committed.toLocaleString("es-MX")}</dd></div>
      <div><dt><i></i>Libre</dt><dd class="num">${free.toLocaleString("es-MX")}</dd></div>
    </dl>
  </section>`;
}

function myProducts() {
  const rows = [
    ...companyQueue.map((q) => {
      const p = store.productById(q.id);
      return p ? { name: p.name, price: p.price, status: q.status, art: p.art } : { name: q.name, price: q.price, status: q.status, art: "cap" };
    }),
    ...store.published().map((x) => ({ ...x, status: "pending", art: "cap" })),
  ];
  const label = { live: ["Publicado", "is-live"], pending: ["Esperando a RH", "is-pending"] };
  return `<section class="section">
    <div class="section__head"><h2 class="h3">Tus productos</h2></div>
    <ul class="rows" role="list">
      ${rows.map((r, i) => `<li class="row animate-row-in" style="${stagger(i)}">
        <span class="row__art">${art(r.art, "")}</span>
        <span class="row__name">${esc(r.name)}</span>
        <span class="row__price num">${bean()}${r.price}</span>
        <span class="pill ${label[r.status][1]}">${label[r.status][0]}</span>
      </li>`).join("")}
    </ul>
  </section>`;
}

const chipGroup = (name, options, checked) =>
  `<div class="chip-row" role="radiogroup">${options.map(([v, l]) => `<label class="chip-radio"><input type="radio" name="${name}" value="${v}"${v === checked ? " checked" : ""}><span>${l}</span></label>`).join("")}</div>`;

function publishForm() {
  return `<section class="section">
    <div class="section__head"><h2 class="h3">Publicar un producto</h2></div>
    <form class="form-card" data-publish novalidate>
      <div class="field"><label for="f-name">Nombre</label><input id="f-name" name="name" class="input" maxlength="60" placeholder="Ej. Gorra bordada del grupo" required><p class="field__help" id="f-name-help">Lo que verá la gente en el puesto.</p></div>
      <fieldset class="field"><legend>Tipo</legend>${chipGroup("kind", [["service", "Servicio"], ["item", "Artículo"]], "item")}</fieldset>
      <div class="field-pair">
        <div class="field"><label for="f-price">Precio en cacaos</label><input id="f-price" name="price" class="input num" inputmode="numeric" placeholder="35" required><p class="field__help">RH lo compara con productos parecidos.</p></div>
        <div class="field"><label for="f-stock">Existencias</label><input id="f-stock" name="stock" class="input num" inputmode="numeric" placeholder="Sin límite"><p class="field__help">Vacío si es un servicio sin cupo.</p></div>
      </div>
      <fieldset class="field"><legend>El cupón vale</legend>${chipGroup("days", [["15", "15 días"], ["30", "30 días"], ["60", "60 días"], ["90", "90 días"]], "30")}</fieldset>
      <fieldset class="field"><legend>Se canjea en</legend>${chipGroup("place", Object.entries(places), "rh")}</fieldset>
      <div class="form-card__actions"><button class="btn btn--grana" type="submit">Mandar a RH</button></div>
    </form>
  </section>`;
}

function fromCustodia() {
  return `<section class="section">
    <div class="section__head"><h2 class="h3">Llegan de Custodia</h2><p class="muted">Equipo dado de baja que todavía sirve.</p></div>
    <div class="custodia-list">
      ${custodiaQueue.map((c, i) => {
        const ready = c.it && c.accounting;
        const done = store.decision(c.folio) === "published";
        return `<article class="custodia-card animate-tile-in" style="${stagger(i)}">
          <header><span class="num folio">${c.folio}</span><h3 class="h4">${esc(c.name)}</h3><span class="muted small">Equipo de ${c.year}</span></header>
          <ul class="checks" role="list">
            <li class="${c.it ? "is-ok" : ""}">${icon(c.it ? "check" : "clock")}IT: revisado y datos borrados</li>
            <li class="${c.accounting ? "is-ok" : ""}">${icon(c.accounting ? "check" : "clock")}Contabilidad: ${c.accounting ? "baja del activo hecha" : "falta la baja del activo"}</li>
          </ul>
          ${done
            ? `<p class="pill is-pending">Esperando a RH</p>`
            : `<button class="btn ${ready ? "btn--grana" : ""} btn--block" type="button" data-custodia="${c.folio}"${ready ? "" : " disabled"}>${ready ? `Postular por ${cacaos(c.suggested)}` : "Falta contabilidad"}</button>`}
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function rangeBar(q) {
  const max = Math.max(q.range[1], q.price) * 1.3;
  const x = (n) => `${(n / max) * 100}%`;
  const out = q.price < q.range[0] || q.price > q.range[1];
  return `<div class="range${out ? " is-out" : ""}" role="img" aria-label="Precio ${q.price}, rango de referencia ${q.range[0]} a ${q.range[1]}">
    <span class="range__band" style="left:${x(q.range[0])};width:calc(${x(q.range[1])} - ${x(q.range[0])})"></span>
    <span class="range__dot" style="left:${x(q.price)}"></span>
  </div>
  <p class="range__label">${out ? `${icon("info")}Fuera del rango de referencia (${q.range[0]}–${q.range[1]})` : `Dentro del rango de referencia (${q.range[0]}–${q.range[1]})`}</p>`;
}

function hrPanel() {
  return `<div class="wrap">
    <header class="page-head">
      <p class="kicker">RH corporativo</p>
      <h1 class="h1">Precios por aprobar</h1>
      <p class="lede">Cada empresa propone el precio de lo que ofrece. Tú cuidas que cueste lo mismo en todas.</p>
    </header>
    <div class="approvals">
      ${hrQueue.map((q, i) => {
        const d = store.decision(q.id);
        return `<article class="approval animate-tile-in" style="${stagger(i)}">
          <div class="approval__art">${art(q.art, "")}</div>
          <div class="approval__body">
            <span class="muted small">${esc(companyName(q.company))}</span>
            <h2 class="h4">${esc(q.name)}</h2>
            <p class="approval__price">${bean()}<b class="num">${q.price}</b> propuestos</p>
            ${rangeBar(q)}
            ${d
              ? `<p class="pill ${d === "rejected" ? "is-rejected" : "is-live"}">${d === "approved" ? "Aprobado" : d === "adjusted" ? `Ajustado a ${q.range[1]}` : "Rechazado"}</p>`
              : `<div class="approval__actions">
                  <button class="btn btn--grana btn--sm" type="button" data-decide="${q.id}" data-value="approved">Aprobar</button>
                  ${q.price > q.range[1] ? `<button class="btn btn--sm" type="button" data-decide="${q.id}" data-value="adjusted">Ajustar a ${q.range[1]}</button>` : ""}
                  <button class="btn btn--ghost btn--sm" type="button" data-decide="${q.id}" data-value="rejected">Rechazar</button>
                </div>`}
          </div>
        </article>`;
      }).join("")}
    </div>
    <p class="demo-note">${icon("info")}Productos y rangos de ejemplo.</p>
  </div>`;
}

function companyPanel() {
  return `<div class="wrap">
    <header class="page-head">
      <p class="kicker">${esc(companyName(budget.company))}</p>
      <h1 class="h1">Tu puesto en El Trueque</h1>
      <p class="lede">Lo que ofreces a tu gente y cuánto del presupuesto se ha usado.</p>
    </header>
    ${budgetCard()}
    <div class="panel-split">
      <div>${myProducts()}${fromCustodia()}</div>
      ${publishForm()}
    </div>
  </div>`;
}

export default {
  title: "Panel",
  render() {
    return store.role() === "hr" ? hrPanel() : companyPanel();
  },
  bind(root, params, query, go, rerender) {
    root.addEventListener("click", (e) => {
      const d = e.target.closest("[data-decide]");
      if (d) {
        store.decide(d.dataset.decide, d.dataset.value);
        toast(d.dataset.value === "rejected" ? "Precio rechazado; la empresa recibe el aviso" : "Listo, el producto se publica");
        return rerender();
      }
      const c = e.target.closest("[data-custodia]");
      if (c) {
        store.decide(c.dataset.custodia, "published");
        toast("Mandado a RH para revisar el precio");
        rerender();
      }
    });
    root.querySelector("[data-publish]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const name = String(f.get("name") ?? "").trim();
      const price = Number(f.get("price"));
      const help = root.querySelector("#f-name-help");
      if (name.length < 4) {
        help.textContent = "Escribe un nombre de al menos 4 letras.";
        help.classList.add("is-error");
        return root.querySelector("#f-name").focus();
      }
      if (!Number.isInteger(price) || price < 1) {
        root.querySelector("#f-price").focus();
        return toast("Pon un precio en cacaos, sólo números");
      }
      store.publish({ name, price });
      toast("Mandado a RH: lo verás publicado cuando lo apruebe");
      rerender();
    });
  },
};
