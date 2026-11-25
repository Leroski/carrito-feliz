"use client";

import { useState } from "react";
import { useCarrito } from "./CarritoProvider";

export function BotonAgregar({ producto }: { producto: { id: number; nombre: string; precio: number } }) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        agregar(producto);
        setAgregado(true);
        setTimeout(() => setAgregado(false), 900);
      }}
      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
    >
      {agregado ? "¡Agregado!" : "Agregar"}
    </button>
  );
}
