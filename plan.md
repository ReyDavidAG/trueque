# Plan · El Trueque

Qué sigue y en qué orden. Cada etapa se aprueba antes de empezarla. El avance real vive en `state.md`.

## Hecho

- **Fase 0 · Propuesta visual** en `propuesta/`.
- **Fase 1 · Web de demostración** `trueque.client` v0.2.1, publicada en Vercel con login simulado y Supabase. Detalle en `state.md`; tablas en `docs/database.md`.

## Fase 1.1 · Completar la tienda (publicable) · v0.3.0

Todo esto corre sólo con Supabase y el login simulado, así que se puede publicar en Vercel. Lo que necesita Auth0 o el API de RH va en la fase 1.2.

### Regla de trabajo: primero el diseño, en la propuesta

Nada visual entra a `trueque.client` sin aprobación.

1. Cada pantalla nueva o cambiada se dibuja primero en `propuesta/` (HTML/CSS/JS, datos de ejemplo), con el mismo vocabulario visual: mercado mexicano, contorno de tinta, pigmentos planos, Lilita One, moneda de cacao.
2. Se revisa en el navegador a 320, 375, 768 y 1280 px, con animaciones y estados (vacío, error, cargando).
3. Se entrega con capturas y la lista de cambios. Tú apruebas o pides cambios.
4. Hasta que esté aprobado, se implementa en el cliente.

### A · Propuesta visual a aprobar

| # | Pantalla | Qué se propone |
|---|---|---|
| A1 | Barra superior | Versión junto al nombre (ya en el cliente desde v0.2.1). |
| A2 | Qué es un cacao | Explicación corta en el mercado y en "Cómo gano": qué es, cuánto vale en pesos, de dónde sale y cuándo vence. Que se entienda en 10 segundos. |
| A3 | Tarjeta de producto | Foto del producto cuando la hay; si no, la ilustración. Rótulo de precio, quién lo ofrece, existencias y "te alcanza / te faltan N". |
| A4 | Detalle de producto | Galería de hasta 2 fotos, lo que incluye, dónde y cuándo se canjea, vigencia del cupón y plan de pago con los lotes. |
| A5 | Ilustraciones | Revisión pieza por pieza a tamaño real y juego ampliado por tipo de servicio (salud, comida, capacitación, taller, artículo del grupo, tiempo libre, equipo de Custodia, etc.), coherente con la moneda y la marca. |
| A6 | Publicar y editar producto | Formulario por pasos: qué es, fotos o ilustración, costo y precio, existencias y vigencia, dónde se canjea, revisión. Con texto de ayuda en cada campo. |
| A7 | Mis productos | Lista con estado (pendiente, publicado, pausado, rechazado con motivo, retirado) y acciones de editar, pausar, reanudar y retirar. |
| A8 | Canje en el lugar | Escanear o escribir el código, ver el cupón antes de confirmar y errores claros: vencido, ya usado, de otro lugar, sin presupuesto. |
| A9 | Revisión de precios (RH) | Costo en pesos, precio sugerido con la equivalencia, rango de la categoría, aprobar, ajustar o rechazar con motivo obligatorio. |
| A10 | Configuración (RH) | Valor del cacao, reglas de ganancia y topes, caducidad, categorías y rangos, presupuestos por empresa, lugares de canje. Cada campo explica qué cambia. |
| A11 | Tablero (RH y dirección) | Cacaos dados, canjeados y por vencer; costo en pesos; lo que se debe en cacaos sin canjear; participación por empresa y área; productos más cambiados. |
| A12 | Avisos | Campana con avisos: ganaste cacaos, te vencen pronto, tu cupón vence, tu producto se aprobó o rechazó. |

Entrega: `propuesta/` actualizada y capturas por pantalla y ancho.

### B · Implementación (después de aprobar A)

Una `feature/*` por bloque. Cada una cierra con: migración nueva en `supabase/migrations/` y su explicación en `docs/database.md`, prueba PGlite en verde, `/frontend-review`, pruebas en Chrome con los tres roles y sin desbordes de 320 a 1280 px.

| Orden | Rama | Qué incluye | Base de datos |
|---|---|---|---|
| 1 | `feature/version-badge` | Versión junto al nombre (hecho). | — |
| 2 | `feature/config` | Pantalla de configuración (A10) para RH. | `config.cacao_value` (pesos por cacao); edición de `earning_rules`, `categories`, `company_budgets` y `exchange_locations` con políticas de escritura sólo para RH. |
| 3 | `feature/product-form` | Formulario por pasos (A6), Mis productos (A7), editar, pausar, reanudar, retirar y existencias. | `products.cost` (costo real en pesos, obligatorio); función para cambiar estado con reglas. |
| 4 | `feature/product-images` | Hasta 2 fotos por producto (A3, A4). | Tabla `product_images` (producto, posición 1–2, data URL base64, tipo, bytes). |
| 5 | `feature/illustrations` | Juego de ilustraciones aprobado (A5). | Nuevos valores de `products.art`. |
| 6 | `feature/redeem` | Canje en el lugar (A8). | Mensajes de error de `redeem()` por caso. |
| 7 | `feature/price-review` | Revisión con costo y precio sugerido (A9). | `review_price()` exige motivo al rechazar o ajustar. |
| 8 | `feature/dashboard` | Tablero (A11). | Vistas de totales por empresa, área y periodo. |
| 9 | `feature/notifications` | Avisos (A12). | Tabla `notifications` alimentada por triggers y por las tareas diarias de vencimiento. |
| 10 | `feature/explainers` | Qué es un cacao (A2) y textos de ayuda. | — |

Cierre: `release/0.3.0` → `main` (tag) → Vercel, con las pruebas otra vez en producción.

### Formularios y validaciones (Zod en el cliente, la misma regla en la base)

| Formulario | Campos | Reglas |
|---|---|---|
| Producto | nombre, en una frase, detalle, tipo, categoría, fotos o ilustración, costo en pesos, precio en cacaos, existencias, vigencia del cupón, usos, disponible desde y hasta, lugar | Nombre de 4 a 80 caracteres; frase de 4 a 140. Costo > 0. Precio dentro del rango de la categoría; se sugiere costo ÷ valor del cacao. Existencias vacías = sin límite. Vigencia de 1 a 365 días. "Hasta" ≥ "desde". Lugar obligatorio. Máximo 2 fotos. |
| Foto | archivo | PNG, JPG o WebP. Se reduce en el navegador a 1200 px de lado mayor y se pasa a WebP. Máximo 300 KB ya comprimida; si no cabe, se avisa. |
| Revisión de precio | decisión, precio ajustado, motivo | Ajustar o rechazar exige motivo (≥ 10 caracteres). El precio ajustado debe estar dentro del rango. |
| Canje | código | Formato del código. Mensaje distinto si no existe, venció, ya se usó, es de otro lugar o la empresa no tiene presupuesto. |
| Valor del cacao | pesos por cacao | > 0, dos decimales. Al cambiarlo se muestra cuántos productos quedarían fuera de su rango. |
| Regla de ganancia | cacaos, tope por mes, activa | Cacaos ≥ 0; tope vacío = sin tope. |
| Categoría | nombre, precio mínimo, precio máximo | Mínimo > 0 y máximo ≥ mínimo. |
| Presupuesto | empresa, año, monto | Monto ≥ lo ya comprometido. |
| Lugar de canje | nombre, dirección, referencia, encargado | Nombre y encargado obligatorios. |

### Imágenes en base64

- Se guardan en `product_images`, no en `products`, para que el mercado no cargue fotos que no muestra.
- El mercado pide sólo la posición 1; el detalle pide las dos.
- Sin Storage ni configuración extra. Si después pesa, se cambia el repositorio a Storage sin tocar pantallas.

### Decisiones tomadas

1. **Valor del cacao:** 1 cacao = $5 MXN, configurable. Una chispa implementada (150 cacaos) equivale a $750 en especie.
2. **Quién paga:** la empresa que ofrece el producto, con su costo real.
3. **Presupuesto:** anual por empresa, en pesos; cada canje descuenta el costo del producto.

## Fase 1.2 · Integración con RH (sólo local) · v0.4.0

**No se publica** en Vercel ni se sube el API de staging hasta que haya autorización. El repo es público: nada de dominios, rutas internas ni llaves.

### Requisitos

1. Auth0: dar de alta `http://localhost:5175` en *Allowed Callback URLs*, *Allowed Logout URLs* y *Allowed Web Origins* de la aplicación de CFDI. Lo hace un administrador.
2. El API de CFDI corriendo local (`https://localhost:7161`) contra la base de pruebas de RH.
3. `trueque.client/.env.local` (ignorado por git) con el dominio, client ID, audiencia y scope de Auth0, la URL del API y `VITE_AUTH=rh`.

### Cómo se separa sin exponer nada

- El código que habla con RH vive en `trueque.client/src/services/rh/`, excluido con `.git/info/exclude`.
- Usa las mismas interfaces de repositorio que Supabase, así que las pantallas no cambian.
- Sin `VITE_AUTH=rh`, el cliente compila con el login simulado. Así compila Vercel, sin rastro del API de RH.

### Flujo

1. **Entrar:** login con Auth0, con el mismo client ID de CFDI.
2. **Quién eres:** `GET /personal` con el token. Si existe y está activo, entra, con su nombre, empresa, área y departamento reales. La foto sale de `GET /personal/image-profile`.
3. **Rol en la tienda:**
   - **Encargado de tienda:** es el encargado (`UserId`) de un lugar de canje de RH.
   - **RH:** tiene el permiso que se acuerde en `GET /users/me/permissions`.
   - Si no, **colaborador**.
4. **Organización:** empresas, áreas y departamentos de RH para restricciones y filtros.
5. **Tienda, saldo y libro de cacaos en Supabase.** A Supabase **no se le manda el token de Auth0**. La sesión de Supabase se liga con el número de trabajador que confirmó RH.
6. **Insignias a cacaos:** cada insignia vigente de `GET /badge-personal-templates/me` abona sus puntos una sola vez, con el id de la insignia otorgada como referencia para no duplicar.
7. **Cambiar:**
   - Supabase descuenta los cacaos y el pedido queda **pendiente de emitir**.
   - Se emite el cupón en RH y el pedido pasa a **emitido** con la clave del talonario.
   - Si RH falla, se reintenta. Al tercer fallo se cancela y se devuelven los cacaos.
8. **Ver el cupón:** la persona lo ve en El Trueque y en la app de RH (`GET /coupons`).
9. **Canjear:** el encargado escanea el código, lo consulta en RH y lo canjea. RH valida estado, vigencia, usos y monto. Supabase anota el cargo al presupuesto.

### Endpoints que faltan en el API de CFDI

Rama local en el repo de CFDI; no se sube sin autorización.

| Endpoint | Para qué | Quién |
|---|---|---|
| `POST /coupons` | Crear el cupón del catálogo al aprobarse un producto; se guarda en `products.rh_coupon_key`. | RH |
| `POST /coupon-books` | Emitir el cupón a la persona, con origen El Trueque. | La persona del token |
| `GET /coupon-books/by-code/{code}` | Ver el cupón antes de canjear. | Encargado del lugar |
| `POST /coupon-books/redeem` | Canjear y escribir el historial en una sola transacción. | Encargado del lugar |

### Riesgo conocido (se acepta sólo en local)

Supabase no valida el token de Auth0. Quien conozca un número de trabajador podría identificarse con él en Supabase. En producción, el API de RH debe ser quien escriba cacaos y pedidos, o Supabase debe validar el token. Eso es la fase 2.

### Orden

1. `feature/rh-session`: Auth0, persona, foto y rol.
2. `feature/rh-catalogs`: empresas, áreas y departamentos.
3. `feature/rh-badges`: insignias a cacaos.
4. En CFDI, los 4 endpoints de cupones con sus validaciones y pruebas.
5. `feature/rh-coupons`: emitir y canjear contra la base de pruebas, de punta a punta con los tres usuarios.

## Fase 2 · Producto (API .NET)

```
Trueque.Api/            Controllers V2 (Products, Trades, Wallet, Coupons, Redemptions, Budgets, PriceReviews, Config)
Trueque.Application/    Features/<Entity>/{Commands,Queries,Handlers,Validators} con MediatR + FluentValidation
Trueque.Domain/         Reglas: FIFO de lotes, topes, caducidad, valor del cacao
Trueque.Infrastructure/ EF Core sobre SQL Server; cupones en el sistema de RH
```

Las funciones de Supabase pasan a comandos del API. Los abonos pasan a eventos de dominio (chispa, insignia, ahorro validado, proyecto implementado). Auth0 queda como único login.

## Preguntas abiertas

1. ¿Se pueden regalar cacaos entre compañeros? Si sí, ¿con tope?
2. ¿Productos caros piden aprobación del jefe además del saldo?
3. ¿Qué pasa con los cacaos de quien deja la empresa? Propuesta: se cancelan; los cupones emitidos siguen hasta su vigencia.
4. Fiscal: ¿nómina ve los canjes en especie como ingreso? ¿Hay un tope anual por persona?
5. Si un cupón vence sin usarse, ¿se devuelven los cacaos? Hoy `config.refund_on_expiry = false`.
6. ¿Qué permiso de RH identifica al revisor de precios?
7. Nuevas fuentes de cacaos del proceso de mejora de la gerencia: aprobaciones, implementación, quien implementa y ahorro validado. Se definen con ese proceso.
