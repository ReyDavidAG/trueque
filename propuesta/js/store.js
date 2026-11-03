import { defaultBudgets, defaultCategories, defaultConfig, defaultLocations, defaultRules, profiles, redeemSamples, seedCoupons, seedLots, seedNotifications, seedProducts } from "./data.js";

const KEY = "trueque.demo.v3";
export const TODAY = "2026-11-02";

const blank = () => ({
  role: "member", session: null, offline: false, spent: {}, orders: [],
  config: {}, categories: {}, rules: {}, budgets: {}, locations: {}, extraLocations: [],
  products: {}, created: [], images: {}, reviews: {}, redeemed: {}, read: {}, custodia: {},
});

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
    return true;
  } catch {
    return false;
  }
}

const merge = (list, patches, key = "id") => list.map((x) => ({ ...x, ...(patches[x[key]] ?? {}) }));

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

export const config = () => ({ ...defaultConfig, ...state.config });
export function setConfig(patch) {
  state.config = { ...state.config, ...patch };
  save();
}
export const pesos = (cacaos) => cacaos * config().cacaoValue;
export const suggestedPrice = (cost) => Math.max(1, Math.round(cost / config().cacaoValue));

export const categories = () => merge(defaultCategories, state.categories);
export const categoryById = (id) => categories().find((c) => c.id === id);
export function setCategory(id, patch) {
  state.categories[id] = { ...(state.categories[id] ?? {}), ...patch };
  save();
}

export const rules = () => merge(defaultRules, state.rules);
export function setRule(id, patch) {
  state.rules[id] = { ...(state.rules[id] ?? {}), ...patch };
  save();
}

export const budgets = () => merge(defaultBudgets, state.budgets, "company");
export const budgetOf = (company) => budgets().find((b) => b.company === company);
export function setBudget(company, assigned) {
  state.budgets[company] = { ...(state.budgets[company] ?? {}), assigned };
  save();
}

export const locations = () => [...merge(defaultLocations, state.locations), ...state.extraLocations];
export const locationById = (id) => locations().find((l) => l.id === id);
export function saveLocation(loc) {
  if (defaultLocations.some((l) => l.id === loc.id)) state.locations[loc.id] = loc;
  else {
    const i = state.extraLocations.findIndex((l) => l.id === loc.id);
    if (i >= 0) state.extraLocations[i] = loc;
    else state.extraLocations.push(loc);
  }
  save();
}

export const products = () => [...merge(seedProducts, state.products), ...state.created.map((p) => ({ ...p, ...(state.products[p.id] ?? {}) }))];
export const liveProducts = () => products().filter((p) => p.status === "live");
export const productById = (id) => products().find((p) => p.id === id);
export const productsOf = (company) => products().filter((p) => p.company === company && !p.fromCustodia);
export const reviewQueue = () => products().filter((p) => p.status === "pending");

export function saveProduct(data) {
  const current = productById(data.id);
  if (!current) {
    const id = `p${Date.now().toString(36)}`;
    state.created.push({ ...data, id, status: "pending", stall: data.stall ?? "grana" });
    save();
    return id;
  }
  const repriced = current.price !== data.price || current.cost !== data.cost;
  state.products[data.id] = { ...(state.products[data.id] ?? {}), ...data, status: repriced ? "pending" : current.status };
  save();
  return data.id;
}

export function setProductStatus(id, status) {
  state.products[id] = { ...(state.products[id] ?? {}), status };
  save();
}

export const images = (id) => state.images[id] ?? [];
export function setImages(id, list) {
  state.images[id] = list.slice(0, 2);
  return save();
}

export const reviewOf = (id) => state.reviews[id];
export function review(id, decision, price, reason) {
  state.reviews[id] = { decision, price, reason, date: TODAY };
  const patch = { status: decision === "rejected" ? "rejected" : "live" };
  if (decision === "adjusted") patch.price = price;
  state.products[id] = { ...(state.products[id] ?? {}), ...patch };
  save();
}

export const custodiaState = (folio) => state.custodia[folio];
export function postCustodia(folio) {
  state.custodia[folio] = "pending";
  save();
}

export function lots() {
  const months = config().lotMonths;
  return seedLots
    .map((l) => {
      const expires = addMonths(l.earned, months);
      const left = l.amount - (l.used ?? 0) - (state.spent[l.id] ?? 0);
      return { ...l, expires, left, expired: expires <= TODAY };
    })
    .filter((l) => !l.expired && l.left > 0)
    .sort((a, b) => a.earned.localeCompare(b.earned));
}

export const balance = () => lots().reduce((s, l) => s + l.left, 0);
export const expiringSoon = (days = 60) => lots().filter((l) => daysBetween(TODAY, l.expires) <= days);

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
    code: `CAC-${p.id.slice(0, 2).toUpperCase()}${seq}`,
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

export function lookupCoupon(raw) {
  const code = raw.trim().toUpperCase();
  const mine = state.orders.find((o) => o.code === code);
  const who = state.session;
  const found = mine
    ? { code, folio: mine.folio, productId: mine.productId, person: who?.name ?? "", number: who?.number ?? "", validUntil: mine.validUntil, status: "valid", place: productById(mine.productId).place }
    : redeemSamples.find((s) => s.code === code);
  if (!found) return null;
  const used = state.redeemed[code];
  return used ? { ...found, status: "used", usedOn: used } : found;
}

export function redeem(code) {
  const c = lookupCoupon(code);
  const p = c && productById(c.productId);
  state.redeemed[code.trim().toUpperCase()] = TODAY;
  if (p) {
    const b = budgetOf(p.company);
    state.budgets[p.company] = { ...(state.budgets[p.company] ?? {}), redeemed: b.redeemed + p.cost };
  }
  save();
}

export function notifications(role) {
  return (seedNotifications[role] ?? []).map((n) => ({ ...n, read: !!state.read[n.id] }));
}
export function markAllRead(role) {
  for (const n of seedNotifications[role] ?? []) state.read[n.id] = true;
  save();
}

export const role = () => state.role;
export function setRole(r) {
  state.role = r;
  const p = profiles.find((x) => x.role === r);
  if (p && state.session) state.session = { number: p.number, name: p.name, position: p.position, company: p.company };
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
  return { ...profiles[0], number, name: "Colaborador de ejemplo" };
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
  const mine = state.orders.map((o) => ({ ...o, status: state.redeemed[o.code] ? "used" : o.validUntil < TODAY ? "expired" : "valid", usedOn: state.redeemed[o.code] }));
  return [...mine.reverse(), ...seedCoupons];
}

export function movements() {
  const earned = seedLots.map((l) => ({ date: l.earned, label: l.source, amount: l.amount }));
  const spent = [...seedCoupons, ...state.orders].map((o) => ({ date: o.date, label: `Trueque ${o.folio} · ${productById(o.productId).name}`, amount: -(o.price ?? productById(o.productId).price) }));
  return [...earned, ...spent].sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
}
