# Contrato — Carrito Feliz (MVP)

Estado: **aprobado** por el cliente el 2026-11-25.

## Decisiones confirmadas

| # | Decisión | Dónde se cumple |
|---|---|---|
| D1 | Next.js (App Router) + Supabase (Postgres) | Todo el repo |
| D2 | Montos en CLP enteros | `integer` en `supabase/migrations/…_carrito_feliz.sql` |
| D3 | `impuesto = round(neto × 0,15)` half-up, sobre el neto total | `public.calcular_impuesto()` y `lib/montos.ts` |
| D4 | Montos oficiales calculados en la BD; el front solo muestra una vista previa | `public.crear_boleta()`; `app/boletas/acciones.ts` envía solo ids y cantidades |
| D5 | Tasa fija 15 %, no configurable | `public.calcular_impuesto()` + `CHECK boletas_impuesto_15` |
| D6 | Cantidades: agregar de nuevo suma 1; bajar a 0 quita la línea | `app/componentes/CarritoProvider.tsx` |
| D7 | Solo boleta; columna `tipo` preparada para factura | `boletas.tipo` |
| D8 | La boleta copia nombre y precio al momento de la venta | `boleta_items.nombre`, `boleta_items.precio_unitario` |
| D9 | Crear y editar productos; desactivar en vez de borrar | `/productos/nuevo`, `/productos/[id]/editar`, `productos.activo` |
| D10 | Carrito solo en memoria | `CarritoProvider` (sin `localStorage`) |
| D11 | Sin login; clave pública solo lee y llama `crear_boleta()` | RLS + `revoke` en la migración |
| D12 | Folio correlativo | `boletas.folio` identity |
| D13 | PDF de prueba imprimible | `/boletas/[folio]/pdf` |
| D14 | Carrito vacío no genera boleta | Botón deshabilitado + error en `crear_boleta()` + `CHECK neto > 0` |

## Criterios de aceptación y cómo se verifican

`BD` = `npm run test:db` (pgTAP) · `Unit` = `npm test` (Vitest) · `Manual` = prueba en el navegador

| Criterio | Verificación |
|---|---|
| **CU1.1** Catálogo inicial con Leche, Pan y Aceite | BD + Manual |
| **CU1.2** Detalle `/productos/[id]` con nombre, descripción y precio | Manual |
| **CU1.3** Crear producto; nombre vacío o precio negativo se rechaza | BD + Manual |
| **CU1.4** Editar precio no cambia boletas anteriores | BD + Manual |
| **CU1.5** Desactivado: fuera del catálogo, visible en boletas antiguas, no se puede vender | BD + Manual |
| **CU2.1** Agregar; repetir suma cantidad | Manual |
| **CU2.2** Carrito muestra líneas y neto/impuesto/total estimados | Unit + Manual |
| **CU2.3** Quitar línea; cantidad 0 la elimina | Manual |
| **CU2.4** Contador visible en todas las páginas | Manual |
| **CU2.5** Recargar vacía el carrito | Manual |
| **CU3.1** Carrito vacío: botón deshabilitado y la BD lo rechaza | BD + Manual |
| **CU3.2** Crea 1 boleta con N líneas, vacía el carrito y redirige al detalle | BD + Manual |
| **CU3.3** `neto = Σ subtotales`, `impuesto = round(neto × 0,15)` | BD + Unit |
| **CU3.4** 1 Leche + 2 Pan → 5.070 / 761 / 5.831 | BD + Unit + Manual |
| **CU3.5** Manipular precios en el navegador no cambia la boleta | Por diseño: el cliente no envía precios (BD) |
| **CU4.1** `/boletas` lista folio, fecha y total, de la más nueva a la más antigua | Manual |
| **CU4.2** Detalle con productos, cantidades, subtotales, neto, impuesto y total | Manual |
| **CU4.3** Link "Ver PDF" funciona | Manual |
| **CU5.1** La tasa vive en un solo lugar del servidor | Revisión de código |
| **CU5.2** La BD rechaza boletas con impuesto o total incorrectos | BD |
| **CU5.3** Casos 0→0, 1→0, 3→0, 10→2, 1.990→299, 5.070→761 | BD + Unit |

## Fuera de alcance
Login, stock, descuentos, pagos, factura con datos del receptor, PDF real y envío por correo.
