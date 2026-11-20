import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2]);
const chispa = resolve(process.env.CHISPA_DIR ?? `${root}/../Chispa`);
const db = new PGlite();
const ok = (m) => console.log("ok  ", m);
const fail = (m) => { console.log("FAIL", m); process.exitCode = 1; };
const migrations = (dir) => readdirSync(`${dir}/supabase/migrations`).filter((f) => f.endsWith(".sql")).sort().map((f) => `${dir}/supabase/migrations/${f}`);

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
for (const f of migrations(chispa)) await db.exec(readFileSync(f, "utf8"));
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  revoke select on public.ideas from authenticated;
  grant select (id, fair_id, folio, challenge_id, is_anonymous, status, support_count, comment_count, created_at) on public.ideas to authenticated;
  grant usage on all sequences in schema public to authenticated;
`);
await db.exec(readFileSync(`${chispa}/supabase/seed_demo_org.sql`, "utf8"));
await db.exec(readFileSync(`${chispa}/supabase/seed.sql`, "utf8"));
for (const f of migrations(root)) await db.exec(readFileSync(f, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed_demo.sql`, "utf8"));
ok("migraciones de Chispa y de El Trueque aplicadas en la misma base");

const U = { member: "11111111-1111-1111-1111-111111111111", lead: "22222222-2222-2222-2222-222222222222", store: "33333333-3333-3333-3333-333333333333", hr: "44444444-4444-4444-4444-444444444444", other: "55555555-5555-5555-5555-555555555555", attendant: "66666666-6666-6666-6666-666666666666" };
await db.exec(`
  insert into public.companies (code, name) values ('OTRA', 'Otra empresa de ejemplo');
  insert into public.areas (company_id, code, name) select id, 'ADMI', 'Administración' from public.companies where code = 'OTRA';
  insert into people (employee_number, full_name, area_id, auth_subject) values
    ('10001', 'Colaborador Uno', (select id from areas where code='CALI'), '${U.member}'),
    ('10002', 'Responsable Mtto', (select id from areas where code='MANT'), '${U.lead}'),
    ('10003', 'Encargado de la tienda', (select id from areas where code='RHUM'), '${U.store}'),
    ('10004', 'RH corporativo', (select id from areas where code='RHUM'), '${U.hr}'),
    ('10005', 'Persona de otra empresa', (select id from areas where code='ADMI'), '${U.other}'),
    ('10006', 'Atiende el comedor', (select id from areas where code='LOGI'), '${U.attendant}');
  update areas set manager_id = (select id from people where employee_number='10002') where code='MANT';
  insert into trueque.store_managers select c.id, p.id from companies c, people p where c.code='DEMO' and p.employee_number='10003';
  insert into trueque.hr_reviewers select id from people where employee_number='10004';
  update trueque.exchange_locations set attendant_id = (select id from people where employee_number='10006') where name = 'Comedor de planta';
`);

async function as(user, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user}', false); set role authenticated;`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role;"); }
}
async function expectError(label, fn, match) {
  try { await fn(); fail(`${label}: debió fallar`); } catch (e) { match && !String(e.message).includes(match) ? fail(`${label}: ${e.message}`) : ok(label); }
}
const balance = async (user) => (await as(user, `select coalesce((select balance from trueque.balances), 0) b`)).rows[0].b;

const base = `fair_id, area_id, owner_id, title, summary, problem, affects, frequency, tried, success, closes_on`;
const values = (owner) => `(select id from fairs where is_current), (select id from areas where code='MANT'), (select id from people where employee_number='${owner}'),
  'Las órdenes de mantenimiento se pierden', 'Cada falla se reporta por un canal distinto.', 'Los reportes de falla llegan en hojas, mensajes y de palabra, y se pierden.',
  'Técnicos', '40 por semana', 'Un Excel', 'Que cada falla tenga folio', current_date + 20`;
const c1 = await as(U.lead, `insert into challenges (${base}) values (${values("10002")}) returning id`);
const challengeId = c1.rows[0].id;
(await balance(U.lead)) === 15 ? ok("publicar un reto abona 15 cacaos al responsable") : fail(`reto: ${await balance(U.lead)}`);

await as(U.member, `insert into challenges (${base}, status, suggested_by) values (${values("10002")}, 'suggested', (select id from people where employee_number='10001'))`);
(await balance(U.member)) === 0 ? ok("sugerir un reto no abona mientras no se acepte") : fail("sugerido abonó");
await db.exec(`update challenges set status = 'open' where status = 'suggested'`);
(await balance(U.member)) === 15 ? ok("cuando el área acepta el reto sugerido, abona a quien lo sugirió") : fail(`aceptado: ${await balance(U.member)}`);

const idea = (n) => `insert into ideas (challenge_id, author_id, solution_type_code, title, summary, how)
  values ('${challengeId}', (select id from people where employee_number='10001'), 'software', 'Reportar con QR ${n}', 'Escaneas el QR y queda la orden con folio.', 'Cada equipo lleva un QR que abre la captura.') returning id`;
const ideas = [];
for (let i = 1; i <= 5; i++) ideas.push((await as(U.member, idea(i))).rows[0].id);
(await balance(U.member)) === 15 + 20 ? ok("5 chispas en el mes abonan sólo 4 × 5 (tope mensual)") : fail(`tope: ${await balance(U.member)}`);

await as(U.lead, `update ideas set status = 'review' where id = $1`, [ideas[0]]);
await as(U.lead, `update ideas set status = 'received' where id = $1`, [ideas[0]]);
await as(U.lead, `update ideas set status = 'review' where id = $1`, [ideas[0]]);
(await balance(U.member)) === 45 ? ok("pasar a revisión abona 10 una sola vez aunque el estado vaya y venga") : fail(`revisión: ${await balance(U.member)}`);
await db.exec(`update ideas set status = 'selected' where id = '${ideas[0]}'`);
(await balance(U.member)) === 105 ? ok("llegar a la feria abona 60") : fail(`feria: ${await balance(U.member)}`);
const support = await db.query(`select count(*)::int n from trueque.ledger where rule_code = 'support'`);
support.rows[0].n === 0 ? ok("avivar no abona") : fail("avivar abonó");

await expectError("nadie escribe en el libro directamente", () => as(U.member, `insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_ref, expires_on) values ((select id from people where employee_number='10001'), (select id from companies where code='DEMO'), 'earn', 999, 'idea', 'chispa.idea', 'x', current_date + 30)`));
await expectError("el libro no se edita", () => db.query(`update trueque.ledger set amount = 999`), "no se edita");
const others = await as(U.other, `select count(*)::int n from trueque.ledger`);
others.rows[0].n === 0 ? ok("cada quien ve sólo sus movimientos") : fail("ledger ajeno visible");

await db.exec(`
  insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_id, source_ref, expires_on)
  select id, (select id from companies where code='DEMO'), 'earn', 30, 'done', 'chispa.idea', gen_random_uuid(), 'CHI-900', current_date + 10 from people where employee_number = '10001';
`);
(await balance(U.member)) === 135 ? ok("saldo con un lote que vence pronto: 135") : fail(`saldo: ${await balance(U.member)}`);
const exp60 = await as(U.member, `select expiring_60d from trueque.balances`);
exp60.rows[0].expiring_60d === 30 ? ok("la vista avisa 30 cacaos por vencer en 60 días") : fail(`por vencer: ${exp60.rows[0].expiring_60d}`);

const products = await as(U.member, `select id, name, price, stock_left from trueque.product_cards order by price`);
products.rows.length === 5 ? ok("el colaborador ve los 5 productos vivos de su empresa") : fail(`productos: ${products.rows.length}`);
const termo = products.rows.find((p) => p.name.startsWith("Termo"));
const taller = products.rows.find((p) => p.name.startsWith("Afinación"));
await expectError("no se puede cambiar lo que no alcanza", () => as(U.member, `select * from trueque.trade($1)`, [taller.id]), "te faltan");

const t = await as(U.member, `select * from trueque.trade($1)`, [termo.id]);
t.rows[0].folio === "DSP-0001" && t.rows[0].code.startsWith("YEM-") && t.rows[0].balance === 95 ? ok("canje: folio DSP-0001, cupón YEM- y saldo 95") : fail(JSON.stringify(t.rows[0]));
const alloc = await db.query(`select l.source_ref, a.amount from trueque.lot_allocations a join trueque.ledger l on l.id = a.lot_id order by a.amount desc`);
alloc.rows[0].source_ref === "CHI-900" && alloc.rows[0].amount === 30 && alloc.rows.length === 2 ? ok("FIFO: se gastan primero los 30 que vencen antes y luego el siguiente lote") : fail(JSON.stringify(alloc.rows));
const coupon = await as(U.member, `select c.state, c.swaps_budget, (c.valid_until::date - current_date) days from trueque.coupons c`);
coupon.rows[0].state === "valid" && coupon.rows[0].days === 45 ? ok("el cupón vale los 45 días del producto") : fail(JSON.stringify(coupon.rows[0]));
const left = await as(U.member, `select stock_left from trueque.product_cards where id = $1`, [termo.id]);
left.rows[0].stock_left === 17 ? ok("existencias: quedan 17 de 18") : fail(`stock ${left.rows[0].stock_left}`);

await db.exec(`update trueque.products set stock = 1 where id = '${termo.id}'`);
await expectError("producto agotado no se puede cambiar", () => as(U.member, `select * from trueque.trade($1)`, [termo.id]), "agotó");

const otherSees = await as(U.other, `select count(*)::int n from trueque.product_cards`);
otherSees.rows[0].n === 0 ? ok("otra empresa no ve los productos de esta") : fail(`otra empresa ve ${otherSees.rows[0].n}`);

const code = t.rows[0].code;
await expectError("un colaborador no canjea cupones", () => as(U.other, `select trueque.redeem($1, null)`, [code]));
const loc = await db.query(`select id from trueque.exchange_locations where name = 'Comedor de planta'`);
const red = await as(U.attendant, `select trueque.redeem($1, $2) s`, [code, loc.rows[0].id]);
const ord = await db.query(`select status from trueque.orders where folio = 1`);
red.rows[0].s === "used" && ord.rows[0].status === "used" ? ok("el lugar de canje canjea: cupón usado y trueque cerrado") : fail(red.rows[0].s);
await expectError("un cupón usado no se vuelve a canjear", () => as(U.attendant, `select trueque.redeem($1, $2)`, [code, loc.rows[0].id]), "ya se usó");

const draft = await as(U.store, `insert into trueque.products (company_id, category_code, kind, name, blurb, price, status, created_by)
  values ((select id from companies where code='DEMO'), 'item', 'item', 'Gorra bordada del grupo', 'Gorra con el logo bordado.', 35, 'pending', (select id from people where employee_number='10003')) returning id, folio`);
draft.rows.length === 1 ? ok(`la empresa propone un producto (PRD-${String(draft.rows[0].folio).padStart(4, "0")}) que queda pendiente`) : fail("propuesta");
await expectError("la empresa no se aprueba sola", () => as(U.store, `update trueque.products set status = 'live' where id = $1`, [draft.rows[0].id]));
const hidden = await as(U.member, `select count(*)::int n from trueque.product_cards where id = $1`, [draft.rows[0].id]);
hidden.rows[0].n === 0 ? ok("lo pendiente no se ve en el mercado") : fail("pendiente visible");
await expectError("sólo RH aprueba precios", () => as(U.store, `select trueque.review_price($1, 'approved')`, [draft.rows[0].id]), "Sólo RH");
await as(U.hr, `select trueque.review_price($1, 'adjusted', 30, 'Igual que en las demás empresas')`, [draft.rows[0].id]);
const live = await as(U.member, `select price from trueque.product_cards where id = $1`, [draft.rows[0].id]);
live.rows[0]?.price === 30 ? ok("RH ajusta el precio a 30 y el producto se publica") : fail("revisión");

await expectError("ninguna app cliente crea productos desde Custodia directamente", () => as(U.store, `select trueque.create_product_from_asset((select id from companies where code='DEMO'), 'Laptop', 'Revisada', null, 100, 'EQ-0001', null)`));

await db.exec(`update trueque.company_budgets set assigned = 60`);
const nutri = products.rows.find((p) => p.name.startsWith("Consulta"));
await expectError("si la empresa ya usó su presupuesto, no hay trueque", () => as(U.member, `select * from trueque.trade($1)`, [nutri.id]), "presupuesto");
await db.exec(`update trueque.company_budgets set assigned = 24000`);

await db.exec(`
  insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_id, source_ref, expires_on, created_at)
  select id, (select id from companies where code='DEMO'), 'earn', 50, 'done', 'chispa.idea', gen_random_uuid(), 'CHI-800', current_date - 1, now() - interval '13 months' from people where employee_number = '10001';
`);
const before = await balance(U.member);
const n = await db.query(`select trueque.expire_lots() n`);
const after = await balance(U.member);
n.rows[0].n === 1 && before === after ? ok("el lote vencido no cuenta en el saldo y expire_lots lo cierra en el libro") : fail(`vencidos ${n.rows[0].n} ${before} ${after}`);

// ───────── fase 1.1 ─────────
const pid = draft.rows[0].id;
await as(U.store, `update trueque.products set blurb = 'Gorra bordada, talla única.' where id = $1`, [pid]);
let st = (await db.query(`select status from trueque.products where id = $1`, [pid])).rows[0].status;
st === "live" ? ok("editar el texto de un producto publicado no lo saca del mercado") : fail(`texto: ${st}`);
await as(U.store, `update trueque.products set cost = 200 where id = $1`, [pid]);
st = (await db.query(`select status from trueque.products where id = $1`, [pid])).rows[0].status;
st === "pending" ? ok("cambiar el costo lo regresa a revisión de RH") : fail(`costo: ${st}`);
await expectError("ajustar sin motivo no se puede", () => as(U.hr, `select trueque.review_price($1, 'adjusted', 40)`, [pid]), "motivo");
await expectError("ajustar fuera del rango no se puede", () => as(U.hr, `select trueque.review_price($1, 'adjusted', 900, 'Precio fuera de lugar')`, [pid]), "entre");
await as(U.hr, `select trueque.review_price($1, 'approved')`, [pid]);
await as(U.store, `update trueque.products set status = 'paused' where id = $1`, [pid]);
await as(U.store, `update trueque.products set status = 'live' where id = $1`, [pid]);
st = (await db.query(`select status from trueque.products where id = $1`, [pid])).rows[0].status;
st === "live" ? ok("la empresa pausa y reanuda su producto") : fail(`reanudar: ${st}`);
const notes = await as(U.store, `select kind, body from trueque.notifications order by id`);
notes.rows.some((n) => n.kind === "review") ? ok("quien publicó recibe el aviso de la decisión de RH") : fail(JSON.stringify(notes.rows));
const earnNotes = await as(U.member, `select count(*)::int n from trueque.notifications where kind = 'earn'`);
earnNotes.rows[0].n > 0 ? ok("ganar cacaos deja un aviso") : fail("aviso de ganancia");
const usage = await as(U.store, `select committed, redeemed from trueque.budget_usage`);
Number(usage.rows[0].redeemed) > 0 ? ok(`el canje se carga en pesos a la empresa que ofrece ($${usage.rows[0].redeemed})`) : fail(JSON.stringify(usage.rows));
const tiny = "data:image/webp;base64,UklGRhIAAABXRUJQVlA4TAYAAAAvAAAAAAA=";
await as(U.store, `insert into trueque.product_images (product_id, position, data, bytes) values ($1, 1, $2, 30)`, [pid, tiny]);
const img = await as(U.member, `select count(*)::int n from trueque.product_images where product_id = $1`, [pid]);
img.rows[0].n === 1 ? ok("la empresa sube la foto y el colaborador la ve") : fail("foto");
await expectError("un colaborador no sube fotos", () => as(U.member, `insert into trueque.product_images (product_id, position, data, bytes) values ($1, 2, $2, 30)`, [pid, tiny]));
await expectError("sólo dos fotos por producto", () => as(U.store, `insert into trueque.product_images (product_id, position, data, bytes) values ($1, 3, $2, 30)`, [pid, tiny]));
await as(U.hr, `update trueque.config set cacao_value = 6`);
const cv = (await db.query(`select cacao_value from trueque.config`)).rows[0].cacao_value;
Number(cv) === 6 ? ok("RH cambia el valor del cacao") : fail(`valor ${cv}`);
await as(U.member, `update trueque.config set cacao_value = 1`);
Number((await db.query(`select cacao_value from trueque.config`)).rows[0].cacao_value) === 6 ? ok("un colaborador no cambia el valor del cacao") : fail("valor cambiado");
await expectError("el presupuesto no baja de lo ya usado", () => as(U.hr, `update trueque.company_budgets set assigned = 1`), "menor");
const look = await as(U.attendant, `select state, product_name from trueque.coupon_lookup($1)`, [code]);
look.rows[0]?.state === "used" ? ok("quien atiende el lugar consulta el cupón antes de canjear") : fail(JSON.stringify(look.rows));
const lookMember = await as(U.member, `select count(*)::int n from trueque.coupon_lookup($1)`, [code]);
lookMember.rows[0].n === 0 ? ok("un colaborador no consulta cupones ajenos") : fail("consulta ajena");
const dash = await as(U.hr, `select earned, active_people from trueque.dashboard_totals`);
dash.rows[0].earned > 0 ? ok(`el tablero suma ${dash.rows[0].earned} cacaos dados`) : fail("tablero");
const hrNotes = await as(U.hr, `select count(*)::int n from trueque.notifications where kind = 'review' and body like '%espera que revises%'`);
hrNotes.rows[0].n > 0 ? ok("RH recibe aviso cuando llega un precio por revisar") : fail("aviso a RH");
const stalls = await db.query(`select stall from trueque.products where art = 'plate'`);
stalls.rows.every((r) => r.stall === "achiote") ? ok("los productos de antes toman el toldo de su ilustración") : fail(JSON.stringify(stalls.rows));

// ───────── La Despensa: categorías y folios ─────────
const cats = (await as(U.member, `select code, self_service from trueque.categories order by position`)).rows;
cats[0]?.code === "pantry" && cats.find((c) => c.code === "custodia")?.self_service === false ? ok("«De la despensa» va primero y Custodia no recibe altas de empresas") : fail(JSON.stringify(cats));
const demo = `(select id from companies where code='DEMO')`;
const storeId = `(select id from people where employee_number='10003')`;
await expectError("una empresa no publica a mano en Custodia", () => as(U.store, `insert into trueque.products (company_id, category_code, kind, name, blurb, price, status, created_by) values (${demo}, 'custodia', 'item', 'Laptop revisada', 'Equipo que todavía sirve.', 100, 'pending', ${storeId})`), "sólo publica RH");
await as(U.hr, `insert into trueque.categories (code, name, price_min, price_max, position, description) values ('crafts', 'Artesanías', 10, 120, 5, 'Hecho a mano por gente del grupo.')`);
(await db.query(`select count(*)::int n from trueque.categories where code = 'crafts'`)).rows[0].n === 1 ? ok("RH da de alta una categoría con un renglón") : fail("alta de categoría");
await expectError("un colaborador no da de alta categorías", () => as(U.member, `insert into trueque.categories (code, name, price_min, price_max, position) values ('nope', 'Nope', 1, 2, 9)`));
await as(U.store, `insert into trueque.products (company_id, category_code, kind, name, blurb, price, status, created_by) values (${demo}, 'crafts', 'item', 'Canasta tejida', 'Canasta hecha a mano.', 40, 'pending', ${storeId})`);
ok("la empresa publica en la categoría nueva");
await as(U.hr, `update trueque.categories set is_active = false where code = 'crafts'`);
await expectError("una categoría apagada no recibe productos", () => as(U.store, `insert into trueque.products (company_id, category_code, kind, name, blurb, price, status, created_by) values (${demo}, 'crafts', 'item', 'Otra canasta', 'Canasta hecha a mano.', 40, 'pending', ${storeId})`), "ya no recibe productos");
const kept = await db.query(`select count(*)::int n from trueque.products where category_code = 'crafts'`);
kept.rows[0].n === 1 ? ok("apagar la categoría no borra lo que ya tenía") : fail("producto perdido");
(await db.query(`select trueque.format_folio('order', 7) f`)).rows[0].f === "DSP-0007" ? ok("format_folio arma DSP-0007") : fail("format_folio");
const fc = await db.query(`select folio_code from trueque.orders where folio = 1`);
fc.rows[0].folio_code === "DSP-0001" ? ok("el canje guarda su folio formateado") : fail(JSON.stringify(fc.rows));
await as(U.hr, `update trueque.folio_kinds set prefix = 'CNJ' where kind = 'order'`);
const comida = products.rows.find((p) => p.name.startsWith("Comida"));
const t2 = await as(U.member, `select * from trueque.trade($1)`, [comida.id]);
const old = await db.query(`select folio_code from trueque.orders where folio = 1`);
t2.rows[0].folio.startsWith("CNJ-") && old.rows[0].folio_code === "DSP-0001" ? ok("cambiar el prefijo sólo cambia los folios nuevos") : fail(`${t2.rows[0].folio} ${old.rows[0].folio_code}`);
await as(U.member, `update trueque.folio_kinds set prefix = 'XXX' where kind = 'order'`);
(await db.query(`select prefix from trueque.folio_kinds where kind = 'order'`)).rows[0].prefix === "CNJ" ? ok("un colaborador no cambia folios") : fail("prefijo cambiado");
await as(U.hr, `update trueque.folio_kinds set prefix = 'DSP' where kind = 'order'`);
const yemas = await as(U.member, `select body from trueque.notifications where kind = 'earn' order by id desc limit 1`);
/yemas/.test(yemas.rows[0]?.body ?? "") ? ok("los avisos hablan de yemas") : fail(JSON.stringify(yemas.rows));
await expectError("el candado del libro dice yemas", () => db.query(`delete from trueque.ledger`), "libro de yemas");

// ───────── Regalos de yemas ─────────
await db.exec(`insert into trueque.grant_approvers select id from people where employee_number = '10002'`);
const person = (n) => `(select id from people where employee_number='${n}')`;
const row = (n, amount = 50, note = "Por su trabajo en todo el año.") => ({ employee_number: n, amount, note });
const save = (user, o = {}) => as(user,
  `select trueque.grant_save($1::uuid, $2, $3, $4, $5, $6::uuid, $7::int, current_date + $8::int, $9::int, $10::jsonb) id`,
  [o.id ?? null, o.occasion ?? "christmas", o.name ?? "Regalo de Navidad 2026", o.reason ?? "Gracias por un año de trabajo en equipo y de chispas.",
   o.scope ?? "list", o.scopeId ?? null, o.amount ?? null, o.days ?? 0, o.months ?? 6, JSON.stringify(o.list ?? [])]).then((r) => r.rows[0].id);
const status = async (id) => (await db.query(`select status from trueque.grants where id = $1`, [id])).rows[0].status;
const submit = (user, id) => as(user, `select trueque.grant_submit($1)`, [id]);
const decide = (user, id, approve, note = null) => as(user, `select trueque.grant_decide($1, $2, $3) s`, [id, approve, note]);

await expectError("sólo RH arma regalos", () => save(U.member, { list: [row("10001")] }), "Sólo RH");
await expectError("RH no se incluye en su lista", () => save(U.hr, { list: [row("10004")] }), "incluirte");
await expectError("cada persona de la lista lleva motivo", () => save(U.hr, { list: [row("10001", 50, "corto")] }), "10 letras");
await expectError("un número que no existe no entra", () => save(U.hr, { list: [row("99999")] }), "No encontramos");
await expectError("el motivo del regalo lleva 20 letras", () => save(U.hr, { reason: "Porque sí", list: [row("10001")] }), "20 letras");
const xmas = await save(U.hr, { list: [row("10001"), row("10005")] });
const xf = await db.query(`select folio_code from trueque.grants where id = $1`, [xmas]);
xf.rows[0].folio_code === "REG-0001" && (await status(xmas)) === "draft" ? ok("RH arma un borrador con folio REG-0001") : fail(JSON.stringify(xf.rows));
const far = await save(U.hr, { occasion: "event", name: "Posada lejana", days: 90, list: [row("10001", 10)] });
await expectError("no se programa más allá de 60 días", () => submit(U.hr, far), "entre hoy");
const big = await save(U.hr, { occasion: "recognition", name: "Reconocimiento grande", list: [row("10001", 150)] });
await expectError("nadie recibe más de 100 en un regalo", () => submit(U.hr, big), "hasta 100");
await submit(U.hr, xmas);
(await status(xmas)) === "pending" ? ok("mandar a autorizar congela la lista") : fail(await status(xmas));
const ask = await as(U.lead, `select count(*)::int n from trueque.notifications where kind = 'grant'`);
ask.rows[0].n > 0 ? ok("quien autoriza recibe el aviso") : fail("aviso a quien autoriza");
await expectError("RH no autoriza", () => decide(U.hr, xmas, true), "permiso");
await expectError("sin fondo no se autoriza", () => decide(U.lead, xmas, true), "No hay fondo");
await expectError("un colaborador no define el fondo", () => as(U.member, `select trueque.grant_set_fund(extract(year from current_date)::int, 1000)`));
await as(U.lead, `select trueque.grant_set_fund(extract(year from current_date)::int, 80)`);
await expectError("si el fondo no alcanza no se autoriza", () => decide(U.lead, xmas, true), "no alcanza");
await as(U.lead, `select trueque.grant_set_fund(extract(year from current_date)::int, 100000)`);
await db.exec(`insert into trueque.grant_approvers select id from people where employee_number = '10004'`);
await expectError("cuatro ojos: quien arma no autoriza", () => decide(U.hr, xmas, true), "armaste");
await db.exec(`delete from trueque.grant_approvers where person_id = ${person("10004")}`);
await expectError("rechazar pide motivo", () => decide(U.lead, xmas, false, "no"), "motivo");
const before2 = await balance(U.member);
const d = await decide(U.lead, xmas, true);
d.rows[0].s === "delivered" && (await balance(U.member)) === before2 + 50 ? ok("si la fecha es hoy se entrega al autorizar: +50 yemas") : fail(`${d.rows[0].s} ${await balance(U.member)}`);
const gl = await as(U.member, `select source_ref, note from trueque.ledger where rule_code = 'grant'`);
gl.rows[0]?.source_ref === "REG-0001" && gl.rows[0]?.note === "Regalo de Navidad 2026" ? ok("el movimiento dice el folio y el nombre del regalo") : fail(JSON.stringify(gl.rows));
const gn = await as(U.member, `select body from trueque.notifications where body like 'Ganaste 50 yemas: Regalo de Navidad%'`);
gn.rows.length === 1 ? ok("la persona recibe el aviso del regalo") : fail("aviso de regalo");
const ev = await as(U.hr, `select kind from trueque.grant_events where grant_id = $1 order by id`, [xmas]);
ev.rows.map((r) => r.kind).join(",") === "created,submitted,approved,delivered" ? ok("la bitácora guarda cada paso") : fail(ev.rows.map((r) => r.kind).join(","));
await expectError("la bitácora no se edita", () => db.query(`update trueque.grant_events set note = 'x'`), "no se edita");
(await as(U.member, `select count(*)::int n from trueque.grants`)).rows[0].n === 0 ? ok("un colaborador no ve los regalos de RH") : fail("regalos visibles");
const again = await save(U.hr, { name: "Otra Navidad", list: [row("10001")] });
await expectError("Navidad se da una vez al año", () => submit(U.hr, again), "una vez al año");
await as(U.hr, `update trueque.config set grant_max_per_year = 120`);
const cap = await save(U.hr, { occasion: "recognition", name: "Reconocimiento al equipo", list: [row("10001", 80)] });
await expectError("tope de yemas de regalo al año", () => submit(U.hr, cap), "pasaría");
await as(U.hr, `update trueque.config set grant_max_per_year = 300`);
const mine = await save(U.hr, { occasion: "recognition", name: "Reconocimiento al mtto", list: [row("10002", 20)] });
await submit(U.hr, mine);
await expectError("quien autoriza no aprueba una lista donde aparece", () => decide(U.lead, mine, true), "apareces");
await expectError("cancelar algo en curso pide motivo", () => as(U.hr, `select trueque.grant_cancel($1, 'no')`, [mine]), "motivo");
await as(U.hr, `select trueque.grant_cancel($1, 'Se pidió por error, se arma otro.')`, [mine]);
(await status(mine)) === "cancelled" ? ok("RH cancela con motivo antes de entregar") : fail(await status(mine));
await submit(U.hr, cap);
await decide(U.lead, cap, false, "El monto no corresponde al reconocimiento.");
await save(U.hr, { id: cap, occasion: "recognition", name: "Reconocimiento al equipo", list: [row("10001", 30)] });
(await status(cap)) === "draft" ? ok("un regalo rechazado se corrige y vuelve a borrador") : fail(await status(cap));
const cali = `(select id from areas where code='CALI')`;
const preview = await as(U.hr, `select trueque.grant_preview('area', ${cali}) n`);
preview.rows[0].n >= 1 ? ok(`la vista previa cuenta ${preview.rows[0].n} personas del área`) : fail("vista previa");
await expectError("un colaborador no ve la vista previa", () => as(U.member, `select trueque.grant_preview('group', null)`), "Sólo RH");
const areaId = (await db.query(`select id from areas where code='CALI'`)).rows[0].id;
const later = await save(U.hr, { occasion: "event", name: "Evento de calidad", scope: "area", scopeId: areaId, amount: 10, days: 5 });
await submit(U.hr, later);
const before3 = await balance(U.member);
const s = await decide(U.lead, later, true);
s.rows[0].s === "scheduled" && (await balance(U.member)) === before3 ? ok("con fecha futura queda programado y no abona todavía") : fail(s.rows[0].s);
(await db.query(`select trueque.grant_deliver() n`)).rows[0].n === 0 ? ok("la tarea diaria no entrega antes de la fecha") : fail("entrega adelantada");
await expectError("un cliente no fuerza la entrega", () => as(U.hr, `select trueque.grant_deliver()`));
await db.exec(`update trueque.grants set deliver_on = current_date where id = '${later}'`);
await db.query(`select trueque.grant_deliver()`);
(await status(later)) === "delivered" && (await balance(U.member)) === before3 + 10 ? ok("el día de entrega la tarea diaria abona") : fail(`${await status(later)} ${await balance(U.member)}`);
await db.exec(`update trueque.grants set status = 'scheduled' where id = '${later}'`);
await db.query(`select trueque.grant_deliver()`);
(await balance(U.member)) === before3 + 10 ? ok("nadie recibe dos veces el mismo regalo") : fail("doble abono");
const fund = await as(U.lead, `select fund, delivered, available from trueque.grant_fund_usage`);
fund.rows[0].delivered >= 110 && fund.rows[0].available === fund.rows[0].fund - fund.rows[0].delivered ? ok(`el fondo descuenta lo entregado (${fund.rows[0].delivered} yemas)`) : fail(JSON.stringify(fund.rows));
await expectError("el fondo no baja de lo autorizado", () => as(U.lead, `select trueque.grant_set_fund(extract(year from current_date)::int, 1)`), "abajo");
const cards = await as(U.lead, `select scope_name, people, total from trueque.grant_cards where id = $1`, [xmas]);
cards.rows[0]?.people === 2 && cards.rows[0]?.total === 100 ? ok("la tarjeta del regalo dice personas y yemas") : fail(JSON.stringify(cards.rows));
const src = await as(U.hr, `select earned from trueque.dashboard_sources where label = 'Regalo de yemas'`);
src.rows[0]?.earned > 0 ? ok("el tablero muestra los regalos como fuente") : fail(JSON.stringify(src.rows));
