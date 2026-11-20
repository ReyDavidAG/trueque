insert into trueque.categories (code, name, price_min, price_max, position, description, self_service, art) values
  ('pantry', 'De la despensa', 5, 200, 1, 'Comida, café y básicos para llevar a casa.', true, 'groceries'),
  ('service', 'Servicios', 20, 400, 2, 'Consultas, talleres y tiempo de alguien para ti.', true, 'chat'),
  ('item', 'Artículos', 20, 300, 3, 'Cosas que te llevas: termos, ropa, accesorios.', true, 'thermos'),
  ('custodia', 'De Custodia', 60, 800, 4, 'Equipo dado de baja que todavía sirve.', false, 'laptop')
on conflict (code) do nothing;

insert into trueque.earning_rules (code, source, label, cacaos, monthly_cap, position, note) values
  ('idea', 'chispa', 'Mandas una chispa', 5, 4, 1, 'Premia participar, no mandar diez iguales.'),
  ('review', 'chispa', 'Tu chispa pasa a revisión', 10, null, 2, 'Quiere decir que el área la tomó en serio.'),
  ('challenge', 'chispa', 'Publicas un reto (aceptado)', 15, 2, 3, 'Contar bien un problema también vale.'),
  ('selected', 'chispa', 'Tu chispa llega a la feria', 60, null, 4, 'La decide el comité con la rúbrica.'),
  ('done', 'chispa', 'Tu chispa se implementa', 150, null, 5, 'El impacto real es lo que más paga.'),
  ('support', 'chispa', 'Avivas una chispa', 0, null, 6, 'Si diera yemas, todos avivarían todo.')
on conflict (code) do nothing;
