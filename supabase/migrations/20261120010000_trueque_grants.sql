alter table trueque.config
  add column grant_max_per_person integer not null default 100 check (grant_max_per_person between 1 and 1000),
  add column grant_max_per_year integer not null default 300 check (grant_max_per_year between 1 and 5000),
  add column grant_max_list smallint not null default 50 check (grant_max_list between 1 and 500),
  add column grant_max_days_ahead smallint not null default 60 check (grant_max_days_ahead between 0 and 365);

insert into trueque.earning_rules (code, source, label, cacaos, monthly_cap, position, note, is_variable)
values ('grant', 'rh', 'Regalo de yemas', 0, null, 8, 'Lo arma RH y lo autoriza otra persona.', true)
on conflict (code) do nothing;

insert into trueque.folio_kinds (kind, prefix, digits, label) values ('grant', 'REG', 4, 'Regalo')
on conflict (kind) do nothing;

alter table trueque.notifications drop constraint notifications_kind_check;
alter table trueque.notifications add constraint notifications_kind_check
  check (kind in ('earn', 'expire', 'coupon', 'review', 'rejected', 'budget', 'custodia', 'grant'));

create table trueque.grant_occasions (
  code           text primary key check (code ~ '^[a-z_]{2,30}$'),
  name           text not null check (length(name) between 2 and 60),
  once_per_year  boolean not null default false,
  is_active      boolean not null default true,
  position       smallint not null
);
insert into trueque.grant_occasions (code, name, once_per_year, position) values
  ('christmas', 'Navidad', true, 1),
  ('anniversary', 'Aniversario', true, 2),
  ('recognition', 'Reconocimiento', false, 3),
  ('event', 'Evento', false, 4);

create table trueque.grant_approvers (
  person_id   uuid primary key references public.people (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table trueque.grant_funds (
  period      smallint primary key check (period between 2024 and 2100),
  amount      integer not null check (amount >= 0),
  updated_by  uuid references public.people (id),
  updated_at  timestamptz not null default now()
);

create table trueque.grants (
  id             uuid primary key default gen_random_uuid(),
  folio          integer not null unique,
  folio_code     text not null unique,
  occasion_code  text not null references trueque.grant_occasions (code),
  name           text not null check (length(name) between 4 and 80),
  reason         text not null check (length(reason) between 20 and 500),
  scope          text not null check (scope in ('group', 'company', 'area', 'department', 'list')),
  scope_id       uuid,
  amount         integer check (amount > 0),
  deliver_on     date not null,
  lot_months     smallint not null default 6 check (lot_months between 1 and 12),
  status         text not null default 'draft' check (status in ('draft', 'pending', 'rejected', 'scheduled', 'delivered', 'cancelled')),
  created_by     uuid not null references public.people (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  decided_by     uuid references public.people (id),
  decided_at     timestamptz,
  decision_note  text,
  delivered_at   timestamptz,
  cancelled_by   uuid references public.people (id),
  cancelled_at   timestamptz,
  cancel_note    text,
  check ((scope in ('group', 'list')) = (scope_id is null)),
  check ((scope = 'list') = (amount is null)),
  check (decided_by is null or decided_by <> created_by)
);
create index grants_status_idx on trueque.grants (status, deliver_on);
create trigger grants_touch before update on trueque.grants for each row execute function trueque.touch_updated_at();

create table trueque.grant_recipients (
  id              uuid not null default gen_random_uuid() unique,
  grant_id        uuid not null references trueque.grants (id) on delete cascade,
  person_id       uuid not null references public.people (id),
  amount          integer not null check (amount > 0),
  note            text check (note is null or length(note) <= 200),
  ledger_id       bigint unique references trueque.ledger (id),
  skipped_reason  text,
  primary key (grant_id, person_id),
  check (ledger_id is null or skipped_reason is null)
);
create index grant_recipients_person_idx on trueque.grant_recipients (person_id);

create table trueque.grant_events (
  id          bigint generated always as identity primary key,
  grant_id    uuid not null references trueque.grants (id),
  kind        text not null check (kind in ('created', 'edited', 'submitted', 'approved', 'rejected', 'cancelled', 'delivered')),
  actor_id    uuid references public.people (id),
  note        text,
  created_at  timestamptz not null default now()
);
create index grant_events_grant_idx on trueque.grant_events (grant_id, id);

create function trueque.no_grant_event_edits()
returns trigger
language plpgsql
as $$
begin
  raise exception 'La bitácora de regalos no se edita.';
end;
$$;
create trigger grant_events_append_only before update or delete on trueque.grant_events
  for each row execute function trueque.no_grant_event_edits();

create function trueque.is_grant_approver()
returns boolean
language sql
stable
security definer
set search_path = trueque, public
as $$
  select exists (select 1 from trueque.grant_approvers where person_id = public.current_person_id());
$$;

create function trueque.is_active_person(p_person uuid)
returns boolean
language sql
stable
security definer
set search_path = trueque, public
as $$
  select exists (select 1 from public.people p where p.id = p_person and coalesce((to_jsonb(p) ->> 'is_active')::boolean, true));
$$;

create function trueque.grant_scope_people(p_scope text, p_scope_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = trueque, public
as $$
  select p.id
  from public.people p
  join public.areas a on a.id = p.area_id
  where coalesce((to_jsonb(p) ->> 'is_active')::boolean, true)
    and case p_scope
          when 'group' then true
          when 'company' then a.company_id = p_scope_id
          when 'area' then p.area_id = p_scope_id
          when 'department' then p.department_id = p_scope_id
          else false
        end;
$$;

create function trueque.grant_log(p_grant uuid, p_kind text, p_note text default null)
returns void
language sql
security definer
set search_path = trueque, public
as $$
  insert into trueque.grant_events (grant_id, kind, actor_id, note) values (p_grant, p_kind, public.current_person_id(), p_note);
$$;

create function trueque.grant_preview(p_scope text, p_scope_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = trueque, public
as $$
begin
  if not (trueque.is_hr_reviewer() or trueque.is_grant_approver()) then
    raise exception 'Sólo RH y quien autoriza ven regalos.';
  end if;
  return (select count(*)::integer from trueque.grant_scope_people(p_scope, p_scope_id));
end;
$$;

create function trueque.grant_save(
  p_id uuid,
  p_occasion text,
  p_name text,
  p_reason text,
  p_scope text,
  p_scope_id uuid,
  p_amount integer,
  p_deliver_on date,
  p_lot_months integer,
  p_list jsonb default '[]'
)
returns uuid
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  v_me uuid := public.current_person_id();
  g trueque.grants;
  v_folio integer;
  item jsonb;
  v_person uuid;
  v_amount integer;
  v_note text;
begin
  if not trueque.is_hr_reviewer() then
    raise exception 'Sólo RH arma regalos.';
  end if;
  if not exists (select 1 from trueque.grant_occasions where code = p_occasion and is_active) then
    raise exception 'Elige una ocasión válida.';
  end if;
  if p_scope not in ('group', 'company', 'area', 'department', 'list') then
    raise exception 'Elige a quién va el regalo.';
  end if;
  if p_scope in ('company', 'area', 'department') and p_scope_id is null then
    raise exception 'Elige a quién va el regalo.';
  end if;
  if p_scope <> 'list' and coalesce(p_amount, 0) <= 0 then
    raise exception 'Pon cuántas yemas recibe cada persona.';
  end if;
  if length(trim(coalesce(p_name, ''))) not between 4 and 80 then
    raise exception 'Ponle al regalo un nombre de 4 a 80 letras.';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 20 then
    raise exception 'El motivo necesita al menos 20 letras.';
  end if;
  if p_id is null then
    v_folio := trueque.next_folio('grant');
    insert into trueque.grants (folio, folio_code, occasion_code, name, reason, scope, scope_id, amount, deliver_on, lot_months, created_by)
    values (v_folio, trueque.format_folio('grant', v_folio), p_occasion, trim(p_name), trim(p_reason), p_scope,
            case when p_scope in ('group', 'list') then null else p_scope_id end,
            case when p_scope = 'list' then null else p_amount end,
            p_deliver_on, coalesce(p_lot_months, 6), v_me)
    returning * into g;
    perform trueque.grant_log(g.id, 'created');
  else
    select * into g from trueque.grants where id = p_id for update;
    if g.id is null or g.status not in ('draft', 'rejected') then
      raise exception 'Sólo se editan borradores y regalos rechazados.';
    end if;
    update trueque.grants
       set occasion_code = p_occasion, name = trim(p_name), reason = trim(p_reason), scope = p_scope,
           scope_id = case when p_scope in ('group', 'list') then null else p_scope_id end,
           amount = case when p_scope = 'list' then null else p_amount end,
           deliver_on = p_deliver_on, lot_months = coalesce(p_lot_months, 6),
           status = 'draft', decided_by = null, decided_at = null, decision_note = null, submitted_at = null
     where id = p_id
    returning * into g;
    perform trueque.grant_log(g.id, 'edited');
  end if;

  delete from trueque.grant_recipients where grant_id = g.id;
  if p_scope = 'list' then
    for item in select * from jsonb_array_elements(coalesce(p_list, '[]'))
    loop
      select id into v_person from public.people where employee_number = trim(item ->> 'employee_number');
      if v_person is null then
        raise exception 'No encontramos el número de trabajador %.', item ->> 'employee_number';
      end if;
      if v_person = v_me then
        raise exception 'No puedes incluirte en un regalo que armas.';
      end if;
      v_amount := (item ->> 'amount')::integer;
      if v_amount is null or v_amount <= 0 then
        raise exception 'Cada persona de la lista necesita un monto mayor a cero.';
      end if;
      v_note := trim(coalesce(item ->> 'note', ''));
      if length(v_note) < 10 then
        raise exception 'Cada persona de la lista necesita un motivo de al menos 10 letras.';
      end if;
      if exists (select 1 from trueque.grant_recipients where grant_id = g.id and person_id = v_person) then
        raise exception 'El número % está dos veces en la lista.', item ->> 'employee_number';
      end if;
      insert into trueque.grant_recipients (grant_id, person_id, amount, note) values (g.id, v_person, v_amount, v_note);
    end loop;
  end if;
  return g.id;
end;
$$;

create function trueque.grant_submit(p_id uuid)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  cfg trueque.config;
  g trueque.grants;
  occ trueque.grant_occasions;
  v_year integer;
  v_count integer;
  v_name text;
begin
  if not trueque.is_hr_reviewer() then
    raise exception 'Sólo RH manda regalos a autorizar.';
  end if;
  select * into cfg from trueque.config;
  select * into g from trueque.grants where id = p_id for update;
  if g.id is null or g.status <> 'draft' then
    raise exception 'Sólo se manda a autorizar un borrador.';
  end if;
  if g.deliver_on < current_date or g.deliver_on > current_date + cfg.grant_max_days_ahead then
    raise exception 'La entrega debe ser entre hoy y dentro de % días.', cfg.grant_max_days_ahead;
  end if;
  select * into occ from trueque.grant_occasions where code = g.occasion_code;
  v_year := extract(year from g.deliver_on)::integer;

  if g.scope <> 'list' then
    delete from trueque.grant_recipients where grant_id = g.id;
    insert into trueque.grant_recipients (grant_id, person_id, amount)
    select g.id, s, g.amount from trueque.grant_scope_people(g.scope, g.scope_id) s;
  else
    delete from trueque.grant_recipients r where r.grant_id = g.id and not trueque.is_active_person(r.person_id);
  end if;

  select count(*) into v_count from trueque.grant_recipients where grant_id = g.id;
  if v_count = 0 then
    raise exception 'Este regalo no le llega a nadie.';
  end if;
  if g.scope = 'list' and v_count > cfg.grant_max_list then
    raise exception 'Una lista puede tener hasta % personas.', cfg.grant_max_list;
  end if;
  if exists (select 1 from trueque.grant_recipients where grant_id = g.id and amount > cfg.grant_max_per_person) then
    raise exception 'Cada persona puede recibir hasta % yemas en un regalo.', cfg.grant_max_per_person;
  end if;

  select pe.full_name into v_name
  from trueque.grant_recipients r
  join public.people pe on pe.id = r.person_id
  where r.grant_id = g.id
    and r.amount + coalesce((select sum(x.amount) from trueque.grant_recipients x join trueque.grants y on y.id = x.grant_id
                             where x.person_id = r.person_id and y.id <> g.id and x.skipped_reason is null
                               and y.status in ('pending', 'scheduled', 'delivered')
                               and extract(year from y.deliver_on) = v_year), 0) > cfg.grant_max_per_year
  limit 1;
  if v_name is not null then
    raise exception 'Con este regalo, % pasaría de % yemas de regalo en el año.', v_name, cfg.grant_max_per_year;
  end if;

  if occ.once_per_year then
    select pe.full_name into v_name
    from trueque.grant_recipients r
    join public.people pe on pe.id = r.person_id
    where r.grant_id = g.id
      and exists (select 1 from trueque.grant_recipients x join trueque.grants y on y.id = x.grant_id
                  where x.person_id = r.person_id and y.id <> g.id and y.occasion_code = g.occasion_code
                    and y.status in ('pending', 'scheduled', 'delivered') and x.skipped_reason is null
                    and extract(year from y.deliver_on) = v_year)
    limit 1;
    if v_name is not null then
      raise exception '% se da una vez al año y % ya lo tiene.', occ.name, v_name;
    end if;
  end if;

  update trueque.grants set status = 'pending', submitted_at = now() where id = g.id;
  perform trueque.grant_log(g.id, 'submitted', format('%s personas', v_count));
  insert into trueque.notifications (person_id, kind, body, link)
  select a.person_id, 'grant', format('Hay un regalo por autorizar: «%s».', left(g.name, 80)), '/gifts/' || g.id
  from trueque.grant_approvers a
  where a.person_id <> g.created_by;
  return 'pending';
end;
$$;

create function trueque.grant_deliver_one(p_id uuid)
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  g trueque.grants;
  r record;
  v_company uuid;
  v_ledger bigint;
  n integer := 0;
  v_skipped integer := 0;
begin
  select * into g from trueque.grants where id = p_id for update;
  if g.id is null or g.status <> 'scheduled' then
    return 0;
  end if;
  for r in select * from trueque.grant_recipients where grant_id = g.id and ledger_id is null and skipped_reason is null
  loop
    v_company := trueque.person_company(r.person_id);
    if not trueque.is_active_person(r.person_id) then
      update trueque.grant_recipients set skipped_reason = 'Ya no está activo.' where id = r.id;
      v_skipped := v_skipped + 1;
    elsif v_company is null then
      update trueque.grant_recipients set skipped_reason = 'No tiene empresa.' where id = r.id;
      v_skipped := v_skipped + 1;
    else
      v_ledger := null;
      insert into trueque.ledger (person_id, company_id, kind, amount, rule_code, source, source_id, source_ref, note, expires_on, created_by)
      values (r.person_id, v_company, 'earn', r.amount, 'grant', 'trueque.grant', r.id, g.folio_code, left(g.name, 80),
              (current_date + make_interval(months => g.lot_months))::date, g.decided_by)
      on conflict (person_id, rule_code, source_id) where kind = 'earn' do nothing
      returning id into v_ledger;
      if v_ledger is not null then
        update trueque.grant_recipients set ledger_id = v_ledger where id = r.id;
        n := n + 1;
      end if;
    end if;
  end loop;
  update trueque.grants set status = 'delivered', delivered_at = now() where id = g.id;
  insert into trueque.grant_events (grant_id, kind, actor_id, note)
  values (g.id, 'delivered', null, format('%s personas recibieron; %s saltadas', n, v_skipped));
  return n;
end;
$$;

create function trueque.grant_decide(p_id uuid, p_approve boolean, p_note text default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  v_me uuid := public.current_person_id();
  g trueque.grants;
  v_year integer;
  v_fund integer;
  v_used integer;
  v_total integer;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if not trueque.is_grant_approver() then
    raise exception 'No tienes permiso para autorizar regalos.';
  end if;
  select * into g from trueque.grants where id = p_id for update;
  if g.id is null or g.status <> 'pending' then
    raise exception 'Este regalo no está esperando autorización.';
  end if;
  if g.created_by = v_me then
    raise exception 'No puedes autorizar un regalo que armaste.';
  end if;
  if g.scope = 'list' and exists (select 1 from trueque.grant_recipients where grant_id = g.id and person_id = v_me) then
    raise exception 'No puedes autorizar una lista donde apareces.';
  end if;

  if not p_approve then
    if length(coalesce(v_note, '')) < 10 then
      raise exception 'Escribe el motivo del rechazo (al menos 10 letras).';
    end if;
    update trueque.grants set status = 'rejected', decided_by = v_me, decided_at = now(), decision_note = v_note where id = g.id;
    perform trueque.grant_log(g.id, 'rejected', v_note);
    insert into trueque.notifications (person_id, kind, body, link)
    values (g.created_by, 'grant', format('Rechazaron el regalo «%s»: revisa el motivo.', left(g.name, 80)), '/gifts/' || g.id);
    return 'rejected';
  end if;

  v_year := extract(year from g.deliver_on)::integer;
  select amount into v_fund from trueque.grant_funds where period = v_year;
  if v_fund is null then
    raise exception 'No hay fondo de regalos para %. Defínelo antes de autorizar.', v_year;
  end if;
  select coalesce(sum(r.amount), 0) into v_used
  from trueque.grant_recipients r join trueque.grants y on y.id = r.grant_id
  where y.status in ('scheduled', 'delivered') and r.skipped_reason is null and extract(year from y.deliver_on) = v_year;
  select coalesce(sum(amount), 0) into v_total from trueque.grant_recipients where grant_id = g.id;
  if v_used + v_total > v_fund then
    raise exception 'El fondo de % no alcanza: quedan % yemas y este regalo pide %.', v_year, v_fund - v_used, v_total;
  end if;

  update trueque.grants set status = 'scheduled', decided_by = v_me, decided_at = now(), decision_note = v_note where id = g.id;
  perform trueque.grant_log(g.id, 'approved', v_note);
  insert into trueque.notifications (person_id, kind, body, link)
  values (g.created_by, 'grant', format('Autorizaron el regalo «%s».', left(g.name, 80)), '/gifts/' || g.id);
  if g.deliver_on <= current_date then
    perform trueque.grant_deliver_one(g.id);
    return 'delivered';
  end if;
  return 'scheduled';
end;
$$;

create function trueque.grant_cancel(p_id uuid, p_note text default null)
returns text
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  g trueque.grants;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  if not trueque.is_hr_reviewer() then
    raise exception 'Sólo RH cancela regalos.';
  end if;
  select * into g from trueque.grants where id = p_id for update;
  if g.id is null or g.status not in ('draft', 'rejected', 'pending', 'scheduled') then
    raise exception 'Este regalo ya no se puede cancelar.';
  end if;
  if g.status in ('pending', 'scheduled') and length(coalesce(v_note, '')) < 10 then
    raise exception 'Escribe el motivo de la cancelación (al menos 10 letras).';
  end if;
  update trueque.grants set status = 'cancelled', cancelled_by = public.current_person_id(), cancelled_at = now(), cancel_note = v_note where id = g.id;
  perform trueque.grant_log(g.id, 'cancelled', v_note);
  return 'cancelled';
end;
$$;

create function trueque.grant_set_fund(p_year integer, p_amount integer)
returns void
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  v_used integer;
begin
  if not trueque.is_grant_approver() then
    raise exception 'Sólo quien autoriza regalos define el fondo.';
  end if;
  if p_amount is null or p_amount < 0 then
    raise exception 'El fondo debe ser un número entero desde 0.';
  end if;
  select coalesce(sum(r.amount), 0) into v_used
  from trueque.grant_recipients r join trueque.grants y on y.id = r.grant_id
  where y.status in ('scheduled', 'delivered') and r.skipped_reason is null and extract(year from y.deliver_on) = p_year;
  if p_amount < v_used then
    raise exception 'El fondo no puede quedar abajo de lo ya autorizado (% yemas).', v_used;
  end if;
  insert into trueque.grant_funds (period, amount, updated_by) values (p_year, p_amount, public.current_person_id())
  on conflict (period) do update set amount = excluded.amount, updated_by = excluded.updated_by, updated_at = now();
end;
$$;

create function trueque.grant_deliver()
returns integer
language plpgsql
security definer
set search_path = trueque, public
as $$
declare
  g record;
  n integer := 0;
begin
  for g in select id from trueque.grants where status = 'scheduled' and deliver_on <= current_date order by deliver_on, folio
  loop
    perform trueque.grant_deliver_one(g.id);
    n := n + 1;
  end loop;
  return n;
end;
$$;

create view trueque.grant_cards
with (security_invoker = true)
as
select
  g.id,
  g.folio_code,
  g.occasion_code,
  o.name as occasion_name,
  g.name,
  g.reason,
  g.scope,
  g.scope_id,
  case g.scope
    when 'group' then 'Todo el grupo'
    when 'company' then (select c.name from public.companies c where c.id = g.scope_id)
    when 'area' then (select a.name from public.areas a where a.id = g.scope_id)
    when 'department' then (select d.name from public.departments d where d.id = g.scope_id)
    else 'Lista de personas'
  end as scope_name,
  g.amount,
  g.deliver_on,
  g.lot_months,
  g.status,
  g.created_by,
  (select p.full_name from public.people p where p.id = g.created_by) as created_by_name,
  g.created_at,
  g.submitted_at,
  g.decided_by,
  (select p.full_name from public.people p where p.id = g.decided_by) as decided_by_name,
  g.decided_at,
  g.decision_note,
  g.delivered_at,
  g.cancel_note,
  (select count(*)::integer from trueque.grant_recipients r where r.grant_id = g.id) as people,
  (select coalesce(sum(r.amount), 0)::integer from trueque.grant_recipients r where r.grant_id = g.id) as total,
  (select count(*)::integer from trueque.grant_recipients r where r.grant_id = g.id and r.skipped_reason is not null) as skipped
from trueque.grants g
join trueque.grant_occasions o on o.code = g.occasion_code;

create view trueque.grant_fund_usage
with (security_invoker = true)
as
select
  f.period,
  f.amount as fund,
  coalesce(sum(r.amount) filter (where g.status = 'scheduled'), 0)::integer as scheduled,
  coalesce(sum(r.amount) filter (where g.status = 'delivered' and r.skipped_reason is null), 0)::integer as delivered,
  coalesce(sum(r.amount) filter (where g.status = 'pending'), 0)::integer as pending,
  (f.amount - coalesce(sum(r.amount) filter (where g.status = 'scheduled' or (g.status = 'delivered' and r.skipped_reason is null)), 0))::integer as available
from trueque.grant_funds f
left join trueque.grants g on extract(year from g.deliver_on) = f.period
left join trueque.grant_recipients r on r.grant_id = g.id
group by f.period, f.amount;

alter table trueque.grant_occasions enable row level security;
alter table trueque.grant_approvers enable row level security;
alter table trueque.grant_funds enable row level security;
alter table trueque.grants enable row level security;
alter table trueque.grant_recipients enable row level security;
alter table trueque.grant_events enable row level security;

create policy read_all on trueque.grant_occasions for select to authenticated using (true);
create policy read_all on trueque.grant_approvers for select to authenticated using (true);
create policy read_funds on trueque.grant_funds for select to authenticated using (trueque.is_hr_reviewer() or trueque.is_grant_approver());
create policy read_grants on trueque.grants for select to authenticated using (trueque.is_hr_reviewer() or trueque.is_grant_approver());
create policy read_grant_recipients on trueque.grant_recipients for select to authenticated using (trueque.is_hr_reviewer() or trueque.is_grant_approver());
create policy read_grant_events on trueque.grant_events for select to authenticated using (trueque.is_hr_reviewer() or trueque.is_grant_approver());

grant select on trueque.grant_occasions, trueque.grant_approvers, trueque.grant_funds, trueque.grants,
  trueque.grant_recipients, trueque.grant_events, trueque.grant_cards, trueque.grant_fund_usage to authenticated;
grant update (grant_max_per_person, grant_max_per_year, grant_max_list, grant_max_days_ahead) on trueque.config to authenticated;

revoke execute on function trueque.no_grant_event_edits() from public, anon, authenticated;
revoke execute on function trueque.grant_scope_people(text, uuid) from public, anon, authenticated;
revoke execute on function trueque.grant_log(uuid, text, text) from public, anon, authenticated;
revoke execute on function trueque.grant_deliver_one(uuid) from public, anon, authenticated;
revoke execute on function trueque.grant_deliver() from public, anon, authenticated;
revoke execute on function trueque.is_active_person(uuid) from public, anon, authenticated;
revoke execute on function trueque.grant_preview(text, uuid) from public, anon;
revoke execute on function trueque.grant_save(uuid, text, text, text, text, uuid, integer, date, integer, jsonb) from public, anon;
revoke execute on function trueque.grant_submit(uuid) from public, anon;
revoke execute on function trueque.grant_decide(uuid, boolean, text) from public, anon;
revoke execute on function trueque.grant_cancel(uuid, text) from public, anon;
revoke execute on function trueque.grant_set_fund(integer, integer) from public, anon;
grant execute on function trueque.is_grant_approver() to authenticated;
grant execute on function trueque.grant_preview(text, uuid) to authenticated;
grant execute on function trueque.grant_save(uuid, text, text, text, text, uuid, integer, date, integer, jsonb) to authenticated;
grant execute on function trueque.grant_submit(uuid) to authenticated;
grant execute on function trueque.grant_decide(uuid, boolean, text) to authenticated;
grant execute on function trueque.grant_cancel(uuid, text) to authenticated;
grant execute on function trueque.grant_set_fund(integer, integer) to authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('trueque-grant-deliver', '5 6 * * *', 'select trueque.grant_deliver()');
  end if;
end;
$$;
