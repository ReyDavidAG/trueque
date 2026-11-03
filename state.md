# Estado · El Trueque

Última actualización: 2026-11-03

## Dónde vamos

- **Fase 1 · Web de demostración: publicada (v0.2.1)** en https://trueque-eosin.vercel.app.
- **Fase 1.1 · Completar la tienda: plan escrito**, en espera de aprobación. Siguiente paso: la propuesta visual (A1–A12 de `plan.md`) en `propuesta/` para que la revises antes de tocar el cliente.
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

## Publicación

- Vercel, proyecto `trueque`, raíz `trueque.client`, rama `main`: https://trueque-eosin.vercel.app
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_SITE_URL`.
- Probado en producción: entrar, rutas directas, metadatos para compartir y consola limpia.

## Decisiones tomadas

- Un esquema por app en la misma base; lo común se queda en `public` de Chispa.
- El saldo no se guarda: se calcula del libro. El libro no se edita.
- RH aprueba precios.
- Cacaos sólo desde Chispa en fase 1; vencen a 12 meses; FIFO.
- El trabajo visual se aprueba primero en `propuesta/` y después se implementa.
- Primero lo publicable (Supabase y login simulado); Auth0 y el API de RH se quedan en local, fuera del repo público.
- Fotos de producto: hasta 2 por producto, en base64, en una tabla aparte.

## Por decidir (antes de `feature/config`)

- Valor del cacao en pesos (propuesta: $5 MXN, configurable).
- Quién paga el canje: la empresa de quien cambia o la que ofrece (recomendación: la que ofrece).
- Presupuesto anual por empresa en pesos.

## Pendiente

- Sesión entre apps: `claim_employee_number` liga a la persona con una sola sesión anónima, así que entrar en otra app del ecosistema cierra la de aquí. Se resuelve con Auth0 (fase 1.2 en local, fase 2 en producción).
- Para la fase 1.2: alta de `http://localhost:5175` en la aplicación de Auth0 de CFDI y los 4 endpoints de cupones en el API de CFDI.
