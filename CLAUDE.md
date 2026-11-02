# CLAUDE.md

Guía para Claude Code en este repositorio. Es la fuente de verdad del proyecto; `plan.md` dice **qué sigue** y `state.md` dice **dónde vamos**.

## Qué es El Trueque

La tienda interna del grupo. Los colaboradores ganan **cacaos** (la moneda: en Mesoamérica el cacao fue moneda de verdad) cuando participan en la vida de la empresa, y los cambian por servicios y artículos que ofrecen las empresas del grupo. Cada trueque emite un **cupón** canjeable con código.

Es parte de un ecosistema de tres apps que comparten base de datos y personas:

| App | Repo | Qué hace |
|---|---|---|
| **Chispa** | `chispa` | Feria de innovación: las áreas publican retos y todos proponen chispas. **Es de donde salen los cacaos.** |
| **El Trueque** | este | La tienda de cacaos y los cupones. |
| **Custodia** | `custodia` | Inventario y préstamo de equipo. Un equipo dado de baja que sirve se **postula a El Trueque**. |

Es una propuesta personal para presentar a la dirección. **No es un sistema oficial todavía** y no corre en servidores de la empresa. Nunca datos de personas reales. El contexto interno vive en `CLAUDE.local.md` (no se publica).

### Objetivos

1. Que participar en Chispa tenga una recompensa que todos entiendan: "esto vale X cacaos".
2. Que en 10 segundos se vea **qué me alcanza** y que hacer el trueque tome menos de 1 minuto, desde el celular.
3. Que cada empresa publique lo que ofrece a su gente y pague sólo lo suyo; que RH cuide que los precios sean parejos.
4. Que los cacaos no se inflen: topes por mes, caducidad a 12 meses y premios grandes sólo cuando una persona decide (comité, implementación).
5. Que el cupón sea el mismo que la persona ya conoce: el diseño espeja el sistema de cupones existente para que en la fase 2 se emita ahí.

### Vocabulario (igual en código, pantalla y documentos)

| Pantalla | Código | Qué es |
|---|---|---|
| Cacao(s) | `cacaos`, `ledger` | La moneda. Se gana por reglas y se gasta en trueques. |
| Lote | `lot` | Cacaos ganados en un mismo movimiento; vencen juntos. |
| El mercado | `products` | El catálogo. |
| Puesto | `stall` (UI) | La tarjeta de un producto. |
| Trueque | `order` | Cambiar cacaos por un producto. Folio `TRQ-0000`. |
| Cupón | `coupon` | Lo que se canjea en el lugar de canje. Código `CAC-…`. |
| Lugar de canje | `exchange_location` | Donde se entrega el producto o servicio. |
| Mi jícara | `wallet` | Saldo y movimientos. |
| Mi puesto | `panel` | Lo que una empresa ofrece y su presupuesto. |

Estados del producto: `draft` · `pending` (espera a RH) · `live` · `paused` · `rejected` · `retired`.
Estados del trueque: `issued` · `used` · `expired` · `cancelled` · `refunded`.
Estados del cupón: `valid` · `used` · `expired` · `disabled`.

### Roles

| Rol | Puede |
|---|---|
| Colaborador | Ver el mercado de su empresa, hacer trueques, ver su jícara y sus cupones. |
| Empresa (encargado de la tienda) | Lo anterior + publicar productos de su empresa (quedan pendientes), pausarlos, ver su presupuesto y canjear cupones de sus productos. |
| Lugar de canje | Canjear cupones en su lugar. |
| RH corporativo | Aprobar, ajustar o rechazar precios; asignar presupuestos; ver todo. |

### Decisiones tomadas

- Los cacaos salen **sólo de Chispa** en la primera versión; las reglas son un catálogo (`earning_rules`), así que capacitación o encuestas entran después sin rehacer nada.
- Cada cacao **vence a 12 meses** de ganarse; al gastar se usan primero los más viejos (FIFO por lote).
- **Paga la empresa de quien hace el trueque**: cada empresa tiene su presupuesto anual.
- **Cada empresa publica, RH aprueba** el precio.
- Los equipos de Custodia llegan con IT y contabilidad listos, existencias = 1.
- En fase 2 el cupón se emite en el sistema de cupones existente; hoy se simula con `trueque.coupons`.

## Fases

| Fase | Qué | Dónde corre |
|---|---|---|
| 0 · Propuesta visual | Prototipo navegable en HTML/CSS/JS sin compilación. | `propuesta/` local |
| 1 · Web de demostración | `trueque.client` (React + Vite + Tailwind) sobre el mismo Supabase de Chispa. | Vercel + Supabase |
| 2 · Producto | API .NET + SQL Server + Auth0, misma estructura que el proyecto de referencia; los cupones se emiten en el sistema existente. | Por definir |

**Login simulado (fases 0 y 1):** número de trabajador, mínimo 5 dígitos, y "¿Eres tú?". Es la misma sesión de Chispa (`public.claim_employee_number`).

**Datos:** toda lectura y escritura pasa por repositorios con interfaz (`ProductRepository`, `WalletRepository`, …). Las pantallas no saben si detrás hay Supabase o el API.

## Estructura

```
./
  CLAUDE.md  plan.md  state.md
  propuesta/                  Fase 0: prototipo estático
  supabase/migrations/        Esquema trueque (requiere el de Chispa) · seed.sql catálogos · seed_demo.sql ejemplo
  supabase/tests/             Prueba con PGlite: aplica Chispa + El Trueque (npm run check)
  docs/database.md            Por qué cada tabla, RLS, integración y paso a SQL Server
  trueque.client/             Fase 1: React 19 + Vite + TS + Tailwind v4 + Supabase (puerto 5175)
  Trueque.Api/ .Application/ .Domain/ .Infrastructure/   Fase 2 (aún no existe)
```

### Ver el prototipo

```bash
cd propuesta && python3 -m http.server 5183
# http://localhost:5183 · teléfono: /herramientas/marco.html?w=375&p=/
```

### Probar el esquema

```bash
cd supabase/tests && npm install --ignore-scripts && npm run check
# Busca Chispa en ../Chispa; otra ruta con CHISPA_DIR=/ruta/a/Chispa
```

## Convenciones

- **Respuestas al usuario en español; código en inglés.** Español sólo en texto que ve una persona.
- **Sin comentarios en el código**, salvo una línea que registre algo que el código no puede enseñar.
- **Commits de una sola línea**, sin descripción ni trailer.
- El front pasa por **`/frontend-review`** antes de cada commit, con la misma estructura de `chispa.client`.
- **Rutas y parámetros en inglés** (`/products/:id`, `/trade/:id`); el texto en pantalla, en español.
- Cambios a la base: una migración nueva en `supabase/migrations/` (nunca editar una ya aplicada), su explicación en `docs/database.md` y la prueba en verde.
- Todo lo de esta app vive en el esquema `trueque`; de Chispa sólo se **lee** `public` (personas, empresas, áreas) y se escucha con triggers.

### Diseño

- Móvil primero: 320, 375, 414, 768 y 1280 px sin desplazamiento horizontal.
- Todo color y tipografía sale de los tokens. Nada de hex sueltos en componentes.
- Tipografía: **Lilita One** (títulos, letra de rótulo), **Figtree** (texto), **IBM Plex Mono** (folios y cifras).
- Piezas de identidad: el **puesto** con toldo, el **rótulo colgado** con el precio, la **moneda de cacao** (moneda café con la mazorca), el **recibo** dentado y el **boleto** troquelado.
- Prohibido `<select>` nativo: combobox con búsqueda o chips.
- Contraste AA, foco visible, animación sólo `transform`/`opacity` y apagada con `prefers-reduced-motion`.
- Nada de métricas inventadas como reales: los datos de ejemplo se marcan como tales.

## Cómo se trabaja

1. Antes de construir algo nuevo se acuerda en `plan.md` y el usuario lo aprueba.
2. Al terminar una tarea se actualiza `state.md`.
3. Lo visual se prueba en el navegador antes de pedir aprobación.

## Git (gitflow)

- `main`: lo publicado; sólo recibe `release/*` y `hotfix/*`, con tag `vX.Y.Z`.
- `develop`: integración; recibe los `feature/*` con merge `--no-ff`.
- `release/<versión>` y `hotfix/<nombre>` como en Chispa.
- El repo es **público**: nada de datos de personas, números de trabajador, cadenas de conexión ni estructura interna de bases. Lo privado va en `CLAUDE.local.md`, `docs/local/` y `.git/info/exclude`.
