# Estado · El Trueque

Última actualización: 2026-11-03

## Dónde vamos

- **Fase 1 · Web de demostración: publicada** en https://trueque-eosin.vercel.app.
- **Fase 1.1 · Completar la tienda: publicada (v0.3.0).** Propuesta A1–A12 aprobada e implementada en `trueque.client`.
- **Fase 1.2 · Integración con RH: planeada, sólo local.** No se publica hasta que haya autorización.

## Hecho

- Propuesta visual (`propuesta/`): mercado, detalle, trueque, Mi jícara, cupones, Cómo gano, paneles de empresa y RH, estados de carga, error y 404.
- Base de datos (`supabase/`): esquema `trueque` con libro de cacaos FIFO, trueques, cupones, canjes, presupuestos, revisión de precios, RLS e integración con Chispa por triggers. Prueba PGlite: 32 reglas en verde.
- `trueque.client`:
  - Entrar con número de trabajador (misma sesión que Chispa) y rol por tabla: RH, empresa o colaborador.
  - Mercado, detalle con plan FIFO, trueque con recibo y cupón, Mi jícara, Mis cupones, Cómo gano.
  - Panel de empresa (presupuesto, canje por código, publicar con ilustración y Zod) y panel de RH (aprobar o rechazar precios; también los equipos que postula Custodia).
  - Metadatos OG, íconos y manifiesto.
  - Versión junto al nombre en la barra superior, leída de `package.json`.
  - Revisado con `/frontend-review`; prettier, eslint y build en verde.
  - Probado en Chrome: trueque, canje, publicación y aprobación de punta a punta; sin desbordes de 320 a 1280 px; consola limpia.
- v0.2.1 (hotfix): la imagen para compartir pasó de PNG de 700 KB a JPG de 158 KB; WhatsApp no mostraba la vista previa.

- v0.3.0 (fase 1.1) en `trueque.client`:
  - Migraciones `20261104000000_trueque_store_v2` y `20261104010000_trueque_stall_defaults`. Prueba PGlite: 51 reglas en verde (Custodia sigue en 30).
  - Catálogo de 22 ilustraciones, portada con foto, toldo por color.
  - Alta y edición en cinco pasos con Zod por paso y hasta dos fotos comprimidas a WebP.
  - Mis productos: editar, pausar, reanudar y retirar.
  - Canje con cámara (`BarcodeDetector`) o código, vista previa y errores por caso.
  - Revisión de RH con barra ajustable y nota obligatoria al ajustar o rechazar.
  - Ajustes (valor del cacao con impacto en vivo, reglas, vencimiento, rangos, presupuestos, lugares), tablero y campana.
  - Probado en Chrome con Supabase real como colaborador, encargado y RH: trueque, canje (válido, mal escrito, inexistente, ya usado), alta con foto, edición, pausa, ajuste y rechazo, validaciones de ajustes, tablero, 404. Sin desbordes de 320 a 768 px (la tabla de reglas se desplaza dentro de su tarjeta); consola limpia.

## Publicación

- Vercel, proyecto `trueque`, raíz `trueque.client`, rama `main`: https://trueque-eosin.vercel.app
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_SITE_URL`.
- Probado en producción: entrar, rutas directas, metadatos para compartir y consola limpia.

## Propuesta visual v0.3.0 (aprobada)

- `propuesta/` con datos de ejemplo y estado en el navegador; se recorre de punta a punta con los tres roles (10001, 10002, 10003).
- A1 versión junto al nombre y en el menú en celular.
- A2 "¿Qué es un cacao?" en el mercado: valor en pesos, de dónde sale y cuánto dura.
- A3/A4 tarjeta y detalle con foto o ilustración; galería, qué incluye, dónde se canjea y cuánto equivale en pesos.
- A5 22 ilustraciones en 7 grupos (comida, salud, aprendizaje, servicios, artículos, tiempo libre, Custodia), revisadas a 200, 72 y 44 px en `propuesta/herramientas/ilustraciones.html`. Catálogo en `js/art_catalog.js`: una ilustración nueva es una fila.
- A6 publicar y editar por pasos con validación en cada paso; fotos reales comprimidas en el navegador (WebP, ≤ 1200 px, ≤ 300 KB, máximo 2).
- A7 Mis productos con estados y editar, pausar, reanudar y retirar con confirmación en línea.
- A8 canje con cámara simulada o código, vista previa y errores por caso (formato, no existe, vencido, usado, de otro puesto, sin presupuesto); descuenta el costo del presupuesto.
- A9 revisión de precios con costo, sugerido y rango; motivo obligatorio al ajustar o rechazar.
- A10 ajustes: valor del cacao con impacto en vivo, reglas, vencimiento, rangos, presupuestos y lugares de canje.
- A11 tablero con indicadores, gráfica mensual, presupuesto por empresa, lo más cambiado, participación por área y fuentes.
- A12 campana de avisos por rol.
- Primera revisión aplicada:
  - "¿Qué es un cacao?" ahora trae pasos de uso, un ejemplo en pesos y el enlace a Chispa, y anima al desplegar y colapsar.
  - La barra de precio de RH se arrastra para ajustar y se aprueba en el mismo paso; si cambia el precio pide motivo.
  - Se rehicieron el carro y el balón, se agregó la tableta y la cartilla de la óptica dice REY DAVID.
  - En el puesto cerrado baja primero la persiana y luego se balancea el letrero.
  - "Cómo gano" lleva directo a Chispa.
- Sin desbordes a 320, 375 y 414 px en todas las rutas de los tres roles; consola limpia.

## Decisiones tomadas

- Un esquema por app en la misma base; lo común se queda en `public` de Chispa.
- El saldo no se guarda: se calcula del libro. El libro no se edita.
- RH aprueba precios.
- 1 cacao = $5 MXN, configurable por RH.
- Paga la empresa que ofrece el producto, con el costo real en pesos.
- Presupuesto anual por empresa en pesos.
- Cacaos sólo desde Chispa en fase 1; vencen a 12 meses; FIFO.
- El trabajo visual se aprueba primero en `propuesta/` y después se implementa.
- Primero lo publicable (Supabase y login simulado); Auth0 y el API de RH se quedan en local, fuera del repo público.
- Fotos de producto: hasta 2 por producto, en base64, en una tabla aparte.

## Pendiente

- Correr en Supabase `20261104010000_trueque_stall_defaults.sql` (toldos de los productos de antes y aviso a RH).

- Sesión entre apps: `claim_employee_number` liga a la persona con una sola sesión anónima, así que entrar en otra app del ecosistema cierra la de aquí. Se resuelve con Auth0 (fase 1.2 en local, fase 2 en producción).
- Para la fase 1.2: alta de `http://localhost:5175` en la aplicación de Auth0 de CFDI y los 4 endpoints de cupones en el API de CFDI.
