import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cargando } from "@/app/componentes/Cargando";
import { obtenerProducto, parsearId } from "@/lib/datos";
import { actualizarProducto } from "../../acciones";
import { FormularioProducto } from "../../FormularioProducto";

export default function EditarProductoPage({ params }: PageProps<"/productos/[id]/editar">) {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>
      <Suspense fallback={<Cargando />}>
        <Editor params={params} />
      </Suspense>
    </>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const id = parsearId((await params).id);
  const producto = id ? await obtenerProducto(id) : null;
  if (!producto) notFound();
  return (
    <FormularioProducto
      accion={actualizarProducto.bind(null, producto.id)}
      producto={producto}
      textoBoton="Guardar cambios"
    />
  );
}
