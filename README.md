# 😊 Carrito Feliz

E-commerce mínimo: catálogo de productos, carrito, boletas con impuesto fijo del 15 % e historial.

- **Contrato y criterios de aceptación:** [`docs/CONTRATO.md`](docs/CONTRATO.md)
- **Stack:** Next.js 16 (App Router) · Supabase (Postgres) · Tailwind CSS · Vitest · pgTAP

## Puesta en marcha (local)

Requisitos: **Node 22.12 o superior** (`nvm use` toma la versión de `.nvmrc`) y **Docker** funcionando.

```bash
npm install
npx supabase start          # levanta Postgres + API, aplica la migración y carga los productos de ejemplo
npx supabase status         # muestra la URL y las claves
cp .env.example .env.local  # y pega las claves de `supabase status`
npm run dev                 # http://localhost:3000
```

Variables (`.env.local`):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `API URL` (local: `http://127.0.0.1:54321`) |
| `SUPABASE_ANON_KEY` | clave `anon` / `publishable` |
| `SUPABASE_SERVICE_ROLE_KEY` | clave `service_role` / `secret` (solo servidor) |

Si cambias `.env.local`, reinicia `npm run dev`: Next.js solo lo lee al arrancar.

### Usar Supabase en la nube en vez de Docker

```bash
npx supabase login
npx supabase link --project-ref TU_REF
npx supabase db push --remote --include-seed   # crea las tablas y carga los productos en la nube
```

Sin `--remote`, la CLI v3 aplica los cambios a la base local. Luego usa las claves de *Project Settings → API Keys*.

## Pruebas

```bash
npm test          # cálculo de montos (Vitest)
npm run test:db   # reglas de la BD contra el contrato (pgTAP; requiere `supabase start`)
npm run lint
npm run typecheck
```

## Cómo está armado

```
supabase/migrations/   tablas, crear_boleta(), calcular_impuesto(), RLS
supabase/seed.sql      Leche, Pan, Aceite
supabase/tests/        pruebas pgTAP del contrato
lib/montos.ts          vista previa del impuesto (misma regla que la BD)
lib/datos.ts           lecturas desde Supabase (solo servidor)
app/                   páginas: /, /productos/*, /carrito, /boletas/*
```

**Regla clave:** el navegador nunca envía precios ni montos. Al generar la boleta solo manda
`[{producto_id, cantidad}]`; la función `crear_boleta()` lee los precios vigentes, calcula
neto, impuesto (15 %) y total en una transacción, y los `CHECK` de la tabla impiden guardar
montos inconsistentes.
