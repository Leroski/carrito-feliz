import Link from "next/link";
import { Suspense } from "react";
import { BotonAgregar } from "./componentes/BotonAgregar";
import { Cargando } from "./componentes/Cargando";
import { listarProductos } from "@/lib/datos";
import { formatCLP } from "@/lib/montos";

// CU1: catálogo
export default function CatalogoPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <Link href="/productos/nuevo" className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">
          + Nuevo producto
        </Link>
      </div>
      <Suspense fallback={<Cargando texto="Cargando productos…" />}>
        <ListaProductos />
      </Suspense>
    </>
  );
}

async function ListaProductos() {
  const productos = await listarProductos();
  if (productos.length === 0) return <p className="text-stone-500">No hay productos todavía.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((p) => (
        <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <Link href={`/productos/${p.id}`} className="group flex-1">
            <h2 className="font-semibold group-hover:text-emerald-700">{p.nombre}</h2>
            {p.descripcion && <p className="text-sm text-stone-500">{p.descripcion}</p>}
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatCLP(p.precio)}</span>
            <BotonAgregar producto={{ id: p.id, nombre: p.nombre, precio: p.precio }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
