insert into trueque.exchange_locations (company_id, name, city, state, reference)
select c.id, l.name, 'Ciudad de ejemplo', 'Estado de ejemplo', l.reference
from public.companies c, (values
  ('Comedor de planta', 'Planta principal'),
  ('Oficina de RH', 'Edificio administrativo'),
  ('Consultorio de planta', 'Junto a enfermería'),
  ('Mesa de soporte de IT', 'Edificio administrativo, planta baja'),
  ('Taller mecánico interno', 'Patio de maniobras')
) as l (name, reference)
where c.code = 'DEMO';

insert into trueque.products (company_id, category_code, kind, name, blurb, detail, art, price, stock, coupon_days, location_id, status)
select c.id, p.category, p.kind, p.name, p.blurb, p.detail, p.art, p.price, p.stock, p.days,
       (select id from trueque.exchange_locations where name = p.place), 'live'
from public.companies c, (values
  ('service', 'service', 'Comida corrida en el comedor', 'Plato fuerte, agua del día y postre.', 'Se canjea en cualquier turno.', 'plate', 25, null::integer, 30, 'Comedor de planta'),
  ('item', 'item', 'Termo de acero 750 ml', 'Mantiene el café caliente todo el turno.', 'Se recoge en la oficina de RH.', 'thermos', 40, 18, 45, 'Oficina de RH'),
  ('service', 'service', 'Consulta con nutrióloga', 'Valoración y plan de alimentación.', 'Incluye medición y plan para un mes.', 'apple', 60, null, 60, 'Consultorio de planta'),
  ('service', 'service', 'Sesión de acompañamiento psicológico', 'Una sesión confidencial de 50 minutos.', 'El cupón lo valida sólo el consultorio.', 'chat', 80, null, 90, 'Consultorio de planta'),
  ('service', 'service', 'Afinación en el taller interno', 'Mano de obra de una afinación menor.', 'Las refacciones van por tu cuenta.', 'wrench', 250, 6, 60, 'Taller mecánico interno')
) as p (category, kind, name, blurb, detail, art, price, stock, days, place)
where c.code = 'DEMO';

insert into trueque.company_budgets (company_id, period, assigned)
select id, 2026, 120000 from public.companies where code = 'DEMO';

update trueque.products set cost = price * (select cacao_value from trueque.config) where cost = 0 and origin = 'manual';
update trueque.products set stall = trueque.default_stall(art, origin) where stall = 'grana';
