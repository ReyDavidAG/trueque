-- El Trueque · fase 1.1: valor del cacao, costo real, presupuesto en pesos de quien ofrece,
-- fotos, avisos, edición de productos, reglas configurables y vistas del tablero.

-- ───────────────────────── Configuración ─────────────────────────

alter table trueque.config add column cacao_value numeric(10, 2) not null default 5 check (cacao_value > 0);

alter table trueque.earning_rules drop constraint if exists earning_rules_source_check;
alter table trueque.earning_rules add constraint earning_rules_source_check check (source in ('chispa', 'insignias', 'rh'));
alter table trueque.earning_rules add column note text;
alter table trueque.earning_rules add column is_variable boolean not null default false;
alter table trueque.earning_rules add constraint earning_rules_variable_check check (not is_variable or cacaos = 0);

update trueque.earning_rules set note = v.note
from (values
  ('idea', 'Premia participar, no mandar diez iguales.'),
  ('review', 'Quiere decir que el área la tomó en serio.'),
  ('challenge', 'Contar bien un problema también vale.'),
  ('selected', 'La decide el comité con la rúbrica.'),
  ('done', 'El impacto real es lo que más paga.'),
  ('support', 'Si diera cacaos, todos avivarían todo.')
) as v (code, note)
where trueque.earning_rules.code = v.code;

insert into trueque.earning_rules (code, source, label, cacaos, monthly_cap, position, note, is_variable)
values ('badge', 'insignias', 'Recibes una insignia', 0, null, 7, 'Lo que valga la insignia: de 10 a 100 cacaos.', true)
on conflict (code) do nothing;

-- ───────────────────────── Productos: costo, lo que incluye y toldo ─────────────────────────

alter table trueque.products add column cost numeric(12, 2) not null default 0 check (cost >= 0);
alter table trueque.products add column includes text[] not null default '{}' check (cardinality(includes) <= 8);
alter table trueque.products add column stall text not null default 'grana' check (stall in ('grana', 'anil', 'nopal', 'achiote', 'maiz', 'cacao'));

update trueque.products set cost = price * (select cacao_value from trueque.config) where cost = 0 and origin = 'manual';

alter table trueque.orders add column cost numeric(12, 2) not null default 0 check (cost >= 0);
update trueque.orders o set cost = p.cost from trueque.products p where p.id = o.product_id and o.cost = 0;

-- Fotos del producto: hasta dos, en base64 (data URL), en una tabla aparte para que el mercado no las cargue todas.
create table trueque.product_images (
  product_id  uuid not null references trueque.products (id) on delete cascade,
  position    smallint not null check (position between 1 and 2),
  data        text not null check (data ~ '^data:image/(webp|png|jpeg);base64,' and length(data) <= 420000),
  bytes       integer not null check (bytes between 1 and 307200),
  created_at  timestamptz not null default now(),
  primary key (product_id, position)
);

-- ───────────────────────── Presupuesto en pesos, de la empresa que ofrece ─────────────────────────

drop view trueque.budget_usage;
alter table trueque.company_budgets alter column assigned type numeric(14, 2);
update trueque.company_budgets set assigned = assigned * (select cacao_value from trueque.config);

create view trueque.budget_usage
with (security_invoker = true)
as
select
  b.company_id,
  b.period,
  b.assigned,
  coalesce(sum(o.cost) filter (where o.status = 'used'), 0)::numeric(14, 2) as redeemed,
  coalesce(sum(o.cost) filter (where o.status = 'issued'), 0)::numeric(14, 2) as committed,
  (b.assigned - coalesce(sum(o.cost) filter (where o.status in ('used', 'issued')), 0))::numeric(14, 2) as available
from trueque.company_budgets b
left join trueque.products p on p.company_id = b.company_id
left join trueque.orders o on o.product_id = p.id and extract(year from o.created_at) = b.period
group by b.company_id, b.period, b.assigned;

drop view trueque.product_cards;
create view trueque.product_cards
with (security_invoker = true)
as
select
  p.id,
  'PRD-' || lpad(p.folio::text, 4, '0') as folio,
  p.company_id,
  p.category_code,
  p.kind,
  p.name,
  p.blurb,
  p.detail,
  p.includes,
  p.art,
  p.stall,
  p.price,
  p.cost,
  p.stock,
  case when p.stock is null then null
       else p.stock - (select count(*) from trueque.orders o where o.product_id = p.id and o.status not in ('cancelled', 'refunded'))::integer end as stock_left,
  p.coupon_days,
  p.swaps,
  p.location_id,
  p.available_from,
  p.available_until,
  p.status,
  p.origin,
  p.origin_ref,
  exists (select 1 from trueque.product_images i where i.product_id = p.id) as has_images,
  (select r.note from trueque.price_reviews r where r.product_id = p.id order by r.id desc limit 1) as review_note
from trueque.products p;

-- ───────────────────────── Trueque: cobra a la empresa que ofrece ─────────────────────────

create or replace function trueque.trade(p_product uuid)
returns table (folio text, code text, balance integer)
language plpgsql
security definer
set search_path = trueque, public
as $$
#variable_conflict use_column
declare
  v_me uuid := public.current_person_id();
  v_company uuid;
  p trueque.products;
  v_left integer;
  v_balance integer;
  v_spend bigint;
  v_order uuid;
  v_folio integer;
  v_code text;
  v_need integer;
  v_take integer;
  lot record;
  v_available numeric;
begin
  if v_me is null then
    raise exception 'Sin sesión';
  end if;
  v_company := trueque.person_company(v_me);
  select * into p from trueque.products where id = p_product for update;
  if p.id is null or p.status <> 'live' or not trueque.can_see_product(p.id) then
    raise exception 'Este producto no está disponible.';
  end if;
  if (p.available_from is not null and current_date < p.available_from) or (p.available_until is not null and current_date > p.available_until) then
    raise exception 'Este producto no está disponible en estas fechas.';
  end if;
  if p.stock is not null then
    select p.stock - count(*) into v_left from trueque.orders o where o.product_id = p.id and o.status not in ('cancelled', 'refunded');
    if v_left <= 0 then
      raise exception 'Se agotó.';
    end if;
  end if;
  select coalesce(b.balance, 0) into v_balance from trueque.balances b where b.person_id = v_me;
  if coalesce(v_balance, 0) < p.price then
    raise exception 'Todavía no te alcanza: te faltan % cacaos.', p.price - coalesce(v_balance, 0);
  end if;
  select u.available into v_available from trueque.budget_usage u where u.company_id = p.company_id and u.period = extract(year from now())::smallint;
  if v_available is not null and v_available < p.cost then
    raise exception 'La empresa que ofrece este producto ya usó su presupuesto de este año.';
  end if;

  v_folio := trueque.next_folio('TRQ');
  insert into trueque.ledger (person_id, company_id, kind, amount, source, source_id, source_ref, created_by)
  values (v_me, v_company, 'spend', -p.price, 'trueque.order', null, 'TRQ-' || lpad(v_folio::text, 4, '0'), v_me)
  returning id into v_spend;

  v_need := p.price;
  for lot in
    select l.id, l.remaining from trueque.lots l
     where l.person_id = v_me and l.remaining > 0 and l.expires_on > current_date
     order by l.expires_on, l.id
  loop
    exit when v_need = 0;
    v_take := least(lot.remaining, v_need);
    insert into trueque.lot_allocations (spend_id, lot_id, amount) values (v_spend, lot.id, v_take);
    v_need := v_need - v_take;
  end loop;

  insert into trueque.orders (folio, person_id, product_id, company_id, price, cost, spend_id)
  values (v_folio, v_me, p.id, v_company, p.price, p.cost, v_spend)
  returning id into v_order;

  v_code := 'CAC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into trueque.coupons (order_id, code, code_type, valid_until, swaps_budget, budget_amount)
  values (v_order, v_code, p.code_type, now() + make_interval(days => p.coupon_days), p.swaps, p.budget_amount);

  return query select 'TRQ-' || lpad(v_folio::text, 4, '0'), v_code, v_balance - p.price;
end;
$$;

-- ───────────────────────── Ver un cupón antes de canjearlo ─────────────────────────

create function trueque.coupon_lookup(p_code text)
returns table (code text, folio text, state text, valid_until timestamptz, swaps_left integer,
               product_id uuid, product_name text, product_art text, product_stall text, product_cost numeric,
               product_company uuid, person_name text, employee_number text, can_redeem boolean)
language sql
stable
security definer
set search_path = trueque, public
as $$
  select c.code, 'TRQ-' || lpad(o.folio::text, 4, '0'),
         case when c.state = 'valid' and c.valid_until < now() then 'expired' else c.state end,
         c.valid_until, c.swaps_budget - c.swaps_used,
         p.id, p.name, p.art, p.stall, p.cost, p.company_id, pe.full_name, pe.employee_number,
         trueque.is_store_manager(p.company_id)
           or exists (select 1 from trueque.exchange_locations l where l.id = p.location_id and l.attendant_id = public.current_person_id())
  from trueque.coupons c
  join trueque.orders o on o.id = c.order_id
  join trueque.products p on p.id = o.product_id
  join public.people pe on pe.id = o.person_id
  where c.code = upper(trim(p_code))
    and (trueque.is_store_manager(p.company_id) or trueque.is_hr_reviewer()
         or exists (select 1 from trueque.exchange_locations l where l.attendant_id = public.current_person_id()));
$$;

create or replace function trueque.redeem(p_code text, p_location uuid, p_amount numeric default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  c trueque.coupons;
  v_company uuid;
begin
  select * into c from trueque.coupons where code = upper(trim(p_code)) for update;
  if c.id is null then
    raise exception 'No encontramos ese código. Revisa que esté bien escrito.';
  end if;
  select p.company_id into v_company from trueque.orders o join trueque.products p on p.id = o.product_id where o.id = c.order_id;
  if not (trueque.is_store_manager(v_company)
          or exists (select 1 from trueque.exchange_locations l where l.id = p_location and l.attendant_id = public.current_person_id())) then
    raise exception 'Este cupón es de otro puesto: lo canjea la empresa que ofrece el producto.';
  end if;
  if c.state = 'used' then
    raise exception 'Este cupón ya se usó.';
  end if;
  if c.state <> 'valid' or c.valid_until < now() then
    raise exception 'Este cupón ya venció.';
  end if;
  if c.budget_amount is not null and (p_amount is null or c.used_amount + p_amount > c.budget_amount) then
    raise exception 'El monto rebasa lo que queda en el cupón.';
  end if;
  update trueque.coupons
     set swaps_used = swaps_used + 1,
         used_amount = used_amount + coalesce(p_amount, 0),
         state = case when swaps_used + 1 >= swaps_budget then 'used' else state end
   where id = c.id
  returning * into c;
  insert into trueque.redemptions (coupon_id, location_id, redeemed_by, amount, remaining_swaps, remaining_amount)
  values (c.id, p_location, public.current_person_id(), p_amount, c.swaps_budget - c.swaps_used, c.budget_amount - c.used_amount);
  if c.state = 'used' then
    update trueque.orders set status = 'used' where id = c.order_id;
  end if;
  return c.state;
end;
$$;

-- ───────────────────────── Revisión de precios: motivo y rango ─────────────────────────

create or replace function trueque.review_price(p_product uuid, p_decision text, p_final_price integer default null, p_note text default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  p trueque.products;
  cat trueque.categories;
begin
  if not trueque.is_hr_reviewer() then
    raise exception 'Sólo RH aprueba precios.';
  end if;
  select * into p from trueque.products where id = p_product for update;
  if p.id is null or p.status <> 'pending' then
    raise exception 'Este producto no está esperando revisión.';
  end if;
  if p_decision in ('adjusted', 'rejected') and length(trim(coalesce(p_note, ''))) < 10 then
    raise exception 'Escribe el motivo: la empresa lo necesita para corregir.';
  end if;
  select * into cat from trueque.categories where code = p.category_code;
  if p_decision = 'adjusted' and (p_final_price is null or p_final_price < cat.price_min or p_final_price > cat.price_max) then
    raise exception 'El precio ajustado debe quedar entre % y % cacaos.', cat.price_min, cat.price_max;
  end if;
  insert into trueque.price_reviews (product_id, proposed, decision, final_price, reviewer_id, note)
  values (p.id, p.price, p_decision,
          case p_decision when 'approved' then p.price when 'adjusted' then p_final_price end,
          public.current_person_id(), nullif(trim(coalesce(p_note, '')), ''));
  update trueque.products
     set status = case p_decision when 'rejected' then 'rejected' else 'live' end,
         price = case p_decision when 'adjusted' then p_final_price else price end
   where id = p.id;
  return case p_decision when 'rejected' then 'rejected' else 'live' end;
end;
$$;

-- ───────────────────────── Editar, pausar y retirar productos ─────────────────────────

create function trueque.guard_product()
returns trigger
language plpgsql
set search_path = trueque, public
as $$
begin
  if trueque.is_hr_reviewer() or current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if new.status = 'live' and old.status not in ('live', 'paused') then
    raise exception 'Sólo RH publica productos.';
  end if;
  if (new.price <> old.price or new.cost <> old.cost or new.category_code <> old.category_code)
     and old.status in ('live', 'paused', 'rejected') and new.status <> 'retired' then
    new.status := 'pending';
  end if;
  if old.status = 'rejected' and new.status = 'rejected' then
    new.status := 'pending';
  end if;
  return new;
end;
$$;
create trigger trueque_guard_product before update on trueque.products for each row execute function trueque.guard_product();

drop policy edit_products on trueque.products;
create policy edit_products on trueque.products for update to authenticated
  using (trueque.is_store_manager(company_id))
  with check (trueque.is_store_manager(company_id) and status in ('draft', 'pending', 'paused', 'retired', 'live'));

alter table trueque.product_images enable row level security;
create policy read_images on trueque.product_images for select to authenticated
  using (exists (select 1 from trueque.products p where p.id = product_id));
create policy write_images on trueque.product_images for all to authenticated
  using (exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)))
  with check (exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)));

-- ───────────────────────── Ajustes de RH ─────────────────────────

create policy hr_config on trueque.config for update to authenticated using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());
create policy hr_rules on trueque.earning_rules for update to authenticated using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());
create policy hr_categories on trueque.categories for update to authenticated using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());
create policy hr_locations on trueque.exchange_locations for insert to authenticated with check (trueque.is_hr_reviewer());
create policy hr_locations_edit on trueque.exchange_locations for update to authenticated using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());

create function trueque.guard_budget()
returns trigger
language plpgsql
set search_path = trueque, public
as $$
declare
  v_used numeric;
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  select coalesce(redeemed + committed, 0) into v_used from trueque.budget_usage where company_id = new.company_id and period = new.period;
  if new.assigned < coalesce(v_used, 0) then
    raise exception 'El presupuesto no puede ser menor a lo ya usado ($%).', v_used;
  end if;
  return new;
end;
$$;
create trigger trueque_guard_budget before update on trueque.company_budgets for each row execute function trueque.guard_budget();

-- ───────────────────────── Avisos ─────────────────────────

create table trueque.notifications (
  id          bigint generated always as identity primary key,
  person_id   uuid not null references public.people (id) on delete cascade,
  kind        text not null check (kind in ('earn', 'expire', 'coupon', 'review', 'rejected', 'budget', 'custodia')),
  body        text not null check (length(body) between 4 and 200),
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_person_idx on trueque.notifications (person_id, created_at desc);
alter table trueque.notifications enable row level security;
create policy own_notifications on trueque.notifications for select to authenticated using (person_id = public.current_person_id());
create policy read_own_notifications on trueque.notifications for update to authenticated
  using (person_id = public.current_person_id()) with check (person_id = public.current_person_id());

create function trueque.notify_earn()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  if new.kind = 'earn' then
    insert into trueque.notifications (person_id, kind, body, link)
    values (new.person_id, 'earn', format('Ganaste %s cacaos: %s.', new.amount, coalesce(new.note, new.source_ref)), '/wallet');
  end if;
  return null;
end;
$$;
create trigger trueque_notify_earn after insert on trueque.ledger for each row execute function trueque.notify_earn();

create function trueque.notify_review()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  p trueque.products;
begin
  select * into p from trueque.products where id = new.product_id;
  if p.created_by is null then
    return null;
  end if;
  insert into trueque.notifications (person_id, kind, body, link)
  values (p.created_by, case new.decision when 'rejected' then 'rejected' else 'review' end,
          case new.decision
            when 'approved' then format('RH aprobó «%s»: ya está en el mercado.', left(p.name, 80))
            when 'adjusted' then format('RH ajustó «%s» a %s cacaos y lo publicó.', left(p.name, 70), new.final_price)
            else format('RH rechazó «%s»: revisa el motivo.', left(p.name, 80)) end,
          '/panel');
  return null;
end;
$$;
create trigger trueque_notify_review after insert on trueque.price_reviews for each row execute function trueque.notify_review();

create function trueque.notify_expiring()
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  n integer;
begin
  insert into trueque.notifications (person_id, kind, body, link)
  select l.person_id, 'expire', format('%s cacaos vencen el %s. Úsalos primero.', sum(l.remaining), to_char(min(l.expires_on), 'DD/MM/YYYY')), '/'
  from trueque.lots l
  where l.remaining > 0 and l.expires_on between current_date and current_date + 30
    and not exists (select 1 from trueque.notifications x where x.person_id = l.person_id and x.kind = 'expire' and x.created_at > now() - interval '7 days')
  group by l.person_id;
  get diagnostics n = row_count;
  insert into trueque.notifications (person_id, kind, body, link)
  select o.person_id, 'coupon', format('Tu cupón de «%s» vence el %s.', left(p.name, 80), to_char(c.valid_until, 'DD/MM/YYYY')), '/coupons'
  from trueque.coupons c join trueque.orders o on o.id = c.order_id join trueque.products p on p.id = o.product_id
  where c.state = 'valid' and c.valid_until between now() and now() + interval '5 days'
    and not exists (select 1 from trueque.notifications x where x.person_id = o.person_id and x.kind = 'coupon' and x.created_at > now() - interval '5 days');
  return n;
end;
$$;

-- ───────────────────────── Tablero (RH) ─────────────────────────

create view trueque.dashboard_months
with (security_invoker = true)
as
select date_trunc('month', l.created_at)::date as month,
       coalesce(sum(l.amount) filter (where l.kind = 'earn'), 0)::integer as earned,
       coalesce(-sum(l.amount) filter (where l.kind = 'spend'), 0)::integer as spent,
       coalesce(-sum(l.amount) filter (where l.kind = 'expire'), 0)::integer as expired
from trueque.ledger l
where l.created_at >= date_trunc('month', now()) - interval '5 months'
group by 1;

create view trueque.dashboard_totals
with (security_invoker = true)
as
select coalesce(sum(amount) filter (where kind = 'earn'), 0)::integer as earned,
       coalesce(-sum(amount) filter (where kind = 'spend'), 0)::integer as spent,
       coalesce(sum(amount), 0)::integer as outstanding,
       (select coalesce(sum(remaining), 0)::integer from trueque.lots where remaining > 0 and expires_on < (date_trunc('month', now()) + interval '1 month')::date) as expiring_this_month,
       count(distinct person_id) filter (where kind = 'earn')::integer as active_people,
       (select count(*)::integer from public.people) as total_people
from trueque.ledger;

create view trueque.dashboard_areas
with (security_invoker = true)
as
select a.name as area, count(distinct l.person_id)::integer as people, coalesce(sum(l.amount), 0)::integer as earned
from trueque.ledger l
join public.people pe on pe.id = l.person_id
join public.areas a on a.id = pe.area_id
where l.kind = 'earn'
group by a.name;

create view trueque.dashboard_sources
with (security_invoker = true)
as
select r.source, r.label, coalesce(sum(l.amount), 0)::integer as earned
from trueque.ledger l
join trueque.earning_rules r on r.code = l.rule_code
where l.kind = 'earn'
group by r.source, r.label;

create view trueque.dashboard_top
with (security_invoker = true)
as
select o.product_id, count(*)::integer as trades
from trueque.orders o
where o.status not in ('cancelled', 'refunded')
group by o.product_id;

-- ───────────────────────── Permisos ─────────────────────────

grant select on all tables in schema trueque to authenticated;
revoke select on trueque.folio_counters from authenticated;
grant insert, update, delete on trueque.product_images to authenticated;
grant update (read_at) on trueque.notifications to authenticated;
grant update (cacao_value, lot_months, refund_on_expiry) on trueque.config to authenticated;
grant update (cacaos, monthly_cap, is_active) on trueque.earning_rules to authenticated;
grant update (name, price_min, price_max) on trueque.categories to authenticated;
grant insert, update on trueque.exchange_locations to authenticated;
revoke execute on function trueque.notify_expiring() from public;
revoke execute on function trueque.guard_product() from public;
revoke execute on function trueque.guard_budget() from public;
grant execute on function trueque.coupon_lookup(text) to authenticated;
