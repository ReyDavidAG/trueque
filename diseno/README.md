# La Despensa · guía visual

Abre `index.html` en el navegador (doble clic, no necesita servidor). Arriba a la derecha cambia entre los temas **Claro**, **Oscuro** y **Neutro**: todas las piezas se repintan con los tokens de ese tema.

Todo lo que aparece usa **datos de ejemplo**. Los nombres de empresa son genéricos (Empresa A, B, C…).

## Qué es la app

La Despensa es la tienda interna del grupo. Los colaboradores ganan **yemas** (la moneda) cuando participan en Chispa, la feria de innovación, y las cambian por productos y servicios que ofrecen las empresas del grupo. Cada cambio se llama **trueque** y emite un **cupón** con código que se canjea en un **lugar de canje**.

Objetivos de diseño:

- En 10 segundos se ve **qué me alcanza**.
- Hacer un trueque toma menos de 1 minuto, desde el celular.
- El cupón se parece al que la gente ya conoce.

Roles: **colaborador** (compra), **empresa** (publica productos y canjea cupones), **lugar de canje** (canjea), **RH** (aprueba precios y asigna presupuestos).

## Reglas generales

- **Móvil primero.** Debe verse bien en 320, 375, 414, 768 y 1280 px sin desplazamiento horizontal.
- **Todo color y tipografía viene de un token.** Nada de colores sueltos.
- **Estilo "empaque":** papel crema, cartón, cuadros vichy, azul tinta y dorado yema.
- **Sin `<select>` nativo:** chips o combobox con búsqueda.
- **Accesibilidad:** contraste AA, foco visible (anillo azul de 3 px), áreas táctiles de 44 px o más.
- **Animación:** sólo mover (`transform`) o desvanecer (`opacity`), y se apaga si la persona pidió reducir movimiento.

---

## 01 · Color

Valores en OKLCH. Cada tema cambia los valores pero los nombres son los mismos.

| Grupo | Tokens | Uso en la app |
|---|---|---|
| Superficies | `amate`, `amate-2`, `amate-3` | Fondo de la app (amate), hover (amate-2), rieles y pistas (amate-3). |
| | `estraza` | Fondo de tarjetas, botones secundarios, campos. |
| | `cascara`, `cascara-sombra` | Etiqueta de precio y cara de la moneda. |
| | `carton`, `carton-sombra` | Fondos tipo caja, secciones decorativas. |
| Tinta | `tinta` | Color de marca (azul San Juan). Chip activo, interruptor encendido, saldo. |
| | `tinta-2`, `tinta-3` | Variante clara y oscura (sombra de "presionado"). |
| | `tinta-soft` | Fondos suaves de selección. |
| | `tinta-text` | Tinta usada como texto; en oscuro se aclara para mantener contraste. |
| | `ink`, `muted`, `on-dark` | Texto principal, secundario y texto sobre fondos oscuros. |
| Acentos | `maiz` (dorado yema) | Moneda, barra de presupuesto, detalles de celebración. |
| | `maiz-ink`, `maiz-soft` | Advertencias ("vence pronto"). |
| | `anil`, `anil-ink`, `anil-soft` | Cuadro vichy y notas informativas. |
| | `achiote`, `achiote-soft` | Marca de "datos de ejemplo" y acentos cálidos. |
| Semánticos | `nopal`, `nopal-soft` | Éxito: "te alcanza", vigente, entradas de yemas. |
| | `error`, `error-soft` | Error: "te faltan", vencido, rechazado. |
| | `focus` | Anillo de foco del teclado. |
| | `rule`, `rule-strong` | Líneas divisorias y bordes de controles. |

### Colores de puesto

Cada empresa tiene un tono de puesto: **anil, grana, nopal, achiote, maíz, cacao**. Cada uno trae tres valores:

- `--stall`: color fuerte. Botón principal, franja del cupón, borde superior de la caja de trueque.
- `--stall-claro`: punto de la empresa, borde inferior de la foto.
- `--stall-soft`: fondo de la foto del producto y de los pasos.

Así cada producto se reconoce por su empresa sin leer el nombre. En el tema neutro todos los puestos se vuelven gris.

### Temas

| Tema | Para qué |
|---|---|
| Claro | El tema principal. Papel crema y azul. |
| Oscuro | Noche. Superficies azul marino; la moneda y la etiqueta siguen claras. |
| Neutro | Sin color de marca, para presentaciones o personas que lo prefieren. |

## 02 · Tipografía

| Familia | Uso |
|---|---|
| **Baloo 2** (700–800) | Títulos, nombres de producto, cifras grandes de saldo y precio. |
| **Nunito** (400–800) | Texto, botones, etiquetas, chips. |
| **IBM Plex Mono** (500–700) | Folios `TRQ-0000`, códigos `CAC-…`, cifras en recibos y movimientos. |

Escala: `xs` 12 · `sm` 14 · `base` 16 · `lg` 18 · `xl` 22 · `2xl` 24–32 · `3xl` 32–44 · `display` 36–60 px (las tres últimas crecen con la pantalla).

El "eyebrow" (texto pequeño en mayúsculas con espaciado) titula bloques dentro de una pantalla: "Lo que recibes", "Lugar de canje".

## 03 · Espacio, radios y sombras

- **Espacio:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 px. Margen lateral 16 px en móvil, 28 px desde 768 px.
- **Radios:** 8 (notas, ítems de lista) · 14 (campos, tarjetas chicas, cupón) · 26 (tarjetas grandes, puesto, caja de trueque) · píldora (botones y chips).
- **Sombras:**
  - `card`: tarjetas en reposo.
  - `lift`: tarjetas al pasar el cursor, caja de trueque, menús.
  - `label`: etiqueta de precio colgada.
  - `press`: botón con relieve.

## 04 · Piezas de identidad

| Pieza | Qué es | Dónde aparece |
|---|---|---|
| **Moneda (yema)** | Círculo con borde azul, cara crema y mazorca dorada. | Junto a toda cifra de yemas: saldo, precio, botón de trueque, barra superior. |
| **Etiqueta de precio** | Etiqueta crema con ojillo, como precio colgado en un mercado. | Sobre la foto de cada puesto. |
| **Vichy** | Cuadro de mantel azul y gris. | Toldo del puesto, bandas decorativas. |
| **Ficha** | Vichy teñido con el color de la empresa. | Avatar o marca de una empresa. |
| **Recibo dentado** | Papel con borde inferior en zigzag. | Confirmación justo después del trueque. |
| **Boleto troquelado** | Cupón con talón, muescas y línea punteada. | Pantalla "Mis cupones". |

## 05 · Botones

| Variante | Uso |
|---|---|
| **Principal** (`btn--grana`) | La acción más importante de la pantalla: "Hacer trueque", "Aprobar". Toma el color del puesto de la empresa. Uno por pantalla. |
| **Secundario** (`btn`) | Acciones de apoyo: "Ver detalle", "Ajustar precio". |
| **Fantasma** (`btn--ghost`) | Salir o cancelar sin peso visual. |
| **Peligro** (`btn--danger`) | Rechazar, deshabilitar o cancelar algo que no se deshace fácil. |

- **Tamaños:** pequeño 38 px (dentro de tablas y paneles), normal 48 px, grande 54 px (acción final de compra).
- **Ancho completo:** en móvil la acción final ocupa todo el ancho.
- **Estados:**
  - Normal.
  - Hover: se oscurece un poco.
  - Presionado: baja 1 px.
  - Deshabilitado: opacidad 55 %, con un texto que explica por qué ("Te faltan 40").
  - Cargando: la moneda gira.
- **Botón de ícono:** círculo de 40 px (36 en pantallas chicas) para tema, búsqueda o cantidad. Siempre con nombre accesible.

## 06 · Controles de formulario

| Control | Uso |
|---|---|
| **Chips de filtro** | Elegir una opción entre pocas: categoría, "me alcanza". El activo se rellena de tinta. |
| **Chips de empresa** | Filtrar por empresa; el punto y el relleno activo usan el color del puesto. |
| **Interruptor** | Encender o apagar una preferencia: "Sólo lo que me alcanza". |
| **Campo de texto** | Entrada libre. El número de trabajador usa letra mono. El error pinta el borde y el texto de ayuda en rojo. |
| **Combobox con búsqueda** | Reemplaza al `<select>` cuando hay muchas opciones (lugares de canje, personas). Resalta en dorado lo que coincide. |

## 07 · Puesto (tarjeta de producto)

La pieza central de la despensa. De arriba a abajo:

1. **Toldo vichy** con línea del color de la empresa.
2. **Foto o ilustración** sobre el tono suave de la empresa, con la **etiqueta de precio** en la esquina.
3. **Empresa** (punto de color + nombre en mayúsculas).
4. **Nombre del producto** en Baloo 2.
5. **Pie:**
   - A la izquierda, existencias.
   - A la derecha, **"Te alcanza"** en verde o **"Te faltan N"** en rojo.

Estados:

- Normal.
- Hover: sube 3 px.
- Agotado: se atenúa.

Los equipos que vienen de **Custodia** (inventario) llevan esa procedencia en la línea de la empresa.

## 08 · Detalle y trueque

- **Caja de trueque:**
  - Borde superior del color de la empresa.
  - Precio grande con moneda.
  - Existencias.
  - La cuenta **Tienes − Cuesta = Te quedan**.
  - Botón principal grande.
  - Si no alcanza, la cuenta se pinta en rojo y el botón se deshabilita con la cantidad que falta.
- **Cómo funciona:** tres pasos numerados (hacer trueque → recibir cupón → canjearlo).
- **Datos clave:** tarjetas con ícono para lugar de canje, horario y vigencia del cupón.
- **Recibo:** aparece al confirmar. Folio `TRQ-0000`, producto, yemas, saldo y fecha, y un botón para ver el cupón.

## 09 · Cupón (boleto)

Copia el formato del sistema de cupones que ya existe en la empresa.

- **Franja izquierda** con el color de la empresa.
- **Cuerpo:**
  - Estado.
  - Nombre del producto.
  - **Código `CAC-…`** en mono.
  - Vigencia y lugar de canje.
- **Talón** a la derecha, separado por muescas y línea punteada, con el folio en vertical.
- **Al canjearse:** el talón se arranca con una animación y aparece un **sello** ("Canjeado" en verde, "Vencido" en rojo).

Estados del cupón: **Vigente**, **Usado**, **Vencido**, **Deshabilitado**.

## 10 · Mis yemas

- **Tarjeta de saldo:**
  - Fondo tinta.
  - Saldo en tamaño display con la moneda.
  - Cuántas yemas **vencen pronto**.
  - El tope del mes.
- **Movimientos:**
  - Entradas en verde (+).
  - Gastos en tinta (−).
  - Caducidades en dorado.

  Cada uno lleva su origen y su fecha. Las yemas vencen a los 12 meses y se gastan primero las más viejas.

## 11 · Mi anaquel (empresa y RH)

- **Presupuesto:** barra dorada con lo usado contra el total anual de la empresa.
- **Ciclo del producto:** Borrador → Pendiente (espera a RH) → Publicado; también Pausado, Rechazado, Retirado.
- **Acciones de RH:** Aprobar (principal), Ajustar precio (secundario), Rechazar (peligro), en tamaño pequeño.

## 12 · Navegación móvil

- **Barra superior (64 px):**
  - Marca a la izquierda.
  - **Saldo siempre visible** en una píldora dorada a la derecha.
- **Barra de pestañas (66 px):** Despensa, Cupones, Mis yemas, Anaquel (sólo para quien administra una empresa). La pestaña activa usa tinta y un trazo más grueso.

## 13 · Avisos

- **Toast:**
  - Mensaje breve sobre fondo oscuro, que se va solo.
  - El punto de color indica el tipo: verde éxito, dorado aviso, rojo error.
- **Nota en línea:** contexto dentro de la pantalla. Azul información, dorado advertencia, rojo error.
- **Hoja inferior:**
  - Confirmación en móvil sobre un fondo oscurecido.
  - Agarradera arriba, pregunta clara, acción principal y salida.
- **Estado vacío:**
  - Borde punteado, moneda y una frase que explica qué va aquí.
  - Un botón para salir del vacío.

## 14 · Insignias de estado

Punto + texto en mayúsculas sobre fondo suave.

| Color | Significa |
|---|---|
| Verde (nopal) | Vigente, emitido, publicado. |
| Dorado (maíz) | Pendiente, deshabilitado, por vencer. |
| Azul (anil) | Pausado, reembolsado, informativo. |
| Rojo (error) | Vencido, rechazado. |
| Gris | Usado, cancelado, borrador, retirado. |
| Naranja punteado | **Datos de ejemplo.** Marca cualquier cifra que no sea real. |

## 15 · Movimiento

- Sólo `transform` (mover, escalar, girar) y `opacity` (desvanecer).
- Duraciones: 120 ms (botones, hover), 220 ms (interruptores, tarjetas), 420 ms (entradas de pantalla, cupón).
- Curva `ease-out` para que todo frene suave al llegar.
- Con "reducir movimiento" activado no hay animaciones.

## Vocabulario

| En pantalla | Qué es |
|---|---|
| Yema(s) | La moneda. |
| La despensa | El catálogo. |
| Puesto | La tarjeta de un producto. |
| Trueque | Cambiar yemas por un producto. Folio `TRQ-0000`. |
| Cupón | Lo que se canjea. Código `CAC-…`. |
| Lugar de canje | Donde se entrega el producto. |
| Mis yemas | Saldo y movimientos. |
| Mi anaquel | Lo que una empresa ofrece y su presupuesto. |
| Lote | Yemas ganadas juntas; vencen juntas. |
