# Plan · El Trueque

Qué sigue y en qué orden. Cada fase se aprueba antes de empezarla. El avance real vive en `state.md`.

## Fase 0 · Propuesta visual · lista para aprobar

Prototipo en `propuesta/` con datos de ejemplo (rutas con `#`).

| Ruta | Pantalla | Quién | Para qué |
|---|---|---|---|
| `/sign-in` | Entrar | Todos | Número de trabajador → "¿Eres tú?". |
| `/` | El mercado | Todos | Saldo y cacaos por vencer, filtros por tipo, "sólo lo que me alcanza", puestos con rótulo de precio. |
| `/products/:id` | Detalle | Todos | Quién lo ofrece, dónde se canjea, vigencia del cupón, existencias, procedencia si viene de Custodia y **qué lotes se usarían**. |
| `/trade/:id` | Hacer el trueque | Todos | Revisión → recibo dentado → boleto con QR. |
| `/wallet` | Mi jícara | Todos | Saldo, ganados, cambiados, por vencer y movimientos. |
| `/coupons` | Mis cupones | Todos | Vigentes con código, usados y vencidos. |
| `/earn` | Cómo gano cacaos | Todos | El pizarrón de reglas con topes, "para darte una idea" y los lotes con su vencimiento. |
| `/panel` | Mi puesto | Empresa | Presupuesto, productos, publicar, equipos de Custodia. |
| `/panel` | Precios por aprobar | RH | Precio contra rango de referencia: aprobar, ajustar o rechazar. |

Estados: arranque, esqueletos, sin conexión (puesto cerrado), 404, vacíos.

## Fase 1 · Web de demostración (`trueque.client`)

### Base de datos (lista en `supabase/`)

Esquema `trueque` sobre el mismo Supabase de Chispa. Pasos en el proyecto de Supabase, en este orden:

1. Ya aplicadas: las migraciones de Chispa.
2. SQL Editor: `supabase/migrations/20261103000000_trueque_init.sql`.
3. SQL Editor: `supabase/seed.sql` (categorías y reglas de ganancia). Opcional: `supabase/seed_demo.sql`.
4. **Project Settings → API → Exposed schemas**: agregar `trueque`.
5. Asignar roles: filas en `trueque.store_managers` (empresa, persona) y `trueque.hr_reviewers`.
6. Mantenimiento diario con `pg_cron`: `select trueque.expire_lots(); select trueque.expire_coupons();`.

Detalle de cada tabla en `docs/database.md`.

### Librerías

Las mismas versiones fijas que `chispa.client` (React 19.2.8, Vite 7.3.6, TypeScript 5.9.3, Tailwind 4.3.3, TanStack Query 5.101.2, react-router 8.3.0, react-hook-form + zod 3.25.76, sonner, clsx, `@radix-ui/react-popover`, `@supabase/supabase-js` 2.118.0) y el mismo `.npmrc` (`ignore-scripts`, `allow-git=none`, `min-release-age=7`, `save-exact`). Fuentes con fontsource: Lilita One, Figtree, IBM Plex Mono.

### Estructura (la de `chispa.client`, para que `/frontend-review` aplique igual)

```
trueque.client/src/
  router/app_router.tsx                       createBrowserRouter + lazy
  layouts/{auth,protected}/                   auth_guard y protected_layout (barra con el saldo)
  context/session/                            la misma sesión de Chispa
  pages/<module>/<feature>/<feature>_page.tsx market/list · products/detail · trade/review · trade/receipt · wallet · coupons · earn · panel/company · panel/hr
  components/ui/                              combobox, coin, price_sign, receipt, ticket, qr_code, empty_state…
  components/<module>/                        market/stall · wallet/lot_row · panel/budget_bar · panel/price_range…
  hooks/<domain>/use_<name>.tsx               use_products, use_wallet, use_trade, use_coupons, use_panel
  schemas/<module>/<feature>/<name>.schema.ts publish_product, review_price
  services/api/unit_of_services.ts            cada repositorio detrás de una interfaz
  constants/query_keys.ts · constants/routes.ts · types/ · utils/ · styles/{tokens,app,motion}.css
```

Repositorios (interfaz → implementación Supabase hoy, API mañana):

| Repositorio | Lee | Escribe |
|---|---|---|
| `ProductRepository` | `trueque.product_cards`, `exchange_locations`, `categories` | `products` (empresa) |
| `WalletRepository` | `trueque.balances`, `trueque.lots`, `trueque.ledger` | — |
| `TradeRepository` | `orders`, `coupons` | `rpc('trade')` |
| `PanelRepository` | `budget_usage`, `price_reviews`, `orders` de su empresa | `rpc('review_price')`, `company_budgets` |
| `RedeemRepository` | — | `rpc('redeem')` |

Con Supabase se llama `supabase.schema('trueque')`. Claves de consulta en `constants/query_keys.ts`; el saldo se invalida después de cada trueque.

### Integración con Chispa

- **En la base ya funciona**: los triggers de `trueque` abonan cacaos cuando se manda una chispa, pasa a revisión, llega a la feria, se implementa o se publica un reto (con topes y sin duplicar).
- **En `chispa.client`** (feature en el repo de Chispa, a aprobar allá): un aviso "Ganaste 10 cacaos" al cambiar el estado de tu chispa y un enlace "Mis cacaos" en el menú hacia El Trueque.

### Orden de trabajo

1. `feature/client-setup`: Vite + Tailwind + tokens + sesión compartida + router + layouts.
2. `feature/market`: mercado, detalle y puesto.
3. `feature/trade`: trueque, recibo y cupón.
4. `feature/wallet`: jícara, cupones y cómo gano.
5. `feature/panel`: panel de empresa y de RH.
6. `/frontend-review`, pruebas con los tres roles en el navegador, `release/0.2.0` y despliegue en Vercel.

## Fase 2 · Producto (API .NET)

La misma estructura que el proyecto de referencia:

```
Trueque.Api/            Controllers V2 (Products, Trades, Wallet, Coupons, Redemptions, Budgets, PriceReviews)
Trueque.Application/    Features/<Entity>/{Commands,Queries,Handlers,Validators} con MediatR + FluentValidation
Trueque.Domain/         Entidades y reglas (FIFO de lotes, topes, caducidad)
Trueque.Infrastructure/ EF Core sobre SQL Server; emisión del cupón en el sistema de cupones existente
```

Las funciones `trade`, `redeem`, `review_price` y `award` pasan a comandos del API con la misma regla; los triggers de Chispa pasan a eventos del dominio (`IdeaStatusChanged` → `AwardCacaos`). Auth0 sustituye la sesión simulada sin cambiar las pantallas.

## Preguntas abiertas

1. ¿Se pueden regalar cacaos entre compañeros? Si sí, ¿con tope?
2. ¿Productos caros piden aprobación del jefe además del saldo?
3. ¿Qué pasa con los cacaos de quien deja la empresa? (Propuesta: se cancelan; los cupones emitidos siguen hasta su vigencia.)
4. Fiscal: ¿nómina ve los canjes en especie como ingreso?
5. Si un cupón vence sin usarse, ¿se devuelven los cacaos? (Hoy `config.refund_on_expiry = false`.)
