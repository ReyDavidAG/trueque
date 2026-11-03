import { bean } from "../art.js";
import * as store from "../store.js";
import { cacaos, companyName, demoNote, esc, fieldHelp, icon, money, setError, toast } from "../ui.js";

let adding = false;

const section = (id, title, lede, body) =>
  `<section class="settings-card animate-tile-in" aria-labelledby="${id}-t">
    <header><h2 class="h3" id="${id}-t">${title}</h2><p class="muted">${lede}</p></header>
    <form data-section="${id}" novalidate>${body}<div class="form-card__actions"><button class="btn btn--grana" type="submit">Guardar</button></div></form>
  </section>`;

function farFromSuggested(value) {
  return store.liveProducts().filter((p) => p.cost > 0 && Math.abs(p.price - p.cost / value) / (p.cost / value) > 0.2).length;
}

function valueBody() {
  const { cacaoValue } = store.config();
  return `<div class="field"><label for="s-value">Pesos por cacao</label><span class="input-affix"><span>$</span><input id="s-value" name="value" class="input num" inputmode="decimal" value="${cacaoValue}"></span>${fieldHelp("s-value", "Con esto se sugiere el precio de cada producto (su costo entre este valor) y se muestra cuánto vale un cacao.")}</div>
    <div class="impact" data-impact>${impact(cacaoValue)}</div>`;
}

function impact(value) {
  const done = store.rules().find((r) => r.id === "done");
  const n = farFromSuggested(value);
  return `<p>${bean()}Una chispa implementada (${cacaos(done.cacaos)}) equivale a <b>${money(done.cacaos * value)}</b>.</p>
    <p class="${n ? "is-warn" : ""}">${icon(n ? "info" : "check")}${n ? `${n} productos publicados quedarían lejos de su precio sugerido (más de 20%). Conviene revisarlos.` : "Los precios publicados siguen cerca de lo sugerido."}</p>`;
}

function expiryBody() {
  const { lotMonths, refundOnExpiry } = store.config();
  return `<div class="field"><label for="s-months">Los cacaos vencen a los</label><span class="input-affix input-affix--end"><input id="s-months" name="months" class="input num" inputmode="numeric" value="${lotMonths}"><span>meses</span></span>${fieldHelp("s-months", "Desde que se ganan. Entre 1 y 60. Menos meses = la gente los usa más pronto y la empresa debe menos.")}</div>
    <label class="switch"><input type="checkbox" name="refund"${refundOnExpiry ? " checked" : ""}><span class="switch__track" aria-hidden="true"></span><span>Devolver los cacaos si un cupón vence sin usarse</span></label>`;
}

function rulesBody() {
  return `<div class="table-wrap"><table class="rules-table">
    <thead><tr><th scope="col">Acción</th><th scope="col">Cacaos</th><th scope="col">Tope al mes<small>vacío = sin tope</small></th><th scope="col">Activa</th></tr></thead>
    <tbody>${store.rules().map((r) => `<tr>
      <th scope="row"><b>${esc(r.label)}</b><small>${esc(r.source)} · ${esc(r.note)}</small></th>
      <td>${r.cacaos == null ? `<span class="muted small">Según la insignia</span>` : `<input id="s-r-${r.id}" name="cacaos-${r.id}" class="input input--sm num" inputmode="numeric" value="${r.cacaos}" aria-label="Cacaos por ${esc(r.label)}">`}</td>
      <td><input id="s-c-${r.id}" name="cap-${r.id}" class="input input--sm num" inputmode="numeric" value="${r.cap ?? ""}" placeholder="—" aria-label="Tope al mes de ${esc(r.label)}"></td>
      <td><label class="switch switch--solo"><input type="checkbox" name="active-${r.id}"${r.active ? " checked" : ""} aria-label="Activa: ${esc(r.label)}"><span class="switch__track" aria-hidden="true"></span></label></td>
    </tr>`).join("")}</tbody>
  </table></div>
  <p class="field__help is-error" data-rules-error hidden></p>`;
}

function categoriesBody() {
  return store.categories().map((c) => `<div class="field-row">
      <b class="field-row__label">${esc(c.label)}</b>
      <div class="field"><label for="s-min-${c.id}">Mínimo</label><input id="s-min-${c.id}" name="min-${c.id}" class="input input--sm num" inputmode="numeric" value="${c.min}">${fieldHelp(`s-min-${c.id}`, "cacaos")}</div>
      <div class="field"><label for="s-max-${c.id}">Máximo</label><input id="s-max-${c.id}" name="max-${c.id}" class="input input--sm num" inputmode="numeric" value="${c.max}">${fieldHelp(`s-max-${c.id}`, "cacaos")}</div>
    </div>`).join("");
}

function budgetsBody() {
  return store.budgets().map((b) => {
    const used = b.committed + b.redeemed;
    return `<div class="field-row">
      <b class="field-row__label">${esc(companyName(b.company))}<small>Usado: ${money(used)} (${Math.round((used / b.assigned) * 100)}%)</small></b>
      <div class="field"><label for="s-b-${b.company}">Presupuesto ${b.period}</label><span class="input-affix"><span>$</span><input id="s-b-${b.company}" name="budget-${b.company}" class="input num" inputmode="numeric" value="${b.assigned}"></span>${fieldHelp(`s-b-${b.company}`, "En pesos, para todo el año.")}</div>
    </div>`;
  }).join("");
}

function locationsBody() {
  const rows = store.locations().map((l) => `<li>${icon("pin")}<span><b>${esc(l.name)}</b>${esc(l.address)}<small>Lo atiende ${esc(l.attendant)} · ${esc(l.reference)}</small></span></li>`).join("");
  const form = adding
    ? `<div class="field-pair">
        <div class="field"><label for="s-l-name">Nombre</label><input id="s-l-name" name="name" class="input" maxlength="60">${fieldHelp("s-l-name", "Como lo conoce la gente.")}</div>
        <div class="field"><label for="s-l-attendant">Quién lo atiende</label><input id="s-l-attendant" name="attendant" class="input" maxlength="60">${fieldHelp("s-l-attendant", "Quien escanea los cupones.")}</div>
      </div>
      <div class="field-pair">
        <div class="field"><label for="s-l-address">Dirección</label><input id="s-l-address" name="address" class="input" maxlength="90">${fieldHelp("s-l-address", "Planta, edificio o calle.")}</div>
        <div class="field"><label for="s-l-reference">Referencia</label><input id="s-l-reference" name="reference" class="input" maxlength="90">${fieldHelp("s-l-reference", "Cómo encontrarlo o qué llevar.")}</div>
      </div>`
    : `<button class="btn btn--ghost btn--sm" type="button" data-add-location>${icon("plus")}Agregar lugar</button>`;
  return `<ul class="locations" role="list">${rows}</ul>${form}`;
}

export default {
  title: "Ajustes",
  render() {
    return `<div class="wrap narrow-wide">
      <header class="page-head"><p class="kicker">RH corporativo</p><h1 class="h1">Ajustes de El Trueque</h1><p class="lede">Las reglas del mercado. Cada cambio aplica desde que lo guardas; lo ya ganado y los cupones emitidos no cambian.</p></header>
      <div class="settings">
        ${section("value", "Valor del cacao", "La equivalencia que usa todo el sistema para sugerir precios y mostrar costos.", valueBody())}
        ${section("rules", "Cómo se ganan", "Cuánto da cada acción y cuántas veces al mes cuenta. Una fuente nueva es una fila nueva.", rulesBody())}
        ${section("expiry", "Vencimiento", "Para que los cacaos se usen y la empresa no acumule una deuda que nunca se canjea.", expiryBody())}
        ${section("categories", "Rangos de precio", "Lo mínimo y máximo que puede costar algo en cada categoría.", categoriesBody())}
        ${section("budgets", "Presupuesto por empresa", "Cada empresa paga, con el costo real, lo que su puesto entrega.", budgetsBody())}
        ${section("locations", "Lugares de canje", "Dónde se enseñan los cupones y quién los escanea.", locationsBody())}
      </div>
      ${demoNote("Valores de ejemplo: en la demo los cambios se guardan sólo en tu navegador.")}
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    root.querySelector('[data-section="value"]').addEventListener("input", (e) => {
      const v = Number(e.target.value);
      if (v > 0) root.querySelector("[data-impact]").innerHTML = impact(v);
    });
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-add-location]")) {
        adding = true;
        rerender();
        root.querySelector("#s-l-name")?.focus();
      }
    });
    root.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-section]");
      if (!form) return;
      e.preventDefault();
      const f = new FormData(form);
      const num = (k) => Number(String(f.get(k) ?? "").trim());
      const id = form.dataset.section;
      const saved = {
        value() {
          const v = num("value");
          if (!setError(root, "s-value", !(v > 0) || Math.round(v * 100) !== v * 100 ? "Un número mayor a cero, con hasta dos decimales." : "")) return false;
          store.setConfig({ cacaoValue: v });
          return "Valor del cacao actualizado";
        },
        expiry() {
          const m = num("months");
          if (!setError(root, "s-months", !Number.isInteger(m) || m < 1 || m > 60 ? "Entre 1 y 60 meses." : "")) return false;
          store.setConfig({ lotMonths: m, refundOnExpiry: f.has("refund") });
          return "Vencimiento actualizado";
        },
        rules() {
          const bad = store.rules().find((r) => (r.cacaos != null && !(Number.isInteger(num(`cacaos-${r.id}`)) && num(`cacaos-${r.id}`) >= 0)) || (f.get(`cap-${r.id}`) !== "" && !(Number.isInteger(num(`cap-${r.id}`)) && num(`cap-${r.id}`) > 0)));
          const err = root.querySelector("[data-rules-error]");
          err.hidden = !bad;
          if (bad) {
            err.textContent = `Revisa «${bad.label}»: cacaos en entero desde 0 y tope vacío o mayor a 0.`;
            return false;
          }
          for (const r of store.rules()) store.setRule(r.id, { ...(r.cacaos != null ? { cacaos: num(`cacaos-${r.id}`) } : {}), cap: f.get(`cap-${r.id}`) === "" ? null : num(`cap-${r.id}`), active: f.has(`active-${r.id}`) });
          return "Reglas de ganancia guardadas";
        },
        categories() {
          let ok = true;
          for (const c of store.categories()) {
            const min = num(`min-${c.id}`);
            const max = num(`max-${c.id}`);
            ok = setError(root, `s-min-${c.id}`, !Number.isInteger(min) || min < 1 ? "Entero mayor a 0." : "") && ok;
            ok = setError(root, `s-max-${c.id}`, !Number.isInteger(max) || max < min ? "Debe ser mayor o igual al mínimo." : "") && ok;
          }
          if (!ok) return false;
          for (const c of store.categories()) store.setCategory(c.id, { min: num(`min-${c.id}`), max: num(`max-${c.id}`) });
          return "Rangos de precio guardados";
        },
        budgets() {
          let ok = true;
          for (const b of store.budgets()) {
            const v = num(`budget-${b.company}`);
            ok = setError(root, `s-b-${b.company}`, !Number.isInteger(v) || v < b.committed + b.redeemed ? `No puede ser menor a lo ya usado (${money(b.committed + b.redeemed)}).` : "") && ok;
          }
          if (!ok) return false;
          for (const b of store.budgets()) store.setBudget(b.company, num(`budget-${b.company}`));
          return "Presupuestos guardados";
        },
        locations() {
          if (!adding) return "Sin cambios";
          const get = (k) => String(f.get(k) ?? "").trim();
          const okName = setError(root, "s-l-name", get("name").length < 3 ? "Escribe el nombre del lugar." : "");
          const okAtt = setError(root, "s-l-attendant", get("attendant").length < 3 ? "Indica quién escanea los cupones." : "");
          if (!okName || !okAtt) return false;
          store.saveLocation({ id: `l${Date.now().toString(36)}`, name: get("name"), attendant: get("attendant"), address: get("address"), reference: get("reference") });
          adding = false;
          return "Lugar agregado";
        },
      }[id]();
      if (!saved) return;
      toast(saved);
      rerender();
    });
  },
};
