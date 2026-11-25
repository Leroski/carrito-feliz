"use client";

import { useActionState } from "react";
import type { EstadoFormulario } from "./acciones";
import type { Producto } from "@/lib/tipos";

type Props = {
  accion: (prev: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  producto?: Producto;
  textoBoton: string;
};

const campo = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2";

export function FormularioProducto({ accion, producto, textoBoton }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, {});
  return (
    <form action={enviar} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nombre</span>
        <input name="nombre" required defaultValue={producto?.nombre} className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Descripción</span>
        <textarea name="descripcion" rows={3} defaultValue={producto?.descripcion ?? ""} className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Precio (CLP)</span>
        <input name="precio" type="number" min={0} step={1} required defaultValue={producto?.precio} className={campo} />
      </label>
      <label className="flex items-center gap-2">
        <input name="activo" type="checkbox" defaultChecked={producto?.activo ?? true} />
        <span className="text-sm">Activo (visible en el catálogo)</span>
      </label>
      {estado.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.error}</p>}
      <button
        type="submit"
        disabled={pendiente}
        className="self-start rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pendiente ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}
