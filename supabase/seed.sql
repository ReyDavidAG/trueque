insert into trueque.categories (code, name, price_min, price_max, position) values
  ('service', 'Servicios', 20, 400, 1),
  ('item', 'Artículos', 20, 300, 2),
  ('custodia', 'De Custodia', 60, 800, 3);

insert into trueque.earning_rules (code, source, label, cacaos, monthly_cap, position) values
  ('idea', 'chispa', 'Mandas una chispa', 5, 4, 1),
  ('review', 'chispa', 'Tu chispa pasa a revisión', 10, null, 2),
  ('challenge', 'chispa', 'Publicas un reto (aceptado)', 15, 2, 3),
  ('selected', 'chispa', 'Tu chispa llega a la feria', 60, null, 4),
  ('done', 'chispa', 'Tu chispa se implementa', 150, null, 5),
  ('support', 'chispa', 'Avivas una chispa', 0, null, 6);
