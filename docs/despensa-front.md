# La Despensa · guía de integración para el front

Qué cambió en la base con `supabase/migrations/20261120000000_trueque_despensa.sql` y `20261120010000_trueque_grants.sql`, y dónde quedó en `trueque.client`. El detalle de la base está en `docs/database.md` (secciones La Despensa y Regalos).

## Categorías y folios

| Pieza | Dónde |
|---|---|
| `Category` es `string`: ninguna categoría está escrita en el código. | `types/productType.ts` |
| `CategoryInfo` trae `position`, `description`, `isActive`, `selfService` y `art`. | `types/productType.ts`, `services/api/mappers/productMapper.ts` |
| `products.categories()` lee las columnas nuevas, en orden de `position`. | `services/api/productRepository.ts` |
| Chips de la despensa: categorías activas y, si una se apagó, sólo mientras tenga productos publicados. | `hooks/market/useShelf.ts` (`useCategoryOptions`), `components/market/resultsBar.tsx` |
| Grupos del anaquel con el nombre que viene de la base. | `components/panel/productRows.tsx` |
| Formulario de producto: sólo ofrece categorías con `isActive && selfService`. | `components/product_form/stepWhat.tsx` |
| Zod del producto: `category` es cualquier código no vacío; la base valida que exista y esté activa. | `schemas/panel/product/product.schema.ts` |
| El folio del canje sale de `orders.folio_code` (`DSP-0004`). Los viejos siguen como `TRQ-000N`; el recibo se busca por ese texto. | `services/api/tradeRepository.ts` |
| Canje: el código se valida como `LETRAS-ALFANUMÉRICO` (`YEM-…` nuevos, `CAC-…` viejos). | `schemas/panel/redeem/redeemCoupon.schema.ts`, `pages/redeem/redeemPage.tsx` |

## Categorías en Ajustes (RH)

| Pieza | Dónde |
|---|---|
| `createCategory(input)` hace `insert` en `trueque.categories`; `updateCategory(code, patch)` cambia nombre, rango, orden, descripción, activa, `selfService` e ilustración. No hay `delete`: se apaga. | `services/api/configRepository.ts` |
| Zod: `code` `^[a-z_]{2,30}$`, `name` de 2 a 40, `priceMin > 0`, `priceMax >= priceMin`, `description` hasta 160. | `schemas/settings/settings.schema.ts` |
| Por renglón: nombre, rango, interruptores **Activa** y **Las empresas publican aquí**. Al apagar, dice cuántos productos publicados tiene. | `components/settings/categoriesSection.tsx` |
| **Agregar categoría** abre los campos en línea (sin modal) con el selector de ilustración del formulario de producto. | `components/settings/newCategoryForm.tsx` |
| Al guardar se invalida el catálogo (`QUERY_KEYS.categories` entra en `['catalog']`); la despensa, el formulario y la revisión de precios se actualizan solos. | `hooks/config/useConfig.tsx` |

Errores que puede devolver la base (salen en español con `toMessage`):

| Mensaje | Cuándo |
|---|---|
| `La categoría «X» ya no recibe productos.` | Producto nuevo o cambio a una categoría apagada. |
| `En «X» sólo publica RH o llega desde Custodia.` | Una empresa intenta publicar a mano donde `self_service = false`. |
| `duplicate key` → «Eso ya estaba registrado.» | `code` repetido. |

## Folios (opcional en Ajustes)

`trueque.folio_kinds` se puede leer (`select`) y RH puede cambiar `prefix`, `digits` y `label`. Si se quiere en pantalla: una tarjeta más en Ajustes con los tipos (`order`, `product`, `coupon`, `grant`) y una vista previa con `format_folio`. Cambiar el prefijo sólo afecta a lo que se emita después. Todavía no está en pantalla.

## Regalos de yemas

Flujo, roles y límites en `docs/regalos-de-yemas.md`. En el cliente:

| Pieza | Dónde |
|---|---|
| Datos: `grant_cards`, destinatarios, bitácora, ocasiones, fondo, alcances y las funciones `grant_*` | `services/api/grantRepository.ts`, `services/api/mappers/grantMapper.ts`, `types/grantType.ts` |
| Ganchos | `hooks/grants/` (`useGrants`, `useGrantActions`, `useGiftWizard`, `useGiftTotals`) |
| Validación (mismas reglas que la base) | `schemas/grants/grant.schema.ts` |
| Pantallas | `pages/gifts/` (lista, formulario en 5 pasos, detalle) y `components/gifts/` |
| Textos de estados, alcances y bitácora | `constants/grants.ts` |
| Quién entra | `layouts/auth/giftsGuard.tsx`: RH y quien autoriza; armar y editar, sólo RH. `Session.canApproveGrants` sale de `grant_approvers`. |
| Menú: RH siempre ve **Regalos**; quien autoriza lo ve aunque no sea RH. | `components/layout/navItems.ts` |
| Topes en Ajustes | `components/settings/grantsSection.tsx` |
| Aviso con ícono de regalo | `components/layout/notificationsBell.tsx` (`kind = 'grant'`) |
| Movimiento en Mis yemas con el nombre del regalo y su folio | `services/api/walletRepository.ts` |

Para probar la autorización hace falta al menos una persona en `trueque.grant_approvers` distinta de quien arma el regalo.

## Probar

```bash
cd supabase/tests && npm run check          # 103 reglas en verde
cd trueque.client && npm run lint && npm run build
```
