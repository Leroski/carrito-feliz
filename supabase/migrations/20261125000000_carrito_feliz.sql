-- Carrito Feliz: catálogo, boletas e impuesto fijo del 15 %.
-- Montos en CLP enteros (D2). El impuesto se calcula SOLO aquí (D4, D5).

-- ─── Catálogo ──────────────────────────────────────────────────────────────
create table public.productos (
  id          bigint generated always as identity primary key,
  nombre      text not null check (length(trim(nombre)) > 0),
  descripcion text,
  precio      integer not null check (precio >= 0),
  activo      boolean not null default true,       -- D9: no se borra, se desactiva
  created_at  timestamptz not null default now()
);

-- ─── Boletas ───────────────────────────────────────────────────────────────
create table public.boletas (
  folio      bigint generated always as identity primary key,   -- D12
  tipo       text not null default 'boleta' check (tipo in ('boleta', 'factura')), -- D7
  neto       integer not null check (neto > 0),                 -- D14
  impuesto   integer not null,
  total      integer not null,
  created_at timestamptz not null default now(),
  constraint boletas_impuesto_15 check (impuesto = round(neto * 0.15)),  -- CU5.2
  constraint boletas_total check (total = neto + impuesto)
);

create table public.boleta_items (
  id              bigint generated always as identity primary key,
  boleta_folio    bigint not null references public.boletas (folio) on delete cascade,
  producto_id     bigint not null references public.productos (id),
  nombre          text not null,      -- copia al momento de la venta (D8)
  precio_unitario integer not null check (precio_unitario >= 0),
  cantidad        integer not null check (cantidad > 0),
  subtotal        integer not null,
  constraint boleta_items_subtotal check (subtotal = precio_unitario * cantidad)
);

create index boleta_items_boleta_folio_idx on public.boleta_items (boleta_folio);
create index boleta_items_producto_id_idx on public.boleta_items (producto_id);

-- ─── Impuesto: única fuente de verdad (D5) ─────────────────────────────────
create function public.calcular_impuesto(neto integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select round(neto * 0.15)::integer;   -- redondeo half-up (D3)
$$;

-- ─── crear_boleta: el cliente solo envía [{producto_id, cantidad}] ─────────
create function public.crear_boleta(items jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_folio bigint;
  v_neto  integer;
  v_ids   bigint[];
  v_cants integer[];
begin
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'El carrito está vacío' using errcode = '22023';
  end if;

  -- Normaliza y valida la entrada; agrupa productos repetidos.
  if exists (
    select 1 from jsonb_array_elements(items) as e
    where jsonb_typeof(e -> 'producto_id') is distinct from 'number'
       or jsonb_typeof(e -> 'cantidad') is distinct from 'number'
       or (e ->> 'cantidad')::numeric <= 0
       or (e ->> 'cantidad')::numeric <> trunc((e ->> 'cantidad')::numeric)
  ) then
    raise exception 'Cada ítem necesita producto_id y una cantidad entera mayor a 0' using errcode = '22023';
  end if;

  select array_agg(s.producto_id order by s.producto_id),
         array_agg(s.cantidad    order by s.producto_id)
  into v_ids, v_cants
  from (
    select (e ->> 'producto_id')::bigint as producto_id,
           sum((e ->> 'cantidad')::integer)::integer as cantidad
    from jsonb_array_elements(items) as e
    group by 1
  ) s;

  if (select count(*) from public.productos p where p.id = any (v_ids) and p.activo)
     <> cardinality(v_ids) then
    raise exception 'Hay productos inexistentes o desactivados en el carrito' using errcode = '22023';
  end if;

  -- Precios vigentes desde la BD, nunca desde el cliente (CU3.5).
  select sum(p.precio * c.cantidad)::integer into v_neto
  from unnest(v_ids, v_cants) as c (producto_id, cantidad)
  join public.productos p on p.id = c.producto_id;

  insert into public.boletas (neto, impuesto, total)
  values (v_neto, public.calcular_impuesto(v_neto), v_neto + public.calcular_impuesto(v_neto))
  returning folio into v_folio;

  insert into public.boleta_items (boleta_folio, producto_id, nombre, precio_unitario, cantidad, subtotal)
  select v_folio, p.id, p.nombre, p.precio, c.cantidad, p.precio * c.cantidad
  from unnest(v_ids, v_cants) as c (producto_id, cantidad)
  join public.productos p on p.id = c.producto_id
  order by p.nombre;

  return v_folio;
end;
$$;

-- ─── Permisos (D11: sin login) ─────────────────────────────────────────────
alter table public.productos    enable row level security;
alter table public.boletas      enable row level security;
alter table public.boleta_items enable row level security;

create policy "productos lectura publica"    on public.productos    for select to anon, authenticated using (true);
create policy "boletas lectura publica"      on public.boletas      for select to anon, authenticated using (true);
create policy "boleta_items lectura publica" on public.boleta_items for select to anon, authenticated using (true);

-- Nadie escribe directo con la clave pública: las boletas solo nacen por crear_boleta()
-- y el catálogo se edita desde el servidor Next.js con la service role key.
revoke insert, update, delete, truncate on public.productos, public.boletas, public.boleta_items from anon, authenticated;
grant select on public.productos, public.boletas, public.boleta_items to anon, authenticated;

revoke execute on function public.crear_boleta(jsonb) from public;
grant execute on function public.crear_boleta(jsonb) to anon, authenticated, service_role;
grant execute on function public.calcular_impuesto(integer) to anon, authenticated, service_role;
