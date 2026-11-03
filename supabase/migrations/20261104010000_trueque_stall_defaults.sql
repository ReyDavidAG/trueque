create function trueque.default_stall(p_art text, p_origin text)
returns text
language sql
immutable
as $$
  select case
    when p_art in ('plate', 'coffee', 'groceries') then 'achiote'
    when p_art in ('chat', 'thermos', 'ticket', 'dayoff', 'ball') then 'anil'
    when p_art in ('apple', 'gym', 'doctor') then 'nopal'
    when p_art in ('wrench', 'scissors', 'tshirt') then 'maiz'
    when p_art in ('diploma', 'book', 'laptop', 'monitor', 'phone', 'tablet') or p_origin = 'custodia' then 'cacao'
    else 'grana'
  end
$$;

update trueque.products set stall = trueque.default_stall(art, origin) where stall = 'grana';

create function trueque.notify_pending()
returns trigger
language plpgsql
security definer
set search_path = trueque, public
as $$
begin
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    insert into trueque.notifications (person_id, kind, body, link)
    select h.person_id, 'review', format('«%s» espera que revises su precio.', left(new.name, 80)), '/panel'
    from trueque.hr_reviewers h
    where h.person_id is distinct from new.created_by;
  end if;
  return null;
end;
$$;

create trigger trueque_notify_pending after insert or update of status on trueque.products
  for each row execute function trueque.notify_pending();

revoke execute on function trueque.notify_pending() from public, anon, authenticated;
