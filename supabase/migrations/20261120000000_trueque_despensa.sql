alter table trueque.categories
  add column description text check (description is null or length(description) <= 160),
  add column is_active boolean not null default true,
  add column self_service boolean not null default true,
  add column art text;

insert into trueque.categories (code, name, price_min, price_max, position, description, self_service, art) values
  ('pantry', 'De la despensa', 5, 200, 1, 'Comida, café y básicos para llevar a casa.', true, 'groceries'),
  ('service', 'Servicios', 20, 400, 2, 'Consultas, talleres y tiempo de alguien para ti.', true, 'chat'),
  ('item', 'Artículos', 20, 300, 3, 'Cosas que te llevas: termos, ropa, accesorios.', true, 'thermos'),
  ('custodia', 'De Custodia', 60, 800, 4, 'Equipo dado de baja que todavía sirve.', false, 'laptop')
on conflict (code) do update
  set position = excluded.position,
      description = excluded.description,
      self_service = excluded.self_service,
      art = excluded.art;

create policy hr_categories_insert on trueque.categories for insert to authenticated with check (trueque.is_hr_reviewer());

create function trueque.check_product_category()
returns trigger
language plpgsql
set search_path = trueque, public
as $$
declare
  cat trueque.categories;
begin
  if tg_op = 'UPDATE' and new.category_code = old.category_code then
    return new;
  end if;
  select * into cat from trueque.categories where code = new.category_code;
  if cat.code is null then
    return new;
  end if;
  if not cat.is_active then
    raise exception 'La categoría «%» ya no recibe productos.', cat.name;
  end if;
  if not cat.self_service and new.origin = 'manual' and current_user in ('authenticated', 'anon') and not trueque.is_hr_reviewer() then
    raise exception 'En «%» sólo publica RH o llega desde Custodia.', cat.name;
  end if;
  return new;
end;
$$;
create trigger trueque_check_product_category before insert or update of category_code on trueque.products
  for each row execute function trueque.check_product_category();

create table trueque.folio_kinds (
  kind    text primary key check (kind ~ '^[a-z_]{2,20}$'),
  prefix  text not null check (prefix ~ '^[A-Z]{2,5}$'),
  digits  smallint not null default 4 check (digits between 3 and 12),
  label   text not null check (length(label) between 2 and 60)
);
insert into trueque.folio_kinds (kind, prefix, digits, label) values
  ('order', 'DSP', 4, 'Canje'),
  ('product', 'PRD', 4, 'Producto'),
  ('coupon', 'YEM', 10, 'Código del cupón');

alter table trueque.folio_counters drop constraint folio_counters_kind_check;
update trueque.folio_counters set kind = 'order' where kind = 'TRQ';
update trueque.folio_counters set kind = 'product' where kind = 'PRD';
alter table trueque.folio_counters add constraint folio_counters_kind_check check (kind ~ '^[a-z_]{2,20}$');

create function trueque.format_folio(p_kind text, p_n integer)
returns text
language sql
stable
security definer
set search_path = trueque, public
as $$
  select k.prefix || '-' || lpad(p_n::text, k.digits, '0') from trueque.folio_kinds k where k.kind = p_kind;
$$;

create function trueque.new_coupon_code()
returns text
language sql
volatile
security definer
set search_path = trueque, public
as $$
  select k.prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, k.digits)) from trueque.folio_kinds k where k.kind = 'coupon';
$$;

create or replace function trueque.assign_product_folio()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  new.folio := trueque.next_folio('product');
  return new;
end;
$$;

alter table trueque.orders add column folio_code text;
update trueque.orders set folio_code = 'TRQ-' || lpad(folio::text, 4, '0');
alter table trueque.orders alter column folio_code set not null;
alter table trueque.orders add constraint orders_folio_code_key unique (folio_code);

create or replace view trueque.product_cards
with (security_invoker = true)
as
select
  p.id,
  trueque.format_folio('product', p.folio) as folio,
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
  v_folio_code text;
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
    raise exception 'Todavía no te alcanza: te faltan % yemas.', p.price - coalesce(v_balance, 0);
  end if;
  select u.available into v_available from trueque.budget_usage u where u.company_id = p.company_id and u.period = extract(year from now())::smallint;
  if v_available is not null and v_available < p.cost then
    raise exception 'La empresa que ofrece este producto ya usó su presupuesto de este año.';
  end if;

  v_folio := trueque.next_folio('order');
  v_folio_code := trueque.format_folio('order', v_folio);
  insert into trueque.ledger (person_id, company_id, kind, amount, source, source_id, source_ref, created_by)
  values (v_me, v_company, 'spend', -p.price, 'trueque.order', null, v_folio_code, v_me)
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

  insert into trueque.orders (folio, folio_code, person_id, product_id, company_id, price, cost, spend_id)
  values (v_folio, v_folio_code, v_me, p.id, v_company, p.price, p.cost, v_spend)
  returning id into v_order;

  v_code := trueque.new_coupon_code();
  insert into trueque.coupons (order_id, code, code_type, valid_until, swaps_budget, budget_amount)
  values (v_order, v_code, p.code_type, now() + make_interval(days => p.coupon_days), p.swaps, p.budget_amount);

  return query select v_folio_code, v_code, v_balance - p.price;
end;
$$;

create or replace function trueque.coupon_lookup(p_code text)
returns table (code text, folio text, state text, valid_until timestamptz, swaps_left integer,
               product_id uuid, product_name text, product_art text, product_stall text, product_cost numeric,
               product_company uuid, person_name text, employee_number text, can_redeem boolean)
language sql
stable
security definer
set search_path = trueque, public
as $$
  select c.code, o.folio_code,
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
    raise exception 'El precio ajustado debe quedar entre % y % yemas.', cat.price_min, cat.price_max;
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

create or replace function trueque.no_ledger_edits()
returns trigger
language plpgsql
as $$
begin
  raise exception 'El libro de yemas no se edita: registra un movimiento nuevo.';
end;
$$;

create or replace function trueque.notify_earn()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  if new.kind = 'earn' then
    insert into trueque.notifications (person_id, kind, body, link)
    values (new.person_id, 'earn', format('Ganaste %s yemas: %s.', new.amount, coalesce(new.note, new.source_ref)), '/wallet');
  end if;
  return null;
end;
$$;

create or replace function trueque.notify_review()
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
            when 'approved' then format('RH aprobó «%s»: ya está en la despensa.', left(p.name, 80))
            when 'adjusted' then format('RH ajustó «%s» a %s yemas y lo publicó.', left(p.name, 70), new.final_price)
            else format('RH rechazó «%s»: revisa el motivo.', left(p.name, 80)) end,
          '/panel');
  return null;
end;
$$;

create or replace function trueque.notify_expiring()
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  n integer;
begin
  insert into trueque.notifications (person_id, kind, body, link)
  select l.person_id, 'expire', format('%s yemas vencen el %s. Úsalas primero.', sum(l.remaining), to_char(min(l.expires_on), 'DD/MM/YYYY')), '/'
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

update trueque.earning_rules set note = 'Si diera yemas, todos avivarían todo.' where code = 'support';
update trueque.earning_rules set note = 'Lo que valga la insignia: de 10 a 100 yemas.' where code = 'badge';

alter table trueque.folio_kinds enable row level security;
create policy read_all on trueque.folio_kinds for select to authenticated using (true);
create policy hr_folio_kinds on trueque.folio_kinds for update to authenticated using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());

grant select on trueque.folio_kinds to authenticated;
grant update (prefix, digits, label) on trueque.folio_kinds to authenticated;
grant insert (code, name, price_min, price_max, position, description, is_active, self_service, art) on trueque.categories to authenticated;
grant update (name, price_min, price_max, position, description, is_active, self_service, art) on trueque.categories to authenticated;
revoke execute on function trueque.check_product_category() from public, anon, authenticated;
revoke execute on function trueque.new_coupon_code() from public, anon, authenticated;
grant execute on function trueque.format_folio(text, integer) to authenticated;
