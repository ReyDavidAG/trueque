import { art } from "../art.js";
import { redeemSamples } from "../data.js";
import * as store from "../store.js";
import { companyName, demoNote, esc, fieldHelp, icon, money, placeName, setError, shortDate, toast } from "../ui.js";

let found = null;
let typed = "";
let scanning = false;
let done = false;

const CODE = /^CAC-[A-Z0-9]{4,10}$/;

function problem(c) {
  const p = store.productById(c.productId);
  const b = store.budgetOf(p.company);
  if (c.status === "used") return ["is-used", "Este cupón ya se usó", `Se canjeó el ${shortDate(c.usedOn)}. No entregues nada.`];
  if (c.status === "expired" || c.validUntil < store.TODAY) return ["is-rejected", "Este cupón ya venció", `Valía hasta el ${shortDate(c.validUntil)}. La persona puede hacer otro trueque.`];
  const mine = store.session().company;
  if (p.company !== mine) return ["is-other", "Este cupón es de otro puesto", `Lo ofrece ${companyName(p.company)} y se canjea en ${placeName(c.place)}.`];
  if (b.assigned - b.committed - b.redeemed < p.cost) return ["is-rejected", "Tu empresa no tiene presupuesto", "Avísale a RH antes de entregar."];
  return null;
}

function result() {
  if (!found) return "";
  const p = store.productById(found.productId);
  if (done)
    return `<article class="redeem-card is-done animate-tile-in" data-stall="${p.stall}" aria-live="polite">
      <div class="redeem-card__art"><span class="done-head__mark">${icon("check")}</span></div>
      <div class="redeem-card__body">
        <p class="kicker num">${esc(found.folio)}</p>
        <h2 class="h3">Canje registrado</h2>
        <p class="muted">${esc(p.name)} para ${esc(found.person)}. Se descontaron ${money(p.cost)} del presupuesto de tu empresa.</p>
        <button class="btn btn--grana btn--block" type="button" data-clear>Canjear otro</button>
      </div>
    </article>`;
  const bad = problem(found);
  return `<article class="redeem-card animate-tile-in${bad ? ` ${bad[0]}` : " is-ok"}" data-stall="${p.stall}" aria-live="polite">
    <div class="redeem-card__art">${art(p.art, "")}</div>
    <div class="redeem-card__body">
      <p class="kicker num">${esc(found.folio)} · ${esc(found.code)}</p>
      <h2 class="h3">${esc(p.name)}</h2>
      <dl class="facts facts--tight">
        <div><dt>Para</dt><dd>${esc(found.person)} · No. <span class="num">${esc(found.number)}</span></dd></div>
        <div><dt>Vale hasta</dt><dd>${shortDate(found.validUntil)}</dd></div>
        <div><dt>Costo para tu empresa</dt><dd>${money(p.cost)}</dd></div>
      </dl>
      ${bad
        ? `<p class="redeem-card__alert" role="alert">${icon("info")}<span><b>${bad[1]}</b>${bad[2]}</span></p><button class="btn btn--ghost btn--block" type="button" data-clear>Buscar otro código</button>`
        : `<p class="redeem-card__ok">${icon("check")}<span><b>Todo en orden.</b>Entrega el producto y confirma.</span></p>
           <button class="btn btn--grana btn--lg btn--block" type="button" data-redeem>${icon("check")}Confirmar canje</button>
           <button class="btn btn--ghost btn--block" type="button" data-clear>Cancelar</button>`}
    </div>
  </article>`;
}

export default {
  title: "Canjear cupón",
  render() {
    return `<div class="wrap narrow">
      <a class="back-link" href="#/panel">${icon("arrowLeft")}Tu puesto</a>
      <header class="page-head"><h1 class="h1">Canjear un cupón</h1><p class="lede">Escanea el QR o escribe el código. Antes de confirmar ves para quién es y si todavía vale.</p></header>
      <form class="form-card" data-lookup novalidate>
        <button class="scan${scanning ? " is-on" : ""}" type="button" data-scan aria-pressed="${scanning}">
          <span class="scan__frame" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="scan__line"></span></span>
          <span class="scan__text">${icon("camera")}${scanning ? "Apunta al código QR…" : "Escanear con la cámara"}</span>
        </button>
        <div class="field">
          <label for="r-code">O escribe el código</label>
          <div class="field-inline"><input id="r-code" name="code" class="input num input--code" autocomplete="off" spellcheck="false" placeholder="CAC-XXXX0000" value="${esc(typed)}"><button class="btn btn--grana" type="submit">Buscar</button></div>
          ${fieldHelp("r-code", "Empieza con CAC- y está debajo del QR.")}
        </div>
      </form>
      <div data-result>${result()}</div>
      ${demoNote(`Para probar: ${redeemSamples.map((s) => `<button class="link-btn num" type="button" data-sample="${s.code}">${s.code}</button>`).join(" · ")}`)}
    </div>`;
  },
  bind(root, params, query, go, rerender) {
    const lookup = (raw) => {
      typed = raw.trim().toUpperCase();
      if (!CODE.test(typed)) {
        found = null;
        root.querySelector("[data-result]").innerHTML = "";
        return setError(root, "r-code", "Ese no parece un código: empieza con CAC- seguido de letras y números.");
      }
      done = false;
      found = store.lookupCoupon(typed);
      if (!found) {
        root.querySelector("[data-result]").innerHTML = "";
        return setError(root, "r-code", "No encontramos ese código. Revisa que esté bien escrito.");
      }
      setError(root, "r-code", "");
      root.querySelector("[data-result]").innerHTML = result();
    };
    root.querySelector("[data-lookup]").addEventListener("submit", (e) => {
      e.preventDefault();
      lookup(root.querySelector("#r-code").value);
    });
    root.addEventListener("click", (e) => {
      const sample = e.target.closest("[data-sample]");
      if (sample) {
        root.querySelector("#r-code").value = sample.dataset.sample;
        return lookup(sample.dataset.sample);
      }
      if (e.target.closest("[data-scan]")) {
        scanning = true;
        rerender();
        setTimeout(() => {
          scanning = false;
          typed = redeemSamples[0].code;
          found = store.lookupCoupon(typed);
          rerender();
        }, 1400);
        return;
      }
      if (e.target.closest("[data-clear]")) {
        found = null;
        done = false;
        typed = "";
        return rerender();
      }
      if (e.target.closest("[data-redeem]")) {
        store.redeem(found.code);
        toast(`Canjeado: ${store.productById(found.productId).name}`);
        found = store.lookupCoupon(found.code);
        done = true;
        rerender();
      }
    });
  },
};
