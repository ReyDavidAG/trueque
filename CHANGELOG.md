# Cambios

## 0.2.0 · 2026-11-02

Web de demostración (`trueque.client`).

- React 19 + Vite + TypeScript + Tailwind v4 sobre el Supabase de Chispa, con la misma sesión por número de trabajador.
- Mercado con filtros, detalle con plan de pago FIFO, trueque con recibo y cupón, Mi jícara, Mis cupones y Cómo gano cacaos.
- Panel de empresa (presupuesto, canje por código y publicación con ilustración) y panel de RH (aprobar o rechazar precios, incluidos los equipos que llegan de Custodia).
- Metadatos para compartir, íconos y manifiesto.
- Probado en Chrome con los tres roles y de 320 a 1280 px.

## 0.1.0 · 2026-11-02

Primera versión de la propuesta.

- Prototipo navegable: mercado, detalle, trueque con recibo y cupón, Mi jícara, Mis cupones, Cómo gano cacaos, panel de empresa y de RH, entrar y estados de carga, error y 404.
- Esquema `trueque` en la base de Chispa: productos, libro de cacaos con lotes FIFO y caducidad, trueques, cupones, canjes, presupuesto por empresa, revisión de precios y RLS.
- Integración con Chispa: los cacaos se abonan solos al mandar chispas, pasar a revisión, llegar a la feria, implementarse o publicar un reto.
- Prueba del esquema con PGlite (32 reglas).
