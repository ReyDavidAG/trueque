# Estado · El Trueque

Última actualización: 2026-11-02

## Dónde vamos

**Fase 0 · Propuesta visual: lista.** Prototipo completo en `propuesta/`.
**Fase 1 · Web de demostración: lista (v0.2.0).** Esquema `trueque` aplicado en Supabase y `trueque.client` probado en Chrome con los tres roles. Publicado en https://trueque-eosin.vercel.app.

## Hecho

- Propuesta visual (`propuesta/`): mercado, detalle, trueque, Mi jícara, cupones, Cómo gano, paneles de empresa y RH, estados de carga, error y 404.
- Base de datos (`supabase/`): esquema `trueque` con libro de cacaos FIFO, trueques, cupones, canjes, presupuestos, revisión de precios, RLS e integración con Chispa por triggers. Prueba PGlite: 32 reglas en verde.
- `trueque.client`:
  - Entrar con número de trabajador (misma sesión que Chispa) y rol por tabla: RH, empresa o colaborador.
  - Mercado, detalle con plan FIFO, trueque con recibo y cupón, Mi jícara, Mis cupones, Cómo gano.
  - Panel de empresa (presupuesto, canje por código, publicar con ilustración y Zod) y panel de RH (aprobar o rechazar precios; también los equipos que postula Custodia).
  - Metadatos OG, íconos y manifiesto.
  - Revisado con `/frontend-review`; prettier, eslint y build en verde.
  - Probado en Chrome: trueque, canje, publicación y aprobación de punta a punta; sin desbordes de 320 a 1280 px; consola limpia.

## Publicación

- Vercel, proyecto `trueque`, raíz `trueque.client`, rama `main`: https://trueque-eosin.vercel.app
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_SITE_URL`.
- Probado en producción: entrar, rutas directas, metadatos para compartir y consola limpia.

## Decisiones tomadas

- Un esquema por app en la misma base; lo común se queda en `public` de Chispa.
- El saldo no se guarda: se calcula del libro. El libro no se edita.
- Paga la empresa de quien hace el trueque; RH aprueba precios.
- Cacaos sólo desde Chispa en fase 1; vencen a 12 meses; FIFO.

## Pendiente

- Sesión entre apps: `claim_employee_number` liga a la persona con una sola sesión anónima, así que entrar en otra app del ecosistema cierra la de aquí. Se resuelve con Auth0 en fase 2 o con una tabla de sesiones por persona.
