import { marketScene, wordmark } from "../art.js";
import * as store from "../store.js";
import { companyName, esc, icon } from "../ui.js";

let pending = null;

export const initials = (name) => name.split(" ").filter((w) => w.length > 2).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function numberStep(error = "", value = "") {
  return `<form class="signin__card animate-page-in" data-step="number" novalidate>
    <h2 class="h2">Entra con tu número</h2>
    <p class="muted">El mismo de tu gafete o de tu recibo de nómina.</p>
    <div class="field">
      <label for="emp">Número de trabajador</label>
      <input id="emp" name="emp" class="input input--number num${error ? " animate-nudge" : ""}" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="00000" value="${esc(value)}" aria-describedby="emp-help"${error ? ' aria-invalid="true"' : ""}>
      <p class="field__help${error ? " is-error" : ""}" id="emp-help">${error || "Mínimo 5 dígitos, sólo números."}</p>
    </div>
    <button class="btn btn--grana btn--lg btn--block" type="submit">Continuar${icon("arrowRight")}</button>
    <p class="signin__demo">${icon("info")}<span>Demo: <b class="num">10001</b> colaborador · <b class="num">10002</b> empresa · <b class="num">10003</b> RH</span></p>
  </form>`;
}

function confirmStep(p) {
  return `<div class="signin__card animate-page-in" data-step="confirm">
    <h2 class="h2">¿Eres tú?</h2>
    <div class="who">
      <span class="who__avatar" aria-hidden="true">${esc(initials(p.name))}</span>
      <span class="who__text"><strong>${esc(p.name)}</strong><span>${esc(p.position)}</span><span class="muted">${esc(companyName(p.company))} · No. <span class="num">${esc(p.number)}</span></span></span>
    </div>
    <button class="btn btn--grana btn--lg btn--block" type="button" data-yes>Sí, entrar</button>
    <button class="btn btn--ghost btn--block" type="button" data-no>No soy yo</button>
  </div>`;
}

export default {
  title: "Entrar",
  render() {
    return `<div class="signin">
      <section class="signin__story">
        <span class="signin__brand">${wordmark()}</span>
        <h1 class="display">Lo que propones vale cacao.</h1>
        <p class="lede">Cada chispa que ayuda a resolver un reto te da cacaos. Aquí los cambias por servicios y artículos de las empresas del grupo.</p>
      </section>
      <section class="signin__panel" data-slot>${pending ? confirmStep(pending) : numberStep()}</section>
      <div class="signin__scene">${marketScene()}</div>
    </div>`;
  },
  bind(root, params, query, go) {
    const slot = root.querySelector("[data-slot]");
    const show = (html) => {
      slot.innerHTML = html;
      wire();
    };
    function wire() {
      const form = slot.querySelector('[data-step="number"]');
      if (form) {
        const input = form.querySelector("input");
        input.addEventListener("input", () => (input.value = input.value.replace(/\D/g, "")));
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const v = input.value.trim();
          if (v.length < 5) {
            show(numberStep(v ? "Te faltan dígitos: son mínimo 5." : "Escribe tu número de trabajador.", v));
            return slot.querySelector("input").focus();
          }
          const btn = form.querySelector("button[type=submit]");
          btn.disabled = true;
          btn.dataset.state = "loading";
          btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Buscando…`;
          setTimeout(() => {
            pending = store.findProfile(v);
            show(confirmStep(pending));
            slot.querySelector("[data-yes]").focus();
          }, 650);
        });
        return;
      }
      slot.querySelector("[data-yes]")?.addEventListener("click", (e) => {
        e.currentTarget.disabled = true;
        e.currentTarget.innerHTML = `<span class="spinner" aria-hidden="true"></span>Entrando…`;
        setTimeout(() => {
          store.signIn(pending);
          pending = null;
          go("/");
        }, 500);
      });
      slot.querySelector("[data-no]")?.addEventListener("click", () => {
        pending = null;
        show(numberStep());
        slot.querySelector("input").focus();
      });
    }
    wire();
  },
};
