insert into trueque.categories (code, name, price_min, price_max, position) values
  ('service', 'Servicios', 20, 400, 1),
  ('item', 'Artículos', 20, 300, 2),
  ('custodia', 'De Custodia', 60, 800, 3);

insert into trueque.earning_rules (code, source, label, cacaos, monthly_cap, position, note) values
  ('idea', 'chispa', 'Mandas una chispa', 5, 4, 1, 'Premia participar, no mandar diez iguales.'),
  ('review', 'chispa', 'Tu chispa pasa a revisión', 10, null, 2, 'Quiere decir que el área la tomó en serio.'),
  ('challenge', 'chispa', 'Publicas un reto (aceptado)', 15, 2, 3, 'Contar bien un problema también vale.'),
  ('selected', 'chispa', 'Tu chispa llega a la feria', 60, null, 4, 'La decide el comité con la rúbrica.'),
  ('done', 'chispa', 'Tu chispa se implementa', 150, null, 5, 'El impacto real es lo que más paga.'),
  ('support', 'chispa', 'Avivas una chispa', 0, null, 6, 'Si diera cacaos, todos avivarían todo.')
on conflict (code) do nothing;
