import { art, artGroups } from "../art.js";
import { compress, kb, MAX_IMAGES } from "../images.js";
import * as store from "../store.js";
import { cacaos, esc, fieldHelp, icon, money, setError, stall, toast } from "../ui.js";

const STEPS = ["Qué es", "Cómo se ve", "Precio", "Cuándo y dónde", "Revisa y manda"];
const STALLS = [["grana", "Grana"], ["anil", "Añil"], ["nopal", "Nopal"], ["achiote", "Achiote"], ["maiz", "Maíz"], ["cacao", "Cacao"]];
const DAYS = [15, 30, 60, 90];

let draft = null;
let step = 0;

function start(id) {
  const p = id ? store.productById(id) : null;
  step = 0;
  draft = p
    ? { ...p, includesText: (p.includes ?? []).join("\n"), images: [...store.images(p.id)] }
    : { id: null, name: "", blurb: "", detail: "", includesText: "", kind: "service", category: "service", art: "ticket", stall: "grana", cost: "", price: "", stock: "", couponDays: 30, swaps: 1, from: "", until: "", place: "", images: [] };
  draft.company = draft.company ?? store.session().company;
}

const chips = (name, options, checked) =>
  `<div class="chip-row" role="radiogroup">${options.map(([v, l]) => `<label class="chip-radio"><input type="radio" name="${name}" value="${v}"${String(v) === String(checked) ? " checked" : ""}><span>${l}</span></label>`).join("")}</div>`;

const field = (id, label, input, help, extra = "") =>
  `<div class="field${extra}"><label for="${id}">${label}</label>${input}${fieldHelp(id, help)}</div>`;

function stepWhat() {
  const cats = store.categories().filter((c) => c.id !== "custodia").map((c) => [c.id, c.label]);
  return `${field("f-name", "Nombre", `<input id="f-name" name="name" class="input" maxlength="80" value="${esc(draft.name)}" placeholder="Ej. Consulta con nutrióloga">`, "Lo primero que verá la gente en el puesto. De 4 a 80 letras.")}
    ${field("f-blurb", "En una frase", `<input id="f-blurb" name="blurb" class="input" maxlength="140" value="${esc(draft.blurb)}" placeholder="Ej. Valoración y plan de alimentación.">`, "Aparece bajo el nombre. Que se entienda qué recibe.")}
    <div class="field-pair">
      <fieldset class="field"><legend>Tipo</legend>${chips("kind", [["service", "Servicio"], ["item", "Artículo"]], draft.kind)}</fieldset>
      <fieldset class="field"><legend>Categoría</legend>${chips("category", cats, draft.category)}</fieldset>
    </div>
    ${field("f-includes", "Qué incluye <span class='muted'>(opcional)</span>", `<textarea id="f-includes" name="includesText" class="input input--area" rows="3" placeholder="Una cosa por renglón">${esc(draft.includesText)}</textarea>`, "Se muestra como lista con palomitas en el detalle.")}
    ${field("f-detail", "Cómo se canjea <span class='muted'>(opcional)</span>", `<textarea id="f-detail" name="detail" class="input input--area" rows="3" placeholder="Horarios, citas, qué llevar.">${esc(draft.detail)}</textarea>`, "Lo que la persona necesita saber antes de ir.")}`;
}

function stepLook() {
  const pics = draft.images;
  const slots = pics.map((src, i) => `<figure class="upload__pic"><img src="${src}" alt="Foto ${i + 1}"><figcaption class="num">${kb(src)} KB</figcaption><button class="upload__remove" type="button" data-remove="${i}" aria-label="Quitar foto ${i + 1}">${icon("x")}</button></figure>`).join("");
  const add = pics.length < MAX_IMAGES
    ? `<label class="upload__add" for="f-photo">${icon("camera")}<b>${pics.length ? "Agregar otra" : "Subir foto"}</b><small>PNG, JPG o WebP</small><input id="f-photo" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only"></label>`
    : "";
  const groups = artGroups().map((g) => `<fieldset class="artpick__group"><legend>${g.label}</legend><div class="artpick__grid">${g.items.map((a) => `<label class="artpick__opt" data-stall="${draft.stall}"><input type="radio" name="art" value="${a.id}"${a.id === draft.art ? " checked" : ""}><span class="artpick__img">${art(a.id, "")}</span><span class="artpick__label">${a.label}</span></label>`).join("")}</div></fieldset>`).join("");
  return `<div class="field">
      <span class="field__label">Fotos <span class="muted">(hasta ${MAX_IMAGES})</span></span>
      <div class="upload">${slots}${add}</div>
      ${fieldHelp("f-photo", "Se reducen solas a menos de 300 KB. Si no subes foto, se usa la ilustración.")}
    </div>
    <fieldset class="field"><legend>Color del toldo</legend><div class="chip-row" role="radiogroup">${STALLS.map(([v, l]) => `<label class="chip-radio chip-radio--swatch" data-stall="${v}"><input type="radio" name="stall" value="${v}"${v === draft.stall ? " checked" : ""}><span><i aria-hidden="true"></i>${l}</span></label>`).join("")}</div></fieldset>
    <div class="field"><span class="field__label">Ilustración ${pics.length ? `<span class="muted">(se usa si quitas las fotos)</span>` : ""}</span><div class="artpick">${groups}</div></div>`;
}

function stepPrice() {
  const cat = store.categoryById(draft.category);
  const cost = Number(draft.cost) || 0;
  const sug = cost ? store.suggestedPrice(cost) : null;
  return `<div class="field-pair">
      ${field("f-cost", "Costo real en pesos", `<span class="input-affix"><span>$</span><input id="f-cost" name="cost" class="input num" inputmode="decimal" value="${esc(draft.cost)}" placeholder="300"></span>`, "Lo que le cuesta a tu empresa dar este producto. Sale de tu presupuesto en cada canje.")}
      ${field("f-price", "Precio en cacaos", `<input id="f-price" name="price" class="input num" inputmode="numeric" value="${esc(draft.price)}" placeholder="${sug ?? 60}">`, `Rango de ${cat.label.toLowerCase()}: de ${cat.min} a ${cat.max} cacaos.`)}
    </div>
    <div class="price-hint" data-price-hint>${priceHint()}</div>`;
}

function priceHint() {
  const cat = store.categoryById(draft.category);
  const cost = Number(draft.cost) || 0;
  const price = Number(draft.price) || 0;
  const { cacaoValue } = store.config();
  if (!cost) return `<p class="muted">${icon("info")}Pon el costo y te sugerimos un precio: 1 cacao = ${money(cacaoValue)}.</p>`;
  const exact = store.suggestedPrice(cost);
  const sug = Math.min(cat.max, Math.max(cat.min, exact));
  const max = Math.max(cat.max, price, sug) * 1.15;
  const x = (n) => `${(n / max) * 100}%`;
  const out = price && (price < cat.min || price > cat.max);
  return `<div class="suggest">
      <p>Precio sugerido: <b class="num">${cacaos(sug)}</b> <span class="muted">(${money(cost)} ÷ ${money(cacaoValue)}${exact !== sug ? ` da ${exact}; el ${exact > sug ? "máximo" : "mínimo"} de ${cat.label.toLowerCase()} es ${sug}` : ""})</span></p>
      ${price !== sug ? `<button class="btn btn--sm btn--ghost" type="button" data-use-suggested="${sug}">Usar ${sug}</button>` : ""}
    </div>
    <div class="range${out ? " is-out" : ""}" role="img" aria-label="Rango ${cat.min} a ${cat.max}${price ? `, tu precio ${price}` : ""}">
      <span class="range__band" style="left:${x(cat.min)};width:calc(${x(cat.max)} - ${x(cat.min)})"></span>
      ${price ? `<span class="range__dot" style="left:${x(price)}"></span>` : ""}
      <span class="range__tick" style="left:${x(sug)}" title="Sugerido"></span>
    </div>
    <p class="range__label">${price ? (out ? `${icon("info")}Fuera del rango: para mandarlo debe quedar entre ${cat.min} y ${cat.max} cacaos.` : `Dentro del rango. Para la gente equivale a ${money(store.pesos(price))}.`) : "La raya es el precio sugerido."}</p>`;
}

function stepWhen() {
  const locs = store.locations();
  return `<div class="field-pair">
      ${field("f-stock", "Existencias", `<input id="f-stock" name="stock" class="input num" inputmode="numeric" value="${esc(draft.stock ?? "")}" placeholder="Sin límite">`, "Vacío si es un servicio sin cupo.")}
      ${field("f-swaps", "Usos por cupón", `<input id="f-swaps" name="swaps" class="input num" inputmode="numeric" value="${esc(draft.swaps)}">`, "1 para una sola vez; 4 si son cuatro clases.")}
    </div>
    <fieldset class="field"><legend>El cupón vale</legend>${chips("couponDays", DAYS.map((d) => [d, `${d} días`]), draft.couponDays)}${fieldHelp("f-days", "Desde que la persona hace el trueque.")}</fieldset>
    <div class="field-pair">
      ${field("f-from", "Disponible desde <span class='muted'>(opcional)</span>", `<input id="f-from" name="from" type="date" class="input" value="${esc(draft.from)}">`, "Vacío: en cuanto RH lo apruebe.")}
      ${field("f-until", "Hasta <span class='muted'>(opcional)</span>", `<input id="f-until" name="until" type="date" class="input" value="${esc(draft.until)}">`, "Vacío: hasta que lo pauses.")}
    </div>
    <fieldset class="field"><legend id="f-place-legend">Se canjea en</legend>
      <div class="places" role="radiogroup" aria-labelledby="f-place-legend">${locs.map((l) => `<label class="place-opt"><input type="radio" name="place" value="${l.id}"${l.id === draft.place ? " checked" : ""}><span>${icon("pin")}<b>${esc(l.name)}</b><small>${esc(l.address)} · lo atiende ${esc(l.attendant)}</small></span></label>`).join("")}</div>
      ${fieldHelp("f-place", "Donde la persona enseña su cupón.")}
    </fieldset>`;
}

function preview() {
  const p = { ...draft, id: draft.id ?? "draft", price: Number(draft.price), stock: draft.stock === "" ? null : Number(draft.stock), status: "pending" };
  return p;
}

function stepReview() {
  const p = preview();
  const loc = store.locationById(p.place);
  const rows = [
    ["Costo para tu empresa", money(Number(draft.cost))],
    ["Precio", cacaos(p.price)],
    ["Existencias", p.stock == null ? "Sin límite" : p.stock],
    ["El cupón vale", `${p.couponDays} días · ${Number(p.swaps)} ${Number(p.swaps) === 1 ? "uso" : "usos"}`],
    ["Categoría", store.categoryById(p.category)?.label ?? ""],
    ["Se canjea en", loc?.name ?? ""],
  ];
  return `<div class="review-split">
      <div class="review-split__card"><p class="kicker">Así se verá en el mercado</p><div class="stalls stalls--one" data-preview-images>${stall(p, 0, draft.images)}</div></div>
      <div><dl class="facts">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <p class="hint">${icon("shield")}<span>RH revisa que el precio sea parejo entre empresas. Te avisamos en cuanto decida.</span></p></div>
    </div>`;
}

const RENDER = [stepWhat, stepLook, stepPrice, stepWhen, stepReview];

function validate(root) {
  const d = draft;
  const checks = {
    0: () => [setError(root, "f-name", d.name.trim().length < 4 ? "Escribe un nombre de al menos 4 letras." : ""), setError(root, "f-blurb", d.blurb.trim().length < 4 ? "Cuéntalo en una frase de al menos 4 letras." : "")],
    1: () => [true],
    2: () => {
      const cat = store.categoryById(d.category);
      const cost = Number(d.cost);
      const price = Number(d.price);
      return [
        setError(root, "f-cost", !(cost > 0) ? "Pon el costo en pesos, mayor a cero." : ""),
        setError(root, "f-price", !Number.isInteger(price) || price < 1 ? "Pon un precio en cacaos, sólo números enteros." : price < cat.min || price > cat.max ? `Debe quedar entre ${cat.min} y ${cat.max} cacaos.` : ""),
      ];
    },
    3: () => [
      setError(root, "f-stock", d.stock !== "" && d.stock != null && !(Number.isInteger(Number(d.stock)) && Number(d.stock) >= 0) ? "Existencias: un número entero o vacío." : ""),
      setError(root, "f-swaps", !(Number.isInteger(Number(d.swaps)) && Number(d.swaps) >= 1) ? "Al menos 1 uso." : ""),
      setError(root, "f-until", d.from && d.until && d.until < d.from ? "La fecha final debe ser después de la inicial." : ""),
      setError(root, "f-place", !d.place ? "Elige dónde se canjea." : ""),
    ],
    4: () => [true],
  };
  return checks[step]().every(Boolean);
}

function read(root) {
  const form = root.querySelector("[data-form]");
  const f = new FormData(form);
  for (const [k, v] of f.entries()) if (typeof v === "string") draft[k] = v;
  if (f.has("couponDays")) draft.couponDays = Number(f.get("couponDays"));
}

export default {
  title: (params) => (params[0] ? "Editar producto" : "Publicar producto"),
  render([id]) {
    if (!draft || draft.id !== (id ?? null)) start(id);
    if (id && !store.productById(id)) return null;
    return `<div class="wrap narrow-wide">
      <a class="back-link" href="#/panel">${icon("arrowLeft")}Tu puesto</a>
      <header class="page-head"><h1 class="h1">${id ? "Editar producto" : "Publicar un producto"}</h1><p class="lede">Cinco pasos. Puedes volver a cualquiera antes de mandarlo.</p></header>
      <ol class="stepper" role="list">${STEPS.map((s, i) => `<li class="stepper__item${i === step ? " is-current" : ""}${i < step ? " is-done" : ""}"><button type="button" data-goto="${i}"${i > step ? " disabled" : ""}${i === step ? ' aria-current="step"' : ""}><span class="stepper__n num">${i < step ? icon("check") : i + 1}</span><span class="stepper__label">${s}</span></button></li>`).join("")}</ol>
      <form class="form-card step-card animate-page-in" data-form novalidate>
        <h2 class="h3">${STEPS[step]}</h2>
        ${RENDER[step]()}
        <div class="form-card__actions">
          ${step ? `<button class="btn btn--ghost" type="button" data-back>${icon("arrowLeft")}Atrás</button>` : `<a class="btn btn--ghost" href="#/panel">Cancelar</a>`}
          ${step < STEPS.length - 1 ? `<button class="btn btn--grana" type="submit">Siguiente${icon("arrowRight")}</button>` : `<button class="btn btn--grana btn--lg" type="submit">${icon("shield")}Mandar a RH</button>`}
        </div>
      </form>
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    const form = root.querySelector("[data-form]");
    if (!form) return;
    form.addEventListener("input", (e) => {
      read(root);
      if (e.target.name === "cost" || e.target.name === "price") root.querySelector("[data-price-hint]").innerHTML = priceHint();
    });
    form.addEventListener("change", async (e) => {
      read(root);
      if (e.target.name === "stall" || e.target.name === "category") rerender();
      if (e.target.id !== "f-photo" || !e.target.files[0]) return;
      try {
        draft.images.push(await compress(e.target.files[0]));
        rerender();
      } catch (err) {
        setError(root, "f-photo", err.message);
      }
    });
    root.addEventListener("click", (e) => {
      const rm = e.target.closest("[data-remove]");
      if (rm) {
        draft.images.splice(Number(rm.dataset.remove), 1);
        return rerender();
      }
      const use = e.target.closest("[data-use-suggested]");
      if (use) {
        draft.price = use.dataset.useSuggested;
        root.querySelector("#f-price").value = draft.price;
        root.querySelector("[data-price-hint]").innerHTML = priceHint();
        return;
      }
      const to = e.target.closest("[data-goto]");
      if (to && Number(to.dataset.goto) < step) {
        step = Number(to.dataset.goto);
        return rerender();
      }
      if (e.target.closest("[data-back]")) {
        step -= 1;
        rerender();
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      read(root);
      if (!validate(root)) return;
      if (step < STEPS.length - 1) {
        step += 1;
        return rerender();
      }
      const includes = draft.includesText.split("\n").map((x) => x.trim()).filter(Boolean);
      const { images, includesText, ...rest } = draft;
      const id = store.saveProduct({ ...rest, includes, cost: Number(draft.cost), price: Number(draft.price), stock: draft.stock === "" ? null : Number(draft.stock), swaps: Number(draft.swaps) });
      if (!store.setImages(id, images)) toast("Las fotos no cupieron en el navegador; se guardó sin ellas", "warn");
      draft = null;
      toast("Mandado a RH: te avisamos cuando lo apruebe");
      go("/panel");
    });
  },
};
