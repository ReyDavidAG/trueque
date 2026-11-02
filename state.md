# Estado · El Trueque

Última actualización: 2026-11-02

## Dónde vamos

**Fase 0 · Propuesta visual: lista para aprobar.** Prototipo completo en `propuesta/`.
**Fase 1 · Base de datos: lista.** Esquema `trueque` sobre el Supabase de Chispa, con semillas y prueba en verde (32 reglas). Falta aplicarlo en el proyecto y construir `trueque.client`.

## Hecho

- Propuesta visual (`propuesta/`):
  - Mercado, detalle, trueque con recibo y cupón, Mi jícara, Mis cupones, Cómo gano cacaos, panel de empresa y de RH.
  - Entrar, arranque, esqueletos, sin conexión, 404.
  - Moneda de cacao (mazorca) y marca de rótulo colgado; ilustraciones SVG propias.
- Base de datos (`supabase/`):
  - Esquema `trueque`: productos (espejo de la plantilla de cupón), restricciones, revisión de precios, libro de cacaos inmutable con lotes FIFO y caducidad, trueques, cupones, canjes, presupuesto por empresa y roles.
  - Integración con Chispa por triggers: abona cacaos por chispa recibida, revisión, feria, implementación y reto publicado, con topes y sin duplicar.
  - Funciones: `trade`, `redeem`, `review_price`, `create_product_from_asset` (para Custodia), `expire_lots`, `expire_coupons`.
  - RLS por rol y `docs/database.md`.
  - Prueba PGlite que aplica Chispa + El Trueque: 32 reglas en verde.

## Decisiones tomadas

- Un esquema por app en la misma base; lo común (personas, empresas, áreas) se queda en `public` de Chispa.
- El saldo no se guarda: se calcula del libro. El libro no se edita.
- Paga la empresa de quien hace el trueque; RH aprueba precios; la empresa no se publica sola.
- Cacaos sólo desde Chispa en fase 1; vencen a 12 meses; FIFO.

## Siguiente

1. Aprobar la propuesta visual.
2. Aplicar la migración y la semilla en Supabase y exponer el esquema `trueque` (pasos en `plan.md`).
3. `trueque.client` según `plan.md`.
