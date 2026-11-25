import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotonAgregar } from "@/app/componentes/BotonAgregar";
import { Cargando } from "@/app/componentes/Cargando";
import { obtenerProducto, parsearId } from "@/lib/datos";
import { formatCLP } from "@/lib/montos";

// CU1.2: detalle del producto
export default function ProductoPage({ params }: PageProps<"/productos/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <DetalleProducto params={params} />
    </Suspense>
  );
}

async function DetalleProducto({ params }: { params: Promise<{ id: string }> }) {
  const id = parsearId((await params).id);
  const producto = id ? await obtenerProducto(id) : null;
  if (!producto) notFound();

  return (
    <article className="flex max-w-xl flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <Link href="/" className="text-sm text-stone-500 hover:text-emerald-700">← Volver al catálogo</Link>
      <h1 className="text-3xl font-bold">{producto.nombre}</h1>
      {!producto.activo && (
        <p className="self-start rounded bg-stone-200 px-2 py-0.5 text-sm">Desactivado: no aparece en el catálogo</p>
      )}
      <p className="text-stone-600">{producto.descripcion || "Sin descripción."}</p>
      <p className="text-2xl font-bold">{formatCLP(producto.precio)}</p>
      <div className="flex items-center gap-3">
        {producto.activo && <BotonAgregar producto={{ id: producto.id, nombre: producto.nombre, precio: producto.precio }} />}
        <Link href={`/productos/${producto.id}/editar`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">
          Editar
        </Link>
      </div>
    </article>
  );
}
