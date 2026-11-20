# Regalos de yemas

Estado: **implementado** en la base (`supabase/migrations/20261120010000_trueque_grants.sql`) y en `trueque.client` (pestaña **Regalos**). Prueba PGlite en verde; falta aplicarla en Supabase.

## Para qué

Dar yemas por un evento, por ejemplo **el regalo de Navidad**: todo el grupo, una empresa, un área, un departamento o una lista de personas recibe N yemas. Queda registrado **cuándo**, **por qué**, **quién lo pidió** y **quién lo autorizó**, con límites para que no se use mal.

## El flujo

```
Borrador ──Mandar a autorizar──▶ Por autorizar ──Autorizar──▶ Programado ──el día de entrega──▶ Entregado
   ▲   │                            │                         │
   │   └──Cancelar                  ├──Rechazar (motivo)       └──Cancelar (motivo, antes de entregar)
   └──Editar ◀── Rechazado ◀────────┘
```

1. **RH arma el regalo**: ocasión, nombre, motivo, a quién, cuánto por persona, día de entrega y en cuántos meses vencen esas yemas. La pantalla muestra cuántas personas, cuántas yemas y cuántos pesos.
2. **Lo manda a autorizar.** Ahí la base congela la lista de quienes reciben y revisa todos los límites. Quien autoriza recibe un aviso.
3. **Quien autoriza** lo aprueba o lo rechaza con motivo. Si se rechaza, RH lo corrige y lo vuelve a mandar.
4. **Entrega:** si la fecha es hoy, se entrega al autorizar; si es futura, la tarea diaria (`pg_cron` a las 00:05 de México) lo entrega ese día.
5. Cada persona recibe el aviso «Ganaste 50 yemas: Regalo de Navidad 2026» y lo ve en **Mis yemas** con folio `REG-0001`. Esas yemas se gastan primero si vencen antes, igual que todas.

## Quién hace qué

| Rol | Puede | No puede |
|---|---|---|
| **RH corporativo** (`trueque.hr_reviewers`) | Armar, editar borradores y rechazados, mandar a autorizar, cancelar antes de la entrega, cambiar los límites en Ajustes. | Autorizar lo que él mismo armó. Incluirse en una lista que arma. |
| **Autoriza regalos** (`trueque.grant_approvers`, por ejemplo dirección) | Autorizar o rechazar con motivo; definir el fondo del año. | Autorizar un regalo que armó, ni una lista donde aparece. Armar regalos. |
| **Colaborador** | Recibir, ver el aviso y el movimiento en Mis yemas, gastar. | Ver los regalos de RH. |
| **La base** | Entregar en la fecha, saltar a quien ya no esté activo, impedir que alguien reciba dos veces el mismo regalo. | — |

Dar o quitar el permiso de autorizar es un renglón en `trueque.grant_approvers` (por ahora lo hace un administrador de la base).

## Límites contra el mal uso

Todos viven en la base (no sólo en la pantalla). RH cambia los de `config` en **Ajustes › Regalos**; el fondo lo define quien autoriza.

| Límite | Dónde | Valor inicial |
|---|---|---|
| Cuatro ojos: quien arma no autoriza | `grant_decide` + `check (decided_by <> created_by)` | Siempre |
| Yemas por persona en un regalo | `config.grant_max_per_person` | 100 |
| Yemas de regalo por persona al año (suma) | `config.grant_max_per_year` | 300 |
| Personas en una lista | `config.grant_max_list` | 50 |
| Días hacia adelante para programar | `config.grant_max_days_ahead` | 60 (nunca hacia atrás) |
| Fondo del año | `grant_funds` (por año) | Sin fondo = no se autoriza nada |
| Una vez por ocasión, persona y año | `grant_occasions.once_per_year` | Navidad y Aniversario sí; Reconocimiento y Evento no |
| Motivo | `grants.reason` | 20 a 500 letras; en listas, además 10+ letras por persona |
| Rechazar o cancelar algo en curso | `grant_decide`, `grant_cancel` | Motivo de 10+ letras |
| Personas | Al mandar y al entregar | Sólo activas; quien sale antes de la entrega se salta y queda anotado |
| Vencimiento | `grants.lot_months` | 1 a 12 meses (6 por omisión) |
| Fondo | `grant_set_fund` | No baja de lo ya autorizado |
| Historia | `grant_events` | Sólo se agrega; editarla o borrarla falla |

«Activa» se lee de `public.people.is_active` cuando esa columna existe; si no existe, cuenta a todas las personas con área.

## Cómo quedó en la base

| Pieza | Qué es |
|---|---|
| `grant_occasions` | Catálogo de ocasiones (`christmas`, `anniversary`, `recognition`, `event`). Una nueva es un renglón. |
| `grant_approvers` | Quién puede autorizar. |
| `grant_funds` | Fondo en yemas por año. Vista `grant_fund_usage`: fondo, programado, entregado, por autorizar y disponible. |
| `grants` | El regalo: folio `REG-`, nombre, motivo, ocasión, alcance (`group`, `company`, `area`, `department`, `list`), monto, entrega, vencimiento, estado y quién/cuándo en cada paso. |
| `grant_recipients` | Quién recibe y cuánto (congelado al mandar); `ledger_id` al entregar o `skipped_reason` si se saltó. |
| `grant_events` | Bitácora: `created`, `edited`, `submitted`, `approved`, `rejected`, `cancelled`, `delivered`, con actor, fecha y nota. |
| `grant_cards` | Vista para pantallas con nombres de ocasión, alcance, quien armó y quien decidió. |
| Libro | Cada entrega es un abono `earn` con la regla variable `grant`, `source = 'trueque.grant'`, `source_id` = el destinatario y `source_ref` = `REG-0001`. El índice único del libro impide abonar dos veces. |

Funciones (todas validan el rol y el estado dentro de la base):

| Función | Quién | Qué hace |
|---|---|---|
| `grant_preview(scope, scope_id)` | RH, quien autoriza | Cuántas personas activas alcanza. |
| `grant_save(id, …, list)` | RH | Crea o edita un borrador (un rechazado vuelve a borrador). La lista va como `[{employee_number, amount, note}]`. |
| `grant_submit(id)` | RH | Congela la lista y revisa fecha, topes, Navidad una vez al año y que llegue a alguien. |
| `grant_decide(id, approve, note)` | Quien autoriza | Cuatro ojos, fondo suficiente; programa o entrega si ya es el día. |
| `grant_cancel(id, note)` | RH | Antes de entregar. |
| `grant_set_fund(year, yemas)` | Quien autoriza | Define o sube el fondo; no lo deja abajo de lo autorizado. |
| `grant_deliver()` | `pg_cron` diario | Entrega los programados del día. Ningún cliente la puede llamar. |

## En pantalla

- **Regalos** (RH y quien autoriza): fondo del año, regalos por estado y botón «Armar un regalo».
- **Armar un regalo**: pasos Motivo · A quién · Cuánto · Cuándo · Revisar, con la vista previa de personas, yemas y pesos.
- **Detalle**: resumen, quién recibe, bitácora y las acciones que tocan según rol y estado.
- **Ajustes › Regalos**: los cuatro límites de `config`.
- **Colaborador**: aviso en la campana y movimiento en Mis yemas con el nombre del regalo.
- **Tablero**: «De dónde salen las yemas» muestra «Regalo de yemas» como fuente.

## Decisiones tomadas y lo que falta decidir

- **Quién paga el canje de yemas de regalo:** igual que hoy, la empresa que ofrece el producto. El gasto se controla con el fondo anual. Cargarlo a RH corporativo queda para la fase 2.
- **Quién autoriza:** se decide al llenar `grant_approvers`.
- **Monto de Navidad y fondo:** ejemplo, 50 yemas ($250) × 1,200 personas = 60,000 yemas ($300,000).
- **Encargados de área proponiendo reconocimientos:** no está; si se quiere, se agrega su rol a `grant_save` con un tope propio.
