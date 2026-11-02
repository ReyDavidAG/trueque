-- El Trueque · esquema inicial (Supabase / Postgres 15+)
-- Vive en la misma base que Chispa y reutiliza public.people, public.companies, public.areas y
-- public.departments. Requiere las migraciones de Chispa aplicadas antes. Explicación en docs/database.md.

create schema trueque;

-- ───────────────────────── Configuración y roles ─────────────────────────

create table trueque.config (
  id            boolean primary key default true check (id),
  lot_months    smallint not null default 12 check (lot_months between 1 and 60),
  refund_on_expiry boolean not null default false
);
insert into trueque.config default values;

create table trueque.store_managers (
  company_id  uuid not null references public.companies (id) on delete cascade,
  person_id   uuid not null references public.people (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (company_id, person_id)
);
create index store_managers_person_idx on trueque.store_managers (person_id);

create table trueque.hr_reviewers (
  person_id   uuid primary key references public.people (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Catálogos ─────────────────────────

create table trueque.categories (
  code       text primary key check (code ~ '^[a-z_]{2,30}$'),
  name       text not null,
  price_min  integer not null check (price_min > 0),
  price_max  integer not null,
  position   smallint not null,
  check (price_max >= price_min)
);

create table trueque.earning_rules (
  code         text primary key check (code ~ '^[a-z_]{2,30}$'),
  source       text not null check (source in ('chispa')),
  label        text not null,
  cacaos       integer not null check (cacaos >= 0),
  monthly_cap  smallint check (monthly_cap > 0),
  is_active    boolean not null default true,
  position     smallint not null
);

create table trueque.exchange_locations (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id),
  name         text not null check (length(name) between 2 and 80),
  city         text,
  state        text,
  address      text,
  reference    text,
  image_url    text,
  email        text,
  attendant_id uuid references public.people (id) on delete set null,
  is_active    boolean not null default true,
  rh_key       text unique,
  created_at   timestamptz not null default now()
);

-- ───────────────────────── Folios (TRQ-0001, PRD-0001) ─────────────────────────

create table trueque.folio_counters (
  kind        text primary key check (kind in ('TRQ', 'PRD')),
  last_value  integer not null default 0
);

create function trueque.next_folio(p_kind text)
returns integer
language plpgsql
as $$
declare
  v integer;
begin
  insert into trueque.folio_counters (kind, last_value) values (p_kind, 1)
  on conflict (kind) do update set last_value = trueque.folio_counters.last_value + 1
  returning last_value into v;
  return v;
end;
$$;

-- ───────────────────────── Productos (la plantilla del cupón) ─────────────────────────

create table trueque.products (
  id               uuid primary key default gen_random_uuid(),
  folio            integer not null unique,
  company_id       uuid not null references public.companies (id),
  category_code    text not null references trueque.categories (code),
  kind             text not null check (kind in ('service', 'item')),
  name             text not null check (length(name) between 4 and 80),
  blurb            text not null check (length(blurb) between 4 and 140),
  detail           text,
  art              text,
  price            integer not null check (price > 0),
  stock            integer check (stock >= 0),
  coupon_days      smallint not null default 30 check (coupon_days between 1 and 365),
  swaps            smallint not null default 1 check (swaps >= 1),
  budget_amount    numeric(12, 2) check (budget_amount > 0),
  currency         text not null default 'MXN' check (currency ~ '^[A-Z]{3}$'),
  code_type        text not null default 'qr' check (code_type in ('qr', 'barcode', 'text')),
  location_id      uuid references trueque.exchange_locations (id),
  available_from   date,
  available_until  date,
  status           text not null default 'pending'
                   check (status in ('draft', 'pending', 'live', 'paused', 'rejected', 'retired')),
  origin           text not null default 'manual' check (origin in ('manual', 'custodia')),
  origin_ref       text,
  created_by       uuid references public.people (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  rh_coupon_key    text unique,
  check (available_until is null or available_from is null or available_until >= available_from),
  check ((origin = 'manual') = (origin_ref is null))
);
create unique index products_origin_idx on trueque.products (origin, origin_ref) where origin_ref is not null;
create index products_company_idx on trueque.products (company_id, status);
create index products_live_idx on trueque.products (status, price) where status = 'live';

create table trueque.product_restrictions (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references trueque.products (id) on delete cascade,
  company_id     uuid not null references public.companies (id),
  area_id        uuid references public.areas (id),
  department_id  uuid,
  foreign key (department_id, area_id) references public.departments (id, area_id),
  check (department_id is null or area_id is not null)
);
create index product_restrictions_product_idx on trueque.product_restrictions (product_id);

create table trueque.price_reviews (
  id           bigint generated always as identity primary key,
  product_id   uuid not null references trueque.products (id) on delete cascade,
  proposed     integer not null check (proposed > 0),
  decision     text not null check (decision in ('approved', 'adjusted', 'rejected')),
  final_price  integer check (final_price > 0),
  reviewer_id  uuid not null references public.people (id),
  note         text,
  created_at   timestamptz not null default now(),
  check ((decision = 'rejected') = (final_price is null))
);
create index price_reviews_product_idx on trueque.price_reviews (product_id, created_at);

-- ───────────────────────── El libro de cacaos ─────────────────────────

create table trueque.ledger (
  id          bigint generated always as identity primary key,
  person_id   uuid not null references public.people (id),
  company_id  uuid not null references public.companies (id),
  kind        text not null check (kind in ('earn', 'spend', 'expire', 'refund', 'adjust')),
  amount      integer not null check (amount <> 0),
  rule_code   text references trueque.earning_rules (code),
  source      text not null check (source ~ '^[a-z]+\.[a-z_]+$'),
  source_id   uuid,
  source_ref  text not null,
  note        text,
  expires_on  date,
  created_by  uuid references public.people (id),
  created_at  timestamptz not null default now(),
  check ((kind in ('earn', 'refund') and amount > 0) or (kind in ('spend', 'expire') and amount < 0) or kind = 'adjust'),
  check ((kind in ('earn', 'refund')) = (expires_on is not null)),
  check ((kind = 'earn') = (rule_code is not null))
);
create unique index ledger_earn_once_idx on trueque.ledger (person_id, rule_code, source_id) where kind = 'earn';
create index ledger_person_idx on trueque.ledger (person_id, created_at desc);
create index ledger_lots_idx on trueque.ledger (person_id, expires_on) where kind in ('earn', 'refund');

create table trueque.lot_allocations (
  spend_id  bigint not null references trueque.ledger (id) on delete cascade,
  lot_id    bigint not null references trueque.ledger (id),
  amount    integer not null check (amount > 0),
  primary key (spend_id, lot_id)
);
create index lot_allocations_lot_idx on trueque.lot_allocations (lot_id);

create function trueque.no_ledger_edits()
returns trigger
language plpgsql
as $$
begin
  raise exception 'El libro de cacaos no se edita: registra un movimiento nuevo.';
end;
$$;
create trigger ledger_append_only before update or delete on trueque.ledger
  for each row execute function trueque.no_ledger_edits();

-- ───────────────────────── Trueques, cupones y canjes ─────────────────────────

create table trueque.orders (
  id          uuid primary key default gen_random_uuid(),
  folio       integer not null unique,
  person_id   uuid not null references public.people (id),
  product_id  uuid not null references trueque.products (id),
  company_id  uuid not null references public.companies (id),
  price       integer not null check (price > 0),
  spend_id    bigint not null unique references trueque.ledger (id),
  status      text not null default 'issued' check (status in ('issued', 'used', 'expired', 'cancelled', 'refunded')),
  created_at  timestamptz not null default now()
);
create index orders_person_idx on trueque.orders (person_id, created_at desc);
create index orders_product_idx on trueque.orders (product_id, status);
create index orders_company_idx on trueque.orders (company_id, created_at);

create table trueque.coupons (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references trueque.orders (id) on delete cascade,
  code           text not null unique,
  code_type      text not null check (code_type in ('qr', 'barcode', 'text')),
  state          text not null default 'valid' check (state in ('valid', 'expired', 'disabled', 'used')),
  valid_from     timestamptz not null default now(),
  valid_until    timestamptz not null,
  swaps_budget   smallint not null check (swaps_budget >= 1),
  swaps_used     smallint not null default 0,
  budget_amount  numeric(12, 2),
  used_amount    numeric(12, 2) not null default 0,
  origin         text not null default 'trueque',
  rh_book_key    text unique,
  created_at     timestamptz not null default now(),
  check (swaps_used between 0 and swaps_budget),
  check (valid_until > valid_from),
  check (budget_amount is null or used_amount <= budget_amount)
);
create index coupons_state_idx on trueque.coupons (state, valid_until);

create table trueque.redemptions (
  id                bigint generated always as identity primary key,
  coupon_id         uuid not null references trueque.coupons (id) on delete cascade,
  location_id       uuid references trueque.exchange_locations (id),
  redeemed_by       uuid references public.people (id),
  amount            numeric(12, 2),
  remaining_swaps   smallint not null,
  remaining_amount  numeric(12, 2),
  created_at        timestamptz not null default now()
);
create index redemptions_coupon_idx on trueque.redemptions (coupon_id, created_at);

-- ───────────────────────── Presupuesto por empresa ─────────────────────────

create table trueque.company_budgets (
  company_id  uuid not null references public.companies (id),
  period      smallint not null check (period between 2024 and 2100),
  assigned    integer not null check (assigned >= 0),
  primary key (company_id, period)
);

-- ───────────────────────── Funciones de apoyo ─────────────────────────

create function trueque.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger products_touch before update on trueque.products for each row execute function trueque.touch_updated_at();

create function trueque.assign_product_folio()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  new.folio := trueque.next_folio('PRD');
  return new;
end;
$$;
create trigger products_folio before insert on trueque.products for each row execute function trueque.assign_product_folio();

create function trueque.person_company(p_person uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.company_id from public.people p join public.areas a on a.id = p.area_id where p.id = p_person;
$$;

create function trueque.is_store_manager(p_company uuid)
returns boolean
language sql
stable
security definer
set search_path = trueque, public
as $$
  select exists (select 1 from trueque.store_managers where company_id = p_company and person_id = public.current_person_id());
$$;

create function trueque.is_hr_reviewer()
returns boolean
language sql
stable
security definer
set search_path = trueque, public
as $$
  select exists (select 1 from trueque.hr_reviewers where person_id = public.current_person_id())
      or exists (select 1 from public.people where id = public.current_person_id() and is_admin);
$$;

create function trueque.can_see_product(p_product uuid)
returns boolean
language sql
stable
security definer
set search_path = trueque, public
as $$
  with me as (
    select p.id, p.area_id, p.department_id, a.company_id
    from public.people p join public.areas a on a.id = p.area_id
    where p.id = public.current_person_id()
  )
  select case
    when exists (select 1 from trueque.product_restrictions r where r.product_id = p_product) then
      exists (select 1 from trueque.product_restrictions r, me
              where r.product_id = p_product and r.company_id = me.company_id
                and (r.area_id is null or r.area_id = me.area_id)
                and (r.department_id is null or r.department_id = me.department_id))
    else
      exists (select 1 from trueque.products pr, me where pr.id = p_product and pr.company_id = me.company_id)
  end;
$$;

-- ───────────────────────── Lecturas (vistas) ─────────────────────────

create view trueque.lots
with (security_invoker = true)
as
select
  l.id,
  l.person_id,
  l.company_id,
  l.source,
  l.source_ref,
  l.amount,
  l.amount - coalesce((select sum(a.amount) from trueque.lot_allocations a where a.lot_id = l.id), 0)::integer as remaining,
  l.expires_on,
  l.created_at
from trueque.ledger l
where l.kind in ('earn', 'refund');

create view trueque.balances
with (security_invoker = true)
as
select person_id, coalesce(sum(remaining) filter (where expires_on > current_date), 0)::integer as balance,
       coalesce(sum(remaining) filter (where expires_on > current_date and expires_on <= current_date + 60), 0)::integer as expiring_60d
from trueque.lots
group by person_id;

create view trueque.budget_usage
with (security_invoker = true)
as
select
  b.company_id,
  b.period,
  b.assigned,
  coalesce(sum(o.price) filter (where o.status = 'used'), 0)::integer as redeemed,
  coalesce(sum(o.price) filter (where o.status = 'issued'), 0)::integer as committed,
  b.assigned - coalesce(sum(o.price) filter (where o.status in ('used', 'issued')), 0)::integer as available
from trueque.company_budgets b
left join trueque.orders o on o.company_id = b.company_id and extract(year from o.created_at) = b.period
group by b.company_id, b.period, b.assigned;

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
  p.art,
  p.price,
  p.stock,
  case when p.stock is null then null
       else p.stock - (select count(*) from trueque.orders o where o.product_id = p.id and o.status not in ('cancelled', 'refunded'))::integer end as stock_left,
  p.coupon_days,
  p.swaps,
  p.location_id,
  p.status,
  p.origin,
  p.origin_ref
from trueque.products p;

-- ───────────────────────── Ganar cacaos (Chispa → El Trueque) ─────────────────────────

create function trueque.award(p_person uuid, p_rule text, p_source text, p_source_id uuid, p_source_ref text)
returns bigint
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  r trueque.earning_rules;
  v_used integer;
  v_id bigint;
begin
  select * into r from trueque.earning_rules where code = p_rule and is_active;
  if r.code is null or r.cacaos = 0 or p_person is null then
    return null;
  end if;
  if r.monthly_cap is not null then
    select count(*) into v_used from trueque.ledger
     where person_id = p_person and rule_code = p_rule and kind = 'earn'
       and created_at >= date_trunc('month', now());
    if v_used >= r.monthly_cap then
      return null;
    end if;
  end if;
  insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_id, source_ref, expires_on)
  values (p_person, trueque.person_company(p_person), 'earn', r.cacaos, p_rule, p_source, p_source_id, p_source_ref,
          (current_date + make_interval(months => (select lot_months from trueque.config)))::date)
  on conflict (person_id, rule_code, source_id) where kind = 'earn' do nothing
  returning id into v_id;
  return v_id;
end;
$$;

create function trueque.on_idea_insert()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  perform trueque.award(new.author_id, 'idea', 'chispa.idea', new.id, 'CHI-' || lpad(new.folio::text, 3, '0'));
  return null;
end;
$$;
create trigger trueque_award_idea after insert on public.ideas for each row execute function trueque.on_idea_insert();

create function trueque.on_idea_status()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  if new.status in ('review', 'selected', 'done') then
    perform trueque.award(new.author_id, case new.status when 'review' then 'review' when 'selected' then 'selected' else 'done' end,
                          'chispa.idea', new.id, 'CHI-' || lpad(new.folio::text, 3, '0'));
  end if;
  return null;
end;
$$;
create trigger trueque_award_idea_status after update of status on public.ideas
  for each row when (old.status is distinct from new.status) execute function trueque.on_idea_status();

create function trueque.on_challenge_published()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  perform trueque.award(coalesce(new.suggested_by, new.owner_id), 'challenge', 'chispa.challenge', new.id, 'RET-' || lpad(new.folio::text, 3, '0'));
  return null;
end;
$$;
create trigger trueque_award_challenge_insert after insert on public.challenges
  for each row when (new.published_at is not null) execute function trueque.on_challenge_published();
create trigger trueque_award_challenge_publish after update on public.challenges
  for each row when (old.published_at is null and new.published_at is not null) execute function trueque.on_challenge_published();

-- ───────────────────────── Hacer el trueque ─────────────────────────

create function trueque.trade(p_product uuid)
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
  v_budget trueque.budget_usage;
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
  select * into v_budget from trueque.budget_usage where company_id = v_company and period = extract(year from now())::smallint;
  if v_budget.company_id is not null and v_budget.available < p.price then
    raise exception 'Tu empresa ya usó su presupuesto de este año.';
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

  insert into trueque.orders (folio, person_id, product_id, company_id, price, spend_id)
  values (v_folio, v_me, p.id, v_company, p.price, v_spend)
  returning id into v_order;

  v_code := 'CAC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into trueque.coupons (order_id, code, code_type, valid_until, swaps_budget, budget_amount)
  values (v_order, v_code, p.code_type, now() + make_interval(days => p.coupon_days), p.swaps, p.budget_amount);

  return query select 'TRQ-' || lpad(v_folio::text, 4, '0'), v_code, v_balance - p.price;
end;
$$;

-- ───────────────────────── Canjear un cupón (lugar de canje) ─────────────────────────

create function trueque.redeem(p_code text, p_location uuid, p_amount numeric default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  c trueque.coupons;
  v_company uuid;
begin
  select * into c from trueque.coupons where code = p_code for update;
  if c.id is null then
    raise exception 'Ese código no existe.';
  end if;
  select p.company_id into v_company from trueque.orders o join trueque.products p on p.id = o.product_id where o.id = c.order_id;
  if not (trueque.is_store_manager(v_company)
          or exists (select 1 from trueque.exchange_locations l where l.id = p_location and l.attendant_id = public.current_person_id())) then
    raise exception 'Sólo el lugar de canje o la empresa que ofrece el producto canjean cupones.';
  end if;
  if c.state <> 'valid' or c.valid_until < now() then
    raise exception 'Este cupón ya no es válido.';
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

-- ───────────────────────── Revisión de precios (RH) ─────────────────────────

create function trueque.review_price(p_product uuid, p_decision text, p_final_price integer default null, p_note text default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  p trueque.products;
begin
  if not trueque.is_hr_reviewer() then
    raise exception 'Sólo RH aprueba precios.';
  end if;
  select * into p from trueque.products where id = p_product for update;
  if p.id is null or p.status <> 'pending' then
    raise exception 'Este producto no está esperando revisión.';
  end if;
  insert into trueque.price_reviews (product_id, proposed, decision, final_price, reviewer_id, note)
  values (p.id, p.price, p_decision,
          case p_decision when 'approved' then p.price when 'adjusted' then p_final_price end,
          public.current_person_id(), p_note);
  update trueque.products
     set status = case p_decision when 'rejected' then 'rejected' else 'live' end,
         price = case p_decision when 'adjusted' then p_final_price else price end
   where id = p.id;
  return case p_decision when 'rejected' then 'rejected' else 'live' end;
end;
$$;

-- ───────────────────────── Producto desde otra app (Custodia) ─────────────────────────
-- Sólo la llaman funciones de otras apps del ecosistema, que validan su propio rol.

create function trueque.create_product_from_asset(p_company uuid, p_name text, p_blurb text, p_detail text, p_price integer, p_asset_ref text, p_created_by uuid)
returns uuid
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  v_id uuid;
begin
  insert into trueque.products (company_id, category_code, kind, name, blurb, detail, art, price, stock, coupon_days, status, origin, origin_ref, created_by)
  values (p_company, 'custodia', 'item', p_name, p_blurb, p_detail, 'laptop', p_price, 1, 15, 'pending', 'custodia', p_asset_ref, p_created_by)
  returning id into v_id;
  return v_id;
end;
$$;

-- ───────────────────────── Mantenimiento (pg_cron diario) ─────────────────────────

create function trueque.expire_lots()
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  lot record;
  v_id bigint;
  n integer := 0;
begin
  for lot in select * from trueque.lots where remaining > 0 and expires_on <= current_date loop
    insert into trueque.ledger (person_id, company_id, kind, amount, source, source_id, source_ref)
    values (lot.person_id, lot.company_id, 'expire', -lot.remaining, 'trueque.expiry', null, lot.source_ref)
    returning id into v_id;
    insert into trueque.lot_allocations (spend_id, lot_id, amount) values (v_id, lot.id, lot.remaining);
    n := n + 1;
  end loop;
  return n;
end;
$$;

create function trueque.expire_coupons()
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  n integer;
begin
  with gone as (
    update trueque.coupons set state = 'expired' where state = 'valid' and valid_until < now() returning order_id
  )
  update trueque.orders o set status = 'expired' from gone where o.id = gone.order_id;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ───────────────────────── Seguridad (RLS) ─────────────────────────

alter table trueque.config enable row level security;
alter table trueque.store_managers enable row level security;
alter table trueque.hr_reviewers enable row level security;
alter table trueque.categories enable row level security;
alter table trueque.earning_rules enable row level security;
alter table trueque.exchange_locations enable row level security;
alter table trueque.folio_counters enable row level security;
alter table trueque.products enable row level security;
alter table trueque.product_restrictions enable row level security;
alter table trueque.price_reviews enable row level security;
alter table trueque.ledger enable row level security;
alter table trueque.lot_allocations enable row level security;
alter table trueque.orders enable row level security;
alter table trueque.coupons enable row level security;
alter table trueque.redemptions enable row level security;
alter table trueque.company_budgets enable row level security;

create policy read_all on trueque.config for select to authenticated using (true);
create policy read_all on trueque.store_managers for select to authenticated using (true);
create policy read_all on trueque.hr_reviewers for select to authenticated using (true);
create policy read_all on trueque.categories for select to authenticated using (true);
create policy read_all on trueque.earning_rules for select to authenticated using (true);
create policy read_all on trueque.exchange_locations for select to authenticated using (true);

create policy read_products on trueque.products for select to authenticated
  using ((status = 'live' and trueque.can_see_product(id)) or trueque.is_store_manager(company_id) or trueque.is_hr_reviewer());
create policy propose_products on trueque.products for insert to authenticated
  with check (trueque.is_store_manager(company_id) and status in ('draft', 'pending') and origin = 'manual' and created_by = public.current_person_id());
create policy edit_products on trueque.products for update to authenticated
  using (trueque.is_store_manager(company_id))
  with check (trueque.is_store_manager(company_id) and status in ('draft', 'pending', 'paused', 'retired'));

create policy read_restrictions on trueque.product_restrictions for select to authenticated using (true);
create policy write_restrictions on trueque.product_restrictions for all to authenticated
  using (exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)))
  with check (exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)));

create policy read_reviews on trueque.price_reviews for select to authenticated
  using (trueque.is_hr_reviewer() or exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)));

create policy own_ledger on trueque.ledger for select to authenticated
  using (person_id = public.current_person_id() or trueque.is_hr_reviewer());
create policy own_allocations on trueque.lot_allocations for select to authenticated
  using (exists (select 1 from trueque.ledger l where l.id = spend_id and (l.person_id = public.current_person_id() or trueque.is_hr_reviewer())));

create policy read_orders on trueque.orders for select to authenticated
  using (person_id = public.current_person_id() or trueque.is_hr_reviewer() or trueque.is_store_manager(company_id)
         or exists (select 1 from trueque.products p where p.id = product_id and trueque.is_store_manager(p.company_id)));
create policy read_coupons on trueque.coupons for select to authenticated
  using (exists (select 1 from trueque.orders o where o.id = order_id));
create policy read_redemptions on trueque.redemptions for select to authenticated
  using (exists (select 1 from trueque.coupons c where c.id = coupon_id));

create policy read_budgets on trueque.company_budgets for select to authenticated
  using (trueque.is_hr_reviewer() or trueque.is_store_manager(company_id));
create policy write_budgets on trueque.company_budgets for all to authenticated
  using (trueque.is_hr_reviewer()) with check (trueque.is_hr_reviewer());

grant usage on schema trueque to authenticated;
grant select on all tables in schema trueque to authenticated;
grant insert, update on trueque.products to authenticated;
grant insert, update, delete on trueque.product_restrictions to authenticated;
grant insert, update on trueque.company_budgets to authenticated;
revoke select on trueque.folio_counters from authenticated;

revoke execute on all functions in schema trueque from public;
grant execute on function trueque.trade(uuid) to authenticated;
grant execute on function trueque.redeem(text, uuid, numeric) to authenticated;
grant execute on function trueque.review_price(uuid, text, integer, text) to authenticated;
grant execute on function trueque.can_see_product(uuid) to authenticated;
grant execute on function trueque.is_store_manager(uuid) to authenticated;
grant execute on function trueque.is_hr_reviewer() to authenticated;
