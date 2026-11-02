import { products, profiles, seedCoupons, seedLots } from "./data.js";

const KEY = "trueque.demo.v1";
export const TODAY = "2026-11-02";

const blank = () => ({ role: "member", session: null, offline: false, spent: {}, orders: [], published: [], decisions: {} });

function read() {
  try {
    return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return blank();
  }
}

let state = read();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export const addMonths = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

export function lots() {
  return seedLots
    .map((l) => {
      const expires = addMonths(l.earned, 12);
      const left = l.amount - (l.used ?? 0) - (state.spent[l.id] ?? 0);
      return { ...l, expires, left, expired: expires <= TODAY };
    })
    .filter((l) => !l.expired && l.left > 0)
    .sort((a, b) => a.earned.localeCompare(b.earned));
}

export const balance = () => lots().reduce((s, l) => s + l.left, 0);

export function expiringSoon(days = 60) {
  return lots().filter((l) => daysBetween(TODAY, l.expires) <= days);
}

export function plan(price) {
  let need = price;
  const take = [];
  for (const l of lots()) {
    if (need <= 0) break;
    const n = Math.min(l.left, need);
    take.push({ lot: l, n });
    need -= n;
  }
  return need > 0 ? null : take;
}

export const productById = (id) => products.find((p) => p.id === id);

export function stockLeft(p) {
  if (p.stock == null) return null;
  return p.stock - state.orders.filter((o) => o.productId === p.id).length;
}

export function trade(productId) {
  const p = productById(productId);
  const steps = plan(p.price);
  if (!steps || stockLeft(p) === 0) return null;
  const before = balance();
  for (const { lot, n } of steps) state.spent[lot.id] = (state.spent[lot.id] ?? 0) + n;
  const seq = 1041 + state.orders.length;
  const order = {
    folio: `TRQ-${seq}`,
    code: `CAC-${seq.toString(36).toUpperCase()}${p.id.slice(0, 2).toUpperCase()}${(p.price * 7).toString(36).toUpperCase()}`,
    productId: p.id,
    price: p.price,
    before,
    after: before - p.price,
    used: steps.map(({ lot, n }) => ({ source: lot.source, n, expires: lot.expires })),
    date: TODAY,
    validUntil: addDays(TODAY, p.couponDays),
  };
  state.orders.push(order);
  save();
  return order;
}

export const orderByFolio = (folio) => state.orders.find((o) => o.folio === folio);
export const orders = () => [...state.orders].reverse();

export const role = () => state.role;
export function setRole(r) {
  state.role = r;
  const p = profiles.find((x) => x.role === r);
  if (p && state.session) state.session = { number: p.number, name: p.name, position: p.position, company: p.company };
  save();
}

export const decision = (id) => state.decisions[id];
export function decide(id, value) {
  state.decisions[id] = value;
  save();
}

export const published = () => state.published;
export function publish(item) {
  state.published.push(item);
  save();
}

export function reset() {
  const { role: r, session: who } = state;
  state = { ...blank(), role: r, session: who };
  save();
}

export function findProfile(number) {
  const known = profiles.find((p) => p.number === number);
  if (known) return known;
  const base = profiles[0];
  return { ...base, number, name: "Colaborador de ejemplo" };
}

export const session = () => state.session;
export function signIn(profile) {
  state.session = { number: profile.number, name: profile.name, position: profile.position, company: profile.company };
  state.role = profile.role;
  save();
}
export function signOut() {
  state.session = null;
  save();
}

export const offline = () => state.offline;
export function setOffline(on) {
  state.offline = on;
  save();
}

export function coupons() {
  const mine = state.orders.map((o) => ({ ...o, status: o.validUntil < TODAY ? "expired" : "valid" }));
  return [...mine.reverse(), ...seedCoupons];
}

export function movements() {
  const earned = seedLots.map((l) => ({ date: l.earned, label: l.source, amount: l.amount, kind: "earn" }));
  const spent = [...seedCoupons, ...state.orders].map((o) => ({ date: o.date, label: `Trueque ${o.folio} · ${productById(o.productId).name}`, amount: -(o.price ?? productById(o.productId).price), kind: "spend" }));
  return [...earned, ...spent].sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
}
