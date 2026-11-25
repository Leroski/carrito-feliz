-- Pruebas de la BD contra el contrato. Ejecutar con: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(24);

-- ─── CU5.3 / D3: cálculo del impuesto ──────────────────────────────────────
select is(calcular_impuesto(1),    0,   'impuesto(1) = 0');
select is(calcular_impuesto(3),    0,   'impuesto(3) = 0 (0,45)');
select is(calcular_impuesto(10),   2,   'impuesto(10) = 2 (1,5 redondea arriba)');
select is(calcular_impuesto(1990), 299, 'impuesto(1990) = 299 (298,5)');
select is(calcular_impuesto(5070), 761, 'impuesto(5070) = 761 (760,5)');

-- ─── CU1.1: productos de ejemplo ───────────────────────────────────────────
select results_eq(
  $$ select nombre, precio from productos where nombre in ('Leche','Pan','Aceite') order by nombre $$,
  $$ values ('Aceite'::text, 2490), ('Leche', 1090), ('Pan', 1990) $$,
  'El catálogo parte con Leche, Pan y Aceite'
);

-- ─── CU1.3: validaciones del producto ──────────────────────────────────────
select throws_ok($$ insert into productos (nombre, precio) values ('   ', 100) $$, '23514', null, 'Nombre vacío se rechaza');
select throws_ok($$ insert into productos (nombre, precio) values ('X', -1) $$,   '23514', null, 'Precio negativo se rechaza');

-- ─── CU3.4: ejemplo de referencia 1 Leche + 2 Pan (con un Pan repetido) ───
select lives_ok($$
  select set_config('test.folio', crear_boleta(jsonb_build_array(
    jsonb_build_object('producto_id', (select id from productos where nombre = 'Leche'), 'cantidad', 1),
    jsonb_build_object('producto_id', (select id from productos where nombre = 'Pan'),   'cantidad', 1),
    jsonb_build_object('producto_id', (select id from productos where nombre = 'Pan'),   'cantidad', 1)
  ))::text, true)
$$, 'crear_boleta funciona con un carrito válido');

select results_eq(
  $$ select neto, impuesto, total, tipo from boletas where folio = current_setting('test.folio')::bigint $$,
  $$ values (5070, 761, 5831, 'boleta'::text) $$,
  'Neto 5.070, impuesto 761, total 5.831'
);
select results_eq(
  $$ select nombre, precio_unitario, cantidad, subtotal from boleta_items
     where boleta_folio = current_setting('test.folio')::bigint order by nombre $$,
  $$ values ('Leche'::text, 1090, 1, 1090), ('Pan', 1990, 2, 3980) $$,
  'Las líneas agrupan repetidos y guardan nombre y precio'
);

-- ─── CU1.4 / D8: cambiar el precio no altera boletas anteriores ───────────
update productos set precio = 9999 where nombre = 'Pan';
select is(
  (select precio_unitario from boleta_items where boleta_folio = current_setting('test.folio')::bigint and nombre = 'Pan'),
  1990, 'La boleta conserva el precio antiguo'
);

-- ─── CU3.1 / D14: carrito vacío o inválido ─────────────────────────────────
select throws_ok($$ select crear_boleta('[]'::jsonb) $$, '22023', 'El carrito está vacío', 'Carrito vacío se rechaza');
select throws_ok($$ select crear_boleta(null) $$,        '22023', 'El carrito está vacío', 'Carrito nulo se rechaza');
select throws_ok($$ select crear_boleta('[{"producto_id": 1, "cantidad": 0}]') $$,   '22023', null, 'Cantidad 0 se rechaza');
select throws_ok($$ select crear_boleta('[{"producto_id": 1, "cantidad": 1.5}]') $$, '22023', null, 'Cantidad decimal se rechaza');
select throws_ok($$ select crear_boleta('[{"producto_id": 999999, "cantidad": 1}]') $$, '22023', null, 'Producto inexistente se rechaza');

-- ─── CU1.5: producto desactivado ───────────────────────────────────────────
update productos set activo = false where nombre = 'Aceite';
select throws_ok(
  format($$ select crear_boleta('[{"producto_id": %s, "cantidad": 1}]') $$, (select id from productos where nombre = 'Aceite')),
  '22023', null, 'No se puede vender un producto desactivado'
);

-- ─── CU5.2: la BD rechaza montos inconsistentes ────────────────────────────
select throws_ok($$ insert into boletas (neto, impuesto, total) values (1000, 100, 1100) $$, '23514', null, 'Impuesto distinto de 15 % se rechaza');
select throws_ok($$ insert into boletas (neto, impuesto, total) values (1000, 150, 1000) $$, '23514', null, 'Total distinto de neto + impuesto se rechaza');

-- ─── CU3.5 / D11: la clave pública no escribe directo ──────────────────────
set local role anon;
select throws_ok($$ insert into boletas (neto, impuesto, total) values (1000, 150, 1150) $$, '42501', null, 'anon no inserta boletas directo');
select throws_ok($$ update productos set precio = 1 $$, '42501', null, 'anon no edita productos');
select ok((select count(*) from productos) >= 3, 'anon puede leer el catálogo');
select lives_ok(
  format($$ select crear_boleta('[{"producto_id": %s, "cantidad": 1}]') $$, (select id from productos where nombre = 'Leche')),
  'anon sí puede generar boletas vía crear_boleta()'
);
reset role;

select * from finish();
rollback;
